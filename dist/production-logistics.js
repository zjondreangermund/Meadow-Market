// Physical grain/feed transport. Quantities move once, after a completed timed transfer.
export const FEED_STORE={x:-19,z:30,bay:{x:-23,z:26}};
export const MILLS={home:{name:'Meadow Feed Mill',bay:{x:-22.3,z:10},batch:10,power:1,seconds:30},county:{name:'County Feed Mill',bay:{x:75,z:28},batch:20,power:2,seconds:60}};
export function ensureLogistics(s,now=Date.now()){
 if(!s.logistics)s.logistics={version:1,mills:{},trailer:{owned:false,attachedTo:null,x:-41,z:17,heading:0,good:null,quantity:0,capacity:60},transfer:null};
 for(const id of Object.keys(MILLS)){const m=s.logistics.mills[id]??={maize:0,feed:0,job:null};if(m.job&&now>=m.job.finishAt){m.feed+=m.job.quantity;m.job=null;}}
 // Existing county production is preserved as output in the mill, never duplicated into stores.
 const legacy=s.county?.plots?.['county-mill'];if(legacy?.job&&(s.day>=legacy.job.readyDay||now>=((legacy.job.startedAt??Infinity)+(legacy.job.durationMs??86400000)))){s.logistics.mills.county.feed+=legacy.job.output.feed||0;legacy.cycles++;legacy.job=null;}
 return s.logistics;
}
function atomic(s,fn,now){const t=structuredClone(s),l=ensureLogistics(t,now),result=fn(t,l);Object.assign(s,t);return result;}
export function buyGrainTrailer(s){return atomic(s,(t,l)=>{if(l.trailer.owned)throw Error('You already own the grain trailer.');if(t.coins<250)throw Error('The grain trailer costs 250 farm coins.');t.coins-=250;l.trailer.owned=true;return l.trailer;});}
export function attachGrainTrailer(s,id,blocked=()=>false){return atomic(s,(t,l)=>{const tr=l.trailer,v=t.vehicles?.owned[id];if(!tr.owned||!v)throw Error('Buy the trailer and choose an owned tow vehicle.');if(tr.attachedTo)throw Error('Detach the current tow vehicle first.');const hitch={x:v.x-Math.sin(v.heading)*2.5,z:v.z-Math.cos(v.heading)*2.5};if(Math.hypot(hitch.x-(tr.x+Math.sin(tr.heading)*2.8),hitch.z-(tr.z+Math.cos(tr.heading)*2.8))>2.2)throw Error('Reverse your rear hitch close to the trailer drawbar at the garage.');const x=v.x-Math.sin(v.heading)*5.3,z=v.z-Math.cos(v.heading)*5.3;for(const dx of [-1.2,0,1.2])for(const dz of [-1.8,0,1.8])if(blocked(x+dx,z+dz))throw Error('The trailer needs clear space behind the vehicle.');Object.assign(tr,{attachedTo:id,x,z,heading:v.heading});return tr;});}
export function detachGrainTrailer(s){return atomic(s,(t,l)=>{if(l.transfer)throw Error('Finish or cancel the transfer before unhitching.');if(!l.trailer.attachedTo)throw Error('No trailer is attached.');l.trailer.attachedTo=null;return l.trailer;});}
export function trailerNear(tr,p){return !!tr?.owned&&!!tr.attachedTo&&Math.hypot(tr.x-p.x,tr.z-p.z)<1.05;}
function assertMillOwner(s,id){if(!MILLS[id])throw Error('Choose a feed mill.');if(id==='home'&&s.role!=='miller')throw Error('Your specialist role must be Feed miller to operate the home mill.');if(id==='county'&&!s.county?.plots?.['county-mill'])throw Error('Purchase County Feed Mill first.');}
export function startFeedMill(s,id,now=Date.now()){return atomic(s,(t,l)=>{assertMillOwner(t,id);const spec=MILLS[id],m=l.mills[id];if(!trailerNear(l.trailer,spec.bay))throw Error('Bring your attached grain trailer to the marked mill bay.');if(m.job)throw Error('The mill is already processing a batch.');if(m.maize<spec.batch||t.inventory.power<spec.power)throw Error('Deliver '+spec.batch+' maize into the mill intake and supply '+spec.power+' power.');m.maize-=spec.batch;t.inventory.power-=spec.power;m.job={startedAt:now,finishAt:now+spec.seconds*1000,quantity:spec.batch};return m.job;},now);}
export function beginBulkTransfer(s,kind,id='home',now=Date.now()){return atomic(s,(t,l)=>{if(l.transfer)throw Error('One bulk transfer is already running.');const tr=l.trailer;if(!tr.owned||!tr.attachedTo)throw Error('Attach your grain trailer to a vehicle first.');let good,quantity,point;
 if(kind==='farm-load'){point=FEED_STORE.bay;good='maize';quantity=Math.min(20,t.inventory.maize||0,tr.capacity-tr.quantity);}
 else if(kind==='farm-unload'){point=FEED_STORE.bay;good=tr.good;quantity=tr.quantity;}
 else if(kind==='mill-intake'){assertMillOwner(t,id);point=MILLS[id].bay;good='maize';quantity=tr.good==='maize'?tr.quantity:0;}
 else if(kind==='mill-load'){assertMillOwner(t,id);point=MILLS[id].bay;good='feed';quantity=Math.min(l.mills[id].feed,tr.capacity-tr.quantity);}
 else throw Error('Choose a valid bulk transfer.');
 if(!trailerNear(tr,point))throw Error('Centre the attached trailer in the marked '+(kind.startsWith('farm')?'farm storage':'mill')+' loading bay.');if(quantity<=0)throw Error('No suitable cargo is ready, or the trailer is full.');if(kind!=='farm-unload'&&tr.quantity&&tr.good!==good)throw Error('Unload the current cargo before loading a different product.');l.transfer={kind,mill:id,good,quantity,startedAt:now,durationMs:6000,x:tr.x,z:tr.z};return l.transfer;},now);}
