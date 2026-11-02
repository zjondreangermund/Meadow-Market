import * as T from './three.module.js';
const cache=new WeakMap();
// One Loop-subdivision pass, including four-weight skin interpolation.
// The source retains its skeleton and authored animation clips.
export function smoothRig(model){model.traverse(o=>{if(!o.isSkinnedMesh)return;let result=cache.get(o.geometry);if(!result){result=subdivide(o.geometry);cache.set(o.geometry,result);}o.geometry=result;o.boundingBox=null;o.boundingSphere=null;});return model;}
export function subdivide(g){
 const pos=g.attributes.position,si=g.attributes.skinIndex,sw=g.attributes.skinWeight;
 if(!si||!sw||pos.count<30)return g;
 const verts=[],weld=new Map(),remap=[];
 for(let i=0;i<pos.count;i++){const p=[pos.getX(i),pos.getY(i),pos.getZ(i)],key=p.map(v=>Math.round(v*1e5)).join(',');let id=weld.get(key);if(id===undefined){id=verts.length;const influences=new Map();for(let k=0;k<4;k++){const index=si.array[i*4+k],weight=sw.array[i*4+k];if(weight)influences.set(index,(influences.get(index)||0)+weight);}verts.push({p,w:influences,neighbors:new Set(),boundary:[]});weld.set(key,id);}remap[i]=id;}
 const idx=g.index?Array.from(g.index.array):Array.from({length:pos.count},(_,i)=>i),faces=[],edges=new Map();
 for(let i=0;i<idx.length;i+=3){const f=idx.slice(i,i+3).map(n=>remap[n]);if(new Set(f).size!==3)continue;const group=g.groups.find(x=>i>=x.start&&i<x.start+x.count);faces.push({v:f,material:group?.materialIndex||0});for(let k=0;k<3;k++){const a=f[k],b=f[(k+1)%3],op=f[(k+2)%3],key=[Math.min(a,b),Math.max(a,b)].join(':');if(!edges.has(key))edges.set(key,{a,b,op:[]});edges.get(key).op.push(op);verts[a].neighbors.add(b);verts[b].neighbors.add(a);}}
 for(const e of edges.values())if(e.op.length!==2){verts[e.a].boundary.push(e.b);verts[e.b].boundary.push(e.a);}
 function blend(terms){const p=[0,0,0],w=new Map();for(const [id,f]of terms){const v=verts[id];for(let k=0;k<3;k++)p[k]+=v.p[k]*f;for(const [bone,weight]of v.w)w.set(bone,(w.get(bone)||0)+weight*f);}const top=[...w].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=top.reduce((a,b)=>a+b[1],0)||1;return {p,indices:Array.from({length:4},(_,i)=>top[i]?.[0]||0),weights:Array.from({length:4},(_,i)=>(top[i]?.[1]||0)/sum)};}
 const out=verts.map((v,i)=>{if(v.boundary.length===2)return blend([[i,.75],...v.boundary.map(j=>[j,.125])]);const n=v.neighbors.size,beta=n===3?3/16:3/(8*Math.max(n,1));return blend([[i,1-n*beta],...[...v.neighbors].map(j=>[j,beta])]);});
 for(const e of edges.values()){e.id=out.length;out.push(e.op.length===2?blend([[e.a,3/8],[e.b,3/8],[e.op[0],1/8],[e.op[1],1/8]]):blend([[e.a,.5],[e.b,.5]]));}
 const indices=[],groups=[];
 const edge=(a,b)=>edges.get([Math.min(a,b),Math.max(a,b)].join(':')).id;
 for(const f of faces){const [a,b,c]=f.v,ab=edge(a,b),bc=edge(b,c),ca=edge(c,a),start=indices.length;indices.push(a,ab,ca,b,bc,ab,c,ca,bc,ab,bc,ca);let last=groups.at(-1);if(last?.materialIndex===f.material)last.count+=12;else groups.push({start,count:12,materialIndex:f.material});}
 const result=new T.BufferGeometry();result.setAttribute('position',new T.Float32BufferAttribute(out.flatMap(v=>v.p),3));result.setAttribute('skinIndex',new T.Uint16BufferAttribute(out.flatMap(v=>v.indices),4));result.setAttribute('skinWeight',new T.Float32BufferAttribute(out.flatMap(v=>v.weights),4));result.setIndex(indices);for(const group of groups)result.addGroup(group.start,group.count,group.materialIndex);result.computeVertexNormals();result.computeBoundingBox();result.computeBoundingSphere();return result;
}
