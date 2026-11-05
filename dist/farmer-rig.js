import * as T from './three.module.js';
import {fitRig,matteMaterials} from './model-rig.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {dressFarmer} from './garment-materials.js';
import {smoothRig} from './smooth-rig.js';
import {prepareHumanSurfaces} from './human-surfaces.js';
const cache=new Map();
export async function loadFarmer(variant){const file=variant==='lady'?'farmer-woman.glb':'farmer.glb';if(!cache.has(file))cache.set(file,new GLTFLoader().loadAsync('./models/'+file));return createFarmerRig(await cache.get(file),variant);}
import {clone} from './vendor/SkeletonUtils.js';
export function createFarmerRig(asset,variant='man'){const root=new T.Group(),model=clone(asset.scene);root.add(model);smoothRig(model);fitRig(model,2.55);matteMaterials(model);prepareHumanSurfaces(model);
 model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;o.material=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{m=m.clone();m.metalness=0;m.roughness=.85;return m;});if(o.material.length===1)o.material=o.material[0];}});dressFarmer(model,variant);
 const mixer=new T.AnimationMixer(model),actions=new Map();for(const c of asset.animations){const name=c.name.split('|').pop().toLowerCase();if(['idle_neutral','walk','interact'].includes(name)){// Keep locomotion in place; world movement belongs to pathfinding.
 const clip=c.clone();clip.tracks=clip.tracks.filter(t=>!/^Root\.position$/.test(t.name));actions.set(name,mixer.clipAction(clip));}}
 let current=null;root.updateMatrixWorld(true);const wrist=model.getObjectByName('WristR')||model.getObjectByName('Wrist.R');
 // Props live in rig space. Bone-local rotation and inherited scale never distort the tool.
 const tool=new T.Group();tool.name='Palm grip tools';root.add(tool);
 function piece(geo,color,x,y,z){const m=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:.64}));m.position.set(x,y,z);m.castShadow=true;return m;}
 const can=new T.Group();can.name='Watering can';const canBody=piece(new T.CylinderGeometry(.19,.22,.4,24),'#4b9292',0,-.48,0);can.add(canBody);can.add(piece(new T.TorusGeometry(.19,.018,8,32),'#c4c9ab',0,-.27,0));can.children[1].rotation.x=Math.PI/2;
 const spout=piece(new T.CylinderGeometry(.035,.065,.42,12),'#559d99',.25,-.4,0);spout.rotation.z=-1.08;can.add(spout);const rose=piece(new T.CylinderGeometry(.09,.075,.065,18),'#c2c6a2',.44,-.3,0);rose.rotation.z=-1.08;can.add(rose);
 const handle=piece(new T.TorusGeometry(.145,.022,10,32),'#344f4c',0,-.145,0);can.add(handle);tool.add(can);
 // The sack hangs below its gathered neck, rather than enclosing the palm/forearm.
 const sack=new T.Group();sack.name='Held feed sack';sack.add(piece(new T.SphereGeometry(.19,20,14),'#c7a16c',0,-.34,0));sack.children[0].scale.set(1,1.45,.85);sack.add(piece(new T.CylinderGeometry(.045,.09,.14,12),'#b99a69',0,-.07,0));sack.add(piece(new T.TorusGeometry(.05,.012,6,14),'#6c6048',0,-.015,0));sack.children[2].rotation.x=Math.PI/2;tool.add(sack);
 const seedPouch=new T.Group();seedPouch.name='Seed pouch';seedPouch.add(piece(new T.SphereGeometry(.12,16,10),'#ba925b',0,-.2,0));seedPouch.children[0].scale.y=1.5;seedPouch.add(piece(new T.CylinderGeometry(.03,.06,.08,10),'#9c7749',0,-.04,0));tool.add(seedPouch);
 const drops=new T.InstancedMesh(new T.SphereGeometry(.018,6,4),new T.MeshBasicMaterial({color:'#9edfe9',transparent:true,opacity:.8}),18),dummy=new T.Object3D();can.add(drops);tool.visible=false;let elapsed=0;
 const palm=new T.Vector3(),tip=new T.Vector3(),axis=new T.Vector3();
 return {root,model,mixer,actions,tool,canBody,wrist,gripPoint:palm,update(dt,speed=0,task=null){elapsed+=dt;const key=task?'interact':speed>.05?'walk':'idle_neutral',a=actions.get(key)||actions.get('idle_neutral');if(a&&a!==current){current?.fadeOut(.16);a.reset().fadeIn(.16).play();current=a;}if(a)a.timeScale=key==='walk'?T.MathUtils.clamp(speed/2.1,.35,2.2):1;mixer.update(dt);root.updateMatrixWorld(true);
 tool.visible=!!wrist&&['water','feed','plant','fish'].includes(task);can.visible=task==='water';sack.visible=task==='feed';seedPouch.visible=task==='plant';if(wrist){wrist.getWorldPosition(palm);const end=wrist.children.find(b=>b.isBone);if(end){end.getWorldPosition(tip);axis.copy(tip).sub(palm);if(axis.length()>.001)palm.addScaledVector(axis.normalize(),.055);}tool.position.copy(root.worldToLocal(palm.clone()));tool.rotation.set(0,-Math.PI/2,task==='water'?-.15-Math.sin(elapsed*3)*.10:Math.sin(elapsed*3)*.035);}
 if(task==='water'){for(let i=0;i<18;i++){const t=(elapsed*1.4+i/18)%1;dummy.position.set(.46+t*.24,-.3-t*t*.9,Math.sin(i*7.3)*.04);dummy.scale.setScalar(.5+Math.sin(t*Math.PI)*.5);dummy.updateMatrix();drops.setMatrixAt(i,dummy.matrix);}drops.instanceMatrix.needsUpdate=true;}tool.updateMatrixWorld(true);
 }};
}
