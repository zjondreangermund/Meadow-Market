// Fictional local-game riders. Fees use non-withdrawable farm coins, never money.
export const JOCKEYS=[
 {id:'stable',name:'Stable Rider',title:'Your dependable starter',price:0,starts:0,line:50,care:50,finish:50,color:'#edc16f'},
 {id:'mara',name:'Mara Veld',title:'The Metronome',price:120,starts:3,line:76,care:90,finish:68,color:'#5eaa9a'},
 {id:'kai',name:'Kai Storm',title:'The Finisher',price:180,starts:3,line:70,care:62,finish:94,color:'#b674a4'},
 {id:'tala',name:'Tala Dune',title:'The Line Finder',price:200,starts:3,line:94,care:74,finish:80,color:'#7199c4'}
];
export const jockeyById=id=>JOCKEYS.find(j=>j.id===id)||JOCKEYS[0];
export function rosterFor(s){if(!s.jockeyRoster||typeof s.jockeyRoster!=='object')s.jockeyRoster={};return s.jockeyRoster;}
export function availableJockey(s,id){return id==='stable'||(rosterFor(s)[id]?.remaining||0)>0;}
export function hireJockey(s,id){const j=JOCKEYS.find(j=>j.id===id);if(!j||j.id==='stable')throw Error('Choose a professional rider.');const roster=rosterFor(s);if((roster[id]?.remaining||0)>0)throw Error('This jockey is already under contract.');if(!Number.isFinite(s.coins)||s.coins<j.price)throw Error('Not enough farm coins for this contract.');s.coins-=j.price;s.jockeyDebits=(s.jockeyDebits||0)+j.price;roster[id]={remaining:j.starts,hiredDay:s.day||1};return j;}
export function bookJockey(s,id,raceId){if(typeof raceId!=='string'||!raceId)throw Error('Missing race booking.');if(id==='stable')return jockeyById(id);const bookings=s.jockeyBookings||[];const existing=bookings.find(b=>b.raceId===raceId);if(existing){if(existing.jockeyId!==id)throw Error('This race already has a different jockey.');return jockeyById(id);}if(!availableJockey(s,id))throw Error('Jockey contract has no starts left. Hire again or choose Stable Rider.');rosterFor(s)[id].remaining--;s.jockeyBookings=[...bookings,{raceId,jockeyId:id}].slice(-100);return jockeyById(id);}
