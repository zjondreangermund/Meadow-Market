import {zoneAt} from './frontier-zones.js';
// Local PvE prototype only; this is not an online combat security boundary.
export const CARBINE=Object.freeze({name:'Fieldguard',magazine:12,reserveMax:96,damage:34,interval:.24,reloadSeconds:1.8,range:75});
export function freshWeapon(){return {magazine:12,reserve:48,cooldown:0,reloadLeft:0};}
export function restoreWeapon(data){
 const int=(v,def,max)=>Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):def;
 return {magazine:int(data?.magazine,12,CARBINE.magazine),reserve:int(data?.reserve,48,CARBINE.reserveMax),cooldown:0,reloadLeft:0};
}
export function tickWeapon(weapon,seconds){
 const dt=Number.isFinite(seconds)?Math.max(0,Math.min(seconds,.1)):0;
 weapon.cooldown=Math.max(0,weapon.cooldown-dt);
 if(weapon.reloadLeft<=0)return false;
 weapon.reloadLeft=Math.max(0,weapon.reloadLeft-dt);
 if(weapon.reloadLeft>1e-8)return false;
 weapon.reloadLeft=0;
 const transfer=Math.min(CARBINE.magazine-weapon.magazine,weapon.reserve);
 weapon.magazine+=transfer;weapon.reserve-=transfer;
 return true;
}
export function startReload(state){
 const w=state.weapon;
 if(state.riding||state.health<=0)return {ok:false,message:'Reload on foot'};
 if(w.reloadLeft>0)return {ok:false,message:'Already reloading'};
 if(w.magazine===CARBINE.magazine)return {ok:false,message:'Magazine is full'};
 if(w.reserve<=0)return {ok:false,message:'No spare ammo. Resupply at the farm exchange.'};
 w.reloadLeft=CARBINE.reloadSeconds;return {ok:true,message:'Reloading…'};
}
export function buyAmmo(state){
 if(zoneAt(state.x)!=='safe')return {ok:false,message:'Buy ammo at the farm exchange'};
 if(state.weapon.reserve>CARBINE.reserveMax-24)return {ok:false,message:'Reserve capacity reached'};
 if(state.coins<12)return {ok:false,message:'Not enough farm coins'};
 state.coins-=12;state.weapon.reserve+=24;return {ok:true,message:'Purchased 24 rounds with test coins'};
}
// Geometric sphere hitboxes keep hit tests independent of rig animation and frame rate.
// Returns the first target or obstruction, rather than a target behind a wall.
export function traceShot(origin,direction,targets,wallDistance=Infinity){
 const length=Math.hypot(direction.x,direction.y,direction.z);
 if(!Number.isFinite(length)||length<1e-8)return null;
 const d={x:direction.x/length,y:direction.y/length,z:direction.z/length};
 let best=null,limit=Math.min(CARBINE.range,wallDistance);
 for(const target of targets){
  if(target.health<=0||zoneAt(target.x)==='safe')continue;
  const x=target.x-origin.x,y=(target.y??1.45)-origin.y,z=target.z-origin.z;
  const projection=x*d.x+y*d.y+z*d.z,r=target.radius??.8;
  const perpendicular=x*x+y*y+z*z-projection*projection;
  if(perpendicular>r*r)continue;
  const half=Math.sqrt(Math.max(0,r*r-perpendicular)),entry=Math.max(0,projection-half);
  if(projection+half<0||entry>=limit)continue;
  limit=entry;best={target,distance:entry};
 }
 return best;
}
export function fireWeapon(state,origin,direction,targets,wallDistance=Infinity){
 const w=state.weapon;
 if(zoneAt(state.x)==='safe')return {ok:false,message:'Protected farm: weapons are safe'};
 if(state.riding||state.health<=0)return {ok:false,message:'Shoot on foot'};
 if(w.reloadLeft>0)return {ok:false,message:'Reloading…'};
 if(w.cooldown>1e-8)return {ok:false,message:'',cooldown:true};
 if(w.magazine<=0)return {ok:false,message:'Magazine empty. Reload.'};
 const length=Math.hypot(direction.x,direction.y,direction.z);
 if(!Number.isFinite(length)||length<1e-8)return {ok:false,message:'No aim direction'};
 w.magazine--;w.cooldown=CARBINE.interval;
 const hit=traceShot(origin,direction,targets,wallDistance);
 if(hit){hit.target.health=Math.max(0,hit.target.health-CARBINE.damage);if(hit.target.health===0)hit.target.respawnLeft=45;}
 return {ok:true,hit:hit?.target||null,distance:hit?.distance??Math.min(CARBINE.range,wallDistance),message:hit?(hit.target.health===0?'Scout down':'Hit · '+hit.target.health+' health'):''};
}
