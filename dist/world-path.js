// Bounded A* avoids scanning the entire county for each queued walk.
export function worldPath(start,end,{bounds,blocked,maxVisits=200000}){
 const sx=Math.round(start.x),sz=Math.round(start.z),ex=Math.round(end.x),ez=Math.round(end.z),key=(x,z)=>x+','+z;
 if(!Number.isFinite(ex)||!Number.isFinite(ez)||ex<bounds.minX||ex>bounds.maxX||ez<bounds.minZ||ez>bounds.maxZ||blocked(ex,ez))return [];
 const heap=[],cost=new Map([[key(sx,sz),0]]),previous=new Map(),closed=new Set();
 function push(n){heap.push(n);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<=n.f)break;heap[i]=heap[p];i=p;}heap[i]=n;}
 function pop(){const out=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c;}heap[i]=last;}return out;}
 push({x:sx,z:sz,f:Math.abs(ex-sx)+Math.abs(ez-sz)});
 while(heap.length&&closed.size<maxVisits){const cur=pop(),k=key(cur.x,cur.z);if(closed.has(k))continue;closed.add(k);if(cur.x===ex&&cur.z===ez){const out=[];let at=k;while(at!==key(sx,sz)){const [x,z]=at.split(',').map(Number);out.push({x,z});at=previous.get(at);if(!at)return [];}return out.reverse();}
  for(const [dx,dz]of [[1,0],[0,1],[-1,0],[0,-1]]){const x=cur.x+dx,z=cur.z+dz,nk=key(x,z);if(x<bounds.minX||x>bounds.maxX||z<bounds.minZ||z>bounds.maxZ||closed.has(nk)||blocked(x,z))continue;const g=cost.get(k)+1;if(g>=(cost.get(nk)??Infinity))continue;cost.set(nk,g);previous.set(nk,k);push({x,z,f:g+(Math.abs(ex-x)+Math.abs(ez-z))*1.0001});}
 }
 return [];
}
