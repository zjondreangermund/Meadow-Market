import {treeGrove,detailHouse,contactShadow} from './landscape-assets.js?v=landscape13';
import * as T from './three.module.js';
import {PLOTS,DESTINATIONS,ensureCounty} from './county-sim.js?v=county11';
export function buildCounty({scene,register,block,mats,mobile=false}){
 let batchingRoads=true;const roadMeshes=[];const materials=new Map(),geo=new T.BoxGeometry(1,1,1),wheelGeo=new T.CylinderGeometry(.42,.42,.25,10),chunks=[],plots=new Map();
 const material=c=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.88,map:(c==='#777b70'?mats.path?.map:mats.wood?.map)||null,bumpMap:mats.wood?.map||null,bumpScale:.025}));return materials.get(c);};
 function cube(parent,w,h,d,c,x,y,z){const m=new T.Mesh(geo,typeof c==='string'?material(c):c);m.scale.set(w,h,d);m.position.set(x,y,z);m.receiveShadow=true;parent.add(m);if(parent===scene&&batchingRoads)roadMeshes.push(m);return m;}
 function road(x,z,w,d){cube(scene,w,.055,d,'#777b70',x,.225,z);if(w>d){cube(scene,w,.03,.22,'#d8d1b4',x,.26,z-d/2+.35);cube(scene,w,.03,.22,'#d8d1b4',x,.26,z+d/2-.35);for(let xx=x-w/2+3;xx<x+w/2-1;xx+=7)cube(scene,2,.025,.12,'#ece1b5',xx,.27,z);}else{cube(scene,.22,.03,d,'#d8d1b4',x-w/2+.35,.26,z);cube(scene,.22,.03,d,'#d8d1b4',x+w/2-.35,.26,z);for(let zz=z-d/2+3;zz<z+d/2-1;zz+=7)cube(scene,.12,.025,2,'#ece1b5',x,.27,zz);}}
 road(-48,0,7,152);road(64,0,7,152);road(6,-36,112,7);road(6,44,112,7);road(-72,-36,48,7);road(-72,4,48,7);road(-72,28,48,7);road(-72,-16,5,96);road(82,62,36,7);
 cube(scene,24,.045,3.5,mats.path,-36,.24,6);cube(scene,22,.045,3.5,mats.path,53,.24,6);
 for(const p of PLOTS){const a=p.approach;if(p.x<40)cube(scene,3,.045,11,mats.path,a.x,.24,-41.5);else cube(scene,8,.045,3,mats.path,68,.24,a.z);}
 batchingRoads=false;const roadBatches=new Map();for(const m of roadMeshes){if(!roadBatches.has(m.material))roadBatches.set(m.material,[]);roadBatches.get(m.material).push(m);}for(const [mat,meshes]of roadBatches){const batch=new T.InstancedMesh(geo,mat,meshes.length);batch.name='County road batch';batch.receiveShadow=true;meshes.forEach((m,i)=>{m.updateMatrix();batch.setMatrixAt(i,m.matrix);m.removeFromParent();});batch.computeBoundingSphere();scene.add(batch);}
 block(88,-14,9,7);block(79,-14,5,5);block(85,28,14,10);
 // All station approaches and collision shells exist before detail chunks load.
 for(const d of DESTINATIONS.filter(d=>d.id!=='farm')){const proxy=new T.Group();proxy.position.set(d.x,.2,d.z);scene.add(proxy);const board=cube(proxy,2.7,1.6,.16,'#e9d9aa',0,2.1,d.d?d.d/2:4);register(proxy,{kind:'county',countyId:d.id,x:d.x,z:d.z,approach:d.approach});
  if(!PLOTS.some(p=>p.id===d.id)){const w=d.id==='racegate'?10:14,depth=d.id==='racegate'?5:10;block(d.x,d.z,w,depth);}
 }
 function label(parent,text,x,y,z){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');ctx.fillStyle='#f8edce';ctx.fillRect?.(0,0,512,96);ctx.fillStyle='#304e40';ctx.font='bold 30px system-ui';ctx.textAlign='center';ctx.fillText(text,256,60);const sprite=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(canvas),depthTest:true}));sprite.position.set(x,y,z);sprite.scale.set(8,1.5,1);parent.add(sprite);}
 function house(parent,x,z,color,w=14,d=10,h=5){const shell=new T.Group();parent.add(shell);parent=shell;contactShadow(parent,x,z,w,d);cube(parent,w,h,d,color,x,h/2+.2,z);for(const side of [-1,1]){const half=w/2+.6,roof=cube(parent,half/Math.cos(.32),.23,d+1.2,'#9e6650',x+side*half/2,h+.2+half*Math.tan(.32)/2,z);roof.rotation.z=-side*.32;}cube(parent,2.1,3,.16,'#5e5747',x,1.7,z+d/2+.1);for(const xx of [-4,4]){cube(parent,2.1,1.7,.16,'#a4c6c7',x+xx,3.2,z+d/2+.12);cube(parent,2.5,.15,.3,'#f0e8d3',x+xx,2.3,z+d/2+.2);}cube(parent,w+1,.2,2.8,'#b9a990',x,.3,z+d/2+1.3);detailHouse({parent:shell,x,z,w,d,h,cube});const dest=DESTINATIONS.find(d=>d.x===x&&d.z===z)||DESTINATIONS.find(d=>d.id==='spring-well'&&x===88);if(dest)register(shell,{kind:'county',countyId:dest.id,x:dest.x,z:dest.z,approach:dest.approach});}
 function chunk(name,x,z,build){const group=new T.Group();group.name=name;scene.add(group);chunks.push({group,x,z,build,loaded:false});return group;}
 chunk('Village district',-72,10,g=>{house(g,-72,17,'#d2bc8c');house(g,-72,-7,'#b9c9ac');label(g,'VILLAGE CO-OP',-72,8,17);label(g,'COUNTY EXCHANGE',-72,8,-7);for(const x of [-83,-61]){cube(g,.25,5,.25,'#5f6b5f',x,2.7,6);cube(g,1.2,.25,1.2,'#eee1ad',x,5.3,6);}});
 chunk('Delivery district',-72,-55,g=>{house(g,-72,-55,'#b5bfc0',16,12,5.5);label(g,'DELIVERY DEPOT',-72,9,-55);for(let i=0;i<5;i++)cube(g,1.2,1.2,1.2,'#ba9668',-80+i*1.5,.85,-46);});
 chunk('Meadow Park gateway',82,62,g=>{for(const x of [77,87])cube(g,1.3,6,1.3,'#bba77d',x,3.2,62);cube(g,12,1.1,1.4,'#436851',82,6.4,62);label(g,'MEADOW PARK',82,8,62);});
 for(const p of PLOTS){const root=chunk(p.name,p.x,p.z,g=>{
  const ground=cube(g,p.w,.04,p.d,p.kind==='field'?'#876548':'#9eaf77',p.x,.25,p.z);
  const furrows=[];const growth=new T.Group();g.add(growth);const ready=new T.Group();g.add(ready);cube(ready,.12,2.7,.12,'#aa9063',p.x,1.6,p.z);cube(ready,1,.3,1,'#f3d57d',p.x,3,p.z);
  if(p.kind==='field'){for(let i=0;i<8;i++){furrows.push(cube(g,p.w-2,.12,.35,'#5d4738',p.x,.32,p.z-p.d/2+1.6+i*2.3));cube(growth,p.w-3,.75,.6,'#86a64f',p.x,.7,p.z-p.d/2+1.6+i*2.3);}}
  if(p.kind==='orchard'){for(let i=0;i<8;i++){const x=p.x+(i%4-1.5)*5,z=p.z+(i<4?-4:4);cube(growth,.5,3,.5,'#92724f',x,1.7,z);const crown=new T.Mesh(new T.IcosahedronGeometry(2.2,1),material('#6a9253'));crown.position.set(x,4,z);growth.add(crown);}}
  if(p.kind==='well'){house(g,p.x+3,p.z,'#c1c3a8',9,7,3);const tank=new T.Mesh(new T.CylinderGeometry(2.4,2.4,5,14),material('#9bbdb9'));tank.position.set(p.x-6,2.8,p.z);g.add(tank);cube(growth,5,.3,.3,'#708b85',p.x-2,1,p.z);}
  if(p.kind==='mill'){house(g,p.x,p.z,'#baad88',14,10,5);cube(growth,2.4,4,2.4,'#d7cfb2',p.x+8,2.2,p.z);}
  for(const x of [-1,1])for(const z of [-1,1])cube(g,.18,1.5,.18,'#c9b486',p.x+x*p.w/2,.95,p.z+z*p.d/2);
  label(g,p.name.toUpperCase(),p.x,8,p.z);plots.set(p.id,{root:g,ground,growth,ready,furrows});
 });}
 // Procedural border groves share geometry/materials; one instanced draw per grove.
 for(const [cx,cz]of [[-84,58],[42,-70],[88,-62],[16,69]])chunk('County grove',cx,cz,g=>treeGrove(g,cx,cz,18,11));
 const vans=[];for(const [i,color]of ['#d3be86','#789d9a'].entries()){const root=new T.Group();root.name='County delivery traffic';scene.add(root);cube(root,2.2,1.5,3.7,color,0,1.3,0);cube(root,2.1,1.4,1.5,'#6f9196',0,1.3,2.1);cube(root,1.8,.6,.12,'#c0dddf',0,1.7,2.89);for(const x of [-1.1,1.1])for(const z of [-1,2]){const wheel=new T.Mesh(wheelGeo,material('#3c413d'));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.5,z);root.add(wheel);}vans.push({root,t:i*150});}
 const loop=[[-46,-34],[62,-34],[62,42],[-46,42]],lengths=loop.map((p,i)=>Math.hypot(p[0]-loop[(i+1)%4][0],p[1]-loop[(i+1)%4][1])),total=lengths.reduce((a,b)=>a+b,0);
 function update(dt,player,state,focus=player){const c=ensureCounty(state);for(const ch of chunks){const near=Math.min(Math.hypot(player.x-ch.x,player.z-ch.z),Math.hypot(focus.x-ch.x,focus.z-ch.z))<(mobile?66:90);if(near&&!ch.loaded){ch.build(ch.group);ch.loaded=true;}ch.group.visible=near;}
  for(const [id,v]of plots){const r=c.plots[id];v.ground.visible=!!r;for(const f of v.furrows)f.visible=!!r;v.growth.visible=!!r&&(PLOTS.find(p=>p.id===id).kind==='orchard'?r.established:!!r.job);v.ready.visible=!!r?.job&&state.day>=r.job.readyDay;if(PLOTS.find(p=>p.id===id).kind==='field')v.growth.scale.y=r?.job?Math.min(1,.2+.4*(state.day-r.job.startedDay)):.2;}
  for(const v of vans){v.t=(v.t+dt*4)%total;let t=v.t,i=0;while(t>lengths[i]&&i<3){t-=lengths[i];i++;}const a=loop[i],b=loop[(i+1)%4],f=t/lengths[i];v.root.position.set(a[0]+(b[0]-a[0])*f,.22,a[1]+(b[1]-a[1])*f);v.root.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);v.root.visible=Math.hypot(v.root.position.x-player.x,v.root.position.z-player.z)<(mobile?65:100);}
 }
 return {chunks,plots,vans,update};
}
