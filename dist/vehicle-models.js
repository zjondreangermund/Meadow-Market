import * as T from './three.module.js';
export function createFarmVehicle(type,color){
 const root=new T.Group();root.name=type==='tractor'?'Player electric tractor':'Player delivery pickup';const wheels=[],steer=[],mats=new Map();
 const mat=c=>{if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.7}));return mats.get(c);};
 function box(w,h,d,c,x,y,z,parent=root){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=false;m.receiveShadow=true;parent.add(m);return m;}
 const tractor=type==='tractor';box(2,.35,4.4,'#414c46',0,.65,0);box(1.65,1,tractor?2:1.7,color,0,1.35,1.15);box(2,1.3,1.7,'#acc7c0',0,1.8,-.55);box(2.2,.16,2,color,0,2.54,-.55);box(1.8,.65,.1,'#6c8b87',0,1.93,.34);box(1.9,.18,2,color,0,1.1,-.65);box(.22,1.45,.22,'#4c5a54',-.7,2,1.4);box(1.5,.55,.13,'#3f4c46',0,1.2,2.2);
 for(const x of [-.65,.65])box(.36,.25,.12,'#ffebbb',x,1.43,2.28);
 for(const x of [-1.05,1.05])for(const z of [-1.35,1.35]){const pivot=new T.Group();pivot.position.set(x,tractor&&z<0?.85:.62,z);root.add(pivot);if(z>0)steer.push(pivot);const spin=new T.Group();pivot.add(spin);const wheel=new T.Mesh(new T.CylinderGeometry(tractor&&z<0?.85:.62,tractor&&z<0?.85:.62,.5,14),mat('#303a32'));wheel.rotation.z=Math.PI/2;spin.add(wheel);const hub=new T.Mesh(new T.CylinderGeometry(.25,.25,.53,10),mat('#c3c9b3'));hub.rotation.z=Math.PI/2;spin.add(hub);wheels.push(spin);if(tractor&&z<0)box(.6,.18,1.95,color,x,1.82,z);}
 let cargo;const tool=new T.Group();root.add(tool);
 if(tractor){box(2.7,.16,1.1,'#946c4c',0,.55,-3.15,tool);for(let i=0;i<5;i++){const tine=box(.12,.65,.12,'#59655d',-1.1+i*.55,.4,-3.45,tool);tine.rotation.x=.35;}box(.17,.18,1.5,'#606d58',0,.65,-2.4,tool);}else{box(2.15,.25,2.1,color,0,1,-2);for(const side of [-1,1])box(.12,.6,2.1,color,side*1.03,1.35,-2);box(2.15,.6,.12,color,0,1.35,-3);cargo=new T.Group();root.add(cargo);for(let i=0;i<4;i++)box(.75,.65,.65,'#bc9765',(i%2-.5)*.9,1.45,-1.5-Math.floor(i/2)*.8,cargo);}
 return {root,wheels,cargo,update(distance,turn=0,hasCargo=false,working=false){for(const w of wheels)w.rotation.x+=distance/.7;for(const w of steer)w.rotation.y=turn*.3;if(cargo)cargo.visible=hasCargo;tool.position.y=working?0:.25;}};
}
