import assert from 'node:assert/strict';
import * as T from '../dist/three.module.js';
import {COATS,visualSeed,coatFor,applyAnimalCoat,applyChickenFeathers} from '../dist/coat-variants.js';
import {dressFarmer,applyRaceSilks} from '../dist/garment-materials.js';

assert.equal(visualSeed('dawn'),visualSeed('dawn'),'repeatable coat identity');
assert.notEqual(visualSeed('dawn'),visualSeed('copper'),'individual seeds differ');
for(const type of ['horse','cow','pig','chicken']){
 assert.ok(COATS[type].length>=4,type+' has multiple realistic coats');
 const ids=COATS[type].map((_,i)=>coatFor(type,'farm-animal-'+i,i).id);
 assert.equal(new Set(ids).size,ids.length,type+' patterns are distinct');
}
assert.equal(coatFor('horse','dawn',0).id,'bay-star');
assert.equal(coatFor('horse','copper',1).id,'chestnut-stripe');

const one=new T.Group(),two=new T.Group();
one.add(new T.Mesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({color:'white'})));
two.add(new T.Mesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({color:'white'})));
applyAnimalCoat(one,'horse','dawn',0);
applyAnimalCoat(two,'horse','copper',1);
assert.equal(one.userData.coatId,'bay-star');
assert.equal(two.userData.coatId,'chestnut-stripe');
assert.notEqual(one.children[0].material.color.getHex(),two.children[0].material.color.getHex(),'individual coats differ even without a browser canvas');
const chicken=new T.Group(),feather=new T.Mesh(new T.SphereGeometry(1),new T.MeshStandardMaterial({color:'#eee3bd'}));chicken.add(feather);
applyChickenFeathers(chicken,'layer-1',1,'#eee3bd');
assert.equal(chicken.userData.coatId,'barred');

const clothing=new T.Group(),body=new T.Mesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({color:'white'}));body.name='Farmer_Body';clothing.add(body);
dressFarmer(clothing,'lady');assert.ok(body.material.roughness>.7);
const jersey=new T.MeshStandardMaterial({color:'white'});jersey.userData.teamSilk=true;
const rider=new T.Group();rider.add(new T.Mesh(new T.BoxGeometry(1,1,1),jersey));
const cloth=new T.MeshStandardMaterial({color:'white'});applyRaceSilks(rider,cloth,'#1155bb',2);
assert.equal(jersey.color.getHexString(),'1155bb','headless fallback silk colour');
console.log('PASS: unique stable animal identity, hero racehorse coats and PBR workwear/silks.');
