import * as T from './three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {clone} from './vendor/SkeletonUtils.js';
import {fitRig,matteMaterials,skinBounds} from './model-rig.js';
import {smoothRig} from './smooth-rig.js';
import {detailTexture} from './race-day.js';
import {mountedMotion} from './mounted-motion.js';
import {applyRaceSilks} from './garment-materials.js';
import {prepareHumanSurfaces} from './human-surfaces.js';
import {riderLook,athleticBuild} from './rider-appearance.js?v=track8';
const humanAssets=new Map();
const v=(x,y,z)=>new T.Vector3(x,y,z),clamp=T.MathUtils.clamp;
// Retain the authored humanoid topology, face, hands, clothing and skeleton.
// Riding uses two-bone IK, rather than assembling a person from primitives.
export function createJockey(color,number=1,variant='man',lookNumber=number){
 const root=new T.Group();root.name='Rigged race jockey '+number;
 const leather=new T.MeshStandardMaterial({color:'#352720',roughness:.74}),metal=new T.MeshStandardMaterial({color:'#a69c84',metalness:.7,roughness:.28});
 function prop(geo,mat,x,y,z,sx=1,sy=1,sz=1){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;root.add(m);return m;}
 // Saddle and thin draped cloth, not oversized cushions.
 const saddle=prop(new T.SphereGeometry(1,24,12),leather,0,1.78,-.15,.34,.055,.48);
 const clothMat=new T.MeshStandardMaterial({color,roughness:.48,bumpMap:detailTexture('silk'),bumpScale:.012,side:T.DoubleSide});
 const clothGeo=new T.PlaneGeometry(.98,.92,12,8);const cp=clothGeo.attributes.position;for(let i=0;i<cp.count;i++){const x=cp.getX(i),z=cp.getY(i);cp.setXYZ(i,x,1.76-Math.pow(Math.abs(x)/.49,2)*.3,z-.13);}clothGeo.computeVertexNormals();const cloth=new T.Mesh(clothGeo,clothMat);root.add(cloth);
 for(const side of [-1,1]){const stirrup=prop(new T.TorusGeometry(.08,.014,7,16),metal,side*.45,1.35,.035);stirrup.rotation.y=Math.PI/2;}
 const labelCanvas=document.createElement('canvas');labelCanvas.width=labelCanvas.height=512;const lc=labelCanvas.getContext('2d');lc.fillStyle=color;lc.fillRect(0,0,512,512);lc.fillStyle='#fff6dc';lc.font='bold 330px serif';lc.textAlign='center';lc.fillText(String(number),256,365);const labelTex=new T.CanvasTexture(labelCanvas);labelTex.colorSpace=T.SRGBColorSpace;const labelMat=new T.MeshStandardMaterial({map:labelTex,roughness:.65,side:T.DoubleSide});for(const side of [-1,1]){const m=prop(new T.PlaneGeometry(.44,.4),labelMat,side*.49,1.56,-.12);m.rotation.y=side*Math.PI/2;}
 const reins=[];for(let i=0;i<2;i++){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(25*3),3));const line=new T.Line(geo,new T.LineBasicMaterial({color:'#241d1b'}));line.frustumCulled=false;root.add(line);reins.push(line);}
 root.userData.update=()=>{};root.userData.scarf=true;root.userData.onFoot=false;root.userData.setOnFoot=value=>{root.userData.onFoot=!!value;for(const child of root.children)if(child!==root.userData.model)child.visible=!value;};
 const file=variant==='lady'?'farmer-woman.glb':'farmer.glb';
  if(!humanAssets.has(file))humanAssets.set(file,new GLTFLoader().loadAsync('./models/'+file).catch(e=>{humanAssets.delete(file);throw e;}));
  const ready=humanAssets.get(file).then(asset=>{
  const model=clone(asset.scene);smoothRig(model);fitRig(model,2.25);matteMaterials(model,{roughness:.68});prepareHumanSurfaces(model);const appearance=riderLook(lookNumber);athleticBuild(model,appearance.build);root.add(model);root.userData.model=model;
  model.traverse(o=>{if(!o.isMesh)return;if(/Head/i.test(o.name)&&/^(Beige|Hair_Blond)$/i.test(o.material?.name||''))o.visible=false;const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms){if(/^Skin$/i.test(m.name))m.color.set(appearance.skin);if(/Hair|Eyebrows/i.test(m.name))m.color.set(appearance.hair);if(/Farmer_Pants|Woman_Pants|Pants|Trousers|Casual_Legs/i.test(o.name))m.color.set('#e4e1d7');else if(/Farmer_Feet|Woman_Feet|Feet|Boots|Casual_Feet/i.test(o.name))m.color.set('#252329');else if(/Farmer_Body|Woman_Body|Torso|Shirt|Jacket|Casual_Body/i.test(o.name)&&m.name!=='Skin'){m.color.set(m.name==='Beige'?'#ece3d0':color);if(m.name!=='Beige'){m.userData.teamSilk=true;m.roughness=.43;m.bumpMap=detailTexture('silk');m.bumpScale=.008;}}}});applyRaceSilks(model,clothMat,color,number);
  const bones={};model.traverse(o=>{if(o.isBone)bones[o.name]=o;});
  const standingBase=model.position.clone(),walkMixer=new T.AnimationMixer(model);const walkClip=asset.animations.find(a=>/walk$/i.test(a.name));const walkAction=walkClip?walkMixer.clipAction(walkClip.clone()):null;if(walkAction)walkAction.getClip().tracks=walkAction.getClip().tracks.filter(t=>!/^Root\.position$/.test(t.name));let modelBase;
  const saved=Object.values(bones).map(b=>({b,q:b.quaternion.clone(),p:b.position.clone()}));
  root.updateMatrixWorld(true);const hips=bones.Hips||bones.Body;
  const hp=root.worldToLocal(hips.getWorldPosition(new T.Vector3()));model.position.add(v(0,1.99,-.12).sub(hp));modelBase=model.position.clone();root.updateMatrixWorld(true);
  // The helmet follows the actual head bone; hide only the original straw hat.
  const head=bones.Head,headPoint=root.worldToLocal(head.getWorldPosition(new T.Vector3()));
  // Fit to the exposed face rather than placing a large dome above the head.
  const faceBox=new T.Box3(),vertex=new T.Vector3();
  model.traverse(o=>{if(!o.isSkinnedMesh||!/Head/i.test(o.name)||o.material?.name!=='Skin')return;o.skeleton.update();for(let i=0;i<o.geometry.attributes.position.count;i++){o.getVertexPosition(i,vertex).applyMatrix4(o.matrixWorld);faceBox.expandByPoint(root.worldToLocal(vertex));}});
  const face=faceBox.isEmpty()?new T.Box3(headPoint.clone().add(v(-.12,-.05,-.10)),headPoint.clone().add(v(.12,.24,.17))):faceBox;
  const extent=face.getSize(new T.Vector3()),center=face.getCenter(new T.Vector3());
  const rimY=face.max.y-.065,rx=extent.x*.68,rz=extent.z*.68;
  const helmet=prop(new T.SphereGeometry(1,20,10,0,Math.PI*2,0,Math.PI/2),clothMat,center.x,rimY,center.z,rx,.16,rz);helmet.name='Fitted racing helmet';
  const brim=prop(new T.SphereGeometry(1,16,6),leather,center.x,rimY-.008,face.max.z-.005,rx,.012,.10);brim.name='Racing helmet brim';
  root.updateMatrixWorld(true);head.attach(helmet);head.attach(brim);
  // Small translucent goggles leave the nose and face visible.
  const lensMat=new T.MeshStandardMaterial({color:'#a1b5ba',transparent:true,opacity:.32,roughness:.2,metalness:0});
  for(const side of [-1,1]){const lens=prop(new T.SphereGeometry(1,12,6),lensMat,headPoint.x+side*.052,headPoint.y+.125,face.max.z+.006,.048,.030,.014);lens.name='Racing goggle lens';root.updateMatrixWorld(true);head.attach(lens);}
  root.userData.helmet=helmet;root.userData.faceBounds=face;root.userData.appearance={...appearance,variant,number};
  function worldQ(b,desired){const parentQ=b.parent.getWorldQuaternion(new T.Quaternion()).invert();b.quaternion.copy(parentQ.multiply(desired));b.updateWorldMatrix(false,true);}
  function rotateWorld(b,axis,angle){if(!b)return;const q=new T.Quaternion().setFromAxisAngle(axis,angle).multiply(b.getWorldQuaternion(new T.Quaternion()));worldQ(b,q);}
  function aim(b,child,target){const a=b.getWorldPosition(new T.Vector3()),from=child.getWorldPosition(new T.Vector3()).sub(a),to=target.clone().sub(a);if(from.lengthSq()<1e-10||to.lengthSq()<1e-10)return;const delta=new T.Quaternion().setFromUnitVectors(from.normalize(),to.normalize());worldQ(b,delta.multiply(b.getWorldQuaternion(new T.Quaternion())));}
  function solve(upper,lower,end,target,hint){if(!upper||!lower||!end)return;const a=upper.getWorldPosition(new T.Vector3()),b=lower.getWorldPosition(new T.Vector3()),e=end.getWorldPosition(new T.Vector3()),l1=a.distanceTo(b),l2=b.distanceTo(e),axis=target.clone().sub(a),distance=clamp(axis.length(),Math.abs(l1-l2)+.001,l1+l2-.001);axis.normalize();const pole=hint.clone().sub(a);pole.addScaledVector(axis,-pole.dot(axis)).normalize();const c=clamp((l1*l1+distance*distance-l2*l2)/(2*l1*distance),-1,1),joint=a.clone().addScaledVector(axis,l1*c).addScaledVector(pole,l1*Math.sqrt(1-c*c));aim(upper,lower,joint);aim(lower,end,target);}
  const point=p=>root.localToWorld(p.clone());
  let motionBlend=0;
  root.userData.update=(time,gait,control={})=>{
   if(root.userData.onFoot){for(const s of saved){s.b.quaternion.copy(s.q);s.b.position.copy(s.p);}model.position.copy(standingBase);if(walkAction&&!walkAction.isRunning())walkAction.reset().play();walkMixer.update(control.delta??.016);root.updateMatrixWorld(true);solve(bones.UpperArmR,bones.LowerArmR,bones.WristR,point(v(-.28,1.12,.42)),point(v(-.48,1.35,.10)));const hand=bones.WristR;if(hand)root.userData.leadHand=hand.getWorldPosition(new T.Vector3());model.updateMatrixWorld(true);return;}if(walkAction?.isRunning())walkAction.stop();
   const steer=clamp(typeof control==='number'?control:control.steer||0,-1,1),bank=typeof control==='number'?0:control.bank||0;
   motionBlend=T.MathUtils.lerp(motionBlend,gait>.05?1:0,1-Math.exp(-(control.delta??1)*12));const cycle=mountedMotion(control.phase||0,control.effort??.5,true),rest=mountedMotion(0,.5,false);for(const key of Object.keys(cycle))cycle[key]=T.MathUtils.lerp(rest[key],cycle[key],motionBlend);model.position.copy(modelBase);model.position.y+=cycle.hip;
   for(const s of saved){s.b.quaternion.copy(s.q);s.b.position.copy(s.p);}
   root.updateMatrixWorld(true);const rootQ=root.getWorldQuaternion(new T.Quaternion()),axisX=v(1,0,0).applyQuaternion(rootQ),axisY=v(0,1,0).applyQuaternion(rootQ),axisZ=v(0,0,1).applyQuaternion(rootQ);
   rotateWorld(bones.Body,axisX,cycle.body);rotateWorld(bones.Torso,axisX,cycle.spine);rotateWorld(bones.Chest,axisZ,-bank*.7-steer*.035);rotateWorld(bones.Neck,axisX,cycle.head*.35);rotateWorld(bones.Head,axisX,cycle.head*.65);rotateWorld(bones.Head,axisY,-steer*.15);
   const hands=[];
   for(const [side,suffix]of [[1,'L'],[-1,'R']]){
    // Inside hand shortens its rein; outside hand releases and guides the neck.
    const inside=side*steer>0,hand=v(side*.28-(steer*.03),2.24+cycle.handY+(inside?.025:-.015),.73+cycle.handZ-(inside?Math.abs(steer)*.20:-Math.abs(steer)*.04));
    solve(bones['UpperArm'+suffix],bones['LowerArm'+suffix],bones['Wrist'+suffix],point(hand),point(v(side*.48,2.24+cycle.handY,.42)));hands[side<0?0:1]=root.worldToLocal(bones['Wrist'+suffix].getWorldPosition(new T.Vector3()));
    const foot=v(side*.45,1.38,.04),end=bones['LowerLeg'+suffix]?.children.find(x=>x.name.endsWith('_end'))||bones['Foot'+suffix];
    solve(bones['UpperLeg'+suffix],bones['LowerLeg'+suffix],end,point(foot),point(v(side*.53,1.84,.36)));
    const f=bones['Foot'+suffix];if(f){f.position.copy(f.parent.worldToLocal(point(foot)));f.updateWorldMatrix(false,true);}
   }
   root.userData.cycle=cycle;root.userData.hands=hands;root.userData.steer=steer;
   const bit=control.bitPosition?.clone()||v(steer*.10,2.04,1.45);
   for(let j=0;j<2;j++){const end=bit.clone();end.x+=(j?1:-1)*.14;const start=hands[j],mid=start.clone().lerp(end,.5);mid.y-=.10+(j*2-1)*steer*.035;const c=new T.QuadraticBezierCurve3(start,mid,end),p=reins[j].geometry.attributes.position;for(let k=0;k<25;k++){const v=c.getPoint(k/24);p.setXYZ(k,v.x,v.y,v.z);}p.needsUpdate=true;}
   model.updateMatrixWorld(true);
  };
  root.userData.setSilks=shade=>applyRaceSilks(model,clothMat,shade,number);
  root.userData.update(0,0,{});const b=skinBounds(model);if(b.max.y-b.min.y<1)throw Error('Invalid posed jockey bounds.');return true;
 });
 root.userData.avatarVariant=variant;root.userData.lookNumber=lookNumber;root.userData.ready=ready;return root;
}
