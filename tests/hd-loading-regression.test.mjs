import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as T from '../dist/three.module.js';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {fitRig,skinBounds} from '../dist/model-rig.js';
import {replaceWithAnimatedHD} from '../dist/hd-rig-transfer.js';
import {HD_ASSETS,loadWithDeadline,makeAnimatedHen} from '../dist/hd-animal-pack.js';
globalThis.self=globalThis;
globalThis.Image=class{set src(v){this.height=1;queueMicrotask(()=>this.onload());}};
globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
globalThis.ProgressEvent=class{};
async function parse(path){const b=fs.readFileSync(new URL('../dist/'+path,import.meta.url));return new GLTFLoader().parseAsync(path.endsWith('.glb')?b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength):b.toString(),'');}
for(const path of Object.values(HD_ASSETS)){
 const asset=await parse(path);
 assert.ok(asset.scene.children.length,'bundled GLB parses');
 if(path.includes('chicken')){
  const hen=makeAnimatedHen(asset.scene);hen.animate(.2,1,true);
  assert.ok(hen.meshes.every(m=>m.geometry.attributes.position.array instanceof Float32Array));
 }
}
const base=await parse('models/cow.gltf'),hd=await parse(HD_ASSETS.cow);
fitRig(base.scene,1.9);
const expected=skinBounds(base.scene,1).getSize(new T.Vector3());
const result=replaceWithAnimatedHD(base.scene,hd.scene,{type:'cow'});
assert.ok(result.meshes.every(m=>m.geometry.attributes.position.array instanceof Float32Array));
const rest=skinBounds(base.scene,1).getSize(new T.Vector3());
for(const axis of ['x','y','z'])assert.ok(Math.abs(rest[axis]-expected[axis])<.025,'no integer wrap in cow '+axis);
const mixer=new T.AnimationMixer(base.scene);
for(const clip of base.animations.filter(c=>['idle','walk','eating'].includes(c.name.toLowerCase().split('|').pop()))){
 mixer.stopAllAction();mixer.clipAction(clip).play();
 for(let frame=0;frame<30;frame++){
  mixer.update(.05);const size=skinBounds(base.scene,4).getSize(new T.Vector3());
  for(const axis of ['x','y','z'])assert.ok(Number.isFinite(size[axis])&&size[axis]<expected[axis]*1.6,'bounded animated '+clip.name+' '+axis);
 }
}
// Exercise the real HD horse with all gameplay clips, not only a toy mesh.
const horse=await parse('models/horse.gltf'),horseHD=await parse(HD_ASSETS.horse);
fitRig(horse.scene,2.6);replaceWithAnimatedHD(horse.scene,horseHD.scene,{type:'horse'});
const horseMixer=new T.AnimationMixer(horse.scene);
for(const clip of horse.animations.filter(c=>['idle','walk','eating','gallop'].includes(c.name.toLowerCase()))){
 horseMixer.stopAllAction();horseMixer.clipAction(clip).play();
 for(let frame=0;frame<60;frame++){
  horseMixer.update(1/30);const bounds=skinBounds(horse.scene,8),size=bounds.getSize(new T.Vector3());
  assert.ok(size.y>1.3&&size.y<4.2&&size.z<6&&size.x<3,'bounded real HD horse '+clip.name);
 }
}
const original=GLTFLoader.prototype.loadAsync;
GLTFLoader.prototype.loadAsync=()=>new Promise(()=>{});
await assert.rejects(loadWithDeadline('stalled.glb',10),/timed out/);
GLTFLoader.prototype.loadAsync=original;
console.log('PASS: all six real bundled HD GLBs parse; quantized cow rest shape retained across animations; hens use float positions; stalled request terminates. GPU appearance unverified.');
