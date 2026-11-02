import * as T from './three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {clone} from './vendor/SkeletonUtils.js';
import {fitRig,matteMaterials,skinBounds} from './model-rig.js';
import {smoothRig} from './smooth-rig.js';
let assetPromise;
const v=(x,y,z)=>new T.Vector3(x,y,z),clamp=T.MathUtils.clamp;
// Retain the authored humanoid topology, face, hands, clothing and skeleton.
// Riding uses two-bone IK, rather than assembling a person from primitives.
export function createJockey(color,number=1){
 const root=new T.Group();root.name='Rigged race jockey '+number;
 const leather=new T.MeshStandardMaterial({color:'#352720',roughness:.74}),metal=new T.MeshStandardMaterial({color:'#a69c84',metalness:.7,roughness:.28});
 function prop(geo,mat,x,y,z,sx=1,sy=1,sz=1){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;root.add(m);return m;}
 // Saddle and thin draped cloth, not oversized cushions.
 const saddle=prop(new T.SphereGeometry(1,24,12),leather,0,1.78,-.15,.34,.055,.48);
 const clothMat=new T.MeshStandardMaterial({color,roughness:.9,side:T.DoubleSide});
 const clothGeo=new T.PlaneGeometry(.98,.92,12,8);const cp=clothGeo.attributes.position;for(let i=0;i<cp.count;i++){const x=cp.getX(i),z=cp.getY(i);cp.setXYZ(i,x,1.76-Math.pow(Math.abs(x)/.49,2)*.3,z-.13);}clothGeo.computeVertexNormals();const cloth=new T.Mesh(clothGeo,clothMat);root.add(cloth);
 for(const side of [-1,1]){const stirrup=prop(new T.TorusGeometry(.08,.014,7,16),metal,side*.45,1.35,.035);stirrup.rotation.y=Math.PI/2;}
 const reins=[];for(let i=0;i<2;i++){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(25*3),3));const line=new T.Line(geo,new T.LineBasicMaterial({color:'#241d1b'}));line.frustumCulled=false;root.add(line);reins.push(line);}
 root.userData.update=()=>{};root.userData.scarf=true;
 const ready=(assetPromise??=new GLTFLoader().loadAsync('./models/farmer.glb')).then(asset=>{
  const model=clone(asset.scene);smoothRig(model);fitRig(model,2.25);matteMaterials(model,{roughness:.78});root.add(model);root.userData.model=model;
  model.traverse(o=>{if(!o.isMesh)return;if(o.name==='Farmer_Head_2')o.visible=false;const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms){if(/Farmer_Pants/.test(o.name))m.color.set('#e4e1d7');else if(/Farmer_Feet/.test(o.name))m.color.set('#252329');else if(/Farmer_Body/.test(o.name)&&m.name!=='Skin')m.color.set(m.name==='Beige'?'#ece3d0':color);}});
  const bones={};model.traverse(o=>{if(o.isBone)bones[o.name]=o;});
  const saved=Object.values(bones).map(b=>({b,q:b.quaternion.clone(),p:b.position.clone()}));
  root.updateMatrixWorld(true);const hips=bones.Hips||bones.Body;
  const hp=root.worldToLocal(hips.getWorldPosition(new T.Vector3()));model.position.add(v(0,1.99,-.12).sub(hp));root.updateMatrixWorld(true);
  // The helmet follows the actual head bone; hide only the original straw hat.
  const head=bones.Head,headPoint=root.worldToLocal(head.getWorldPosition(new T.Vector3()));
  const helmet=prop(new T.SphereGeometry(1,28,16,0,Math.PI*2,0,Math.PI*.55),clothMat,headPoint.x,headPoint.y+.31,headPoint.z,.235,.21,.24);
  const brim=prop(new T.SphereGeometry(1,20,8),leather,headPoint.x,headPoint.y+.30,headPoint.z+.17,.235,.022,.2);
  root.updateMatrixWorld(true);head.attach(helmet);head.attach(brim);
  const goggles=prop(new T.SphereGeometry(1,16,8),new T.MeshStandardMaterial({color:'#716759',roughness:.28,metalness:.25}),headPoint.x,headPoint.y+.15,headPoint.z+.22,.15,.052,.038);root.updateMatrixWorld(true);head.attach(goggles);
  function worldQ(b,desired){const parentQ=b.parent.getWorldQuaternion(new T.Quaternion()).invert();b.quaternion.copy(parentQ.multiply(desired));b.updateWorldMatrix(false,true);}
  function rotateWorld(b,axis,angle){if(!b)return;const q=new T.Quaternion().setFromAxisAngle(axis,angle).multiply(b.getWorldQuaternion(new T.Quaternion()));worldQ(b,q);}
  function aim(b,child,target){const a=b.getWorldPosition(new T.Vector3()),from=child.getWorldPosition(new T.Vector3()).sub(a),to=target.clone().sub(a);if(from.lengthSq()<1e-10||to.lengthSq()<1e-10)return;const delta=new T.Quaternion().setFromUnitVectors(from.normalize(),to.normalize());worldQ(b,delta.multiply(b.getWorldQuaternion(new T.Quaternion())));}
  function solve(upper,lower,end,target,hint){if(!upper||!lower||!end)return;const a=upper.getWorldPosition(new T.Vector3()),b=lower.getWorldPosition(new T.Vector3()),e=end.getWorldPosition(new T.Vector3()),l1=a.distanceTo(b),l2=b.distanceTo(e),axis=target.clone().sub(a),distance=clamp(axis.length(),Math.abs(l1-l2)+.001,l1+l2-.001);axis.normalize();const pole=hint.clone().sub(a);pole.addScaledVector(axis,-pole.dot(axis)).normalize();const c=clamp((l1*l1+distance*distance-l2*l2)/(2*l1*distance),-1,1),joint=a.clone().addScaledVector(axis,l1*c).addScaledVector(pole,l1*Math.sqrt(1-c*c));aim(upper,lower,joint);aim(lower,end,target);}
  const point=p=>root.localToWorld(p.clone());
  root.userData.update=(time,gait,control={})=>{
   const steer=clamp(typeof control==='number'?control:control.steer||0,-1,1),bank=typeof control==='number'?0:control.bank||0;
   for(const s of saved){s.b.quaternion.copy(s.q);s.b.position.copy(s.p);}
   root.updateMatrixWorld(true);const rootQ=root.getWorldQuaternion(new T.Quaternion()),axisX=v(1,0,0).applyQuaternion(rootQ),axisY=v(0,1,0).applyQuaternion(rootQ),axisZ=v(0,0,1).applyQuaternion(rootQ);
   rotateWorld(bones.Torso,axisX,gait?.64:.43);rotateWorld(bones.Chest,axisZ,-bank*.7-steer*.035);rotateWorld(bones.Head,axisX,-.2);rotateWorld(bones.Head,axisY,-steer*.15);
   const hands=[];
   for(const [side,suffix]of [[1,'L'],[-1,'R']]){
    // Inside hand shortens its rein; outside hand releases and guides the neck.
    const inside=side*steer>0,hand=v(side*.28-(steer*.03),2.30+(inside?.025:-.015),.55-(inside?Math.abs(steer)*.25:-Math.abs(steer)*.05));
    solve(bones['UpperArm'+suffix],bones['LowerArm'+suffix],bones['Wrist'+suffix],point(hand),point(v(side*.53,2.3,.22)));hands[side<0?0:1]=root.worldToLocal(bones['Wrist'+suffix].getWorldPosition(new T.Vector3()));
    const foot=v(side*.45,1.38,.04),end=bones['LowerLeg'+suffix]?.children.find(x=>x.name.endsWith('_end'))||bones['Foot'+suffix];
    solve(bones['UpperLeg'+suffix],bones['LowerLeg'+suffix],end,point(foot),point(v(side*.53,1.84,.36)));
    const f=bones['Foot'+suffix];if(f){f.position.copy(f.parent.worldToLocal(point(foot)));f.updateWorldMatrix(false,true);}
   }
   root.userData.hands=hands;root.userData.steer=steer;
   const bit=control.bitPosition?.clone()||v(steer*.10,2.04,1.45);
   for(let j=0;j<2;j++){const end=bit.clone();end.x+=(j?1:-1)*.14;const start=hands[j],mid=start.clone().lerp(end,.5);mid.y-=.10+(j*2-1)*steer*.035;const c=new T.QuadraticBezierCurve3(start,mid,end),p=reins[j].geometry.attributes.position;for(let k=0;k<25;k++){const v=c.getPoint(k/24);p.setXYZ(k,v.x,v.y,v.z);}p.needsUpdate=true;}
   model.updateMatrixWorld(true);
  };
  root.userData.update(0,0,{});const b=skinBounds(model);if(b.max.y-b.min.y<1)throw Error('Invalid posed jockey bounds.');return true;
 });
 root.userData.ready=ready;return root;
}
