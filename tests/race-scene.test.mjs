import fs from 'node:fs';import assert from 'node:assert/strict';import * as T from '../dist/three.module.js';import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';import {skinBounds} from '../dist/model-rig.js';import {createRace,stepRace} from '../dist/race-engine.js';
globalThis.innerWidth=1200;globalThis.innerHeight=800;globalThis.devicePixelRatio=1;globalThis.matchMedia=()=>({matches:false});globalThis.addEventListener=()=>{};globalThis.ProgressEvent=class{};
globalThis.document={createElement(){return {width:1024,height:256,getContext(){return {fillRect(){},fillText(){}}}}}};
GLTFLoader.prototype.loadAsync=async function(url){const b=fs.readFileSync(new URL('../dist/'+url.replace('./',''),import.meta.url));return this.parseAsync(url.endsWith('.glb')?b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength):b.toString(),'');};
globalThis.__raceRenderer={shadowMap:{},domElement:{addEventListener(){}},setPixelRatio(){},setSize(){},render(){}};
const src=fs.readFileSync(new URL('../dist/race-scene.js',import.meta.url),'utf8').replace("new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'})",'globalThis.__raceRenderer').replace(/from '\.\//g,"from '"+new URL('../dist/',import.meta.url).href);
const {createRaceScene}=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));const world=createRaceScene({append(){}});assert.equal(await world.ready,true);
const race=createRace({id:'dawn',name:'Desert Dawn',speed:72,stamina:82,power:65,energy:100,condition:70},400,42);
world.update(.016,race,'lobby');world.update(.016,race,'countdown');for(let i=0;i<1500;i++)stepRace(race,{pace:'push',lane:2,burst:i===800});
for(const cam of ['Director','Chase','Rail','Broadcast']){world.cameraMode(cam);world.update(.016,race,'race');world.update(.016,race,'replay');world.update(.016,race,'finish',true);}
for(const r of world.racers){assert.equal(r.root.visible,true);assert.equal(r.nativeRig,true,'all racers use original authored rig');assert.ok(!r.model.userData.hdVisuals,'no incompatible static horse replacement');assert.equal(r.fallback.g.visible,false);const b=skinBounds(r.model,8);assert.ok(b.max.y-b.min.y>1.8&&b.max.y-b.min.y<3.2,'horse actual size');assert.ok(r.model.getObjectByName('Cube').geometry.index.count>10000,'subdivided horse body');}
let rigs=0,jockeys=0;world.scene.traverse(o=>{if(o.isSkinnedMesh)rigs++;if(o.userData.scarf)jockeys++;if(o.isMesh){o.updateMatrixWorld();const b=new T.Box3().setFromObject(o);assert.ok(Number.isFinite(b.min.x)&&Number.isFinite(b.max.y),o.name);}});assert.ok(rigs>=6);assert.equal(jockeys,6);assert.ok(world.scene.children.length>250);for(let i=0;i<=1000;i++)for(let lane=0;lane<6;lane++){const s=world.sample(i/1000,lane);assert.ok(s.p.y>.1,'track cannot sink under grass');}
const moving=createRace({speed:75,power:75,stamina:75,energy:100,condition:80},800,8);for(let i=0;i<300;i++)stepRace(moving,{lane:1});for(let i=0;i<12;i++){stepRace(moving,{lane:2});world.update(1/60,moving,'race');}assert.ok(world.racers.every(r=>r.jockey.userData.model));assert.ok(world.racers.some(r=>Math.abs(r.jockey.userData.steer)>.01),'rider steering cues');
console.log('PASS: stadium, six rigged horses and jockeys, all camera modes, lobby/race/replay/finish updates, finite geometry. GPU pixels unverified.');

world.update(.016,null,'lobby');const paradeStart=world.racers[0].root.position.clone(),eye=world.cameraState().position;for(let i=0;i<120;i++)world.update(1/60,null,'lobby');assert.ok(paradeStart.distanceTo(world.racers[0].root.position)>1,'parade actually walks');assert.ok(eye.distanceTo(world.cameraState().position)>1,'pre-race camera rotates');for(const r of world.racers){assert.equal(r.jockey.userData.onFoot,true);assert.equal(r.lead.visible,true);assert.ok(r.walk.isRunning());const b=skinBounds(r.jockey.userData.model,8);assert.ok(b.min.y>-.15&&b.min.y<.65,'walking jockey grounded');assert.ok(b.max.y-b.min.y>1.5,'walking jockey full visible body');}
const finalRace=createRace({speed:75,power:75,stamina:75,energy:100,condition:80},400,8);while(!finalRace.done)stepRace(finalRace,{});const results=finalRace.runners.map(r=>({distance:r.distance,finish:r.finish}));world.update(1/60,finalRace,'race');const linePos=world.racers[0].root.position.clone();for(let i=0;i<180;i++)world.update(1/60,finalRace,'race');assert.ok(linePos.distanceTo(world.racers[0].root.position)>20,'finished horse runs beyond wire');assert.ok(world.racers[0].action.isRunning(),'gallop continues beyond wire');assert.deepEqual(finalRace.runners.map(r=>({distance:r.distance,finish:r.finish})),results,'runout never changes result');for(const r of world.racers){assert.equal(r.jockey.userData.onFoot,false);assert.equal(r.lead.visible,false);}console.log('PASS: grounded walking parade with lead ropes, orbit tour, galloping run-through and immutable finish times.');

const cameraRace=createRace({speed:75,power:75,stamina:75,energy:100,condition:80},800,8);world.cameraMode('Rail');for(let i=0;i<64;i++){for(let j=0;j<6;j++)cameraRace.runners[j].distance=i/64*400+j*28;world.update(.1,cameraRace,'race');assert.ok(world.cameraState().position.y<8,'crowd instance bounds must not force a sky camera');}console.log('PASS: rail camera stays beside track through a full lap, rather than colliding with a stadium-wide crowd AABB.');

// Regression from phone video: manual selection used to be overwritten by
// the parade orbit even though the UI said Chase/Rail/Broadcast.
for(const phase of ['lobby','parade','countdown','race','replay','finish']){
 const views=[];
 for(const mode of ['Chase','Rail','Broadcast']){
  world.cameraMode(mode);world.update(1/30,cameraRace,phase);
  const shot=world.cameraState();assert.equal(shot.mode,mode);views.push(shot.position);
 }
 assert.ok(views[0].distanceTo(views[1])>2,'Chase and Rail differ during '+phase);
 assert.ok(views[2].y>views[0].y+4,'Broadcast remains elevated during '+phase);
}
let signs=0,shadow=false;world.scene.traverse(o=>{if(o.name==='Readable two-sided sign'){assert.equal(o.children.length,2);assert.equal(o.children[0].material.side,T.FrontSide);assert.equal(o.children[1].rotation.y,Math.PI);signs++;}if(o.name==='Soft horse ground contact')shadow=o.count===6;});
assert.ok(signs>5,'venue signs readable on both sides');assert.ok(shadow,'lightweight contact shadows for every horse');
console.log('PASS: visibly different camera positions through parade/gates/race/replay/finish, two-sided readable signage and six ground-contact shadows. GPU pixels unverified.');
