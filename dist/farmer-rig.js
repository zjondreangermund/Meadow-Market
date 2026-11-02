import * as T from './three.module.js';
import {fitRig,matteMaterials} from './model-rig.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
const cache=new Map();
export async function loadFarmer(variant){const file=variant==='lady'?'farmer-woman.glb':'farmer.glb';if(!cache.has(file))cache.set(file,new GLTFLoader().loadAsync('./models/'+file));return createFarmerRig(await cache.get(file));}
import {clone} from './vendor/SkeletonUtils.js';
export function createFarmerRig(asset){const root=new T.Group(),model=clone(asset.scene);root.add(model);fitRig(model,2.55);matteMaterials(model);
 model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;o.material=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{m=m.clone();m.metalness=0;m.roughness=.85;return m;});if(o.material.length===1)o.material=o.material[0];}});
 const mixer=new T.AnimationMixer(model),actions=new Map();for(const c of asset.animations){const name=c.name.split('|').pop().toLowerCase();if(['idle_neutral','walk','interact'].includes(name)){// Keep locomotion in place; world movement belongs to pathfinding.
 const clip=c.clone();clip.tracks=clip.tracks.filter(t=>!/^Root\.position$/.test(t.name));actions.set(name,mixer.clipAction(clip));}}
 let current=null;root.updateMatrixWorld(true);const wrist=model.getObjectByName('WristR')||model.getObjectByName('Wrist.R');const tool=new T.Group();if(wrist){wrist.add(tool);let s=wrist.getWorldScale(new T.Vector3());tool.scale.setScalar(1/Math.max(.00001,Math.abs(s.x)));}
 function piece(geo,color,x,y,z){const m=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:.8}));m.position.set(x,y,z);m.castShadow=true;return m;}
 const can=new T.Group();can.add(piece(new T.CylinderGeometry(.16,.19,.3,12),'#739590',0,-.15,0));let spout=piece(new T.CylinderGeometry(.035,.06,.36,8),'#739590',.21,-.12,0);spout.rotation.z=-.9;can.add(spout);let handle=piece(new T.TorusGeometry(.14,.025,6,16),'#455c56',0,.04,0);can.add(handle);tool.add(can);
 const sack=piece(new T.SphereGeometry(.2,12,9),'#be9b63',0,-.15,0);sack.scale.y=1.45;tool.add(sack);tool.visible=false;let elapsed=0;
 return {root,model,mixer,actions,update(dt,speed=0,task=null){elapsed+=dt;let key=task?'interact':speed>.05?'walk':'idle_neutral';let a=actions.get(key)||actions.get('idle_neutral');if(a&&a!==current){current?.fadeOut(.2);a.reset().fadeIn(.2).play();current=a;}if(a)a.timeScale=key==='walk'?Math.max(.3,speed/1.5):1;mixer.update(dt);tool.visible=!!task&&!!wrist;can.visible=task==='water';sack.visible=task==='feed';tool.rotation.z=task==='water'?-.45+Math.sin(elapsed*5)*.25:Math.sin(elapsed*4)*.1;}};
}