export function cancelBulkTransfer(s){ensureLogistics(s).transfer=null;}
export function updateBulkTransfer(s,now=Date.now()){const l=ensureLogistics(s,now),f=l.transfer,tr=l.trailer;if(!f)return null;if(!tr.attachedTo||Math.hypot(tr.x-f.x,tr.z-f.z)>.65){l.transfer=null;return 'cancelled';}if(now-f.startedAt<f.durationMs)return null;
 const qty=f.quantity,m=l.mills[f.mill];let valid=true;
 if(f.kind==='farm-load'){valid=(s.inventory.maize||0)>=qty&&tr.capacity-tr.quantity>=qty&&(!tr.quantity||tr.good==='maize');if(valid){s.inventory.maize-=qty;tr.good='maize';tr.quantity+=qty;}}
 if(f.kind==='farm-unload'){valid=tr.good===f.good&&tr.quantity>=qty;if(valid){s.inventory[f.good]=(s.inventory[f.good]||0)+qty;tr.quantity-=qty;}}
 if(f.kind==='mill-intake'){valid=tr.good==='maize'&&tr.quantity>=qty;if(valid){tr.quantity-=qty;m.maize+=qty;}}
 if(f.kind==='mill-load'){valid=m.feed>=qty&&tr.capacity-tr.quantity>=qty&&(!tr.quantity||tr.good==='feed');if(valid){m.feed-=qty;tr.good='feed';tr.quantity+=qty;}}
 if(!tr.quantity)tr.good=null;l.transfer=null;return valid?'completed':'cancelled';}
export function trailerCandidate(tr,v,distance){const hitch={x:v.x-Math.sin(v.heading)*2.5,z:v.z-Math.cos(v.heading)*2.5};let heading=Math.atan2(hitch.x-tr.x,hitch.z-tr.z);if(!distance)heading=tr.heading;return {...tr,x:hitch.x-Math.sin(heading)*2.8,z:hitch.z-Math.cos(heading)*2.8,heading};}
export function trailerBlocked(tr,blocked){for(const side of [-1,0,1])for(const end of [-1,0,1]){const x=tr.x+Math.cos(tr.heading)*side*1.25+Math.sin(tr.heading)*end*1.9,z=tr.z-Math.sin(tr.heading)*side*1.25+Math.cos(tr.heading)*end*1.9;if(blocked(x,z))return true;}return false;}
