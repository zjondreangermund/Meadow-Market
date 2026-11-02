import * as T from './three.module.js';
// Original smooth 3D rider: articulated crouch, cloth silks, goggles, reins and stirrups.
const sphere=new T.SphereGeometry(1,24,16),capsule=new T.CapsuleGeometry(1,1,6,12),cylinder=new T.CylinderGeometry(1,1,1,16);
export function createJockey(color,number=1){const root=new T.Group(),body=new T.Group();root.add(body);const cloth=new T.MeshStandardMaterial({color,roughness:.78}),white=new T.MeshStandardMaterial({color:'#f1eadc',roughness:.85}),skin=new T.MeshStandardMaterial({color:'#cfa17f',roughness:.8}),dark=new T.MeshStandardMaterial({color:'#302d3c',roughness:.45}),leather=new T.MeshStandardMaterial({color:'#49342d',roughness:.74});
 function shape(geo,mat,x,y,z,sx,sy,sz,parent=body){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const torso=shape(sphere,cloth,0,2.27,-.03,.255,.36,.18);torso.rotation.x=.63;
 shape(sphere,white,0,2.12,-.21,.24,.18,.2); // seat
 const neck=shape(capsule,skin,0,2.55,.13,.07,.07,.07);neck.rotation.x=.5;
 const head=shape(sphere,skin,0,2.7,.24,.175,.205,.17);shape(sphere,skin,0,2.64,.39,.055,.06,.055);
 const helmet=shape(sphere,cloth,0,2.84,.22,.215,.135,.21);shape(sphere,dark,0,2.785,.4,.21,.035,.13);
 shape(sphere,new T.MeshStandardMaterial({color:'#7b778a',metalness:.2,roughness:.25}),0,2.735,.39,.15,.055,.04);for(const side of [-1,1])shape(sphere,skin,side*.175,2.69,.21,.035,.065,.045);
 function limb(a,b,r,mat){const from=new T.Vector3(...a),to=new T.Vector3(...b),delta=to.clone().sub(from),m=shape(capsule,mat,...from.clone().add(to).multiplyScalar(.5),r,delta.length()/3,r);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;}
 for(const side of [-1,1]){
  limb([side*.16,2.13,-.17],[side*.47,1.81,.24],.11,white);shape(sphere,white,side*.47,1.81,.24,.115,.12,.105);
  limb([side*.47,1.81,.24],[side*.45,1.39,-.02],.075,dark);shape(sphere,dark,side*.45,1.37,.07,.085,.08,.19);
  const stirrup=new T.Mesh(new T.TorusGeometry(.095,.017,7,16),new T.MeshStandardMaterial({color:'#b9ad87',metalness:.65,roughness:.3}));stirrup.position.set(side*.46,1.39,.04);stirrup.rotation.y=Math.PI/2;body.add(stirrup);
  limb([side*.19,2.43,.07],[side*.29,2.24,.39],.078,cloth);shape(sphere,cloth,side*.29,2.24,.39,.08,.085,.08);limb([side*.29,2.24,.39],[side*.19,2.12,.73],.059,cloth);shape(sphere,dark,side*.19,2.12,.73,.06,.06,.09);
  const curve=new T.CatmullRomCurve3([new T.Vector3(side*.19,2.12,.73),new T.Vector3(side*.3,1.96,1.05),new T.Vector3(side*.23,2.05,1.42)]);body.add(new T.Mesh(new T.TubeGeometry(curve,12,.016,5,false),leather));
 }
 const saddle=shape(sphere,leather,0,1.79,-.16,.4,.12,.51,root);
 const clothPatch=shape(sphere,cloth,0,1.72,-.13,.51,.08,.52,root);
 // Curved saddle number panels, painted rather than floating labels.
 for(const side of [-1,1]){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,128,128);ctx.fillStyle='#fff4da';ctx.font='italic 900 86px sans-serif';ctx.textAlign='center';ctx.fillText(String(number),64,99);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const panel=new T.Mesh(new T.PlaneGeometry(.4,.4),new T.MeshStandardMaterial({map:tex,roughness:.9,side:T.DoubleSide}));panel.position.set(side*.49,1.6,-.13);panel.rotation.y=side*Math.PI/2;root.add(panel);}
 const scarf=shape(sphere,white,0,2.51,-.32,.15,.025,.3);scarf.rotation.x=-.2;root.userData.scarf=scarf;
 root.userData.update=(time,gait,lean=0)=>{body.rotation.x=lean;body.position.y=Math.sin(time*14*gait)*.025*(gait?1:0);scarf.rotation.x=-.2+Math.sin(time*12)*.12*(gait?1:.2);};
 return root;
}
