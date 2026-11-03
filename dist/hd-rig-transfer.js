import * as T from './three.module.js';
import {skinSurface} from './surface-skinning.js?v=riders7';

// Attach a genuinely different, higher-density authored 3D mesh to an EXISTING
// quadruped skeleton. The animation clips, bones and game state remain unchanged.
// Only source geometry/materials are replaced. Closest-surface bind-pose weights
// preserve deformation instead of making a motionless GLB slide over the ground.
const cache=new WeakMap();
function donorRig(model){
 model.updateMatrixWorld(true);
 const inverse=model.matrixWorld.clone().invert();
 const skins=[];model.traverse(o=>{if(o.isSkinnedMesh&&o.visible!==false)skins.push(o);});
 if(!skins.length)throw Error('The base model has no skinned meshes.');
 const primary=skins[0],samples=[],triangles=[],bounds=new T.Box3(),point=new T.Vector3();
 for(const mesh of skins){
  const g=mesh.geometry,idx=g.getAttribute('skinIndex'),w=g.getAttribute('skinWeight'),p=g.getAttribute('position');
  if(!idx||!w||!p)continue;
  const transform=inverse.clone().multiply(mesh.matrixWorld),offset=samples.length;
  const boneMap=mesh.skeleton.bones.map(b=>primary.skeleton.bones.findIndex(p=>p===b||p.name===b.name));
  for(let i=0;i<p.count;i++){
   point.fromBufferAttribute(p,i).applyMatrix4(transform);bounds.expandByPoint(point);
   const joints=[],weights=[];
   for(let n=0;n<4;n++){const joint=boneMap[idx.getComponent(i,n)];if(joint<0)throw Error('Incompatible source skeleton');joints.push(joint);weights.push(w.getComponent(i,n));}
   samples.push({x:point.x,y:point.y,z:point.z,joints,weights});
  }
  const index=g.index;for(let i=0;i<(index?.count||p.count);i+=3)triangles.push([0,1,2].map(k=>samples[offset+(index?index.getX(i+k):i+k)]));
 }
 if(!samples.length||bounds.isEmpty())throw Error('Invalid source bone weights');
 return {primary,skins,samples,bounds,triangles};
}
function relativeBounds(scene){
 scene.updateMatrixWorld(true);
 const inv=scene.matrixWorld.clone().invert(),bbox=new T.Box3(),point=new T.Vector3();
 scene.traverse(o=>{if(!o.isMesh)return;const transform=inv.clone().multiply(o.matrixWorld),p=o.geometry?.getAttribute('position');if(!p)return;
  for(let i=0;i<p.count;i++){point.fromBufferAttribute(p,i).applyMatrix4(transform);bbox.expandByPoint(point);}
 });if(bbox.isEmpty())throw Error('Empty higher-detail model');
 return bbox;
}
/**
 * Returns {originalTriangles,hdTriangles,meshes,model} and modifies rig in place.
 * Existing Skeleton and bone transforms remain source of truth for motion.
 */
