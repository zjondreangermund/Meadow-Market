import * as T from './three.module.js';
export function buildStable({scene,box,cyl,ball,mats,obstacles,register,worldBuildings}){
 const old=worldBuildings.find(b=>b.label==='MEADOW STABLES');if(old){scene.remove(old.g);worldBuildings.splice(worldBuildings.indexOf(old),1);}const oi=obstacles.findIndex(o=>o.x===10&&o.z===-12);if(oi>=0)obstacles.splice(oi,1);
 const g=new T.Group();scene.add(g);const roof=new T.Group();g.add(roof);const fronts=new T.Group();g.add(fronts);let gates=[];
 const wall=(x,z,w,d)=>obstacles.push({x,z,w:w/2+.35,d:d/2+.35});
 box(14,.08,10,'#c0a477',10,.2,-13,g);box(14,3.6,.25,'#bd9463',10,2,-18,g);wall(10,-18,14,.25);
 for(const x of [3,17]){box(.25,3.6,10,'#d2b07f',x,2,-13,g);wall(x,-13,.25,10)}
 for(const x of [5.5,14.5]){box(5,3.6,.25,'#c29b6c',x,2,-8,fronts);wall(x,-8,5,.25);box(2,1.1,.12,'#8ca9a0',x,2.4,-7.84,fronts);for(let j=0;j<8;j++)box(.035,3.5,.08,'#e6c895',x-2+j*.55,1.95,-7.82,fronts)}
 for(const x of [3,8,12,17])box(.22,4,.3,'#71563e',x,2.1,-8,g);
 box(4,.25,.4,'#71563e',10,4,-8,g);
 for(const side of [-1,1]){let r=box(7.7,.18,11,'#915f48',10+side*3.5,4.55,-13,roof);r.rotation.z=-side*.22;}box(.2,.2,11,'#704c3c',10,5.35,-13,roof);
 for(const x of [5.5,14.5]){box(3.8,.06,6.3,'#c8b16f',x,.28,-13.4,g);for(let j=0;j<35;j++){let straw=box(.35,.02,.025,'#dfc68d',x+Math.sin(j*3.7)*1.6,.32,-13.4+Math.cos(j*2.8)*2.6,g);straw.rotation.y=j}box(2,.55,1,'#bd9f55',x,.6,-16.9,g);for(let k=0;k<3;k++)box(.04,.5,1.05,'#927747',x-.7+k*.7,.6,-16.9,g)}
 for(const x of [7.5,12.5]){for(const z of [-16,-12,-10,-8.5])box(.13,2.2,.13,'#6a5743',x,1.4,z,g);for(const [z,d] of [[-15,6],[-8.8,.5]]){box(.12,1.3,d,'#aa895f',x,.95,z,g);for(let j=0;j<8;j++)box(.06,.8,.06,'#655f51',x,1.95,z-d/2+j*d/8,g);wall(x,z,.12,d)}let gate=new T.Group();gate.position.set(x,.25,-12);g.add(gate);box(.12,1.2,2,'#ad8c60',0,.8,1,gate);for(let k=0;k<5;k++)box(.06,.9,.06,'#655f51',0,1.85,k*.45+.1,gate);gate.rotation.y=x<10?-Math.PI/2:Math.PI/2;let st={kind:'gate',x,z:-11,approach:{x:10,z:-11},gate,open:true,obstacle:null};register(gate,st);gates.push(st);}
 // The structural shell is clickable; the open aisle has no hidden full-building collider.
 register(g,{kind:'stable',x:10,z:-13,approach:{x:10,z:-10}});for(const st of gates)register(st.gate,st);
 const lamp=new T.PointLight('#ffdf9b',4,14);lamp.position.set(10,3.4,-13);g.add(lamp);ball(.16,'#f4da9d',10,3.45,-13,g);
 return {g,roof,fronts,gates,inside:false,update(p){let inside=p.x>3&&p.x<17&&p.z< -7.5&&p.z> -18;roof.visible=!inside;fronts.visible=!inside;this.inside=inside;},toggle(st){if(st.obstacle){let i=obstacles.indexOf(st.obstacle);if(i>=0)obstacles.splice(i,1);st.obstacle=null;}st.open=!st.open;st.gate.rotation.y=st.open?(st.x<10?-Math.PI/2:Math.PI/2):0;if(!st.open){st.obstacle={x:st.x,z:-11,w:.45,d:1.25};obstacles.push(st.obstacle);}}};
}
