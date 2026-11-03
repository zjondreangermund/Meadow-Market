import * as T from './three.module.js';
export const RIDER_LOOKS=Object.freeze([
 {skin:'#c89573',hair:'#38271f',build:1.10},
 {skin:'#6e4232',hair:'#171615',build:1.14},
 {skin:'#e0b291',hair:'#74523a',build:1.07},
 {skin:'#9d6246',hair:'#261e1a',build:1.16},
 {skin:'#ba805a',hair:'#aa7548',build:1.09},
 {skin:'#79513c',hair:'#241e1b',build:1.12}
]);
export function riderLook(number=1){return RIDER_LOOKS[(Math.max(1,number)-1)%RIDER_LOOKS.length];}

// Expand muscle volume around the original bind-pose bone axis. Bone length,
// joint positions, skin weights and animations stay unchanged.
export function athleticBuild(model,amount=1.1){
 let changed=0;
 model.traverse(mesh=>{
  if(!mesh.isSkinnedMesh||!/body|torso/i.test(mesh.name))return;
  const g=mesh.geometry.clone(),pos=g.attributes.position,si=g.attributes.skinIndex,sw=g.attributes.skinWeight;
  if(!si||!sw)return;
  const skeleton=mesh.skeleton,axes=new Map();
  skeleton.bones.forEach((bone,index)=>{
   if(!/^(UpperArm[LR]|Torso|Chest)$/.test(bone.name))return;
   const end=bone.children.find(b=>b.isBone);const child=skeleton.bones.indexOf(end);if(child<0)return;
   const start=new T.Vector3().setFromMatrixPosition(skeleton.boneInverses[index].clone().invert());
   const tip=new T.Vector3().setFromMatrixPosition(skeleton.boneInverses[child].clone().invert());
   const direction=tip.sub(start),length=direction.length();if(length<1e-6)return;
   axes.set(index,{start,direction:direction.normalize(),length});
  });
  const p=new T.Vector3(),original=new T.Vector3(),offset=new T.Vector3(),delta=new T.Vector3(),inverse=mesh.bindMatrix.clone().invert();
  for(let i=0;i<pos.count;i++){
   original.fromBufferAttribute(pos,i).applyMatrix4(mesh.bindMatrix);delta.set(0,0,0);
   for(let k=0;k<4;k++){
    const axis=axes.get(si.getComponent(i,k)),weight=sw.getComponent(i,k);if(!axis||!weight)continue;
    offset.copy(original).sub(axis.start);const along=offset.dot(axis.direction),t=T.MathUtils.clamp(along/axis.length,0,1);
    offset.addScaledVector(axis.direction,-along);delta.addScaledVector(offset,(amount-1)*Math.sin(Math.PI*t)*weight);
   }
   if(delta.lengthSq()>1e-12)changed++;
   p.copy(original).add(delta).applyMatrix4(inverse);pos.setXYZ(i,p.x,p.y,p.z);
  }
  g.deleteAttribute('normal');g.computeVertexNormals();g.computeBoundingSphere();mesh.geometry=g;
 });
 model.userData.athleticBuild=amount;model.userData.athleticVertices=changed;return changed;
}
