import * as T from './three.module.js';
import {FIELD,cropStage,cropProgress,CROPS} from './crops.js?v=simulation15';
// Original scene detail; no external textures or per-frame allocations.
export function plantMaize({scene,box,cyl,ball,mats}){
 const crops=[];const leafMat=new T.MeshStandardMaterial({color:'#548746',roughness:.8,side:T.DoubleSide});
 const shape=new T.Shape();shape.moveTo(0,0);shape.quadraticCurveTo(.5,.4,.95,.06);shape.quadraticCurveTo(.48,.13,0,-.035);const leafGeo=new T.ShapeGeometry(shape,7);
 const beds=[];for(let i=0;i<4;i++){const x=-12+i*2.4;const bed=box(1.95,.15,9.4,'#684a36',x,.25,15.3);beds.push(bed);for(const side of [-1,1])box(.07,.18,9.5,'#c5a77a',x+side*.98,.29,15.3);for(const end of [-1,1])box(2.02,.18,.07,'#c5a77a',x,.29,15.3+end*4.75);for(let f=0;f<3;f++)box(.045,.025,9.2,'#96734f',x+(f-1)*.6,.34,15.3);
 for(let j=0;j<7;j++){let g=new T.Group();g.position.set(x+(j%2)*.12,.34,11.7+j*1.2);g.rotation.y=i*.9+j*1.7;scene.add(g);cyl(.043,1.6,'#668943',0,.8,0,g);
 for(let k=0;k<6;k++){let pivot=new T.Group();pivot.position.y=.28+k*.2;pivot.rotation.y=k*2.4;g.add(pivot);let leaf=new T.Mesh(leafGeo,leafMat);leaf.rotation.z=.25-k*.08;leaf.rotation.x=.25;leaf.castShadow=true;pivot.add(leaf);}
 const fruit=new T.Group();g.add(fruit);const kernels=new T.InstancedMesh(new T.SphereGeometry(.035,7,5),new T.MeshStandardMaterial({color:'#f1d36f',roughness:.9}),24);kernels.castShadow=true;fruit.add(kernels);let kernelIndex=0;for(let side of [-1,1]){let cob=new T.Group();cob.position.set(side*.12,.95+side*.1,0);cob.rotation.z=-side*.3;fruit.add(cob);ball(.12,'#dcb94f',0,0,0,cob,[.7,2.1,.7]);cob.updateMatrix();for(let k=0;k<4;k++)for(let c=0;c<3;c++){const m=new T.Matrix4().makeTranslation(Math.sin(c*2.1)*.08,-.14+k*.085,Math.cos(c*2.1)*.08);kernels.setMatrixAt(kernelIndex++,m.premultiply(cob.matrix));}}
 for(let k=0;k<4;k++){let tassel=box(.025,.32,.025,'#d3bc75',Math.sin(k*2)*.07,1.68,Math.cos(k*2)*.07,g);tassel.rotation.z=Math.sin(k*2)*.4;}g.userData.fruit=fruit;g.userData.bed=i;g.userData.maizeChildren=[...g.children];g.visible=false;crops.push(g);}}
 // Alternate plants use their own geometry, retained inside their assigned bed.
 for(const g of crops){const variants={};for(const type of ['wheat','sunflower','vegetables']){const plant=new T.Group();g.add(plant);variants[type]=plant;
 if(type==='vegetables'){for(let i=0;i<5;i++){const leaf=ball(.22,'#517c40',Math.sin(i*1.4)*.12,.18,Math.cos(i*1.4)*.12,plant,[1,.55,1]);leaf.rotation.z=i*.5;}}
 else{const h=type==='wheat'?1:2.1;cyl(.025,h,'#71914c',0,h/2,0,plant);if(type==='wheat'){for(let i=0;i<7;i++)ball(.055,'#d8be77',Math.sin(i*2)*.04,.65+i*.045,Math.cos(i*2)*.04,plant,[1,1.5,1]);}else{ball(.16,'#694e31',0,1.95,0,plant,[1,1,.4]);for(let i=0;i<12;i++)ball(.1,'#f1c847',Math.sin(i*Math.PI/6)*.23,1.95+Math.cos(i*Math.PI/6)*.23,0,plant,[.7,1.6,.3]);for(let i=0;i<4;i++)ball(.2,'#527c45',Math.sin(i*2)*.13,.4+i*.3,0,plant,[1.5,.35,.8]);}}
 }g.userData.variants=variants;}
 return {crops,beds,bounds:FIELD,update(state,time=0){for(let i=0;i<crops.length;i++){const g=crops[i],bed=g.userData.bed,record=state.cropBeds?state.cropBeds[bed]:bed===0?state.crop:null,stage=cropStage(state,bed),type=record?.type||'maize',p=cropProgress(state,bed),scale=stage==='planted'?.045:.06+.94*p;g.visible=stage!=='empty';g.scale.setScalar(scale);for(const c of g.userData.maizeChildren)c.visible=type==='maize';g.userData.fruit.visible=type==='maize'&&p>.65;for(const [key,plant]of Object.entries(g.userData.variants))plant.visible=key===type;g.rotation.z=Math.sin(time*1.4+i*.8)*.018;}}};

}
export function detailBuildings({worldBuildings,box,cyl,ball,mats}){
 for(const b of worldBuildings){let {g,w,d}=b;box(w+.25,.3,d+.25,'#8e8774',0,.3,0,g);const h=b.label==='THE RED BARN'?4.8:b.label==='FEED MILL'?2.5:2.2;
 for(const side of [-1,1]){let x=side*w*.34;box(.055,h*.23,.15,mats.white,x,h*.62,d/2+.18,g);box(w*.17,.045,.15,mats.white,x,h*.62,d/2+.18,g);box(.15,h*.23,.12,'#596a50',x-w*.12,h*.62,d/2+.1,g);box(.15,h*.23,.12,'#596a50',x+w*.12,h*.62,d/2+.1,g);box(w*.24,.18,.45,'#71543c',x,h*.42,d/2+.3,g);for(let k=0;k<4;k++){ball(.12,'#668748',x+(k-1.5)*.2,h*.46,d/2+.3,g);ball(.055,k%2?'#e9b678':'#e4c3af',x+(k-1.5)*.2,h*.5,d/2+.3,g);}}
 for(const side of [-1,1]){let brace=box(w*.26,.07,.08,mats.white,side*w*.075,h*.38,d/2+.18,g);brace.rotation.z=-side*.65;ball(.045,'#493b2d',side*.15,h*.45,d/2+.19,g);}
 box(w+.3,.12,.16,'#655b4b',0,h+.08,d/2+.2,g);box(.12,h,.12,'#655b4b',w/2+.12,h/2,d/2+.2,g);
 let lantern=new T.Mesh(new T.BoxGeometry(.17,.24,.16),new T.MeshStandardMaterial({color:'#ffe5a0',emissive:'#edbd68',emissiveIntensity:.55}));lantern.position.set(w*.22,h*.7,d/2+.2);g.add(lantern);
 }
}

