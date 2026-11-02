import * as T from './three.module.js';
// Original scene detail; no external textures or per-frame allocations.
export function plantMaize({scene,box,cyl,ball,mats}){
 const crops=[];const leafMat=new T.MeshStandardMaterial({color:'#548746',roughness:.8,side:T.DoubleSide});
 const shape=new T.Shape();shape.moveTo(0,0);shape.quadraticCurveTo(.5,.4,.95,.06);shape.quadraticCurveTo(.48,.13,0,-.035);const leafGeo=new T.ShapeGeometry(shape,7);
 for(let i=0;i<5;i++){const x=-9+i*2.4;box(2.1,.13,7,'#73513a',x,.25,15);for(let f=0;f<3;f++)box(.08,.035,7,'#9b7651',x+(f-1)*.65,.34,15);
 for(let j=0;j<7;j++){let g=new T.Group();g.position.set(x+(j%2)*.12,.34,12+j);g.rotation.y=i*.9+j*1.7;scene.add(g);cyl(.043,1.6,'#668943',0,.8,0,g);
 for(let k=0;k<6;k++){let pivot=new T.Group();pivot.position.y=.28+k*.2;pivot.rotation.y=k*2.4;g.add(pivot);let leaf=new T.Mesh(leafGeo,leafMat);leaf.rotation.z=.25-k*.08;leaf.rotation.x=.25;leaf.castShadow=true;pivot.add(leaf);}
 const kernels=new T.InstancedMesh(new T.SphereGeometry(.035,7,5),new T.MeshStandardMaterial({color:'#f1d36f',roughness:.9}),24);kernels.castShadow=true;g.add(kernels);let kernelIndex=0;for(let side of [-1,1]){let cob=new T.Group();cob.position.set(side*.12,.95+side*.1,0);cob.rotation.z=-side*.3;g.add(cob);ball(.12,'#dcb94f',0,0,0,cob,[.7,2.1,.7]);cob.updateMatrix();for(let k=0;k<4;k++)for(let c=0;c<3;c++){const m=new T.Matrix4().makeTranslation(Math.sin(c*2.1)*.08,-.14+k*.085,Math.cos(c*2.1)*.08);kernels.setMatrixAt(kernelIndex++,m.premultiply(cob.matrix));}}
 for(let k=0;k<4;k++){let tassel=box(.025,.32,.025,'#d3bc75',Math.sin(k*2)*.07,1.68,Math.cos(k*2)*.07,g);tassel.rotation.z=Math.sin(k*2)*.4;}crops.push(g);}}
 return {update(harvested){for(let i=0;i<crops.length;i++)crops[i].scale.set(1,harvested?.24:1,1);}};
}
export function detailBuildings({worldBuildings,box,cyl,ball,mats}){
 for(const b of worldBuildings){let {g,w,d}=b;box(w+.25,.3,d+.25,'#8e8774',0,.3,0,g);const h=b.label==='THE RED BARN'?4.8:b.label==='FEED MILL'?2.5:2.2;
 for(const side of [-1,1]){let x=side*w*.34;box(.055,h*.23,.15,mats.white,x,h*.62,d/2+.18,g);box(w*.17,.045,.15,mats.white,x,h*.62,d/2+.18,g);box(.15,h*.23,.12,'#596a50',x-w*.12,h*.62,d/2+.1,g);box(.15,h*.23,.12,'#596a50',x+w*.12,h*.62,d/2+.1,g);box(w*.24,.18,.45,'#71543c',x,h*.42,d/2+.3,g);for(let k=0;k<4;k++){ball(.12,'#668748',x+(k-1.5)*.2,h*.46,d/2+.3,g);ball(.055,k%2?'#e9b678':'#e4c3af',x+(k-1.5)*.2,h*.5,d/2+.3,g);}}
 for(const side of [-1,1]){let brace=box(w*.26,.07,.08,mats.white,side*w*.075,h*.38,d/2+.18,g);brace.rotation.z=-side*.65;ball(.045,'#493b2d',side*.15,h*.45,d/2+.19,g);}
 box(w+.3,.12,.16,'#655b4b',0,h+.08,d/2+.2,g);box(.12,h,.12,'#655b4b',w/2+.12,h/2,d/2+.2,g);cyl(.45,.85,'#866344',-w/2-.6,.65,d/2-.5,g);for(const y of [.4,.85])cyl(.46,.045,'#535748',-w/2-.6,y,d/2-.5,g);
 let lantern=new T.Mesh(new T.BoxGeometry(.17,.24,.16),new T.MeshStandardMaterial({color:'#ffe5a0',emissive:'#edbd68',emissiveIntensity:.55}));lantern.position.set(w*.22,h*.7,d/2+.2);g.add(lantern);
 }
}
