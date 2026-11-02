import * as T from './three.module.js';
export const angleDelta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
// Heading includes the lateral component of an eased lane change, not just the oval tangent.
export function racingPose(sample,h,previous,dt){const u=h.distance/400,s=sample(u,h.lane),ahead=sample(u+.001,h.lane),baseYaw=Math.atan2(s.dir.x,s.dir.z),nextYaw=Math.atan2(ahead.dir.x,ahead.dir.z),curvature=angleDelta(nextYaw,baseYaw)/Math.max(.01,ahead.p.distanceTo(s.p));
 const worldSpeed=Math.max(.01,h.velocity*.97),lateral=(h.laneVelocity||0)*2.05,forward=s.dir.clone().multiplyScalar(worldSpeed).addScaledVector(s.normal,lateral).normalize(),desiredYaw=Math.atan2(forward.x,forward.z),oldYaw=previous?.yaw??desiredYaw,yaw=oldYaw+angleDelta(desiredYaw,oldYaw)*(1-Math.exp(-Math.max(dt,.001)*12)),yawRate=previous?angleDelta(yaw,oldYaw)/Math.max(dt,.001):curvature*worldSpeed;
 const steer=T.MathUtils.clamp(yawRate*.8-(h.targetLane-h.lane)*.45,-1,1),bankGoal=-T.MathUtils.clamp(Math.atan(worldSpeed*yawRate/9.81)*.48,-.22,.22),bank=T.MathUtils.lerp(previous?.bank||0,bankGoal,1-Math.exp(-dt*6));
 return {position:s.p,yaw,bank,steer,forward};}
