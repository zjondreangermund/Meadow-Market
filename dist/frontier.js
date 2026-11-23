import {CARBINE,fireWeapon,traceShot,startReload,tickWeapon,buyAmmo} from './frontier-combat.js';
import {createFrontierGun,poseGunArms} from './frontier-gun.js';
import {installFrontierProps} from './frontier-props.js';
import {installGameTouch} from './game-touch.js';
import {createFrontierHome,HOME_OFFSET} from './frontier-home.js';
import {installFarmEnvironment} from './farm-environment.js';
import {createFrontierPickup} from './frontier-vehicle.js';
import {finishFrontierLandscape} from './frontier-art.js';
import {blocked,setHomeObstacles,moveBody,stepVehicle,exitPoint} from './frontier-motion.js';
import * as T from './three.module.js';
import {loadFarmer} from './farmer-rig.js';
import {SAVE_KEY,zoneAt,newFrontierState,normaliseState,simulateNeeds,collectAt,consume,depositAtHome,sellAtMarket,buySupplies,knockout,packSupplies,LABELS,SELL_PRICE} from './frontier-rules.js';

// LOCAL VERTICAL SLICE ONLY. No multiplayer, PvP or real player accounts are simulated.
const $=id=>document.getElementById(id);
installGameTouch(document.body);
let state;
try { state=normaliseState(JSON.parse(localStorage.getItem(SAVE_KEY)||'null')); }
catch { state=newFrontierState(); }
const mobile=matchMedia('(pointer: coarse)').matches||innerWidth<780;
const host=$('scene');
const scene=new T.Scene();installFarmEnvironment(scene);
scene.background=new T.Color('#aec7c7');
scene.fog=new T.FogExp2('#abbcb7',.0055);
const camera=new T.PerspectiveCamera(62,innerWidth/innerHeight,.1,520);
let renderer;
try{renderer=new T.WebGLRenderer({antialias:!mobile,alpha:false,powerPreference:mobile?'low-power':'high-performance'});}
catch(error){$('startup').hidden=false;$('startup').textContent='3D could not start. Enable WebGL / hardware acceleration, or open this page in Chrome on Android or Safari on iPhone.';throw error;}
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.65));
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.18;
renderer.shadowMap.enabled=!mobile;
renderer.shadowMap.type=T.PCFSoftShadowMap;
host.appendChild(renderer.domElement);
scene.add(new T.HemisphereLight('#c3daee','#819164',2.4));
const sun=new T.DirectionalLight('#fff0c7',3.1);
sun.position.set(-45,90,65);
sun.castShadow=!mobile;
sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-105;sun.shadow.camera.right=105;
sun.shadow.camera.top=85;sun.shadow.camera.bottom=-85;
sun.shadow.normalBias=.045;
scene.add(sun);
const mat=(color,roughness=1,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
const m={
 grass:mat('#66855c'),safe:mat('#668654'),wild:mat('#7c8060'),red:mat('#866f55'),road:mat('#8b806c'),
 dirt:mat('#886f50'),crop:mat('#7f9752'),cropLeaf:mat('#5d8348'),cropCob:mat('#dcbe73'),
 wood:mat('#8c6545'),darkWood:mat('#533d31'),roof:mat('#6c483c'),metal:mat('#6f7c79',.48,.35),
 stone:mat('#a6aaa2'),glass:mat('#9ab4b6',.18),clay:mat('#bd9b71'),crate:mat('#b99567'),
 trunk:mat('#584934'),leaf:mat('#46684b'),leaf2:mat('#65845b'),raider:mat('#9e493e'),
 stripe:new T.MeshBasicMaterial({color:'#e6bf70'}),beacon:new T.MeshBasicMaterial({color:'#f7d685'}),
 water:mat('#5794a2',.22)
};
const cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,12,9),cylinder=new T.CylinderGeometry(1,1,1,12);
function mesh(geo,material,x,y,z,group=scene){
 const o=new T.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=renderer.shadowMap.enabled;o.receiveShadow=true;group.add(o);return o;
}
function box(x,y,z,w,h,d,material,group=scene){const o=mesh(cube,material,x,y,z,group);o.scale.set(w,h,d);return o;}
function ball(x,y,z,sx,sy,sz,material,group=scene){const o=mesh(sphere,material,x,y,z,group);o.scale.set(sx,sy,sz);return o;}
function cylinderAt(x,y,z,top,bottom,height,material,group=scene){return mesh(new T.CylinderGeometry(top,bottom,height,12),material,x,y,z,group);}
function roof(x,z,width,depth,y,material){
 const a=box(x-2.8,y,z,width*.65,.22,depth+.6,material),b=box(x+2.8,y,z,width*.65,.22,depth+.6,material);
 a.rotation.z=.38;b.rotation.z=-.38;
}
function fence(x,z,w,depth=0.22){
 box(x,.93,z,w,.1,depth,m.clay);box(x,1.6,z,w,.1,depth,m.clay);
 for(let dx=-w/2;dx<=w/2;dx+=3.1)box(x+dx,1,z,.19,2,.19,m.wood);
}
// Terrain tiles with contrasting farmland, frontier scrub and red hazard land.
box(-20,-.25,0,108,.45,150,m.safe);
box(52,-.26,0,36,.45,150,m.wild);
box(121,-.27,0,100,.45,150,m.red);
box(33.8,.025,0,.35,.12,150,m.stripe);
box(70,.025,0,.25,.12,150,m.raider);
box(84,.04,0,150,.12,9,m.road);box(12,.08,3,10,.08,9,m.road);
for(let i=1;i<17;i++)box(i*10,.14,0,3,.02,.09,m.clay);
for(const z of [-49,49])fence(-12,z,88);
for(const z of [-38,-22,-9,9,22,38]){
  if(Math.abs(z)<9)continue;
  box(34,1,z,.19,2,12,m.wood);
}
for(const z of [-5.9,5.9])box(34,1.5,z,.34,3,.4,m.darkWood);
box(34,3.15,0,.35,.52,12,m.darkWood);

