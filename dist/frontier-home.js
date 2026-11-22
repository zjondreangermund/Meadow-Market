import {batchScenery} from './scenery-batch.js';
import * as T from './three.module.js';
import {buildHomeFarm} from './home-farm.js';
import {buildStable} from './stable.js';
import {detailBuildings,landscapeFarm,softBuildingBox} from './farm-art.js';
import {detailTexture} from './race-day.js';
import {upgradeAnimals,setAnimalMotion,animateRigDetails} from './animal-assets.js';
import {createFarmVehicle} from './vehicle-models.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
export const HOME_OFFSET=-16;
// Reuses the actual farm scene builder/stable/rigs. Historical progress is read
// for crop/horse appearance only. Frontier never writes meadow-cycle-v2.
export function createFrontierHome(scene){
 const root=new T.Group();root.name='Existing Meadow Market home farm';root.position.x=HOME_OFFSET;scene.add(root);
 const grain=detailTexture('wood',256),sand=detailTexture('sand',256),materials=new Map();
 function mat(color){if(!materials.has(color)){const earth=['#a7865c','#d8bd88','#73513a','#9b7651'].includes(color),m=new T.MeshStandardMaterial({color,roughness:.85,map:earth?sand:grain,bumpMap:earth?sand:grain,bumpScale:.025});materials.set(color,m);}return materials.get(color);}
 const mats=Object.fromEntries(Object.entries({grass:'#98b96d',soil:'#a7865c',path:'#d8bd88',wood:'#b28a55',white:'#fff4d8',red:'#bb6650',roof:'#675f52',leaf:'#749851',dark:'#4c4f3c'}).map(([k,v])=>[k,mat(v)]));
 function mesh(g,m,x=0,y=0,z=0,parent=root){const o=new T.Mesh(g,typeof m==='string'?mat(m):m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 const box=(w,h,d,m,x,y,z,p)=>mesh(w>2&&h>1&&d>2?softBuildingBox(w,h,d):new T.BoxGeometry(w,h,d),m,x,y,z,p);
 const cyl=(r,h,m,x,y,z,p)=>mesh(new T.CylinderGeometry(r,r,h,12),m,x,y,z,p);
 const ball=(r,m,x,y,z,p,scale=[1,1,1])=>{const o=mesh(new T.SphereGeometry(r,16,10),m,x,y,z,p);o.scale.set(...scale);return o;};
 const obstacles=[],block=(x,z,w,d)=>obstacles.push({x,z,w:w/2+.5,d:d/2+.5});
 box(4,.04,45,mats.path,0,.12,0);box(48,.04,3.5,mats.path,0,.13,6);
 const home=buildHomeFarm({scene:root,mesh,box,cyl,ball,mats,block});
 const register=(g)=>g;
 const stable=buildStable({scene:root,box,cyl,ball,mats,obstacles,register,worldBuildings:home.worldBuildings});
 detailBuildings({worldBuildings:home.worldBuildings,box,cyl,ball,mats});
 landscapeFarm({scene:root,box,cyl,ball,mats,obstacles});
 let original=null;try{const saved=JSON.parse(localStorage.getItem('meadow-cycle-v2')||'null');if(saved?.version===2)original=saved;}catch{}
 const visualState=original||{day:1,crop:null,cropBeds:[null,null,null,null]};home.cropArt.update(visualState);
 const animals=[];
 const herd=[['cow',-14,-1,'Daisy'],['cow',-10,1,'Clover'],['pig',9,-3,'Rosie'],['pig',14,-1,'Truffle'],['horse',5.5,-13,original?.horses?.[0]?.name||'Desert Dawn'],['horse',14.5,-13,original?.horses?.[1]?.name||'Copper Wind']];
 for(const [i,[type,x,z,name]]of herd.entries()){
  const g=new T.Group();g.position.set(x,.2,z);g.userData={name,appearanceKey:type==='horse'?(original?.horses?.[i-4]?.id||['dawn','copper'][i-4]):name};root.add(g);
  animals.push({g,type,x,z,legs:[],walkPhase:0,appearanceSlot:type==='horse'?(original?.horses?.[i-4]?.coatId||i-4):i%2,animationOffset:i*.27});
 }
 const animalReady=upgradeAnimals(animals);
 const props=[];const loader=new GLTFLoader();
 const propsReady=Promise.allSettled(['barrel','hay-bale','feed-bag','produce-crate','market-table'].map(async(name)=>{
  const gltf=await loader.loadAsync('./models/props/'+name+'.glb');
  for(const [x,z]of name==='barrel'?[[-17,-7],[-24,-8]]:name==='hay-bale'?[[6,-17],[15,-17]]:name==='market-table'?[[-27,-8]]:name==='produce-crate'?[[-28,-6],[-26,-6]]:[[-16,12]]){
   const o=gltf.scene.clone(true);o.name='Imported farm '+name;const b=new T.Box3().setFromObject(o);o.scale.setScalar((name==='hay-bale'?.9:name==='market-table'?1:.7)/(b.max.y-b.min.y));o.updateMatrixWorld(true);const fit=new T.Box3().setFromObject(o);o.position.set(x-(fit.min.x+fit.max.x)/2,.15-fit.min.y,z-(fit.min.z+fit.max.z)/2);root.add(o);props.push(o);
  }
 }));
 const tractor=createFarmVehicle('tractor');tractor.root.position.set(-5,.15,19);root.add(tractor.root);obstacles.push({x:-5,z:19,w:1.6,d:2.8});
 // Batch static furniture/building detail in the translated farm's local space.
 const staticDrawsSaved=batchScenery(root,{buildings:home.worldBuildings});
 batchScenery(stable.roof);batchScenery(stable.fronts);batchScenery(stable.g);
 // A farm-management return point keeps all original farming/racing actions available.
 home.sign('FARM EXCHANGE',-27,3,-7);home.sign('HOME / FARM MANAGEMENT',0,3,6);
 return {root,obstacles,stable,animals,props,staticDrawsSaved,cropArt:home.cropArt,worldBuildings:home.worldBuildings,ready:Promise.all([animalReady,propsReady,tractor.ready]),update(dt,p,time){stable.update({x:p.x-HOME_OFFSET,z:p.z});home.cropArt.update(visualState,time);for(const a of animals){setAnimalMotion(a,'idle');a.mixer?.update(dt);animateRigDetails(a,dt);}},originalRead:!!original};
}
