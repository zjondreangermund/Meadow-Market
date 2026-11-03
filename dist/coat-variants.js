import * as T from './three.module.js';

// Material-only upgrade. The meshes stay skinned/animated and no existing save is rewritten.
// Each animal has a deterministic visual identity instead of a random coat on each reload.
export const COATS = {
 horse:[
  {id:'bay-star',base:'#5a3227',accent:'#f4ead9',mane:'#201714',pattern:'star'},
  {id:'chestnut-stripe',base:'#a65a35',accent:'#f8e8d2',mane:'#74452c',pattern:'stripe'},
  {id:'jet-black',base:'#262322',accent:'#f8eadb',mane:'#141313',pattern:'solid'},
  {id:'buckskin',base:'#c3a075',accent:'#554438',mane:'#302a27',pattern:'points'},
  {id:'piebald',base:'#332e2b',accent:'#f4ede2',mane:'#292322',pattern:'patches'},
  {id:'dapple-grey',base:'#929795',accent:'#d7d9d4',mane:'#555a59',pattern:'dapples'},
  {id:'liver-chestnut',base:'#673b31',accent:'#eee0ca',mane:'#2f2420',pattern:'star'},
  {id:'dark-bay',base:'#48332d',accent:'#eee0ca',mane:'#1a1817',pattern:'stripe'}
 ],
 cow:[
  {id:'holstein',base:'#f4f0e6',accent:'#282a29',mane:'#e8dfd1',pattern:'patches'},
  {id:'hereford',base:'#914d35',accent:'#f1e8d6',mane:'#e8dfd1',pattern:'face'},
  {id:'brahman-grey',base:'#727b75',accent:'#b4b8ae',mane:'#5b625d',pattern:'dapples'},
  {id:'cream',base:'#e1c8a0',accent:'#f6e9d4',mane:'#d5ba96',pattern:'star'}
 ],
 pig:[
  {id:'pink-patches',base:'#d89e95',accent:'#795c56',mane:'#b5817a',pattern:'patches'},
  {id:'ginger',base:'#ae7659',accent:'#f1c5a8',mane:'#8d634d',pattern:'freckles'},
  {id:'belted',base:'#302f31',accent:'#f7ebdf',mane:'#282626',pattern:'belt'},
  {id:'spotted',base:'#d6b9a4',accent:'#383337',mane:'#aa9786',pattern:'patches'}
 ],
 chicken:[
  {id:'buff',base:'#d5a759',accent:'#f6dfaa',mane:'#9b6a36',pattern:'feathers'},
  {id:'barred',base:'#777875',accent:'#f0ede5',mane:'#55534f',pattern:'bars'},
  {id:'speckled',base:'#b39b7d',accent:'#4c3d30',mane:'#8a6e58',pattern:'freckles'},
  {id:'red-hen',base:'#95452f',accent:'#e5ab6a',mane:'#643326',pattern:'feathers'}
 ]
};
// Existing save files receive visible default coats without resetting their stats.
export const HORSE_STARTER_COATS=Object.freeze({dawn:'piebald',copper:'buckskin'});
export function horseCoatId(horse){
 const raw=horse?.coatId;
 if(COATS.horse.some(v=>v.id===raw))return raw;
 return HORSE_STARTER_COATS[horse?.id]||COATS.horse[0].id;
}
export function visualSeed(value){const s=String(value);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
export function coatFor(type,key,slot){
 const choices=COATS[type]||COATS.horse;
 const seed=visualSeed(type+':'+String(key));
 const choice=typeof slot==='string'?choices.find(v=>v.id===slot):null;
 const chosen=choice||choices[(Number.isInteger(slot)&&slot>=0?slot:seed)%choices.length];
 return {...chosen,seed,key:String(key),type};
}
const textureCache=new Map();
function random(seed){let v=seed>>>0;return ()=>((v=(Math.imul(v,1664525)+1013904223)>>>0)/4294967296);}
function patch(ctx,r,x,y,w,h,color){
 ctx.fillStyle=color;ctx.beginPath();
 const n=10;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,shrink=.72+r()*.5;const px=x+Math.cos(a)*w*shrink,py=y+Math.sin(a)*h*shrink;if(!i)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
 ctx.closePath();ctx.fill();
}
function paint(type,key,slot){
 const coat=coatFor(type,key,slot),cacheKey=type+':'+coat.id+':'+coat.seed;
 if(textureCache.has(cacheKey))return textureCache.get(cacheKey);
 if(typeof document==='undefined'||typeof document.createElement!=='function')return null;
 let canvas,ctx;try{canvas=document.createElement('canvas');canvas.width=canvas.height=512;ctx=canvas.getContext?.('2d');}catch{return null;}
 if(!ctx||!['fillRect','beginPath','lineTo','ellipse','fill'].every(k=>typeof ctx[k]==='function'))return null;
 const r=random(coat.seed),size=512;
 ctx.fillStyle=coat.base;ctx.fillRect(0,0,size,size);
 // Fine hide/fibre noise creates visible material texture without adding mesh cost.
 for(let i=0;i<6500;i++){
  const x=r()*size,y=r()*size,w=.4+r()*2.2;
  ctx.fillStyle=r()>.5?'rgba(255,244,219,.065)':'rgba(14,12,11,.08)';
  ctx.fillRect(x,y,w,.7+r()*2.5);
 }
 if(coat.pattern==='patches'||coat.pattern==='face'){
  // Each canvas is two actual flanks, from rump to muzzle. Large coherent
  // markings instead of tiny specks ensure the pattern reads at game camera distance.
  for(let side=0;side<2;side++){
   const left=side*256,body=coat.pattern==='face'?4:type==='horse'?6:type==='cow'?7:5;
   for(let i=0;i<body;i++){
    const x=left+38+r()*150,y=112+r()*190;
    patch(ctx,r,x,y,22+r()*(type==='horse'?45:53),19+r()*55,coat.accent);
   }
   if(coat.pattern==='face')patch(ctx,r,left+221,85,22,70,coat.accent);
   if(type==='horse'&&coat.pattern==='patches'){
    // A conspicuous white shoulder and rump, with different contours on either side.
    patch(ctx,r,left+90,245,51,72,coat.accent);
    patch(ctx,r,left+177,206,39,59,coat.accent);
   }
  }
 }
 if(coat.pattern==='star'){
  for(const half of [0,256])patch(ctx,r,half+215,70,9,15,coat.accent);
 }
 if(coat.pattern==='stripe'){
  ctx.fillStyle=coat.accent;
  for(const half of [0,256]){
   patch(ctx,r,half+217,75,15,60,coat.accent);
   patch(ctx,r,half+77,443,26,34,coat.accent);
   patch(ctx,r,half+172,445,23,38,coat.accent);
  }
 }
 if(coat.pattern==='points'){
  // Buckskin coat contrasts with dark lower legs and dark mane/tail material.
  ctx.fillStyle=coat.accent;ctx.fillRect(0,425,512,87);
 }
 if(coat.pattern==='belt'){
  // Broad white band around the mid-body, on both sides of the animal.
  ctx.fillStyle=coat.accent;
  for(const half of [0,256])ctx.fillRect(half+113,90,60,325);
 }
 if(coat.pattern==='dapples'){
  for(let i=0;i<230;i++){
   const x=r()*size,y=r()*size,rad=5+r()*17;ctx.globalAlpha=.12+r()*.28;ctx.fillStyle=coat.accent;ctx.beginPath();ctx.ellipse(x,y,rad,rad*.7,0,0,Math.PI*2);ctx.fill();
  }ctx.globalAlpha=1;
 }
 if(coat.pattern==='freckles'||coat.pattern==='feathers'){
  const count=coat.pattern==='feathers'?160:120;
  for(let i=0;i<count;i++)patch(ctx,r,r()*size,r()*size,1+r()*6,1+r()*10,coat.accent);
 }
 if(coat.pattern==='bars'){
  ctx.fillStyle=coat.accent;for(let x=-512;x<1024;x+=55){ctx.save();ctx.translate(x,0);ctx.rotate(-.22);ctx.fillRect(0,0,17,750);ctx.restore();}
 }
 const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.anisotropy=4;tex.needsUpdate=true;
 textureCache.set(cacheKey,tex);return tex;
}
// The supplied Quaternius horse and cow have NO TEXCOORD_0. Their original
// materials could change flat colour but never displayed CanvasTexture patterns.
// Add a distinct cylindrical/side UV projection to each skinned mesh's *own*
// geometry. Skin attributes/bone weights and animation clips remain untouched.
export function ensureCoatUV(mesh,type){
 if(mesh.geometry?.attributes?.uv)return false;
 const original=mesh.geometry,position=original?.attributes?.position;
 if(!position||!position.count)return false;
 const geometry=original.clone();
 const p=geometry.attributes.position,uv=new Float32Array(p.count*2);
 const limits=type==='horse'?{y0:-.1,y1:4.95,z0:-2.35,z1:3.55}:type==='cow'?{y0:-.1,y1:5.13,z0:-3.15,z1:5.25}:null;
 if(!limits){geometry.computeBoundingBox();}
 const b=geometry.boundingBox;
 const y0=limits?.y0??b.min.y,y1=limits?.y1??b.max.y,z0=limits?.z0??b.min.z,z1=limits?.z1??b.max.z;
 for(let i=0;i<p.count;i++){
  const side=p.getX(i)<0?0:1,z=(p.getZ(i)-z0)/Math.max(.001,z1-z0),y=(p.getY(i)-y0)/Math.max(.001,y1-y0);
  uv[i*2]=side*.5+T.MathUtils.clamp(z,0,1)*.496;
  uv[i*2+1]=1-T.MathUtils.clamp(y,0,1);
 }
 geometry.setAttribute('uv',new T.BufferAttribute(uv,2));
 geometry.userData={...geometry.userData,coatUV:'flank-v2'};
 mesh.geometry=geometry;
 return true;
}
function isSeparatePart(name){return /eye|pupil|teeth|nostril|hoof|horn|saddle|rein|tack|metal|leather|collar|mouth|tongue|inner_ear/i.test(name);}
function isMane(name){return /mane|hair|tail|bristle/i.test(name);}
export function applyAnimalCoat(model,type,key,slot){
 const coat=coatFor(type,key,slot),texture=paint(type,key,slot);
 model.traverse(o=>{
  if(!o.isMesh)return;
  const original=Array.isArray(o.material)?o.material:[o.material];
  const converted=original.map(m=>{
   const next=m.clone(),name=(o.name||'')+' '+(m.name||'');
   if(isSeparatePart(name))return next;
   next.metalness=0;next.roughness=type==='horse'?.72:type==='pig'?.91:.84;next.flatShading=false;
   if(isMane(name)||(type==='horse'&&/^hideDark$/i.test(m.name||''))){next.map=null;next.color.set(coat.mane);}
   else {
    // Make the original no-UV horse/cow models truly accept patterned hide maps.
    if(texture)ensureCoatUV(o,type);
    if(texture&&o.geometry?.attributes?.uv){next.map=texture;next.color.set('#ffffff');}
    else {next.map=null;next.color.set(coat.base);}
   }
   next.transparent=false;next.opacity=1;next.depthWrite=true;next.needsUpdate=true;
   return next;
  });
  o.material=Array.isArray(o.material)?converted:converted[0];
 });
 model.userData.coatId=coat.id;model.userData.appearanceSeed=coat.seed;
 return coat;
}
export function applyChickenFeathers(group,key,slot,baseColor){
 const coat=coatFor('chicken',key,slot),texture=paint('chicken',key,slot),target=new T.Color(baseColor);
 group.traverse(o=>{
  if(!o.isMesh||!o.material?.color)return;
  const m=o.material,color=m.color;
  if(Math.abs(color.r-target.r)+Math.abs(color.g-target.g)+Math.abs(color.b-target.b)>.03)return;
  const fresh=m.clone();fresh.color.set(texture&&o.geometry?.attributes?.uv?'#ffffff':coat.base);
  if(texture&&o.geometry?.attributes?.uv)fresh.map=texture;
  fresh.roughness=.95;fresh.metalness=0;o.material=fresh;
 });
 group.userData.coatId=coat.id;group.userData.appearanceSeed=coat.seed;return coat;
}
