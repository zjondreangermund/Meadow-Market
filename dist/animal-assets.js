import * as T from './three.module.js';
import {fitRig,matteMaterials} from './model-rig.js';
import {smoothRig} from './smooth-rig.js';
import {FBXLoader} from './vendor/FBXLoader.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {clone} from './vendor/SkeletonUtils.js';
import {applyAnimalCoat} from './coat-variants.js';
const sources={horse:'./models/horse.gltf',cow:'./models/cow.gltf',pig:'./models/pig.fbx'};
const cache=new Map();
async function source(type){if(!cache.has(type))cache.set(type,type==='pig'?new FBXLoader().loadAsync(sources[type]).then(m=>({scene:m,animations:m.animations})):new GLTFLoader().loadAsync(sources[type]));return cache.get(type)}
export async function upgradeAnimals(animals,onStatus){const kinds=['horse','cow','pig'];await Promise.all(kinds.map(async type=>{try{const asset=await source(type);for(const a of animals.filter(a=>a.type===type)){const model=clone(asset.scene);smoothRig(model);fitRig(model,type==='horse'?2.6:type==='pig'?1.3:1.9);matteMaterials(model,{roughness:type==='pig'?.92:.72});applyAnimalCoat(model,type,a.g.userData.appearanceKey||a.g.userData.name||type,a.appearanceSlot);model.traverse(o=>{if(o.isMesh){if(type==='pig')for(const material of (Array.isArray(o.material)?o.material:[o.material])){material.opacity=1;material.transparent=false;material.depthWrite=true;material.needsUpdate=true;}o.castShadow=true;o.receiveShadow=true;o.userData.animal=a.g;o.frustumCulled=false;}});for(const child of a.g.children)child.visible=false;a.g.scale.setScalar(1);a.g.add(model);a.model=model;a.mixer=new T.AnimationMixer(model);a.actions=new Map();for(const clip of asset.animations){a.actions.set(clip.name.toLowerCase().split('|').pop(),a.mixer.clipAction(clip))}a.rigLegs=[];if(type==='pig')model.traverse(o=>{if(o.isBone&&/^(Front|Back)Leg[LR]$/.test(o.name))a.rigLegs.push({bone:o,base:o.quaternion.clone(),phase:(/FrontLegR|BackLegL/.test(o.name)?0:Math.PI)})});a.currentAction=null;setAnimalMotion(a,'idle',0);}onStatus?.(type,true)}catch(e){console.warn('Animal model unavailable:',type,e);onStatus?.(type,false)}}));}
export function setAnimalMotion(a,kind,speed=0){if(!a.mixer)return;a.motionKind=kind;let key=kind==='eat'?'eating':kind==='walk'?'walk':kind==='gallop'?'gallop':'idle';let action=a.actions.get(key)||a.actions.get('idle');if(!action)return;if(a.currentAction!==action){if(a.currentAction)a.currentAction.fadeOut(.25);action.reset().fadeIn(.25).play();a.currentAction=action;}action.timeScale=kind==='walk'?Math.max(.3,Math.min(1.4,speed/1.1)):1;}

export function animateRigDetails(a,dt){if(!a.rigLegs?.length)return;for(const l of a.rigLegs){l.bone.quaternion.copy(l.base);if(a.motionKind==='walk'){l.bone.rotateX(Math.sin(a.walkPhase+l.phase)*.24);}}}
