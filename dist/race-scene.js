import * as T from './three.module.js';
import {fitRig,skinBounds} from './model-rig.js';
import {smoothRig} from './smooth-rig.js';
import {createJockey} from './jockey.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {clone} from './vendor/SkeletonUtils.js';
export const SILKS=['#f4bd67','#90cbb3','#c5b1ef','#e48779','#7eb8e0','#eee0aa'];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=innerWidth<750;
export function createRaceScene(container){
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.35:1.8));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;container.append(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color('#c5b6d8');scene.fog=new T.Fog('#c5b6d8',180,470);
 const camera=new T.PerspectiveCamera(48,innerWidth/innerHeight,.1,650);camera.position.set(110,60,120);
 scene.add(new T.HemisphereLight('#eee4ff','#4d6659',1.7));const sun=new T.DirectionalLight('#ffe0ab',2.3);sun.position.set(-70,110,65);sun.castShadow=true;sun.shadow.normalBias=.025;sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);Object.assign(sun.shadow.camera,{left:-130,right:130,top:110,bottom:-110,near:1,far:300});sun.shadow.bias=-.0007;scene.add(sun);
 const ramp=new T.DataTexture(new Uint8Array([95,95,95,255,165,165,165,255,255,255,255,255]),3,1,T.RGBAFormat);ramp.minFilter=T.NearestFilter;ramp.magFilter=T.NearestFilter;ramp.needsUpdate=true;
 const materials=new Map(),geom={box:new T.BoxGeometry(1,1,1),sphere:new T.SphereGeometry(1,24,16),cylinder:new T.CylinderGeometry(1,1,1,10)};
 function mat(color){if(!materials.has(color))materials.set(color,new T.MeshToonMaterial({color,gradientMap:ramp}));return materials.get(color);}
 function mesh(geo,color,x,y,z,scale,parent=scene){const m=new T.Mesh(geo,mat(color));m.position.set(x,y,z);if(scale)m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(c,x,y,z,w,h,d,p){return mesh(geom.box,c,x,y,z,[w,h,d],p);}
 function ball(c,x,y,z,a,b=a,cscale=a,p){return mesh(geom.sphere,c,x,y,z,[a,b,cscale],p);}
 function cylinder(c,x,y,z,r,h,p){return mesh(geom.cylinder,c,x,y,z,[r,h,r],p);}
 class Oval extends T.Curve{getPoint(t,target=new T.Vector3()){const a=t*Math.PI*2;return target.set(Math.sin(a)*86,.2+Math.sin(a)*.35,Math.cos(a)*42);}}
 const path=new Oval();path.arcLengthDivisions=1600;path.updateArcLengths();
 function sample(u,lane=0){const t=((u%1)+1)%1,p=path.getPointAt(t),dir=path.getTangentAt(t).normalize(),normal=new T.Vector3(-dir.z,0,dir.x).normalize();return {p:p.addScaledVector(normal,lane*2.05),dir,normal};}
const trackCanvas=document.createElement('canvas');trackCanvas.width=256;trackCanvas.height=256;const tc=trackCanvas.getContext('2d');tc.fillStyle='#c3a27e';tc.fillRect(0,0,256,256);for(let i=0;i<4000;i++){tc.fillStyle=i%2?'#d4b18c':'#a98764';tc.fillRect((Math.sin(i*45.37)*.5+.5)*256,(Math.cos(i*73.61)*.5+.5)*256,1+(i%2),1);}const trackTex=new T.CanvasTexture(trackCanvas);trackTex.wrapS=trackTex.wrapT=T.RepeatWrapping;trackTex.colorSpace=T.SRGBColorSpace;
 function ring(inner,outer,color){let positions=[],indices=[];for(let i=0;i<=256;i++){const s=sample(i/256);for(const offset of [inner,outer])positions.push(s.p.x+s.normal.x*offset,s.p.y-.06,s.p.z+s.normal.z*offset);}for(let i=0;i<256;i++){let a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.setAttribute('uv',new T.Float32BufferAttribute(Array.from({length:positions.length/3},(_,i)=>[positions[i*3]/5,positions[i*3+2]/5]).flat(),2));g.computeVertexNormals();const m=new T.Mesh(g,new T.MeshStandardMaterial({color,map:color==='#bb8c67'?trackTex:null,roughness:.98,side:T.DoubleSide}));m.receiveShadow=true;scene.add(m);return m;}
 box('#8b9d70',0,-.6,0,1000,1,1000);ring(-2,13,'#bb8c67');ring(-1.8,-1.55,'#eee4c0');ring(12.5,12.72,'#eee4c0');ring(-7,-2,'#83a66d');ring(13,20,'#889d7e');
 for(let j=0;j<=5;j++)ring(j*2.05-.04,j*2.05+.025,'#c99d79');
 // Rail system follows the entire oval; the low inner rail leaves a clear view of hoofwork.
 const railCurve=offset=>new T.CatmullRomCurve3(Array.from({length:96},(_,i)=>{let s=sample(i/96);return s.p.addScaledVector(s.normal,offset).add(new T.Vector3(0,1,0));}),true);
 for(const offset of [-2,13]){const rail=new T.Mesh(new T.TubeGeometry(railCurve(offset),192,.07,5,true),mat('#eee8d0'));scene.add(rail);for(let i=0;i<96;i++){const s=sample(i/96);box('#eee8d0',s.p.x+s.normal.x*offset,s.p.y+.55,s.p.z+s.normal.z*offset,.12,1.15,.12);}}
 // Infield garden and the festival pavilion.
 const grass=new T.Mesh(new T.CircleGeometry(1,64),mat('#9aaf78'));grass.rotation.x=-Math.PI/2;grass.scale.set(75,30,1);grass.position.y=.05;grass.receiveShadow=true;scene.add(grass);
 for(let j=0;j<6;j++){let m=box(j%2?'#a7b984':'#9bae78',0,.08,(j-2.5)*8,120,.03,4);m.rotation.y=.05;}
 const pond=new T.Mesh(new T.CircleGeometry(1,40),new T.MeshToonMaterial({color:'#89b7c5',gradientMap:ramp}));pond.rotation.x=-Math.PI/2;pond.scale.set(23,12,1);pond.position.set(-29,.12,-2);scene.add(pond);
 for(let i=0;i<12;i++){let a=i*2.4;ball('#d6c7aa',-29+Math.sin(a)*24,.25,Math.cos(a)*12,.9,.5,.7);}
 function textPlane(text,w,h,color='#f4dcab',background='#302c48'){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,1024,256);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='italic 900 '+(text.length>18?50:76)+'px sans-serif';ctx.fillText(text,512,133,980);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,side:T.DoubleSide}));scene.add(m);return m;}
 let eventSign=textPlane('SKYLINE CUP',30,7);eventSign.position.set(10,9,-5);eventSign.rotation.y=.2;for(const x of [-5,25])box('#4f4c62',x,4,-5,.55,8,.55);
 // Grandstands: terraced structure, colourful 3D spectators and a canopy.
 const crowdGeo=new T.CapsuleGeometry(.19,.35,3,6),crowdMat=new T.MeshToonMaterial({color:'#ffffff',gradientMap:ramp});
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
 // Low-poly ridgeline and cloud banks create an illustrated horizon.
 for(let i=0;i<26;i++){const a=i/26*Math.PI*2,r=270+(i%3)*17,m=new T.Mesh(new T.ConeGeometry(40+(i%4)*12,55+(i%5)*13,5),mat(i%2?'#a6a1bd':'#b2acc7'));m.position.set(Math.sin(a)*r,12,Math.cos(a)*r);m.rotation.y=i;scene.add(m);}
 for(let i=0;i<17;i++){let x=Math.sin(i*8.3)*200,z=Math.cos(i*6.4)*190;const g=new T.Group();g.position.set(x,60+(i%3)*9,z);for(let j=0;j<4;j++)ball('#e9d9e7',j*6,Math.sin(j)*2,0,8,3,4,g);scene.add(g);}
 // Trackside cherry trees and warm lanterns.
 for(let i=0;i<28;i++){const s=sample(i/28),p=s.p.addScaledVector(s.normal,34);if(Math.abs(p.z)>58&&Math.abs(p.x)<78)continue;cylinder('#756070',p.x,2,p.z,.35,4);ball(i%2?'#d4a5ba':'#bda0bd',p.x,5,p.z,3.4,2.8,3);}
 // Each fallback is genuinely volumetric and articulated; it is replaced by the rigged horse.
 const racers=[];
 function fallback(){return {g:new T.Group(),legs:[]};}
 const coat=['#bd8e60','#5a4747','#d8cfb8','#a76549','#514c59','#c3a36c'];
 for(let i=0;i<6;i++){const root=new T.Group(),f=fallback(coat[i]),jockey=createJockey(SILKS[i],i+1);root.add(f.g,jockey);root.visible=false;scene.add(root);racers.push({root,fallback:f,jockey,mixer:null,action:null});}
 const dust=new T.InstancedMesh(new T.SphereGeometry(.13,5,4),new T.MeshBasicMaterial({color:'#e8ccad',transparent:true,opacity:.32,depthWrite:false}),72);scene.add(dust);const particles=Array.from({length:72},(_,i)=>({age:i/30,life:.45+(i%5)*.08,pos:new T.Vector3()}));
 const confetti=new T.InstancedMesh(new T.PlaneGeometry(.16,.3),new T.MeshBasicMaterial({side:T.DoubleSide}),160);confetti.visible=false;scene.add(confetti);for(let i=0;i<160;i++)confetti.setColorAt(i,new T.Color(SILKS[i%6]));
 let loaded=false,angle=0,camMode='Director',elapsed=0,finishAge=0;const look=new T.Vector3(),desiredPos=new T.Vector3(),desiredLook=new T.Vector3();let first=true;
 const ready=new GLTFLoader().loadAsync('./models/horse.gltf').then(asset=>{
  for(let i=0;i<6;i++){
   const r=racers[i],model=clone(asset.scene),smoothed=smoothRig(model),fitted=fitRig(model,2.65);
   model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;const converted=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const c=new T.MeshStandardMaterial({name:m.name,color:m.color,map:m.map,side:T.DoubleSide,transparent:false,opacity:1,roughness:.64,metalness:0,emissive:0,flatShading:false});if(/^Main/.test(m.name))c.color.set(coat[i]).multiplyScalar(/Dark/.test(m.name)?.72:/Light/.test(m.name)?1.12:1);return c;});o.material=converted.length===1?converted[0]:converted;}});
   r.root.add(model);r.fallback.g.visible=false;r.model=model;r.mixer=new T.AnimationMixer(model);const clip=asset.animations.find(a=>/gallop$/i.test(a.name))||asset.animations.find(a=>/walk$/i.test(a.name));const idle=asset.animations.find(a=>/idle$/i.test(a.name));if(clip)r.action=r.mixer.clipAction(clip);if(idle)r.idle=r.mixer.clipAction(idle).play();
  }for(const r of racers){const b=skinBounds(r.model);if(b.max.y-b.min.y<1.9)throw Error('Horse rig failed visible-size validation.');}for(const r of racers)r.root.visible=true;loaded=true;return true;
 }).catch(e=>{console.warn('Racing horse load failed; articulated 3D fallback retained.',e);return false;});
 function cameraMode(mode){camMode=mode;first=true;}
 const tmp=new T.Vector3();
 function update(dt,race,phase='lobby',winner=false){
  elapsed+=dt;const active=phase==='race'||phase==='replay';let user=race?.runners[0];
  for(let i=0;i<6;i++){
   const r=racers[i],h=race?.runners[i],u=h?h.distance/400:0,s=sample(u,h?.lane??i);r.root.position.copy(s.p);r.root.rotation.y=Math.atan2(s.dir.x,s.dir.z);
   const running=active&&h?.finish===null;r.root.rotation.z=running?Math.abs(Math.sin(u*Math.PI*2))*.055:0;
   const gait=running?Math.max(.7,(h.velocity||0)/16):0;
   if(r.mixer){if(running){if(!r.action?.isRunning()){r.idle?.stop();r.action?.reset().play();if(r.action)r.action.time=i*.11;}if(r.action)r.action.timeScale=gait;}else{r.action?.stop();if(!r.idle?.isRunning())r.idle?.reset().play();}r.mixer.update(dt);}
   else if(running){r.fallback.legs.forEach((l,j)=>{l.rotation.x=Math.sin(elapsed*14*gait+j*2)*.7;});r.fallback.g.position.y=Math.abs(Math.sin(elapsed*14*gait))*.12;}
   r.root.updateMatrixWorld(true);const bone=r.model?.getObjectByName('Body');if(bone){const local=r.root.worldToLocal(bone.getWorldPosition(new T.Vector3()));if(!r.saddleBase)r.saddleBase=local.clone();r.jockey.position.y=local.y-r.saddleBase.y;r.jockey.position.z=(local.z-r.saddleBase.z)*.25;}r.jockey.userData.update(elapsed+i*.11,running?gait:0,running?-.04:0);
  }
  gates.visible=phase==='lobby'||phase==='countdown'||(active&&(race?.time||0)<1.2);for(let i=0;i<gateDoors.length;i++)gateDoors[i].position.x=active?-1.7:0;
  flags.forEach((f,i)=>{f.rotation.y=Math.sin(elapsed*3+i)*.13;});
  for(let i=0;i<particles.length;i++){const p=particles[i];p.age+=dt;const r=racers[i%6],h=race?.runners[i%6];if(p.age>p.life){p.age=0;p.pos.copy(r.root.position);p.pos.y=.25;p.pos.x+=(Math.sin(i*7))*.5;p.pos.z+=Math.cos(i*9)*.5;}dummy.position.copy(p.pos);dummy.position.y+=p.age*.7;dummy.scale.setScalar(active&&h?.finish===null?.3+p.age*1.6:0);dummy.updateMatrix();dust.setMatrixAt(i,dummy.matrix);}dust.instanceMatrix.needsUpdate=true;
  if(winner){finishAge+=dt;confetti.visible=true;const s=sample(0,2.5);for(let i=0;i<160;i++){dummy.position.set(s.p.x+Math.sin(i*34)*14,12-((finishAge*(2+i%3)+i*.2)%13),s.p.z+Math.cos(i*51)*10);dummy.rotation.set(i+finishAge,i*.3,finishAge*2+i);dummy.scale.setScalar(1);dummy.updateMatrix();confetti.setMatrixAt(i,dummy.matrix);}confetti.instanceMatrix.needsUpdate=true;}else {finishAge=0;confetti.visible=false;}
  if(!active&&phase!=='finish'){
   angle+=dt*.035;desiredPos.set(110*Math.cos(angle*.8),50+Math.sin(angle)*6,105+Math.sin(angle*.8)*20);desiredLook.set(8,1,18);
  }else {
   const s=sample((user?.distance||0)/400,user?.lane||0),p=s.p;
   const mode=camMode==='Director'?(phase==='finish'?'Rail':(user?.distance||0)<75?'Rail':(user?.distance||0)>race.metres-200?'Chase':Math.floor((user?.distance||0)/110)%3===1?'Broadcast':'Chase'):camMode;
   if(mode==='Chase'){desiredPos.copy(p).addScaledVector(s.dir,-12).addScaledVector(s.normal,5);desiredPos.y+=6;desiredLook.copy(p).addScaledVector(s.dir,9);desiredLook.y+=1.6;}
   else if(mode==='Rail'){desiredPos.copy(p).addScaledVector(s.normal,13).addScaledVector(s.dir,2);desiredPos.y+=3.5;desiredLook.copy(p).addScaledVector(s.dir,2);desiredLook.y+=1.7;}
   else{desiredPos.set(p.x*.8,62,p.z*.8+34);desiredLook.copy(p);}
  }
  const blend=first?1:1-Math.exp(-dt*(reduced?9:3));camera.position.lerp(desiredPos,blend);look.lerp(desiredLook,blend);first=false;camera.lookAt(look);
  const targetFov=user?.burst>0&&!reduced?58:48;camera.fov=T.MathUtils.lerp(camera.fov,targetFov,Math.min(1,dt*3));camera.updateProjectionMatrix();renderer.render(scene,camera);
 }
 function quality(level){const high=level==='High';renderer.setPixelRatio(Math.min(devicePixelRatio,high?2:1));renderer.shadowMap.enabled=high;sun.shadow.mapSize.set(high?2048:1024,high?2048:1024);sun.shadow.map?.dispose();sun.shadow.map=null;renderer.setSize(innerWidth,innerHeight);}
 function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}addEventListener('resize',resize);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();window.dispatchEvent(new Event('racecontextlost'));});renderer.domElement.addEventListener('webglcontextrestored',()=>location.reload());
 return {ready,update,cameraMode,quality,renderer,scene,racers,loaded:()=>loaded};
}
