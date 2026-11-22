// Shared deterministic movement/collision rules, independent of rendering.
export const SOLIDS=[[104,-18,18,15],[82,21,5,6]];
let homeObstacles=[];
export function setHomeObstacles(obstacles,offsetX=0){homeObstacles=obstacles.map(o=>({x:o.x+offsetX,z:o.z,w:o.w,d:o.d}));}
export function blocked(x,z,r=.5){
 if(x-r< -63||x+r>159||z-r< -48||z+r>48)return true;
 if(Math.abs(x-34)<r+.25&&Math.abs(z)>5.5-r)return true;
 if(homeObstacles.some(o=>Math.abs(x-o.x)<o.w+r&&Math.abs(z-o.z)<o.d+r))return true;
 return SOLIDS.some(([cx,cz,w,d])=>Math.abs(x-cx)<w/2+r&&Math.abs(z-cz)<d/2+r);
}
export function moveBody(body,dx,dz,r=.5){
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.3));
 for(let i=0;i<steps;i++){
  if(!blocked(body.x+dx/steps,body.z,r))body.x+=dx/steps;
  if(!blocked(body.x,body.z+dz/steps,r))body.z+=dz/steps;
 }
}
export function stepVehicle(vehicle,throttle,steer,dt,fuel){
 const target=fuel>0?throttle*(throttle<0?6:15):0;
 vehicle.speed+=(target-vehicle.speed)*Math.min(1,dt*(throttle?1.7:3.8));
 vehicle.heading-=steer*Math.min(1,Math.abs(vehicle.speed)/3)*dt*1.35*Math.sign(vehicle.speed||1);
 const x=vehicle.x,z=vehicle.z;
 moveBody(vehicle,Math.sin(vehicle.heading)*vehicle.speed*dt,Math.cos(vehicle.heading)*vehicle.speed*dt,1.25);
 if(Math.hypot(vehicle.x-x,vehicle.z-z)<Math.abs(vehicle.speed*dt)*.3)vehicle.speed=0;
 return Math.hypot(vehicle.x-x,vehicle.z-z);
}
export function exitPoint(vehicle){
 for(const angle of [Math.PI/2,-Math.PI/2,Math.PI,0]){
  const x=vehicle.x+Math.sin(vehicle.heading+angle)*3.8,z=vehicle.z+Math.cos(vehicle.heading+angle)*3.8;
  if(!blocked(x,z))return {x,z};
 }
 return null;
}
