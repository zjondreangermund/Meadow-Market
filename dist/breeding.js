import {horsesFor,isAdultHorse} from './horses.js?v=breeding9';
import {COATS,visualSeed} from './coat-variants.js';
import {animalIdentity} from './animal-identity.js?v=breeding9';
export const BREEDING_RULES=Object.freeze({coins:200,feed:6,water:6,energy:30,minimumEnergy:75,minimumCondition:60,gestationDays:3,mareCooldown:7,sireCooldown:2,capacity:8});
const stats=['speed','stamina','power'];
function rng(seed){let n=seed>>>0;return ()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);}
function randomSeed(){const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);return bytes[0];}
function ancestors(h,list,depth=2){if(!h||!depth)return [];return (h.parentIds||[]).flatMap(id=>[id,...ancestors(list.find(x=>x.id===id),list,depth-1)]);}
export function pregnanciesFor(s){if(!Array.isArray(s.pregnancies))s.pregnancies=[];return s.pregnancies;}
export function readyBirths(s){return pregnanciesFor(s).filter(p=>!p.revealed&&s.day>=p.dueDay);}
export function breedingCandidates(s){return horsesFor(s).filter(h=>isAdultHorse(h,s.day));}
export function breedHorses(s,mareId,sireId,{seed}={}){
 // Validate on a copy so failed requests never change resources or save data.
 const draft=structuredClone(s),list=horsesFor(draft),pending=pregnanciesFor(draft);
 if(draft.role!=='livestock')throw Error('Breeding requires your livestock farm.');
 const mare=list.find(h=>h.id===mareId),sire=list.find(h=>h.id===sireId);
 if(!mare||!sire||mare===sire||mare.sex!=='mare'||sire.sex!=='stallion')throw Error('Choose one mare and one stallion.');
 if(!isAdultHorse(mare,draft.day)||!isAdultHorse(sire,draft.day))throw Error('Foals must grow for 7 farm days before breeding.');
 if(mare.pregnancyId||pending.some(p=>p.mareId===mareId&&!p.revealed))throw Error('This mare is already expecting a foal.');
 if(list.length+pending.filter(p=>!p.revealed).length>=BREEDING_RULES.capacity)throw Error('Your horse meadow is full (8 horses, including expected foals).');
 const ma=ancestors(mare,list),sa=ancestors(sire,list);
 if(ma.includes(sire.id)||sa.includes(mare.id)||ma.some(id=>sa.includes(id)))throw Error('Choose parents from different close family lines.');
 for(const [h,cooldown] of [[mare,BREEDING_RULES.mareCooldown],[sire,BREEDING_RULES.sireCooldown]]){
  if(Number.isFinite(h.lastBredDay)&&draft.day-h.lastBredDay<cooldown)throw Error(h.name+' is still recovering from breeding.');
  if(h.energy<BREEDING_RULES.minimumEnergy||h.condition<BREEDING_RULES.minimumCondition)throw Error('Both parents need at least 75 energy and 60 condition.');
 }
 if(draft.coins<BREEDING_RULES.coins||draft.inventory.feed<BREEDING_RULES.feed||draft.inventory.water<BREEDING_RULES.water)throw Error('Breeding needs 200 farm coins, 6 feed and 6 water.');
 const fixedSeed=Number.isInteger(seed)?seed>>>0:randomSeed(),random=rng(fixedSeed),sequence=(draft.breedingSequence||0)+1;
 const id='breeding-'+sequence,foalId='foal-'+sequence+'-'+fixedSeed.toString(36),inheritance={};
 for(const stat of stats){const average=(mare[stat]+sire[stat])/2,variation=Math.floor(random()*11)-5;inheritance[stat]={mare:mare[stat],sire:sire[stat],average,variation,value:Math.max(20,Math.min(95,Math.round(average+variation)))};}
 const coats=COATS.horse.filter(c=>c.id!==mare.coatId&&c.id!==sire.coatId),coatId=coats[Math.floor(random()*coats.length)].id;
 const foal={id:foalId,name:'Meadow Foal '+sequence,sex:random()<.5?'mare':'stallion',coatId,appearanceSeed:visualSeed('horse:'+foalId),speed:inheritance.speed.value,stamina:inheritance.stamina.value,power:inheritance.power.value,energy:100,condition:70,trainedDay:0,parentIds:[mare.id,sire.id],parentNames:[mare.name,sire.name],generation:Math.max(mare.generation||0,sire.generation||0)+1,inheritance};
 const record={id,mareId,sireId,parentNames:[mare.name,sire.name],startedDay:draft.day,dueDay:draft.day+BREEDING_RULES.gestationDays,seed:fixedSeed,foal,revealed:false};
 draft.coins-=BREEDING_RULES.coins;draft.inventory.feed-=BREEDING_RULES.feed;draft.inventory.water-=BREEDING_RULES.water;
 for(const h of [mare,sire]){h.energy-=BREEDING_RULES.energy;h.lastBredDay=draft.day;}
 mare.pregnancyId=id;draft.breedingSequence=sequence;pending.push(record);
 Object.assign(s,draft);horsesFor(s);return record;
}
export function revealFoal(s,pregnancyId){
 const record=pregnanciesFor(s).find(p=>p.id===pregnancyId);if(!record)throw Error('No matching expected foal.');
 if(s.day<record.dueDay)throw Error('Your foal is not ready yet.');
 if(record.revealed){const existing=horsesFor(s).find(h=>h.id===record.foal.id);if(!existing)throw Error('Foal record needs recovery.');return existing;}
 const list=horsesFor(s),foal=structuredClone(record.foal);foal.bornDay=s.day;foal.lifeStage=isAdultHorse(foal,s.day)?'adult':'foal';
 const identity=animalIdentity(s,'horse',foal.id,foal.coatId);foal.coatId=identity.coatId;foal.appearanceSeed=identity.appearanceSeed;
 list.push(foal);record.revealed=true;record.revealedDay=s.day;const mare=list.find(h=>h.id===record.mareId);if(mare)delete mare.pregnancyId;
 return foal;
}
export function nameFoal(s,id,name){const h=horsesFor(s).find(h=>h.id===id&&h.parentIds?.length===2);if(!h)throw Error('Choose a foal.');const clean=String(name||'').trim().replace(/\s+/g,' ');if(!clean||clean.length>24)throw Error('Choose a name from 1 to 24 characters.');if(!/^[\p{L}\p{N} '\-]+$/u.test(clean))throw Error('Use letters, numbers, spaces, apostrophes or hyphens in the name.');h.name=clean;return h;}
