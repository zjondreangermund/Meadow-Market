import {fitRig,syncRig} from './model-rig.js';
import * as T from './three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {clone} from './vendor/SkeletonUtils.js';
let cached;
export function loadLeaper(){if(!cached)cached=new GLTFLoader().loadAsync('./models/enemies/afterfall-leaper.glb').catch(e=>{cached=null;throw e;});return cached;}
export function createLeaperModel({asset=null}={}){
 const root=new T.Group(),pose=new T.Group();root.name='Afterfall Leaper';root.add(pose);let mixer,model,actions={},current=null,signals=[],legs=[],head,headBase;
 function install(source){
  model=clone(source.scene);pose.add(model);model.updateMatrixWorld(true);
  const body=model.getObjectByName('body'),eye=model.getObjectByName('weak_eye');
  const forward=eye.getWorldPosition(new T.Vector3()).sub(body.getWorldPosition(new T.Vector3()));model.rotation.y=-Math.atan2(forward.x,forward.z);model.updateMatrixWorld(true);
  fitRig(model,1.9);syncRig(model);
  model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;o.material=o.material.clone();if(/signal|scanwhite|alertyellow|attackred/i.test(o.material.name))signals.push(o.material);}if(o.isBone&&/^(FL|FR|RL|RR)_upper$/.test(o.name))legs.push({bone:o,base:o.quaternion.clone(),phase:/FL|RR/.test(o.name)?0:Math.PI});});
  head=model.getObjectByName('face_aim_v18')||model.getObjectByName('head');headBase=head.quaternion.clone();
  mixer=new T.AnimationMixer(model);for(const clip of source.animations)actions[clip.name]=mixer.clipAction(clip);return model;
 }
 const ready=asset?Promise.resolve(install(asset)):loadLeaper().then(install);
 return {root,pose,ready,get model(){return model},get signals(){return signals},update(dt,a){
  if(!model)return;
  root.visible=a.health>0||a.respawnLeft>44.4;
  const alert=['alert','compress'].includes(a.mode),action=alert?actions.LEAP_Alert_Predator_HIGH:actions.Leaper_V18_FaceMotion;
  if(action!==current){current?.fadeOut(.18);action?.reset().fadeIn(.18).play();current=action;}
  for(const leg of legs)leg.bone.quaternion.copy(leg.base);
  head.quaternion.copy(headBase);mixer.update(dt);
  if(['scan','investigate','attack'].includes(a.mode))for(const leg of legs)leg.bone.rotateX(Math.sin(a.phase*(a.mode==='attack'?10:5)+leg.phase)*.13);
  if(a.mode==='scan')head.rotateY(Math.sin(a.phase*.7)*.2);
  pose.rotation.z=a.health<=0?Math.min(1.4,(45-a.respawnLeft)*2):0;
  pose.rotation.x=a.mode==='compress'?.15:a.mode==='pounce'?-.2:0;
  const color=a.mode==='scan'?'#dce8e5':['alert','investigate'].includes(a.mode)?'#f4c84f':'#ef5540';
  for(const m of signals){m.color.set(color);m.emissive.set(color);m.emissiveIntensity=.8;}
 }};
}
