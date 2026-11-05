import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import * as T from './three.module.js';
const materials=new Map(),boxGeo=new T.BoxGeometry(1,1,1);
function brickTexture(){const n=128,pixels=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const row=Math.floor(y/16),xx=(x+(row%2)*16)%32,mortar=y%16<2||xx<2,grain=((x*17+y*31)%13)-6;const c=mortar?[169,159,140]:[139+grain,84+grain,61+grain];pixels.set([...c,255],(y*n+x)*4);}const t=new T.DataTexture(pixels,n,n);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(3,2);t.colorSpace=T.SRGBColorSpace;t.needsUpdate=true;return t;}
const brickMap=brickTexture();
function material(c,metal=0){const key=c+metal;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color:c,metalness:metal,roughness:metal?.43:.88,map:c==='#b98670'?brickMap:null}));return materials.get(key);}
const smokePixels=new Uint8Array(32*32*4);for(let y=0;y<32;y++)for(let x=0;x<32;x++){const r=Math.hypot((x-15.5)/16,(y-15.5)/16),a=Math.max(0,1-r);smokePixels.set([199,201,192,Math.round(a*a*170)],(y*32+x)*4);}const smokeMap=new T.DataTexture(smokePixels,32,32);smokeMap.needsUpdate=true;
export function createBusiness(kind,{w=14,d=10,h=5}={}){
 const root=new T.Group(),shell=new T.Group(),smoke=new T.Group();root.name=kind==='mill'?'Brick feed mill, steel silos and smoking chimney':kind==='depot'?'Freight depot and loading dock':kind==='water'?'Water pumping station':'Village shop with glazing and canvas awning';root.add(shell);const k=Math.min(w/14,d/10);shell.scale.setScalar(k);
 function box(w,h,d,c,x,y,z,p=shell,metal=0){const o=new T.Mesh(boxGeo,material(c,metal));o.scale.set(w,h,d);o.position.set(x,y,z);o.receiveShadow=true;p.add(o);return o;}
 function cylinder(r1,r2,h,c,x,y,z,metal=.6){const o=new T.Mesh(new T.CylinderGeometry(r1,r2,h,20),material(c,metal));o.position.set(x,y,z);o.receiveShadow=true;shell.add(o);return o;}
 function pipe(a,b,r=.11,c='#a9b2ad'){const aa=new T.Vector3(...a),bb=new T.Vector3(...b),v=bb.clone().sub(aa),o=cylinder(r,r,v.length(),c,0,0,0);o.position.copy(aa.add(bb).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
 function roof(x,z,width,depth,y){const half=width/2,pitch=.36;for(const side of [-1,1]){const panel=box(half/Math.cos(pitch),.14,depth,'#5f706c',x+side*half/2,y+Math.tan(pitch)*half/2,z,shell,.6);panel.rotation.z=-side*pitch;}}
 box(13.7,.35,9.7,'#8d9086',0,.18,0);
 if(kind==='mill'){
  box(8.6,5.5,8.4,'#b98670',-2,3,0);roof(-2,0,9.3,9,5.9);
  box(2.5,3.5,.13,'#5b7775',-2,2,4.26);for(let i=0;i<6;i++)box(2.5,.045,.17,'#405b5a',-2,.55+i*.55,4.35);
  for(const x of [-5,.7]){box(1.5,1.5,.14,'#74969b',x,4.15,4.28);for(const sx of [-.8,0,.8])box(.07,1.65,.2,'#d6d7c6',x+sx,4.15,4.32);box(1.7,.1,.28,'#d6d7c6',x,3.35,4.35);}
  for(const z of [-2,1.7]){cylinder(1.45,1.45,6.8,'#a7b2b0',4.9,3.65,z);cylinder(0,1.5,1.1,'#b3bcba',4.9,7.6,z);for(let i=0;i<5;i++)cylinder(1.48,1.48,.06,'#657c7b',4.9,1.2+i*1.25,z);pipe([4.9,7,z],[1.3,6,z]);}
  cylinder(.6,.78,9.8,'#736b5f',-5.2,5.05,-2.8,.05);cylinder(.82,.82,.22,'#424c4b',-5.2,10.05,-2.8);for(let i=0;i<14;i++)pipe([-5.95,.7+i*.62,-2.8],[-5.95,.7+i*.62,-2.3],.035);pipe([-5.95,.5,-2.8],[-5.95,9.2,-2.8],.045);pipe([-5.95,.5,-2.3],[-5.95,9.2,-2.3],.045);
  for(let i=0;i<4;i++){const sack=new T.Mesh(new T.SphereGeometry(1,10,8),material('#c8b58b'));sack.scale.set(.36,.58,.3);sack.position.set(-.1+i*.7,.8,4.25);shell.add(sack);}
  shell.add(smoke);for(let i=0;i<10;i++){const p=new T.Sprite(new T.SpriteMaterial({map:smokeMap,transparent:true,depthWrite:false,opacity:0}));p.userData.age=i/10;smoke.add(p);}
 }else if(kind==='water'){
  box(7,3.8,7.7,'#c6c2a8',-2.8,2.1,0);roof(-2.8,0,7.4,8.2,4.1);cylinder(2.1,2.1,6.4,'#96aaa9',4.3,3.5,0);cylinder(.05,2.15,.7,'#7f9696',4.3,7.05,0);pipe([4.3,2.5,1.8],[0,2.5,1.8],.23);box(1.7,2.7,.15,'#476667',-2.8,1.75,3.95);
 }else{
  const depot=kind==='depot';box(12.5,depot?5.4:4.7,8.2,depot?'#a5ada7':'#b98670',0,depot?2.95:2.6,-.5);roof(0,-.5,13.3,8.8,depot?5.75:5);
  if(depot){box(11,.65,1.3,'#757f7d',0,.55,4.1);for(const x of [-3,3]){box(4.2,3.7,.12,'#556e6f',x,2.7,3.65);for(let i=0;i<9;i++)box(4.2,.045,.15,'#8fa0a0',x,1+i*.4,3.74);box(.4,.8,.4,'#d8b04d',x-2.25,.7,4.2);}}
  else {for(const x of [-4,4]){box(3.4,2.5,.15,'#6f969a',x,2.3,3.68);for(const dx of [-1.76,0,1.76])box(.09,2.7,.23,'#e5deca',x+dx,2.3,3.74);box(3.6,.12,.23,'#e5deca',x,1,3.74);}box(1.8,3.1,.18,'#416d68',0,1.9,3.73);box(.16,.16,.12,'#c9ba7e',.57,1.8,3.87);
   const awning=new T.Group();shell.add(awning);for(let i=0;i<12;i++){const strip=box(1,.09,1.3,i%2?'#eee6ce':kind==='exchange'?'#507c76':'#a86b4c',-5.5+i,3.85,4.15,awning);strip.rotation.x=.16;box(1,.25,.05,i%2?'#eee6ce':kind==='exchange'?'#507c76':'#a86b4c',-5.5+i,3.65,4.8,awning);}for(const x of [-6,6])box(.09,3.6,.09,'#465954',x,1.9,4.6);}
 }
 // Thin contact pad fits entirely inside the declared building footprint.
 box(13.9,.07,9.9,'#a8a28d',0,.035,0);
 // Merge static detail by material; smoke remains separate and animated.
 shell.updateMatrixWorld(true);const batches=new Map(),meshes=[];shell.traverse(o=>{if(o.isMesh){meshes.push(o);if(!batches.has(o.material))batches.set(o.material,[]);const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrix);batches.get(o.material).push(g);}});for(const o of meshes)o.removeFromParent();for(const [mat,list]of batches){const geo=mergeGeometries(list);const m=new T.Mesh(geo,mat);m.receiveShadow=true;shell.add(m);for(const g of list)g.dispose();}
 return {root,smoke,update(dt){if(kind!=='mill'||!root.visible)return;for(const p of smoke.children){p.userData.age=(p.userData.age+dt/7)%1;const t=p.userData.age;p.position.set(-5.2+t*2.6,10.3+t*6,-2.8+Math.sin(t*4)*.35);p.scale.setScalar(.75+t*3);p.material.opacity=.48*Math.sin(Math.PI*t);}}};
}
