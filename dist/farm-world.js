import * as T from './three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
export const WORLD={minX:-32,maxX:44,minZ:-27,maxZ:28,width:82,depth:62,centerX:6};
export const TRAINING={x:31,z:-5,approach:{x:19,z:8}};
export function expandFarm({scene,box,cyl,ball,mats,block,register,sign}){
 const market=new T.Group();market.position.set(-27,0,-12);scene.add(market);const service=register(market,{kind:'market',x:-27,z:-12,approach:{x:-27,z:-6}});block(-27,-12,8,7);sign('MEADOW EXCHANGE',-27,6.5,-12);
 // A connected lane leads to an enclosed sand training arena.
 box(42,.04,3.5,mats.path,20,.19,6);box(3.5,.04,24,mats.path,-27,.19,-5);box(10,.04,3.5,mats.path,-23,.19,6);
 const pitch=new T.Group();pitch.name='Horse training arena';scene.add(pitch);const sand=new T.Mesh(new T.PlaneGeometry(23,35),new T.MeshStandardMaterial({color:'#c8ac81',roughness:1,bumpMap:mats.path.map,bumpScale:.05}));sand.rotation.x=-Math.PI/2;sand.position.set(31,.22,-5);sand.receiveShadow=true;pitch.add(sand);
 for(const side of [-1,1]){for(let i=0;i<=18;i++){const z=-22.5+i*1.95;if(side===-1&&z>5&&z<10)continue;box(.13,1.2,.13,'#e4d8b5',31+side*11.6,.82,z,pitch);if(i<18)for(const y of [.7,1.25])box(.09,.09,1.95,'#e4d8b5',31+side*11.6,y,z+.97,pitch);}for(let i=0;i<12;i++){const x=19.5+i*2;box(.13,1.2,.13,'#e4d8b5',x,.82,-5+side*17.6,pitch);if(i<11)for(const y of [.7,1.25])box(2,.09,.09,'#e4d8b5',x+1,y,-5+side*17.6,pitch);}}
 for(let i=0;i<6;i++){const pole=box(.13,.13,3.5,i%2?'#f6eee0':'#857c65',24+i*1.1,.3,-10,pitch);pole.rotation.y=.2;}
 for(const x of [35,39]){box(.16,1.9,.16,'#fbf1d4',x,1.15,-8,pitch);box(.65,.12,.65,'#756c58',x,.29,-8,pitch);}for(const y of [.8,1.25])box(4.2,.1,.1,'#d3a15b',37,y,-8,pitch);
 register(pitch,{kind:'training',x:31,z:-5,approach:TRAINING.approach});block(19.4,-8.75,.16,27.5);block(19.4,11.3,.16,2.6);block(42.6,-5,.16,35.2);block(31,-22.6,23.2,.16);block(31,12.6,23.2,.16);sign('TRAINING GROUNDS',24,3,12);
 const files=['market-hall','lantern','barrel','hay-bale','produce-crate','market-table','apple','feed-bag'],assets=new Map(),loaded=[];
 const ready=Promise.allSettled(files.map(async name=>{const a=await new GLTFLoader().loadAsync('./models/props/'+name+'.glb');assets.set(name,a.scene);return name;})).then(results=>{
  function place(name,x,z,height,rotation=0,parent=scene,y=.2){const src=assets.get(name);if(!src)return null;const m=src.clone(true);m.name='Authored '+name;const b=new T.Box3().setFromObject(m);m.scale.multiplyScalar(name==='market-hall'?Math.min(height/(b.max.y-b.min.y),7.4/(b.max.x-b.min.x),6.4/(b.max.z-b.min.z)):height/(b.max.y-b.min.y));m.updateMatrixWorld(true);const fit=new T.Box3().setFromObject(m);m.position.set(x-(fit.max.x+fit.min.x)/2,y-fit.min.y,z-(fit.max.z+fit.min.z)/2);m.rotation.y=rotation;m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;for(const mat of Array.isArray(o.material)?o.material:[o.material])for(const key of ['map','normalMap','roughnessMap','metalnessMap'])if(mat[key])mat[key].anisotropy=4;}});parent.add(m);loaded.push(m);return m;}
  const hall=place('market-hall',0,0,5.5,0,market);if(hall)hall.traverse(o=>{if(o.isMesh)o.userData.station=service.userData.station;});
  for(const [x,z]of [[-29,-7.3],[-25,-7.3]]){const table=place('market-table',x,z,.95);if(table)register(table,{kind:'market',x,z,approach:{x,z:z+1.2}});place('produce-crate',x,z,.5,0,scene,1.14);for(let i=0;i<4;i++)place('apple',x+(i%2-.5)*.2,z+(Math.floor(i/2)-.5)*.2,.16,0,scene,1.48);}
  for(const [x,z]of [[-31,-8],[-22,-15],[-14,9],[17,11]])place('barrel',x,z,1.0);
  for(const [x,z]of [[-13,-13],[15,-16],[22,-20]])place('hay-bale',x,z,.85);
  place('market-table',-11,9.3,1);place('feed-bag',-11,9.3,.35,0,scene,1.2);
  for(const [x,z]of [[-25,-16],[-16,12],[-13,9]])place('feed-bag',x,z,.7);
  for(const [x,z]of [[-30,-6],[-24,-6],[18,8],[20,-20]])place('lantern',x,z,1.45);
  // Re-register the real meshes after loading so taps hit the actual hall and shop furniture.
  register(market,{kind:'market',x:-27,z:-12,approach:{x:-27,z:-6}});
  return {loaded:results.filter(r=>r.status==='fulfilled').length,failed:results.filter(r=>r.status==='rejected').length};
 });
 return {ready,market,pitch,loaded};
}
