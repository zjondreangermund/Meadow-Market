import * as T from './three.module.js';

// The source humanoids are skinned real 3D models, but old smoothing removed
// their UV coordinates. Generate continuous cylindrical fabric coordinates
// so woven garments and patterned jockey silks actually display on 3D meshes.
export function prepareHumanSurfaces(model){
 let count=0;
 model.traverse(o=>{
  if(!o.isSkinnedMesh||!o.geometry?.getAttribute('position'))return;
  const source=o.geometry,geometry=source.clone(),p=geometry.getAttribute('position'),bbox=new T.Box3().setFromBufferAttribute(p);
  const range=Math.max(.01,bbox.max.y-bbox.min.y),uv=new Float32Array(p.count*2);
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
   uv[2*i]=(.5+Math.atan2(x,z)/(2*Math.PI)+1)%1;
   uv[2*i+1]=(y-bbox.min.y)/range;
  }
  geometry.setAttribute('uv',new T.BufferAttribute(uv,2));
  o.geometry=geometry;
  for(const material of(Array.isArray(o.material)?o.material:[o.material])){
   material.metalness=0;material.roughness=/skin/i.test(material.name)? .79:.84;
   material.flatShading=false;material.needsUpdate=true;
  }
  count++;
 });
 model.userData.humanVisualVersion='hd-fabric-uv-v5';
 return count;
}
