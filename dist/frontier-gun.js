import * as T from './three.module.js';
// Original fictional game prop. Rounded authored silhouette, separate magazine,
// sights, grips and barrel. No third-party asset or external download.
export function createFrontierGun(parent){
 const root=new T.Group();root.name='Fieldguard 3D carbine';parent.add(root);
 const steel=new T.MeshStandardMaterial({color:'#303a3d',metalness:.65,roughness:.4}),polymer=new T.MeshStandardMaterial({color:'#51594a',roughness:.8}),rubber=new T.MeshStandardMaterial({color:'#1e2524',roughness:.95}),trim=new T.MeshStandardMaterial({color:'#a6ad9f',metalness:.6,roughness:.42});
 function body(points,depth,material){const shape=new T.Shape();points.forEach(([z,y],i)=>i?shape.lineTo(z,y):shape.moveTo(z,y));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,bevelSize:.018,bevelThickness:.018,steps:1});geo.rotateY(-Math.PI/2);geo.translate(depth/2,0,0);const mesh=new T.Mesh(geo,material);root.add(mesh);mesh.castShadow=true;return mesh;}
 body([[-.43,.08],[-.43,-.08],[.24,-.08],[.35,.01],[.24,.1]],.13,steel);
 body([[-.82,.1],[-.82,-.19],[-.65,-.17],[-.42,-.04],[-.42,.07]],.11,polymer);
 body([[-.78,.09],[-.83,.09],[-.83,-.2],[-.78,-.2]],.14,rubber);
 body([[-.27,-.06],[-.36,-.3],[-.24,-.33],[-.14,-.1]],.11,polymer);
 const magazine=body([[-.05,-.06],[-.01,-.34],[.13,-.32],[.1,-.06]],.1,steel);magazine.name='Removable magazine';
 body([[.18,.09],[.18,-.1],[.5,-.08],[.53,.07]],.16,polymer);
 function tube(radius,length,z,y,material){const o=new T.Mesh(new T.CylinderGeometry(radius,radius,length,16),material);o.rotation.x=Math.PI/2;o.position.set(0,y,z);root.add(o);o.castShadow=true;return o;}
 tube(.03,.43,.63,.015,steel);tube(.043,.09,.86,.015,steel);
 for(const z of [-.32,.26,.49]){const sight=new T.Mesh(new T.TorusGeometry(.035,.009,6,16),trim);sight.position.set(0,.16,z);root.add(sight);}
 const muzzle=new T.Object3D();muzzle.position.set(0,.015,.92);root.add(muzzle);
 const flash=new T.Mesh(new T.ConeGeometry(.09,.27,7),new T.MeshBasicMaterial({color:'#ffe2a3',transparent:true,opacity:.95,depthWrite:false}));flash.rotation.x=Math.PI/2;flash.position.set(0,.015,1.02);flash.visible=false;root.add(flash);
 let recoil=0,flashLeft=0;
 return {root,muzzle,magazine,flash,shot(){recoil=1;flashLeft=.065;},update(dt,{aiming=false,reload=0,visible=true}={}){
  root.visible=visible;recoil=Math.max(0,recoil-dt*7);flashLeft=Math.max(0,flashLeft-dt);flash.visible=visible&&flashLeft>0;
  const dip=reload>0?Math.sin(reload*Math.PI):0;
  root.position.set(aiming?.24:.4,aiming?1.68:1.45,aiming?.32:-.3);
  root.rotation.set(aiming?-recoil*.09:-Math.PI/2,0,aiming?-dip*.6:.25);
  root.position.z-=recoil*.055;
  magazine.position.y=-dip*.22;magazine.rotation.z=dip*.2;
 }};
}
// Aim the existing skinned arms at the prop's two grip points. Derive corrections
// from current world-space bone axes, retaining each avatar's native proportions.
export function poseGunArms(rig,anchor,aiming,reload=0){
 if(!rig||!aiming)return;
 anchor.updateMatrixWorld(true);
 for(const [side,grip]of [['R',new T.Vector3(.24,1.5,.25)],['L',new T.Vector3(.24,1.65,.75)]]){
  const upper=rig.model.getObjectByName('UpperArm'+side),lower=rig.model.getObjectByName('LowerArm'+side),wrist=rig.model.getObjectByName('Wrist'+side);
  if(!upper||!lower||!wrist)continue;
  if(side==='L'&&reload>0){grip.y-=Math.sin(reload*Math.PI)*.35;grip.z-=Math.sin(reload*Math.PI)*.25;}
  const target=anchor.localToWorld(grip);
  // Two short CCD passes preserve bone lengths and avoid hard-coded rig rotations.
  for(let pass=0;pass<3;pass++)for(const bone of [lower,upper]){
   anchor.updateMatrixWorld(true);const joint=bone.getWorldPosition(new T.Vector3()),hand=wrist.getWorldPosition(new T.Vector3());
   const from=hand.sub(joint).normalize(),to=target.clone().sub(joint).normalize();
   const correction=new T.Quaternion().setFromUnitVectors(from,to),world=bone.getWorldQuaternion(new T.Quaternion());
   const parent=bone.parent.getWorldQuaternion(new T.Quaternion()).invert();
   bone.quaternion.copy(parent.multiply(correction.multiply(world)));
  }
 }
 anchor.updateMatrixWorld(true);
}
