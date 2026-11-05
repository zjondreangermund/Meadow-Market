import {ensureLogistics} from './production-logistics.js?v=simulation15';
import {growthReady} from './growth.js?v=simulation15';
// Persistent, browser-local county simulation. No real currency or shared trading.
export const COUNTY_BOUNDS=Object.freeze({minX:-96,maxX:108,minZ:-84,maxZ:84});
export const PLOTS=Object.freeze([
 {id:'north-field',name:'North Fields',x:-21,z:-60,w:26,d:20,price:450,kind:'field',days:2,input:{seeds:6,water:8},output:{maize:42},approach:{x:-21,z:-47}},
 {id:'willow-orchard',name:'Willow Orchard',x:14,z:-60,w:26,d:20,price:650,kind:'orchard',days:3,input:{seeds:3,water:10},output:{fruit:18},approach:{x:14,z:-47}},
 {id:'spring-well',name:'Spring Waterworks',x:85,z:-14,w:22,d:20,price:600,kind:'well',days:1,input:{power:2},output:{water:60},approach:{x:72,z:-14}},
 {id:'county-mill',name:'County Feed Mill',x:85,z:28,w:22,d:20,price:750,kind:'mill',days:1,input:{maize:20,power:2},output:{feed:20},approach:{x:72,z:28}}
]);
export const DESTINATIONS=Object.freeze([
 {id:'farm',name:'Home farm',x:0,z:10,approach:{x:0,z:10}},
 {id:'village',name:'Village Co-op',x:-72,z:17,approach:{x:-72,z:26}},
 {id:'depot',name:'Delivery Depot',x:-72,z:-55,approach:{x:-72,z:-45}},
 {id:'supply',name:'County Exchange',x:-72,z:-7,approach:{x:-72,z:2}},
 {id:'racegate',name:'Meadow Park entrance',x:82,z:62,approach:{x:72,z:62}},
 ...PLOTS.map(p=>({...p}))
]);
const safeId=id=>PLOTS.find(p=>p.id===id)||(()=>{throw Error('Unknown plot.');})();
export function ensureCounty(s){if(!s.county||s.county.version!==1)s.county={version:1,plots:{},contracts:[],reputation:0,deliveries:0};return s.county;}
function transact(s,fn){const draft=structuredClone(s),result=fn(draft);Object.assign(s,draft);return result;}
const enough=(s,cost)=>Object.entries(cost).every(([k,v])=>(s.inventory[k]||0)>=v);
const deduct=(s,cost)=>{for(const [k,v]of Object.entries(cost))s.inventory[k]-=v;};
export function buyPlot(s,id){return transact(s,t=>{const p=safeId(id),c=ensureCounty(t);if(c.plots[id])throw Error('You already own this plot.');if(t.coins<p.price)throw Error('You need '+p.price+' available farm coins.');t.coins=Math.round((t.coins-p.price)*100)/100;return c.plots[id]={boughtDay:t.day,cycles:0,established:false,job:null};});}
export function plotCost(s,id){const p=safeId(id),record=ensureCounty(s).plots[id];return p.kind==='orchard'&&record?.established?{water:10}:{...p.input};}
export function startPlot(s,id){return transact(s,t=>{const p=safeId(id),r=ensureCounty(t).plots[id];if(!r)throw Error('Buy this plot first.');if(r.job)throw Error('A production cycle is already underway.');const cost=plotCost(t,id);if(!enough(t,cost))throw Error('Missing supplies: '+Object.entries(cost).map(([k,v])=>v+' '+k).join(' + ')+'.');deduct(t,cost);if(!r.established){r.treePlantedAt=Date.now();r.treePlantedDay=t.day;}r.established=true;r.job={startedDay:t.day,readyDay:t.day+p.days,startedAt:Date.now(),durationMs:p.days*86400000,output:{...p.output}};return r.job;});}
export function collectPlot(s,id){return transact(s,t=>{const r=ensureCounty(t).plots[safeId(id).id];if(!r?.job)throw Error('No production is waiting.');if(!growthReady(r.job,t.day))throw Error('Ready on farm day '+r.job.readyDay+'.');const output={...r.job.output};if(id==='county-mill'){ensureLogistics(t);return output;}for(const [k,v]of Object.entries(output))t.inventory[k]=(t.inventory[k]||0)+v;r.cycles++;r.job=null;return output;});}
const REQUESTS=[{good:'milk',qty:4,reward:22,buyer:'Willow Bakery'},{good:'eggs',qty:6,reward:24,buyer:'Village Grocer'},{good:'maize',qty:12,reward:29,buyer:'County Millers'},{good:'feed',qty:8,reward:39,buyer:'Ridge Stables'},{good:'fruit',qty:8,reward:31,buyer:'Orchard Kitchen'},{good:'water',qty:20,reward:25,buyer:'Village Gardens'}];
export function countyBoard(s){const c=ensureCounty(s);return Array.from({length:3},(_,i)=>{const r=REQUESTS[((s.day-1)*3+i)%REQUESTS.length];return {...r,id:'county-'+s.day+'-'+i,day:s.day,dueDay:s.day+3,status:c.contracts.find(x=>x.id==='county-'+s.day+'-'+i)?.status||'available'};});}
export function contractStatus(s,r){return r.status==='active'&&s.day>r.dueDay?'expired':r.status;}
export function acceptContract(s,id){return transact(s,t=>{const c=ensureCounty(t),r=countyBoard(t).find(x=>x.id===id);if(!r)throw Error('This request is no longer on today’s board.');if(c.contracts.some(x=>x.id===id))throw Error('You already accepted this request.');if(c.contracts.filter(x=>contractStatus(t,x)==='active').length>=3)throw Error('Complete a delivery first (3 active requests maximum).');const next={...r,status:'active'};c.contracts.push(next);return next;});}
export function deliverContract(s,id){return transact(s,t=>{const c=ensureCounty(t),r=c.contracts.find(x=>x.id===id);if(!r||contractStatus(t,r)!=='active')throw Error('This delivery is no longer active.');if((t.inventory[r.good]||0)<r.qty)throw Error('You need '+r.qty+' '+r.good+' available in your stores.');t.inventory[r.good]-=r.qty;t.coins=Math.round((t.coins+r.reward)*100)/100;r.status='delivered';r.deliveredDay=t.day;c.reputation+=5;c.deliveries++;return r;});}
export function abandonContract(s,id){const r=ensureCounty(s).contracts.find(x=>x.id===id);if(!r||contractStatus(s,r)!=='active')throw Error('No active request to cancel.');r.status='cancelled';return r;}
