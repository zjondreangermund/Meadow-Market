// Meadow Market Frontier local vertical-slice rules.
// This file is not a multiplayer security boundary: server-side validation is required.
export const SAFE_LINE = 34;
export const RED_LINE = 70;
export const SAVE_KEY = 'meadow-frontier-prototype-v1'; // Never overwrite meadow-cycle-v2.

export const LABELS = {maize:'Maize',water:'Water',rations:'Food',scrap:'Scrap metal',seeds:'Rare seeds',parts:'Machine parts'};
export const SELL_PRICE = {maize:7,scrap:14,seeds:45,parts:65};
export function zoneAt(x) { return x < SAFE_LINE ? 'safe' : x < RED_LINE ? 'frontier' : 'red'; }
export function newFrontierState() {
  return {
    version:1,x:0,z:0,coins:160,health:100,hunger:100,thirst:100,fuel:80,
    riding:false,storage:{maize:4,water:5,rations:3,scrap:0,seeds:0,parts:0},
    pack:{maize:0,water:0,rations:0,scrap:0,seeds:0,parts:0},
    cooldowns:{},totalRaids:0,totalExtracted:0
  };
}
export function normaliseState(data) {
  const base=newFrontierState();
  if(!data || data.version!==1 || typeof data!=='object') return base;
  const finite=(v,def,min,max)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):def;
  for(const k of ['x','z']) base[k]=finite(data[k],0,-110,110);
  for(const k of ['coins','health','hunger','thirst','fuel']) base[k]=finite(data[k],base[k],0,k==='coins'?100000:100);
  for(const bucket of ['storage','pack']) for(const item of Object.keys(LABELS)) {
    base[bucket][item]=Math.floor(finite(data[bucket]?.[item],base[bucket][item],0,1000));
  }
  for(const key of ['totalRaids','totalExtracted']) base[key]=Math.floor(finite(data[key],0,0,100000));
  // Vehicle never starts moving after reload.
  base.riding=false;
  // Only known object keys, no untrusted prototype keys.
  for(const key of ['crop','well','scrap','seeds','raid']) {
    base.cooldowns[key]=finite(data.cooldowns?.[key],0,0,Number.MAX_SAFE_INTEGER);
  }
  return base;
}
export function simulateNeeds(state,seconds) {
  const dt=Math.max(0,Math.min(seconds,1));
  const exposed=zoneAt(state.x)!=='safe';
  state.hunger=Math.max(0,state.hunger-dt*(exposed?.16:.045));
  state.thirst=Math.max(0,state.thirst-dt*(exposed?.25:.065));
  if(state.hunger===0||state.thirst===0)state.health=Math.max(0,state.health-dt*1.6);
  if(!exposed&&state.hunger>35&&state.thirst>35)state.health=Math.min(100,state.health+dt*.12);
  return state.health>0;
}
function quantity(bucket,item,n) { bucket[item]=(bucket[item]||0)+n; }
function canCollect(state,key,now,wait) {
  if((state.cooldowns[key]||0)>now) return {ok:false,message:'This location is recovering. Come back later.'};
  state.cooldowns[key]=now+wait;
  return {ok:true};
}
export function collectAt(state,type,now) {
  const zone=zoneAt(state.x);
  const setup={
    crop:{safe:true,item:'maize',quantity:3,cooldown:12000,target:'storage',label:'Harvested 3 maize'},
    well:{safe:true,item:'water',quantity:2,cooldown:9000,target:'storage',label:'Collected 2 water'},
    scrap:{safe:false,item:'scrap',quantity:2,cooldown:12000,target:'pack',label:'Scavenged 2 scrap metal'},
    seeds:{safe:false,item:'seeds',quantity:1,cooldown:28000,target:'pack',label:'Found a rare seed packet'},
    raid:{safe:false,item:'parts',quantity:2,cooldown:70000,target:'pack',label:'Raid successful: 2 machine parts'}
  }[type];
  if(!setup) return {ok:false,message:'Unknown location'};
  if(setup.safe!== (zone==='safe')) return {ok:false,message:'Wrong territory for this action'};
  if(type==='raid'&&zone!=='red') return {ok:false,message:'Supply depots can only be raided in the red zone'};
  if(state.health<=0)return {ok:false,message:'Recover at home first'};
  if(type==='raid'&&state.fuel<5)return {ok:false,message:'Keep at least 5 fuel for the extraction'};
  const lock=canCollect(state,type,now,setup.cooldown);
  if(!lock.ok)return lock;
  quantity(state[setup.target],setup.item,setup.quantity);
  if(type==='raid'){state.totalRaids++;state.fuel-=5;}
  return {ok:true,message:setup.label};
}
export function consume(state,item) {
  if(item!=='rations'&&item!=='water')return {ok:false,message:'Unavailable item'};
  const bucket=state.pack[item]>0?state.pack:(zoneAt(state.x)==='safe'?state.storage:null);
  if(!bucket||!bucket[item])return {ok:false,message:'No '+LABELS[item].toLowerCase()+' available'};
  bucket[item]--;
  if(item==='rations')state.hunger=Math.min(100,state.hunger+38);
  else state.thirst=Math.min(100,state.thirst+45);
  return {ok:true,message:item==='rations'?'Ate a ration':'Drank clean water'};
}
export function depositAtHome(state) {
  if(zoneAt(state.x)!=='safe')return {ok:false,message:'Return to the protected farm to secure loot'};
  let total=0;for(const item of Object.keys(LABELS)){const q=state.pack[item]||0;state.storage[item]+=q;total+=q;state.pack[item]=0;}
  state.totalExtracted+=total;return {ok:true,message:total?('Secured '+total+' items in the farm warehouse'):'Your backpack is empty'};
}
export function sellAtMarket(state,item,qty=1) {
  if(zoneAt(state.x)!=='safe')return {ok:false,message:'Trade only at your protected market'};
  if(!SELL_PRICE[item]||!Number.isInteger(qty)||qty<=0)return {ok:false,message:'Invalid trade'};
  if(state.storage[item]<qty)return {ok:false,message:'Not enough '+LABELS[item]};
  state.storage[item]-=qty;const value=SELL_PRICE[item]*qty;state.coins+=value;
  return {ok:true,message:'Sold '+qty+' '+LABELS[item]+' for '+value+' farm coins'};
}
export function buySupplies(state,item,qty=1) {
  const cost={rations:16,water:9,fuel:3}[item];
  if(zoneAt(state.x)!=='safe'||!cost||!Number.isInteger(qty)||qty<=0)return {ok:false,message:'Trade at home only'};
  if(state.coins<cost*qty)return {ok:false,message:'Not enough farm coins'};
  if(item==='fuel'&&state.fuel+qty*10>100)return {ok:false,message:'Fuel tank capacity reached'};
  state.coins-=cost*qty;
  if(item==='fuel')state.fuel+=qty*10;
  else state.storage[item]+=qty;
  return {ok:true,message:'Purchased '+qty+' '+item};
}
export function knockout(state){
  for(const item of Object.keys(LABELS))state.pack[item]=0;
  state.x=0;state.z=0;state.riding=false;state.health=70;state.hunger=Math.max(state.hunger,35);state.thirst=Math.max(state.thirst,35);
  return {ok:true,message:'Rescued to your protected farm. Expedition backpack lost; warehouse and farm coins retained.'};
}
