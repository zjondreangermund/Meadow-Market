import * as T from './three.module.js';
import {loadFarmer} from './farmer-rig.js';
import {createFarmVehicle} from './vehicle-models.js';
import {SAVE_KEY,zoneAt,newFrontierState,normaliseState,simulateNeeds,collectAt,consume,depositAtHome,sellAtMarket,buySupplies,knockout,LABELS,SELL_PRICE} from './frontier-rules.js';

// LOCAL VERTICAL SLICE ONLY. No multiplayer, PvP or real player accounts are simulated.
const $=id=>document.getElementById(id);
let state;
try { state=normaliseState(JSON.parse(localStorage.getItem(SAVE_KEY)||'null')); }
catch { state=newFrontierState(); }
const mobile=matchMedia('(pointer: coarse)').matches||innerWidth<780;
const host=$('scene');
const scene=new T.Scene();
scene.background=new T.Color('#aec7c7');
scene.fog=new T.FogExp2('#abbcb7',.0055);
const camera=new T.PerspectiveCamera(62,innerWidth/innerHeight,.1,520);
const renderer=new T.WebGLRenderer({antialias:!mobile,alpha:false,powerPreference:mobile?'low-power':'high-performance'});
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
box(39,.04,0,184,.12,9,m.road);
for(let i=-7;i<17;i++)box(i*10,.14,0,3,.02,.09,m.clay);
for(const z of [-49,49])fence(-12,z,88);
for(const z of [-38,-22,-9,9,22,38]){
  if(Math.abs(z)<9)continue;
  box(34,1,z,.19,2,12,m.wood);
}
for(const z of [-5.9,5.9])box(34,1.5,z,.34,3,.4,m.darkWood);
box(34,3.15,0,.35,.52,12,m.darkWood);

// Homestead buildings and fields.
box(-24,2,-20,14,4,11,m.wood);roof(-24,-20,16,11,5,m.roof);
box(-24,1.9,-14.42,3.2,3.2,.3,m.darkWood);
box(-26,2.4,-25.6,2,1.5,.1,m.glass);
box(-11,1.9,-33,13,3.8,9,m.stone);roof(-11,-33,14,9,4.5,m.roof);
box(-11,1.7,-28.4,2.6,3,.25,m.darkWood);
cylinderAt(-39,3,-32,3,3,6,m.metal);cylinderAt(-39,6.35,-32,3.25,2.9,.75,m.roof);
for(let x=-35;x<=-5;x+=3.8)for(let z=13;z<=35;z+=4){
 box(x,.14,z,1.7,.1,3,m.dirt);
 for(let j=0;j<3;j++){
  const px=x+(j-1)*.39;
  cylinderAt(px,.9,z,.07,.11,1.1,m.cropLeaf);
  ball(px,.76,z,.26,.35,.3,m.cropLeaf);
  ball(px,1.22,z,.13,.25,.14,m.cropCob);
 }
}
cylinderAt(-3,1.4,19,1.25,1.45,2.6,m.stone);
cylinderAt(-3,2.8,19,1.6,1.4,.23,m.darkWood);
box(-3,4,19,.14,2,.14,m.wood);

// Village market: crate tables, canopy and loading point.
box(-10,.68,-14,9,1.2,4,m.wood);
box(-10,3,-14,11,.18,6,m.clay);
for(const x of [-15,-5])for(const z of [-17,-11])box(x,1.7,z,.18,3.4,.18,m.metal);
for(let i=0;i<6;i++)box(-13+i*1.2,1.4,-14,.8,.5,.7,i%2?m.crop:m.clay);

// Weathered station and derelict supply depot.
box(104,1.9,-18,18,3.8,15,m.stone);roof(104,-18,19,15,4.2,m.metal);
box(104,1.7,-10.4,6,3.1,.2,m.darkWood);
for(let i=0;i<8;i++)box(94+i*3,0.7,-1,2.1,1.4,1.5,m.crate);
box(82,1.4,21,5,2.8,6,m.darkWood);
box(82,3,21,5.7,.25,7,m.metal);
for(let i=0;i<6;i++)box(46+i*1.8,.7,18+i%2*2,1.5,1.2,1.5,m.metal);