// Purpose-built rounded building shells keep the little world crisp at close zoom.
export function softBuildingBox(w,h,d){const r=Math.min(.1,w*.05,h*.06,d*.06),shape=new T.Shape();shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const geo=new T.ExtrudeGeometry(shape,{depth:d-2*r,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:r*.4,bevelThickness:r,curveSegments:3});geo.translate(0,0,-d/2+r);return geo;}
export function orchardTree(scene,x,z,k=1){const root=new T.Group();root.position.set(x,0,z);root.scale.setScalar(k);scene.add(root);const bark=new T.MeshStandardMaterial({color:'#927246',roughness:.9}),leaf=new T.MeshStandardMaterial({color:'#659249',roughness:.9});const trunk=new T.Mesh(new T.CylinderGeometry(.17,.29,2.8,9),bark);trunk.position.y=1.5;trunk.castShadow=true;root.add(trunk);for(let i=0;i<3;i++){const branch=new T.Mesh(new T.CylinderGeometry(.07,.13,1.4,8),bark);branch.position.set(Math.sin(i*2.1)*.48,2.5,Math.cos(i*2.1)*.48);branch.rotation.z=.6;branch.rotation.y=i*2.1;branch.castShadow=true;root.add(branch);}const leaves=new T.InstancedMesh(new T.IcosahedronGeometry(.36,1),leaf,85),fruit=new T.InstancedMesh(new T.SphereGeometry(.095,10,8),new T.MeshStandardMaterial({color:'#dc8a4c',roughness:.58}),12),dummy=new T.Object3D();for(let i=0;i<85;i++){const a=i*2.399,r=Math.sqrt(i/85)*1.45;dummy.position.set(Math.cos(a)*r,3.2+Math.sin(i*8.2)*.8,Math.sin(a)*r);dummy.scale.set(1+(i%3)*.2,.8,1);dummy.rotation.set(i*.8,i*2,i);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);leaves.setColorAt(i,new T.Color(['#618d45','#79a45a','#90b46b'][i%3]));}leaves.castShadow=true;root.add(leaves);for(let i=0;i<12;i++){const a=i*2.399;dummy.position.set(Math.sin(a)*1.1,2.7+(i%3)*.3,Math.cos(a)*1.1);dummy.rotation.set(0,0,0);dummy.scale.setScalar(1);dummy.updateMatrix();fruit.setMatrixAt(i,dummy.matrix);}root.add(fruit);return root;}
export function landscapeFarm({scene,box,cyl,ball,mats,obstacles}){
 const group=new T.Group();group.name='Meadow garden details';scene.add(group);
 // Terracotta edging keeps the main cross and north/south walkway visually separate from planting.
 for(const side of [-1,1]){for(let i=0;i<30;i++){const z=-21+i*1.45;box(.14,.13,1.38,'#d9c69c',side*2.13,.23,z,group);}for(let i=0;i<32;i++){const x=-23+i*1.45;if(Math.abs(x)<2.4)continue;box(1.38,.13,.14,'#d9c69c',x,.23,6+side*1.85,group);}}
 // Fine joint lines and inlaid cobbles give the paths readable scale.
 for(let i=0;i<28;i++){const z=-20+i*1.5;for(let j=0;j<2;j++){const x=(j-.5)*1.8;box(1.68,.025,1.35,(i+j)%2?'#d8c39b':'#e4d0aa',x,.218,z,group);}}
 // Short warm lamps and flowers in the safe verge, away from the crop bounds.
 for(const [x,z]of [[-3.1,-18],[3.1,-6],[-3.1,8],[3.1,18]]){cyl(.07,1.3,'#6a7256',x,.87,z,group);box(.3,.35,.3,'#f3daa0',x,1.62,z,group);box(.42,.06,.42,'#6a7256',x,1.83,z,group);}
 const petals=new T.InstancedMesh(new T.SphereGeometry(.06,6,4),new T.MeshStandardMaterial({color:'#f4da9e',roughness:.9}),180),d=new T.Object3D();for(let i=0;i<180;i++){const side=i%2?1:-1,x=side*(24.7+(i%3)*.25),z=-18+(i/180)*38;d.position.set(x,.4+Math.sin(i)*.06,z);d.scale.set(1,.6,1);d.updateMatrix();petals.setMatrixAt(i,d.matrix);petals.setColorAt(i,new T.Color(['#f3ce7d','#e8a78e','#f2e7c4'][i%3]));}group.add(petals);
 return group;
}
