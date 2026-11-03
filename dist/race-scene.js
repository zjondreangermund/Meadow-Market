import * as T from './three.module.js';
import {runout,paradePosition,detailTexture,addRaceDayVenue} from './race-day.js?v=world8';
import {fitRig,skinBounds} from './model-rig.js';
import {smoothRig} from './smooth-rig.js';
import {createJockey} from './jockey.js?v=world8';
import {racingPose} from './race-motion.js';
import {safeRaceCamera,cameraClear} from './race-camera.js?v=world8';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {clone} from './vendor/SkeletonUtils.js';
import {applyAnimalCoat,horseCoatId} from './coat-variants.js?v=visual5fix1';
import {enhanceAnimalRig} from './hd-animal-pack.js?v=visual5fix1';
export const SILKS=['#f4bd67','#90cbb3','#c5b1ef','#e48779','#7eb8e0','#eee0aa'];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=innerWidth<750;
export function createRaceScene(container){
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;container.append(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color('#adc7cb');scene.fog=new T.Fog('#c4d3d0',240,480);
 const camera=new T.PerspectiveCamera(48,innerWidth/innerHeight,.1,650);camera.position.set(110,60,120);
 const ambient=new T.HemisphereLight('#d9efff','#536545',1.45);scene.add(ambient);const sun=new T.DirectionalLight('#ffe0b4',2.7);sun.position.set(-70,110,65);sun.castShadow=true;sun.shadow.normalBias=.025;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-32,right:32,top:32,bottom:-32,near:1,far:160});sun.shadow.bias=-.0007;scene.add(sun,sun.target);const rim=new T.DirectionalLight('#9dc8f1',.9);rim.position.set(65,35,-70);scene.add(rim);
 const coatDetail=detailTexture('coat',1024),silkDetail=detailTexture('silk',512);coatDetail.repeat.set(3,3);const maxAnisotropy=renderer.capabilities?.getMaxAnisotropy?.()||4;coatDetail.anisotropy=Math.min(8,maxAnisotropy);
 const ramp=new T.DataTexture(new Uint8Array([95,95,95,255,165,165,165,255,255,255,255,255]),3,1,T.RGBAFormat);ramp.minFilter=T.NearestFilter;ramp.magFilter=T.NearestFilter;ramp.needsUpdate=true;
 const materials=new Map(),geom={box:new T.BoxGeometry(1,1,1),sphere:new T.SphereGeometry(1,24,16),cylinder:new T.CylinderGeometry(1,1,1,10)};
 function mat(color){if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.82}));return materials.get(color);}
 function mesh(geo,color,x,y,z,scale,parent=scene){const m=new T.Mesh(geo,mat(color));m.position.set(x,y,z);if(scale)m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(c,x,y,z,w,h,d,p){return mesh(geom.box,c,x,y,z,[w,h,d],p);}
 function ball(c,x,y,z,a,b=a,cscale=a,p){return mesh(geom.sphere,c,x,y,z,[a,b,cscale],p);}
 function cylinder(c,x,y,z,r,h,p){return mesh(geom.cylinder,c,x,y,z,[r,h,r],p);}
 class Oval extends T.Curve{getPoint(t,target=new T.Vector3()){const a=t*Math.PI*2;return target.set(Math.sin(a)*86,.2,Math.cos(a)*42);}}
 const path=new Oval();path.arcLengthDivisions=1600;path.updateArcLengths();
 function sample(u,lane=0){const t=((u%1)+1)%1,p=path.getPointAt(t),dir=path.getTangentAt(t).normalize(),normal=new T.Vector3(-dir.z,0,dir.x).normalize();return {p:p.addScaledVector(normal,lane*2.05),dir,normal};}
const trackCanvas=document.createElement('canvas');trackCanvas.width=1024;trackCanvas.height=1024;const tc=trackCanvas.getContext('2d');tc.fillStyle='#c3a27e';tc.fillRect(0,0,1024,1024);for(let i=0;i<60000;i++){tc.fillStyle=i%2?'#d4b18c':'#a98764';tc.fillRect((Math.sin(i*45.37)*.5+.5)*1024,(Math.cos(i*73.61)*.5+.5)*1024,1+(i%2),1);}const trackTex=new T.CanvasTexture(trackCanvas);trackTex.wrapS=trackTex.wrapT=T.RepeatWrapping;trackTex.colorSpace=T.SRGBColorSpace;
 function ring(inner,outer,color){let positions=[],indices=[];for(let i=0;i<=256;i++){const s=sample(i/256);for(const offset of [inner,outer])positions.push(s.p.x+s.normal.x*offset,s.p.y-.06,s.p.z+s.normal.z*offset);}for(let i=0;i<256;i++){let a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.setAttribute('uv',new T.Float32BufferAttribute(Array.from({length:positions.length/3},(_,i)=>[positions[i*3]/5,positions[i*3+2]/5]).flat(),2));g.computeVertexNormals();const m=new T.Mesh(g,new T.MeshStandardMaterial({color,map:color==='#bb8c67'?trackTex:null,bumpMap:color==='#bb8c67'?trackTex:null,bumpScale:.055,roughness:.98,side:T.DoubleSide}));m.receiveShadow=true;scene.add(m);return m;}
 const turfCanvas=document.createElement('canvas');turfCanvas.width=turfCanvas.height=256;const tg=turfCanvas.getContext('2d');tg.fillStyle='#78905a';tg.fillRect(0,0,256,256);for(let i=0;i<6000;i++){tg.fillStyle=['#8f9e66','#687f4c','#84985f'][i%3];tg.fillRect((Math.sin(i*21.62)*.5+.5)*256,(Math.cos(i*63.31)*.5+.5)*256,1,2+i%3);}const turfTexture=new T.CanvasTexture(turfCanvas);turfTexture.wrapS=turfTexture.wrapT=T.RepeatWrapping;turfTexture.repeat.set(120,120);turfTexture.colorSpace=T.SRGBColorSpace;const terrain=box('#c7d2a4',0,-.6,0,1000,1,1000);terrain.material=new T.MeshStandardMaterial({color:'#c7d2a4',map:turfTexture,roughness:1});ring(-2,13,'#bb8c67');ring(-1.8,-1.55,'#eee4c0');ring(12.5,12.72,'#eee4c0');ring(-7,-2,'#83a66d');ring(13,20,'#889d7e');
 // Rake grooves and fine sand grain carry track detail without artificial lane stripes.
 for(let j=0;j<24;j++)ring(j*.56-.015,j*.56+.006,'#b88b65');
 // Rail system follows the entire oval; the low inner rail leaves a clear view of hoofwork.
 const railCurve=offset=>new T.CatmullRomCurve3(Array.from({length:96},(_,i)=>{let s=sample(i/96);return s.p.addScaledVector(s.normal,offset).add(new T.Vector3(0,1,0));}),true);
 for(const offset of [-2,13]){const rail=new T.Mesh(new T.TubeGeometry(railCurve(offset),192,.07,5,true),mat('#eee8d0'));scene.add(rail);for(let i=0;i<96;i++){const s=sample(i/96);box('#eee8d0',s.p.x+s.normal.x*offset,s.p.y+.55,s.p.z+s.normal.z*offset,.12,1.15,.12);}}
 // Infield garden and the festival pavilion.
 const grass=new T.Mesh(new T.CircleGeometry(1,64),mat('#9aaf78'));grass.rotation.x=-Math.PI/2;grass.scale.set(75,30,1);grass.position.y=.05;grass.receiveShadow=true;scene.add(grass);
 for(let j=0;j<6;j++){let m=box(j%2?'#a7b984':'#9bae78',0,.08,(j-2.5)*8,120,.03,4);m.rotation.y=.05;}
 const pond=new T.Mesh(new T.CircleGeometry(1,40),new T.MeshPhysicalMaterial({color:'#608e8e',roughness:.22,metalness:.15,clearcoat:1,clearcoatRoughness:.15,bumpMap:detailTexture('sand'),bumpScale:.04}));pond.rotation.x=-Math.PI/2;pond.scale.set(23,12,1);pond.position.set(-29,.12,-2);scene.add(pond);
 for(let i=0;i<12;i++){let a=i*2.4;ball('#d6c7aa',-29+Math.sin(a)*24,.25,Math.cos(a)*12,.9,.5,.7);}
 function textPlane(text,w,h,color='#f4dcab',background='#302c48'){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,1024,256);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='italic 900 '+(text.length>18?50:76)+'px sans-serif';ctx.fillText(text,512,133,980);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,side:T.DoubleSide}));scene.add(m);return m;}
 let eventSign=textPlane('SKYLINE CUP',30,7);eventSign.position.set(10,9,-5);eventSign.rotation.y=.2;for(const x of [-5,25])box('#4f4c62',x,4,-5,.55,8,.55);
 // Grandstands: terraced structure, colourful 3D spectators and a canopy.
 const crowdGeo=new T.CylinderGeometry(.19,.24,.62,8),crowdMat=new T.MeshToonMaterial({color:'#ffffff',gradientMap:ramp});
 const count=mobile?600:1100,crowd=new T.InstancedMesh(crowdGeo,crowdMat,count);crowd.castShadow=false;const heads=new T.InstancedMesh(new T.SphereGeometry(.17,8,6),new T.MeshStandardMaterial({color:'#cfa786',roughness:.9}),count);const dummy=new T.Object3D();let ci=0;
 for(let side of [-1,1]){
  const stand=new T.Group();stand.position.set(0,0,side*76);if(side===-1)stand.rotation.y=Math.PI;scene.add(stand);
  for(let row=0;row<6;row++)box(row%2?'#6e6585':'#817391',0,1.2+row*.75,row*1.8,135,2,1.8,stand);
  box('#403953',0,9,5,142,.5,18,stand);box('#f2dbb2',0,9.3,-4,143,.3,.4,stand);
  for(let x=-66;x<68;x+=22){box('#50445c',x,5,10,.45,10,.45,stand);box('#50445c',x,5,-3,.45,10,.45,stand);}
  const banner=textPlane(side===1?'MEADOW PARK  //  CHASE THE SKY':'THE FIRST STRIDE  •  SPRING INVITATIONAL',115,2.8);banner.position.set(0,2.8,side*67);if(side===-1)banner.rotation.y=Math.PI;
  const rows=5,cols=Math.floor(count/2/rows);for(let row=0;row<rows;row++)for(let col=0;col<cols&&ci<count;col++){
   dummy.position.set((col/(cols-1)-.5)*128,3+row*.77,side*(76+row*1.8));dummy.scale.set(.75,1.5,1);dummy.updateMatrix();crowd.setMatrixAt(ci,dummy.matrix);crowd.setColorAt(ci,new T.Color(SILKS[(row*7+col)%6]));dummy.position.y+=.6;dummy.scale.setScalar(1);dummy.updateMatrix();heads.setMatrixAt(ci,dummy.matrix);ci++;
  }
 }
 crowd.count=ci;heads.count=ci;scene.add(crowd,heads);
 const flags=[];for(let i=0;i<24;i++){let s=sample(i/24),p=s.p.addScaledVector(s.normal,22);box('#5d526b',p.x,4,p.z,.16,8,.16);let f=box(SILKS[i%6],p.x+1.2,7,p.z,2.4,1.2,.04);flags.push(f);}
 // Finish arch, checkered line and welcome gates.
 for(let lane=0;lane<12;lane++)for(let row=0;row<2;row++){const s=sample(0,lane/2-.45);const m=box((row+lane)%2?'#312d41':'#fff1d0',s.p.x+(row-.5)*.55,s.p.y+.025,s.p.z,.55,.04,1.03);}
 for(let lane of [-1.5,7]){const s=sample(0,lane);box('#514268',s.p.x,5,s.p.z,.5,10,.5);box('#e9c598',s.p.x,8.5,s.p.z,.65,.2,.65);}
 const finish=textPlane('SKYLINE // FINISH',18,2.5);finish.position.set(0,9.2,48);finish.rotation.y=Math.PI/2;
 const gates=new T.Group();scene.add(gates);const gateDoors=[];
 for(let lane=0;lane<6;lane++){const s=sample(0,lane);const g=new T.Group();g.position.copy(s.p);g.rotation.y=Math.atan2(s.dir.x,s.dir.z);gates.add(g);for(const side of [-1,1]){box('#e7d8b6',side*.92,1.65,0,.12,3.3,3.4,g);box('#514361',side*.92,3.25,0,.2,.18,3.5,g);}const d=box('#7d7c8c',0,1.4,1.65,1.7,2.6,.1,g);gateDoors.push(d);box(SILKS[lane],0,3.35,0,1.7,.15,3.5,g);}
 // Layered smooth mountain silhouettes and a warm, illustrated blue sky.
 const skyCanvas=document.createElement('canvas');skyCanvas.width=4;skyCanvas.height=256;const skyContext=skyCanvas.getContext('2d');for(let y=0;y<256;y++){let c=new T.Color('#6698b7').lerp(new T.Color('#f0d9b8'),y/255);skyContext.fillStyle=c.getStyle();skyContext.fillRect(0,y,4,1);}const skyTexture=new T.CanvasTexture(skyCanvas);skyTexture.colorSpace=T.SRGBColorSpace;const sky=new T.Mesh(new T.SphereGeometry(490,48,24),new T.MeshBasicMaterial({map:skyTexture,side:T.BackSide,depthWrite:false,fog:false}));scene.add(sky);
 for(let layer=0;layer<3;layer++){const positions=[],indices=[],segments=144,rows=9;for(let row=0;row<=rows;row++)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,r=200+layer*37+row*12,n=Math.sin(a*3+layer)+.45*Math.sin(a*7-layer*.6)+.18*Math.cos(a*13),ridge=(30+layer*7+n*10)*Math.sin(row/rows*Math.PI);positions.push(Math.sin(a)*r,-2+ridge,Math.cos(a)*r);}for(let row=0;row<rows;row++)for(let i=0;i<segments;i++){const a=row*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();scene.add(new T.Mesh(geo,new T.MeshStandardMaterial({color:['#929fa3','#a4b2bb','#b0c1cb'][layer],roughness:1,side:T.DoubleSide})));}
 for(let i=0;i<17;i++){let x=Math.sin(i*8.3)*200,z=Math.cos(i*6.4)*190;const g=new T.Group();g.position.set(x,60+(i%3)*9,z);for(let j=0;j<4;j++)ball('#e9d9e7',j*6,Math.sin(j)*2,0,8,3,4,g);scene.add(g);}
 // Trackside cherry trees and warm lanterns.
 for(let i=0;i<28;i++){const s=sample(i/28),p=s.p.addScaledVector(s.normal,34);if(Math.abs(p.z)>58&&Math.abs(p.x)<78)continue;cylinder('#756070',p.x,2,p.z,.35,4);ball(i%2?'#d4a5ba':'#bda0bd',p.x,5,p.z,3.4,2.8,3);}
 const raceDayVenue=addRaceDayVenue(scene,sample,mobile);
 const neon=new T.Group();neon.name='Skyline luminous racing rails';scene.add(neon);for(const [offset,color] of [[-2,'#61ebdc'],[13,'#bf8bfa']]){const curve=new T.CatmullRomCurve3(Array.from({length:128},(_,i)=>{const s=sample(i/128);return s.p.addScaledVector(s.normal,offset).add(new T.Vector3(0,.30,0));}),true);neon.add(new T.Mesh(new T.TubeGeometry(curve,256,.045,6,true),new T.MeshBasicMaterial({color})));}
 function setAtmosphere(mode){const night=mode==='Neon';neon.visible=night;sky.material.color.set(night?'#344665':'#ffffff');scene.fog.color.set(night?'#263a50':'#c4d3d0');sun.intensity=night?1.7:2.7;sun.color.set(night?'#cdd8ee':'#ffe0b4');ambient.intensity=night?.95:1.45;rim.intensity=night?1.9:.9;rim.color.set(night?'#77e7dc':'#9dc8f1');renderer.toneMappingExposure=night?1.23:1.13;}setAtmosphere('Neon');
 const staticObstacles=[];scene.updateMatrixWorld(true);scene.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.geometry?.parameters?.radius!==490){let ancestor=o,inGate=false;while(ancestor){if(ancestor===gates)inGate=true;ancestor=ancestor.parent;}if(inGate)return;const b=new T.Box3().setFromObject(o);if(b.max.y>.8&&b.max.x-b.min.x<180&&b.max.z-b.min.z<180)staticObstacles.push(b);}});
 // Full horse and humanoid assets are required before entry; no placeholder racers.
 const racers=[];
 function fallback(){return {g:new T.Group(),legs:[]};}
 const coat=['#bd8e60','#5a4747','#d8cfb8','#a76549','#514c59','#c3a36c'];
 let playerAvatar='man';try{playerAvatar=JSON.parse(localStorage.getItem('meadow-cycle-v2'))?.avatar==='lady'?'lady':'man';}catch{}
 for(let i=0;i<6;i++){const root=new T.Group(),f=fallback(coat[i]),jockey=createJockey(SILKS[i],i+1,i===0?playerAvatar:i%2?'lady':'man');root.add(f.g,jockey);root.visible=false;scene.add(root);racers.push({root,fallback:f,jockey,mixer:null,action:null});}
 const dust=new T.InstancedMesh(new T.SphereGeometry(.13,5,4),new T.MeshBasicMaterial({color:'#e8ccad',transparent:true,opacity:.32,depthWrite:false}),72);scene.add(dust);const particles=Array.from({length:72},(_,i)=>({age:i/30,life:.45+(i%5)*.08,pos:new T.Vector3()}));
 const confetti=new T.InstancedMesh(new T.PlaneGeometry(.16,.3),new T.MeshBasicMaterial({side:T.DoubleSide}),160);confetti.visible=false;scene.add(confetti);for(let i=0;i<160;i++)confetti.setColorAt(i,new T.Color(SILKS[i%6]));
 let loaded=false,angle=0,camMode='Chase',zoomFactor=1,elapsed=0,finishAge=0;const look=new T.Vector3(),desiredPos=new T.Vector3(),desiredLook=new T.Vector3();let first=true;
 let previousRace=null,preview='tour';function setPreview(view){preview=view;first=true;}
 const ready=new GLTFLoader().loadAsync('./models/horse.gltf').then(async asset=>{
  for(let i=0;i<6;i++){
   const r=racers[i],model=clone(asset.scene),smoothed=smoothRig(model),fitted=fitRig(model,2.65);
   model.traverse(o=>{if(o.isMesh){if(!o.geometry.attributes.color){const p=o.geometry.attributes.position,colors=new Float32Array(p.count*3);for(let k=0;k<p.count;k++){const f=.94+.055*Math.sin(p.getX(k)*73+p.getY(k)*31+p.getZ(k)*29);colors[k*3]=f;colors[k*3+1]=f;colors[k*3+2]=f;}o.geometry.setAttribute('color',new T.BufferAttribute(colors,3));}o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;const converted=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const c=new T.MeshStandardMaterial({name:m.name,color:m.color,map:m.map,side:T.DoubleSide,transparent:false,opacity:1,bumpMap:coatDetail,bumpScale:.014,roughness:.42,metalness:0,vertexColors:true,emissive:0,flatShading:false});if(/^Main/.test(m.name))c.color.set(coat[i]).multiplyScalar(/Dark/.test(m.name)?.72:/Light/.test(m.name)?1.12:1);return c;});o.material=converted.length===1?converted[0]:converted;}});
   applyAnimalCoat(model,'horse','race-'+i,[4,3,5,2,0,1][i]);const ropeGeo=new T.BufferGeometry();ropeGeo.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(33*3),3));r.lead=new T.Line(ropeGeo,new T.LineBasicMaterial({color:'#e7cb94'}));r.lead.frustumCulled=false;scene.add(r.lead);const bridleGeo=new T.BufferGeometry();bridleGeo.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(33*3),3));r.bridle=new T.Line(bridleGeo,new T.LineBasicMaterial({color:'#30241d'}));r.bridle.frustumCulled=false;r.root.add(r.bridle);r.root.add(model);r.fallback.g.visible=false;r.model=model;r.mixer=new T.AnimationMixer(model);const clip=asset.animations.find(a=>/gallop$/i.test(a.name))||asset.animations.find(a=>/walk$/i.test(a.name));const idle=asset.animations.find(a=>/idle$/i.test(a.name));const walk=asset.animations.find(a=>/walk$/i.test(a.name));if(walk)r.walk=r.mixer.clipAction(walk);if(clip)r.action=r.mixer.clipAction(clip);if(idle)r.idle=r.mixer.clipAction(idle).play();
   }
   await Promise.all(racers.map(r=>r.jockey.userData.ready));
   // Upgrade all six genuinely skinned racehorses together, with the old
   // Quaternius rig as a safe fallback if HD downloads are unavailable.
   await Promise.all(racers.map(async(r,i)=>{
    try{
     const result=await enhanceAnimalRig(r.model,'horse',{slot:i});
     r.hd=result.upgraded;
     if(r.hd)applyAnimalCoat(r.model,'horse','race-'+i,[4,3,5,2,0,1][i]);
    }catch(e){r.hd=false;console.warn('HD racehorse fallback',i,e.message);}
   }));
   for(const r of racers){const b=skinBounds(r.model);if(b.max.y-b.min.y<1.9)throw Error('Horse rig failed visible-size validation.');}for(const r of racers)r.root.visible=true;loaded=true;return true;
 }).catch(e=>{console.warn('Race assets unavailable; racing remains disabled.',e);return false;});
 function setHorseProfile(profile){if(!profile?.id)return;const model=racers[0].model;if(model)applyAnimalCoat(model,'horse',profile.id,horseCoatId(profile));}
  function setJockey(profile){racers[0].jockey.userData.setSilks?.(profile.color);racers[0].jockey.userData.riderName=profile.name;}
 function cameraMode(mode){if(['Director','Chase','Rail','Broadcast'].includes(mode))camMode=mode;first=true;}
 function zoom(delta){zoomFactor=T.MathUtils.clamp(zoomFactor*Math.exp(delta),.55,1.9);return zoomFactor;}
 const cameraTouches=new Map();let pinchDistance=0;const lens=renderer.domElement;if(lens.style)lens.style.touchAction='none';lens.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY*.001);},{passive:false});lens.addEventListener('pointerdown',e=>{cameraTouches.set(e.pointerId,{x:e.clientX,y:e.clientY});lens.setPointerCapture?.(e.pointerId);if(cameraTouches.size===2){const p=[...cameraTouches.values()];pinchDistance=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);}});lens.addEventListener('pointermove',e=>{if(!cameraTouches.has(e.pointerId))return;cameraTouches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(cameraTouches.size===2){const p=[...cameraTouches.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(d>8&&pinchDistance>8)zoom(Math.log(pinchDistance/d));pinchDistance=d;}});for(const event of ['pointerup','pointercancel'])lens.addEventListener(event,e=>{cameraTouches.delete(e.pointerId);pinchDistance=0;});
 const tmp=new T.Vector3();
 function update(dt,race,phase='lobby',winner=false){
  elapsed+=dt;const active=phase==='race'||phase==='replay',parading=phase==='lobby'||phase==='parade',loading=phase==='gatewalk';let user=race?.runners[0];if(race!==previousRace){for(const r of racers){r.runoutAge=0;r.pose=null;r.lastPosition=null;}previousRace=race;}
  const lit=parading?new T.Vector3(30,0,1):sample((racers[0].visualDistance||0)/400,user?.lane||0).p;sun.target.position.copy(lit);sun.position.copy(lit).add(new T.Vector3(-45,70,35));sun.target.updateMatrixWorld();
  for(let i=0;i<6;i++){
   const r=racers[i],h=race?.runners[i];if(h?.finish!==null&&h?.finish!==undefined&&(active||phase==='finish'))r.runoutAge=(r.runoutAge||0)+dt;else r.runoutAge=0;const out=runout(r.runoutAge||0,h?.velocity||17);r.visualDistance=(h?.distance||0)+(r.runoutAge?out.distance:0);const loadingDistance=loading?-Math.max(0,38-(race?.presentationTime||0)*5.5)+i*.2:0;
   const display=h?{...h,distance:loading?loadingDistance:r.visualDistance,laneVelocity:h.finish!==null?0:h.laneVelocity,targetLane:h.finish!==null?h.lane:h.targetLane,velocity:r.runoutAge?out.speed:h.velocity,actualVelocity:r.runoutAge?out.speed:h.actualVelocity}:null;
   const u=display?display.distance/400:0,s=sample(u,h?.lane??i);const running=!!h&&(active&&h.finish===null||r.runoutAge>0&&out.speed>1.8),walking=parading||loading||r.runoutAge>0&&out.speed>.08&&out.speed<=1.8,pose=running?racingPose(sample,display,r.pose,dt):null;if(!running)r.pose=null;else r.pose=pose;
   const parade=paradePosition(elapsed,i);r.root.position.copy(parading?parade.position:pose?.position||s.p);r.root.rotation.y=parading?parade.yaw:pose?.yaw??Math.atan2(s.dir.x,s.dir.z);r.root.rotation.z=pose?.bank||0;r.jockey.userData.setOnFoot(parading);
   r.jockey.position.set(parading?1.05:0,0,parading?1.05:0);r.jockey.rotation.set(0,0,0);
   const observed=running?(r.lastPosition?Math.min(32,r.root.position.distanceTo(r.lastPosition)/Math.max(dt,.001)):(h.actualVelocity??h.velocity)*path.getLength()/400):0;r.visualSpeed=T.MathUtils.lerp(r.visualSpeed||0,observed,1-Math.exp(-dt*10));r.lastPosition=r.root.position.clone();const gait=running?Math.max(.2,r.visualSpeed/16):0;
   if(r.mixer){if(walking){r.action?.stop();r.idle?.stop();if(!r.walk?.isRunning())r.walk?.reset().play();if(r.walk)r.walk.timeScale=parading?.85:loading?1.4:Math.max(.15,out.speed/1.6);}else if(running){r.walk?.stop();if(!r.action?.isRunning()){r.idle?.stop();r.action?.reset().play();if(r.action)r.action.time=i*.11;}if(r.action)r.action.timeScale=r.action.getClip().duration*Math.max(.15,r.visualSpeed/5.5);}else{r.walk?.stop();r.action?.stop();if(!r.idle?.isRunning())r.idle?.reset().play();}r.mixer.update(dt);}
   else if(running){r.fallback.legs.forEach((l,j)=>{l.rotation.x=Math.sin(elapsed*14*gait+j*2)*.7;});r.fallback.g.position.y=Math.abs(Math.sin(elapsed*14*gait))*.12;}
   r.root.updateMatrixWorld(true);if(r.model&&running){const axis=new T.Vector3(0,1,0).applyQuaternion(r.root.getWorldQuaternion(new T.Quaternion()));for(const name of ['Neck2','Head']){const b=r.model.getObjectByName(name);if(b?.isBone){const q=new T.Quaternion().setFromAxisAngle(axis,(pose?.steer||0)*.055).multiply(b.getWorldQuaternion(new T.Quaternion()));b.quaternion.copy(b.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(q));b.updateWorldMatrix(false,true);}}}const bone=r.model?.getObjectByName('Body');if(bone&&!parading){const local=r.root.worldToLocal(bone.getWorldPosition(new T.Vector3()));if(!r.saddleBase)r.saddleBase=local.clone();r.jockey.position.y=local.y-r.saddleBase.y;r.jockey.position.z=(local.z-r.saddleBase.z)*.25;r.jockey.rotation.x=running?Math.sin((r.action?.time||0)/Math.max(.01,r.action?.getClip().duration||1)*Math.PI*2)*.025:0;}const head=r.model?.getObjectByName('Head');const bit=head?r.root.worldToLocal(head.getWorldPosition(new T.Vector3())).add(new T.Vector3(0,-.12,.35)):new T.Vector3(0,2,1.45);r.jockey.userData.update(elapsed+i*.11,running?gait:0,{steer:pose?.steer||0,bank:pose?.bank||0,bitPosition:bit,phase:r.action?(r.action.time/r.action.getClip().duration)%1:0,delta:dt,effort:h?.pace==='push'?1:h?.pace==='save'?.25:.6});
   if(r.lead){r.lead.visible=parading;if(parading){const hand=r.jockey.userData.leadHand||r.root.localToWorld(new T.Vector3(.9,1.1,1)),end=r.root.localToWorld(bit.clone()),mid=hand.clone().lerp(end,.5);mid.y-=.25;const curve=new T.QuadraticBezierCurve3(hand,mid,end),p=r.lead.geometry.attributes.position;for(let k=0;k<33;k++){const v=curve.getPoint(k/32);p.setXYZ(k,v.x,v.y,v.z);}p.needsUpdate=true;}}
   if(r.bridle){const p=r.bridle.geometry.attributes.position;for(let k=0;k<33;k++){const a=k/32*Math.PI*2;p.setXYZ(k,bit.x+Math.cos(a)*.19,bit.y+Math.sin(a)*.14,bit.z-.08);}p.needsUpdate=true;}
  }
  gates.visible=loading||phase==='countdown';for(let i=0;i<gateDoors.length;i++)gateDoors[i].position.x=active?-1.7:0;
  flags.forEach((f,i)=>{f.rotation.y=Math.sin(elapsed*3+i)*.13;});
  for(let i=0;i<particles.length;i++){const p=particles[i];p.age+=dt;const r=racers[i%6],h=race?.runners[i%6];if(p.age>p.life){p.age=0;p.pos.copy(r.root.position);p.pos.y=.25;p.pos.x+=(Math.sin(i*7))*.5;p.pos.z+=Math.cos(i*9)*.5;}dummy.position.copy(p.pos);dummy.position.y+=p.age*.7;dummy.scale.setScalar(active&&h?.finish===null?.3+p.age*1.6:0);dummy.updateMatrix();dust.setMatrixAt(i,dummy.matrix);}dust.instanceMatrix.needsUpdate=true;
  if(winner){finishAge+=dt;confetti.visible=true;const s=sample(0,2.5);for(let i=0;i<160;i++){dummy.position.set(s.p.x+Math.sin(i*34)*14,12-((finishAge*(2+i%3)+i*.2)%13),s.p.z+Math.cos(i*51)*10);dummy.rotation.set(i+finishAge,i*.3,finishAge*2+i);dummy.scale.setScalar(1);dummy.updateMatrix();confetti.setMatrixAt(i,dummy.matrix);}confetti.instanceMatrix.needsUpdate=true;}else {finishAge=0;confetti.visible=false;}
  if(parading){
   angle+=dt*.10;const close=phase==='parade'||preview==='paddock'||preview==='tour'&&Math.floor(elapsed/15)%2===1;if(close){const r=racers[0];desiredLook.copy(r.root.position).add(new T.Vector3(0,1.3,0));desiredPos.copy(desiredLook).add(new T.Vector3(Math.cos(angle)*11,4.3,Math.sin(angle)*11));}else{desiredPos.set(140*Math.cos(angle),43+Math.sin(angle*.5)*12,100*Math.sin(angle));desiredLook.set(12,1,4);}
  }else {
   const s=sample((loading?loadingDistanceForCamera():racers[0].visualDistance||0)/400,user?.lane||0),p=s.p;
   const mode=camMode==='Director'?(phase==='finish'?'Rail':(user?.distance||0)<100?'Chase':(user?.distance||0)>race.metres-200?'Chase':Math.floor((user?.distance||0)/85)%3===1?'Rail':'Chase'):camMode;
   if(mode==='Chase'){desiredPos.copy(p).addScaledVector(s.dir,-8).addScaledVector(s.normal,3.5);desiredPos.y+=4.0;desiredLook.copy(p);desiredLook.y+=1.65;}
   else if(mode==='Rail'){desiredPos.copy(p).addScaledVector(s.normal,8).addScaledVector(s.dir,2);desiredPos.y+=2.9;desiredLook.copy(p);desiredLook.y+=1.7;}
   else{desiredPos.set(p.x*.8,62,p.z*.8+34);desiredLook.copy(p);}
  }
  if(active||loading||parading||phase==='countdown'||phase==='finish')desiredPos.sub(desiredLook).multiplyScalar(zoomFactor).add(desiredLook);
  let cameraObstacles=[];if((active||phase==='countdown')&&user){cameraObstacles=staticObstacles.filter(b=>b.distanceToPoint(desiredLook)<24);for(let i=1;i<racers.length;i++){const r=racers[i];if(r.root.position.distanceTo(desiredLook)>22)continue;const box=new T.Box3(new T.Vector3(-.7,.15,-1.65),new T.Vector3(.7,3.45,1.75));r.root.updateMatrixWorld(true);cameraObstacles.push({box,matrix:r.root.matrixWorld.clone()});}const direction=sample(user.distance/400,user.lane).dir;desiredPos.copy(safeRaceCamera(desiredLook,desiredPos,direction,cameraObstacles));}
  const blend=first?1:1-Math.exp(-dt*(reduced?9:3));camera.position.lerp(desiredPos,blend);look.lerp(desiredLook,blend);first=false;if((active||phase==='countdown')&&user&&!cameraClear(look,camera.position,cameraObstacles)){camera.position.copy(safeRaceCamera(look,desiredPos,sample(user.distance/400,user.lane).dir,cameraObstacles));}camera.lookAt(look);
  const targetFov=user?.burst>0&&!reduced?58:48;camera.fov=T.MathUtils.lerp(camera.fov,targetFov,Math.min(1,dt*3));camera.updateProjectionMatrix();renderer.render(scene,camera);
 }
 function loadingDistanceForCamera(){return -Math.max(0,38-(previousRace?.presentationTime||0)*5.5);}
 function quality(level){const high=level==='High';renderer.setPixelRatio(Math.min(devicePixelRatio,high?2:1));renderer.shadowMap.enabled=high;sun.shadow.mapSize.set(high?2048:1024,high?2048:1024);sun.shadow.map?.dispose();sun.shadow.map=null;renderer.setSize(innerWidth,innerHeight);}
 function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}addEventListener('resize',resize);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();window.dispatchEvent(new Event('racecontextlost'));});renderer.domElement.addEventListener('webglcontextrestored',()=>location.reload());
 return {ready,update,setAtmosphere,setPreview,cameraMode,setJockey,setHorseProfile,zoom,cameraState:()=>({mode:camMode,zoom:zoomFactor,position:camera.position.clone()}),quality,renderer,scene,racers,sample,loaded:()=>loaded};
}
