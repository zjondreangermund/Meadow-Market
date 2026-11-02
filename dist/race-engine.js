// Skyline Cup v1: fixed-step rules shared by the playable race and its replay.
export const STEP=1/60, RULES_VERSION='skyline-1';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function rng(seed){let n=seed>>>0;return ()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);}
export function createRace(horse,metres=800,seed=1){
 if(![400,800,1600].includes(metres))throw Error('Choose 400, 800 or 1600 metres.');
 const random=rng(seed),base=[['sirocco','Sirocco',78,65,83],['lumen','Moon Lumen',71,89,64],['comet','Red Comet',83,62,80],['tempest','Tempest Blue',75,79,74],['halo','Golden Halo',77,75,77]];
 const entrants=[{...horse,id:'player',stableId:horse.id},...base.map(([id,name,speed,stamina,power])=>({id,name,speed,stamina,power,energy:100,condition:80}))];
 const runners=entrants.map((h,i)=>({...h,speed:clamp(Number(h.speed)||50,1,100),stamina:clamp(Number(h.stamina)||50,1,100),power:clamp(Number(h.power)||50,1,100),energy:clamp(Number(h.energy)||0,0,100),condition:clamp(Number(h.condition)||20,20,100),lane:i,targetLane:i,distance:0,velocity:0,reserve:100,burst:0,burstUsed:false,drafting:false,blocked:false,finish:null,form:.98+random()*.04,strategy:i%3,attackAt:.64+random()*.17}));
 return {version:RULES_VERSION,metres,seed:seed>>>0,tick:0,time:0,runners,finished:[],done:false,events:[]};
}
export function raceOrder(race){return [...race.runners].sort((a,b)=>a.finish!==null&&b.finish!==null?a.finish-b.finish:a.finish!==null?-1:b.finish!==null?1:b.distance-a.distance);}
export function stepRace(race,command={}){
 if(race.done)return race;
 const tick=race.tick,time=tick*STEP,prior=race.runners.map(h=>({...h}));
 for(let i=0;i<race.runners.length;i++){
  const h=race.runners[i];if(h.finish!==null)continue;
  const old=prior[i],progress=h.distance/race.metres;
  let pace='cruise';
  if(i===0){pace=['save','cruise','push'].includes(command.pace)?command.pace:'cruise';if(Number.isFinite(command.lane))h.targetLane=clamp(Math.round(command.lane),0,5);}
  else{
   pace=progress<h.attackAt?(h.strategy===0?'cruise':'save'):'push';
   if(tick%90===i*10){const front=prior.find((r,j)=>j!==i&&r.finish===null&&r.distance>h.distance&&r.distance-h.distance<7&&Math.abs(r.lane-h.lane)<.85);if(front){for(const shift of [1,-1]){const lane=clamp(h.targetLane+shift,0,5);if(!prior.some((r,j)=>j!==i&&Math.abs(r.lane-lane)<.8&&Math.abs(r.distance-h.distance)<5)){h.targetLane=lane;break;}}}else if(h.targetLane>0&&!prior.some((r,j)=>j!==i&&Math.abs(r.lane-(h.targetLane-1))<.9&&Math.abs(r.distance-h.distance)<6))h.targetLane--;}
  }
  // A lane change requires a clear pocket; runners never pass through one another.
  const delta=clamp(h.targetLane-h.lane,-STEP*1.3,STEP*1.3),nextLane=h.lane+delta;
  if(!prior.some((r,j)=>j!==i&&r.finish===null&&Math.abs(r.distance-h.distance)<3.7&&Math.abs(r.lane-nextLane)<.79))h.lane=nextLane;
  const ahead=prior.filter((r,j)=>j!==i&&r.finish===null&&r.distance>h.distance&&Math.abs(r.lane-h.lane)<.78).sort((a,b)=>a.distance-b.distance)[0];
  const gap=ahead?ahead.distance-h.distance:Infinity;
  h.drafting=gap>3.8&&gap<12;
  const request=i===0?command.burst:progress>.79&&h.reserve>24;
  if(request&&!h.burstUsed&&h.reserve>=24){h.burstUsed=true;h.burst=4.5;race.events.push({tick,type:'burst',id:h.id});}
  h.burst=Math.max(0,h.burst-STEP);
  const effort=pace==='save'?.91:pace==='push'?1.075:1;
  const fatigue=h.reserve<22?.76+.24*h.reserve/22:1;
  const health=(.87+h.energy*.0013)*(.88+h.condition*.0012);
  const start=time<2?(.8+h.power*.002):1;
  let desired=(12.4+h.speed*.072)*effort*health*h.form*fatigue*start*(h.burst>0?1.18:1);
  h.velocity+=clamp(desired-h.velocity,-STEP*5,STEP*(2.9+h.power*.045));
  // Outside turns cost distance. Straight sections remain good overtaking opportunities.
  const arc=(h.distance%400)/400,turn=Math.abs(Math.sin(arc*Math.PI*2));
  let travel=h.velocity*STEP/(1+h.lane*.014*turn);
  h.blocked=gap<4.4;
  if(ahead&&gap-travel<3.8)travel=Math.max(0,gap-3.8);
  const before=h.distance;h.distance+=travel;
  // Scale fatigue by event length so all distances retain meaningful tactical choices.
  const drain=(pace==='save'?.17:pace==='push'?1.55:.71)*(1.4-h.stamina*.006)*(800/race.metres)*(h.drafting?.65:1)+(h.burst>0?4:0);
  h.reserve=clamp(h.reserve-drain*STEP,0,100);
  if(h.distance>=race.metres){h.finish=time+STEP*(race.metres-before)/Math.max(.00001,travel);h.distance=race.metres;race.finished.push(h.id);race.events.push({tick,type:'finish',id:h.id});}
 }
 race.tick++;race.time=race.tick*STEP;race.done=race.runners.every(h=>h.finish!==null);
 return race;
}
export function replayRace(horse,metres,seed,inputs,maxTicks=30000){const race=createRace(horse,metres,seed);let at=0,command={pace:'cruise',lane:0};while(!race.done&&race.tick<maxTicks){while(at<inputs.length&&inputs[at].tick<=race.tick){command={...inputs[at++]};}stepRace(race,command);command.burst=false;}return race;}
