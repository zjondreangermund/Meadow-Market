import * as T from './three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
// An actual textured Poly Haven asset, shared geometry/materials for each copy.
export function installFrontierProps(scene){
 const placed=[];
 const ready=new GLTFLoader().loadAsync('./models/props/frontier-crate.glb').then(asset=>{
  const size=new T.Box3().setFromObject(asset.scene).getSize(new T.Vector3());
  for(const [i,[x,z]]of [[96,-3],[99,-3],[103,-3],[107,-3],[110,-3],[54,18],[57,20],[82,24]].entries()){
   const model=asset.scene.clone(true);model.name='Poly Haven supply crate';model.scale.setScalar(.9/size.y);model.updateMatrixWorld(true);const b=new T.Box3().setFromObject(model);model.position.set(x-(b.max.x+b.min.x)/2,.1-b.min.y,z-(b.max.z+b.min.z)/2);model.rotation.y=i*.8;model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(model);placed.push(model);
  }
  return placed;
 });return {placed,ready};
}
