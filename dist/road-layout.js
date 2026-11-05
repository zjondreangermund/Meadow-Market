import {FARMS} from './regional-farms.js?v=landscape13';
// One shared road surface prevents coplanar overlaps at county/region junctions.
export const ROADS=[[-48,0,7,152],[64,0,7,152],[6,-36,112,7],[6,44,112,7],[-72,-36,48,7],[-72,4,48,7],[-72,28,48,7],[-90,-16,5,96],[-81,-45,18,4],[82,62,36,7],[-132,30,7,300],[144,30,7,300],[6,-100,276,7],[6,164,276,7],[-90,44,84,7],[104,44,80,7],...FARMS.map(p=>[(p.x+(p.x<0?-132:144))/2,p.approach.z,Math.abs(p.x-(p.x<0?-132:144))+8,5])].map(([x,z,w,d])=>({x,z,w,d}));
export const onRoad=(x,z)=>ROADS.some(r=>Math.abs(x-r.x)<r.w/2+.001&&Math.abs(z-r.z)<r.d/2+.001);
export function roadSurface(){const xs=[...new Set(ROADS.flatMap(r=>[r.x-r.w/2,r.x+r.w/2]))].sort((a,b)=>a-b),zs=[...new Set(ROADS.flatMap(r=>[r.z-r.d/2,r.z+r.d/2]))].sort((a,b)=>a-b),vertices=[];
 for(let i=1;i<xs.length;i++)for(let j=1;j<zs.length;j++){const a=xs[i-1],b=xs[i],c=zs[j-1],d=zs[j];if(onRoad((a+b)/2,(c+d)/2))vertices.push(a,.25,c,a,.25,d,b,.25,d,a,.25,c,b,.25,d,b,.25,c);}return vertices;}
export function roadMarkings(){const lines=[],seen=new Set();function add(x,z,w,d){const key=[x,z,w,d].map(v=>v.toFixed(2)).join(',');if(!seen.has(key)){lines.push({x,z,w,d});seen.add(key);}}
 for(const r of ROADS){const horizontal=r.w>r.d,long=horizontal?r.w:r.d,short=horizontal?r.d:r.w;
  for(let t=-long/2+.5;t<long/2;t+=1){for(const side of [-1,1]){const edge=(short/2+.12)*side,x=r.x+(horizontal?t:edge),z=r.z+(horizontal?edge:t);if(!onRoad(x,z))add(r.x+(horizontal?t:(short/2-.15)*side),r.z+(horizontal?(short/2-.15)*side:t),horizontal?.98:.1,horizontal?.1:.98);}}
  for(let t=-long/2+3;t<long/2-2;t+=7){const x=r.x+(horizontal?t:0),z=r.z+(horizontal?0:t);const junction=ROADS.some(o=>o!==r&&(o.w>o.d)!==horizontal&&Math.abs(x-o.x)<o.w/2+2&&Math.abs(z-o.z)<o.d/2+2);if(!junction)add(x,z,horizontal?2:.12,horizontal?.12:2);}
 }return lines;}