// Scrub, trees and scattered landscape detail; deterministic for reproducible runs.
let seed=14025;
function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
for(let i=0;i<98;i++){
 const x=-62+rand()*224,z=-67+rand()*134;
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
 {type:'crop',title:'Maize field',x:-19,z:20},
 {type:'well',title:'Farm water well',x:-3,z:19},
 {type:'market',title:'Farm exchange',x:-10,z:-14},
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
const farmerAnchor=new T.Group();scene.add(farmerAnchor);
const standIn=new T.Group();farmerAnchor.add(standIn);
box(0,1.28,0,.66,1.05,.4,m.crop,standIn);
ball(0,2.16,0,.32,.34,.32,m.clay,standIn);
box(-.2,.52,0,.22,.85,.2,m.darkWood,standIn);
box(.2,.52,0,.22,.85,.2,m.darkWood,standIn);
box(0,2.5,0,.94,.12,.92,m.darkWood,standIn);
let farmerRig=null;
loadFarmer('man').then(rig=>{farmerRig=rig;farmerAnchor.add(rig.root);standIn.visible=false;}).catch(e=>console.warn('Using farmer placeholder:',e.message));
const truck=createFarmVehicle('pickup','#74886e',{style:'touring'});
truck.root.position.set(16,.14,-3);scene.add(truck.root);
truck.ready.catch(e=>console.warn('Pickup model fallback:',e.message));
let truckAt={x:16,z:-3};
const raiders=[];
for(let i=0;i<3;i++){
 const root=new T.Group();scene.add(root);
 box(0,1,0,.65,1.25,.44,m.raider,root);
 ball(0,1.94,0,.32,.33,.32,m.stone,root);
 box(0,1.7,.28,.73,.20,.15,m.darkWood,root);
 raiders.push({root,x:94+i*7,z:-24+i*8,phase:i*2});
}
const input={forward:false,backward:false,left:false,right:false,sprint:false};
const moveByKey={KeyW:'forward',ArrowUp:'forward',KeyS:'backward',ArrowDown:'backward',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',ShiftLeft:'sprint',ShiftRight:'sprint'};
let yaw=0,camDistance=17,toastUntil=0,near=null,elapsed=0,lastSaved=0,uiElapsed=0;
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
 if($('market').open)return;
 near=nearestNode();
 if(!near){notify('Move closer to a farm, supply or raid marker.');return;}
 if(near.type==='market'){refreshMarket();$('market').showModal();return;}
 if(near.type==='vehicle'){toggleVehicle();return;}
 handleResult(collectAt(state,near.type,Date.now()));
}
function toggleVehicle(){
 if(state.riding){
  state.riding=false;truckAt={x:state.x,z:state.z};notify('Exited the pickup');save();return;
 }
 if(dist(truckAt.x,truckAt.z)>8){notify('Walk to your parked pickup first.');return;}
 if(state.fuel<1){notify('Out of fuel. Refill at the exchange.');return;}
 state.riding=true;state.x=truckAt.x;state.z=truckAt.z;notify('Driving pickup. Use direction controls.');save();
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
 $('deposit').onclick=()=>handleResult(depositAtHome(state));
 $('closeMarket').onclick=()=>$('market').close();
}
buildMarket();
$('use').onclick=act;
$('drive').onclick=toggleVehicle;
$('eat').onclick=()=>handleResult(consume(state,'rations'));
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
 if(e.repeat)return;
 if(e.code==='KeyE')act();if(e.code==='KeyV')toggleVehicle();
 if(e.code==='KeyQ')handleResult(consume(state,'rations'));
 if(e.code==='KeyR')handleResult(consume(state,'water'));
});
window.addEventListener('keyup',e=>{if(moveByKey[e.code])input[moveByKey[e.code]]=false;});
window.addEventListener('blur',()=>{for(const k of Object.keys(input))input[k]=false;save();});
let pointer=null;
renderer.domElement.addEventListener('pointerdown',e=>{pointer={id:e.pointerId,x:e.clientX};renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{if(pointer?.id===e.pointerId){yaw-=((e.clientX-pointer.x)*.008);pointer.x=e.clientX;}});
for(const event of ['pointerup','pointercancel'])renderer.domElement.addEventListener(event,()=>{pointer=null;});
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();camDistance=T.MathUtils.clamp(camDistance+Math.sign(e.deltaY)*2,9,27);},{passive:false});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
function updatePlayer(dt){
 let f=Number(input.forward)-Number(input.backward),r=Number(input.right)-Number(input.left);
 const length=Math.hypot(f,r);if(length>0){f/=length;r/=length;}
 const speed=state.riding?12.2:input.sprint?7:4.4;
 const dx=(f*Math.cos(yaw)-r*Math.sin(yaw))*speed*dt;
 const dz=(f*Math.sin(yaw)+r*Math.cos(yaw))*speed*dt;
 // Homestead fence has a traversable central gate.
 const nextX=T.MathUtils.clamp(state.x+dx,-63,159),nextZ=T.MathUtils.clamp(state.z+dz,-69,69);
 if(!(state.x<34&&nextX>=34&&Math.abs(nextZ)>6 || state.x>=34&&nextX<34&&Math.abs(nextZ)>6)){
  state.x=nextX;state.z=nextZ;
 }
 if(state.riding){state.fuel=Math.max(0,state.fuel-dt*(length>.1?.19:.015));if(state.fuel===0){state.riding=false;notify('Pickup ran out of fuel. Return home on foot.');}}
 if(state.riding){truck.root.position.set(state.x,.15,state.z);if(length>.1)truck.root.rotation.y=Math.atan2(-dz,dx);truck.update(length*speed*dt,0,false);}
 else {farmerAnchor.position.set(state.x,.12,state.z);if(length>.1)farmerAnchor.rotation.y=Math.atan2(dx,dz);}
 farmerAnchor.visible=!state.riding;
 farmerRig?.update(dt,state.riding?0:length*speed);
 return length*speed;
}
function updateRaiders(dt){
 let hit=false;
 for(const agent of raiders){
  agent.phase+=dt*.4;
  const homeX=96+Math.sin(agent.phase)*8,homeZ=-19+Math.cos(agent.phase)*8;
  let tx=homeX,tz=homeZ;
  const distance=Math.hypot(state.x-agent.x,state.z-agent.z);
  if(zoneAt(state.x)==='red'&&distance<15&&!state.riding){tx=state.x;tz=state.z;}
  const dx=tx-agent.x,dz=tz-agent.z,mag=Math.hypot(dx,dz);
  if(mag>.1){agent.x+=dx/mag*dt*3.4;agent.z+=dz/mag*dt*3.4;agent.root.rotation.y=Math.atan2(dx,dz);}
  agent.root.position.set(agent.x,.12,agent.z);
  if(!state.riding&&distance<3.4)hit=true;
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
 updateMap();
}
function tick(t){
 requestAnimationFrame(tick);
 if(!tick.last)tick.last=t;
 const dt=Math.min(.05,(t-tick.last)/1000);tick.last=t;
 if(!$('market').open){
   updatePlayer(dt);
   simulateNeeds(state,dt);
   updateRaiders(dt);
   if(state.health<=0){handleResult(knockout(state));truckAt={x:16,z:-3};truck.root.position.set(16,.15,-3);}
 }
 const h=state.riding?12:7,depth=state.riding?24:camDistance;
 const target=new T.Vector3(state.x-Math.cos(yaw)*depth,h,state.z-Math.sin(yaw)*depth);
 camera.position.lerp(target,Math.min(1,dt*5));
 camera.lookAt(state.x,1.65,state.z);
 elapsed+=dt;
 for(const n of nodes)n.marker.rotation.y+=dt*.8;
 if(t>toastUntil)$('toast').classList.remove('visible');
 uiElapsed+=dt;if(uiElapsed>.3){uiElapsed=0;updateHUD();}
 if(elapsed-lastSaved>8){lastSaved=elapsed;save();}
 renderer.render(scene,camera);
}
updateHUD();requestAnimationFrame(tick);
window.addEventListener('pagehide',save);
notify('Welcome to Frontier. Explore on foot or use your pickup. Your original farm save stays untouched.');
