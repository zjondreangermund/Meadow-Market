import assert from 'node:assert/strict';
import * as T from '../dist/three.module.js';
import {replaceWithAnimatedHD} from '../dist/hd-rig-transfer.js';
import {HD_ASSETS,makeAnimatedHen} from '../dist/hd-animal-pack.js';
import {prepareHumanSurfaces} from '../dist/human-surfaces.js';

const makeRig=()=>{
 const group=new T.Group(),bone0=new T.Bone(),bone1=new T.Bone();
 bone0.name='Root';bone1.name='Head';bone1.position.set(0,1,0);bone0.add(bone1);group.add(bone0);
 const g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute([
  -.3,0,0,.3,0,0,0,1.4,0,
  -.25,1.2,.1,.25,1.2,.1,0,.6,.2
 ],3));
 g.setAttribute('skinIndex',new T.Uint16BufferAttribute([
 0,0,0,0,0,0,0,0,1,0,0,0,
 1,0,0,0,1,0,0,0,0,0,0,0
 ],4));
 g.setAttribute('skinWeight',new T.Float32BufferAttribute([
 1,0,0,0,1,0,0,0,1,0,0,0,
 1,0,0,0,1,0,0,0,1,0,0,0
 ],4));
 g.setIndex([0,1,2,3,4,5]);g.computeVertexNormals();
 const mesh=new T.SkinnedMesh(g,new T.MeshStandardMaterial({color:'white'}));mesh.name='low-res animal';group.add(mesh);
 group.updateMatrixWorld(true);mesh.bind(new T.Skeleton([bone0,bone1]));
 return {group,bone1,mesh};
};
const {group,bone1,mesh}=makeRig(),art=new T.Group();
const detailed=new T.Mesh(new T.SphereGeometry(.35,20,16),new T.MeshStandardMaterial({color:'#b48768'}));detailed.scale.y=2.6;detailed.position.y=.7;art.add(detailed);
const result=replaceWithAnimatedHD(group,art,{type:'horse'});
assert.equal(result.meshes.length,1);assert.ok(result.vertexCount>100);
assert.ok(result.hdTriangles>result.originalTriangles*5,'real new HD geometry, not just recolour');
assert.equal(mesh.visible,false);
const newMesh=result.meshes[0];assert.ok(newMesh.isSkinnedMesh);
assert.equal(newMesh.skeleton,mesh.skeleton,'use original animated skeleton');
assert.ok(newMesh.geometry.getAttribute('uv'),'real UVs preserved on high fidelity model');
assert.ok(newMesh.geometry.getAttribute('skinWeight'));
group.updateMatrixWorld(true);
const before=[],after=[];
for(let i=0;i<newMesh.geometry.getAttribute('position').count;i+=37)before.push(newMesh.getVertexPosition(i,new T.Vector3()).clone());
bone1.rotation.z=.35;group.updateMatrixWorld(true);
for(let i=0;i<newMesh.geometry.getAttribute('position').count;i+=37)after.push(newMesh.getVertexPosition(i,new T.Vector3()).clone());
assert.ok(after.some((v,i)=>v.distanceTo(before[i])>.005),'authored HD mesh actually deforms under moving rig bones');

const person=makeRig().group;
assert.equal(prepareHumanSurfaces(person),1);
const human=person.getObjectByName('low-res animal');
assert.ok(human.geometry.getAttribute('uv'),'human garment texture has UV coordinates');
assert.equal(person.userData.humanVisualVersion,'hd-fabric-uv-v5');

const chicken=new T.Group();
chicken.add(new T.Mesh(new T.SphereGeometry(.3,16,12),new T.MeshStandardMaterial({color:'#c2a76a'})));
const hen=makeAnimatedHen(chicken);
assert.ok(hen.model.userData.hdAssetInfo.animated);
const head=hen.model.getObjectByName('HenHead');
hen.animate(.1,1,true);assert.ok(head.rotation.x!==0,'the new HD bird rig pecks while working');
assert.ok(hen.meshes.every(o=>o.isSkinnedMesh));
assert.ok(Object.keys(HD_ASSETS).length>=6);
console.log('PASS: actual different HD mesh rigged and animated; human UV detail and independently animated hen.');
