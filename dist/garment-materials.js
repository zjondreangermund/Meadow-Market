import * as T from './three.module.js';

// Procedural PBR textile maps, applied to the EXISTING skinned characters.
// All materials remain independent per rider; no billboard/sprite characters.
const cache=new Map();
function canvasMap(key,painter){
 if(cache.has(key))return cache.get(key);
 if(typeof document==='undefined'||typeof document.createElement!=='function')return null;
 let c,ctx;try{c=document.createElement('canvas');c.width=c.height=512;ctx=c.getContext?.('2d');}catch{return null;}
 if(!ctx||!['fillRect','beginPath','moveTo','lineTo','fill','stroke'].every(n=>typeof ctx[n]==='function'))return null;
 painter(ctx,512);
 const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=4;map.needsUpdate=true;cache.set(key,map);return map;
}
export function silkTexture(shade,number=0){
 const secondary=['#fff7e0','#f2e2b6','#f7f2e3','#dceae3','#ffe3bd','#f2e5f4'][number%6];
 const pattern=number%5;
 return canvasMap('silk:'+shade+':'+number,(ctx,n)=>{
  ctx.fillStyle=shade;ctx.fillRect(0,0,n,n);
  ctx.fillStyle=secondary;
  if(pattern===0){ // chevrons
   for(let y=-100;y<n+100;y+=125){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(n/2,y+125);ctx.lineTo(n,y);ctx.lineTo(n,y+45);ctx.lineTo(n/2,y+170);ctx.lineTo(0,y+45);ctx.closePath();ctx.fill();}
  }else if(pattern===1){ // diagonal sash
   for(let x=-n;x<n*2;x+=180){ctx.save();ctx.translate(x,0);ctx.rotate(.64);ctx.fillRect(0,-120,68,n*3);ctx.restore();}
  }else if(pattern===2){ // hoops
   for(let y=85;y<n;y+=160)ctx.fillRect(0,y,n,50);
  }else if(pattern===3){ // contrasting quarter panels
   ctx.fillRect(0,0,n/2,n/2);ctx.fillRect(n/2,n/2,n/2,n/2);
  }else{ // diamond lattice
   for(let x=-n;x<n*2;x+=135)for(let y=-n;y<n*2;y+=135){ctx.beginPath();ctx.moveTo(x,y-50);ctx.lineTo(x+55,y);ctx.lineTo(x,y+50);ctx.lineTo(x-55,y);ctx.closePath();ctx.fill();}
  }
  // Fine warp/weft silk weave; very low contrast to preserve bold team identifiers.
  ctx.strokeStyle='rgba(255,255,255,.075)';ctx.lineWidth=.6;
  for(let y=0;y<n;y+=6){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(n,y);ctx.stroke();}
  for(let x=0;x<n;x+=9){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,n);ctx.stroke();}
 });
}
export function applyRaceSilks(model,clothMaterial,color,number=0){
 const texture=silkTexture(color,number),useMap=!!texture;
 clothMaterial.map=texture;clothMaterial.color.set(useMap?'#ffffff':color);clothMaterial.roughness=.53;clothMaterial.needsUpdate=true;
 model?.traverse(o=>{
  if(!o.isMesh)return;
  for(const m of Array.isArray(o.material)?o.material:[o.material]){
   if(!m.userData?.teamSilk)continue;
   if(useMap&&o.geometry?.attributes?.uv){m.map=texture;m.color.set('#ffffff');}
   else {m.map=null;m.color.set(color);}
   m.roughness=.56;m.metalness=0;m.needsUpdate=true;
  }
 });
 return texture;
}
function workFabric(base,style){
 return canvasMap('work:'+base+':'+style,(ctx,n)=>{
  ctx.fillStyle=base;ctx.fillRect(0,0,n,n);
  let z=1234;const rnd=()=>((z=(Math.imul(z,1664525)+1013904223)>>>0)/4294967296);
  // Dispersed thread flecks look like cloth rather than smooth untextured clay.
  for(let i=0;i<16000;i++){const x=rnd()*n,y=rnd()*n;ctx.fillStyle=rnd()>.5?'rgba(255,255,255,.07)':'rgba(12,17,20,.09)';ctx.fillRect(x,y,style==='denim'?2:1,1+rnd()*3);}
  ctx.lineWidth=2;ctx.strokeStyle='rgba(244,226,181,.16)';
  for(let x=35;x<n;x+=230){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,n);ctx.stroke();}
  ctx.lineWidth=.7;ctx.strokeStyle='rgba(18,20,25,.11)';
  for(let y=0;y<n;y+=11){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(n,y);ctx.stroke();}
 });
}
export function dressFarmer(model,variant='man'){
 const woman=variant==='lady';
 const shirt=workFabric(woman?'#926456':'#5c797c','canvas');
 const denim=workFabric(woman?'#5a6260':'#394f61','denim');
 model.traverse(o=>{
  if(!o.isMesh)return;
  for(const m of Array.isArray(o.material)?o.material:[o.material]){
   const mesh=(o.name||'').toLowerCase(),mat=(m.name||'').toLowerCase();
   if(/skin|face|hand/.test(mat)||/eyes?|hair/.test(mesh)){m.roughness=.78;m.metalness=0;continue;}
   let tex=null;
   if(/pants|leg|trouser|overall/.test(mesh))tex=denim;
   else if(/body|torso|shirt|jacket/.test(mesh))tex=shirt;
   else if(/feet|boot|shoe/.test(mesh)){m.color.set('#473b30');m.roughness=.88;m.metalness=0;}
   if(tex&&o.geometry?.attributes?.uv){m.map=tex;m.color.set('#ffffff');m.roughness=.84;m.metalness=0;}
   else if(tex){m.color.set(tex===denim?'#415566':'#627c76');m.roughness=.84;}
   m.needsUpdate=true;
  }
 });
}
