import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as T from '../dist/three.module.js';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {applyAnimalCoat,COATS,horseCoatId,ensureCoatUV} from '../dist/coat-variants.js';

globalThis.ProgressEvent=class ProgressEvent {constructor(type,options={}){Object.assign(this,{type},options)}};
const calls={canvas:0,fill:0};
globalThis.document={createElement(tag){
 assert.equal(tag,'canvas');calls.canvas++;
 return {width:512,height:512,getContext(){return {
  fillRect(){calls.fill++},beginPath(){},moveTo(){},lineTo(){},closePath(){},
  fill(){},ellipse(){},save(){},restore(){},translate(){},rotate(){},stroke(){},globalAlpha:1
 };}};
}};

const file=fs.readFileSync(new URL('../dist/models/horse.gltf',import.meta.url),'utf8');
const horse=await new GLTFLoader().parseAsync(file,'');
const skins=[];
horse.scene.traverse(o=>{if(o.isSkinnedMesh)skins.push(o);});
assert.ok(skins.length>=1,'actual skinned horse geometry exists');
const original=skins[0].geometry;
assert.equal(original.getAttribute('uv'),undefined,'the original source horse truly lacks UV coordinates');

const coat=applyAnimalCoat(horse.scene,'horse','dawn',horseCoatId({id:'dawn'}));
assert.equal(coat.id,'piebald','existing Desert Dawn gets clearly patterned coat');
assert.equal(horse.scene.userData.coatId,'piebald');
assert.ok(calls.canvas>=1,'new coat atlas painted in browser canvas');
assert.ok(calls.fill>100,'visible markings and fibre detail painted');
const textured=[];
horse.scene.traverse(o=>{
 if(!o.isSkinnedMesh)return;
 assert.ok(o.geometry.getAttribute('skinIndex'),'skeleton retained');
 assert.ok(o.geometry.getAttribute('skinWeight'),'skin weights retained');
 for(const m of (Array.isArray(o.material)?o.material:[o.material])){
  if(m.map){assert.ok(o.geometry.getAttribute('uv'),'projection generated on real rigged mesh');textured.push(m);}
 }
});
assert.ok(textured.length>=3,'multiple actual skinned horse materials now display patterned maps');
assert.notEqual(skins[0].geometry,original,'individual geometry must not mutate the shared source mesh');

applyAnimalCoat(horse.scene,'horse','copper','buckskin');
assert.equal(horse.scene.userData.coatId,'buckskin');
assert.ok(textured[0].map!==skins[0].material.map,'different coats use different painted atlases');

assert.equal(horseCoatId({id:'dawn',coatId:'dapple-grey'}),'dapple-grey','player-selected coat remains authoritative');
assert.equal(horseCoatId({id:'copper'}),'buckskin','second original horse has contrasting default');
assert.ok(COATS.horse.length>=6);
console.log('PASS: real UV-less skinned horse now renders unique patterned coat maps, retains skeleton and supports stable options.');
