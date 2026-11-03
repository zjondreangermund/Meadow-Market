import * as T from './three.module.js';

// Continuous weights on the closest source triangle. Picking three unrelated
// vertices can blend opposite legs or change influences abruptly at grid cells.
export function skinSurface(triangles){
 const center=new T.Vector3(),size=new T.Vector3();
 function build(items){
  const box=new T.Box3();for(const item of items)box.union(item.box);
  if(items.length<=12)return {box,items};
  box.getSize(size);const axis=size.x>size.y?(size.x>size.z?'x':'z'):(size.y>size.z?'y':'z');
  items.sort((a,b)=>a.center[axis]-b.center[axis]);const mid=items.length>>1;
  return {box,left:build(items.slice(0,mid)),right:build(items.slice(mid))};
 }
 const items=triangles.map(vertices=>{
  const triangle=new T.Triangle(...vertices.map(v=>new T.Vector3(v.x,v.y,v.z)));
  const box=new T.Box3().setFromPoints([triangle.a,triangle.b,triangle.c]);
  return {triangle,vertices,box,center:box.getCenter(new T.Vector3())};
 }).filter(item=>item.triangle.getArea()>1e-12);
 if(!items.length)throw Error('No valid source skin surface');
 const root=build(items),nearest=new T.Vector3(),bary=new T.Vector3(),candidate=new T.Vector3();
 const distance=(box,p)=>box.clampPoint(p,candidate).distanceToSquared(p);
 return point=>{
  let best=null,bestDistance=Infinity;
  function visit(node){
   if(distance(node.box,point)>bestDistance)return;
   if(node.items){for(const item of node.items){item.triangle.closestPointToPoint(point,candidate);const d=candidate.distanceToSquared(point);if(d<bestDistance){bestDistance=d;best=item;nearest.copy(candidate);}}return;}
   const a=distance(node.left.box,point),b=distance(node.right.box,point);
   if(a<b){visit(node.left);visit(node.right);}else{visit(node.right);visit(node.left);}
  }
  visit(root);best.triangle.getBarycoord(nearest,bary);
  const weights=new Map();
  best.vertices.forEach((v,i)=>{const factor=Math.max(0,bary.getComponent(i));for(let k=0;k<4;k++)if(v.weights[k]>0)weights.set(v.joints[k],(weights.get(v.joints[k])||0)+factor*v.weights[k]);});
  const top=[...weights].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=top.reduce((s,x)=>s+x[1],0);
  if(!sum)throw Error('Invalid transferred skin weights');
  return [Array.from({length:4},(_,i)=>top[i]?.[0]||0),Array.from({length:4},(_,i)=>(top[i]?.[1]||0)/sum)];
 };
}
