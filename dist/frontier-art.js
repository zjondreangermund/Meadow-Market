import * as T from './three.module.js';
import {batchScenery} from './scenery-batch.js';
// Original deterministic material surfaces; no external asset licence or request.
export function finishFrontierLandscape(scene,materials){
 let seed=4831;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 function grain(material,base,repeat,lines=false){
  const n=128,bytes=new Uint8Array(n*n*4);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   const variation=(random()-.5)*30+(lines?Math.sin(x*.6)*12:0),i=(y*n+x)*4;
   for(let c=0;c<3;c++)bytes[i+c]=Math.max(0,Math.min(255,base[c]+variation));bytes[i+3]=255;
  }
  const texture=new T.DataTexture(bytes,n,n);texture.colorSpace=T.SRGBColorSpace;
  texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(repeat,repeat);texture.needsUpdate=true;
  material.color.set('#ffffff');material.map=texture;material.bumpMap=texture;material.bumpScale=.055;
 }
 grain(materials.safe,[105,119,75],32);grain(materials.wild,[128,121,87],16);
 grain(materials.red,[142,117,89],28);grain(materials.road,[133,119,97],28);
 grain(materials.wood,[138,101,71],3,true);grain(materials.darkWood,[84,65,46],2,true);
 grain(materials.stone,[155,153,139],4);grain(materials.dirt,[101,76,52],3);
 // Distant foothills stay outside collision/play space. Flat road remains driveable.
 const terrain=new T.PlaneGeometry(800,800,56,56);terrain.rotateX(-Math.PI/2);
 const positions=terrain.attributes.position;
 for(let i=0;i<positions.count;i++){
  const x=positions.getX(i),z=positions.getZ(i),edge=Math.max(Math.abs(z)-76,Math.abs(x-40)-160,0);
  positions.setY(i,-.7+Math.min(24,edge*.16)*(1+Math.sin(x*.025)*Math.cos(z*.035)));
 }
 terrain.computeVertexNormals();const hills=new T.Mesh(terrain,new T.MeshStandardMaterial({color:'#787b62',roughness:1}));hills.position.x=40;scene.add(hills);
 // Instance dry grass in one draw rather than hundreds of separate plants.
 const blades=new T.InstancedMesh(new T.ConeGeometry(.13,.65,3),materials.cropLeaf,1800),dummy=new T.Object3D();
 for(let i=0;i<1800;i++){
  let x=-61+random()*218,z=-46+random()*92;
  if(Math.abs(z)<7||x<3&&x> -41&&z>9&&z<39){z=40+random()*6;}
  dummy.position.set(x,.25,z);dummy.rotation.set(0,random()*6.28,(random()-.5)*.3);dummy.scale.setScalar(.55+random()*.8);dummy.updateMatrix();blades.setMatrixAt(i,dummy.matrix);
 }
 scene.add(blades);
 const before=scene.children.length;batchScenery(scene);return {staticObjectsRemoved:before-scene.children.length};
}
