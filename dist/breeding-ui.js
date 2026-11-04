import {horsesFor,racingHorses,isAdultHorse,FOAL_GROWTH_DAYS,simulateRace} from './horses.js?v=breeding9';
import {breedHorses,pregnanciesFor,readyBirths,revealFoal,nameFoal,BREEDING_RULES} from './breeding.js?v=breeding9';
import {COATS,horseCoatId} from './coat-variants.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stats=['speed','stamina','power'];
const title=id=>String(id).replaceAll('-',' ');
export function installBreedingUI({state,save,modal,toast,ensureActors,focusFoal}){
 function bars(h){return '<div class="horse-stats">'+[...stats,'energy','condition'].map(k=>'<label><span>'+k+' <b>'+h[k]+'/100</b></span><meter min="0" max="100" value="'+h[k]+'"></meter></label>').join('')+'</div>';}
 function coat(h){const c=COATS.horse.find(c=>c.id===horseCoatId(h));return '<p class="fixed-coat"><span class="coat-swatch" style="--coat-base:'+c.base+';--coat-mark:'+c.accent+'"></span><b>'+esc(title(c.id))+'</b> · permanent coat and markings</p>';}
 window.openHorses=(id='dawn')=>{
  const list=horsesFor(state),h=list.find(x=>x.id===id)||list[0],adult=isAdultHorse(h,state.day),ready=readyBirths(state);
  modal('<h2>Meadow racing stable</h2><div class="choice">'+list.map(x=>'<button onclick="openHorses(\''+x.id+'\')">'+esc(x.name)+(isAdultHorse(x,state.day)?'':' · foal')+'</button>').join('')+'</div>'+(ready.length?'<button class="primary" onclick="openBreeding()">A new hoofbeat awaits · '+ready.length+' foal'+(ready.length===1?'':'s')+' ready to meet →</button>':'')+'<h3>'+esc(h.name)+'</h3><p>'+esc(h.sex)+(adult?' · adult':' · foal, '+Math.max(0,state.day-h.bornDay)+' / '+FOAL_GROWTH_DAYS+' farm days')+(h.pregnancyId?' · expecting a foal':'')+'</p>'+coat(h)+bars(h)+(h.parentNames?'<p>Parents: '+h.parentNames.map(esc).join(' × ')+' · Generation '+h.generation+'</p>':'')+'<button class="primary" onclick="openBreeding()">Breeding meadow →</button>'+(adult&&!h.pregnancyId?'<h3>Training & racing</h3><button onclick="openTraining(\''+h.id+'\')">Train '+esc(h.name)+'</button><a class="primary" style="display:block;padding:14px;text-align:center" href="racing.html?horse='+encodeURIComponent(h.id)+'">Enter Meadow Park →</a>':'<p>'+(adult?'This mare rests during pregnancy.':'Your foal needs '+Math.max(0,FOAL_GROWTH_DAYS-(state.day-h.bornDay))+' more farm days to grow before training, racing or breeding.')+'</p>')+(!adult?'<button onclick="visitFoal(\''+h.id+'\')">Visit your foal →</button>':'')+'<h3>Quick stat comparison</h3><div class="choice">'+[400,800,1600].map(d=>'<button onclick="practiceRace('+d+')">'+d+' m</button>').join('')+'</div><div id="race-result" aria-live="polite"></div>');
 };
 window.practiceRace=metres=>{
  const results=simulateRace(racingHorses(state),metres,crypto.getRandomValues(new Uint32Array(1))[0]);
  document.querySelector('#race-result').innerHTML='<h3>'+metres+' m practice results</h3><table><thead><tr><th>Place</th><th>Horse</th><th>Time</th></tr></thead><tbody>'+results.map((r,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(r.name)+'</td><td>'+r.seconds.toFixed(2)+' s</td></tr>').join('')+'</tbody></table>';
 };
 window.openBreeding=()=>{
  const list=horsesFor(state),adults=list.filter(h=>isAdultHorse(h,state.day)),pending=pregnanciesFor(state).filter(p=>!p.revealed);
  const options=sex=>adults.filter(h=>h.sex===sex).map(h=>'<option value="'+h.id+'" '+(h.pregnancyId?'disabled':'')+'>'+esc(h.name)+(h.pregnancyId?' · expecting':'')+'</option>').join('');
  modal('<span class="service-tag">BREEDING MEADOW</span><h2>A new hoofbeat.</h2><p>Combine two family lines and meet a foal of your own.</p>'+pending.map(p=>{const left=Math.max(0,p.dueDay-state.day);return '<article class="expecting-card"><b>'+p.parentNames.map(esc).join(' × ')+'</b><p>'+(left?'Expected in '+left+' farm day'+(left===1?'':'s'):'Your foal is ready to meet.')+'</p><progress max="3" value="'+Math.min(3,state.day-p.startedDay)+'"></progress>'+(left?'':'<button class="primary" onclick="meetFoal(\''+p.id+'\')">Meet your new foal →</button>')+'</article>';}).join('')+'<h3>Choose the parents</h3><label>Mare<select id="breed-mare">'+options('mare')+'</select></label><label>Stallion<select id="breed-sire">'+options('stallion')+'</select></label><p>Both parents need 75 energy and 60 condition. The mare rests while expecting. Breeding uses 30 energy from each parent.</p><p><b>200 farm coins + 6 feed + 6 water</b> · 3 farm days until your reveal. Mares recover for 7 farm days between pairings; stallions for 2. Your meadow holds 8 horses, including expected foals.</p><p>Each foal inherits the average of its parents’ speed, stamina and power, with up to ±5 points of variation (20–95). Its own coat and markings are assigned once. Foals grow for 7 farm days before training or racing.</p><button class="primary" onclick="startHorseBreeding()" '+(state.role!=='livestock'?'disabled':'')+'>Begin this pairing</button><p class="asset-note">These are farm-game days. This is local playtest breeding using farm coins.</p><button onclick="openHorses()">Back to your stable</button>');
 };
 window.startHorseBreeding=()=>{
  try{const p=breedHorses(state,document.querySelector('#breed-mare').value,document.querySelector('#breed-sire').value);save();window.openBreeding();toast('A new chapter begins. Your foal is expected on farm day '+p.dueDay+'.');}catch(e){toast(e.message);}
 };
 let revealing=false;
 function revealCard(h){
  modal('<div class="foal-welcome"><span class="service-tag">WELCOME TO THE MEADOW</span><h2>Meet '+esc(h.name)+'.</h2><p>A '+(h.sex==='mare'?'filly':'colt')+' from '+h.parentNames.map(esc).join(' × ')+'</p>'+coat(h)+bars(h)+'<label>Your foal’s name<input id="foal-name" maxlength="24" value="'+esc(h.name)+'" autocomplete="off"></label><button class="primary" onclick="saveFoalName(\''+h.id+'\')">Save name</button><details><summary>See what your foal inherited</summary><table><thead><tr><th>Trait</th><th>Mum</th><th>Dad</th><th>Foal</th></tr></thead><tbody>'+stats.map(k=>{const t=h.inheritance[k];return '<tr><td>'+k+'</td><td>'+t.mare+'</td><td>'+t.sire+'</td><td><b>'+h[k]+'</b> ('+t.average+' '+(t.variation>=0?'+':'')+t.variation+')</td></tr>';}).join('')+'</tbody></table></details><p>The coat and markings are yours forever. Growing up takes 7 farm days.</p><button onclick="finishFoalReveal(\''+h.id+'\')">Welcome home →</button></div>');
  document.querySelector('dialog').className='foal-reveal';
 }
 window.meetFoal=async id=>{
  if(revealing)return;revealing=true;
  try{const h=revealFoal(state,id);save();modal('<h2>Your new foal is arriving…</h2><p>Opening the meadow gate.</p>');await ensureActors();focusFoal(h.id);revealCard(h);}catch(e){toast(e.message);}finally{revealing=false;}
 };
 window.visitFoal=async id=>{const h=horsesFor(state).find(x=>x.id===id&&x.parentIds);if(!h)return;await ensureActors();focusFoal(h.id);revealCard(h);};
 window.saveFoalName=id=>{try{const h=nameFoal(state,id,document.querySelector('#foal-name').value);save();revealCard(h);toast('Welcome home, '+h.name+'.');}catch(e){toast(e.message);}};
 window.finishFoalReveal=id=>{document.querySelector('dialog').close();window.openHorses(id);};
}
