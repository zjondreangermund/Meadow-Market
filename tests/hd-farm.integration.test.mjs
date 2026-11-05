const originalFetch=globalThis.fetch;globalThis.fetch=(url,options)=>String(url).includes('/models/vehicles/')?Promise.resolve(new Response(fs.readFileSync(new URL(String(url))))):originalFetch(url,options);
import fs from 'node:fs';import assert from 'node:assert/strict';import * as T from '../dist/three.module.js';import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';import {FBXLoader} from '../dist/vendor/FBXLoader.js';
globalThis.Image=class{set src(v){this.height=1;queueMicrotask(()=>this.onload());}};globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});globalThis.ProgressEvent=class{};GLTFLoader.prototype.loadAsync=async function(url){let b=fs.readFileSync(new URL('../dist/'+url.replace('./',''),import.meta.url));return this.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');};FBXLoader.prototype.loadAsync=async function(url){let b=fs.readFileSync(new URL('../dist/'+url.replace('./',''),import.meta.url));return this.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');};
const elements=new Map(),el=()=>({textContent:'',innerHTML:'',open:false,hidden:true,style:{},classList:{toggle(){}},addEventListener(){},remove(){},showModal(){this.open=true},close(){this.open=false}});globalThis.document={body:{prepend(){}},querySelector(s){if(!elements.has(s))elements.set(s,el());return elements.get(s)},querySelectorAll(){return []},createElement(){return {width:512,height:100,getContext(){return {fillStyle:'',beginPath(){},roundRect(){},fill(){},fillText(){}}}}}};
globalThis.innerWidth=1200;globalThis.innerHeight=800;globalThis.devicePixelRatio=1;globalThis.window=globalThis;globalThis.addEventListener=()=>{};globalThis.localStorage={getItem(){return null},setItem(){}};globalThis.setTimeout=()=>{};let frame;globalThis.requestAnimationFrame=f=>{frame=f};globalThis.__renderer={shadowMap:{},domElement:{addEventListener(){},setPointerCapture(){}},setSize(){},setPixelRatio(){},render(){}};T.Clock.prototype.getDelta=function(){this.elapsedTime+=.04;return .04};
let src=fs.readFileSync(new URL('../dist/farm.js',import.meta.url),'utf8').replace("new T.WebGLRenderer({antialias:true})","globalThis.__renderer").replace(/from '\.\//g,"from '"+new URL('../dist/',import.meta.url).href);src+='\nexport {scene,player,animals,state,stations,taskQueue,cropArt,blocked,pathTo,worldExtension};';const game=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));for(let n=0;n<30;n++)await new Promise(r=>setImmediate(r));assert.ok(game.animals.every(a=>a.nativeRig&&!a.hd),'all species use original animated models');assert.equal(document.querySelector('#asset-quality').textContent.includes('horse: 2/2 animated'),true);assert.equal(document.querySelector('#asset-quality').textContent.includes('chicken: 3/3 animated'),true);assert.equal(game.animals.length,9);assert.ok(game.scene.children.length>100);assert.ok(game.animals.filter(a=>a.type==='pig').every(a=>a.model));

const horses=game.animals.filter(a=>a.type==='horse');
function skin(model){let result;model.traverse(o=>{if(o.isSkinnedMesh&&o.visible&&!result)result=o;});return result;}
assert.equal(skin(horses[0].model).geometry,skin(horses[1].model).geometry,'native mesh shared without anatomy transfer');
assert.notEqual(skin(horses[0].model).skeleton,skin(horses[1].model).skeleton,'independent authored skeletons');
assert.ok(horses.every(a=>!a.model.userData.hdVisuals),'no static replacement attached');
globalThis.showModelStatus();assert.ok(document.querySelector('#modalbody').innerHTML.includes('Original animated model'));
console.log('PASS: all species use original animated models; exact visual-mode counts and independent skeletons. GPU pixels unverified.');

for(const a of game.animals.filter(a=>a.type==='chicken')){const head=a.g.getObjectByName('NativeHenHead');assert.ok(head.children.length>0);a.animateBird(.1,true,true);assert.ok(head.rotation.x>0);assert.ok(a.legs.some(l=>Math.abs(l.rotation.x)>.01));}
assert.ok(game.animals.filter(a=>a.type==='pig').every(a=>a.model&&!a.model.userData.hdVisuals));

const {breedHorses}=await import('../dist/breeding.js');
const pregnancy=breedHorses(game.state,'dawn','copper',{seed:123});game.state.day=pregnancy.dueDay;
await globalThis.meetFoal(pregnancy.id);
const baby=game.animals.find(a=>a.g.userData.appearanceKey===pregnancy.foal.id);
assert.ok(baby?.nativeRig&&baby.model,'new foal loads the working animated horse rig');assert.equal(baby.g.scale.x,.58);assert.equal(game.animals.length,10);
assert.ok(document.querySelector('#modalbody').innerHTML.includes('WELCOME TO THE MEADOW'));assert.equal(document.querySelector('dialog').className,'foal-reveal');
assert.equal(document.querySelector('#asset-quality').textContent.includes('horse: 3/3 animated'),true);
await globalThis.meetFoal(pregnancy.id);assert.equal(game.animals.length,10);assert.equal(game.state.horses.length,3);
globalThis.openHorses(pregnancy.foal.id);assert.ok(document.querySelector('#modalbody').innerHTML.includes('permanent coat'));assert.ok(!document.querySelector('#modalbody').innerHTML.includes('setHorseCoat'));
game.state.day+=7;globalThis.visitFoal(pregnancy.foal.id);await new Promise(r=>setImmediate(r));assert.equal(baby.g.scale.x,1);
console.log('PASS: saved birth spawns one independent animated foal, baby scale and adult growth, reveal UI, locked coat and model status. GPU pixels unverified.');
