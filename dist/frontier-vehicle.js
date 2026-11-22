import * as T from './three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {batchScenery} from './scenery-batch.js';
// Innerscene CC0 nominal-scale exterior, bundled locally. Real cut-out arches,
// separate wheels/materials; no simulated cabin detail or procedural truck fallback.
export function createFrontierPickup({asset=null}={}){
 const root=new T.Group(),wheels=[];root.name='Imported CC0 Frontier pickup';let loaded=false;
 const cargo=new T.Group();root.add(cargo);cargo.visible=false;
 function install(gltf){
  const model=gltf.scene.clone(true);root.add(model);model.updateMatrixWorld(true);
  const parts=[];model.traverse(o=>{if(o.isMesh)parts.push(o);});
  // File has independent rim, hub, spoke, brake and tyre pieces. Recover their
  // actual geometric centres, including tyres whose authored origin is (0,0,0).
  for(const front of [true,false])for(const side of [-1,1]){
   const pivot=new T.Group(),spin=new T.Group();pivot.position.set(side*1.0,.39,front?1.6:-1.6);model.add(pivot);pivot.add(spin);
   for(const part of parts){if(!/^(Front|Rear)_(tire|rim|hub|spoke|brake)/.test(part.name))continue;
    const b=new T.Box3().setFromObject(part),center=b.getCenter(new T.Vector3());
    if((center.x<0?-1:1)!==side||(center.z>0)!==front)continue;
    spin.attach(part);
   }
   wheels.push({pivot,spin,front});
  }
  model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const materials=Array.isArray(o.material)?o.material:[o.material];for(const m of materials){m.envMapIntensity=.75;if(/rubber|black/.test(m.name)){m.roughness=.92;m.metalness=0;}if(m.name==='white'){m.color.set('#ced2c4');m.roughness=.38;m.metalness=.28;}}}});
  // Merge only stationary root pieces, retaining four independent wheel groups.
  batchScenery(model);for(const wheel of wheels)batchScenery(wheel.spin);
  loaded=true;return model;
 }
 const ready=asset?Promise.resolve(install(asset)):new GLTFLoader().loadAsync('./models/vehicles/frontier-pickup.glb').then(install);
 return {root,wheels,cargo,ready,get loaded(){return loaded},update(distance,turn=0,hasCargo=false){for(const w of wheels){w.spin.rotation.x+=distance/.39;if(w.front)w.pivot.rotation.y=-turn*.45;}cargo.visible=hasCargo;}};
}
