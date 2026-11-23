import {zoneAt} from './frontier-zones.js';
// Mobile adaptation of Afterfall's documented flat-ground predator behaviour.
// All damage remains local PvE until an authoritative multiplayer server exists.
export function createLeaper(id,x,z){return {id,x,z,y:1.2,spawnX:x,spawnZ:z,health:100,respawnLeft:0,mode:'scan',timer:0,phase:id.length,jumpHeight:0,lastThreat:null,heading:0};}
export function hearLeaperShot(a,position){
 if(a.health<=0||Math.hypot(a.x-position.x,a.z-position.z)>45)return;
 a.lastThreat={x:position.x,z:position.z};
 if(a.mode==='scan'){a.mode='alert';a.timer=.9;}
}
export function stepLeaper(a,seconds,player,{move,canSee=()=>true}={}){
 const dt=Math.max(0,Math.min(.1,seconds));a.phase+=dt;
 if(a.health<=0){a.mode='down';a.respawnLeft=Math.max(0,a.respawnLeft-dt);a.jumpHeight=0;a.y=1.2;
  if(a.respawnLeft===0){a.health=100;a.x=a.spawnX;a.z=a.spawnZ;a.mode='scan';a.lastThreat=null;a.timer=0;}return {damage:0};}
 const safe=zoneAt(player.x)==='safe',distance=Math.hypot(player.x-a.x,player.z-a.z);
 const visible=!safe&&!player.riding&&distance<23&&canSee(a,player);
 const turn=(goal)=>{a.heading=Math.atan2(goal.x-a.x,goal.z-a.z);};
 const walk=(goal,speed)=>{const dx=goal.x-a.x,dz=goal.z-a.z,d=Math.hypot(dx,dz);if(d>.2){turn(goal);move(a,dx/d*Math.min(d,speed*dt),dz/d*Math.min(d,speed*dt));}};
 if(safe&&a.mode!=='pounce'){a.mode='scan';a.timer=0;a.lastThreat=null;}
 if(a.mode==='scan'){
  walk({x:a.spawnX+Math.sin(a.phase*.22)*3,z:a.spawnZ+Math.cos(a.phase*.22)*3},1.2);
  if(visible&&(distance<7||player.moving)){a.mode='alert';a.timer=.9;a.lastThreat={x:player.x,z:player.z};}
 }else if(a.mode==='alert'){
  if(a.lastThreat)turn(a.lastThreat);a.timer-=dt;
  if(visible){a.lastThreat={x:player.x,z:player.z};if(a.timer<=0){a.mode='attack';a.timer=6;}}
  else if(a.timer<=0){a.mode='investigate';a.timer=6;}
 }else if(a.mode==='investigate'){
  a.timer-=dt;if(a.lastThreat)walk(a.lastThreat,1.7);
  if(visible){a.mode='alert';a.timer=.6;a.lastThreat={x:player.x,z:player.z};}
  else if(a.timer<=0){a.mode='scan';a.lastThreat=null;}
 }else if(a.mode==='attack'){
  if(visible){a.lastThreat={x:player.x,z:player.z};a.timer=6;}
  else a.timer-=dt;
  if(a.timer<=0){a.mode='investigate';a.timer=4;}
  else if(visible&&distance>=3&&distance<=11){a.mode='compress';a.timer=.8;a.landing={x:player.x,z:player.z};}
  else if(a.lastThreat)walk(a.lastThreat,3.6);
 }else if(a.mode==='compress'){
  a.timer-=dt;if(a.landing)turn(a.landing);
  if(a.timer<=0){a.mode='pounce';a.timer=.65;a.launch={x:a.x,z:a.z};}
 }else if(a.mode==='pounce'){
  a.timer=Math.max(0,a.timer-dt);const t=1-a.timer/.65;
  const x=a.launch.x+(a.landing.x-a.launch.x)*t,z=a.launch.z+(a.landing.z-a.launch.z)*t;
  move(a,x-a.x,z-a.z);a.jumpHeight=Math.sin(t*Math.PI)*2;a.y=1.2+a.jumpHeight;
  if(a.timer===0){a.jumpHeight=0;a.y=1.2;a.mode='recover';a.timer=1.4;
   return {damage:!safe&&!player.riding&&Math.hypot(player.x-a.x,player.z-a.z)<2.4?22:0};}
 }else if(a.mode==='recover'){
  a.timer-=dt;if(a.timer<=0){a.mode=visible?'attack':'investigate';a.timer=4;}
 }
 // This is a protected farm boundary even during committed jumps.
 if(a.x<34.8)a.x=34.8;
 return {damage:0};
}
