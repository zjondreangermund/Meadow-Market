// Stable parcel IDs and region coordinates; ownership is local until a shared server is added.
export const REGIONAL_BOUNDS=Object.freeze({minX:-248,maxX:260,minZ:-220,maxZ:220});
export const FARMS=Object.freeze([
 {id:'riverbend',region:'West Valley',name:'Riverbend Crop Farm',kind:'crop',x:-174,z:-132,w:58,d:48,price:1800,color:'#cbb78f',roof:'#8d614c',days:2,input:{seeds:12,water:18},output:{maize:90},approach:{x:-174,z:-100}},
 {id:'suncrest',region:'East Ridge',name:'Suncrest Orchard',kind:'orchard',x:184,z:-132,w:58,d:48,price:2200,color:'#e5d3ac',roof:'#6b7863',days:3,input:{water:24,power:2},output:{fruit:46},approach:{x:184,z:-100}},
 {id:'brookside',region:'South Meadows',name:'Brookside Dairy Farm',kind:'dairy',x:-174,z:132,w:58,d:48,price:2800,color:'#c5c9ae',roof:'#9d6652',days:1,input:{feed:12,water:20,fruit:2},output:{milk:24,fertiliser:8},approach:{x:-174,z:164}},
 {id:'oakridge',region:'Oak Highlands',name:'Oakridge Boarding Farm',kind:'boarding',x:184,z:132,w:58,d:48,price:3000,color:'#bfc5aa',roof:'#686458',days:2,input:{feed:16,water:24,fruit:4},output:{condition:12,fertiliser:8},approach:{x:184,z:164}}
]);
export function ensureFarms(s){if(!s.regionalFarms)s.regionalFarms={version:1,owned:{}};return s.regionalFarms;}
function farm(id){const p=FARMS.find(p=>p.id===id);if(!p)throw Error('Unknown regional farm.');return p;}
function transaction(s,fn){const t=structuredClone(s),r=fn(t);Object.assign(s,t);return r;}
export function buyFarm(s,id){return transaction(s,t=>{const p=farm(id),e=ensureFarms(t);if(e.owned[id])throw Error('You already own this farm.');if(t.coins<p.price)throw Error('This farm costs '+p.price+' available farm coins.');t.coins=Math.round((t.coins-p.price)*100)/100;return e.owned[id]={boughtDay:t.day,cycles:0,job:null};});}
export function startFarm(s,id){return transaction(s,t=>{const p=farm(id),r=ensureFarms(t).owned[id];if(!r)throw Error('Buy this farm first.');if(r.job)throw Error('Collect the current cycle before starting another.');if(!Object.entries(p.input).every(([k,v])=>(t.inventory[k]||0)>=v))throw Error('Missing supplies: '+Object.entries(p.input).map(([k,v])=>v+' '+k).join(' + '));for(const [k,v]of Object.entries(p.input))t.inventory[k]-=v;r.job={startedDay:t.day,readyDay:t.day+p.days,output:{...p.output}};return r.job;});}
export function collectFarm(s,id){return transaction(s,t=>{const r=ensureFarms(t).owned[farm(id).id];if(!r?.job)throw Error('No production to collect.');if(t.day<r.job.readyDay)throw Error('Ready on farm day '+r.job.readyDay+'.');const output={...r.job.output};for(const [k,v]of Object.entries(output))t.inventory[k]=(t.inventory[k]||0)+v;r.job=null;r.cycles++;return output;});}