// The protected home now shares the original Meadow Market farm scene.
const home=createFrontierHome(scene);setHomeObstacles(home.obstacles,HOME_OFFSET);
if(blocked(state.x,state.z)){state.x=-16;state.z=6;}
// Weathered station and derelict supply depot.
box(104,1.9,-18,18,3.8,15,m.stone);roof(104,-18,19,15,4.2,m.metal);
box(104,1.7,-10.4,6,3.1,.2,m.darkWood);
const frontierProps=installFrontierProps(scene);frontierProps.ready.catch(()=>notify('Supply crate textures could not load. Reload to retry.'));
box(82,1.4,21,5,2.8,6,m.darkWood);
box(82,3,21,5.7,.25,7,m.metal);
for(let i=0;i<6;i++)box(46+i*1.8,.7,18+i%2*2,1.5,1.2,1.5,m.metal);

// Scrub, trees and scattered landscape detail; deterministic for reproducible runs.
let seed=14025;
function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
for(let i=0;i<98;i++){
 const x=40+rand()*119,z=-46+rand()*92;
 if(Math.abs(z)<10||x>-40&&x<0&&z>9&&z<39||Math.abs(x-104)<16&&Math.abs(z+18)<16)continue;
 const h=2.3+rand()*4;
 cylinderAt(x,h*.42,z,.19,.25,h*.84,m.trunk);
 const leaf=rand()<.4?m.leaf2:m.leaf;
 ball(x,h*.8,z,1.3+rand(),1.65+rand()*.8,1.4+rand(),leaf);
 if(i%3===0)ball(x+.8,.45,z+.9,.5,.6,.55,m.leaf);
}
for(let i=0;i<65;i++){
 const x=35+rand()*117,z=-63+rand()*126;
 if(Math.abs(z)<8)continue;
 const rock=ball(x,.25,z,.4+rand(),.3+rand()*.35,.45+rand(),m.stone);rock.rotation.y=rand()*3;
}

