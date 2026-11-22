import fs from 'node:fs';import assert from 'node:assert/strict';import * as T from '../dist/three.module.js';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {createFrontierPickup} from '../dist/frontier-vehicle.js';
import {installGameTouch} from '../dist/game-touch.js';
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:512,height:512,close(){}});
async function parse(path){const b=fs.readFileSync(new URL('../dist/'+path,import.meta.url));return new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');}
const asset=await parse('models/vehicles/frontier-pickup.glb'),truck=createFrontierPickup({asset});await truck.ready;
assert(truck.loaded);assert.equal(truck.wheels.length,4);assert(truck.wheels.every(w=>w.spin.children.length>0),'four real wheel assemblies');
const bounds=new T.Box3().setFromObject(truck.root),size=bounds.getSize(new T.Vector3());assert(size.z>5&&size.z<6);assert(size.x>2&&size.x<2.8);assert(bounds.min.y>= -.02&&bounds.min.y<.2);
const still=truck.root.children[1].getObjectByName('Cab_and_roof');assert(still);const matrix=still.matrixWorld.clone();truck.update(2,.6,true);truck.root.updateMatrixWorld(true);assert(still.matrixWorld.equals(matrix),'coachwork stays rigid while wheels roll');assert(truck.wheels.every(w=>w.spin.rotation.x>0));assert(truck.wheels.filter(w=>w.front).every(w=>w.pivot.rotation.y<0));
let meshCount=0;truck.root.traverse(o=>{if(o.isMesh)meshCount++;});assert(meshCount<45,'mobile draw budget after material batching');
const crate=await parse('models/props/frontier-crate.glb');let textured=0;crate.scene.traverse(o=>{if(o.isMesh&&o.material.map&&o.material.normalMap)textured++;});assert(textured>0,'supply crates have real PBR surface maps');
const handlers=new Map();installGameTouch({addEventListener:(name,fn)=>handlers.set(name,fn)});for(const name of ['contextmenu','selectstart','dragstart']){let prevented=false;handlers.get(name)({preventDefault(){prevented=true}});assert(prevented);}assert(!handlers.has('touchstart'),'normal action clicks are not suppressed');
console.log('PASS: imported metre-scale pickup, four native wheel assemblies, rigid coachwork, bounded draw calls, textured CC0 crates and long-press selection/context-menu suppression. GPU pixels and phone hardware unverified.');
