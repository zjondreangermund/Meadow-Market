import assert from 'node:assert/strict';
import {createRace,stepRace,raceOrder,replayRace} from '../dist/race-engine.js';
const horse={id:'dawn',name:'Desert Dawn',speed:72,stamina:82,power:65,energy:100,condition:70};
const inputs=[{tick:0,pace:'save',lane:0},{tick:500,pace:'cruise',lane:2},{tick:900,pace:'push',lane:3,burst:true}];
for(const metres of [400,800,1600]){const a=replayRace(horse,metres,42,inputs),b=replayRace(horse,metres,42,inputs);assert.ok(a.done);assert.deepEqual(a,b);assert.equal(raceOrder(a).length,6);for(const h of a.runners){assert.ok(Number.isFinite(h.finish)&&h.finish>0);assert.equal(h.distance,metres);assert.ok(h.reserve>=0&&h.reserve<=100);assert.ok(h.lane>=0&&h.lane<=5);}assert.equal(a.events.filter(e=>e.id==='player'&&e.type==='burst').length,1);}
const saving=replayRace(horse,800,1,[{tick:0,pace:'save'}]),pushing=replayRace(horse,800,1,[{tick:0,pace:'push'}]);assert.ok(saving.runners[0].reserve>pushing.runners[0].reserve);
const fresh=replayRace(horse,400,2,[]),tired=replayRace({...horse,energy:0,condition:20},400,2,[]);assert.ok(fresh.runners[0].finish<tired.runners[0].finish);
const race=createRace(horse,800,9);for(let i=0;i<1000;i++)stepRace(race,{pace:'push',lane:5,burst:true});assert.equal(race.events.filter(e=>e.id==='player'&&e.type==='burst').length,1);assert.throws(()=>createRace(horse,100));assert.equal(horse.energy,100);
// Mid-race replay must reproduce exact state, with no frame-rate dependency.
const r1=createRace(horse,800,33),r2=createRace(horse,800,33);for(let i=0;i<2000;i++)stepRace(r1,{pace:'cruise',lane:1});for(let batch=0;batch<100;batch++)for(let i=0;i<20;i++)stepRace(r2,{pace:'cruise',lane:1});assert.deepEqual(r1,r2);
console.log('PASS: all distances, seeded replay, stamina trade-offs, health, one burst, bounded lanes and frame-independent stepping.');