// Location markers are visual only; interaction distance and action rules are verified by client.
const nodes=[
 {type:'crop',title:'Maize field',x:-24.4,z:20},
 {type:'well',title:'Farm water well',x:-34,z:-9},
 {type:'market',title:'Farm exchange',x:-43,z:-7},
 {type:'home',title:'Original farm management',x:-16,z:6},
 {type:'vehicle',title:'Pickup truck',x:16,z:-3},
 {type:'scrap',title:'Scrapyard',x:55,z:18},
 {type:'seeds',title:'Seed cache',x:82,z:21},
 {type:'raid',title:'Supply depot raid',x:104,z:-4}
];
for(const n of nodes){
 const group=new T.Group();group.position.set(n.x,0,n.z);scene.add(group);
 const ring=new T.Mesh(new T.TorusGeometry(1.5,.085,6,28),n.type==='raid'?m.raider:m.beacon);
 ring.rotation.x=Math.PI/2;ring.position.y=.12;group.add(ring);
 const stem=mesh(new T.CylinderGeometry(.05,.13,2,6),m.beacon,0,2.2,0,group);
 const top=mesh(new T.OctahedronGeometry(.35),n.type==='raid'?m.raider:m.beacon,0,3.5,0,group);
 n.marker=top;
}
const landscapeStats=finishFrontierLandscape(scene,m);
const farmerAnchor=new T.Group();scene.add(farmerAnchor);
const standIn=new T.Group();farmerAnchor.add(standIn);
box(0,1.28,0,.66,1.05,.4,m.crop,standIn);
ball(0,2.16,0,.32,.34,.32,m.clay,standIn);
box(-.2,.52,0,.22,.85,.2,m.darkWood,standIn);
box(.2,.52,0,.22,.85,.2,m.darkWood,standIn);
box(0,2.5,0,.94,.12,.92,m.darkWood,standIn);
let farmerRig=null;
loadFarmer('man').then(rig=>{farmerRig=rig;farmerAnchor.add(rig.root);standIn.visible=false;}).catch(e=>console.warn('Using farmer placeholder:',e.message));
const truck=createFrontierPickup();
truck.root.position.set(16,.14,-3);scene.add(truck.root);
truck.ready.catch(e=>notify('Pickup model could not load. Reload to retry.'));
const truckAt=state.vehicle;
truck.root.position.set(truckAt.x,.15,truckAt.z);truck.root.rotation.y=truckAt.heading;
const raiders=[];
for(let i=0;i<3;i++){
 const root=new T.Group();scene.add(root);
 box(0,1,0,.65,1.25,.44,m.raider,root);
 ball(0,1.94,0,.32,.33,.32,m.stone,root);
 box(0,1.7,.28,.73,.20,.15,m.darkWood,root);
 const agent={id:'scout-'+i,root,x:90+i*8,z:4+i*4,spawnX:90+i*8,spawnZ:4+i*4,phase:i*2,rig:null,health:100,respawnLeft:0};
 loadFarmer('man').then(rig=>{root.clear();root.add(rig.root);agent.rig=rig;}).catch(()=>{});
 raiders.push(agent);
}
const gun=createFrontierGun(farmerAnchor);
let aiming=false,fireHeld=false,aimPitch=0,hitUntil=0;
const raycaster=new T.Raycaster();
const input={forward:false,backward:false,left:false,right:false,sprint:false};
const moveByKey={KeyW:'forward',ArrowUp:'forward',KeyS:'backward',ArrowDown:'backward',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',ShiftLeft:'sprint',ShiftRight:'sprint'};
let workingUntil=0;
let pitch=0.42,yaw=0,camDistance=13,toastUntil=0,near=null,elapsed=0,lastSaved=0,uiElapsed=0;
function notify(message){$('toast').textContent=message;$('toast').classList.add('visible');toastUntil=performance.now()+3100;}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch(e){console.warn('Frontier save unavailable:',e);}}
function dist(x,z){return Math.hypot(state.x-x,state.z-z);}
function nearestNode(){
 let best=null,range=state.riding?9:6.5;
 for(const n of nodes){
  if(n.type==='vehicle'&&state.riding)continue;
  const d=dist(n.type==='vehicle'?truckAt.x:n.x,n.type==='vehicle'?truckAt.z:n.z);
  if(d<range){best=n;range=d;}
 }
 return best;
}
function handleResult(r){notify(r.message);if(r.ok){save();refreshMarket();}}
function act(){
 stopCombat();
 if($('market').open)return;
 near=nearestNode();
 if(!near){notify('Move closer to a farm, supply or raid marker.');return;}
 if(near.type==='home'){save();window.location.href='./farm.html';return;}
 if(near.type==='market'){refreshMarket();for(const k of Object.keys(input))input[k]=false;$('market').showModal();return;}
 if(near.type==='vehicle'){toggleVehicle();return;}
 const result=collectAt(state,near.type,Date.now());if(result.ok)workingUntil=performance.now()+900;handleResult(result);
}
function toggleVehicle(){
 stopCombat();
 if(state.riding){
  const exit=exitPoint(truckAt);if(!exit){notify('No safe place to exit here. Move the pickup.');return;}
  state.riding=false;truckAt.speed=0;Object.assign(state,exit);notify('Exited the pickup');save();return;
 }
 if(dist(truckAt.x,truckAt.z)>8){notify('Walk to your parked pickup first.');return;}
 if(!truck.loaded){notify('Pickup model is loading. Please wait.');return;}
 if(state.fuel<1){notify('Out of fuel. Refill at the exchange.');return;}
 truckAt.speed=0;state.riding=true;state.x=truckAt.x;state.z=truckAt.z;notify('Driving pickup. Use direction controls.');save();
}
function refreshMarket(){
 $('balances').textContent='Coins: '+state.coins+' · Warehouse: '+Object.entries(state.storage).map(([k,v])=>LABELS[k]+' '+v).join(' · ')+' · Expedition backpack: '+Object.values(state.pack).reduce((a,b)=>a+b,0)+' items';
}
function buildMarket(){
 for(const [item,price] of Object.entries(SELL_PRICE)){
  const b=document.createElement('button');b.textContent='Sell 1 '+LABELS[item]+' · '+price+' ◈';
  b.onclick=()=>handleResult(sellAtMarket(state,item));$('sellActions').append(b);
 }
 for(const [item,price] of [['rations',16],['water',9],['fuel',3]]){
  const b=document.createElement('button');b.textContent='Buy '+(item==='fuel'?'10 fuel':'1 '+LABELS[item])+' · '+price+' ◈';
  b.onclick=()=>handleResult(buySupplies(state,item));$('buyActions').append(b);
 }
 const ammo=document.createElement('button');ammo.textContent='Ammo +24 · 12 ◈';ammo.onclick=()=>handleResult(buyAmmo(state));$('buyActions').append(ammo);
 for(const item of ['rations','water']){const b=document.createElement('button');b.textContent='Pack 1 '+LABELS[item];b.onclick=()=>handleResult(packSupplies(state,item));$('buyActions').append(b);}
 $('deposit').onclick=()=>handleResult(depositAtHome(state));
 $('closeMarket').onclick=()=>$('market').close();
}
buildMarket();
$('use').onclick=act;
$('drive').onclick=toggleVehicle;
$('eat').onclick=()=>handleResult(consume(state,'rations'));
$('aim').onclick=()=>toggleAim();
$('reload').onclick=()=>reloadGun();
$('fire').addEventListener('pointerdown',e=>{e.preventDefault();$('fire').setPointerCapture(e.pointerId);beginFire();});
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('fire').addEventListener(type,()=>{fireHeld=false;});
$('drink').onclick=()=>handleResult(consume(state,'water'));
function bindHold(button,key){
 button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);input[key]=true;});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>{input[key]=false;});
}
document.querySelectorAll('[data-move]').forEach(b=>bindHold(b,b.dataset.move));
bindHold($('run'),'sprint');
window.addEventListener('keydown',e=>{
 if($('market').open){if(e.code==='Escape')$('market').close();return;}
 if(moveByKey[e.code]){e.preventDefault();input[moveByKey[e.code]]=true;}
 if(e.code==='Space')e.preventDefault();
 if(e.repeat)return;
 if(e.code==='KeyE')act();if(e.code==='KeyV')toggleVehicle();
 if(e.code==='KeyQ')handleResult(consume(state,'rations'));
 if(e.code==='KeyT')handleResult(consume(state,'water'));
 if(e.code==='KeyR'){e.preventDefault();reloadGun();}
 if(e.code==='KeyF'){e.preventDefault();toggleAim();}
 if(e.code==='Space'){e.preventDefault();beginFire();}
});
window.addEventListener('keyup',e=>{if(moveByKey[e.code])input[moveByKey[e.code]]=false;if(e.code==='Space')fireHeld=false;});
window.addEventListener('blur',()=>{for(const k of Object.keys(input))input[k]=false;stopCombat();save();});
let pointer=null;
renderer.domElement.addEventListener('pointerdown',e=>{if(e.button===2){e.preventDefault();toggleAim();return;}pointer={id:e.pointerId,x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{if(pointer?.id===e.pointerId){yaw-=((e.clientX-pointer.x)*.008);if(aiming)aimPitch=T.MathUtils.clamp(aimPitch+(e.clientY-pointer.y)*.004,-.45,.55);else pitch=T.MathUtils.clamp(pitch+(e.clientY-pointer.y)*.004,.18,.95);pointer.x=e.clientX;pointer.y=e.clientY;}});
for(const event of ['pointerup','pointercancel'])renderer.domElement.addEventListener(event,()=>{pointer=null;});
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();camDistance=T.MathUtils.clamp(camDistance+Math.sign(e.deltaY)*2,9,27);},{passive:false});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
function updatePlayer(dt){
 let f=Number(input.forward)-Number(input.backward),r=Number(input.right)-Number(input.left);
 const length=Math.hypot(f,r);if(length>1){f/=length;r/=length;}
 const oldX=state.x,oldZ=state.z;
 if(state.riding){
  const distance=stepVehicle(truckAt,f,r,dt,state.fuel);
  state.x=truckAt.x;state.z=truckAt.z;
  state.fuel=Math.max(0,state.fuel-dt*(distance>0?.19:.015));
  truck.root.position.set(truckAt.x,.15,truckAt.z);truck.root.rotation.y=truckAt.heading;
  truck.update(Math.sign(truckAt.speed)*distance,r,Object.values(state.pack).some(v=>v>0));
 }else{
  const speed=aiming?2.1:input.sprint?6.3:3.8;
  moveBody(state,(f*Math.cos(yaw)-r*Math.sin(yaw))*speed*dt,(f*Math.sin(yaw)+r*Math.cos(yaw))*speed*dt);
  farmerAnchor.position.set(state.x,.12,state.z);
  if(aiming||length>.05){const target=aiming?Math.atan2(Math.cos(yaw),Math.sin(yaw)):Math.atan2(state.x-oldX,state.z-oldZ);farmerAnchor.rotation.y+=Math.atan2(Math.sin(target-farmerAnchor.rotation.y),Math.cos(target-farmerAnchor.rotation.y))*Math.min(1,dt*12);}
 }
 const actualSpeed=dt>0?Math.hypot(state.x-oldX,state.z-oldZ)/dt:0;
 farmerAnchor.visible=!state.riding;
 farmerRig?.update(dt,state.riding?0:actualSpeed,!aiming&&performance.now()<workingUntil?'plant':null);
 return actualSpeed;
}
// Combat raycasts ignore actors/markers while retaining actual scenery occlusion.
function wallDistance(origin,direction){
 scene.updateMatrixWorld(true);raycaster.set(origin,direction);raycaster.far=CARBINE.range;
 const ignored=new Set([farmerAnchor,...raiders.map(a=>a.root),...home.animals.map(a=>a.g)]);
 const objects=[];
 scene.traverse(o=>{if(!o.isMesh||!o.material)return;let p=o;while(p){if(ignored.has(p)||!p.visible)return;p=p.parent;}const mats=Array.isArray(o.material)?o.material:[o.material];if(mats.some(m=>m.isMeshStandardMaterial))objects.push(o);});
 return raycaster.intersectObjects(objects,false)[0]?.distance??Infinity;
}
const tracer=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3()]),new T.LineBasicMaterial({color:'#ffe3a0',transparent:true,opacity:.8}));scene.add(tracer);tracer.visible=false;let tracerLeft=0;
function stopCombat(){fireHeld=false;aiming=false;}
function toggleAim(){if(state.riding||$('market').open)return;aiming=!aiming;fireHeld=false;updateCombatHUD();}
function beginFire(){if(document.hidden||$('market').open||state.riding||zoneAt(state.x)==='safe')return;aiming=true;fireHeld=true;shoot();}
function reloadGun(){if(document.hidden||$('market').open)return;const result=startReload(state);if(result.ok){fireHeld=false;aiming=true;}handleResult(result);updateCombatHUD();}
function updateCamera(dt,snap=false){
 if(aiming&&!state.riding){
  let depth=4.6;for(let d=.7;d<depth;d+=.25)if(blocked(state.x-Math.cos(yaw)*d,state.z-Math.sin(yaw)*d,.2)){depth=Math.max(.7,d-.3);break;}
  const target=new T.Vector3(state.x-Math.cos(yaw)*depth-Math.sin(yaw)*.75,2.35,state.z-Math.sin(yaw)*depth+Math.cos(yaw)*.75);
  camera.position.lerp(target,snap?1:Math.min(1,dt*12));
  camera.lookAt(state.x+Math.cos(yaw)*40,1.7-aimPitch*40,state.z+Math.sin(yaw)*40);
  camera.fov=48;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);return;
 }
 camera.fov=62;camera.updateProjectionMatrix();
 const depth=state.riding?18:camDistance,h=1.65+depth*Math.sin(pitch);
 let distance=depth;
 for(let d=1;d<depth;d+=.5){const cx=state.x-Math.cos(yaw)*d,cz=state.z-Math.sin(yaw)*d;if(blocked(cx,cz,.2)){distance=Math.max(1.5,d-.5);break;}}
 const target=new T.Vector3(state.x-Math.cos(yaw)*distance,1.65+(h-1.65)*distance/depth,state.z-Math.sin(yaw)*distance);
 camera.position.lerp(target,Math.min(1,dt*5));
 camera.lookAt(state.x,1.65,state.z);
 camera.updateMatrixWorld(true);
}
function shoot(){
 if(document.hidden||$('market').open)return;
 if(state.weapon.cooldown>1e-8||state.weapon.reloadLeft>0)return;
 updateCamera(0,true);
 farmerAnchor.position.set(state.x,.12,state.z);farmerAnchor.rotation.y=Math.atan2(Math.cos(yaw),Math.sin(yaw));
 gun.update(0,{aiming:true,visible:!state.riding});scene.updateMatrixWorld(true);
 raycaster.setFromCamera(new T.Vector2(0,0),camera);
 const cameraOrigin=raycaster.ray.origin.clone(),cameraDirection=raycaster.ray.direction.clone();
 const wall=wallDistance(cameraOrigin,cameraDirection),target=traceShot(cameraOrigin,cameraDirection,raiders,wall);
 const aimPoint=cameraOrigin.addScaledVector(cameraDirection,target?.distance??Math.min(CARBINE.range,wall));
 const origin=gun.muzzle.getWorldPosition(new T.Vector3()),direction=aimPoint.sub(origin).normalize();
 // Check from the player to the muzzle as well: a barrel touching a wall cannot
 // create bullets on its far side even if the shoulder camera sees around it.
 const shoulder=new T.Vector3(state.x,1.65,state.z),toMuzzle=origin.clone().sub(shoulder),muzzleLength=toMuzzle.length();
 const closeWall=wallDistance(shoulder,toMuzzle.normalize());
 const result=fireWeapon(state,origin,direction,raiders,closeWall<muzzleLength?0:wallDistance(origin,direction));
 if(!result.ok){if(result.message)notify(result.message);fireHeld=false;updateCombatHUD();return;}
 gun.shot();tracer.geometry.setFromPoints([origin,origin.clone().addScaledVector(direction,result.distance)]);tracer.visible=true;tracerLeft=.07;
 if(result.hit){hitUntil=performance.now()+140;$('crosshair').classList.add('hit');notify(result.message);}
 save();updateCombatHUD();
}
function updateCombatHUD(){
 const safe=zoneAt(state.x)==='safe',w=state.weapon;
 $('ammo').textContent=w.magazine+' / '+w.reserve;
 $('weaponStatus').textContent=state.riding?'ON FOOT TO SHOOT':safe?'PROTECTED · WEAPON SAFE':w.reloadLeft>0?'RELOADING '+w.reloadLeft.toFixed(1)+'s':aiming?'FIELDGUARD · AIMING':'FIELDGUARD · READY';
 $('crosshair').hidden=!aiming||state.riding;
 $('aim').textContent=aiming?'LOWER':'AIM';$('fire').disabled=safe||state.riding||w.reloadLeft>0;
 $('reload').disabled=state.riding||w.reloadLeft>0||w.magazine===CARBINE.magazine||w.reserve===0;
}
function updateRaiders(dt){
 let hit=false;
 for(const agent of raiders){
  agent.phase+=dt*.4;
  if(agent.health<=0){agent.respawnLeft=Math.max(0,agent.respawnLeft-dt);agent.root.visible=agent.respawnLeft>44.4;agent.root.rotation.z=(45-agent.respawnLeft)*2;
   if(agent.respawnLeft===0){agent.health=100;agent.x=agent.spawnX;agent.z=agent.spawnZ;agent.root.rotation.z=0;agent.root.visible=true;}continue;}
  const homeX=agent.spawnX+Math.sin(agent.phase)*3,homeZ=agent.spawnZ+Math.cos(agent.phase)*3;
  let tx=homeX,tz=homeZ;
  const distance=Math.hypot(state.x-agent.x,state.z-agent.z);
  if(zoneAt(state.x)==='red'&&distance<15&&!state.riding){tx=state.x;tz=state.z;}
  const dx=tx-agent.x,dz=tz-agent.z,mag=Math.hypot(dx,dz);
  if(mag>.1){moveBody(agent,dx/mag*dt*3.4,dz/mag*dt*3.4);agent.root.rotation.y=Math.atan2(dx,dz);}
  agent.root.position.set(agent.x,.12,agent.z);agent.rig?.update(dt,mag>.1?3.4:0);
  if(zoneAt(state.x)==='red'&&!state.riding&&distance<3.4)hit=true;
 }
 if(hit){state.health=Math.max(0,state.health-dt*8.5);if(Math.random()<dt*.3)notify('Hostile scavengers spotted you! Retreat or reach your vehicle.');}
}
function updateMap(){
 const ctx=$('map').getContext('2d'),w=182,h=112;
 // Canvas intrinsic resolution; browser scales this on phones.
 ctx.clearRect(0,0,w,h);
 ctx.fillStyle='#587e55';ctx.fillRect(0,0,80,h);
 ctx.fillStyle='#7a7f59';ctx.fillRect(80,0,20,h);
 ctx.fillStyle='#8a6653';ctx.fillRect(100,0,w-100,h);
 ctx.fillStyle='#cdbb9e';ctx.fillRect(0,52,w,8);
 ctx.fillStyle='#fff2bc';ctx.fillRect(80,0,1,h);
 ctx.fillStyle='#e27a65';ctx.fillRect(100,0,1,h);
 const project=(x,z)=>({x:((x+63)/222)*w,y:((z+69)/138)*h});
 for(const n of nodes){const p=project(n.x,n.z);ctx.fillStyle=n.type==='raid'?'#fe8d7b':'#f3e1a8';ctx.fillRect(p.x-2,p.y-2,4,4);}
 const p=project(state.x,state.z);ctx.beginPath();ctx.fillStyle='#ffffff';ctx.arc(p.x,p.y,3.8,0,Math.PI*2);ctx.fill();
}
function updateHUD(){
 const zone=zoneAt(state.x),label={safe:'🛡 PROTECTED FARM',frontier:'⚠ FRONTIER',red:'⛔ RED ZONE'}[zone];
 $('zone').textContent=label;$('zone').className=zone==='safe'?'':zone==='red'?'red':'danger';
 $('coins').textContent=state.coins+' ◈';
 for(const k of ['health','hunger','thirst','fuel'])$(k).value=state[k];
 const items=Object.entries(state.pack).filter(([,v])=>v>0).map(([k,v])=>v+' '+LABELS[k]);
 $('pack').textContent='BACKPACK · '+(items.length?items.join(' · '):'EMPTY');
 near=nearestNode();
 $('proximity').textContent=near?('E / INTERACT: '+near.title):'Follow the road to the next location.';
 if(zone==='safe')$('objective').textContent=items.length?'Return to the exchange to secure expedition loot.':'Harvest, collect water, visit the exchange, then drive into the Frontier.';
 else if(zone==='frontier')$('objective').textContent='Search the scrapyard or seed cache. Bring resources back safely.';
 else $('objective').textContent='Raid the supply depot and escape the scavenger patrols before being knocked out!';
 $('drive').textContent=state.riding?'EXIT VEHICLE':'VEHICLE';
 updateCombatHUD();
 updateMap();
}
function tick(t){
 requestAnimationFrame(tick);
 if(!tick.last)tick.last=t;
 const dt=Math.min(.05,(t-tick.last)/1000);tick.last=t;
 if(!document.hidden&&!$('market').open){
   if(tickWeapon(state.weapon,dt)){save();updateCombatHUD();}
   updatePlayer(dt);
   simulateNeeds(state,dt);
   updateRaiders(dt);
   if(fireHeld)shoot();
   if(state.health<=0){stopCombat();state.weapon.reloadLeft=0;handleResult(knockout(state));truckAt.speed=0;}
 }
 updateCamera(dt);
 gun.update(dt,{aiming,reload:state.weapon.reloadLeft>0?1-state.weapon.reloadLeft/CARBINE.reloadSeconds:0,visible:!state.riding});
 poseGunArms(farmerRig,farmerAnchor,aiming,state.weapon.reloadLeft>0?1-state.weapon.reloadLeft/CARBINE.reloadSeconds:0);
 tracerLeft=Math.max(0,tracerLeft-dt);tracer.visible=tracerLeft>0;
 if(t>hitUntil)$('crosshair').classList.remove('hit');
 elapsed+=dt;home.update(dt,state,elapsed);
 for(const n of nodes)n.marker.rotation.y+=dt*.8;
 if(t>toastUntil)$('toast').classList.remove('visible');
 uiElapsed+=dt;if(uiElapsed>.3){uiElapsed=0;updateHUD();}
 if(elapsed-lastSaved>8){lastSaved=elapsed;save();}
 renderer.render(scene,camera);
}
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();save();$('startup').hidden=false;$('startup').textContent='3D graphics paused. Progress saved. Reload this page to resume.';});
camera.position.set(state.x-11,7,state.z);
updateHUD();requestAnimationFrame(tick);
window.addEventListener('pagehide',save);
notify('Welcome to Frontier. Explore on foot or use your pickup. Your original farm save stays untouched.');

document.addEventListener('visibilitychange',()=>{for(const k of Object.keys(input))input[k]=false;stopCombat();pointer=null;truckAt.speed=0;tick.last=0;save();});
