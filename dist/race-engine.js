import {jockeyById} from './jockeys.js';
// Skyline Cup v1: fixed-step rules shared by the playable race and its replay.
export const STEP=1/60, RULES_VERSION='skyline-5';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function rng(seed){let n=seed>>>0;return ()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);}
export function createRace(horse,metres=800,seed=1,options={}){
 if(![400,800,1600].includes(metres))throw Error('Choose 400, 800 or 1600 metres.');
 const random=rng(seed),base=[['sirocco','Sirocco',78,65,83],['lumen','Moon Lumen',71,89,64],['comet','Red Comet',83,62,80],['tempest','Tempest Blue',75,79,74],['halo','Golden Halo',77,75,77]];
 const entrants=[{...horse,id:'player',stableId:horse.id},...base.map(([id,name,speed,stamina,power])=>({id,name,speed,stamina,power,energy:100,condition:80}))];
 const runners=entrants.map((h,i)=>({...h,speed:clamp(Number(h.speed)||50,1,100),stamina:clamp(Number(h.stamina)||50,1,100),power:clamp(Number(h.power)||50,1,100),energy:clamp(Number(h.energy)||0,0,100),condition:clamp(Number(h.condition)||20,20,100),jockey:jockeyById(i===0?options.jockeyId:['mara','kai','tala'][i%3]),lane:i,targetLane:i,laneVelocity:0,distance:0,velocity:0,actualVelocity:0,plan:i===0?(['closer','front','stalker'].includes(options.plan)?options.plan:'stalker'):['front','closer','stalker'][i%3],resolve:10,burstStrength:1.12,reserve:100,burst:0,burstUsed:false,drafting:false,blocked:false,finish:null,form:.98+random()*.04,strategy:i%3,attackAt:.64+random()*.17}));
 return {version:RULES_VERSION,metres,seed:seed>>>0,track:options.track==='soft'?'soft':'firm',wind:(seed%9)/8,tick:0,time:0,runners,finished:[],done:false,events:[]};
}
export function raceOrder(race){return [...race.runners].sort((a,b)=>a.finish!==null&&b.finish!==null?a.finish-b.finish:a.finish!==null?-1:b.finish!==null?1:b.distance-a.distance);}
export function stepRace(race,command={}){
 if(race.done)return race;
 const tick=race.tick,time=tick*STEP,prior=race.runners.map(h=>({...h}));
 for(let i=0;i<race.runners.length;i++){
  const h=race.runners[i];if(h.finish!==null)continue;
  const old=prior[i],progress=h.distance/race.metres,arc=(h.distance%400)/400;
  let pace='cruise';
  if(i===0){pace=['save','cruise','push'].includes(command.pace)?command.pace:'cruise';if(Number.isFinite(command.lane))h.targetLane=clamp(Math.round(command.lane),0,5);}
  else{
   pace=progress<h.attackAt?(h.strategy===0?'cruise':'save'):'push';
   if(tick%90===i*10){const front=prior.find((r,j)=>j!==i&&r.finish===null&&r.distance>h.distance&&r.distance-h.distance<7&&Math.abs(r.lane-h.lane)<.85);if(front){for(const shift of [1,-1]){const lane=clamp(h.targetLane+shift,0,5);if(!prior.some((r,j)=>j!==i&&Math.abs(r.lane-lane)<.8&&Math.abs(r.distance-h.distance)<5)){h.targetLane=lane;break;}}}else if(h.targetLane>0&&!prior.some((r,j)=>j!==i&&Math.abs(r.lane-(h.targetLane-1))<.9&&Math.abs(r.distance-h.distance)<6))h.targetLane--;}
  }
  h.pace=pace;
  // A lane change requires a clear pocket; runners never pass through one another.
  const precision=1+(h.jockey.line-50)*.006;const laneGoal=clamp((h.targetLane-h.lane)*2,-.95,.95);h.laneVelocity+=clamp(laneGoal-h.laneVelocity,-STEP*2.4*precision,STEP*2.4*precision);let nextLane=clamp(h.lane+h.laneVelocity*STEP,0,5);if((h.targetLane-h.lane)*(h.targetLane-nextLane)<0){nextLane=h.targetLane;h.laneVelocity=0;}
  if(!prior.some((r,j)=>j!==i&&r.finish===null&&Math.abs(r.distance-h.distance)<3.7&&Math.abs(r.lane-nextLane)<.79))h.lane=nextLane;else h.laneVelocity=0;
  const ahead=prior.filter((r,j)=>j!==i&&r.finish===null&&r.distance>h.distance&&Math.abs(r.lane-h.lane)<.78).sort((a,b)=>a.distance-b.distance)[0];
  const gap=ahead?ahead.distance-h.distance:Infinity;
  h.drafting=gap>3.8&&gap<12;
  const request=i===0?command.burst:progress>.79&&h.reserve>24;
  if(request&&!h.burstUsed&&h.reserve>=24){h.burstUsed=true;h.burst=4.5;h.burstStrength=1.10+h.resolve*.0012+(h.jockey.finish-50)*.0004;h.resolve=0;race.events.push({tick,type:'burst',id:h.id});}
  h.burst=Math.max(0,h.burst-STEP);
  const effort=pace==='save'?.91:pace==='push'?1.075:1;
  const fatigue=h.reserve<22?.76+.24*h.reserve/22:1;
  const health=(.87+h.energy*.0013)*(.88+h.condition*.0012);
  const start=time<2?(.8+h.power*.002):1;
  const planGain=h.plan==='front'&&h.distance<150?1.055:h.plan==='closer'&&progress>.7&&h.reserve>25?1.045:h.plan==='stalker'&&h.drafting?1.016:1;
  const turf=race.track==='soft'?.94+h.power*.0006:1,wind=1-race.wind*.025*Math.max(0,Math.cos(arc*Math.PI*2))*(h.drafting?.2:1);
  let desired=(12.4+h.speed*.072)*effort*health*h.form*fatigue*start*(h.burst>0?h.burstStrength:1)*planGain*turf*wind;
  h.velocity+=clamp(desired-h.velocity,-STEP*5,STEP*(2.9+h.power*.045));
  // Outside turns cost distance. Straight sections remain good overtaking opportunities.
  const turn=Math.abs(Math.sin(arc*Math.PI*2));
  let travel=h.velocity*STEP/(1+h.lane*.014*turn*(1-(h.jockey.line-50)*.002));
  h.blocked=gap<4.4;
  if(ahead&&gap-travel<3.8)travel=Math.max(0,gap-3.8);
  h.actualVelocity=travel/STEP;const before=h.distance;h.distance+=travel;
  // Scale fatigue by event length so all distances retain meaningful tactical choices.
  const drain=(pace==='save'?.17:pace==='push'?1.55:.71)*(1.4-h.stamina*.006)*(800/race.metres)*(h.drafting?(h.plan==='stalker'?.5:.65)*(1-(h.jockey.care-50)*.002):1)*(h.plan==='front'&&h.distance<150?1.18:1)*(race.track==='soft'?1.09:1)+(h.burst>0?4:0);
  h.reserve=clamp(h.reserve-drain*STEP,0,100);if(!h.burstUsed)h.resolve=clamp(h.resolve+STEP*(h.drafting?5:pace==='save'?2.6:pace==='cruise'?1.8:.9),0,100);
  if(h.distance>=race.metres){h.finish=time+STEP*(race.metres-before)/Math.max(.00001,travel);h.distance=race.metres;race.finished.push(h.id);race.events.push({tick,type:'finish',id:h.id});}
 }
 race.tick++;race.time=race.tick*STEP;race.done=race.runners.every(h=>h.finish!==null);
 return race;
}
export function replayRace(horse,metres,seed,inputs,maxTicks=30000){const race=createRace(horse,metres,seed);let at=0,command={pace:'cruise',lane:0};while(!race.done&&race.tick<maxTicks){while(at<inputs.length&&inputs[at].tick<=race.tick){command={...inputs[at++]};}stepRace(race,command);command.burst=false;}return race;}
