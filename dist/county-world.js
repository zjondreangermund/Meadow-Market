import {createOrchard,createFieldCrop} from './orchard-models.js?v=simulation15';
import {growthProgress,growthReady} from './growth.js?v=simulation15';
import {buildRoads} from './road-world.js?v=neighbours16';
import {createBusiness} from './business-models.js?v=simulation15';
import {createFarmVehicle} from './vehicle-models.js?v=life17';
import {treeGrove,detailHouse,contactShadow} from './landscape-assets.js?v=landscape13';
import * as T from './three.module.js';
import {PLOTS,DESTINATIONS,ensureCounty} from './county-sim.js?v=simulation15';
export function buildCounty({scene,register,block,mats,mobile=false}){
 let batchingRoads=true;const roadMeshes=[];const materials=new Map(),geo=new T.BoxGeometry(1,1,1),wheelGeo=new T.CylinderGeometry(.42,.42,.25,10),chunks=[],plots=new Map();
 const material=c=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.88,map:null}));return materials.get(c);};
 function cube(parent,w,h,d,c,x,y,z){const m=new T.Mesh(geo,typeof c==='string'?material(c):c);m.scale.set(w,h,d);m.position.set(x,y,z);m.receiveShadow=true;parent.add(m);if(parent===scene&&batchingRoads)roadMeshes.push(m);return m;}
 buildRoads(scene);
 cube(scene,24,.045,3.5,mats.path,-36,.24,6);cube(scene,22,.045,3.5,mats.path,53,.24,6);
 for(const p of PLOTS){const a=p.approach;if(p.x<40)cube(scene,3,.045,11,mats.path,a.x,.24,-41.5);else cube(scene,8,.045,3,mats.path,68,.24,a.z);}
 batchingRoads=false;const roadBatches=new Map();for(const m of roadMeshes){if(!roadBatches.has(m.material))roadBatches.set(m.material,[]);roadBatches.get(m.material).push(m);}for(const [mat,meshes]of roadBatches){const batch=new T.InstancedMesh(geo,mat,meshes.length);batch.name='County road batch';batch.receiveShadow=true;meshes.forEach((m,i)=>{m.updateMatrix();batch.setMatrixAt(i,m.matrix);m.removeFromParent();});batch.computeBoundingSphere();scene.add(batch);}
 block(88,-14,9,7);block(79,-14,5,5);block(85,28,14,10);
 // All station approaches and collision shells exist before detail chunks load.
 for(const d of DESTINATIONS.filter(d=>d.id!=='farm')){const proxy=new T.Group();proxy.position.set(d.x,.2,d.z);scene.add(proxy);const board=cube(proxy,2.7,1.6,.16,'#e9d9aa',0,2.1,d.d?d.d/2:4);register(proxy,{kind:'county',countyId:d.id,x:d.x,z:d.z,approach:d.approach});
  if(!PLOTS.some(p=>p.id===d.id)){if(d.id!=='racegate')block(d.x,d.z,14,10);}
 }
 function label(parent,text,x,y,z){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');ctx.fillStyle='#f8edce';ctx.fillRect?.(0,0,512,96);ctx.fillStyle='#304e40';ctx.font='bold 30px system-ui';ctx.textAlign='center';ctx.fillText(text,256,60);const sprite=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(canvas),depthTest:true}));sprite.position.set(x,y,z);sprite.scale.set(8,1.5,1);parent.add(sprite);}
 const businesses=[];
 function house(parent,x,z,color,w=14,d=10,h=5){const dest=DESTINATIONS.find(d=>d.x===x&&d.z===z)||DESTINATIONS.find(d=>d.id==='spring-well'&&x===88),kind=dest?.id==='county-mill'?'mill':dest?.id==='depot'?'depot':dest?.id==='spring-well'?'water':dest?.id==='supply'?'exchange':'shop';const business=createBusiness(kind,{w,d,h});business.root.position.set(x,.2,z);parent.add(business.root);businesses.push(business);if(dest)register(business.root,{kind:'county',countyId:dest.id,x:dest.x,z:dest.z,approach:dest.approach});}

 function chunk(name,x,z,build){const group=new T.Group();group.name=name;scene.add(group);chunks.push({group,x,z,build,loaded:false});return group;}
 chunk('Village district',-72,10,g=>{house(g,-72,17,'#d2bc8c');house(g,-72,-7,'#b9c9ac');label(g,'VILLAGE CO-OP',-72,8,17);label(g,'COUNTY EXCHANGE',-72,8,-7);for(const x of [-83,-61]){cube(g,.25,5,.25,'#5f6b5f',x,2.7,6);cube(g,1.2,.25,1.2,'#eee1ad',x,5.3,6);}});
 chunk('Delivery district',-72,-55,g=>{house(g,-72,-55,'#b5bfc0',16,12,5.5);label(g,'DELIVERY DEPOT',-72,9,-55);for(let i=0;i<5;i++)cube(g,1.2,1.2,1.2,'#ba9668',-65+i*1.5,.85,-46);});
 block(82,56.8,1.3,1.3);block(82,67.2,1.3,1.3);
 chunk('Meadow Park gateway',82,62,g=>{for(const z of [56.8,67.2])cube(g,1.3,6,1.3,'#bba77d',82,3.2,z);cube(g,1.4,1.1,11.7,'#436851',82,6.4,62);label(g,'MEADOW PARK',82,8,62);});
 for(const p of PLOTS){const root=chunk(p.name,p.x,p.z,g=>{
  const ground=cube(g,p.w,.04,p.d,p.kind==='field'?'#876548':'#9eaf77',p.x,.25,p.z);
  const furrows=[];const growth=new T.Group();g.add(growth);const ready=new T.Group();g.add(ready);cube(ready,.12,2.7,.12,'#aa9063',p.x,1.6,p.z);cube(ready,1,.3,1,'#f3d57d',p.x,3,p.z);
  if(p.kind==='field'){for(let i=0;i<8;i++){furrows.push(cube(g,p.w-2,.12,.35,'#5d4738',p.x,.32,p.z-p.d/2+1.6+i*2.3));}}
  if(p.kind==='field')growth.add(createFieldCrop(p.x,p.z,p.w,p.d));
  let orchard;if(p.kind==='orchard'){orchard=createOrchard(p.x,p.z);g.add(orchard.root);}
  if(p.kind==='well'){house(g,p.x+3,p.z,'#c1c3a8',9,7,3);const tank=new T.Mesh(new T.CylinderGeometry(2.4,2.4,5,14),material('#9bbdb9'));tank.position.set(p.x-6,2.8,p.z);g.add(tank);cube(growth,5,.3,.3,'#708b85',p.x-2,1,p.z);}
  if(p.kind==='mill'){house(g,p.x,p.z,'#baad88',14,10,5);cube(growth,2.4,4,2.4,'#d7cfb2',p.x+8,2.2,p.z);}
  for(const x of [-1,1])for(const z of [-1,1])cube(g,.18,1.5,.18,'#c9b486',p.x+x*p.w/2,.95,p.z+z*p.d/2);
  label(g,p.name.toUpperCase(),p.x,p.kind==='mill'?12:8,p.z);plots.set(p.id,{root:g,ground,growth,ready,furrows,orchard});
 });}
 // Procedural border groves share geometry/materials; one instanced draw per grove.
 for(const [cx,cz]of [[-84,58],[42,-70],[88,-62],[16,69]])chunk('County grove',cx,cz,g=>treeGrove(g,cx,cz,18,11));
 const vans=[]; // Named residents now drive real errands instead of looping ambient vans.

 const loop=[[-46,-34],[62,-34],[62,42],[-46,42]],lengths=loop.map((p,i)=>Math.hypot(p[0]-loop[(i+1)%4][0],p[1]-loop[(i+1)%4][1])),total=lengths.reduce((a,b)=>a+b,0);
 function update(dt,player,state,focus=player){const c=ensureCounty(state);for(const b of businesses)b.update(dt);for(const ch of chunks){const near=Math.min(Math.hypot(player.x-ch.x,player.z-ch.z),Math.hypot(focus.x-ch.x,focus.z-ch.z))<(mobile?66:90);if(near&&!ch.loaded){ch.build(ch.group);ch.loaded=true;}ch.group.visible=near;}
  for(const [id,v]of plots){const r=c.plots[id];v.ground.visible=!!r;for(const f of v.furrows)f.visible=!!r;v.growth.visible=!!r&&!!r.job;v.orchard?.update(r,state.day);v.ready.visible=growthReady(r?.job,state.day);if(PLOTS.find(p=>p.id===id).kind==='field')v.growth.scale.y=r?.job ? .04+.96*growthProgress(r.job,state.day):.2;if(PLOTS.find(p=>p.id===id).kind==='field')v.growth.position.y=.3*(1-v.growth.scale.y);}
  for(const v of vans){v.actor.update(dt*4);v.t=(v.t+dt*4)%total;let t=v.t,i=0;while(t>lengths[i]&&i<3){t-=lengths[i];i++;}const a=loop[i],b=loop[(i+1)%4],f=t/lengths[i];v.root.position.set(a[0]+(b[0]-a[0])*f,.22,a[1]+(b[1]-a[1])*f);v.root.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);v.root.visible=Math.hypot(v.root.position.x-player.x,v.root.position.z-player.z)<(mobile?65:100);}
 }
 return {chunks,plots,vans,update};
}
