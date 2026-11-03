import * as T from './three.module.js';

// Attach a genuinely different, higher-density authored 3D mesh to an EXISTING
// quadruped skeleton. The animation clips, bones and game state remain unchanged.
// Only source geometry/materials are replaced. Nearest-three bind-pose weights
// preserve deformation instead of making a motionless GLB slide over the ground.
const cache=new Map();
function gridKey(x,y,z){return Math.floor(x/.24)+','+Math.floor(y/.24)+','+Math.floor(z/.24);}
const temp=new T.Vector3(),scaled=new T.Vector3(),invRoot=new T.Matrix4();
function donorRig(model){
 model.updateMatrixWorld(true);
 const inverse=model.matrixWorld.clone().invert();
 const skins=[];model.traverse(o=>{if(o.isSkinnedMesh&&o.visible!==false)skins.push(o);});
 if(!skins.length)throw Error('The base model has no skinned meshes.');
 const primary=skins[0],samples=[],bounds=new T.Box3(),point=new T.Vector3();
 for(const mesh of skins){
  const g=mesh.geometry,idx=g.getAttribute('skinIndex'),w=g.getAttribute('skinWeight'),p=g.getAttribute('position');
  if(!idx||!w||!p)continue;
  const transform=inverse.clone().multiply(mesh.matrixWorld);
  for(let i=0;i<p.count;i++){
   point.fromBufferAttribute(p,i).applyMatrix4(transform);bounds.expandByPoint(point);
   const joints=[],weights=[];
   for(let n=0;n<4;n++){joints.push(idx.getComponent(i,n));weights.push(w.getComponent(i,n));}
   samples.push({x:point.x,y:point.y,z:point.z,joints,weights});
  }
 }
 if(!samples.length||bounds.isEmpty())throw Error('Invalid source bone weights');
 return {primary,skins,samples,bounds};
}
function spatialIndex(samples){
 const grid=new Map();for(const s of samples){
  const k=gridKey(s.x,s.y,s.z);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(s);
 }
 return grid;
}
function nearest(point,grid,samples){
 const result=[];
 for(let radius=0;radius<=5&&result.length<3;radius++){
  const cx=Math.floor(point.x/.24),cy=Math.floor(point.y/.24),cz=Math.floor(point.z/.24);
  for(let x=-radius;x<=radius;x++)for(let y=-radius;y<=radius;y++)for(let z=-radius;z<=radius;z++){
   if(radius&&Math.max(Math.abs(x),Math.abs(y),Math.abs(z))!==radius)continue;
   const bucket=grid.get((cx+x)+','+(cy+y)+','+(cz+z));if(!bucket)continue;
   for(const v of bucket){
    const dx=point.x-v.x,dy=point.y-v.y,dz=point.z-v.z,dist=dx*dx+dy*dy+dz*dz;
    if(result.length<3){result.push({v,dist});result.sort((a,b)=>a.dist-b.dist);}
    else if(dist<result[2].dist){result[2]={v,dist};result.sort((a,b)=>a.dist-b.dist);}
   }
  }
 }
 if(!result.length){
  for(const v of samples){const d=(point.x-v.x)**2+(point.y-v.y)**2+(point.z-v.z)**2;if(result.length<3){result.push({v,dist:d});result.sort((a,b)=>a.dist-b.dist);}else if(d<result[2].dist){result[2]={v,dist:d};result.sort((a,b)=>a.dist-b.dist);}}
 }
 return result;
}
function weightsOf(neighbors){
 const weighted=new Map();let total=0;
 for(const {v,dist} of neighbors){const factor=1/(Math.sqrt(dist)+.025);total+=factor;
  for(let k=0;k<4;k++){const joint=v.joints[k],weight=v.weights[k];if(weight>0)weighted.set(joint,(weighted.get(joint)||0)+factor*weight);}
 }
 const ordered=[...weighted].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=ordered.reduce((v,item)=>v+item[1],0)||1;
 return [ordered.map(([j])=>j).concat([0,0,0,0]).slice(0,4),ordered.map(([,w])=>w/sum).concat([0,0,0,0]).slice(0,4)];
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
 const donor=donorRig(rig),grid=spatialIndex(donor.samples),hd=relativeBounds(visualScene);
 const srcSize=donor.bounds.getSize(new T.Vector3()),hdSize=hd.getSize(new T.Vector3());
 if(Math.min(srcSize.x,srcSize.y,srcSize.z,hdSize.x,hdSize.y,hdSize.z)<.001)throw Error('Cannot align degenerate model');
 const primary=donor.primary;const inverse=rig.matrixWorld.clone().invert(),parentSpace=primary.matrixWorld.clone().invert().multiply(rig.matrixWorld);
 const hdInv=visualScene.matrixWorld.clone().invert(),children=[],p=new T.Vector3(),out=new T.Vector3(),oldGeom=primary.geometry;
 const meshes=[];visualScene.updateMatrixWorld(true);
 const candidates=[];visualScene.traverse(o=>{if(o.isMesh&&o.geometry?.getAttribute('position'))candidates.push(o);});
 const count=candidates.reduce((n,o)=>n+o.geometry.getAttribute('position').count,0);
 if(!count||count>maxVertices)throw Error('HD animal exceeds mobile vertex budget: '+count);
 let originalTriangles=donor.skins.reduce((n,o)=>n+((o.geometry.index?.count||o.geometry.getAttribute('position').count)/3),0),hdTriangles=0;
 for(const asset of candidates){
  const geometry=asset.geometry.clone(),pos=geometry.getAttribute('position'),joints=new Uint16Array(pos.count*4),weights=new Float32Array(pos.count*4);
  const visualToRig=hdInv.clone().multiply(asset.matrixWorld);
  const mapToMesh=parentSpace;
  for(let i=0;i<pos.count;i++){
   p.fromBufferAttribute(pos,i).applyMatrix4(visualToRig);
   out.set(
    donor.bounds.min.x+(p.x-hd.min.x)/hdSize.x*srcSize.x,
    donor.bounds.min.y+(p.y-hd.min.y)/hdSize.y*srcSize.y,
    donor.bounds.min.z+(p.z-hd.min.z)/hdSize.z*srcSize.z
   );
   const neighbors=nearest(out,grid,donor.samples),assigned=weightsOf(neighbors);
   for(let k=0;k<4;k++){joints[i*4+k]=assigned[0][k];weights[i*4+k]=assigned[1][k];}
   out.applyMatrix4(mapToMesh);pos.setXYZ(i,out.x,out.y,out.z);
  }
  geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(joints,4));
  geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
  // Normal vectors are recalculated after remapping and non-uniform scaling.
  geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
  hdTriangles+=(geometry.index?.count||pos.count)/3;
  const materials=(Array.isArray(asset.material)?asset.material:[asset.material]).map(m=>m.clone());
  const skinned=new T.SkinnedMesh(geometry,Array.isArray(asset.material)?materials:materials[0]);
  skinned.name='Meadow HD '+type+' '+(asset.name||'sculpt');
  skinned.position.copy(primary.position);skinned.quaternion.copy(primary.quaternion);skinned.scale.copy(primary.scale);
  skinned.bindMode=primary.bindMode;skinned.bind(primary.skeleton,primary.bindMatrix.clone());
  skinned.castShadow=true;skinned.receiveShadow=true;skinned.frustumCulled=false;
  primary.parent.add(skinned);meshes.push(skinned);
 }
 for(const mesh of donor.skins)mesh.visible=false;
 rig.userData.hdVisuals=meshes;
 rig.userData.hdAssetInfo={type,originalTriangles,hdTriangles,vertexCount:count,animated:true};
 return {model:rig,meshes,originalTriangles,hdTriangles,vertexCount:count};
}
