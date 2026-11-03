import fs from 'node:fs';import assert from 'node:assert/strict';import * as T from '../dist/three.module.js';import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';import {createJockey} from '../dist/jockey.js';import {skinBounds} from '../dist/model-rig.js';
globalThis.ProgressEvent=class{};globalThis.document={createElement(){return {getContext(){return {fillRect(){},fillText(){}}}}}};
GLTFLoader.prototype.loadAsync=async function(url){const b=fs.readFileSync(new URL('../dist/'+url.replace('./',''),import.meta.url));return this.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');};
const j=createJockey('#bb4b39',1);await j.userData.ready;let meshes=0;j.traverse(o=>{if(o.isSkinnedMesh)meshes++;});assert.ok(meshes>6,'authored humanoid skin meshes');const poses=[];
for(const steer of [-1,0,1]){j.userData.update(1,1,{steer,bank:steer*.1});const b=skinBounds(j.userData.model,12);assert.ok(b.max.y<4&&b.min.y>.5);assert.ok(b.max.x-b.min.x<2);assert.ok(b.max.z-b.min.z<3);poses.push(j.userData.hands.map(p=>p.clone()));assert.ok(j.userData.hands[0].x<0&&j.userData.hands[1].x>0,'hands stay on their own sides');}
assert.ok(poses[0][0].distanceTo(poses[2][0])>.1,'inside hand changes with steering');assert.notDeepEqual(poses[0][1],poses[2][1]);
console.log('PASS: proper humanoid rig, finite seated IK pose, visible hands and different rein cues through turns.');

j.userData.update(0,1,{phase:.25,effort:.8});const h=j.userData.model.getObjectByName('Head').getWorldPosition(new T.Vector3()),hips=j.userData.model.getObjectByName('Hips').getWorldPosition(new T.Vector3());assert.ok(h.z-hips.z>(h.y-hips.y)*.8,'head is forward in racing crouch');const before=hips.y;j.userData.update(0,1,{phase:.375,effort:.8});const after=j.userData.model.getObjectByName('Hips').getWorldPosition(new T.Vector3()).y;assert.ok(after>before+.01,'hips follow keyed suspension phase');
console.log('PASS: posed humanoid has a forward racing crouch and phase-linked hip movement.');
