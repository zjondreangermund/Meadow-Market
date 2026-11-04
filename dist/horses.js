import {animalIdentity} from './animal-identity.js?v=breeding9';
import {horseCoatId} from './coat-variants.js';
// Browser-local practice rules. Production races must run on a trusted server.
export const HORSE_DEFAULTS=[{id:'dawn',name:'Desert Dawn',speed:72,stamina:82,power:65,energy:100,condition:70,trainedDay:0},{id:'copper',name:'Copper Wind',speed:80,stamina:65,power:81,energy:100,condition:70,trainedDay:0}];
export const FOAL_GROWTH_DAYS=7;
export function isAdultHorse(h,day){return !Number.isFinite(h.bornDay)||day-h.bornDay>=FOAL_GROWTH_DAYS;}
export function horsesFor(s){
 if(!Array.isArray(s.horses))s.horses=HORSE_DEFAULTS.map(h=>({...h}));
 for(const h of s.horses){
  const identity=animalIdentity(s,'horse',h.id,horseCoatId(h));h.coatId=identity.coatId;h.appearanceSeed=identity.appearanceSeed;
  h.sex=h.sex||(h.id==='dawn'?'mare':h.id==='copper'?'stallion':identity.appearanceSeed%2?'mare':'stallion');
  h.lifeStage=isAdultHorse(h,s.day)?'adult':'foal';
 }
 return s.horses;
}
export function racingHorses(s){return horsesFor(s).filter(h=>isAdultHorse(h,s.day)&&!h.pregnancyId);}

export function trainHorse(s,id,stat){if(s.role!=='livestock')throw Error('Training requires your livestock farm.');let h=horsesFor(s).find(h=>h.id===id);if(!h||!['speed','stamina','power'].includes(stat))throw Error('Choose a horse and training discipline.');if(!isAdultHorse(h,s.day))throw Error('Foals must grow for 7 farm days before training.');if(h.pregnancyId)throw Error('This mare is resting during pregnancy.');if(h.trainedDay===s.day)throw Error('Already trained today. Rest until the next farm day.');if(h.energy<25)throw Error('Not enough energy. Complete daily horse care and rest.');if(s.inventory.feed<2||s.inventory.water<2)throw Error('Training needs 2 grain feed and 2 water from stores.');if(h[stat]>=95)throw Error('This attribute is at its training cap.');s.inventory.feed-=2;s.inventory.water-=2;h.energy-=25;h[stat]=Math.min(95,h[stat]+1);h.trainedDay=s.day;return h;}
export function restHorses(s,cared){for(const h of horsesFor(s)){h.energy=Math.min(100,h.energy+(cared?35:5));h.condition=Math.max(20,Math.min(100,h.condition+(cared?4:-6)));}}
export function simulateRace(horses,metres=800,seed=1){if(![400,800,1600].includes(metres))throw Error('Unsupported practice distance.');if(horses.some(h=>h.lifeStage==='foal'||h.pregnancyId))throw Error('Only adult horses who are not expecting foals can race.');let n=seed>>>0;const random=()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296;};return horses.map(h=>{let t=0;const form=.96+random()*.08;for(let d=0;d<metres;d+=20){const progress=d/metres;const fatigue=Math.max(0,progress-(.25+h.stamina/200))*metres/800;const base=10+h.speed*.085;const launch=d<100?.72+h.power*.0028:1;const energy=.8+h.energy*.002;const condition=.85+h.condition*.0015;const pace=base*launch*energy*condition*form*Math.max(.55,1-fatigue*(1-h.stamina/130));t+=Math.min(20,metres-d)/pace;}return {id:h.id,name:h.name,seconds:Math.round(t*100)/100};}).sort((a,b)=>a.seconds-b.seconds);}
