import * as T from './three.module.js';
import {fitRig,matteMaterials} from './model-rig.js';
import {smoothRig} from './smooth-rig.js';
import {FBXLoader} from './vendor/FBXLoader.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {clone} from './vendor/SkeletonUtils.js';
import {applyAnimalCoat} from './coat-variants.js?v=visual5';
import {enhanceAnimalRig,loadHDSource,makeAnimatedHen} from './hd-animal-pack.js?v=visual5';
const sources={horse:'./models/horse.gltf',cow:'./models/cow.gltf',pig:'./models/pig.fbx'};
const cache=new Map();
async function source(type){
 if(!cache.has(type))cache.set(type,type==='pig'
  ?new FBXLoader().loadAsync(sources[type]).then(m=>({scene:m,animations:m.animations}))
  :new GLTFLoader().loadAsync(sources[type]));
 return cache.get(type);
}
export async function upgradeAnimals(animals,onStatus){
 await Promise.all(['horse','cow','pig','chicken'].map(async type=>{
  if(type==='chicken'){
   for(const a of animals.filter(a=>a.type==='chicken')){
    try{
     const kind=(a.appearanceSlot||0)%2?'chickenWhite':'chicken';
     const hd=await loadHDSource(kind),hen=makeAnimatedHen(hd.scene);
     for(const child of a.g.children)child.visible=false;
     a.g.scale.setScalar(1);a.g.add(hen.model);
     a.model=hen.model;a.animateBird=hen.animate;a.hd=true;
    }catch(e){console.warn('Using existing animated hen fallback:',e.message);}
   }
   onStatus?.('chicken',true,{hd:animals.filter(a=>a.type==='chicken').filter(a=>a.hd).length,total:animals.filter(a=>a.type==='chicken').length});
   return;
  }
  try{
   const asset=await source(type);
   for(const a of animals.filter(a=>a.type===type)){
    const model=clone(asset.scene);
    smoothRig(model);fitRig(model,type==='horse'?2.6:type==='pig'?1.3:1.9);
    matteMaterials(model,{roughness:type==='pig'?.92:.72});
    // HD meshes are attached to the *original* moving bone rig. On a slow
    // connection the original rig remains playable, never a static substitute.
    try{
     const detail=await enhanceAnimalRig(model,type,{slot:typeof a.appearanceSlot==='number'?a.appearanceSlot:0});
     a.hd=detail.upgraded;
    }catch(e){a.hd=false;console.warn('HD '+type+' unavailable; using animated rig:',e.message);}
    applyAnimalCoat(model,type,a.g.userData.appearanceKey||a.g.userData.name||type,a.appearanceSlot);
    model.traverse(o=>{if(o.isMesh){
     if(type==='pig')for(const m of(Array.isArray(o.material)?o.material:[o.material])){
      m.opacity=1;m.transparent=false;m.depthWrite=true;m.roughness=Math.max(.92,m.roughness||.92);m.metalness=0;m.needsUpdate=true;
     }
     o.castShadow=true;o.receiveShadow=true;o.userData.animal=a.g;o.frustumCulled=false;
    }});
    for(const child of a.g.children)child.visible=false;
    a.g.scale.setScalar(1);a.g.add(model);
    a.model=model;a.mixer=new T.AnimationMixer(model);a.actions=new Map();
    for(const clip of asset.animations)a.actions.set(clip.name.toLowerCase().split('|').pop(),a.mixer.clipAction(clip));
    a.rigLegs=[];
    if(type==='pig')model.traverse(o=>{if(o.isBone&&/^(Front|Back)Leg[LR]$/.test(o.name))a.rigLegs.push({
     bone:o,base:o.quaternion.clone(),phase:/FrontLegR|BackLegL/.test(o.name)?0:Math.PI
    });});
    a.currentAction=null;setAnimalMotion(a,'idle',0);
   }
   onStatus?.(type,true,{hd:animals.filter(a=>a.type===type).filter(a=>a.hd).length,total:animals.filter(a=>a.type===type).length});
  }catch(e){console.warn('Existing animal rig could not load:',type,e);onStatus?.(type,false);}
 }));
}
export function setAnimalMotion(a,kind,speed=0){
 if(!a.mixer)return;
 a.motionKind=kind;
 const key=kind==='eat'?'eating':kind==='walk'?'walk':kind==='gallop'?'gallop':'idle';
 let action=a.actions.get(key)||a.actions.get('idle');if(!action)return;
 if(a.currentAction!==action){if(a.currentAction)a.currentAction.fadeOut(.25);action.reset().fadeIn(.25).play();a.currentAction=action;}
 action.timeScale=kind==='walk'?Math.max(.3,Math.min(1.4,speed/1.1)):1;
}
export function animateRigDetails(a,dt){
 if(!a.rigLegs?.length)return;
 for(const l of a.rigLegs){l.bone.quaternion.copy(l.base);if(a.motionKind==='walk')l.bone.rotateX(Math.sin(a.walkPhase+l.phase)*.24);}
}
