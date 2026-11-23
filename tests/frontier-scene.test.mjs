import fs from 'node:fs';import assert from 'node:assert/strict';
import {FBXLoader} from '../dist/vendor/FBXLoader.js';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:512,height:512,close(){}});globalThis.ProgressEvent=class{};
GLTFLoader.prototype.loadAsync=async function(url){const b=fs.readFileSync(new URL('../dist/'+url.replace('./',''),import.meta.url));return this.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');};
FBXLoader.prototype.loadAsync=async function(url){const b=fs.readFileSync(new URL('../dist/'+url.replace('./',''),import.meta.url));return this.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');};
const nativeFetch=globalThis.fetch;globalThis.fetch=(url,options)=>String(url).startsWith('file:')?Promise.resolve(new Response(fs.readFileSync(new URL(String(url))))):nativeFetch(url,options);
const elements=new Map();const ctx=new Proxy({},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
function element(){return {hidden:true,textContent:'',open:false,children:[],style:{},classList:{add(){},remove(){}},append(x){this.children.push(x)},appendChild(x){this.children.push(x)},addEventListener(){},setPointerCapture(){},getContext(){return ctx},showModal(){this.open=true},close(){this.open=false}};}
globalThis.document={body:element(),hidden:false,getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},querySelectorAll(){return []},createElement(){return element()},addEventListener(){}};
globalThis.window=globalThis;globalThis.addEventListener=()=>{};globalThis.innerWidth=390;globalThis.innerHeight=844;globalThis.devicePixelRatio=2;globalThis.matchMedia=()=>({matches:true});
const originalFarm=JSON.stringify({version:2,day:3,inventory:{maize:25,water:10},horses:[{id:'dawn',name:'Desert Dawn',coatId:0},{id:'copper',name:'Copper Wind',coatId:1}],cropBeds:[null,null,null,null],coins:321});
const saves=new Map([['meadow-cycle-v2',originalFarm]]);globalThis.localStorage={getItem:k=>saves.get(k)||null,setItem:(k,v)=>saves.set(k,v)};
let frame;globalThis.requestAnimationFrame=f=>frame=f;
globalThis.__frontierRenderer={shadowMap:{},domElement:element(),setSize(){},setPixelRatio(){},render(){}};
let src=fs.readFileSync(new URL('../dist/frontier.js',import.meta.url),'utf8').replace(/new T.WebGLRenderer\([^;]+\)/,'globalThis.__frontierRenderer').replace(/from '\.\//g,"from '"+new URL('../dist/',import.meta.url).href);
src+='\nexport {state,scene,truckAt,farmerRig,raiders,camera,input,updatePlayer,toggleVehicle,landscapeStats,act,save,home,truck,frontierProps,gun,beginFire,shoot,stopCombat,toggleAim,reloadGun,updateRaiders,updateCombatHUD};';
const g=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
await g.frontierProps.ready;assert.equal(g.frontierProps.placed.length,8);await g.home.ready;await g.truck.ready;await new Promise(r=>setImmediate(r));assert(g.farmerRig);assert(g.raiders.every(r=>r.rig));assert(g.landscapeStats.staticObjectsRemoved>100);
for(let i=1;i<90;i++)frame(i*16.7);assert(Number.isFinite(g.camera.position.x));
g.state.x=16;g.state.z=-3;g.toggleVehicle();assert(g.state.riding);g.input.forward=true;
for(let i=0;i<120;i++)g.updatePlayer(1/60);g.input.forward=false;assert(g.state.x>25,'pickup travels through world');assert.equal(g.truckAt.x,g.state.x);
g.state.fuel=0;for(let i=0;i<300;i++)g.updatePlayer(1/60);assert(Math.abs(g.truckAt.speed)<.01);g.toggleVehicle();assert(!g.state.riding);assert.notEqual(g.state.z,g.truckAt.z,'safe dismount beside pickup');
g.state.x=-43;g.state.z=-7;g.act();assert(elements.get('market').open);assert.equal(elements.get('buyActions').children.length,6);const before=g.state.storage.water;elements.get('buyActions').children[5].onclick();assert.equal(g.state.pack.water,1);assert.equal(g.state.storage.water,before-1);
g.save();assert(saves.has('meadow-frontier-prototype-v1'));assert.equal(saves.get('meadow-cycle-v2'),originalFarm);assert.equal(JSON.parse(saves.get('meadow-frontier-prototype-v1')).vehicle.x,g.truckAt.x);
assert(g.home.staticDrawsSaved>100);assert.equal(g.home.animals.length,6);assert(g.home.animals.every(a=>a.model));assert(g.home.props.length>=6);assert.equal(g.home.worldBuildings.find(b=>b.label==='THE RED BARN').x,-8);
console.log('PASS: Frontier mobile scene, animated farmer/scouts, static batching, finite camera, driven pickup, zero fuel braking, dismount, exchange supply packing and isolated save. GPU pixels unverified.');
// Full shooting path: UI intent -> camera ray -> muzzle ray -> NPC -> saved ammo.
elements.get('market').close();g.state.x=80;g.state.z=0;g.state.riding=false;g.state.weapon.magazine=12;g.state.weapon.cooldown=0;
for(const [i,a]of g.raiders.entries()){a.x=90+i*8;a.z=i*9;a.health=100;a.root.position.set(a.x,.12,a.z);}
g.beginFire();g.stopCombat();assert.equal(g.raiders[0].health,66,'actual scene shot damages the scout in the reticle');assert.equal(g.state.weapon.magazine,11);assert.equal(JSON.parse(saves.get('meadow-frontier-prototype-v1')).weapon.magazine,11);
g.state.x=0;g.state.weapon.cooldown=0;g.beginFire();assert.equal(g.state.weapon.magazine,11,'touch fire blocked at protected farm');
g.state.x=80;g.reloadGun();assert(g.state.weapon.reloadLeft>0);for(let i=91;i<211;i++)frame(i*16.7);assert.equal(g.state.weapon.magazine,12);assert.equal(g.state.weapon.reserve,47);assert.equal(saves.get('meadow-cycle-v2'),originalFarm);
g.raiders[0].health=0;g.raiders[0].respawnLeft=1;g.state.health=100;g.updateRaiders(.1);assert.equal(g.state.health,100,'downed scout cannot attack');
console.log('PASS: real scene aiming and damage, immediate ammo save, safe-zone touch guard, reload completion and inactive downed scouts.');
