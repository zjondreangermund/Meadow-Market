import * as T from './three.module.js';

// Animate the original authored-in-scene chicken parts without deforming or
// flattening static replacement geometry. Each bird owns its own pivots.
export function animateNativeHen(root,legs=[]){
 if(root.userData.nativeHenAnimate)return root.userData.nativeHenAnimate;
 root.updateMatrixWorld(true);
 const parts=[...root.children];
 const head=new T.Group();head.name='NativeHenHead';head.position.set(0,1.5,.55);root.add(head);
 const wings=[-1,1].map(side=>{const wing=new T.Group();wing.name=side<0?'NativeHenWingL':'NativeHenWingR';wing.position.set(side*.42,1,-.1);root.add(wing);return wing;});
 root.updateMatrixWorld(true);
 for(const part of parts){
  if(part.position.z>.4&&part.position.y>1.35)head.attach(part);
  else if(Math.abs(part.position.x)>.35&&part.position.y>.7)wings[part.position.x<0?0:1].attach(part);
 }
 let time=0;
 const animate=(dt,moving=false,eating=false)=>{
  time+=dt;
  head.rotation.x=eating?.18+Math.sin(time*7)*.2:Math.sin(time*1.8)*.035;
  for(let i=0;i<legs.length;i++)legs[i].rotation.x=moving?Math.sin(time*10+(i?Math.PI:0))*.42:0;
  wings[0].rotation.z=Math.sin(time*(moving?6:1.5))*(moving?.08:.025);
  wings[1].rotation.z=-wings[0].rotation.z;
 };
 root.userData.nativeHenAnimate=animate;return animate;
}
