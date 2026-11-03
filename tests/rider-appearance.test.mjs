import fs from 'node:fs';import assert from 'node:assert/strict';
import * as T from '../dist/three.module.js';import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';import {createJockey} from '../dist/jockey.js';import {graphicsProfile,mobileDevice} from '../dist/graphics-profile.js';
globalThis.ProgressEvent=class{};globalThis.document={createElement(){return {getContext(){return {fillRect(){},fillText(){}}}}}};
GLTFLoader.prototype.loadAsync=async function(url){const b=fs.readFileSync(new URL('../dist/'+url.replace('./',''),import.meta.url));return this.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');};
const riders=[];
for(const [variant,number] of [['man',1],['lady',2],['man',3],['lady',4]]){
 const j=createJockey('#246ab4',number,variant);await j.userData.ready;j.userData.setOnFoot(true);j.userData.update(.1,0,{delta:.1});
 const model=j.userData.model;assert.ok(model.userData.athleticVertices>0,'upper-body mesh shape actually changes');
 let face;model.traverse(o=>{if(o.isSkinnedMesh&&/Head/.test(o.name)&&o.material.name==='Skin')face=o;});assert.ok(face&&face.visible,'face remains visible');
 const faceBounds=new T.Box3().setFromObject(face),helmetBounds=new T.Box3().setFromObject(j.userData.helmet);
 assert.ok(helmetBounds.min.y<faceBounds.max.y,'helmet rim overlaps scalp instead of floating');assert.ok(helmetBounds.max.y-faceBounds.max.y<.22,'helmet has fitted height');
 const hair=model.getObjectByName('Casual_Head_2'),hat=model.getObjectByName('Farmer_Head_2');if(hair)assert.equal(hair.visible,false);if(hat)assert.equal(hat.visible,false);
 let silk=false;model.traverse(o=>{if(o.isMesh&&/Body/.test(o.name)&&o.material.userData?.teamSilk)silk=true;});assert.ok(silk,'both male and female clothing receives racing silks');riders.push(j);
}
assert.equal(new Set(riders.map(j=>j.userData.appearance.skin)).size,4,'distinct rider identities');
globalThis.devicePixelRatio=3;assert.equal(graphicsProfile(false,true).pixelRatio,1);assert.equal(graphicsProfile(false,true).shadows,false);assert.equal(graphicsProfile(true,true).pixelRatio,1.5);assert.equal(graphicsProfile(false,true).maxFps,30);
globalThis.innerWidth=1000;globalThis.matchMedia=()=>({matches:true});assert.equal(mobileDevice(),true,'landscape phones use mobile settings');
console.log('PASS: fitted helmets, visible faces, removed hat/long hair conflicts, male/female silks, distinct identities, geometric athletic build and mobile graphics limits.');
