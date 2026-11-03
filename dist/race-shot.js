import * as T from './three.module.js';
// Manual camera definitions are shared by parade, starting gates and racing.
export function raceShot(mode,position,forward,normal){
 const look=position.clone().add(new T.Vector3(0,1.7,0)),eye=position.clone();
 if(mode==='Rail')eye.addScaledVector(normal,8.5).addScaledVector(forward,1.5).add(new T.Vector3(0,3,0));
 else if(mode==='Broadcast')eye.addScaledVector(normal,23).addScaledVector(forward,-13).add(new T.Vector3(0,18,0));
 else eye.addScaledVector(forward,-8).addScaledVector(normal,3).add(new T.Vector3(0,3.7,0));
 return {eye,look};
}
export function readableSign(geometry,material){
 const group=new T.Group();group.name='Readable two-sided sign';
 const front=new T.Mesh(geometry,material),back=new T.Mesh(geometry,material);front.position.z=.008;back.position.z=-.008;back.rotation.y=Math.PI;group.add(front,back);return group;
}
export function contactShadowTexture(){
 const size=64,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const r=Math.hypot((x-size/2)/(size/2),(y-size/2)/(size/2)),i=(y*size+x)*4;data[i+3]=Math.round(Math.max(0,1-r)**2*125);}
 const texture=new T.DataTexture(data,size,size,T.RGBAFormat);texture.magFilter=T.LinearFilter;texture.needsUpdate=true;return texture;
}