export function replaceWithAnimatedHD(rig,visualScene,{type='horse',maxVertices=42000}={}){
 if(!rig||!visualScene)throw Error('A rig and high-detail scene are required');
 const donor=donorRig(rig),transfer=skinSurface(donor.triangles),hd=relativeBounds(visualScene);
 const srcSize=donor.bounds.getSize(new T.Vector3()),hdSize=hd.getSize(new T.Vector3());
 if(Math.min(srcSize.x,srcSize.y,srcSize.z,hdSize.x,hdSize.y,hdSize.z)<.001)throw Error('Cannot align degenerate model');
 const primary=donor.primary;
 let byVisual=cache.get(primary.geometry);if(!byVisual){byVisual=new WeakMap();cache.set(primary.geometry,byVisual);}
 let cached=byVisual.get(visualScene);
 const signature=JSON.stringify([donor.bounds.min.toArray(),donor.bounds.max.toArray(),primary.matrixWorld.clone().invert().multiply(rig.matrixWorld).elements.map(v=>Math.round(v*1e6)/1e6)]);
 if(cached?.signature!==signature)cached={signature,geometries:[]};
 const inverse=rig.matrixWorld.clone().invert(),parentSpace=primary.matrixWorld.clone().invert().multiply(rig.matrixWorld);
 const hdInv=visualScene.matrixWorld.clone().invert(),children=[],p=new T.Vector3(),out=new T.Vector3(),oldGeom=primary.geometry;
 const meshes=[];visualScene.updateMatrixWorld(true);
 const candidates=[];visualScene.traverse(o=>{if(o.isMesh&&o.geometry?.getAttribute('position'))candidates.push(o);});
 const count=candidates.reduce((n,o)=>n+o.geometry.getAttribute('position').count,0);
 if(!count||count>maxVertices)throw Error('HD animal exceeds mobile vertex budget: '+count);
 let originalTriangles=donor.skins.reduce((n,o)=>n+((o.geometry.index?.count||o.geometry.getAttribute('position').count)/3),0),hdTriangles=0;
 for(const [assetIndex,asset] of candidates.entries()){
  let geometry=cached.geometries[assetIndex];
  if(!geometry){
  geometry=asset.geometry.clone();
  // Quantized GLBs store normalized Int16 positions. Writing metre-space
  // values into them wraps at +/-1 and tears the animated body apart.
  const sourcePosition=geometry.getAttribute('position');
  geometry.setAttribute('position',new T.Float32BufferAttribute(Array.from({length:sourcePosition.count},(_,i)=>[sourcePosition.getX(i),sourcePosition.getY(i),sourcePosition.getZ(i)]).flat(),3));
  const pos=geometry.getAttribute('position'),joints=new Uint16Array(pos.count*4),weights=new Float32Array(pos.count*4);
  const visualToRig=hdInv.clone().multiply(asset.matrixWorld);
  const mapToMesh=parentSpace;
  for(let i=0;i<pos.count;i++){
   p.fromBufferAttribute(pos,i).applyMatrix4(visualToRig);
   out.set(
    donor.bounds.min.x+(p.x-hd.min.x)/hdSize.x*srcSize.x,
    donor.bounds.min.y+(p.y-hd.min.y)/hdSize.y*srcSize.y,
    donor.bounds.min.z+(p.z-hd.min.z)/hdSize.z*srcSize.z
   );
   const assigned=transfer(out);
   for(let k=0;k<4;k++){joints[i*4+k]=assigned[0][k];weights[i*4+k]=assigned[1][k];}
   out.applyMatrix4(mapToMesh);pos.setXYZ(i,out.x,out.y,out.z);
  }
  geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(joints,4));
  geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
  // Normal vectors are recalculated after remapping and non-uniform scaling.
  geometry.deleteAttribute('normal');geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
  cached.geometries[assetIndex]=geometry;
  }
  hdTriangles+=(geometry.index?.count||geometry.attributes.position.count)/3;
  const materials=(Array.isArray(asset.material)?asset.material:[asset.material]).map(m=>m.clone());
  const skinned=new T.SkinnedMesh(geometry,Array.isArray(asset.material)?materials:materials[0]);
  skinned.name='Meadow HD '+type+' '+(asset.name||'sculpt');
  skinned.position.copy(primary.position);skinned.quaternion.copy(primary.quaternion);skinned.scale.copy(primary.scale);
  skinned.bindMode=primary.bindMode;skinned.bind(primary.skeleton,primary.bindMatrix.clone());
  skinned.castShadow=true;skinned.receiveShadow=true;skinned.frustumCulled=false;
  primary.parent.add(skinned);meshes.push(skinned);
 }
 byVisual.set(visualScene,cached);
 for(const mesh of donor.skins)mesh.visible=false;
 rig.userData.hdVisuals=meshes;
 rig.userData.hdAssetInfo={type,originalTriangles,hdTriangles,vertexCount:count,animated:true};
 return {model:rig,meshes,originalTriangles,hdTriangles,vertexCount:count};
}
