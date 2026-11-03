import * as T from './three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {replaceWithAnimatedHD} from './hd-rig-transfer.js?v=visual62';

// Commercial-use CC0 meshes, source-controlled by immutable CDN asset IDs.
// These files add substantially more sculpted anatomy than the old game rigs.
// Animal motions still come from our licensed original GLTF/FBX animation rigs.
export const HD_ASSETS=Object.freeze({
 horse:'./models/hd/horse.glb',
 cow:'./models/hd/cow.glb',
 cowJersey:'./models/hd/cow-jersey.glb',
 pig:'./models/hd/pig.glb',
 chicken:'./models/hd/chicken.glb',
 chickenWhite:'./models/hd/chicken-white.glb'
});
const files=new Map();
let highDetailEnabled=true;
export function setHDEnabled(value){highDetailEnabled=!!value;}
export function hdEnabled(){return highDetailEnabled;}
// Loading settles even when a mobile request stalls. A late result cannot
// replace the fallback because only the settled promise is consumed.
export function loadWithDeadline(url,timeoutMs=15000){
 let timer;
 return Promise.race([
  new GLTFLoader().loadAsync(url),
  new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Model loading timed out')),timeoutMs);})
 ]).finally(()=>clearTimeout(timer));
}
export async function loadHDSource(kind){
 const url=HD_ASSETS[kind];if(!url)throw Error('Unknown HD model: '+kind);
 if(!files.has(kind))files.set(kind,loadWithDeadline(url).catch(()=>loadWithDeadline(url)).catch(e=>{files.delete(kind);throw Error(kind+': '+e.message);}));
 return files.get(kind);
}
export async function enhanceAnimalRig(rig,type,{slot=0}={}){
 // Compatibility workaround requested after phone screenshots: keep the
 // original authored skin and animations for every quadruped, including racehorses.
 // Static replacement meshes cannot reliably share their anatomy/skeleton.
 if(['cow','horse','pig'].includes(type)){
  rig.userData.visualMode='native-animated';
  return {upgraded:false,nativeRig:true,reason:'Original animated model · compatibility workaround'};
 }

 if(!highDetailEnabled)return {upgraded:false,reason:'Performance visuals selected'};
 const kind=type==='cow'&&slot%2?'cowJersey':type;
 const asset=await loadHDSource(kind);
 const result=replaceWithAnimatedHD(rig,asset.scene,{type});
 if(type==='pig')rig.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material]){
  m.opacity=1;m.transparent=false;m.depthWrite=true;m.roughness=Math.max(.92,m.roughness||.92);m.metalness=0;m.needsUpdate=true;
 }});
 return {...result,upgraded:true,kind};
}
// High-resolution hens are posed meshes in the source pack. We build an
// original tiny rig (legs, head, wings and tail) and animate it in the scene;
// we do not advertise the vendor's static files as pre-rigged.
export function makeAnimatedHen(staticScene,{size=.72,coat='buff'}={}){
 const group=new T.Group(),rootBone=new T.Bone();rootBone.name='HenRoot';group.add(rootBone);
 const add=(name,x,y,z)=>{const b=new T.Bone();b.name=name;b.position.set(x,y,z);rootBone.add(b);return b;};
 const head=add('HenHead',0,.34,.17),wingL=add('WingL',-.105,.24,-.02),wingR=add('WingR',.105,.24,-.02),
  legL=add('LegL',-.085,.09,.03),legR=add('LegR',.085,.09,.03),tail=add('Tail',0,.24,-.2);
 const bones=[rootBone,head,wingL,wingR,legL,legR,tail],skeleton=new T.Skeleton(bones),inverse=staticScene.matrixWorld.clone().invert(),materialMesh=[];
 staticScene.updateMatrixWorld(true);
 const bbox=new T.Box3(),p=new T.Vector3();
 staticScene.traverse(o=>{if(!o.isMesh)return;const mat=inverse.clone().multiply(o.matrixWorld),attr=o.geometry.getAttribute('position');if(!attr)return;
  for(let i=0;i<attr.count;i++)bbox.expandByPoint(p.fromBufferAttribute(attr,i).applyMatrix4(mat));
 });
 if(bbox.isEmpty())throw Error('Empty HD chicken');
 const scale=size/Math.max(.1,bbox.max.y-bbox.min.y);
 for(const b of bones.slice(1))b.position.multiplyScalar(scale);
 const c=bbox.getCenter(new T.Vector3());
 staticScene.traverse(o=>{if(!o.isMesh)return;
  const g=o.geometry.clone(),original=g.getAttribute('position');
  g.setAttribute('position',new T.Float32BufferAttribute(Array.from({length:original.count},(_,i)=>[original.getX(i),original.getY(i),original.getZ(i)]).flat(),3));
  const pos=g.getAttribute('position'),transform=inverse.clone().multiply(o.matrixWorld),joints=new Uint16Array(pos.count*4),weights=new Float32Array(pos.count*4);
  for(let i=0;i<pos.count;i++){
   p.fromBufferAttribute(pos,i).applyMatrix4(transform);const normalizedX=p.x-c.x,normalizedY=p.y-bbox.min.y,normalizedZ=p.z-c.z;
   let region=0,influence=0;
   if(normalizedY>.31&&normalizedZ>.06){region=1;influence=Math.min(1,(normalizedY-.27)*12);}
   else if(normalizedY<.17&&Math.abs(normalizedX)>.045){region=normalizedX<0?4:5;influence=Math.min(.95,(.17-normalizedY)*7);}
   else if(Math.abs(normalizedX)>.082&&normalizedY>.17&&normalizedY<.35){region=normalizedX<0?2:3;influence=.65;}
   else if(normalizedZ<-.17&&normalizedY>.23){region=6;influence=.67;}
   joints[i*4]=0;joints[i*4+1]=region;weights[i*4]=1-influence;weights[i*4+1]=influence;
   pos.setXYZ(i,(p.x-c.x)*scale,normalizedY*scale,(p.z-c.z)*scale);
  }
  g.setAttribute('skinIndex',new T.Uint16BufferAttribute(joints,4));
  g.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));g.deleteAttribute('normal');g.computeVertexNormals();g.computeBoundingSphere();
  const mat=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();
  const mesh=new T.SkinnedMesh(g,mat);mesh.name='Meadow HD animated hen '+o.name;group.add(mesh);mesh.bind(skeleton);
  mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;materialMesh.push(mesh);
 });
 let time=0;
 function animate(dt,moving=0,eating=false){
  time+=dt;
  head.rotation.x=eating?Math.sin(time*8)*.32:Math.sin(time*1.6)*.045;
  wingL.rotation.z= Math.sin(time*(moving?7:1.5))*(moving?-.17:-.045);
  wingR.rotation.z=-wingL.rotation.z;
  const gait=moving?Math.sin(time*12)*.55:0;
  legL.rotation.x=gait;legR.rotation.x=-gait;
  tail.rotation.x=Math.sin(time*2.1)*.045;
  group.position.y=moving?Math.abs(Math.sin(time*12))*.025:0;
 }
 group.userData.hdAssetInfo={type:'chicken',animated:true,meshes:materialMesh.length};
 return {model:group,animate,meshes:materialMesh,coat};
}
