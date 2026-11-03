import {horsesFor} from './horses.js';
import {horseCoatId} from './coat-variants.js?v=visual4';
import {fresh} from './economy.js';
import {JOCKEYS,jockeyById,rosterFor,availableJockey,hireJockey,bookJockey} from './jockeys.js';
import {createRace,stepRace,raceOrder,STEP,RULES_VERSION} from './race-engine.js?v=world8';
import {createRaceScene,SILKS} from './race-scene.js?v=visual5fix1';
const $=s=>document.querySelector(s),show=(id,yes)=>$(id).hidden=!yes;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let save;try{save=JSON.parse(localStorage.getItem('meadow-cycle-v2'));}catch{}if(!save||save.version!==2)save=fresh();
const horses=horsesFor(save);let selected=horses.find(h=>h.id===new URLSearchParams(location.search).get('horse'))||horses[0],metres=800,plan='stalker';const eventSeed=crypto.getRandomValues(new Uint32Array(1))[0];const track=eventSeed%3===0?'soft':'firm';
let jockeyId='stable',bookingDone=false;
let phase='lobby',race=null,command={pace:'cruise',lane:0,burst:false},inputs=[],currentRun=null,lastRun=null,paused=false,accumulator=0,countdown=0,finishWait=0,announcementUntil=0,uiClock=0,lastPosition=1,finalCalled=false,slowmo=0,replayAt=0,replaySpeed=1,camIndex=1,dayClock=0,previewOpen=false;
let soundEnabled=false,audio=null,noise=null,lastHoof=0;
const cams=['Director','Chase','Rail','Broadcast'];
function latestFarm(){try{const s=JSON.parse(localStorage.getItem('meadow-cycle-v2'));if(s?.version===2)return s;}catch{}return save;}
function updateFarm(action){const s=latestFarm();const result=action(s);localStorage.setItem('meadow-cycle-v2',JSON.stringify(s));save=s;return result;}
function renderJockeys(){const live=latestFarm(),roster=rosterFor(live),selectedJockey=jockeyById(jockeyId);$('#jockey-coins').textContent='◉ '+live.coins+' farm coins';$('#jockey-roster').innerHTML=JOCKEYS.map(j=>{const rides=roster[j.id]?.remaining||0,available=availableJockey(live,j.id);return `<article class="jockey-card ${j.id===jockeyId?'selected':''}" style="--silks:${j.color}"><div class="jockey-emblem">${j.name.split(' ').map(n=>n[0]).join('')}</div><div class="jockey-copy"><b>${j.name}</b><small>${j.title}</small><div class="jockey-skills">${[['Line',j.line],['Care',j.care],['Finish',j.finish]].map(([name,value])=>`<label>${name}<meter max="100" value="${value}"></meter></label>`).join('')}</div><p>${j.id==='stable'?'Always available · no fee':rides?rides+' starts left':j.price+' farm coins · 3 starts'}</p><button data-jockey="${j.id}" ${!available?'disabled':''}>${j.id===jockeyId?'Selected':'Choose rider'}</button>${j.id!=='stable'?`<button data-hire="${j.id}" ${rides?'disabled':''}>${rides?'Under contract':'Hire · '+j.price+' ◉'}</button>`:''}</div></article>`;}).join('');$('#jockey-summary').textContent=selectedJockey.name+' · '+selectedJockey.title;for(const b of document.querySelectorAll('[data-jockey]'))b.onclick=()=>{jockeyId=b.dataset.jockey;world?.setJockey?.(jockeyById(jockeyId));renderJockeys();};for(const b of document.querySelectorAll('[data-hire]'))b.onclick=()=>{try{updateFarm(s=>hireJockey(s,b.dataset.hire));jockeyId=b.dataset.hire;world?.setJockey?.(jockeyById(jockeyId));$('#jockey-message').textContent='Contract signed: '+jockeyById(jockeyId).name+' for 3 starts.';renderJockeys();}catch(e){$('#jockey-message').textContent=e.message;}};}
function readHistory(){try{const h=JSON.parse(localStorage.getItem('meadow-race-history-v1'));return Array.isArray(h)?h.slice(0,10):[];}catch{return [];}}
function timeLabel(t){if(!Number.isFinite(t))return '—';const min=Math.floor(t/60),s=(t%60).toFixed(2).padStart(5,'0');return `${String(min).padStart(2,'0')}:${s}`;}
function renderProfile(){
 $('#horse-picker').innerHTML=horses.map(h=>`<button data-horse="${escape(h.id)}" class="${h.id===selected.id?'selected':''}">${escape(h.name)}<small>${h.id==='dawn'?'ENDURANCE SPECIALIST':'EXPLOSIVE FINISHER'}</small></button>`).join('');
 $('#profile').innerHTML=`<div class="stats">${['speed','stamina','power'].map(k=>`<label>${k.toUpperCase()}<b>${selected[k]}</b><progress value="${selected[k]}" max="100"></progress></label>`).join('')}</div><p class="condition">3D coat identity: ${horseCoatId(selected).replaceAll('-',' ')} · stable & race track</p><div class="condition"><span>Energy <b>${selected.energy}%</b></span><span>Condition <b>${selected.condition}%</b></span></div>`;
 for(const b of document.querySelectorAll('[data-horse]'))b.onclick=()=>{selected=horses.find(h=>h.id===b.dataset.horse);world?.setHorseProfile?.(selected);renderProfile();};
}
renderProfile();
$('#conditions').textContent=(track==='soft'?'SOFT TURF · POWER MATTERS':'FIRM TURF · FAST GOING')+' · '+(eventSeed%9>4?'STRONG':'LIGHT')+' CROSSWIND';
for(const b of document.querySelectorAll('[data-plan]'))b.onclick=()=>{plan=b.dataset.plan;for(const x of document.querySelectorAll('[data-plan]'))x.classList.toggle('selected',x===b);};
for(const b of document.querySelectorAll('[data-distance]'))b.onclick=()=>{metres=Number(b.dataset.distance);for(const x of document.querySelectorAll('[data-distance]'))x.classList.toggle('selected',x===b);};
function historyUI(){const history=readHistory();$('#history').innerHTML=history.length?history.map(h=>`<div>${escape(h.horse)} · ${h.metres}m · #${h.place} · ${timeLabel(h.seconds)}</div>`).join(''):'Your first starting gate is waiting.';}
$('#history-toggle').onclick=()=>{show('#history',$('#history').hidden);historyUI();};
let world;
try{world=createRaceScene($('#world'));}catch(e){show('#error',true);$('#error').innerHTML='<b>The stadium needs WebGL.</b><br>Open this page in a browser with hardware graphics enabled, or return to the <a href="./farm.html">farm</a>.';console.error(e);}
renderJockeys();
function announce(text,seconds=2.5){$('#callout-text').textContent=text;$('#callout').classList.add('visible');announcementUntil=performance.now()+seconds*1000;}
function tone(hz,duration=.08,volume=.04,type='sine'){if(!soundEnabled||!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(hz,audio.currentTime);g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}
function activateAudio(){if(audio){audio.resume();return;}const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;try{audio=new AC();const buf=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate),data=buf.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1);const src=audio.createBufferSource();src.buffer=buf;src.loop=true;const filter=audio.createBiquadFilter();filter.type='bandpass';filter.frequency.value=650;const gain=audio.createGain();gain.gain.value=soundEnabled?.028:0;src.connect(filter);filter.connect(gain);gain.connect(audio.destination);src.start();noise=gain;}catch{soundEnabled=false;}}
$('#sound').onclick=()=>{soundEnabled=!soundEnabled;activateAudio();$('#sound').textContent=soundEnabled?'Sound on':'Sound off';$('#sound').setAttribute('aria-pressed',String(soundEnabled));if(noise)noise.gain.value=soundEnabled?.028:0;};
$('#atmosphere').onclick=()=>{const next=$('#atmosphere').textContent.includes('Neon')?'Day':'Neon';$('#atmosphere').textContent='Scene: '+next;world?.setAtmosphere?.(next);};
$('#quality').onclick=()=>{const next=$('#quality').textContent.includes('High')?'Performance':'High';$('#quality').textContent='Visuals: '+next;world?.quality?.(next);};
$('#field').onclick=()=>{const compact=$('#leaderboard').classList.toggle('compact');$('#field').textContent=compact?'Field +':'Field −';};
$('#zoom-in').onclick=()=>world?.zoom?.(-.15);$('#zoom-out').onclick=()=>world?.zoom?.(.15);
$('#camera').onclick=()=>{camIndex=(camIndex+1)%cams.length;world?.cameraMode(cams[camIndex]);$('#camera').textContent='Camera: '+cams[camIndex];};
function setPace(pace){if(phase!=='race'&&phase!=='countdown')return;command.pace=pace;for(const b of document.querySelectorAll('[data-pace]'))b.classList.toggle('selected',b.dataset.pace===pace);recordInput();}
for(const b of document.querySelectorAll('[data-pace]'))b.onclick=()=>setPace(b.dataset.pace);
function lane(delta){if((phase!=='race'&&phase!=='countdown')||paused)return;command.lane=Math.max(0,Math.min(5,command.lane+delta));$('#lane').textContent=command.lane+1;recordInput();}
$('#lane-in').onclick=()=>lane(-1);$('#lane-out').onclick=()=>lane(1);
function burst(){if(phase!=='race'||paused||race.runners[0].burstUsed)return;if(race.runners[0].reserve<24){announce('NOT ENOUGH STAMINA',1.4);return;}command.burst=true;recordInput();}
$('#burst').onclick=burst;
function recordInput(){if(phase==='countdown'){inputs=[{tick:0,...command}];}if(phase==='race'&&currentRun){const input={tick:race.tick,...command};inputs.push(input);}}
function setPaused(value){if(!['race','countdown','replay','parade','gatewalk'].includes(phase))return;paused=value;show('#pause-panel',value);$('#pause').textContent=value?'Resume':'Pause';accumulator=0;if(audio&&soundEnabled){if(value)audio.suspend();else audio.resume();}}
$('#pause').onclick=()=>setPaused(!paused);$('#resume').onclick=()=>setPaused(false);$('#retire').onclick=()=>toLobby();
addEventListener('keydown',e=>{if(e.target.matches('button,select,input,summary')&&e.code==='Space')return;if(['ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='KeyA'||e.code==='ArrowLeft')lane(-1);if(e.code==='KeyD'||e.code==='ArrowRight')lane(1);if(e.code==='Digit1')setPace('save');if(e.code==='Digit2')setPace('cruise');if(e.code==='Digit3')setPace('push');if(e.code==='Space')burst();if(e.code==='KeyC')$('#camera').click();if(e.code==='KeyP'||e.code==='Escape')setPaused(!paused);});
addEventListener('visibilitychange',()=>{if(document.hidden)setPaused(true);});
addEventListener('racecontextlost',()=>{setPaused(true);show('#error',true);$('#error').textContent='Graphics paused. Waiting for the browser to restore the stadium. If it does not recover, reload this page; your farm save is safe.';});
function start(){
 if(!world)return;if(!availableJockey(latestFarm(),jockeyId)){announce('CHOOSE AN AVAILABLE JOCKEY');return;}bookingDone=false;const seed=eventSeed;currentRun={version:RULES_VERSION,horse:JSON.parse(JSON.stringify(selected)),metres,seed,options:{plan,track,jockeyId},raceId:crypto.randomUUID(),inputs:[]};race=createRace(currentRun.horse,metres,seed,currentRun.options);inputs=[{tick:0,pace:'cruise',lane:0,burst:false}];command={pace:'cruise',lane:0,burst:false};
 phase='parade';dayClock=0;countdown=3.8;paused=false;accumulator=0;finishWait=0;lastPosition=1;finalCalled=false;slowmo=0;world.cameraMode(cams[camIndex]);$('#camera').textContent='Camera: '+cams[camIndex];
 show('#race-day',true);show('#skip-parade',true);show('#preview-toggle',false);show('#field',false);show('#setup',false);show('#venue',false);show('#hud',false);show('#results',false);show('#pause',true);show('#replay-label',false);show('.race-controls',true);$('#burst').disabled=false;$('#burst').innerHTML='<small>ONE CHANCE. MAKE IT COUNT.</small><b>✦ SKYBREAK</b>';$('#lane').textContent='1';for(const b of document.querySelectorAll('[data-pace]'))b.classList.toggle('selected',b.dataset.pace==='cruise');$('#horse-name').textContent=selected.name+' · '+jockeyById(jockeyId).name;$('#pause').textContent='Pause';announce('THE SKYLINE CUP • PARADE OF CONTENDERS',2.2);activateAudio();updateHUD();
}
$('#start').onclick=start;
function enterGates(){phase='countdown';countdown=3.8;lastCount=-1;show('#race-day',false);show('#hud',true);show('#field',true);world.cameraMode(cams[camIndex]);announce('UNDER STARTER’S ORDERS',2);}
$('#skip-parade').onclick=()=>{if(phase==='parade'||phase==='gatewalk')enterGates();};
$('#preview-toggle').onclick=()=>{previewOpen=!previewOpen;show('#setup',!previewOpen);show('#venue',!previewOpen);$('#preview-toggle').textContent=previewOpen?'Race setup':'Watch paddock';world?.setPreview?.(previewOpen?'paddock':'tour');};
function toLobby(){phase='lobby';previewOpen=false;show('#race-day',false);show('#preview-toggle',true);$('#preview-toggle').textContent='Watch paddock';race=null;currentRun=null;paused=false;accumulator=0;document.body.classList.remove('bursting');$('#callout').classList.remove('visible');$('#countdown').textContent='';for(const s of ['#hud','#results','#pause','#pause-panel','#replay-label','#field'])show(s,false);show('#setup',true);show('#venue',true);world?.cameraMode(cams[camIndex]);$('#camera').textContent='Camera: '+cams[camIndex];historyUI();renderJockeys();if(audio&&soundEnabled)audio.resume();}
$('#again').onclick=toLobby;
function startReplay(){if(!lastRun||lastRun.version!==RULES_VERSION)return;race=createRace(lastRun.horse,lastRun.metres,lastRun.seed,lastRun.options);phase='replay';paused=false;accumulator=0;replayAt=0;finishWait=0;slowmo=0;finalCalled=false;lastPosition=1;command={pace:'cruise',lane:0,burst:false};show('#results',false);show('#replay-label',true);show('.race-controls',false);show('#pause',true);$('#pause').textContent='Pause';announce('EVERY STRIDE. ONE MORE TIME.');world.cameraMode(cams[camIndex]);}
$('#replay').onclick=startReplay;$('#exit-replay').onclick=()=>finishRace(false);$('#replay-speed').onclick=()=>{replaySpeed=replaySpeed===1?2:replaySpeed===2?.5:1;$('#replay-speed').textContent=replaySpeed+'×';};
function finishRace(persist){
 const replay=phase==='replay';phase='finish';show('#results',true);show('#pause',false);show('#replay-label',false);show('.race-controls',false);document.body.classList.remove('bursting');
 // Leaving a replay early shows the already completed authoritative local result.
 const final=replay&&!race.done?lastRun.result:raceOrder(race).map(h=>({id:h.id,name:h.name,finish:h.finish}));
 const place=final.findIndex(h=>h.id==='player')+1,player=final.find(h=>h.id==='player'),winner=final[0];
 $('#result-title').textContent=place===1?'You touched the sky.':place===2?'A heartbeat away.':place===3?'A place on the podium.':'Every stride tells a story.';
 $('#result-subtitle').textContent=`${player.name} · ${race.runners[0].jockey.name} · ${race.metres}m · ${timeLabel(player.finish)} · Finished ${place} of 6`;
 $('#result-table').innerHTML=final.map((h,i)=>`<div class="result-row ${h.id==='player'?'you':''}"><b>${i+1}</b><span>${escape(h.name)}${h.id==='player'?' <small>YOU</small>':''}</span><time>${timeLabel(h.finish)}</time><small>${i===0?'WINNER':'+'+(h.finish-winner.finish).toFixed(2)+'s'}</small></div>`).join('');
 if(persist&&currentRun){lastRun={...currentRun,inputs:inputs.map(c=>({...c})),result:final};const history=readHistory();history.unshift({horse:player.name,jockey:race.runners[0].jockey.name,metres:race.metres,place,seconds:player.finish,date:new Date().toISOString()});try{localStorage.setItem('meadow-race-history-v1',JSON.stringify(history.slice(0,10)));localStorage.setItem('meadow-race-replay-v1',JSON.stringify(lastRun));}catch{}}
 if(!replay){announce(place===1?'SKYLINE CHAMPION':'THE CROWD SALUTES YOU',3);tone(523,.3);setTimeout(()=>tone(659,.3),170);setTimeout(()=>tone(784,.5),340);}
}
function updateHUD(){if(!race)return;const h=race.runners[0],order=raceOrder(race),place=order.findIndex(x=>x.id==='player')+1;
 $('#place').innerHTML=place+'<span>/6</span>';$('#metres').textContent=Math.max(0,Math.ceil(race.metres-h.distance))+'m TO GO';$('#clock').textContent=timeLabel(h.finish??race.time);$('#progress').value=h.distance/race.metres;$('#phase').textContent=h.finish!==null?'ACROSS THE LINE':h.distance>race.metres-200?'THE FINAL STRETCH':h.distance<80?'THE BREAKAWAY':'LAP '+Math.min(Math.ceil(race.metres/400),Math.floor(h.distance/400)+1)+' / '+Math.ceil(race.metres/400)+' • FIND YOUR RHYTHM';$('#speed').innerHTML=(h.finish!==null?0:(h.actualVelocity??h.velocity)*3.6).toFixed(0)+' <small>KM/H</small>';$('#resolve').value=h.resolve;$('#resolve-text').textContent=Math.round(h.resolve)+'%';$('#stamina').value=h.reserve;$('#stamina-text').textContent=Math.round(h.reserve)+'%';$('#lane').textContent=command.lane+1;
 $('#tactical-note').textContent=h.finish!==null?'You are home. Watching the field finish.':h.blocked?'BOXED IN • Find an open lane':h.drafting?'SLIPSTREAM • Saving stamina':h.reserve<22?'TIRED LEGS • Ease your tempo':h.burst>0?'SKYBREAK • This is your moment':command.pace==='push'?'PUSHING • Watch your stamina':(h.resolve>=75?'RESOLVE HIGH • A powerful burst is ready':'Build Resolve: conserve or draft behind a rival');
 $('#leaderboard').innerHTML='<div class="section-label" style="margin:0 0 5px">LIVE RUNNING ORDER</div>'+order.map((r,i)=>`<div class="runner ${r.id==='player'?'you':''}"><b>${i+1}</b><i style="background:${SILKS[race.runners.indexOf(r)]}"></i><span>${escape(r.name)}</span><em>${r.finish!==null?'FIN':i===0?'LEAD':Math.max(0,order[0].distance-r.distance).toFixed(0)+'m'}</em></div>`).join('');
 const isBurst=h.burst>0&&h.finish===null;document.body.classList.toggle('bursting',isBurst);$('#burst').classList.toggle('active',isBurst);$('#burst').disabled=h.burstUsed||h.reserve<24||phase!=='race'||h.finish!==null;
 if(h.burstUsed)$('#burst').innerHTML=isBurst?'<small>BREAK THROUGH THE LIMIT</small><b>✦ '+h.burst.toFixed(1)+'s</b>':'<small>YOU GAVE IT EVERYTHING</small><b>BURST USED</b>';
 if(phase==='race'||phase==='replay'){
  if(!finalCalled&&h.distance>=race.metres-200){finalCalled=true;announce('200 METRES. ALL HEART.',2.5);tone(660,.16);}
  if(place<lastPosition&&h.distance>50&&h.finish===null)announce(place===1?'INTO THE LEAD!':'THROUGH THE GAP!',1.8);
  lastPosition=place;
 }
}
let last=performance.now(),lastCount=-1;
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.1,(now-last)/1000);last=now;if(!world)return;
 if(!paused){
  if(phase==='parade'||phase==='gatewalk'){dayClock+=dt;show('#race-day',true);$('#day-stage').textContent=phase==='parade'?'01 / THE PARADE RING':'02 / TO THE STARTING GATES';$('#day-title').textContent=phase==='parade'?'Meet your contenders.':'Taking their places.';$('#day-caption').textContent=phase==='parade'?jockeyById(jockeyId).name+' leads '+selected.name+' · '+metres+'m Skyline Cup':'Jockeys mount up. The field walks forward under the starter’s orders.';$('#day-progress').value=phase==='parade'?dayClock/18:dayClock/8;race.presentationTime=phase==='gatewalk'?dayClock:0;if(phase==='parade'&&dayClock>=18){phase='gatewalk';dayClock=0;announce('RIDERS UP • TO THE START',2);}else if(phase==='gatewalk'&&dayClock>=8)enterGates();}
  if(phase==='countdown'){
   countdown-=dt;const n=Math.ceil(countdown-.8);$('#countdown').textContent=n>0?String(n):'RUN!';if(n!==lastCount&&n>=0){tone(n>0?300:600,.12);lastCount=n;}
   if(countdown<=0){try{if(!bookingDone){if(jockeyId!=='stable')updateFarm(s=>bookJockey(s,jockeyId,currentRun.raceId));bookingDone=true;}}catch(e){toLobby();$('#jockey-message').textContent=e.message;return;}$('#countdown').textContent='';phase='race';announce('THE GATES FLY OPEN!',1.8);}
  }
  if(phase==='race'||phase==='replay'){
   if(slowmo>0)slowmo-=dt;const factor=phase==='replay'?replaySpeed:slowmo>0?.4:1;accumulator+=dt*factor;
   while(accumulator>=STEP&&!race.done){
    if(phase==='replay'){while(replayAt<lastRun.inputs.length&&lastRun.inputs[replayAt].tick<=race.tick)command={...lastRun.inputs[replayAt++]};}
    const used=race.runners[0].burstUsed;const leaderFinished=race.finished.length>0;stepRace(race,command);command.burst=false;
    if(!used&&race.runners[0].burstUsed){announce('SKYBREAK — BEYOND THE LIMIT!',2.7);tone(180,.4,.05,'sawtooth');}
    if(!leaderFinished&&race.finished.length){slowmo=2.2;announce('AT THE WIRE!',2.2);}if(phase==='race'&&currentRun&&race.runners[0].finish!==null&&!currentRun.crossed){if(currentRun)currentRun.crossed=true;announce('THROUGH THE LINE • '+timeLabel(race.runners[0].finish),3);}
    accumulator-=STEP;
   }
   if(race.done){finishWait+=dt;if(finishWait>6.5)finishRace(phase==='race');}
   uiClock+=dt;if(uiClock>.1){uiClock=0;updateHUD();}
   if(soundEnabled&&race.runners[0].finish===null&&now-lastHoof>160){lastHoof=now;tone(95,.045,.045,'triangle');if(noise)noise.gain.value=race.runners[0].distance>race.metres-200?.055:.028;}
  }
  world.update(dt,race,phase,phase==='finish'||!!race?.done);
 }
 if(now>announcementUntil)$('#callout').classList.remove('visible');
}
if(world){world.ready.then(ok=>{if(ok){world.setJockey?.(jockeyById(jockeyId));world.setHorseProfile?.(selected);}$('#start').disabled=!ok;$('#start').textContent=ok?'Begin race day  ↗':'Horse models unavailable — reload';$('#load-note').textContent=ok?'Parade ring → riders up → starting gates → race → run-through':'The full horse models could not load. Reload to retry; the race will not substitute block horses.';});requestAnimationFrame(frame);}
