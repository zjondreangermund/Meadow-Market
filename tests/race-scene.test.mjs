import fs from 'node:fs';import assert from 'node:assert/strict';import * as T from '../dist/three.module.js';import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';import {createRace,stepRace} from '../dist/race-engine.js';
globalThis.innerWidth=1200;globalThis.innerHeight=800;globalThis.devicePixelRatio=1;globalThis.matchMedia=()=>({matches:false});globalThis.addEventListener=()=>{};globalThis.ProgressEvent=class{};
globalThis.document={createElement(){return {width:1024,height:256,getContext(){return {fillRect(){},fillText(){}}}}}};
GLTFLoader.prototype.loadAsync=async function(){const b=fs.readFileSync(new URL('../dist/models/horse.gltf',import.meta.url));return this.parseAsync(b.toString(),'');};
globalThis.__raceRenderer={shadowMap:{},domElement:{addEventListener(){}},setPixelRatio(){},setSize(){},render(){}};
const src=fs.readFileSync(new URL('../dist/race-scene.js',import.meta.url),'utf8').replace("new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'})",'globalThis.__raceRenderer').replace(/from '\.\//g,"from '"+new URL('../dist/',import.meta.url).href);
const {createRaceScene}=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));const world=createRaceScene({append(){}});assert.equal(await world.ready,true);
const race=createRace({id:'dawn',name:'Desert Dawn',speed:72,stamina:82,power:65,energy:100,condition:70},400,42);
world.update(.016,race,'lobby');world.update(.016,race,'countdown');for(let i=0;i<1500;i++)stepRace(race,{pace:'push',lane:2,burst:i===800});
for(const cam of ['Director','Chase','Rail','Broadcast']){world.cameraMode(cam);world.update(.016,race,'race');world.update(.016,race,'replay');world.update(.016,race,'finish',true);}
let rigs=0,jockeys=0;world.scene.traverse(o=>{if(o.isSkinnedMesh)rigs++;if(o.userData.scarf)jockeys++;if(o.isMesh){o.updateMatrixWorld();const b=new T.Box3().setFromObject(o);assert.ok(Number.isFinite(b.min.x)&&Number.isFinite(b.max.y),o.name);}});assert.ok(rigs>=6);assert.equal(jockeys,6);assert.ok(world.scene.children.length>250);
console.log('PASS: stadium, six rigged horses and jockeys, all camera modes, lobby/race/replay/finish updates, finite geometry. GPU pixels unverified.');
