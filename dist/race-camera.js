import * as T from './three.module.js';
const ray=new T.Ray();
export function cameraClear(target,eye,obstacles,padding=.55){const direction=eye.clone().sub(target),length=direction.length();if(length<.01)return false;ray.origin.copy(target);ray.direction.copy(direction.normalize());for(const source of obstacles){const box=source.clone().expandByScalar(padding);if(box.containsPoint(eye))return false;const hit=ray.intersectBox(box,new T.Vector3());if(hit&&hit.distanceTo(target)<length-.1)return false;}return true;}
export function safeRaceCamera(target,desired,forward,obstacles){const side=new T.Vector3(-forward.z,0,forward.x),candidates=[desired.clone(),desired.clone().add(new T.Vector3(0,2.5,0)),target.clone().addScaledVector(forward,-8).addScaledVector(side,4).add(new T.Vector3(0,5,0)),target.clone().addScaledVector(forward,-8).addScaledVector(side,-4).add(new T.Vector3(0,5,0)),target.clone().add(new T.Vector3(0,12,0)).addScaledVector(forward,-5)];for(const candidate of candidates)if(cameraClear(target,candidate,obstacles))return candidate;
 // Rise above nearby trackside structures rather than placing the lens inside them.
 const fallback=target.clone().addScaledVector(forward,-5);fallback.y=Math.max(target.y+14,...obstacles.map(b=>b.max.y+3));return fallback;
}
