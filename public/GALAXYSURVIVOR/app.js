/* Offline prototype. Server-backed ranking and Apps in Toss integration are separate milestones. */
let selectedLoadout=null;
const toast = document.querySelector('.toast');
let toastTimer;
function notice(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2400); }
const modal = document.querySelector('.modal');
const settings = document.querySelector('.settings');
const flashToggle=modal.querySelector('.flash-toggle');const flashStatus=modal.querySelector('.settings-status');
const settingsKey='galaxy-survivor-settings-v1';
let visualSettings={flash:true};
try{const stored=JSON.parse(localStorage.getItem(settingsKey)||'null');if(stored&&typeof stored.flash==='boolean')visualSettings.flash=stored.flash;}catch(error){console.warn('설정 데이터를 읽지 못했습니다.',error);}
function updateFlashStatus(){flashToggle.checked=visualSettings.flash;flashStatus.textContent=visualSettings.flash?'화면 섬광 켜짐':'화면 섬광 꺼짐';}
updateFlashStatus();
flashToggle.addEventListener('change',()=>{const desired=flashToggle.checked;try{localStorage.setItem(settingsKey,JSON.stringify({flash:desired}));visualSettings.flash=desired;updateFlashStatus();}catch(error){flashToggle.checked=visualSettings.flash;flashStatus.textContent='저장하지 못했어요. 기존 설정을 유지합니다.';}});
function selectSettingsTab(name,focus=false){
 const general=name==='general';
 for(const [id,active] of [['general',general],['account',!general]]){
  const tab=modal.querySelector('#settings-tab-'+id),panel=modal.querySelector('#settings-panel-'+id);
  tab.setAttribute('aria-selected',String(active));tab.setAttribute('tabindex',active?'0':'-1');panel.hidden=!active;if(active&&focus)tab.focus();
 }
}
for(const name of ['general','account']){
 const tab=modal.querySelector('#settings-tab-'+name);tab.addEventListener('click',()=>selectSettingsTab(name));
 tab.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();selectSettingsTab(name==='general'?'account':'general',true);}});
}
const lobbyTabs=['sortie','hangar','events'];
function selectLobbyTab(name,focus=false){
 if(!lobbyTabs.includes(name))return;
 for(const id of lobbyTabs){const active=id===name,tab=document.querySelector('#lobby-tab-'+id),panel=document.querySelector('#lobby-panel-'+id);tab.setAttribute('aria-selected',String(active));tab.setAttribute('tabindex',active?'0':'-1');panel.hidden=!active;if(active&&focus)tab.focus();}
}
for(const [index,name] of lobbyTabs.entries()){
 const tab=document.querySelector('#lobby-tab-'+name);tab.addEventListener('click',()=>selectLobbyTab(name));tab.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();selectLobbyTab(lobbyTabs[(index+(event.key==='ArrowRight'?1:-1)+lobbyTabs.length)%lobbyTabs.length],true);}});
}
function closeModal() { modal.hidden = true; settings.focus(); }
settings.addEventListener('click', () => { updateFlashStatus();selectSettingsTab('general');modal.hidden = false; modal.querySelector('.close').focus(); });
modal.querySelector('.close').addEventListener('click', closeModal);
modal.querySelector('.confirm').addEventListener('click', closeModal);
modal.querySelector('.tutorial-replay').addEventListener('click',()=>{closeModal();openSortieSelection('normal',true);});
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });

const app = document.querySelector('.app');
function renderSeason(){const season=window.GAME_SEASON||{label:'시즌 01',title:'첫 번째 출격',period:'시즌 일정 추후 안내',description:'격납고에서 출격을 준비하세요.',status:'준비 중'};for(const [selector,key] of [['.season-label','label'],['.season-title','title'],['.season-period','period'],['.season-description','description'],['.season-status','status']])document.querySelector(selector).textContent=typeof season[key]==='string'?season[key]:'';}
renderSeason();
const overlay = document.createElement('section');
overlay.className = 'game-screen'; overlay.hidden = true;
overlay.innerHTML = `<canvas aria-label="슈팅 게임 화면"></canvas><div class="enrage-fog" hidden aria-hidden="true"></div><div class="system-warning" hidden role="status" aria-live="polite"></div><div class="encounter-warning" hidden role="status" aria-live="assertive"><div class="encounter-warning-inner"><span class="encounter-warning-kicker">⚠ WARNING ⚠</span><strong class="encounter-warning-title"></strong><span class="encounter-warning-detail"></span></div></div><div class="enrage-countdown" hidden role="status" aria-live="polite"></div><div class="game-hud"><div><span class="hud-label">HP</span><div class="bar"><i class="hp-bar"></i></div><small class="shield-count">실드 0</small></div><div class="hud-center"><b class="time">00:00</b><small class="level">LV. 1</small></div><div class="hud-buttons"><button class="pause" aria-label="일시정지">Ⅱ</button></div><div class="wave-hud"><div><strong class="wave-label">WAVE 1 / 3</strong><span class="wave-time">보스까지 03:00</span></div><div class="wave-progress"><i></i></div></div><div class="boss-hud" hidden><span class="boss-label">보스 · PHASE 1 / 3</span><span class="boss-timer"></span><div class="boss-health-track" role="progressbar" aria-label="보스 체력" aria-valuemin="0" aria-valuemax="100"><i></i><span class="boss-health-percent"></span></div></div></div><div class="xp-track"><i></i></div><div class="game-stats"><span>점수 <b class="live-score">0</b></span><span>처치 <b class="live-kills">0</b></span><span class="hud-coins">코인 <b class="live-coins">0</b></span><span class="round-status">R1 · 1/5</span></div><div class="loadout" aria-label="현재 선택한 강화"><div class="loadout-group" data-group="main"><span class="loadout-label">주무기</span><div class="loadout-slots"></div></div><div class="loadout-group" data-group="aux"><span class="loadout-label">보조</span><div class="loadout-slots"></div></div><div class="loadout-group" data-group="utility"><span class="loadout-label">유틸</span><div class="loadout-slots"></div></div></div><div class="controls"><div class="joystick" aria-label="이동 패드"><div class="stick"></div></div><button class="bomb-button" aria-label="폭탄 사용"><svg class="bomb-icon" viewBox="0 0 181 181" shape-rendering="crispEdges" aria-hidden="true"><image href="assets/augment-icons-pixel-v2.png" x="-1086" y="-905" width="1448" height="1086" style="image-rendering:pixelated"/></svg><small>폭탄 <b>3</b></small></button></div><div class="stage-loot-countdown" hidden role="status" aria-live="polite"></div><div class="stage-clear-banner" hidden role="status" aria-live="polite"></div><div class="stage-transition-fade" hidden aria-hidden="true"></div><div class="bomb-explosions" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="bomb-cutin" aria-hidden="true"><div class="bomb-cutin-band"></div><div class="bomb-cutin-portrait"></div><div class="bomb-cutin-copy"><small>CAPTAIN / COMMAND</small><strong>발사!</strong></div></div><div class="game-panel" hidden></div>`;
app.appendChild(overlay);
let systemTimer, fogTimer, criticalWarning=false;
function systemNotice(message,enrage=false){
 if(criticalWarning&&!enrage)return;criticalWarning=enrage;
 const label=overlay.querySelector('.system-warning'),fog=overlay.querySelector('.enrage-fog');
 clearTimeout(systemTimer);label.hidden=true;label.textContent=message;label.classList.remove('warning-blink');
 if(visualSettings.flash){void label.offsetWidth;label.classList.add('warning-blink');}
 label.hidden=false;systemTimer=setTimeout(()=>{label.hidden=true;criticalWarning=false;},enrage?4000:2600);

}
let encounterWarningTimer;
function showEncounterWarning(title,detail){const el=overlay.querySelector('.encounter-warning');clearTimeout(encounterWarningTimer);el.hidden=true;el.classList.remove('encounter-warning-motion');el.querySelector('.encounter-warning-title').textContent=title;el.querySelector('.encounter-warning-detail').textContent=detail;if(visualSettings.flash){void el.offsetWidth;el.classList.add('encounter-warning-motion');}el.hidden=false;encounterWarningTimer=setTimeout(()=>{el.hidden=true;},2100);}
function clearSystemNotice(){clearTimeout(encounterWarningTimer);overlay.querySelector('.encounter-warning').hidden=true;criticalWarning=false;clearTimeout(systemTimer);clearTimeout(fogTimer);overlay.querySelector('.system-warning').hidden=true;overlay.querySelector('.enrage-fog').hidden=true;}
const lobbyCanvas=document.querySelector('.lobby-ship');const lobbyCtx=lobbyCanvas.getContext('2d');if(lobbyCtx&&typeof lobbyCtx.fillRect==='function'){lobbyCtx.imageSmoothingEnabled=false;PixelArt.sprite(lobbyCtx,'player',40,44,68,80);}
const canvas = overlay.querySelector('canvas'), ctx = canvas.getContext('2d');
const panel = overlay.querySelector('.game-panel'), hpBar=overlay.querySelector('.hp-bar'), xpBar = overlay.querySelector('.xp-track i');
const W=400,H=700, duration=180;
// Tutorial progress is a local convenience flag; it is not a cloud-backed account save.
const tutorialKey='galaxy-survivor-tutorial-hide-v2';
const storyDialog=document.createElement('div');storyDialog.className='story-overlay';storyDialog.hidden=true;
storyDialog.innerHTML='<div class="story-shade"></div><section class="story-window" role="dialog" aria-modal="true" aria-labelledby="story-name" aria-describedby="story-text"><div class="story-portrait" aria-hidden="true"></div><div class="story-box"><div class="story-channel"><span class="radio-dot"></span><span class="radio-source">관제탑 → 기체</span><span class="radio-signal" aria-hidden="true">▂ ▄ ▆</span></div><div class="story-top"><strong id="story-name"></strong><span class="story-counter"></span></div><p id="story-text"></p><label class="story-preference" hidden><input class="tutorial-hide" type="checkbox">다음부터 표시하지 않기</label><div class="story-actions"><button class="story-skip" type="button">건너뛰기</button><button class="story-next" type="button">다음 ▶</button></div></div></section>';
overlay.appendChild(storyDialog);
function augmentStat(id,key,fallback){const value=window.GAME_CONFIG?.augmentCombat?.[id]?.[key];return typeof value==='number'&&Number.isFinite(value)?value:fallback;}
function gameStat(name,fallback){const value=window.GAME_CONFIG?.stats?.[name];return typeof value==='number'&&Number.isFinite(value)?value:fallback;}
function gameDialogue(name,fallback,values={}){const lines=window.GAME_CONFIG?.dialogue?.[name]||fallback;return lines.map(line=>({...line,text:line.text.replace(/\{(boss|stage)\}/g,(match,key)=>values[key]??match)}));}
const tutorialDefaults=[
 {who:'파일럿 이안',portrait:'pilot',text:'관제탑, 여기는 이안. 출격 준비 완료. 교신 상태 확인 바란다.'},
 {who:'관제사 미라',portrait:'mira',text:'잘 들려요, 이안. 실제 출격 전에 안전한 훈련장에서 조작을 확인할게요.'},
 {who:'관제사 미라',portrait:'mira',text:'빛나는 왼쪽 가상 패드를 움직여 기체를 이동하세요. PC에서는 W A S D를 누르세요.',action:'move'},
 {who:'관제사 미라',portrait:'mira',text:'좋아요! 적 탄막이 다가올 때 오른쪽 폭탄 버튼을 눌러 보세요.',action:'bomb'},
 {who:'관제사 미라',portrait:'mira',text:'성공이에요! 이제 빛나는 에너지에 기체를 가까이 움직여 획득해 보세요.',action:'collect'},
 {who:'파일럿 이안',portrait:'pilot',text:'훈련 완료. 기체 점검 끝! 관제탑, 이제 본격적으로 출격하겠다.'}
];
const tutorialLines=gameDialogue('tutorial',tutorialDefaults);
let storyDone=null,storyLines=[],storyIndex=0,tutorial=null;
function closeStory(){if(storyDialog.hidden)return;storyDialog.hidden=true;const done=storyDone;storyDone=null;storyLines=[];if(done)done();}
function showStory(lines,onDone,isTutorial=false){if(!state||!state.running||!lines.length){if(onDone)onDone();return;}resetStick();state.paused=true;storyLines=lines;storyIndex=0;storyDone=onDone;const preference=storyDialog.querySelector('.story-preference');preference.hidden=!isTutorial;if(isTutorial){let hidden=false;try{hidden=localStorage.getItem(tutorialKey)==='hide';}catch{}storyDialog.querySelector('.tutorial-hide').checked=hidden;}storyDialog.hidden=false;renderStory();}
function clearTutorialHighlight(){for(const name of ['tutorial-move','tutorial-bomb','tutorial-collect','tutorial-active','tutorial-upgrade'])overlay.classList.remove(name);}
function renderStory(){const line=storyLines[storyIndex];storyDialog.querySelector('#story-name').textContent=line.portrait==='pilot'&&selectedLoadout?'파일럿 '+PILOTS.find(p=>p.id===selectedLoadout.pilotId).name:line.who;storyDialog.querySelector('.radio-source').textContent=line.portrait==='pilot'?'기체 → 관제탑':'관제탑 → 기체';storyDialog.querySelector('#story-text').textContent=line.text;storyDialog.querySelector('.story-counter').textContent=(storyIndex+1)+' / '+storyLines.length;storyDialog.querySelector('.story-portrait').className='story-portrait '+(line.portrait==='pilot'?'portrait-pilot'+(selectedLoadout?' pilot-'+selectedLoadout.pilotId:''):'portrait-mira');storyDialog.querySelector('.story-next').textContent=storyIndex===storyLines.length-1?(tutorial?'실전 출격 ▶':'계속 ▶'):'다음 ▶';storyDialog.querySelector('.story-next').hidden=!!(tutorial&&line.action);if(tutorial){clearTutorialHighlight();overlay.classList.add('tutorial-active');tutorial.phase=line.action||'dialog';if(line.action){overlay.classList.add('tutorial-'+line.action);resetStick();state.paused=false;last=0;if(line.action==='move'){tutorial.originX=state.x;tutorial.originY=state.y;}if(line.action==='bomb'){state.enemyShots=[{x:150,y:300,vx:0,vy:0,r:6},{x:200,y:300,vx:0,vy:0,r:6},{x:250,y:300,vx:0,vy:0,r:6}];}if(line.action==='collect'){const x=state.x<200?Math.min(W-25,state.x+120):Math.max(25,state.x-120);state.drops=[{x,y:state.y,tutorial:true}];}}else{resetStick();state.paused=true;}}}
function advanceTutorial(){if(!tutorial||!storyLines.length)return;resetStick();state.paused=true;storyIndex++;renderStory();}
storyDialog.querySelector('.story-next').addEventListener('click',()=>{if(tutorial&&storyLines[storyIndex].action)return;if(++storyIndex>=storyLines.length)closeStory();else renderStory();});
storyDialog.querySelector('.story-skip').addEventListener('click',closeStory);
function finishTutorial(){const selected=mode;let saved=true;try{localStorage.setItem(tutorialKey,storyDialog.querySelector('.tutorial-hide').checked?'hide':'show');}catch{saved=false;}tutorial=null;clearTutorialHighlight();start(selected);state.storyEnabled=true;if(!saved)notice('튜토리얼 표시 설정을 저장하지 못했어요.');}
const PILOTS=[{id:'ian',name:'이안',role:'선봉 파일럿'},{id:'sena',name:'세나',role:'항법 파일럿'},{id:'rae',name:'레이',role:'베테랑 파일럿'}];
const SHIPS=[{id:'ark',name:'오비탈 아크',role:'성장형',passive:()=>`경험치 획득 +${Math.round((gameStat('shipArkXpMultiplier',1.12)-1)*100)}%`},{id:'manta',name:'네뷸라 만타',role:'기동형',passive:()=>`이동 속도 +${Math.round((gameStat('shipMantaSpeedMultiplier',1.1)-1)*100)}%`},{id:'forge',name:'스텔라 포지',role:'화력형',passive:()=>`주무기 시작 공격력 +${gameStat('shipForgeMainBonus',.25)}`}];
function openSortieSelection(selected='normal',forceTutorial=false){
 if(state?.revivePending||state?.deathSequence)return;
 const previous=document.activeElement,veil=document.createElement('div');veil.className='sortie-select-overlay';let ship=selectedLoadout?.shipId||'ark',pilot=selectedLoadout?.pilotId||'ian';
 const box=document.createElement('section');box.className='sortie-select-dialog';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','출격 편성');
 box.innerHTML=`<header class="sortie-head"><div><small>HANGAR / FLIGHT DECK</small><h2>출격 편성</h2><p>파일럿과 기체를 선택하세요</p></div><button class="sortie-close" type="button" aria-label="닫기">×</button></header><div class="sortie-section-head"><h3>01 <span>파일럿</span></h3><small>교신 초상화 변경</small></div><div class="sortie-pilots">${PILOTS.map(p=>`<button type="button" class="sortie-pilot" data-pilot="${p.id}" aria-pressed="false"><span class="sortie-pilot-art pilot-${p.id}"></span><strong>${p.name}</strong><small>${p.role}</small></button>`).join('')}</div><div class="sortie-section-head"><h3>02 <span>기체</span></h3><small>고유 패시브 적용</small></div><div class="sortie-ships">${SHIPS.map(v=>`<button type="button" class="sortie-ship" data-ship="${v.id}" aria-pressed="false"><span class="sortie-ship-art"><img src="assets/ship-${v.id}-v1.png" alt=""></span><strong>${v.name}</strong><small>${v.role}</small><b>${v.passive()}</b></button>`).join('')}</div><p class="sortie-footnote">파일럿은 외형과 교신에 반영되며, 기체 패시브는 모든 스테이지에 유지됩니다.</p><button type="button" class="sortie-confirm">선택 완료 · 출격 <span>▶</span></button>`;
 veil.append(box);document.body.append(veil);const close=()=>{veil.remove();document.removeEventListener('keydown',onKey);previous?.focus?.();};const onKey=e=>{if(e.key==='Escape')close();};document.addEventListener('keydown',onKey);veil.addEventListener('click',e=>{if(e.target===veil)close();});box.querySelector('.sortie-close').addEventListener('click',close);
 const update=()=>{for(const el of box.querySelectorAll('[data-ship]'))el.setAttribute('aria-pressed',String(el.dataset.ship===ship));for(const el of box.querySelectorAll('[data-pilot]'))el.setAttribute('aria-pressed',String(el.dataset.pilot===pilot));};
 for(const el of box.querySelectorAll('[data-ship]'))el.addEventListener('click',()=>{ship=el.dataset.ship;update();});for(const el of box.querySelectorAll('[data-pilot]'))el.addEventListener('click',()=>{pilot=el.dataset.pilot;update();});box.querySelector('.sortie-confirm').addEventListener('click',()=>{selectedLoadout={shipId:ship,pilotId:pilot};close();drawLobbyShip();launch(selected,forceTutorial);});update();box.querySelector('.sortie-close').focus();
}
function launch(selected,forceTutorial=false){if(state?.revivePending||state?.deathSequence)return;start(selected);state.storyEnabled=true;let hide=false;try{hide=localStorage.getItem(tutorialKey)==='hide';}catch{}if(forceTutorial||!hide){tutorial={phase:'dialog'};showStory(tutorialLines,finishTutorial,true);}}
function updatePlayerTilt(input,dt){const target=Math.max(-1,Math.min(1,input))*.16;state.tilt+=(target-state.tilt)*(1-Math.exp(-11*dt));}
function updateTutorial(dt){
 state.bombFlash=Math.max(0,state.bombFlash-dt);
 const dx=(heldKeys.has('d')?1:0)-(heldKeys.has('a')?1:0)+state.joyX,dy=(heldKeys.has('s')?1:0)-(heldKeys.has('w')?1:0)+state.joyY,len=Math.hypot(dx,dy),scale=len>1?1/len:1;
 updatePlayerTilt(dx*scale,dt);state.x=Math.max(20,Math.min(W-20,state.x+dx*scale*playerSpeed(state.level)*dt));state.y=Math.max(85,Math.min(H-20,state.y+dy*scale*playerSpeed(state.level)*dt));
 if(tutorial.phase==='move'&&Math.hypot(state.x-tutorial.originX,state.y-tutorial.originY)>=24){advanceTutorial();return;}
 if(tutorial.phase==='collect'&&state.drops.length&&Math.hypot(state.x-state.drops[0].x,state.y-state.drops[0].y)<22){state.drops=[];tutorial.phase='upgrade';clearTutorialHighlight();overlay.classList.add('tutorial-upgrade');storyDialog.hidden=true;state.xp=state.need;levelUp();}
}

const dropConfig=window.DROP_CONFIG||{xp:{mode:'chance',chance:1,interval:0},shield:{mode:'chance',chance:.005,interval:0},bomb:{mode:'chance',chance:0,interval:0}};
const augmentCombatAtlas=new Image();augmentCombatAtlas.src='assets/augment-icons-pixel-v2.png';
const stageBackground=new Image();stageBackground.src='assets/station-arcade-v1.png';
const escortDroneArt=new Image();escortDroneArt.src='assets/escort-arcade-v1.png';
const selectedShipSprites={},selectedDroneSprites={};for(const id of ['ark','manta','forge']){selectedShipSprites[id]=new Image();selectedShipSprites[id].src='assets/ship-'+id+'-v1.png';selectedDroneSprites[id]=new Image();selectedDroneSprites[id].src='assets/drone-'+id+'-v1.png';}
// Non-transparent sprite bounds, with padding for edge detail; original artwork is unchanged.
const SHIP_SPRITE_BOUNDS={ark:[424,0,680,992],manta:[160,16,1216,1008],forge:[336,80,864,848]};
const DRONE_SPRITE_BOUNDS={ark:[256,136,744,976],manta:[456,176,624,680],forge:[296,120,696,928]};
// Pixel-art sprites load asynchronously; the original shapes remain as a fallback.
const combatArt={player:new Image(),enemy:new Image(),boss:new Image(),hunter:new Image(),charger:new Image(),gunner:new Image(),venom:new Image(),side:new Image(),turret:new Image()};
combatArt.player.src='assets/player-arcade-v1.png';combatArt.enemy.src='assets/enemy-scout-arcade-v1.png';combatArt.boss.src='assets/boss-arcade-0.png';combatArt.hunter.src='assets/enemy-hunter-arcade-v1.png';combatArt.charger.src='assets/enemy-charger-arcade-v1.png';combatArt.gunner.src='assets/enemy-gunner-arcade-v1.png';combatArt.venom.src='assets/enemy-venom-arcade-v1.png';combatArt.side.src='assets/enemy-side-arcade-v1.png';combatArt.turret.src='assets/enemy-turret-arcade-v1.png';
const stageBossArt=[combatArt.boss,...[2,3,4,5,1].map(stage=>{const image=new Image();image.src='assets/boss-arcade-'+stage+'.png';return image;})];
const skinArtCache=new Map();
// Precomputed alpha masks avoid getImageData, which is blocked for local file images.
const skinMasks={body:new Image(),engine:new Image()};
skinMasks.body.src='assets/player-body-mask.png';skinMasks.engine.src='assets/player-engine-mask.png';
function playerArtWithSkin(skin,keepFlames=false){
 const shipId=arguments[2]||(typeof selectedLoadout!=='undefined'?selectedLoadout?.shipId:null);const chosen=shipId&&typeof selectedShipSprites!=='undefined'?selectedShipSprites[shipId]:null;const source=chosen?.complete&&chosen.naturalWidth?chosen:combatArt.player;if(!source.complete||!source.naturalWidth)return source;
 const key=(chosen&&source===chosen?shipId+'|':'legacy|')+(keepFlames?'full|':'clean|')+(skin.body||'')+'|'+(skin.engine||'');if(skinArtCache.has(key))return skinArtCache.get(key);
 // The source contains static exhaust. Clear only the two flame areas so the live exhaust can animate behind the nozzles.
 let base=keepFlames||source!==combatArt.player?source:skinArtCache.get('__clean_engine__');if(!base){base=document.createElement('canvas');base.width=source.naturalWidth;base.height=source.naturalHeight;const bc=base.getContext('2d');if(!bc)return source;bc.imageSmoothingEnabled=false;bc.drawImage(source,0,0);const y=Math.floor(base.height*.80);for(const left of [.335,.545])bc.clearRect(Math.floor(base.width*left),y,Math.ceil(base.width*.12),base.height-y);skinArtCache.set('__clean_engine__',base);}
 if(!skin.body&&!skin.engine){skinArtCache.set(key,base);return base;}
 const layer=document.createElement('canvas');layer.width=base.width;layer.height=base.height;const c=layer.getContext('2d');if(!c)return base;c.imageSmoothingEnabled=false;c.drawImage(base,0,0);
 for(const slot of ['body','engine']){if(!skin[slot])continue;const tinted=document.createElement('canvas');tinted.width=layer.width;tinted.height=layer.height;const tc=tinted.getContext('2d');if(!tc)continue;tc.drawImage(base,0,0);if(slot==='engine')tc.clearRect(0,0,tinted.width,Math.floor(tinted.height*.69));else tc.clearRect(0,Math.floor(tinted.height*.69),tinted.width,tinted.height);tc.globalCompositeOperation='source-in';tc.fillStyle=skin[slot];tc.fillRect(0,0,tinted.width,tinted.height);c.globalAlpha=slot==='body'?.37:.65;c.drawImage(tinted,0,0);c.globalAlpha=1;}
 skinArtCache.set(key,layer);return layer;
}

function updateEngineEffects(container,skin){if(!container)return;const effect=container.querySelector('.engine-effects');if(!effect)return;const hue={'#79e7b2':'hue-rotate(-50deg)','#ff91bf':'hue-rotate(140deg)','#ffb05d':'hue-rotate(200deg)'};effect.style.filter=hue[(skin.engine||'').toLowerCase()]||'none';}
// Armor tint is cached at sprite resolution. Red cores and orange projectiles stay unchanged.
const enemyArmorColors={scout:[115,167,220],hunter:[83,213,167],charger:[229,190,83],fast:[242,214,120],shooter:[99,207,222],gunner:[195,135,229],salvo:[232,139,195]};
const enemyArtCache=new Map();
function enemyArtWithColor(kind,source){
 const tint=enemyArmorColors[kind];if(!tint)return source;if(enemyArtCache.has(kind))return enemyArtCache.get(kind);
 try{const layer=document.createElement('canvas');layer.width=384;layer.height=384;const c=layer.getContext('2d',{willReadFrequently:true});c.imageSmoothingEnabled=false;c.drawImage(source,0,0,384,384);const image=c.getImageData(0,0,384,384),pixels=image.data;
 for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]<32)continue;const r=pixels[i],g=pixels[i+1],b=pixels[i+2];if(b>55&&b>r*1.12&&b>g*.98){const light=Math.max(r,g,b)/255;for(let j=0;j<3;j++)pixels[i+j]=Math.round(tint[j]*light);}}
 c.putImageData(image,0,0);enemyArtCache.set(kind,layer);return layer;}catch(error){return source;}
}
// Preserve source proportions and use filtered downsampling for detailed concept art.
function drawImageContained(ctx,image,x,y,w,h,bounds){const iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height;if(!iw||!ih)return;const [sx,sy,sw,sh]=bounds||[0,0,iw,ih],scale=Math.min(w/sw,h/sh),dw=sw*scale,dh=sh*scale;ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,sx,sy,sw,sh,x-dw/2,y-dh/2,dw,dh);ctx.restore();}
function drawCombatSprite(ctx,kind,x,y,w,h,phase=1,skin={}){
 const key=kind==='fast'?'charger':['shooter','salvo'].includes(kind)?'gunner':['player','boss','hunter','charger','gunner','venom','side','turret'].includes(kind)?kind:'enemy',stageImage=kind==='boss'?stageBossArt[skin.bossType||0]:null,image=stageImage&&stageImage.complete&&stageImage.naturalWidth?stageImage:kind==='player'&&selectedLoadout?.shipId&&selectedShipSprites[selectedLoadout.shipId]?.complete&&selectedShipSprites[selectedLoadout.shipId].naturalWidth?selectedShipSprites[selectedLoadout.shipId]:combatArt[key];
 if(!image.complete||!image.naturalWidth){PixelArt.sprite(ctx,kind==='fast'?'charger':['shooter','salvo','venom'].includes(kind)?'gunner':['side','turret'].includes(kind)?'enemy':kind,x,y,w,h,phase,skin);return;}
 const art=kind==='player'?playerArtWithSkin(skin,true):kind==='boss'||kind==='side'||kind==='turret'?image:enemyArtWithColor(kind,image);ctx.save();ctx.imageSmoothingEnabled=false;if(kind==='boss'&&'filter' in ctx)ctx.filter='saturate(1.14) contrast(1.04)';
 if(kind==='boss'){
  // Remove the outside sections as the two boss pods break across phases.
  const left=phase>=2?.23:0,right=phase>=3?.77:1;ctx.beginPath();ctx.rect(x-w/2+w*left,y-h/2,w*(right-left),h);ctx.clip();
  if(image===combatArt.boss&&'filter' in ctx)ctx.filter='saturate(1.14) contrast(1.04) hue-rotate('+([0,35,320,175,295][skin.bossType||0])+'deg)';
 }
 if(kind==='player'&&image!==combatArt.player)drawImageContained(ctx,art,x,y,w,h,SHIP_SPRITE_BOUNDS[selectedLoadout.shipId]);else ctx.drawImage(art,x-w/2,y-h/2,w,h);ctx.restore();
}

// Cache alpha silhouettes so outlines follow each sprite, including detached boss parts.
const combatSilhouettes=new Map();
function combatSilhouette(kind,phase,color,bossType=0){
 const bossArtReady=kind==='boss'&&stageBossArt[bossType]?.complete&&stageBossArt[bossType]?.naturalWidth;const key=kind+'|'+phase+'|'+color+'|'+bossType+'|'+Boolean(bossArtReady);if(combatSilhouettes.has(key))return combatSilhouettes.get(key);
 const image=kind==='boss'&&stageBossArt[bossType]?.complete&&stageBossArt[bossType]?.naturalWidth?stageBossArt[bossType]:combatArt[kind==='fast'?'charger':['shooter','salvo'].includes(kind)?'gunner':['boss','hunter','charger','gunner','venom','side','turret'].includes(kind)?kind:'enemy'];
 if(!image.complete||!image.naturalWidth)return null;
 const layer=document.createElement('canvas');layer.width=192;layer.height=192;const c=layer.getContext('2d');if(!c)return null;c.imageSmoothingEnabled=false;
 drawCombatSprite(c,kind,96,96,192,192,phase,{bossType});c.globalCompositeOperation='source-in';c.fillStyle=color;c.fillRect(0,0,192,192);c.globalCompositeOperation='source-over';combatSilhouettes.set(key,layer);return layer;
}
// Build separate annular sprite layers without reading pixels, including file:// previews.
let miniBossLayers=null;
function getMiniBossLayers(){const image=stageBossArt[3];if(!image.complete||!image.naturalWidth)return null;if(miniBossLayers)return miniBossLayers;const make=()=>{const c=document.createElement('canvas');c.width=256;c.height=256;return c;};const base=make(),outer=make(),inner=make();for(const layer of [base,outer,inner]){const c=layer.getContext('2d');if(!c)return null;c.imageSmoothingEnabled=false;c.drawImage(image,0,0,256,256);c.globalCompositeOperation=layer===base?'destination-out':'destination-in';c.beginPath();if(layer===outer){c.arc(128,128,127,0,Math.PI*2);c.arc(128,128,60,0,Math.PI*2,true);}else c.arc(128,128,layer===base?127:60,0,Math.PI*2);c.fill();c.globalCompositeOperation='source-over';}return miniBossLayers={base,outer,inner};}
function miniBossRingAngles(time){return {outer:time*.7,inner:-time*1.15};}
function drawMiniBoss(ctx,e,w,h){const layers=getMiniBossLayers();if(!layers){drawCombatSprite(ctx,'boss',e.x,e.y,w,h,1,{bossType:3});return;}const angles=miniBossRingAngles(state.t);ctx.save();ctx.translate(e.x,e.y);ctx.scale(w/256,h/256);ctx.drawImage(layers.base,-128,-128);for(const [layer,angle] of [[layers.outer,angles.outer],[layers.inner,angles.inner]]){ctx.save();ctx.rotate(angle);ctx.drawImage(layer,-128,-128);ctx.restore();}ctx.restore();}
// Four opposing mounts rotate with their rings; each fires an aimed pair.
function fireMiniBossRing(enemy,inner,source=enemy.boss?'boss':'miniboss'){const angle=miniBossRingAngles(state.t)[inner?'inner':'outer'],radiusX=inner?16:37,radiusY=inner?11:26;for(let i=0;i<2;i++){const a=angle+i*Math.PI,x=enemy.x+Math.cos(a)*radiusX,y=enemy.y+Math.sin(a)*radiusY,aim=Math.atan2(state.x-x,state.y-y);for(const offset of [-.12,.12])fireEnemy(x,y,aim+offset,inner?gameStat('miniBossInnerSpeed',125):gameStat('miniBossOuterSpeed',145),source);}}
// Small animated engine lighting reinforces the original pixel sprites without changing hitboxes.
function drawShipEngineLight(ctx,x,y,w,h,enemy=false){const pulse=.85+.15*Math.sin((state?.t||0)*13),hue=enemy?'#ff7d46':(typeof skinColors==='function'?skinColors().engine:null)||'#70dfff';ctx.save();if(enemy){ctx.globalAlpha=.36;ctx.fillStyle=hue;ctx.beginPath();ctx.ellipse(x,y+h*.34,w*.045,h*.14*pulse,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.65;ctx.fillStyle='#ffd486';ctx.fillRect(Math.round(x-1),Math.round(y+h*.30),2,Math.max(2,Math.round(h*.11*pulse)));ctx.restore();return;}for(const side of [-1,1]){const px=x+side*w*.115,py=y+h*.30,len=h*.13*pulse,half=w*.045;ctx.globalAlpha=.32;ctx.fillStyle=hue;ctx.beginPath();ctx.moveTo(px-half,py);ctx.lineTo(px+half,py);ctx.lineTo(px+half*.7,py+len*.55);ctx.lineTo(px,py+len);ctx.lineTo(px-half*.7,py+len*.55);ctx.closePath();ctx.fill();}ctx.restore();}
function drawPlayerEngineFlicker(ctx,w,h){const pulse=.18+.12*(.5+.5*Math.sin((state?.t||0)*13));ctx.save();ctx.globalAlpha=pulse;ctx.fillStyle='#eaffff';for(const side of [-1,1])ctx.fillRect(Math.round(side*w*.115)-1,Math.round(h*.355),2,Math.max(1,Math.round(h*.045)));ctx.restore();}
function drawEnemySprite(ctx,e){
 const kind=e.boss||e.miniBoss?'boss':e.kind,phase=e.boss?e.combatPhase:1,w=e.boss?160:e.miniBoss?96:e.ground?64:Math.max(44,Math.min(54,e.r*4)),h=e.boss?100:e.miniBoss?68:e.ground?64:Math.max(48,Math.min(56,e.r*4));
 if(!e.boss&&!e.miniBoss&&!e.ground)drawShipEngineLight(ctx,e.x,e.y,w,h,true);
 const x=e.x-w/2,y=e.y-h/2,dark=e.miniBoss?null:combatSilhouette(kind,phase,'#081122',e.type||0);ctx.save();ctx.imageSmoothingEnabled=false;
 if(dark){ctx.globalAlpha=.9;for(const [dx,dy] of [[-2,0],[2,0],[0,-2],[0,2]])ctx.drawImage(dark,x+dx,y+dy,w,h);}
 if(e.kind==='deathburst'){const outline=combatSilhouette(kind,phase,'#d887ff',e.type||0);if(outline){ctx.globalAlpha=.95;for(const [dx,dy] of [[-3,0],[3,0],[0,-3],[0,3],[-2,-2],[-2,2],[2,-2],[2,2]])ctx.drawImage(outline,x+dx,y+dy,w,h);}}
 if(e.phase){const highlight=combatSilhouette(kind,phase,'#ffc66d',e.type||0);if(highlight){ctx.globalAlpha=visualSettings.flash?.95:.75;for(const [dx,dy] of [[-3,0],[3,0],[0,-3],[0,3],[-2,-2],[2,-2],[-2,2],[2,2]])ctx.drawImage(highlight,x+dx,y+dy,w,h);}}
 ctx.globalAlpha=1;if(e.miniBoss)drawMiniBoss(ctx,e,w,h);else drawCombatSprite(ctx,kind,e.x,e.y,w,h,phase,e.boss?{bossType:e.type,body:BOSS_TYPES[e.type].color,engine:BOSS_TYPES[e.type].accent}:{});if(e.ground)drawTurretBarrel(ctx,e);if(e.bombImmune){ctx.fillStyle='#62d8e8';ctx.fillRect(e.x-9,e.y-28,18,4);ctx.fillStyle='#e8ffff';ctx.fillRect(e.x-3,e.y-30,6,8);}if(e.miniBoss){if(e.entryProtection>0){ctx.fillStyle='#d5f7ff';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText('접근 중',e.x,e.y-47);}ctx.fillStyle='#242b38';ctx.fillRect(e.x-36,e.y-41,72,5);ctx.fillStyle='#e69f55';ctx.fillRect(e.x-35,e.y-40,70*Math.max(0,e.hp/e.maxHp),3);}
 if(e.boss&&e.hitFlash>0){const hit=combatSilhouette(kind,phase,'#ff2439',e.type||0);if(hit){ctx.globalAlpha=visualSettings.flash?.58:.28;ctx.drawImage(hit,x,y,w,h);}}
 ctx.restore();
}

let heldKeys=new Set();
let state, last=0, frame=0, pointer=null, mode='normal';
const read = (key, fallback) => { try { const value=localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); } catch { return fallback; } };
const save = (key,value) => { try { localStorage.setItem(key,JSON.stringify(value)); return true; } catch { return false; } };
let progress=read('starfall-progress',{coins:0,power:0,best:0});
if(!progress||typeof progress!=='object')progress={coins:0,power:0,best:0};
progress={coins:0,power:0,best:0,ownedParts:[],equippedParts:{},...progress};if(!Array.isArray(progress.ownedParts))progress.ownedParts=[];if(!progress.equippedParts||typeof progress.equippedParts!=='object')progress.equippedParts={};
const shopCatalog=Array.isArray(window.SHOP_CATALOG)?window.SHOP_CATALOG:[];
const passConfig=window.SEASON_PASS||{id:'season-01',missions:[],rewards:[]};
function passState(value=progress){const p=value.seasonPass;if(!p||p.id!==passConfig.id)return {id:passConfig.id,metrics:{sorties:0,kills:0,seconds:0,stages:0},claimed:[],premiumClaimed:[]};return {...p,metrics:p.metrics&&typeof p.metrics==='object'?p.metrics:{},claimed:Array.isArray(p.claimed)?p.claimed:[],premiumClaimed:Array.isArray(p.premiumClaimed)?p.premiumClaimed:[]};}
function passAdDay(now=Date.now()){return new Date(now+9*60*60*1000).toISOString().slice(0,10);}
function nextPassAdReward(pass){return passConfig.rewards.findIndex((_,index)=>!pass.premiumClaimed.includes(index));}
function passXp(pass){return passConfig.missions.reduce((sum,m)=>sum+((pass.metrics[m.metric]||0)>=m.goal?m.xp:0),0);}
function applyMissionResult(value,run){const p=passState(value),metrics={...p.metrics,sorties:(p.metrics.sorties||0)+1,kills:(p.metrics.kills||0)+run.kills,seconds:(p.metrics.seconds||0)+Math.floor(run.totalTime),stages:(p.metrics.stages||0)+run.completedStages};return {...value,seasonPass:{...p,metrics}};}
function passPartBonus(type){const parts=passConfig.rewards.map(r=>r.part).filter(Boolean);return parts.reduce((n,p)=>n+(progress.ownedParts.includes(p.id)&&progress.equippedPassParts?.includes(p.id)?(p[type]||0):0),0);}
function shopPartBonus(type){const slot=type==='main'?'main_core':'aux_core';const id=progress.equippedParts[slot];const item=shopCatalog.find(entry=>entry.id===id&&entry.slot===slot&&progress.ownedParts.includes(id));return item?Number(item[type==='main'?'main_attack':'aux_attack'])||0:0;}
function skinColors(){const colors={};for(const slot of ['body','engine']){const id=progress.equippedParts[slot];const item=shopCatalog.find(x=>x.id===id&&x.slot===slot&&progress.ownedParts.includes(id));if(item)colors[slot]=item.color;}return colors;}
const lobbyArt=new Image();
function drawLobbyShip(){
 if(!lobbyCtx||typeof lobbyCtx.fillRect!=='function')return;
 lobbyCtx.clearRect(0,0,lobbyCanvas.width,lobbyCanvas.height);lobbyCtx.imageSmoothingEnabled=false;
 if(!lobbyArt.complete||!lobbyArt.naturalWidth){PixelArt.sprite(lobbyCtx,'player',160,104,92,110,1,skinColors());return;}
 const scale=Math.min(290/lobbyArt.naturalWidth,200/lobbyArt.naturalHeight),w=lobbyArt.naturalWidth*scale,h=lobbyArt.naturalHeight*scale;
 const skin=skinColors(),shipId=selectedLoadout?.shipId||'ark',chosen=selectedShipSprites[shipId],ready=chosen?.complete&&chosen.naturalWidth,art=ready?playerArtWithSkin(skin,false,shipId):combatArt.player.complete&&combatArt.player.naturalWidth?playerArtWithSkin(skin):lobbyArt;if(ready)drawImageContained(lobbyCtx,art,lobbyCanvas.width/2,lobbyCanvas.height/2,290,200,SHIP_SPRITE_BOUNDS[shipId]);else lobbyCtx.drawImage(art,(lobbyCanvas.width-w)/2,(lobbyCanvas.height-h)/2,w,h);updateEngineEffects(document.querySelector('.ship-stage'),skin);const fx=document.querySelector('.ship-stage .engine-effects');if(fx)fx.style.visibility=ready?'hidden':'';const shipLabel=document.querySelector('.ship-label span');if(shipLabel)shipLabel.textContent=({ark:'ORBITAL ARK',manta:'NEBULA MANTA',forge:'STELLAR FORGE'}[shipId]||'FIGHTER 01');
}
lobbyArt.onload=drawLobbyShip;combatArt.player.onload=drawLobbyShip;for(const image of Object.values(selectedShipSprites))image.onload=drawLobbyShip;for(const mask of Object.values(skinMasks))mask.onload=drawLobbyShip;lobbyArt.src='assets/player-arcade-v1.png';drawLobbyShip();
function updateHome(){ document.querySelector('.lobby-coins b').textContent=Number(progress.coins||0).toLocaleString();document.querySelector('.record strong').textContent=progress.best ? progress.best.toLocaleString() : '—'; document.querySelector('.record small').textContent=progress.best ? '개인 최고 점수' : '아직 기록이 없어요'; document.querySelector('.upgrade-summary').textContent='주무기 · '+progress.power+'단계'; }
updateHome();
async function refreshAccount(){
 const status=document.querySelector('.account-state'),nickname=document.querySelector('.account-nickname'),id=document.querySelector('.account-id'),message=document.querySelector('.account-message'),refresh=document.querySelector('.account-refresh');
 refresh.disabled=true;status.textContent='확인 중';
 try{
  const bridge=await getTossBridge();
  if(!bridge||typeof bridge.getIdentity!=='function'){status.textContent='확인 불가';nickname.textContent='—';id.textContent='—';message.textContent='토스 앱에서 계정 정보를 확인할 수 있어요.';return;}
  const info=await bridge.getIdentity();
  if(!info||typeof info.gameId!=='string'||!info.gameId){status.textContent='확인 실패';nickname.textContent='—';id.textContent='—';message.textContent='계정 정보를 가져오지 못했어요. 다시 시도해 주세요.';return;}
  status.textContent='게임 ID 확인';id.textContent=info.gameId;nickname.textContent=info.nickname||'프로필 없음';
  message.textContent=info.nickname?'게임센터 닉네임과 게임 ID예요. 저장 데이터는 현재 기기에만 보관돼요.':info.profileStatus==='PROFILE_NOT_FOUND'?'게임센터 프로필이 없어요. 게임센터에서 프로필을 만들어 주세요.':'닉네임을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
 }catch{status.textContent='확인 실패';nickname.textContent='—';id.textContent='—';message.textContent='계정 정보를 가져오지 못했어요. 다시 시도해 주세요.';}
 finally{refresh.disabled=false;}
}
document.querySelector('.account-refresh').addEventListener('click',refreshAccount);
window.addEventListener('toss-game-ready',refreshAccount);
function resize(){const rect=canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,2),scale=Math.max(1,Math.min(2,Math.min(rect.width/W,rect.height/H)*dpr));canvas.width=Math.round(W*scale);canvas.height=Math.round(H*scale);}
window.addEventListener('resize',resize);
function showBombCutin(){window.GameAudio?.effect('bomb');for(const selector of ['.bomb-cutin','.bomb-explosions']){const effect=overlay.querySelector(selector);effect.classList.remove('is-playing');void effect.offsetWidth;effect.classList.add('is-playing');}}
function start(selected='normal') { if(state?.revivePending||state?.deathSequence)return;window.GameAudio?.setScene('battle');window.GameAudio?.setPaused(false); overlay.querySelector('.stage-loot-countdown').hidden=true;overlay.querySelector('.stage-clear-banner').hidden=true;overlay.querySelector('.stage-transition-fade').hidden=true; overlay.querySelector('.bomb-cutin').classList.remove('is-playing');overlay.querySelector('.bomb-explosions').classList.remove('is-playing'); tutorial=null;clearTutorialHighlight();storyDialog.hidden=true;storyDone=null;clearSystemNotice();mode=selected; state={shipId:selectedLoadout?.shipId||null,pilotId:selectedLoadout?.pilotId||null,running:true,paused:false,finished:false,reviveUsed:false,revivePending:false,deathSequence:null,playerDestroyed:false,t:0,totalTime:0,round:1,stage:1,gachaUses:0,completedStages:0,bossCleared:false,hp:100,shield:0,shieldBreak:null,level:1,xp:0,need:5,coins:0,kills:0,score:0,x:200,y:560,tilt:0,fire:0,spawn:0,inv:0,bullets:[],enemyShots:[],particles:[],enemies:[],wrecks:[],buildingTimer:12,miniBossSpawned:0,drops:[],power:gameStat('playerMain',1)+(mode==='normal'?progress.power*.15+passPartBonus('main')+shopPartBonus('main'):0)+(selectedLoadout?.shipId==='forge'?gameStat('shipForgeMainBonus',.25):0),auxPower:gameStat('playerAux',1)+(mode==='normal'?passPartBonus('aux')+shopPartBonus('aux'):0),rate:0,spread:0,magnet:0,loadout:{main:[],aux:[],utility:[]},weaponRarities:{},weaponTierLevels:{},weaponLevels:{afterimage:0,near_fuse:0,regroup:0,rocket:0,swarm:0,rate:0,spread:0,power:0,cross:0,cannon:0,auxpower:0,magnet:0,repair:0,orbit:0,missile:0,pulse:0,rail:0,lightning:0,drone:0,blade:0,nova:0,boomerang:0},baseDroneTimer:0,droneMods:{damage:0,rate:0,speed:0,count:0,overflow:0,pierce:0},rocketTimer:0,swarmTimer:0,novaTimer:0,boomerangTimer:0,railTimer:0,lightningTimer:0,mineTimer:0,mines:[],cannonTimer:0,droneTimer:0,bladeTimer:0,activeSkills:[],arcs:[],grenades:[],missileTimer:0,pulseTimer:0,orbitAngle:0,pulses:[],flames:[],mainBoostLevel:0,auxBoostLevel:0,bombs:3,bombCooldown:0,bombFlash:0,skillFlash:0,skillEffects:[],debris:[],fastTimer:18,joyX:0,joyY:0,boss:false}; overlay.hidden=false; panel.hidden=true; for(const weapon of extraWeapons)state.weaponLevels[weapon.id]=0;state.extraWeaponTimers={};renderLoadout(); resize(); last=0; cancelAnimationFrame(frame); frame=requestAnimationFrame(loop); }
function stop(){ window.GameAudio?.setScene('lobby');window.GameAudio?.setPaused(false);overlay.querySelector('.stage-loot-countdown').hidden=true;overlay.querySelector('.stage-clear-banner').hidden=true;overlay.querySelector('.stage-transition-fade').hidden=true;overlay.querySelector('.bomb-cutin').classList.remove('is-playing');overlay.querySelector('.bomb-explosions').classList.remove('is-playing');tutorial=null;clearTutorialHighlight();storyDialog.hidden=true;storyDone=null;cancelAnimationFrame(frame); state.running=false; overlay.hidden=true; panel.hidden=true; updateHome(); }
function button(text,fn,cls=''){const b=document.createElement('button');b.className=cls;b.textContent=text;b.addEventListener('click',fn);return b;}
function showPanel(title,detail,choices){window.GameAudio?.setPaused(true);resetStick();state.paused=true;panel.hidden=false;panel.replaceChildren();const box=document.createElement('div');box.className='game-dialog';const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');p.textContent=detail;box.append(h,p);choices.forEach(c=>box.append(button(c[0],c[1],c[2]||'')));panel.append(box);}
function resetStick(){heldKeys.clear();pointer=null;if(state){state.joyX=0;state.joyY=0;}overlay.querySelector(".stick").style.transform="translate(-50%,-50%)";}
function resume(){if(!state||state.finished||state.revivePending||state.deathSequence||state.hp<=0)return;resetStick();panel.hidden=true;state.paused=false;last=0;window.GameAudio?.setPaused(false);}
function pause(){resetStick();if(!state || state.finished || state.paused)return;showPanel('잠시 쉬어가기','전투가 일시정지됐어요.',[['계속하기',resume,'main-choice'],['출격 종료',()=>showPanel('출격을 종료할까요?','현재 전투 기록은 저장되지 않아요.',[['계속하기',resume,'main-choice'],['종료하기',stop]])]]);}
overlay.querySelector('.pause').addEventListener('click',pause);
function xpRequired(level){const n=Math.max(0,level-1);return Math.ceil(5+3*n+.35*n*n);}
const extraWeapons=[{"id":"m_burst","name":"펄스 연발","detail":"전방으로 빠른 펄스탄 발사","interval":1,"count":1,"spread":0,"pierce":false,"group":"main","homing":false},{"id":"m_twin","name":"쌍열 포","detail":"좌우에서 평행 탄환 발사","interval":1.3,"count":2,"spread":0,"pierce":false,"group":"main","homing":false},{"id":"m_fan","name":"산탄 포격","detail":"좁은 부채꼴 탄환 발사","interval":1.8,"count":3,"spread":35,"pierce":false,"group":"main","homing":false},{"id":"m_pierce","name":"철갑 침투탄","detail":"적을 관통하는 중탄 발사","interval":2.4,"count":1,"spread":0,"pierce":true,"group":"main","homing":false},{"id":"m_side","name":"측면 교차포","detail":"양쪽에서 중앙을 향해 발사","interval":2,"count":2,"spread":-24,"pierce":false,"group":"main","homing":false},{"id":"m_rapid","name":"속사포","detail":"약한 탄환을 빠르게 발사","interval":0.55,"count":1,"spread":0,"pierce":false,"group":"main","homing":false},{"id":"m_heavy","name":"공성포","detail":"느리지만 강한 포탄 발사","interval":3,"count":1,"spread":0,"pierce":false,"group":"main","homing":false},{"id":"m_wave","name":"파상 사격","detail":"세 갈래로 펄스탄 발사","interval":2.3,"count":3,"spread":18,"pierce":false,"group":"main","homing":false},{"id":"m_lance","name":"플라즈마 창","detail":"좁은 범위를 관통하는 포탄","interval":2.8,"count":2,"spread":5,"pierce":true,"group":"main","homing":false},{"id":"m_sweep","name":"회전 포문","detail":"방향이 바뀌는 전방 탄환","interval":1.15,"count":1,"spread":45,"pierce":false,"group":"main","homing":false},{"id":"a_seeker","name":"요격 유도탄","detail":"가까운 적을 추적하는 유도탄","interval":2.4,"count":1,"spread":0,"pierce":false,"group":"aux","homing":true},{"id":"a_wing","name":"날개 미사일","detail":"좌우에서 두 발 발사","interval":3,"count":2,"spread":10,"pierce":false,"group":"aux","homing":true},{"id":"a_scatter","name":"파편 로켓","detail":"세 방향으로 로켓 발사","interval":3.1,"count":3,"spread":30,"pierce":false,"group":"aux","homing":false},{"id":"a_pierce","name":"광자 투창","detail":"적을 관통하는 에너지 투창","interval":3.2,"count":1,"spread":0,"pierce":true,"group":"aux","homing":false},{"id":"a_hunter","name":"사냥 드론탄","detail":"다수 적에게 유도탄 분산","interval":3.5,"count":3,"spread":0,"pierce":false,"group":"aux","homing":true},{"id":"a_rapid","name":"소형 요격탄","detail":"작은 유도탄을 빠르게 발사","interval":1.5,"count":1,"spread":0,"pierce":false,"group":"aux","homing":true},{"id":"a_cannon","name":"보조 중포","detail":"강력한 보조 포탄 발사","interval":3.6,"count":1,"spread":0,"pierce":false,"group":"aux","homing":false},{"id":"a_pair","name":"쌍발 유도탄","detail":"서로 다른 적을 향해 발사","interval":3.1,"count":2,"spread":0,"pierce":false,"group":"aux","homing":true},{"id":"a_spread","name":"성운 포격","detail":"다섯 방향으로 탄환 발사","interval":4,"count":5,"spread":22,"pierce":false,"group":"aux","homing":false},{"id":"a_lance","name":"쌍광 투창","detail":"나란히 적을 관통하는 광탄","interval":4,"count":2,"spread":0,"pierce":true,"group":"aux","homing":false},{"id":"a_barrage","name":"스카이 버스트","detail":"소형 유도탄 연속 발사 · 주변 적에게 폭발 피해","interval":3.8,"count":6,"spread":0,"pierce":false,"group":"aux","homing":true}];
function levelUp(){window.GameAudio?.effect('level');
 state.level++;state.xp-=state.need;state.need=xpRequired(state.level);state.power+=gameStat('levelMainGrowth',.12);state.auxPower+=gameStat('levelAuxGrowth',.04);
 const levels=state.weaponLevels;
 const options=[
  {id:'rocket',name:'전방 로켓',detail:'전방 로켓을 발사',max:5,apply:()=>{}},
  {id:'swarm',name:'군집 미사일',detail:'여러 적에게 분산 발사',max:5,apply:()=>{}},
  {id:'rate',name:'연사 모듈',detail:'기본 공격 속도 증가',max:5,apply:()=>state.rate++},
  {id:'spread',name:'분열탄',detail:'강화당 탄환 1발 추가 · 바깥 탄환 피해 감소',max:2,apply:()=>state.spread++},
  {id:'power',name:'주무기 화력',detail:'주무기 피해 증가',max:5,apply:()=>state.power+=gameStat('augmentMainPower',.35)},
  {id:'cross',name:'근접 기뢰',detail:'전방에 기뢰 투척 · 레벨당 설치 개수 증가',max:4,apply:()=>{}},
  {id:'cannon',name:'중장 포',detail:'강력한 전방 포탄 발사',max:4,apply:()=>{}},
  {id:'auxpower',name:'보조 화력',detail:'보조 무기 피해 증가',max:5,apply:()=>state.auxPower+=gameStat('augmentAuxPower',.20)},
  {id:'magnet',name:'에너지 자석',detail:'수집 범위 증가',max:3,apply:()=>state.magnet+=gameStat('magnetRange',25)},
  {id:'orbit',name:'회전 위성',detail:'주변을 도는 위성으로 공격',max:4,apply:()=>{}},
  {id:'missile',name:'추적 미사일',detail:'가까운 적에게 미사일 발사',max:4,apply:()=>{}},
  {id:'pulse',name:'폭격 포드',detail:'폭탄 투척 · 중심에서 멀수록 피해 감소',max:4,apply:()=>{}},
  {id:'rail',name:'화염 방사기',detail:'전방에 화염을 분사해 범위 피해',max:4,apply:()=>{}},
  {id:'lightning',name:'연쇄 번개',detail:'연쇄될 때마다 피해 50% 감소',max:4,apply:()=>{}},
  {id:'drone',name:'지원 드론',detail:'조준 지원탄 발사',max:4,apply:()=>{}},
  {id:'blade',name:'회전 톱날',detail:'기체 주변을 회전하며 적에게 반복 피해',max:4,apply:()=>{}},
  {id:'nova',name:'중력 파동',detail:'주변에 주기적으로 파동을 발산해 범위 피해',max:5,apply:()=>{}},
  {id:'boomerang',name:'회수 칼날',detail:'레벨당 칼날 1개 · 돌아올 때 속도 2배',max:5,apply:()=>{}}
 ];
 for(const weapon of extraWeapons)options.push({id:weapon.id,name:weapon.name,detail:weapon.detail,max:5,apply:()=>{}});
 options.push({id:'afterimage',name:'잔상 폭격',detail:'이동 경로에 잔상을 남겨 지연 사격',max:5,apply:()=>{}},{id:'near_fuse',name:'근접 신관',detail:'탄환을 아슬아슬하게 회피해 반격',max:5,apply:()=>{}},{id:'regroup',name:'편대 재집결',detail:'양쪽 드론이 돌진하며 집중 사격',max:5,apply:()=>{}});
 options.push({id:'repair',name:'일루전',detail:'드론 복제 공격 · 이후 강화 선택지 3개가 동일',max:5,apply:()=>{}});
 for(const option of options){const managed=window.GAME_CONFIG?.augments?.[option.id];if(managed)Object.assign(option,{name:managed.name,detail:managed.detail,max:managed.max});}
 const definitions={main:['rocket','rate','spread','power','cross','cannon'],aux:['swarm','orbit','missile','pulse','rail','lightning','drone','blade','nova','boomerang','afterimage'],utility:['auxpower','magnet','repair','near_fuse','regroup']};
 const limits={main:5,aux:1,utility:3};
 for(const o of options){const group=window.GAME_CONFIG?.augments?.[o.id]?.group;o.group=Object.hasOwn(limits,group)?group:(extraWeapons.find(w=>w.id===o.id)?.group||Object.keys(definitions).find(key=>definitions[key].includes(o.id)));}
 const eligible=options.filter(o=>o.group&&(state.loadout[o.group].includes(o.id)||state.loadout[o.group].length<limits[o.group])).map(o=>prepareAugmentOption(o,state)).filter(Boolean);
 showUpgradeCards(createUpgradeChoices(eligible),levels,eligible);

}
// Each card rolls a rarity, then an eligible augment of that rarity without replacement.
const rarityNames={common:'일반',uncommon:'고급',rare:'희귀',legendary:'전설',mythic:'신화'};
const defaultRarityWeights={common:45,uncommon:30,rare:16,legendary:7,mythic:2};
function rarityOf(option){return Object.hasOwn(rarityNames,option.rarity)?option.rarity:'common';}
function rarityWeights(id){return window.GAME_CONFIG?.augmentRarityWeights?.[id]||window.GAME_CONFIG?.rarityWeights||defaultRarityWeights;}
// A skill can appear at every rarity; a tier is rolled independently for each card.
const rarityAttackBonus={common:0,uncommon:.04,rare:.08,legendary:.12,mythic:.16};
function prepareAugmentOption(option,current){
 const owned=(current.weaponLevels[option.id]||0)>0;if(!owned)return {...option,lockedRarity:null,rankUp:false};
 const grade=current.weaponRarities[option.id]||'common',level=current.weaponTierLevels[option.id]??current.weaponLevels[option.id];
 if(level<option.max)return {...option,lockedRarity:grade,rankUp:false};
 const keys=Object.keys(rarityNames),next=keys[keys.indexOf(grade)+1];return next?{...option,lockedRarity:next,rankUp:true,previousRarity:grade}:null;
}
function weightedUpgrade(pool,random=Math.random){
 const candidates=[];let total=0;
 for(const item of pool){const weights=rarityWeights(item.id);for(const rarity of Object.keys(rarityNames)){if(item.lockedRarity&&item.lockedRarity!==rarity)continue;const weight=Number(weights[rarity])||0;if(weight<=0)continue;total+=weight;candidates.push({item,rarity,weight});}}
 if(!candidates.length)return null;
 let draw=random()*total;for(const candidate of candidates){draw-=candidate.weight;if(draw<0)return {...candidate.item,rarity:candidate.rarity};}
 const last=candidates[candidates.length-1];return {...last.item,rarity:last.rarity};
}
function createUpgradeChoices(pool){
 const eligible=pool.slice(),choices=[];while(choices.length<3){const item=weightedUpgrade(eligible);if(!item)break;choices.push(item);const index=eligible.findIndex(candidate=>candidate.id===item.id);if(index>=0)eligible.splice(index,1);else break;}
 let filler=0;while(choices.length<3){const main=filler++%2===0;choices.push({id:main?'mainBoost':'auxBoost',name:main?'주무기 추가 강화':'보조무기 추가 강화',detail:main?'주무기 화력 +0.15':'보조무기 화력 +0.10',group:main?'main':'aux',rarity:'common',repeatable:true,apply:()=>{if(main){state.mainBoostLevel++;state.power+=.15;}else{state.auxBoostLevel++;state.auxPower+=.10;}}});}return state?.weaponLevels?.repair?choices.map(()=>({...choices[0]})):choices;
}

function slotResult(choices,random=Math.random){return Array.from({length:3},()=>choices[Math.floor(random()*choices.length)]);}
// Reel symbols are independent of the offered cards: illusion may make the cards identical.
function slotReelPool(choices,eligible){
 const catalog=window.GAME_CONFIG?.augments;
 if(catalog&&Object.keys(catalog).length)return Object.keys(catalog).map(id=>({id}));
 if(typeof loadoutNames!=='undefined'&&Object.keys(loadoutNames).length)return Object.keys(loadoutNames).map(id=>({id}));
 return [...choices,...eligible].filter((item,index,all)=>all.findIndex(other=>other.id===item.id)===index);
}
// Promote each offer exactly one grade without violating owned-augment rarity locks.
function promotedGachaChoices(choices,eligible){
 const grades=Object.keys(rarityNames),used=new Set(),out=[];
 if(state?.weaponLevels?.repair){const original=choices[0],next=grades[grades.indexOf(rarityOf(original))+1];if(!next)return null;const candidate=eligible.find(item=>item.id===original.id)||original;if(candidate.lockedRarity&&candidate.lockedRarity!==next)return null;if(!candidate.repeatable&&state.weaponLevels[candidate.id]>0&&!candidate.lockedRarity)return null;if(!candidate.repeatable&&(Number(rarityWeights(candidate.id)[next])||0)<=0)return null;return choices.map(()=>({...candidate,rarity:next,droneBonus:original.droneBonus,droneBonuses:[...(original.droneBonuses||[])]}));}
 function assign(index){if(index===choices.length)return true;const original=choices[index],next=grades[grades.indexOf(rarityOf(original))+1];if(!next)return false;
 const pool=[original,...eligible].filter((candidate,i,all)=>all.findIndex(x=>x.id===candidate.id)===i);
 for(const candidate of pool){if(!candidate.repeatable&&used.has(candidate.id))continue;if(candidate.lockedRarity&&candidate.lockedRarity!==next)continue;if(!candidate.repeatable&&state.weaponLevels[candidate.id]>0&&!candidate.lockedRarity)continue;if(!candidate.repeatable&&(Number(rarityWeights(candidate.id)[next])||0)<=0)continue;out.push({...candidate,rarity:next});if(!candidate.repeatable)used.add(candidate.id);if(assign(index+1))return true;out.pop();if(!candidate.repeatable)used.delete(candidate.id);}
 return false;}
 if(!assign(0))return null;return out.map((item,index)=>({...item,droneBonus:choices[index].droneBonus,droneBonuses:[...(choices[index].droneBonuses||[])]}));
}
// Icon paths use a shared 16×16 pixel grid and remain distinct at small sizes.
const upgradeIcons={rocket:'M7 1h2v2h2v8h2v3H3v-3h2V3h2z',swarm:'M3 2h2v2h1v6H2V4h1z M11 2h2v2h1v6h-4V4h1z M7 5h2v2h1v6H6V7h1z',
 nova:'M7 0h2v4h3v2h4v4h-4v2H9v4H7v-4H4v-2H0V6h4V4h3z M6 6v4h4V6z',
 boomerang:'M1 1h2v2H1z M4 2h2v2H4z M7 4h2v2H7z M9 6h3v2h2v4h-2v2H8v-2H6V9h2V7h1z',
 mainBoost:'M6 1h4v4h4v4h-4v5H6V9H2V5h4z',
 auxBoost:'M6 1h4v4h4v4h-4v5H6V9H2V5h4z',
 cross:'M7 1h2v3h3v2h2v4h-2v2H9v3H7v-3H4v-2H2V6h2V4h3z M6 6v4h4V6z',
 cannon:'M5 1h6v8H5z M3 9h10v5H3z',
 drone:'M2 5h12v6H2z M5 2h6v3H5z M6 11h4v3H6z',
 blade:'M7 0h2v3h3V2h2v3h2v2h-2v2h2v2h-2v3h-3v2H9v-2H7v2H5v-2H2v-3H0V9h2V7H0V5h2V2h3v1h2z M6 6v4h4V6z',
 rate:'M2 3h3v10H2z M7 5h3v8H7z M12 7h3v6h-3z',
 spread:'M7 1h2v9H7z M2 4h2v5H2z M12 4h2v5h-2z M5 11h6v3H5z',
 power:'M6 1h4v4h4v4h-4v5H6V9H2V5h4z',
 auxpower:'M6 1h4v4h4v4h-4v5H6V9H2V5h4z',
 magnet:'M2 2h4v7H2z M10 2h4v7h-4z M2 9h12v3H2z M4 12h8v2H4z',
 orbit:'M6 1h4v2H6z M7 3h2v2H7z M5 5h6v6H5z M1 5h3v6H1z M12 5h3v6h-3z M6 12h4v2H6z M7 6h2v3H7z',
 missile:'M7 1h2v2h2v3h2v6H3V6h2V3h2z M5 13h2v2H5z M9 13h2v2H9z',
 pulse:'M6 1h4v2h2v2h2v8h-2v2H4v-2H2V5h2V3h2z M7 5v2H5v2h2v2h2V9h2V7H9V5z',
 rail:'M7 1h2v3h2V3h2v4h2v5h-2v2H4v-2H2V8h2V6h2V3h1z M7 8v4h3V8H9V6H8v2z',
 lightning:'M8 1H5L2 9h4l-1 6 9-9h-4l2-5z',
 repair:'M7 1h2v5h3v2h2v5H2V8h2V6h3z M4 10h8v2H4z',
 afterimage:'M7 0h2v3h3v3h-2v3h3v3h-3v3H6v-3H3V9h3V6H4V3h3z',
 near_fuse:'M7 0h2v3h2V2h2v3h2v2h-3v2h3v2h-3v3H4v-3H1V9h3V7H1V5h3V2h2v1h1z',
 regroup:'M1 3h4v3H1z M11 3h4v3h-4z M6 1h4v6H6z M3 8h4v3H3z M9 8h4v3H9z M7 11h2v4H7z',
 shield:'M2 2h12v6h-2v3h-2v2H6v-2H4V8H2z'
};
// Shared pixel-art badges unify cards, recipes, and the loadout.
// Atlas cells are 181px squares; a shared crop keeps the same artwork in every UI.
const augmentIconCells=[
 ['rate','spread','power','cross','cannon','auxpower','magnet','orbit'],
 ['missile','pulse','rail','lightning','drone','blade','repair','nova'],
 ['boomerang','rocket','swarm','m_burst','m_twin','m_fan','m_pierce','m_side'],
 ['m_rapid','m_heavy','m_wave','m_lance','m_sweep','a_seeker','a_wing','a_scatter'],
 ['a_pierce','a_hunter','a_rapid','a_cannon','a_pair','a_spread','a_lance','afterimage'],
 ['near_fuse','regroup','a_barrage','mainBoost','auxBoost','unused_barrage','unused_bomb','shield']
];
const augmentIconPositions=Object.fromEntries(augmentIconCells.flatMap((row,y)=>row.map((id,x)=>[id,{x,y}])));
function upgradeIconSvg(id){
 const cell=augmentIconPositions[id]||augmentIconPositions.power;
 return '<svg aria-hidden="true" viewBox="0 0 181 181" shape-rendering="crispEdges"><image href="assets/augment-icons-pixel-v2.png" x="'+(-cell.x*181)+'" y="'+(-cell.y*181)+'" width="1448" height="1086" style="image-rendering:pixelated"/></svg>';
}

const loadoutNames={rocket:'전방 로켓',swarm:'군집 미사일',nova:'중력 파동',boomerang:'유성 폭격',cross:'근접 기뢰',cannon:'중장 포',drone:'지원 드론',blade:'회전 톱날',rate:'연사 모듈',spread:'분열탄',power:'주무기 화력',auxpower:'보조 화력',magnet:'에너지 자석',repair:'일루전',orbit:'회전 위성',missile:'추적 미사일',pulse:'폭격 포드',rail:'화염 방사기',lightning:'연쇄 번개'};
Object.assign(loadoutNames,{afterimage:'잔상 폭격',near_fuse:'근접 신관',regroup:'편대 재집결'});
const maxUpgradeLevels={afterimage:5,near_fuse:5,regroup:5,rocket:5,swarm:5,nova:5,boomerang:5,rate:5,spread:2,power:5,cross:4,cannon:4,auxpower:5,magnet:3,repair:5,orbit:4,missile:4,pulse:4,rail:4,lightning:4,drone:4,blade:4};
for(const [id,entry] of Object.entries(window.GAME_CONFIG?.augments||{})){if(id in maxUpgradeLevels){maxUpgradeLevels[id]=entry.max;loadoutNames[id]=entry.name;}}
const extraWeaponIcons={"a_barrage":"M1 2h2v3H1z M7 1h2v3H7z M13 2h2v3h-2z M3 6h2v3H3z M7 5h2v3H7z M11 6h2v3h-2z M5 11h6v3H5z","m_burst":"M2 2h3v3H2z M6 5h3v3H6z M10 8h3v3h-3z M6 12h4v3H6z","m_twin":"M2 2h4v10H2z M10 2h4v10h-4z M5 12h6v3H5z","m_fan":"M7 1h2v9H7z M2 4h2v6H2z M12 4h2v6h-2z M5 11h6v3H5z","m_pierce":"M8 0l3 6-3 9-3-9z M2 5h2v6H2z M12 5h2v6h-2z","m_side":"M0 4h4v4H0z M12 4h4v4h-4z M4 8h3v3H4z M9 8h3v3H9z M7 11h2v4H7z","m_rapid":"M3 1h2v3H3z M6 4h2v3H6z M9 7h2v3H9z M12 10h2v3h-2z","m_heavy":"M5 1h6v3h2v9H3V4h2z M6 5h4v6H6z","m_wave":"M1 5h3v4H1z M6 2h4v4H6z M12 5h3v4h-3z M5 10h6v4H5z","m_lance":"M3 1h3v12H3z M10 1h3v12h-3z M6 10h4v4H6z","m_sweep":"M7 1h2v6h5v2H9v5H7V9H2V7h5z M2 2h2v2H2z M12 12h2v2h-2z","a_seeker":"M7 1h2v2h2v7H5V3h2z M3 10h10v3H3z","a_wing":"M1 4h4v4H1z M11 4h4v4h-4z M5 6h6v4H5z M7 10h2v4H7z","a_scatter":"M7 0h2v5H7z M3 5h3v3H3z M10 5h3v3h-3z M1 10h3v3H1z M7 9h2v4H7z M12 10h3v3h-3z","a_pierce":"M8 0l4 6-4 9-4-9z M6 5h4v3H6z","a_hunter":"M2 2h4v5H2z M10 2h4v5h-4z M6 9h4v5H6z","a_rapid":"M3 2h3v4H3z M9 5h3v4H9z M3 9h3v4H3z M9 12h3v3H9z","a_cannon":"M4 1h8v4h2v8H2V5h2z M6 5h4v6H6z","a_pair":"M2 1h4v10H2z M10 1h4v10h-4z M5 12h6v3H5z","a_spread":"M7 0h2v4H7z M1 4h3v3H1z M12 4h3v3h-3z M3 10h3v3H3z M10 10h3v3h-3z M7 6h2v3H7z","a_lance":"M2 1h4v12H2z M10 1h4v12h-4z M6 6h4v3H6z"};
for(const weapon of extraWeapons){loadoutNames[weapon.id]=window.GAME_CONFIG?.augments?.[weapon.id]?.name||weapon.name;maxUpgradeLevels[weapon.id]=window.GAME_CONFIG?.augments?.[weapon.id]?.max||5;upgradeIcons[weapon.id]=extraWeaponIcons[weapon.id]||(weapon.homing?upgradeIcons.missile:weapon.pierce?upgradeIcons.cannon:upgradeIcons.spread);}
// Two-tone, individually drawn silhouettes shared by cards, slots and recipes.
Object.assign(upgradeIcons,{
  "rocket": "M7 0h2v2h2v7h2v3h-3v2H6v-2H3V9h2V2h2z M7 3v5h2V3z M7 13h2v3H7z",
  "swarm": "M2 2h2v2h1v5H1V4h1z M7 0h2v2h1v6H6V2h1z M12 3h2v2h1v5h-4V5h1z M2 10h2v3H2z M7 9h2v4H7z M12 11h2v3h-2z",
  "rate": "M2 3h3v10H2z M6 1h3v12H6z M10 4h3v9h-3z M1 14h14v1H1z",
  "spread": "M7 1h2v5H7z M2 4h2v4H2z M12 4h2v4h-2z M6 8h4v5H6z M4 12h8v3H4z",
  "power": "M7 0h2v3h3v2h2v6h-2v3H4v-3H2V5h2V3h3z M7 5v2H5v2h2v2h2V9h2V7H9V5z",
  "cross": "M7 0h2v3h3v2h2v2h2v2h-2v2h-2v2H9v3H7v-3H4v-2H2V9H0V7h2V5h2V3h3z M6 6v4h4V6z",
  "cannon": "M5 0h6v3h1v6h2v5H2V9h2V3h1z M6 2v6h4V2z M4 11v1h8v-1z",
  "auxpower": "M1 6h3V3h3v3h3v3H7v3H4V9H1z M11 1h2v3h2v2h-2v2h-2V6H9V4h2z M11 10h2v2h2v2h-2v2h-2v-2H9v-2h2z",
  "magnet": "M1 2h5v7H5v2h6V9h-1V2h5v8h-1v3h-2v2H4v-2H2v-3H1z M2 3v2h3V3z M11 3v2h3V3z",
  "orbit": "M6 5h4v6H6z M1 4h3v3H1z M12 9h3v3h-3z M5 1h5v2H5z M3 3h2v2H3z M11 3h2v3h-2z M3 10h2v3H3z M5 13h6v2H5z",
  "missile": "M6 0h4v2h2v7h2v3h-4v2H6v-2H2V9h2V2h2z M7 3v4h2V3z M2 14h3v2H2z M11 14h3v2h-3z",
  "pulse": "M6 0h4v2h2v2h2v8h-2v2h-2v2H6v-2H4v-2H2V4h2V2h2z M7 4v3H4v2h3v3h2V9h3V7H9V4z",
  "rail": "M0 6h4V4h3v2h2V4h2V2h2v2h2v3h1v4h-2v3h-3v-2H9v-2H7v2H4v-2H0z M2 7v2h3V7z",
  "lightning": "M9 0H6L3 7h3l-1 8 8-10H9l2-5z M1 11h2v2H1z M12 11h3v2h-3z",
  "drone": "M6 0h4v3h2v3h3v4h-3v2H4v-2H1V6h3V3h2z M6 5v4h4V5z M5 13h6v2H5z",
  "blade": "M7 0h2v2h3V1h2v3h2v3h-2v2h2v3h-2v3h-3v1H8v-2H6v2H3v-2H1v-3H0V8h2V6H0V4h2V2h3v1h2z M6 6v4h4V6z",
  "repair": "M3 3h4v2H5v3H3z M9 1h4v2h-2v3H9z M1 9h5v2H4v4H2v-4H1z M8 7h4v2h2v5h-2v1H8v-1H6V9h2z",
  "nova": "M7 0h2v3H7z M7 13h2v3H7z M0 7h3v2H0z M13 7h3v2h-3z M3 3h2v2H3z M11 3h2v2h-2z M3 11h2v2H3z M11 11h2v2h-2z M6 5h4v1h1v4h-1v1H6v-1H5V6h1z",
  "boomerang": "M1 1h5v2H4v2H2V3H1z M5 3h4v2H7v2H5z M9 5h3v2h2v5h-2v2H7v-2H5V9h2V7h2z M8 9v3h4V9z",
  "afterimage": "M7 1h2v2h2v4H5V3h2z M2 7h4v2H2z M0 11h4v2H0z M9 9h3v2h2v3h-3v2H8v-2H5v-3h2V9z",
  "near_fuse": "M1 2h3v3H1z M12 2h3v3h-3z M1 11h3v3H1z M12 11h3v3h-3z M7 1h2v4h2v2h3v2h-3v2H9v4H7v-4H5V9H2V7h3V5h2z M7 7v2h2V7z",
  "regroup": "M1 3h4v3H1z M11 3h4v3h-4z M6 7h4v6H6z M2 8h2v2h2v2H4v2H2v-2H0v-2h2z M12 8h2v2h2v2h-2v2h-2v-2h-2v-2h2z",
  "m_burst": "M7 0h2v3H7z M7 5h2v3H7z M6 10h4v4H6z M4 14h8v2H4z",
  "m_twin": "M2 1h4v9H2z M10 1h4v9h-4z M1 11h14v3H1z M4 14h8v2H4z",
  "m_fan": "M7 0h2v4H7z M3 2h2v3H3z M11 2h2v3h-2z M1 5h2v2H1z M13 5h2v2h-2z M6 8h4v4H6z M4 12h8v3H4z",
  "m_pierce": "M7 0h2v2h2v5H9v2h4v2H9v4H7v-4H3V9h4V7H5V2h2z",
  "m_side": "M0 2h4v3H0z M12 2h4v3h-4z M3 5h3v2H3z M10 5h3v2h-3z M6 7h4v2H6z M4 9h3v2H4z M9 9h3v2H9z M7 11h2v4H7z",
  "m_rapid": "M2 0h2v2H2z M5 3h2v2H5z M8 6h2v2H8z M11 9h2v2h-2z M1 6h2v2H1z M4 9h2v2H4z M7 12h2v2H7z M10 14h2v2h-2z",
  "m_heavy": "M5 1h6v2h2v7h-2v3H5v-3H3V3h2z M6 3v2h4V3z M6 14h4v2H6z M0 7h2v2H0z M14 7h2v2h-2z",
  "m_wave": "M0 4h2v3H0z M2 2h2v2H2z M4 4h2v3H4z M6 7h2v3H6z M8 4h2v3H8z M10 2h2v2h-2z M12 4h2v3h-2z M14 7h2v3h-2z M6 12h4v3H6z",
  "m_lance": "M7 0h2v2h1v6h2v2h-2v3H9v3H7v-3H6v-3H4V8h2V2h1z M7 3v5h2V3z",
  "m_sweep": "M7 0h2v2h3v2H9v2h4v2h2v3h-3V9H9v4H7V9H4v2H1V8h2V6h4V4H4V2h3z",
  "a_seeker": "M11 1h4v4h-2V3h-2z M10 5h2v2h-2z M8 7h2v2H8z M5 8h3v2H5z M2 10h4v2H2z M1 12h2v2H1z M6 11h2v3H6z",
  "a_wing": "M6 1h4v4H6z M0 4h4v2h2v2H4v2H1V8H0z M12 4h4v4h-1v2h-3V8h-2V6h2z M7 6h2v7H7z M5 13h6v2H5z",
  "a_scatter": "M6 1h4v6H6z M3 6h3v3H3z M10 6h3v3h-3z M1 9h2v2H1z M7 9h2v4H7z M13 9h2v2h-2z M3 12h2v2H3z M11 12h2v2h-2z",
  "a_pierce": "M7 0h2v2h2v2h1v4h-1v2H9v3H7v-3H5V8H4V4h1V2h2z M7 3v5h2V3z M3 12h10v2H3z",
  "a_hunter": "M1 1h4v4H1z M11 1h4v4h-4z M6 3h4v4H6z M2 7h2v2H2z M12 7h2v2h-2z M7 8h2v2H7z M1 11h4v3H1z M6 12h4v3H6z M11 11h4v3h-4z",
  "a_rapid": "M2 1h3v3H2z M8 1h3v3H8z M5 5h3v3H5z M11 5h3v3h-3z M2 9h3v3H2z M8 9h3v3H8z M5 13h3v2H5z M11 13h3v2h-3z",
  "a_cannon": "M4 1h8v3h2v7h-2v3H4v-3H2V4h2z M6 4v4h4V4z M0 13h3v2H0z M13 13h3v2h-3z M6 14h4v2H6z",
  "a_pair": "M2 2h3v2h1v5H1V4h1z M11 2h3v2h1v5h-5V4h1z M6 0h4v2H6z M7 2h2v5H7z M5 7h2v2H5z M9 7h2v2H9z M6 10h4v4H6z",
  "a_spread": "M7 0h2v3H7z M2 2h2v3H2z M12 2h2v3h-2z M0 6h3v2H0z M13 6h3v2h-3z M4 6h2v2H4z M10 6h2v2h-2z M6 8h4v4H6z M4 12h8v2H4z",
  "a_lance": "M3 0h2v2h1v8H2V2h1z M11 0h2v2h1v8h-4V2h1z M0 11h16v2H0z M3 14h2v2H3z M11 14h2v2h-2z",
  "mainBoost": "M1 8h4V4h2V1h2v3h2v4h4v3H9v4H7v-4H1z",
  "auxBoost": "M1 3h4v3H1z M11 3h4v3h-4z M6 6h4v3H6z M2 10h3v2H2z M11 10h3v2h-3z M7 10h2v5H7z"
});

// Each drawing uses the same two-color linework, with a large object silhouette and its behavior.
const upgradeArt=(()=>{
 const path=d=>'<path d="'+d+'"/>';const circle=(x,y,r)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'"/>';const box=(x,y,w,h)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="1"/>';
 const missile=path('M16 3 C12 6 11 10 11 16 V22 H21 V16 C21 10 20 6 16 3 Z M11 16 L7 21 V25 L11 22 M21 16 L25 21 V25 L21 22 M14 25 L16 29 L18 25')+circle(16,12,2.2);
 const cannon=path('M12 4 H20 V17 H23 V24 H9 V17 H12 Z M14 7 H18 M12 20 H20 M12 27 H20');
 const bolt=path('M18 3 L10 16 H15 L13 28 L23 13 H18 Z');
 const targets=circle(16,16,5)+path('M16 7 V3 M16 29 V25 M7 16 H3 M29 16 H25');
 const drone=path('M13 5 H19 L21 11 L26 14 V20 L21 19 L19 25 H13 L11 19 L6 20 V14 L11 11 Z M12 14 H20 M14 22 H18')+circle(16,16,2);
 const burst=path('M16 3 L18 10 L24 7 L21 13 L29 16 L21 19 L24 25 L18 22 L16 29 L14 22 L8 25 L11 19 L3 16 L11 13 L8 7 L14 10 Z');
 const trail=path('M4 23 C8 20 10 17 13 14 M4 28 C9 25 12 23 15 20 M5 17 L9 13');
 const twin=path('M7 3 H12 V17 H7 Z M20 3 H25 V17 H20 Z M5 19 H27 V25 H5 Z M9 7 H10 M22 7 H23 M11 28 H21');
 const arrows=path('M5 10 L16 21 L27 10 M5 10 H10 M5 10 V15 M27 10 H22 M27 10 V15');
 const bullet=(x,y)=>'<path d="M'+x+' '+(y-3)+' L'+(x+2)+' '+y+' V'+(y+4)+' H'+(x-2)+' V'+y+' Z"/>';
 return {
 rocket:missile+path('M5 6 L3 3 M27 6 L29 3'),
 swarm:bullet(7,7)+bullet(16,5)+bullet(25,7)+path('M7 15 V20 M16 13 V18 M25 15 V20 M7 24 V27 M16 22 V27 M25 24 V27'),
 rate:path('M5 25 H27 M7 21 V16 M13 21 V11 M19 21 V6 M25 21 V3 M4 12 L8 8 L12 10 L18 4'),
 spread:path('M13 25 H19 V28 H13 Z M16 22 V11 M13 17 L7 9 M19 17 L25 9 M5 6 L7 3 L9 6 M14 6 L16 3 L18 6 M23 6 L25 3 L27 6'),
 power:cannon+path('M3 11 H9 M6 8 V14 M23 11 H29 M26 8 V14'),
 cross:circle(16,16,7)+circle(16,16,2)+path('M16 3 V7 M16 25 V29 M3 16 H7 M25 16 H29 M7 7 L10 10 M22 22 L25 25 M25 7 L22 10 M10 22 L7 25'),
 cannon:cannon+path('M2 19 H7 M25 19 H30 M5 23 L3 25 M27 23 L29 25'),
 auxpower:drone+path('M3 7 H8 M5.5 4.5 V9.5 M24 7 H29 M26.5 4.5 V9.5'),
 magnet:path('M5 4 H11 V18 C11 24 21 24 21 18 V4 H27 V18 C27 28 5 28 5 18 Z M5 10 H11 M21 10 H27 M14 6 L16 8 L18 6'),
 orbit:circle(16,16,4)+path('M4 13 C6 6 12 3 18 4 M28 19 C26 26 20 29 14 28 M5 19 C7 25 11 27 14 28 M27 13 C25 7 22 5 18 4')+box(2,12,5,5)+box(25,15,5,5),
 missile:missile+path('M3 14 C3 7 7 4 10 3 M3 14 L2 10 M3 14 L7 12'),
 pulse:path('M12 5 H20 V9 H23 V24 L20 27 H12 L9 24 V9 H12 Z M13 4 H19 M16 12 V22 M11 17 H21')+path('M4 22 L6 24 M27 22 L25 24'),
 rail:path('M3 13 H10 V19 H3 Z M10 14 C13 11 14 7 16 6 C16 10 20 11 20 6 C24 9 29 12 29 17 C29 23 24 26 20 25 C16 25 13 23 10 19 M13 18 C16 16 17 13 18 13 C19 16 22 17 23 15 C25 19 23 22 20 22'),
 lightning:bolt+path('M4 9 L7 12 M5 24 L9 22 M25 7 L28 5 M24 23 L28 25'),
 drone:drone+path('M16 2 V5 M4 24 L2 27 M28 24 L30 27'),
 blade:circle(16,16,9)+circle(16,16,3)+path('M16 4 L18 1 M24 7 L27 5 M28 16 L31 18 M24 25 L26 28 M16 28 L14 31 M7 25 L4 27 M4 16 L1 14 M7 7 L5 4'),
 repair:drone+path('M4 5 L7 2 M3 10 L7 6 M24 24 L28 20 M25 29 L30 24'),
 nova:targets+circle(16,16,10)+path('M7 7 L9 9 M23 23 L25 25 M25 7 L23 9 M9 23 L7 25'),
 boomerang:trail+path('M20 7 L25 8 L28 12 L26 17 L21 20 L17 18 L15 14 L17 10 Z M19 11 L22 9 M21 16 L24 14'),
 afterimage:drone+path('M4 7 L1 7 M5 11 L2 11 M25 23 L29 23 M25 27 L29 27'),
 near_fuse:targets+path('M3 4 L7 8 M4 3 L2 5 M25 24 L29 28 M28 23 L30 25 M25 5 L28 2'),
 regroup:drone+path('M5 6 L2 9 L5 12 M27 6 L30 9 L27 12 M5 6 V3 H11 M27 6 V3 H21'),
 m_burst:bullet(16,4)+bullet(16,14)+path('M10 27 H22 M12 23 H20 M16 20 V22'),
 m_twin:twin,
 m_fan:path('M13 25 H19 M16 23 V15 M14 18 L8 10 M18 18 L24 10 M6 7 L8 4 L10 7 M14 6 L16 3 L18 6 M22 7 L24 4 L26 7'),
 m_pierce:bullet(16,5)+path('M16 14 V28 M8 19 H24 M9 24 H23 M5 22 L8 19 L5 16 M27 22 L24 19 L27 16'),
 m_side:arrows+path('M13 23 H19 V28 H13 Z M3 6 H8 M24 6 H29'),
 m_rapid:bullet(7,4)+bullet(16,9)+bullet(25,14)+path('M4 14 L1 18 M13 19 L10 23 M22 24 L19 28'),
 m_heavy:cannon+burst,
 m_wave:path('M3 9 C6 3 10 3 13 9 S20 15 23 9 S28 3 30 7 M3 18 C6 12 10 12 13 18 S20 24 23 18 S28 12 30 16 M12 27 H20'),
 m_lance:path('M16 2 L20 9 L18 25 L16 30 L14 25 L12 9 Z M16 6 V22 M8 12 L4 16 M24 12 L28 16'),
 m_sweep:circle(16,17,8)+path('M16 17 L23 7 M21 7 L23 4 L26 7 M7 6 C4 9 3 12 3 15 M25 25 C28 22 29 19 29 16 M1 14 L3 17 L6 14 M26 17 L29 14 L31 17'),
 a_seeker:missile+path('M4 8 C2 14 4 20 8 22 M4 8 L2 10 M4 8 L7 8'),
 a_wing:missile+path('M7 17 L2 12 M25 17 L30 12 M2 12 L3 16 M2 12 L6 12 M30 12 L29 16 M30 12 L26 12'),
 a_scatter:bullet(16,5)+path('M16 12 V16 M16 16 L7 22 M16 16 L16 26 M16 16 L25 22 M5 24 L7 21 L9 24 M14 28 L16 25 L18 28 M23 24 L25 21 L27 24'),
 a_pierce:path('M16 2 L21 10 L18 21 L16 26 L14 21 L11 10 Z M16 7 V19 M3 21 H29 M8 26 H24'),
 a_hunter:drone+path('M4 3 H10 M7 1 V6 M22 3 H28 M25 1 V6 M16 28 V30'),
 a_rapid:bullet(9,4)+bullet(23,4)+bullet(9,17)+bullet(23,17)+path('M4 29 H28'),
 a_cannon:cannon+path('M4 7 L7 9 M28 7 L25 9 M4 27 L8 25 M28 27 L24 25 M16 1 V3'),
 a_pair:bullet(8,5)+bullet(24,5)+targets+path('M8 13 L12 16 M24 13 L20 16'),
 a_spread:path('M16 26 V18 M16 18 L5 10 M16 18 L10 5 M16 18 V3 M16 18 L22 5 M16 18 L27 10 M12 27 H20')+circle(5,9,1.5)+circle(10,5,1.5)+circle(16,3,1.5)+circle(22,5,1.5)+circle(27,9,1.5),
 a_lance:path('M8 2 L11 8 L9 24 H7 L5 8 Z M24 2 L27 8 L25 24 H23 L21 8 Z M8 6 V20 M24 6 V20 M3 27 H29'),
 mainBoost:cannon+path('M4 6 H10 M7 3 V9 M22 6 H28 M25 3 V9'),
 auxBoost:drone+path('M2 23 H9 M5.5 19.5 V26.5 M23 23 H30 M26.5 19.5 V26.5')
 };
})();

// Dark background, pale armor, cyan trajectory and amber projectiles: four colors per icon.
const upgradeFireArt=(()=>{
 const armor='#f2e8d4',trajectory='#65cfe0',shot='#ffac55';
 const outline=d=>'<path d="'+d+'" fill="none" stroke="'+armor+'" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>';
 const trails=d=>'<path d="'+d+'" fill="none" stroke="'+trajectory+'" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>';
 const orb=(x,y,r=2)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+shot+'"/>';
 const shell=(x,y)=>'<path d="M'+x+' '+(y-3)+' l2 3 v3 h-4 v-3 Z" fill="'+shot+'"/>';
 const base=outline('M10 29 L11 24 L13 22 H19 L21 24 L22 29 Z M13 27 H19');
 const launcher=outline('M12 29 V23 H20 V29 M14 23 V20 H18 V23');
 const target=outline('M22 3 H28 V9 H22 Z M25 2 V4 M25 8 V10 M21 6 H23 M27 6 H29');
 return {
 a_barrage:base+trails('M12 22 C7 18 6 14 5 10 M14 22 L12 7 M18 22 L20 7 M20 22 C25 18 26 14 27 10')+shell(5,6)+shell(12,4)+shell(20,4)+shell(27,6)+orb(9,15,1.3)+orb(23,15,1.3),
 rocket:base+trails('M16 21 V10 M16 8 V5')+shell(16,6)+orb(16,15,1.7),
 swarm:base+trails('M13 22 C11 19 7 17 6 11 M16 22 V8 M19 22 C21 19 25 17 26 11')+shell(6,8)+shell(16,5)+shell(26,8),
 missile:base+target+trails('M16 22 V18 C16 13 20 13 25 11')+shell(22,12),
 drone:base+outline('M4 19 L8 16 L12 19 L10 22 H6 Z M20 19 L24 16 L28 19 L26 22 H22 Z')+trails('M8 15 L9 10 M24 15 L23 10')+orb(10,7)+orb(22,7),
 spread:base+trails('M16 22 V10 M13 21 L7 11 M19 21 L25 11')+shell(16,7)+shell(6,8)+shell(26,8),
 cannon:launcher+trails('M16 19 V13 M16 10 V7')+orb(16,7,3.3),
 pulse:base+trails('M16 22 C15 16 20 12 24 13')+orb(24,12,3)+outline('M21 12 H27 M24 9 V15'),
 afterimage:base+outline('M3 23 H8 V28 H3 Z M5 21 V23')+trails('M6 20 V13 M16 21 V11')+shell(6,10)+shell(16,8),
 m_burst:launcher+trails('M16 19 V15 M16 11 V8')+orb(16,12)+orb(16,5),
 m_twin:base+outline('M10 22 V19 H13 V22 M19 22 V19 H22 V22')+trails('M11.5 18 V8 M20.5 18 V8')+shell(11.5,5)+shell(20.5,5),
 m_fan:launcher+trails('M14 20 L6 11 M16 20 V8 M18 20 L26 11')+orb(5,8)+orb(16,5)+orb(27,8),
 m_pierce:launcher+outline('M9 12 H23 M10 9 H22')+trails('M16 19 V5')+shell(16,5),
 m_side:base+outline('M2 24 H8 V28 H2 Z M24 24 H30 V28 H24 Z')+trails('M5 23 L14 10 M27 23 L18 10')+orb(15,8)+orb(17,8),
 m_rapid:launcher+trails('M16 20 V3')+orb(16,5,1.8)+orb(16,10,1.8)+orb(16,15,1.8),
 m_heavy:launcher+trails('M16 19 V14')+orb(16,9,4)+outline('M9 9 H7 M25 9 H23 M16 2 V4'),
 m_wave:base+trails('M7 22 C2 19 12 15 7 10 S2 5 7 3 M16 22 C11 19 21 15 16 10 S11 5 16 3 M25 22 C20 19 30 15 25 10 S20 5 25 3')+orb(7,4,1.5)+orb(16,4,1.5)+orb(25,4,1.5),
 m_lance:launcher+trails('M14 19 V5 M18 19 V5')+outline('M14 18 H18 M14 11 H18')+shell(16,4),
 m_sweep:launcher+trails('M16 20 L5 9 M16 20 V7 M16 20 L27 9')+orb(5,7,1.6)+orb(16,5,1.6)+orb(27,7,1.6),
 a_seeker:base+target+trails('M16 21 C9 16 12 10 20 8')+shell(19,8),
 a_wing:base+trails('M13 22 C2 22 4 13 9 9 M19 22 C30 22 28 13 23 9')+shell(9,6)+shell(23,6),
 a_scatter:launcher+trails('M16 20 V12 M16 11 L7 6 M16 11 V3 M16 11 L25 6')+orb(6,5)+orb(16,3)+orb(26,5),
 a_pierce:launcher+outline('M10 11 H22 M11 8 H21')+trails('M16 20 V4')+shell(16,4),
 a_hunter:base+outline('M1 4 H7 V9 H1 Z M13 2 H19 V7 H13 Z M25 4 H31 V9 H25 Z')+trails('M13 22 C7 20 4 16 4 11 M16 22 V9 M19 22 C25 20 28 16 28 11')+orb(4,12,1.5)+orb(16,10,1.5)+orb(28,12,1.5),
 a_rapid:launcher+trails('M16 20 V3')+shell(16,15)+shell(16,9)+shell(16,3),
 a_cannon:launcher+trails('M16 19 V15')+orb(16,10,4)+outline('M10 5 L8 3 M22 5 L24 3 M9 15 L7 17 M23 15 L25 17'),
 a_pair:base+target+trails('M13 22 C9 16 15 11 22 7 M19 22 C24 18 28 14 26 10')+shell(18,10)+shell(27,12),
 a_spread:base+trails('M16 22 L4 11 M16 22 L10 8 M16 22 V6 M16 22 L22 8 M16 22 L28 11')+orb(4,9,1.6)+orb(10,6,1.6)+orb(16,4,1.6)+orb(22,6,1.6)+orb(28,9,1.6),
 a_lance:base+trails('M11 22 V5 M21 22 V5')+shell(11,4)+shell(21,4)+outline('M7 12 H15 M17 12 H25')
 };
})();
function renderLoadout(){
 const limits={main:5,aux:1,utility:3};
 for(const group of Object.keys(limits)){
  const container=overlay.querySelector('[data-group="'+group+'"] .loadout-slots');container.replaceChildren();
  for(let i=0;i<limits[group];i++){
   const id=state.loadout[group][i];const slot=document.createElement('span');slot.className='loadout-slot'+(id?' occupied icon-'+id+' slot-rarity-'+(state.weaponRarities[id]||'common'):'');
   if(id){slot.innerHTML=upgradeIconSvg(id)+'<b>'+((state.weaponTierLevels[id]??state.weaponLevels[id])>=maxUpgradeLevels[id]?'MAX':(state.weaponTierLevels[id]??state.weaponLevels[id]))+'</b>';slot.setAttribute('title',loadoutNames[id]+' · '+rarityNames[state.weaponRarities[id]||'common']+' Lv.'+(state.weaponTierLevels[id]??state.weaponLevels[id]));slot.setAttribute('aria-label',loadoutNames[id]+', '+rarityNames[state.weaponRarities[id]||'common']+' 등급 레벨 '+(state.weaponTierLevels[id]??state.weaponLevels[id]));}
   else{slot.textContent='+';slot.setAttribute('aria-label','빈 슬롯');}
   container.append(slot);
  }
 }
}
const hiddenRecipes=[
 {id:'singularity',name:'중력 특이점',ingredients:['cannon','rate','nova','magnet','auxpower'],effect:'중력 파동 피해 2배'},
 {id:'guided',name:'유도 탄막',ingredients:['spread','rate','missile','magnet','auxpower'],effect:'추적 미사일 1발 추가 (최대 5발)'},
 {id:'storm',name:'위성 폭풍',ingredients:['rate','cross','orbit','magnet','auxpower'],effect:'회전 위성 피해 2배'},
 {id:'breaker',name:'철갑 파쇄',ingredients:['cannon','power','rail','magnet','repair'],effect:'화염 방사기 피해 2배'},
 {id:'wingman',name:'편대 출격',ingredients:['cross','spread','drone','auxpower','repair'],effect:'지원 드론 탄환 2발'},
 {id:'ace_squadron',name:'에이스 편대',ingredients:['rocket','spread','afterimage','near_fuse','regroup'],effect:'근접 회피 반격 시 드론과 잔상이 집중 사격'}
];
function recipeMet(recipe,levels){return recipe.ingredients.every(id=>(levels[id]||0)>=2);}
function updateHiddenSkills(){for(const recipe of hiddenRecipes){if(recipeMet(recipe,state.weaponLevels)&&!state.activeSkills.includes(recipe.id)){state.activeSkills.push(recipe.id);state.skillFlash=1.2;state.skillEffects.push({x:state.x,y:state.y,life:1.2,maxLife:1.2,color:'#ffdf80',radius:80});for(let i=0;i<3;i++)burst(state.x+(Math.random()-.5)*45,state.y+(Math.random()-.5)*45,'#ffdf80');notice('히든 스킬 발동: '+recipe.name);}}}
function openRecipes(returnTo=null){
 if(!state||!state.running||(state.paused&&!returnTo))return;
 resetStick();state.paused=true;panel.hidden=false;panel.replaceChildren();
 const box=document.createElement('div');box.className='game-dialog recipes-dialog';box.setAttribute('role','dialog');box.setAttribute('aria-label','히든 스킬 조합');
 const heading=document.createElement('h2');heading.textContent='히든 스킬 조합';
 const intro=document.createElement('p');intro.className='recipe-intro';intro.textContent='무기 3개 + 유틸 2개 · 각각 Lv.2 이상';
 const list=document.createElement('div');list.className='recipe-list';
 for(const recipe of hiddenRecipes){
  const row=document.createElement('section');row.className='recipe-row'+(state.activeSkills.includes(recipe.id)?' active':'');
  const header=document.createElement('div');header.className='recipe-header';
  const title=document.createElement('strong');title.textContent=recipe.name;
  const status=document.createElement('span');status.className='recipe-status';status.textContent=state.activeSkills.includes(recipe.id)?'발동 중':'미완성';header.append(title,status);
  const ingredients=document.createElement('div');ingredients.className='recipe-ingredients';
  recipe.ingredients.forEach((id,index)=>{
   if(index){const plus=document.createElement('span');plus.className='recipe-plus';plus.setAttribute('aria-hidden','true');plus.textContent='+';ingredients.append(plus);}
   const item=document.createElement('div');item.className='recipe-ingredient'+((state.weaponLevels[id]||0)>0?' selected':'')+((state.weaponLevels[id]||0)>=2?' met':'');
   const thumb=document.createElement('span');thumb.className='recipe-thumb icon-'+id;thumb.innerHTML=upgradeIconSvg(id);
   const name=document.createElement('span');name.className='recipe-name';name.textContent=loadoutNames[id];
   const level=document.createElement('span');level.className='recipe-level';level.textContent='Lv.'+(state.weaponLevels[id]||0)+' / 2';
   item.append(thumb,name,level);item.setAttribute('aria-label',loadoutNames[id]+', 현재 레벨 '+(state.weaponLevels[id]||0)+', 필요 레벨 2');ingredients.append(item);
  });
  const effect=document.createElement('p');effect.className='recipe-effect';effect.textContent=recipe.effect;
  row.append(header,ingredients,effect);list.append(row);
 }
 const back=returnTo?()=>{panel.replaceChildren(returnTo);}:resume;box.append(heading,intro,list,button(returnTo?'강화 선택으로 돌아가기':'전투로 돌아가기',back,'main-choice'));panel.append(box);
}
const droneBonusTypes=[{id:'damage',label:'공격력 +'+gameStat('droneBonusDamage',.04),cap:10},{id:'rate',label:'발사 간격 -'+gameStat('droneBonusRate',.04)+'초',cap:6},{id:'speed',label:'탄속 +'+gameStat('droneBonusSpeed',15),cap:8},{id:'count',label:'발사 수 +1',cap:2},{id:'pierce',label:'탄환 관통 +1',cap:1}];
const droneGradeOptions={common:1,uncommon:2,rare:3,legendary:4,mythic:5};
function droneBonusAvailable(id,mods){const def=droneBonusTypes.find(x=>x.id===id);if(!def)return false;if(id==='count')return (mods.count||0)<2||(mods.overflow||0)<10;if((mods[id]||0)>=def.cap)return false;if(id==='rate'&&gameStat('baseDroneInterval',.9)-(mods.rate||0)*gameStat('droneBonusRate',.04)<=gameStat('droneMinInterval',.55))return false;if(id==='damage'&&gameStat('baseDroneDamage',.28)+Math.max(0,state.level-1)*gameStat('baseDroneLevelGrowth',.025)+(mods.damage||0)*gameStat('droneBonusDamage',.04)+(mods.overflow||0)*gameStat('droneOverflowDamage',.025)>=state.power*(gameStat('droneDamageCapRatio',.22)+Math.min(gameStat('droneOverflowCapMax',.1),(mods.overflow||0)*gameStat('droneOverflowCapGrowth',.01))))return false;return true;}
function addDroneBonus(mods,id){const def=droneBonusTypes.find(x=>x.id===id);if(!def)return;if(id==='count'&&(mods.count||0)>=2)mods.overflow=Math.min(10,(mods.overflow||0)+1);else mods[id]=Math.min(def.cap,(mods[id]||0)+1);}
function assignDroneBonuses(choices,random=Math.random){for(const choice of choices){const count=droneGradeOptions[rarityOf(choice)]||1;const result=Array.isArray(choice.droneBonuses)?choice.droneBonuses.slice(0,count):choice.droneBonus?[choice.droneBonus]:[];const mods={...(state?.droneMods||{})};for(const id of result)addDroneBonus(mods,id);while(result.length<count){let available=droneBonusTypes.filter(x=>droneBonusAvailable(x.id,mods));if(!available.length)available=droneBonusTypes;let unused=available.filter(x=>!result.includes(x.id));if(!unused.length)unused=available;const selected=unused[Math.floor(random()*unused.length)]||unused[0];result.push(selected.id);addDroneBonus(mods,selected.id);}choice.droneBonuses=result;choice.droneBonus=result[0];}return choices;}
function applyDroneBonus(id){state.droneMods=state.droneMods||{damage:0,rate:0,speed:0,count:0,overflow:0,pierce:0};addDroneBonus(state.droneMods,id);}
function describeDroneBonuses(option){const mods={...(state.droneMods||{})},lines=[];for(const id of option.droneBonuses){const def=droneBonusTypes.find(x=>x.id===id);if(!def)continue;let label;if(!droneBonusAvailable(id,mods))label=def.label.split(' +')[0].split(' -')[0]+' 상한';else if(id==='count'&&(mods.count||0)>=2)label='발사 수 최대 · 피해 증가';else if(id==='count')label='발사 수 '+(1+(mods.count||0))+' → '+(2+(mods.count||0))+'발';else label=def.label;lines.push('• '+label);addDroneBonus(mods,id);}return lines.join('\n');}
function showUpgradeCards(choices,levels,eligible=[],rerollAvailable=true,resultMessage=''){
 assignDroneBonuses(choices);
 if(state?.weaponLevels?.repair&&choices.length){const first=choices[0];for(const choice of choices.slice(1)){choice.droneBonus=first.droneBonus;choice.droneBonuses=[...first.droneBonuses];}}
 resetStick();state.paused=true;panel.hidden=false;panel.replaceChildren();
 const box=document.createElement('div');box.className='game-dialog upgrade-dialog';
 const h=document.createElement('h2');h.textContent='레벨 업!';
 const p=document.createElement('p');p.textContent=state.weaponLevels.repair?'일루전 패널티: 세 선택지가 같은 증강으로 표시됩니다.':'이동 속도 증가! 강화 1개를 선택하세요';
 if(resultMessage)p.textContent=resultMessage;
 const cards=document.createElement('div');cards.className='upgrade-cards';
 for(const option of choices){
  const card=document.createElement('button');card.className='upgrade-card upgrade-group-'+option.group+' rarity-'+rarityOf(option);card.type='button';
  const icon=document.createElement('span');icon.className='upgrade-card-icon icon-'+option.id;
  icon.innerHTML=upgradeIconSvg(option.id);
  const level=document.createElement('span');level.className='upgrade-card-level';const tierLevel=state.weaponTierLevels[option.id]??levels[option.id];level.textContent=({main:'주무기',aux:'보조무기',utility:'유틸'})[option.group]+' · '+(option.repeatable?'무제한 Lv.'+(option.group==='main'?state.mainBoostLevel:state.auxBoostLevel):option.rankUp?rarityNames[option.previousRarity]+' → '+rarityNames[rarityOf(option)]+' · Lv.1':levels[option.id]===0?'NEW':'LV.'+tierLevel+' → '+(tierLevel+1));
  const name=document.createElement('strong');name.textContent=option.name+(option.rankUp?' 등급 업':'');
  const description=document.createElement('span');description.className='upgrade-card-description';const bonus=rarityAttackBonus[rarityOf(option)];description.textContent=option.detail+(bonus?' · 추가 화력 +'+bonus.toFixed(2):'');
  const droneBonus=document.createElement('span');droneBonus.className='upgrade-drone-bonus';droneBonus.textContent='드론 옵션 '+option.droneBonuses.length+'개\n'+describeDroneBonuses(option);
  const action=document.createElement('span');action.className='upgrade-card-action';action.textContent='선택';
  const rarity=document.createElement('span');rarity.className='upgrade-rarity';rarity.textContent=rarityNames[rarityOf(option)];card.append(rarity,icon,level,name,description,droneBonus,action);card.setAttribute('aria-label',rarity.textContent+' 등급, '+option.name+', '+level.textContent+', '+description.textContent+', '+droneBonus.textContent);
  card.addEventListener('click',()=>{window.GameAudio?.effect('upgrade');if(!option.repeatable){if(!state.loadout[option.group].includes(option.id))state.loadout[option.group].push(option.id);const previousTierLevel=state.weaponTierLevels[option.id]??levels[option.id];levels[option.id]++;state.weaponTierLevels[option.id]=option.rankUp?1:previousTierLevel+1;state.weaponRarities[option.id]=rarityOf(option);}option.apply();for(const id of option.droneBonuses)applyDroneBonus(id);const gradeBonus=rarityAttackBonus[rarityOf(option)];state.power+=gradeBonus;state.auxPower+=gradeBonus;updateHiddenSkills();renderLoadout();if(tutorial&&tutorial.phase==='upgrade'){panel.hidden=true;storyDialog.hidden=false;advanceTutorial();}else resume();});cards.append(card);
 }
 const remaining=Math.max(0,2-(state.gachaUses||0)),canPromote=!!promotedGachaChoices(choices,eligible);const reroll=button(!remaining?'등급 업 가챠 · 이번 라운드 사용 완료':!canPromote?'등급 업 가챠 · 승급 가능한 조합 없음':'등급 업 가챠 · 남은 횟수 '+remaining+'/2',()=>playUpgradeSlots(choices,levels,eligible,box,reroll),'upgrade-reroll');reroll.disabled=!rerollAvailable||!remaining||!canPromote;
 const recipesLink=button('?  히든 스킬 조합 보기',()=>openRecipes(box),'upgrade-recipes');box.append(h,p,cards,reroll,recipesLink);if(tutorial&&tutorial.phase==='upgrade'){p.textContent='훈련: 강화 카드 1개를 눌러 보세요';recipesLink.hidden=true;reroll.hidden=true;box.append(button('튜토리얼 건너뛰기',()=>{storyDialog.hidden=false;closeStory();},'tutorial-upgrade-skip'));}panel.append(box);
}
function playUpgradeSlots(choices,levels,eligible,originalBox,reroll){
 if(reroll.disabled||!state||!state.paused||(state.gachaUses||0)>=2)return;const promoted=promotedGachaChoices(choices,eligible);if(!promoted)return;state.gachaUses=(state.gachaUses||0)+1;reroll.disabled=true;const activeState=state;
 const reelPool=slotReelPool(choices,eligible),results=slotResult(reelPool),won=results.every(item=>item.id===results[0].id);
 const box=document.createElement('div');box.className='game-dialog slot-dialog';box.setAttribute('role','dialog');box.setAttribute('aria-label','등급 업 가챠');
 const h=document.createElement('h2');h.textContent='강화 슬롯';const intro=document.createElement('p');intro.textContent='전체 증강 중 같은 그림 3개가 나오면 선택지의 등급이 한 단계 올라갑니다';
 const reels=document.createElement('div');reels.className='slot-reels';const icons=[];
 for(const choice of choices){const reel=document.createElement('div');reel.className='slot-reel';const before=document.createElement('span'),after=document.createElement('span');before.className='slot-trail trail-before icon-'+choice.id;after.className='slot-trail trail-after icon-'+choice.id;before.setAttribute('aria-hidden','true');after.setAttribute('aria-hidden','true');before.innerHTML=after.innerHTML=upgradeIconSvg(choice.id);const icon=document.createElement('span');icon.className='slot-icon icon-'+choice.id;icon.innerHTML=upgradeIconSvg(choice.id);reel.append(before,icon,after);reels.append(reel);icons.push({icon,before,after,reel,last:choice});}
 const status=document.createElement('p');status.className='slot-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.textContent='가챠 회전 중…';box.append(h,intro,reels,status);panel.replaceChildren(box);
 let tick=0;function step(){if(state!==activeState||!state.running||panel.hidden)return;tick++;for(let i=0;i<3;i++){const settled=tick>=6+i*2;const item=settled?results[i]:reelPool[Math.floor(Math.random()*reelPool.length)];const reel=icons[i];reel.icon.className='slot-icon icon-'+item.id+(settled?' settled':' spinning');reel.icon.innerHTML=upgradeIconSvg(item.id);reel.before.className='slot-trail trail-before icon-'+reel.last.id+(settled?' is-hidden':'');reel.before.innerHTML=upgradeIconSvg(reel.last.id);const next=reelPool[(tick+i)%reelPool.length];reel.after.className='slot-trail trail-after icon-'+next.id+(settled?' is-hidden':'');reel.after.innerHTML=upgradeIconSvg(next.id);reel.reel.className='slot-reel'+(settled?' is-settled':' is-spinning');reel.last=item;}if(tick<10){setTimeout(step,110);return;}
  status.textContent=won?'성공! 선택지 3개의 등급이 한 단계 올라갑니다.':'아쉽지만 일치하지 않았어요. 기존 선택지로 돌아갑니다.';
  const proceed=button('강화 선택으로 돌아가기',()=>{if(state!==activeState||!state.running)return;showUpgradeCards(won?promoted:choices,levels,eligible,true,won?'가챠 성공! 한 단계 높은 등급의 증강을 선택하세요.':'가챠 실패 · 기존 강화 중 1개를 선택하세요.');},'main-choice');box.append(proceed);
 }
 step();
}

async function getTossBridge(){
 if(window.tossGame)return window.tossGame;
 if(window.tossGameReady)return await window.tossGameReady;
 return null;
}
async function openRanking(){
 try{const bridge=await getTossBridge();if(!bridge){notice('토스 앱에서 랭킹을 확인할 수 있어요.');return;}await bridge.open();}
 catch(error){notice(error&&error.message==='UNSUPPORTED_VERSION'?'토스 앱을 업데이트해 주세요.':'랭킹을 열지 못했어요. 잠시 후 다시 시도해 주세요.');}
}
async function submitScore(total,status,retry){
 retry.disabled=true;retry.hidden=true;status.textContent='랭킹에 기록을 등록하고 있어요.';
 try{const bridge=await getTossBridge();if(!bridge){status.textContent='토스 앱에서 랭킹을 이용할 수 있어요. 이 기록은 등록되지 않았어요.';return;}
  const result=await bridge.submit(total);
  if(result&&result.statusCode==='SUCCESS'){status.textContent='토스 랭킹에 기록을 등록했어요.';return;}
  status.textContent=result?'랭킹 등록에 실패했어요. 다시 시도해 주세요.':'이 토스 앱에서는 점수 등록을 지원하지 않아요.';
  if(result){retry.hidden=false;retry.disabled=false;}
 }catch(error){status.textContent='랭킹 등록에 실패했어요. 연결 상태를 확인한 뒤 다시 시도해 주세요.';retry.hidden=false;retry.disabled=false;}
}
// One rewarded continue per sortie. The game remains paused until the ad resolves.
function offerRewardedRevive(){
 const run=state;if(!run||run.finished||run.reviveUsed||run.revivePending)return;run.revivePending=true;let cancel=()=>{},showAd=null,adPlaying=false;
 showPanel('기체 손상','광고를 끝까지 보면 이번 출격에서 1회 이어할 수 있어요. 체력 50 회복 · 3초 무적 · 적 탄환 제거',[]);
 const box=panel.querySelector('.game-dialog'),status=document.createElement('p');box.classList?.add('damage-dialog');status.className='revive-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const watch=button('광고 준비 중',()=>{if(!showAd||adPlaying)return;adPlaying=true;window.GameAudio?.setAdHold(true);watch.disabled=true;exit.disabled=true;status.textContent='광고를 시청 중이에요.';try{showAd();}catch{cancel();adPlaying=false;window.GameAudio?.setAdHold(false);exit.disabled=false;status.textContent='광고를 표시하지 못했어요. 출격을 종료해 주세요.';}},'main-choice revive-watch');watch.disabled=true;
 const exit=button('출격 종료',()=>{if(state!==run||run.finished||adPlaying)return;cancel();run.revivePending=false;end(false);},'revive-exit');box.append(status,watch,exit);
 const service=window.WebRewardedAds;if(!service){status.textContent='현재 광고를 사용할 수 없어요. 출격을 종료해 주세요.';return;}
 cancel=service.prepare(show=>{if(state!==run||run.finished||!run.revivePending)return;showAd=show;watch.disabled=false;watch.textContent='광고 보고 이어하기 · 1회';status.textContent='광고 시청을 완료하면 전투를 이어갈 수 있어요.';},result=>{
  if(state!==run||run.finished||!run.revivePending)return;adPlaying=false;window.GameAudio?.setAdHold(false);exit.disabled=false;
  if(result==='viewed'){run.revivePending=false;run.reviveUsed=true;run.playerDestroyed=false;run.hp=50;run.inv=3;run.enemyShots=[];run.shieldBreak=null;resume();systemNotice('이어하기 · 3초 무적');return;}
  watch.disabled=true;watch.textContent='광고 이용 불가';status.textContent=result==='dismissed'?'광고 시청이 완료되지 않았어요. 출격을 종료해 주세요.':'현재 광고를 불러올 수 없어요. 출격을 종료해 주세요.';
 });
}
function end(win){if(state.finished)return;window.GameAudio?.effect('defeat');state.finished=true;state.running=false;const total=state.score+Math.floor(state.totalTime)*2+(win?1000+Math.floor(state.hp)*5:0);let saved=true;if(mode==='normal'){const updated=applyMissionResult({...progress,coins:progress.coins+state.coins,best:Math.max(progress.best,total)},state);saved=save('starfall-progress',updated);if(saved)progress=updated;} showPanel(win?'임무 완료!':'출격 종료',`라운드 ${state.round} · 스테이지 ${state.stage} · 클리어 ${state.completedStages}회\n점수 ${total.toLocaleString()}점 · 처치 ${state.kills} · 코인 ${state.coins}\n다시 출격하면 1라운드 1스테이지부터 시작해요.\n전투·스테이지 ${state.score}점 + 생존 ${Math.floor(state.totalTime)*2}점${win?` + 클리어 ${1000+Math.floor(state.hp)*5}점`:''}`, [['처음부터 다시 출격',()=>start(mode),'main-choice'],['대기 화면',stop]]);if(mode==='normal'&&!saved){const status=document.createElement('p');status.className='rank-status';status.textContent='저장하지 못했어요. 이번 보상과 기록은 보관되지 않았습니다.';panel.querySelector('.game-dialog').append(status);}if(mode==='rank'){const box=panel.querySelector('.game-dialog');const status=document.createElement('p');status.className='rank-status';status.setAttribute('role','status');const retry=button('점수 등록 다시 시도',()=>submitScore(total,status,retry));retry.hidden=true;const view=button('전체 랭킹 보기',openRanking);box.append(status,retry,view);submitScore(total,status,retry);}}
const stageNames=['외곽 격납고','동력 회랑','파편 채굴장','방어 시설','중앙 지휘부'];
function stageDifficulty(stage,round){const stageIndex=Math.max(0,(round-1)*5+stage-1);return 1+stageIndex*gameStat('stageDifficultyGrowth',.32);}
// Keep accumulated growth and equipment; clear only transient attacks between stages.
function resetStageGrowth(){
 state.fire=0;for(const key of ['baseDroneTimer','rocketTimer','swarmTimer','novaTimer','boomerangTimer','railTimer','lightningTimer','mineTimer','cannonTimer','droneTimer','bladeTimer','missileTimer','pulseTimer','skillFlash'])state[key]=0;
 state.arcs=[];state.pulses=[];state.flames=[];state.grenades=[];state.satellites=[];state.skillEffects=[];renderLoadout();
}
function nextStage(){
 window.GameAudio?.setScene('battle');clearSystemNotice();resetStageGrowth();
 if(state.stage===5){state.stage=1;state.round++;state.gachaUses=0;}else state.stage++;
 state.t=0;state.spawn=0;state.fastTimer=18;state.boss=false;state.bossCleared=false;
 state.phantoms=[];state.regroupMotion=0;state.grazeCharge=0;state.enemies=[];state.wrecks=[];state.buildingTimer=12;state.miniBossSpawned=0;state.enemyShots=[];state.bullets=[];state.mines=[];state.saws=[];state.drops=[];state.particles=[];state.debris=[];state.skillEffects=[];
 state.x=200;state.y=560;state.tilt=0;state.shieldBreak=null;state.inv=2;resume();systemNotice('라운드 '+state.round+' · 스테이지 '+state.stage);
}
function clearStage(boss){
 if(state.bossCleared)return;state.bossCleared=true;state.completedStages++;state.score+=1000;
 resetStick();clearSystemNotice();state.paused=false;state.phantoms=[];state.regroupMotion=0;state.enemyShots=[];state.enemies=[];state.bullets=[];state.mines=[];state.grenades=[];state.flames=[];state.arcs=[];state.pulses=[];state.satellites=[];state.saws=[];state.skillEffects=[];state.skillFlash=0;state.bombFlash=0;state.particles=[];
 const loot=overlay.querySelector('.stage-loot-countdown');loot.hidden=false;loot.textContent='보상 회수 · '+Math.ceil(gameStat('bossLootSeconds',10))+'초';
 state.stageSequence={phase:'loot',elapsed:0,boss:{x:boss?.x??200,y:boss?.y??125,type:boss?.type??bossTypeFor(state.stage,state.round),combatPhase:boss?.combatPhase??3},stage:state.stage,round:state.round};
}
function updateStageSequence(dt){
 const seq=state.stageSequence;if(!seq||seq.phase==='dialog')return;
 if(seq.phase==='loot'){if(state.paused)return;if(state.xp>=state.need){levelUp();return;}const dx=(heldKeys.has('d')?1:0)-(heldKeys.has('a')?1:0)+state.joyX,dy=(heldKeys.has('s')?1:0)-(heldKeys.has('w')?1:0)+state.joyY,len=Math.hypot(dx,dy),scale=len>1?1/len:1;updatePlayerTilt(dx*scale,dt);state.x=Math.max(20,Math.min(W-20,state.x+dx*scale*playerSpeed(state.level)*dt));state.y=Math.max(85,Math.min(H-20,state.y+dy*scale*playerSpeed(state.level)*dt));collectDrops(dt,true);if(state.paused)return;seq.elapsed+=dt;const remaining=Math.max(0,Math.ceil(gameStat('bossLootSeconds',10)-seq.elapsed));overlay.querySelector('.stage-loot-countdown').textContent='보상 회수 · '+remaining+'초';if(remaining>0)return;overlay.querySelector('.stage-loot-countdown').hidden=true;seq.phase='departure';seq.elapsed=0;seq.fromX=state.x;seq.fromY=state.y;
  const banner=overlay.querySelector('.stage-clear-banner');banner.textContent=seq.stage===5?'라운드 클리어!':'스테이지 클리어!';banner.hidden=false;
 }else if(seq.phase==='departure'){
  seq.elapsed+=dt;const fade=overlay.querySelector('.stage-transition-fade');fade.hidden=false;fade.style.opacity=String(seq.elapsed<.85?0:seq.elapsed<1.3?(seq.elapsed-.85)/.45:Math.max(0,1-(seq.elapsed-1.3)/1.2));
  if(seq.elapsed>=1.3&&!seq.advanced){seq.advanced=true;nextStage();state.paused=true;}
  if(seq.elapsed>=2.5){overlay.querySelector('.stage-clear-banner').hidden=true;overlay.querySelector('.stage-transition-fade').hidden=true;state.stageSequence=null;resume();}
 }
}
function drawStageSequence(ctx){
 const seq=state.stageSequence;if(!seq)return;
 if(seq.phase==='loot'&&seq.elapsed<1.6){
  const t=Math.min(1,seq.elapsed/1.6),boss=seq.boss;ctx.save();ctx.translate(boss.x,boss.y+t*t*150);ctx.rotate(t*.34);ctx.globalAlpha=1-t*.7;drawCombatSprite(ctx,'boss',0,0,160*(1-t*.18),100*(1-t*.18),boss.combatPhase,{bossType:boss.type,body:BOSS_TYPES[boss.type].color,engine:BOSS_TYPES[boss.type].accent});
  window.BossExplosion.drawFragments(ctx,combatArt.boss,seq.elapsed);window.BossExplosion.draw(ctx,seq.elapsed);ctx.restore();

 }
}

// Stage speed rises gradually, with a cap to keep late rounds controllable.
function enemyStageSpeed(base,stage,round){const index=Math.max(0,(round-1)*5+stage-1);return base*(1+Math.min(.5,index*.04));}
function spawn(){
  const roll=Math.random();
  let kind=state.t>55&&roll<.08?'venom':state.t>75&&roll<.16?'salvo':state.t>40&&roll<.26?'gunner':state.t>28&&roll<.40?'hunter':state.t>18&&roll<.60?'shooter':state.t>8&&roll<.78?'charger':'scout';
  const stage=Math.min(Math.floor(state.t/45),Math.floor((state.level-1)/2));
  const enemyBaseHp={scout:gameStat('enemyScoutHp',2),charger:gameStat('enemyChargerHp',3),hunter:gameStat('enemyHunterHp',4),shooter:gameStat('enemyShooterHp',5),venom:gameStat('enemyVenomHp',5),gunner:gameStat('enemyGunnerHp',6),salvo:gameStat('enemySalvoHp',8)};const baseHp=enemyBaseHp[kind]??2;const hp=baseHp*gameStat('normalEnemyHpMultiplier',.8)*(1+(waveNumber(state.t)-1)*.35)*stageDifficulty(state.stage,state.round);const enemyLevel=1+(state.level-1)*.5;const defense=Math.min(.60,enemyDefense(enemyLevel)+Math.min(.25,(state.round-1)*.03));
  const lateral=Math.random()<.2,direction=lateral?(Math.random()<.5?1:-1):0;
  if(lateral)kind='side';else if(state.t>30&&roll<.08)kind='deathburst';
  state.enemies.push({x:lateral?(direction>0?-30:W+30):30+Math.random()*(W-60),y:lateral?125+Math.random()*(H*.43):-25,hp:lateral?hp*1.15:hp,maxHp:lateral?hp*1.15:hp,enemyLevel,defense,speed:enemyStageSpeed((kind==='charger'?85:kind==='salvo'?30:kind==='gunner'?35:kind==='shooter'||kind==='venom'?38:kind==='hunter'?46:52)+Math.min(24,stage*6),state.stage,state.round),lateral,direction,r:kind==='shooter'||kind==='venom'?16:13,kind,shot:lateral?.9+Math.random()*.4:1.4+Math.random(),phase:0});
}
function spawnGroundTurret(armored=false){const hp=gameStat('enemySalvoHp',8)*2*(1+(waveNumber(state.t)-1)*.35)*stageDifficulty(state.stage,state.round);state.enemies.push({kind:'turret',ground:true,bombImmune:armored,x:Math.random()<.5?42:W-42,y:-35,hp:armored?hp*1.5:hp,maxHp:armored?hp*1.5:hp,enemyLevel:1+(state.level-1)*.5,defense:Math.min(.6,enemyDefense(1+(state.level-1)*.5)+.05),speed:70,r:22,shot:2,phase:0,turretAngle:0});}
// Mid-bosses appear once in waves two and three, with their own HP and attack cycle.
function spawnMidBoss(){const hp=gameStat('miniBossHp',70)*(1+(waveNumber(state.t)-1)*gameStat('miniBossWaveGrowth',.25))*stageDifficulty(state.stage,state.round);state.enemies.push({kind:'miniboss',miniBoss:true,x:200,y:-45,hp,maxHp:hp,enemyLevel:1+(state.level-1)*.5,defense:Math.min(.45,enemyDefense(1+(state.level-1)*.5)),speed:enemyStageSpeed(gameStat('miniBossSpeed',28),state.stage,state.round),r:30,entryProtection:1.5,entryAnnounced:false,shot:2.2,outerShot:1.1,innerShot:1.8,phase:0});systemNotice('중간 보스 출현!');showEncounterWarning('중간 보스 출현','대형 적 기체 접근');window.GameAudio?.effect('boss');}
function fireDeathBurst(enemy){if(enemy.y<0||enemy.y>H)return;for(let i=0;i<24;i++)fireEnemy(enemy.x,enemy.y,i*Math.PI*2/24,105);}
function fireEnemy(x,y,angle,speed=145,source='normal'){if(state.enemyShots.length>=350)return;const factor=Math.min(1.5,1+(state.stage-1)*.02+(state.round-1)*.05);state.enemyShots.push({x,y,vx:Math.sin(angle)*speed*factor,vy:Math.cos(angle)*speed*factor,r:6,source});}
function shouldDrop(id,kills,random=Math.random){const rule=dropConfig[id];if(!rule)return false;if(rule.mode==='interval'&&(!rule.interval||kills%rule.interval!==0))return false;return rule.chance>=1||(rule.chance>0&&random()<rule.chance);}
// Ground turrets rotate at a limited angular speed and fire along the visible barrel.
function updateTurretAim(enemy,dt){const target=Math.atan2(state.x-enemy.x,state.y-enemy.y),current=enemy.turretAngle||0,difference=Math.atan2(Math.sin(target-current),Math.cos(target-current)),step=2.5*dt;enemy.turretAngle=current+Math.max(-step,Math.min(step,difference));}
// Stage identities repeat each round; difficulty still scales with the round.
const BOSS_TYPES=[
 {name:'철갑 요새 오리지널',color:'#e64a46',accent:'#ffe18a',speed:1},
 {name:'성운 추격자',color:'#8e69d5',accent:'#bfeeff',speed:1.05},
 {name:'독침 여왕',color:'#df7b32',accent:'#fff19c',speed:1.1},
 {name:'궤도 파괴자',color:'#4089bb',accent:'#b1f5ff',speed:1.05},
 {name:'심연의 군주',color:'#b52e62',accent:'#e7a4ff',speed:1.15},
 {name:'철갑 요새 개량형',color:'#df782c',accent:'#ffe18a',speed:1.04}
];
// The first stage alternates its original and upgraded fortress between rounds.
function bossTypeFor(stage,round){return stage===1&&round%2===0?5:Math.max(0,Math.min(4,stage-1));}
const BOSS_ENRAGE_SECONDS=75, BOSS_SECOND_ENRAGE_SECONDS=120;
function bossEnrageTimes(stage,round){const index=Math.max(0,(round-1)*5+stage-1),extra=Math.min(30,index*gameStat('bossEnrageStageGrowth',3)),first=gameStat('bossEnrageFirst',75)+extra;return {first,second:Math.max(first+10,gameStat('bossEnrageSecond',120)+extra)};}
// Boss inherits the mid-boss rotating turrets on independent, staggered timers.
function updateBossInheritedRings(boss,dt,phase){if(boss.y<125)return;boss.inheritedOuterTimer=(boss.inheritedOuterTimer??4)-dt;boss.inheritedInnerTimer=(boss.inheritedInnerTimer??6)-dt;const factor=boss.enrageLevel>=2?.8:boss.enraged?.9:1;if(boss.inheritedOuterTimer<=0){fireMiniBossRing(boss,false,'boss');boss.inheritedOuterTimer=Math.max(3.8,(6.2-(phase-1)*.5)*factor);}if(phase>=2&&boss.inheritedInnerTimer<=0){fireMiniBossRing(boss,true,'boss');boss.inheritedInnerTimer=Math.max(4.7,(7.2-(phase-2)*.5)*factor);}}
function bossGapCenter(pattern,row){const first=pattern===1?260:120;return row%2===0?first:380-first;}
function bossRowCount(pattern,phase){return pattern===1||phase>=3?3:2;}
// Each volley keeps the curtain; unlocked attacks follow while its rows travel.
function fireBossVolley(boss,phase){
 const type=BOSS_TYPES[boss.type],speed=(185+phase*12)*type.speed*(boss.enrageLevel>=2?1.45:boss.enraged?1.25:1);

 const pattern=boss.pattern,rows=bossRowCount(pattern,phase);
 boss.pendingRows=Array.from({length:rows},(_,index)=>({delay:index*.75,gap:bossGapCenter(pattern,index),speed,fired:false}));boss.pattern=(pattern+1)%3;
 boss.pendingExtras=[{delay:.38,kind:'signature',speed,lockedX:boss.lockedX,lockedY:state.y}];if(phase>=2)boss.pendingExtras.push({delay:1.05,kind:'fan',speed});if(phase>=3)boss.pendingExtras.push({delay:2.15,kind:'aimed',speed,lockedX:boss.lockedX,lockedY:state.y});
 if(boss.type>=1&&boss.type<=4){
  const turn=pattern,add=(delay,kind)=>boss.pendingExtras.push({delay,kind,speed,lockedX:boss.lockedX,lockedY:state.y,turn});
  // The first warning starts alongside the opening curtain, not after it.
  if(boss.type===1){add(0,'laser');if(phase>=2)add(1.15,'pursuit');if(phase>=3)add(1.9,'laser');}
  if(boss.type===2){add(0,'ring');if(phase>=2)add(.85,'needle');if(phase>=3)add(1.65,'ring');}
  if(boss.type===3){add(0,'spiral');add(.3,'spiral');add(.6,'spiral');if(phase>=2)add(1.1,'laser');if(phase>=3)add(1.7,'needle');}
  if(boss.type===4){add(0,'ring');add(.55,'needle');if(phase>=2)add(1.1,'laser');if(phase>=3){add(1.6,'spiral');add(1.9,'spiral');}}
 }

 return rows===3?3.5:2.8;
}
// Each stage adds a recognisable signature while the curtain preserves a safe lane.
function fireBossEnemy(x,y,angle,speed){fireEnemy(x,y,angle,speed,'boss');}
function fireBossSignature(boss,extra){
 const y=boss.y+25,speed=extra.speed*.8,turn=boss.attackTurn=(boss.attackTurn||0)+1;
 if(boss.type===0){for(const x of [boss.x-48,boss.x+48])for(const a of [-.18,.18])fireBossEnemy(x,y,a,speed);}
 else if(boss.type===1){const aim=Math.atan2(extra.lockedX-boss.x,extra.lockedY-boss.y);for(const a of [-.32,0,.32])fireBossEnemy(boss.x,y,aim+a,speed*1.12);}
 else if(boss.type===2){for(const side of [-1,1])for(const a of [.35,.65,.95])fireBossEnemy(boss.x+side*25,y,side*a,speed*.9);}
 else if(boss.type===3){const offset=turn%2?-.14:.14;for(const a of [-.8,-.4,0,.4,.8])fireBossEnemy(boss.x,y,a+offset,speed*.85);}
 else if(boss.type===4){const aim=Math.atan2(extra.lockedX-boss.x,extra.lockedY-boss.y);for(const a of [-.44,-.22,.22,.44])fireBossEnemy(boss.x,y,aim+a,speed);}
 else {for(const side of [-1,1])for(const a of [-.12,.12])fireBossEnemy(boss.x+side*55,y,side*.25+a,speed*1.05);}
}
// Each hull has a different signature; warning beams never deal damage until charged.
function fireDistinctBossAttack(boss,extra){
 const x=boss.x,y=boss.y+25,speed=extra.speed,turn=extra.turn||0;
 if(extra.kind==='laser'){const aim=Math.max(35,Math.min(W-35,extra.lockedX));state.enemyShots.push({laser:true,source:'boss',x:aim,y:y,vx:0,vy:0,r:14,warning:1.1,active:.65,life:1.75});}
 else if(extra.kind==='ring'){const count=16,rotation=turn%2?Math.PI/count:0;for(let i=0;i<count;i++)fireBossEnemy(x,y,i*Math.PI*2/count+rotation,speed*.68);}
 else if(extra.kind==='spiral'){const angle=(boss.attackTurn=(boss.attackTurn||0)+1)*.31;for(let i=0;i<5;i++)fireBossEnemy(x,y,angle+i*Math.PI*2/5,speed*.72);}
 else{const aim=Math.atan2(extra.lockedX-x,extra.lockedY-y),offsets=extra.kind==='needle'?[-.48,-.24,.24,.48]:[-.18,0,.18];for(const offset of offsets)fireBossEnemy(x,y,aim+offset,speed*.84);}
}
function releaseBossRows(boss,dt){
 if(boss.pendingRows){for(const row of boss.pendingRows){row.delay-=dt;if(row.delay<=0&&!row.fired){for(let x=12;x<W;x+=24)if(Math.abs(x-row.gap)>42)fireBossEnemy(x,boss.y+25,0,row.speed);row.fired=true;}}boss.pendingRows=boss.pendingRows.filter(row=>!row.fired);}
 if(boss.pendingExtras){for(const extra of boss.pendingExtras){extra.delay-=dt;if(extra.delay<=0&&!extra.fired){if(['laser','pursuit','ring','needle','spiral'].includes(extra.kind)){fireDistinctBossAttack(boss,extra);}else if(extra.kind==='signature'){fireBossSignature(boss,extra);}else if(extra.kind==='fan'){const tilt=(boss.type-2)*.035;for(let i=-2;i<=2;i++)if(i!==0)fireBossEnemy(boss.x,boss.y+25,i*.22+tilt,extra.speed*.85);}else{const aim=Math.atan2(extra.lockedX-boss.x,extra.lockedY-boss.y);for(let i=-1;i<=1;i++)fireBossEnemy(boss.x,boss.y+25,aim+i*.19,extra.speed*.9);}extra.fired=true;}}boss.pendingExtras=boss.pendingExtras.filter(extra=>!extra.fired);}
}
function enemyHitDamage(stage,round){return Math.min(gameStat('maxEnemyDamage',42),gameStat('enemyDamage',22)+Math.max(0,stage-1)*gameStat('stageDamageGrowth',2)+Math.max(0,round-1)*gameStat('roundDamageGrowth',2));}
// The glowing center of the fighter is its projectile hitbox (game-world pixels).
const PLAYER_SHOT_HIT_RADIUS=4;
function projectileHitsPlayer(shot,x,y){return Math.hypot(x-shot.x,y-shot.y)<shot.r+PLAYER_SHOT_HIT_RADIUS;}
// Freeze combat while the aircraft breaks apart, then open the existing death flow.
function beginPlayerDestruction(){if(!state||state.deathSequence||state.finished)return;resetStick();state.paused=true;state.playerDestroyed=true;state.deathSequence={elapsed:0,x:state.x,y:state.y};window.GameAudio?.effect('explosion');}
function updatePlayerDestruction(dt){const sequence=state?.deathSequence;if(!sequence)return;sequence.elapsed+=dt;if(sequence.elapsed>=1.35){state.deathSequence=null;if(state.reviveUsed||tutorial)end(false);else offerRewardedRevive();}}
function drawPlayerDestruction(ctx){const sequence=state?.deathSequence;if(!sequence)return;const elapsed=sequence.elapsed;ctx.save();ctx.translate(sequence.x,sequence.y);if(elapsed<.35){ctx.save();ctx.globalAlpha=Math.max(0,1-elapsed/.35);ctx.rotate(elapsed*.75);drawCombatSprite(ctx,'player',0,0,64,68,1,skinColors());ctx.restore();}if(window.BossExplosion){ctx.save();ctx.scale(.55,.55);window.BossExplosion.draw(ctx,elapsed);ctx.restore();}ctx.restore();}
function takeHit(){if(state.inv>0)return false;window.GameAudio?.effect(state.shield>0?'shield':'hit');if(state.shield>0){state.shield--;state.shieldBreak={x:state.x,y:state.y,life:.4};notice('실드 방어!');}else{state.hp=Math.max(0,state.hp-enemyHitDamage(state.stage,state.round));burst(state.x,state.y,'#ffffff');}state.inv=2;if(state.hp<=0)beginPlayerDestruction();return true;}
function burst(x,y,color){for(let i=0;i<7;i++){const a=Math.random()*Math.PI*2,v=30+Math.random()*100;state.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.4+Math.random()*.3,color});}}
// Extra forward projectiles lose 20% damage for each step away from the center.
// Fixed hardpoints distinguish simultaneous weapons and stay inside the playfield.
const weaponHardpoints={rocket:[-18,-8],swarm:[18,-2],missile:[0,3],cannon:[0,-25],drone:[-22,8],m_burst:[-11,-18],m_twin:[0,-12],m_fan:[12,-15],m_pierce:[0,-25],m_side:[0,0],m_rapid:[-19,-6],m_heavy:[12,-22],m_wave:[-13,2],m_lance:[0,-19],m_sweep:[18,-9],a_seeker:[-22,3],a_wing:[0,7],a_scatter:[22,2],a_pierce:[-9,-24],a_hunter:[18,10],a_rapid:[-20,10],a_cannon:[13,4],a_pair:[0,12],a_spread:[-14,6],a_lance:[10,-20],a_barrage:[0,-8]};
function baseDronePosition(side){const dash=state.regroupMotion>0?Math.sin((1-state.regroupMotion/gameStat('regroupDuration',.9))*Math.PI)*gameStat('regroupTravel',75):0;return {x:Math.max(12,Math.min(W-12,state.x+side*gameStat('baseDroneOffset',48))),y:Math.max(40,Math.min(H-16,state.y+10-dash))};}
function baseDroneTarget(side){const pos=baseDronePosition(side);return state.enemies.filter(e=>!e.dead&&e.hp>0&&e.y>0&&e.y<H).sort((a,b)=>Math.hypot(a.x-pos.x,a.y-pos.y)-Math.hypot(b.x-pos.x,b.y-pos.y))[0];}
function updateBaseDrones(dt){if(state.regroupMotion>0)return;state.baseDroneTimer=(state.baseDroneTimer||0)-dt;if(state.baseDroneTimer>0)return;let fired=false;for(const side of [-1,1]){const target=baseDroneTarget(side);if(!target)continue;const pos=baseDronePosition(side),aim=Math.atan2(target.y-pos.y,target.x-pos.x),damage=Math.min(state.power*(gameStat('droneDamageCapRatio',.22)+Math.min(gameStat('droneOverflowCapMax',.1),(state.droneMods?.overflow||0)*gameStat('droneOverflowCapGrowth',.01))),gameStat('baseDroneDamage',.28)+Math.max(0,state.level-1)*gameStat('baseDroneLevelGrowth',.025)+(state.droneMods?.damage||0)*gameStat('droneBonusDamage',.04)+(state.droneMods?.overflow||0)*gameStat('droneOverflowDamage',.025)),count=1+Math.min(2,state.droneMods?.count||0),speed=gameStat('droneBaseBulletSpeed',320)+(state.droneMods?.speed||0)*gameStat('droneBonusSpeed',15);for(let i=0;i<count;i++){const angle=aim+(i-(count-1)/2)*.12;state.bullets.push({x:pos.x,y:pos.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,aimed:true,baseDrone:true,auxiliary:true,absoluteDamage:damage/count,angle,...(state.droneMods?.pierce?{rail:true,hit:new Set()}:{} )});}fired=true;}if(fired)state.baseDroneTimer=Math.max(gameStat('droneMinInterval',.55),gameStat('baseDroneInterval',.9)-(state.droneMods?.rate||0)*gameStat('droneBonusRate',.04));}
function drawBaseDrone(ctx,side){
 const pos=baseDronePosition(side),target=baseDroneTarget(side),angle=target?Math.atan2(target.y-pos.y,target.x-pos.x)+Math.PI/2:0;
 ctx.save();ctx.translate(pos.x,pos.y);ctx.rotate(angle);
 // A dedicated armored gun drone, drawn in the same pixel-art palette as the player.
 ctx.imageSmoothingEnabled=false;
 const drone=selectedLoadout?.shipId&&selectedDroneSprites[selectedLoadout.shipId]?.complete&&selectedDroneSprites[selectedLoadout.shipId].naturalWidth?selectedDroneSprites[selectedLoadout.shipId]:escortDroneArt;if(drone.complete&&drone.naturalWidth){if(drone===escortDroneArt)ctx.drawImage(drone,-15,-19,30,38);else drawImageContained(ctx,drone,0,0,34,38,DRONE_SPRITE_BOUNDS[selectedLoadout.shipId]);}
 else{ctx.fillStyle='#09142b';ctx.fillRect(-11,-9,22,17);ctx.fillRect(-4,-16,8,10);ctx.fillStyle='#dce6ef';ctx.fillRect(-9,-7,18,12);ctx.fillRect(-2,-15,4,10);ctx.fillStyle='#ff8735';ctx.fillRect(-9,1,18,3);ctx.fillStyle='#22577c';ctx.fillRect(-4,-6,8,9);ctx.fillStyle='#a6f6ff';ctx.fillRect(-1,-4,2,4);}
 ctx.restore();
}
function weaponLaunchPoint(id,index=0,count=1){const [dx,dy]=weaponHardpoints[id]||[0,-16],spread=Math.max(-24,Math.min(24,(index-(count-1)/2)*10));return{x:Math.max(8,Math.min(W-8,state.x+dx+spread)),y:Math.max(8,Math.min(H-8,state.y+dy))};}
function weaponMuzzle(point,id){state.skillEffects.push({type:'weaponMuzzle',x:point.x,y:point.y,weaponId:id,life:.14,maxLife:.14});}
function illusionCopyRatio(){const level=state.weaponLevels.repair||0;return level?Math.min(gameStat('illusionMaxRatio',.6),augmentStat('repair','damageMultiplier',.4)+(level-1)*augmentStat('repair','damagePerLevel',.025)):0;}
function copyDroneProjectiles(start){const ratio=illusionCopyRatio()/2;if(!ratio)return;const sources=state.bullets.slice(start).filter(b=>!b.illusion&&!b.baseDrone&&!b.illusionDroneSide);for(const b of sources)for(const side of [-1,1]){const origin=baseDronePosition(side),copy={...b,x:origin.x,y:origin.y-8,illusionDroneSide:side,illusion:true,damage:(b.damage??1)*ratio};if(b.absoluteDamage!==undefined)copy.absoluteDamage=b.absoluteDamage*ratio;if(b.hit)copy.hit=new Set();if(b.trail)copy.trail=[];state.bullets.push(copy);}}
function fireForwardVolley(){const side=state.volleySide===-1?-1:1;state.volleySide=-side;for(let n=0;n<=state.spread;n++){const step=n===0?0:Math.ceil(n/2)*(n%2?side:-side),vx=Math.max(-55,Math.min(55,step*18));const damage=Math.pow(augmentStat('spread','damageFalloff',.8),Math.abs(step));state.bullets.push({x:state.x+step*4,y:state.y-15,vx,damage});}const wingDamage=gameStat('baseWingMissileDamage',.45),wingX=Math.max(8,Math.min(392,state.x+side*16));state.bullets.push({x:wingX,y:state.y-11,vx:0,damage:wingDamage,projectileKind:'rocket',wingMissile:true});}
// Each bounce deals half the raw damage of the preceding hit, before defense.
function fireChainLightning(){const targets=state.enemies.filter(e=>!e.dead&&e.y>0&&e.y<H).sort((a,b)=>Math.hypot(a.x-state.x,a.y-state.y)-Math.hypot(b.x-state.x,b.y-state.y)).slice(0,1+state.weaponLevels.lightning);if(!targets.length)return;if(typeof window!=='undefined')window.GameAudio?.effect('auxShot');let x=state.x,y=state.y,damage=state.auxPower*(augmentStat('lightning','baseDamage',1)+state.weaponLevels.lightning*augmentStat('lightning','damagePerLevel',.35));for(const enemy of targets){state.arcs.push({x,y,tx:enemy.x,ty:enemy.y,life:.2});damageEnemy(enemy,damage);if(state.weaponLevels.repair)for(const side of [-1,1]){const origin=baseDronePosition(side);state.arcs.push({x:origin.x,y:origin.y,tx:enemy.x,ty:enemy.y,life:.2});damageEnemy(enemy,damage*illusionCopyRatio()/2,false);}damage*=augmentStat('lightning','bounceMultiplier',.5);x=enemy.x;y=enemy.y;}state.lightningTimer=augmentStat('lightning','interval',2.2);}
// The former cross-shot slot deploys proximity mines independent of the main volley.
function updateProximityMines(dt){
 state.mineTimer-=dt;const level=state.weaponLevels.cross;
 if(level>0&&state.mineTimer<=0){
  const count=Math.min(Math.floor(gameStat('mineMaxCount',10)),level),spacing=gameStat('mineThrowSpacing',30),copies=state.weaponLevels.repair?3:1,total=count*copies,maxCols=Math.max(1,Math.floor((W-24)/spacing)+1),rows=Math.ceil(total/maxCols),perRow=Math.ceil(total/rows),baseY=Math.max(55,Math.min(H-35-(rows-1)*75,state.y-gameStat('mineThrowDistance',130))),duration=gameStat('mineThrowDuration',.4);
  for(let i=0;i<total;i++){const row=Math.floor(i/perRow),column=i%perRow,rowCount=Math.min(perRow,total-row*perRow),half=(rowCount-1)*spacing/2,center=Math.max(12+half,Math.min(W-12-half,state.x)),offset=(column-(rowCount-1)/2)*spacing,toX=center+offset,toY=Math.min(H-20,baseY+row*75+Math.abs(offset)*.3),copy=i%copies,side=copy===1?-1:1,origin=copy?baseDronePosition(side):state;state.mines.push({x:origin.x,y:origin.y-12,fromX:origin.x,fromY:origin.y-12,toX,toY,flight:0,duration,arm:gameStat('mineArmingTime',.35),life:gameStat('mineLifetime',7),...(copy?{damageScale:illusionCopyRatio()/2}:{})});}
  state.mineTimer=Math.max(augmentStat('cross','minimumInterval',1.4),augmentStat('cross','baseInterval',3.2)-level*augmentStat('cross','intervalReduction',.22));
 }
 for(const mine of state.mines){
  if(mine.duration&&mine.flight<mine.duration){mine.flight=Math.min(mine.duration,mine.flight+dt);const t=mine.flight/mine.duration;mine.x=mine.fromX+(mine.toX-mine.fromX)*t;mine.y=mine.fromY+(mine.toY-mine.fromY)*t-Math.sin(t*Math.PI)*12;if(t<1)continue;mine.x=mine.toX;mine.y=mine.toY;continue;}
  mine.arm-=dt;mine.life-=dt;if(mine.arm>0||mine.life<=0)continue;
  const targets=state.enemies.filter(e=>!e.dead&&e.hp>0&&Math.hypot(e.x-mine.x,e.y-mine.y)<34+e.r),shots=(state.enemyShots||[]).filter(shot=>!shot.dead&&!shot.laser&&shot.source!=='boss'),contact=shots.some(shot=>{const vx=(shot.vx||0)*dt,vy=(shot.vy||0)*dt,den=vx*vx+vy*vy,t=den?Math.max(0,Math.min(1,((mine.x-shot.x)*vx+(mine.y-shot.y)*vy)/den)):0;return Math.hypot(shot.x+vx*t-mine.x,shot.y+vy*t-mine.y)<12+(shot.r||0);});if(!targets.length&&!contact)continue;
  for(const enemy of targets)damageEnemy(enemy,state.power*(augmentStat('cross','baseDamage',.8)+level*augmentStat('cross','damagePerLevel',.35))*(mine.damageScale??1));
  for(const shot of shots)if(Math.hypot(shot.x-mine.x,shot.y-mine.y)<42+(shot.r||0))shot.dead=true;
  if(contact)for(const shot of shots){const vx=(shot.vx||0)*dt,vy=(shot.vy||0)*dt,den=vx*vx+vy*vy,t=den?Math.max(0,Math.min(1,((mine.x-shot.x)*vx+(mine.y-shot.y)*vy)/den)):0;if(Math.hypot(shot.x+vx*t-mine.x,shot.y+vy*t-mine.y)<12+(shot.r||0))shot.dead=true;}
  state.skillEffects.push({type:'mineExplosion',x:mine.x,y:mine.y,life:.72,maxLife:.72,radius:42});mine.life=0;
 }
 state.mines=state.mines.filter(mine=>mine.life>0&&mine.y<H+20);
}

// Bomb pod targets a nearby cluster and resolves splash after the visible flight.
function launchSplashBomb(){const range=190,radius=Math.min(85,45+state.weaponLevels.pulse*5),candidates=state.enemies.filter(e=>!e.dead&&e.hp>0&&e.x>0&&e.x<W&&e.y>0&&e.y<H&&Math.hypot(e.x-state.x,e.y-state.y)<=range);if(!candidates.length)return;if(typeof window!=='undefined')window.GameAudio?.effect('auxShot');let target=candidates[0],best=-1;for(const enemy of candidates){let count=0;for(const other of candidates)if(Math.hypot(other.x-enemy.x,other.y-enemy.y)<=radius+(other.r||0))count++;if(count>best){target=enemy;best=count;}}state.grenades.push({x:state.x,y:state.y-12,fromX:state.x,fromY:state.y-12,toX:target.x,toY:target.y,time:0,duration:.5,radius,damage:state.auxPower*(augmentStat('pulse','baseDamage',1)+state.weaponLevels.pulse*augmentStat('pulse','damagePerLevel',.5))});state.pulseTimer=augmentStat('pulse','interval',3.5);}
function updateSplashBombs(dt){for(const bomb of state.grenades){bomb.time+=dt;const t=Math.min(1,bomb.time/bomb.duration);bomb.x=bomb.fromX+(bomb.toX-bomb.fromX)*t;bomb.y=bomb.fromY+(bomb.toY-bomb.fromY)*t-Math.sin(t*Math.PI)*20;if(t<1)continue;for(const enemy of state.enemies){if(enemy.dead||enemy.hp<=0)continue;const distance=Math.hypot(enemy.x-bomb.toX,enemy.y-bomb.toY);if(distance<bomb.radius+enemy.r){const ratio=Math.max(.5,1-.5*Math.min(distance/bomb.radius,1));damageEnemy(enemy,bomb.damage*ratio);}}state.skillEffects.push({type:'mineExplosion',x:bomb.toX,y:bomb.toY,life:.72,maxLife:.72,radius:bomb.radius});bomb.done=true;}state.grenades=state.grenades.filter(bomb=>!bomb.done);}
// Level progression is capped to keep movement controllable and enemy pressure bounded.
function enemyDefense(enemyLevel){return Math.min(.35,Math.max(0,enemyLevel-1)*.04);}
// Bombs weaken mid-bosses but cannot deal their final blow.
function applyBombDamage(enemy){if(enemy.bombImmune||enemy.dead||enemy.hp<=0)return;if(enemy.miniBoss){const remaining=Math.min(1,enemy.hp),multiplier=Math.max(.01,1-(enemy.defense||0));damageEnemy(enemy,Math.min(gameStat('miniBossBombDamage',12),Math.max(0,enemy.hp-remaining)/multiplier),false);}else damageEnemy(enemy,enemy.boss?35:20,false);}
function damageEnemy(enemy,raw,copy=true){if(enemy.miniBoss&&enemy.entryProtection>0)return;const damage=Math.max(0,raw*(1-(enemy.defense||0))),effective=Math.min(Math.max(0,enemy.hp),damage);enemy.hp-=damage;if(enemy.boss&&effective>0)enemy.hitFlash=.14;if(enemy.boss&&typeof state!=='undefined'&&state&&!enemy.dead){const score=(enemy.damageScoreCarry||0)+effective;const points=Math.floor(score);state.score+=points;enemy.damageScoreCarry=score-points;}}
function waveNumber(time){return Math.min(3,1+Math.floor(Math.max(0,time)/60));}
function bossPhase(hp,maxHp){return hp<=maxHp/3?3:hp<=maxHp*2/3?2:1;}
function playerSpeed(level){return (gameStat('baseSpeed',180)+Math.min(gameStat('maxSpeedBonus',60),Math.max(0,level-1)*gameStat('speedPerLevel',5)))*(typeof state!=='undefined'&&state?.shipId==='manta'?gameStat('shipMantaSpeedMultiplier',1.1):1);}
function spawnInterval(level,wave=1){const base=Math.max(gameStat('spawnMinInterval',.32),gameStat('spawnBaseInterval',.62)-Math.max(0,level-1)*gameStat('spawnLevelReduction',.02));return base*Math.pow(gameStat('spawnWaveMultiplier',.9),Math.max(0,Math.min(2,wave-1)))*gameStat('normalSpawnIntervalMultiplier',1.25);}
function collectDrops(dt,stationary=false){
 for(const d of state.drops){if(!stationary)d.y+=35*dt;const canCollect=canCollectDrop(d),dist=Math.hypot(state.x-d.x,state.y-d.y);if(canCollect&&dist<110+state.magnet){d.x+=(state.x-d.x)*Math.min(1,dt*5);d.y+=(state.y-d.y)*Math.min(1,dt*5);}if(canCollect&&dist<18){d.dead=true;if(d.shield||d.bomb)window.GameAudio?.effect('pickup');if(d.shield){state.shield=1;notice('실드 +1');}else if(d.bomb){state.bombs++;notice('폭탄 +1');}else{state.xp+=gameStat('xpPerPickup',1.25)*(d.xpMultiplier||1)*(state.shipId==='ark'?gameStat('shipArkXpMultiplier',1.12):1);if(state.xp>=state.need){state.drops=state.drops.filter(item=>!item.dead&&item.y<H+20);levelUp();return;}}}}
 state.drops=state.drops.filter(d=>!d.dead&&d.y<H+20);
}
function canCollectDrop(drop){return drop.shield?state.shield<1:drop.bomb?state.bombs<3:true;}
function fireRegroupVolley(multiplier=1){const level=state.weaponLevels.regroup||1;for(const side of [-1,1]){const pos=baseDronePosition(side),target=baseDroneTarget(side);if(!target)continue;const angle=Math.atan2(target.y-pos.y,target.x-pos.x),speed=320;state.bullets.push({x:pos.x,y:pos.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,angle,aimed:true,baseDrone:true,auxiliary:true,absoluteDamage:Math.min(state.power*gameStat('regroupDamageCap',.32),state.auxPower*(augmentStat('regroup','baseDamage',.25)+level*augmentStat('regroup','damagePerLevel',.035)))*multiplier});}}
function triggerNearFuse(){const level=state.weaponLevels.near_fuse||1,radius=gameStat('nearFuseBlastRadius',90),damage=state.auxPower*(augmentStat('near_fuse','baseDamage',1)+level*augmentStat('near_fuse','damagePerLevel',.25));for(const e of state.enemies)if(!e.dead&&e.hp>0&&Math.hypot(e.x-state.x,e.y-state.y)<radius+(e.r||0))damageEnemy(e,damage,false);state.skillEffects.push({type:'nova',x:state.x,y:state.y,radius,life:.4,maxLife:.4});state.grazeCharge=0;state.grazeCooldown=augmentStat('near_fuse','interval',5);if(state.activeSkills.includes('ace_squadron')){fireRegroupVolley(1);for(const side of [-1,1])state.bullets.push({x:state.x+side*22,y:state.y-10,vx:side*18,damage:gameStat('aceSquadronMissileDamage',.45),auxiliary:true,projectileKind:'rocket',empowered:true});}}
function updateEscortAugments(dt,moving){state.grazeCooldown=Math.max(0,(state.grazeCooldown||0)-dt);state.regroupMotion=Math.max(0,(state.regroupMotion||0)-dt);state.afterimageTimer=Math.max(0,(state.afterimageTimer||0)-dt);state.regroupTimer=Math.max(0,(state.regroupTimer||0)-dt);state.phantoms=state.phantoms||[];if(state.weaponLevels.afterimage&&moving&&state.afterimageTimer<=0){state.phantoms.push({x:state.x,y:state.y,delay:gameStat('afterimageDelay',.55),life:gameStat('afterimageLife',.9),fired:false});state.afterimageTimer=augmentStat('afterimage','interval',1.4);}for(const p of state.phantoms){p.life-=dt;p.delay-=dt;if(!p.fired&&p.delay<=0){p.fired=true;state.bullets.push({x:p.x,y:p.y-12,vx:0,auxiliary:true,projectileKind:'rocket',damage:augmentStat('afterimage','baseDamage',.55)+(state.weaponLevels.afterimage||0)*augmentStat('afterimage','damagePerLevel',.12)});}}state.phantoms=state.phantoms.filter(p=>p.life>0);if(state.weaponLevels.regroup&&state.regroupTimer<=0&&state.enemies.some(e=>!e.dead&&e.hp>0&&e.y>0&&e.y<H)){state.regroupMotion=gameStat('regroupDuration',.9);fireRegroupVolley();state.regroupTimer=augmentStat('regroup','interval',7);}}
function update(dt){
  if(state.stageSequence)return;
  if(state.xp>=state.need){levelUp();return;}
  for(const enemy of state.enemies)if(enemy.hitFlash>0)enemy.hitFlash=Math.max(0,enemy.hitFlash-dt);
  if(state.shieldBreak){state.shieldBreak.life-=dt;if(state.shieldBreak.life<=0)state.shieldBreak=null;}
  state.t+=dt;state.totalTime+=dt;state.bombCooldown=Math.max(0,state.bombCooldown-dt);state.skillFlash=Math.max(0,state.skillFlash-dt);for(const effect of state.skillEffects)effect.life-=dt;state.skillEffects=state.skillEffects.filter(effect=>effect.life>0);state.bombFlash=Math.max(0,state.bombFlash-dt);for(const part of state.debris){part.x+=part.vx*dt;part.y+=part.vy*dt;part.vy+=90*dt;part.rotation+=part.spin*dt;part.life-=dt;}state.debris=state.debris.filter(part=>part.life>0);const illusionBulletStart=state.bullets.length;const illusionGrenadeStart=state.grenades.length;const keyX=(heldKeys.has('d')?1:0)-(heldKeys.has('a')?1:0),keyY=(heldKeys.has('s')?1:0)-(heldKeys.has('w')?1:0);let moveX=state.joyX+keyX,moveY=state.joyY+keyY;const moveLength=Math.hypot(moveX,moveY);if(moveLength>1){moveX/=moveLength;moveY/=moveLength;}updatePlayerTilt(moveX,dt);updateEscortAugments(dt,Math.hypot(moveX,moveY)>.1);state.x=Math.max(20,Math.min(W-20,state.x+moveX*playerSpeed(state.level)*dt));state.y=Math.max(85,Math.min(H-20,state.y+moveY*playerSpeed(state.level)*dt));state.fastTimer-=dt;state.inv=Math.max(0,state.inv-dt);state.fire-=dt;state.spawn-=dt;
  if(state.fire<=0){state.fire=Math.max(augmentStat('rate','minimumInterval',.12),.34-state.rate*augmentStat('rate','intervalDecrease',.035));fireForwardVolley();window.GameAudio?.effect('mainShot');}updateBaseDrones(dt);state.extraWeaponTimers=state.extraWeaponTimers||{};for(const w of extraWeapons){const level=state.weaponLevels[w.id]||0;if(!level)continue;state.extraWeaponTimers[w.id]=(state.extraWeaponTimers[w.id]||0)-dt;if(state.extraWeaponTimers[w.id]>0)continue;const targets=w.homing?state.enemies.filter(e=>!e.dead&&e.hp>0&&e.y>0&&e.y<H).sort((a,b)=>w.id==='a_pair'?b.hp-a.hp:Math.hypot(a.x-state.x,a.y-state.y)-Math.hypot(b.x-state.x,b.y-state.y)):[];if(w.homing&&!targets.length)continue;const n=w.id==='a_barrage'?Math.floor(gameStat('barrageMissileCount',6)):w.count,launchSpacing=w.id==='a_barrage'?gameStat('barrageLaunchSpacing',.12):.12,damage=augmentStat(w.id,'baseDamage',1)+level*augmentStat(w.id,'damagePerLevel',.15);for(let i=0;i<n;i++){const k=i-(n-1)/2,vx=w.id==='m_sweep'?Math.sin(state.t*2)*w.spread:k*w.spread;const origin=weaponLaunchPoint(w.id,i,n),shot={x:origin.x,y:origin.y,vx,damage,projectileKind:w.homing?'swarm':'extra',weaponId:w.id,auxiliary:w.group==='aux'};if(w.pierce){shot.rail=true;shot.hit=new Set();}if(w.id==='m_side')shot.x=Math.max(8,Math.min(W-8,state.x+(i===0?-34:34)));if(!w.homing||i===0)weaponMuzzle(shot,w.id);if(w.id==='m_burst')shot.burstPulse=true;if(w.id==='m_wave'||w.id==='a_spread'){shot.waveAge=0;shot.wavePhase=i*Math.PI/2;}if(w.id==='m_heavy'||w.id==='a_cannon'){shot.splashRadius=w.id==='m_heavy'?28:38;}if(w.id==='a_scatter')shot.splashRadius=17;if(w.id==='a_barrage'){shot.splashRadius=gameStat('barrageSplashRadius',24);shot.splashFactor=augmentStat('a_barrage','damageFalloff',.25);}if(w.homing){shot.missile=true;shot.delay=i*launchSpacing;shot.launchId=w.id;shot.launchIndex=i;shot.launchCount=n;shot.target=w.id==='a_pair'?targets[0]:targets[i%targets.length];if(w.id==='a_wing'){shot.launchSide=i===0?-1:1;shot.launchAge=0;}}state.bullets.push(shot);if(w.id==='m_burst')state.bullets.push({...shot,delay:.14});}state.extraWeaponTimers[w.id]=Math.max(augmentStat(w.id,'interval',w.interval),w.homing?n*launchSpacing:0);}state.rocketTimer-=dt;state.swarmTimer-=dt;if(state.weaponLevels.rocket&&state.rocketTimer<=0){const count=Math.min(8,state.weaponLevels.rocket);for(let i=0;i<count;i++)state.bullets.push({...weaponLaunchPoint('rocket',i,count),vx:(i-(count-1)/2)*8,projectileKind:'rocket',damage:augmentStat('rocket','baseDamage',.75)+state.weaponLevels.rocket*augmentStat('rocket','damagePerLevel',.15)});state.rocketTimer=augmentStat('rocket','interval',2);}if(state.weaponLevels.swarm&&state.swarmTimer<=0){const targets=state.enemies.filter(e=>!e.dead&&e.hp>0&&e.y>0&&e.y<H).sort((a,b)=>Math.hypot(a.x-state.x,a.y-state.y)-Math.hypot(b.x-state.x,b.y-state.y));if(targets.length){const count=Math.min(8,2+state.weaponLevels.swarm);for(let i=0;i<count;i++)state.bullets.push({...weaponLaunchPoint('swarm',i,count),missile:true,projectileKind:'swarm',weaponId:'swarm',delay:i*.12,launchId:'swarm',launchIndex:i,launchCount:count,target:targets[i%targets.length],damage:augmentStat('swarm','baseDamage',.65)+state.weaponLevels.swarm*augmentStat('swarm','damagePerLevel',.15)});state.swarmTimer=Math.max(augmentStat('swarm','interval',2.8),count*.12);window.GameAudio?.effect('auxShot');}}state.cannonTimer-=dt;state.droneTimer-=dt;state.bladeTimer-=dt;if(state.weaponLevels.cannon&&state.cannonTimer<=0){state.bullets.push({...weaponLaunchPoint('cannon'),vx:0,projectileKind:'cannon',damage:augmentStat('cannon','baseDamage',2)+state.weaponLevels.cannon*augmentStat('cannon','damagePerLevel',.6)});state.cannonTimer=augmentStat('cannon','interval',1.4);}if(state.weaponLevels.drone&&state.droneTimer<=0){const target=state.enemies.filter(e=>!e.dead&&e.y>0&&e.y<H).sort((a,b)=>Math.hypot(a.x-state.x,a.y-state.y)-Math.hypot(b.x-state.x,b.y-state.y))[0];if(target){window.GameAudio?.effect('auxShot');const count=state.activeSkills.includes('wingman')?2:1;if(count===2)state.skillEffects.push({x:state.x,y:state.y,life:.3,maxLife:.3,color:'#93f7ff',radius:35});for(let i=0;i<count;i++)state.bullets.push({...weaponLaunchPoint('drone',i,count),missile:true,projectileKind:'drone',delay:i*.12,launchId:'drone',launchIndex:i,launchCount:count,empowered:count===2,target,damage:augmentStat('drone','baseDamage',.5)+state.weaponLevels.drone*augmentStat('drone','damagePerLevel',.25)});state.droneTimer=Math.max(augmentStat('drone','interval',1.6),count*.12);}}
  if(state.spawn<=0&&state.t<duration){const count=Math.min(6,1+waveNumber(state.t)+Math.floor((state.stage-1)/2)+Math.min(1,state.round-1));for(let i=0;i<count&&state.enemies.length<gameStat('normalEnemyMaxCount',45);i++)spawn();state.spawn=spawnInterval(state.level,waveNumber(state.t));}
  if(state.fastTimer<=0&&state.t<duration){const x=35+Math.random()*330;state.enemies.push({x,y:-25,hp:gameStat('enemyFastHp',3)*gameStat('normalEnemyHpMultiplier',.8)*stageDifficulty(state.stage,state.round),maxHp:gameStat('enemyFastHp',3)*gameStat('normalEnemyHpMultiplier',.8)*stageDifficulty(state.stage,state.round),enemyLevel:1+(state.level-1)*.5,defense:Math.min(.60,enemyDefense(1+(state.level-1)*.5)+Math.min(.25,(state.round-1)*.03)),speed:enemyStageSpeed(235,state.stage,state.round),r:12,kind:'fast',phase:0});state.fastTimer=16+Math.random()*8;systemNotice('고속 적 출현!');}
  if(state.t>=duration&&!state.boss&&state.miniBossSpawned>=2&&!state.enemies.some(e=>e.miniBoss&&!e.dead&&e.hp>0)){state.boss=true;window.GameAudio?.setScene('boss');window.GameAudio?.effect('boss');const bossHp=gameStat('bossHp',4500)*stageDifficulty(state.stage,state.round);state.enemies.push({x:200,y:-45,hp:bossHp,maxHp:bossHp,defense:Math.min(.60,gameStat('bossDefense',.45)+(state.round-1)*.03),speed:80,r:48,boss:true,type:bossTypeFor(state.stage,state.round),shot:2.6,phase:0,combatPhase:1,pattern:0,attackTurn:0,bossTime:0,enraged:false,lockedX:200});const name=BOSS_TYPES[bossTypeFor(state.stage,state.round)].name;systemNotice(name+' 출현!');if(state.storyEnabled){showStory(gameDialogue('bossIntro',[{who:'관제사 미라',portrait:'mira',text:'{boss} 포착! 탄막 사이의 빈틈을 찾아요. 시간이 지나면 광폭화하니 조심하세요!'}],{boss:name}),()=>{resume();showEncounterWarning('보스 출현',name);});}else showEncounterWarning('보스 출현',name);}
  if(!state.boss&&state.miniBossSpawned<2&&!state.enemies.some(e=>e.miniBoss&&!e.dead&&e.hp>0)&&state.t>=[gameStat('miniBossFirstSpawn',70),gameStat('miniBossSecondSpawn',130)][state.miniBossSpawned]){state.miniBossSpawned++;spawnMidBoss();}
  state.buildingTimer-=dt;if(state.buildingTimer<=0&&state.t<duration&&!state.boss){spawnGroundTurret(Math.random()<.35);state.buildingTimer=20+Math.random()*6;}for(const wreck of state.wrecks)wreck.y+=70*dt;state.wrecks=state.wrecks.filter(wreck=>wreck.y<H+40);
  updateProximityMines(dt);
  state.orbitAngle+=dt*2.5;state.missileTimer-=dt;state.pulseTimer-=dt;state.railTimer-=dt;state.lightningTimer-=dt;for(const arc of state.arcs)arc.life-=dt;state.arcs=state.arcs.filter(arc=>arc.life>0);
  if(state.weaponLevels.rail&&state.railTimer<=0){window.GameAudio?.effect('auxShot');const level=state.weaponLevels.rail;state.flames.push({life:.68,maxLife:.68,range:H*.5,halfWidth:100,damage:state.auxPower*(augmentStat('rail','baseDamage',1)+level*augmentStat('rail','damagePerLevel',.5))*.32*(state.activeSkills.includes('breaker')?2:1),hits:new Map()});if(state.weaponLevels.repair){const flame=state.flames[state.flames.length-1];for(const side of [-1,1])state.flames.push({...flame,side,range:flame.range*.8,halfWidth:flame.halfWidth*.6,damage:flame.damage*illusionCopyRatio()/2,hits:new Map()});}state.railTimer=Math.max(augmentStat('rail','minimumInterval',.65),augmentStat('rail','baseInterval',1.8)-level*augmentStat('rail','intervalReduction',.2));}
  state.novaTimer-=dt;state.boomerangTimer-=dt;
  if(state.weaponLevels.nova&&state.novaTimer<=0){const level=state.weaponLevels.nova,r=Math.min(145,90+level*10),damage=state.auxPower*(augmentStat('nova','baseDamage',1.5)+level*augmentStat('nova','damagePerLevel',.45))*(state.activeSkills.includes('singularity')?2:1);for(const enemy of state.enemies)if(!enemy.dead&&enemy.hp>0&&Math.hypot(enemy.x-state.x,enemy.y-state.y)<r+enemy.r)damageEnemy(enemy,damage);if(state.weaponLevels.repair)for(const side of [-1,1]){const origin=baseDronePosition(side);for(const enemy of state.enemies)if(!enemy.dead&&enemy.hp>0&&Math.hypot(enemy.x-origin.x,enemy.y-origin.y)<r+enemy.r)damageEnemy(enemy,damage*illusionCopyRatio()/2,false);state.skillEffects.push({type:'nova',x:origin.x,y:origin.y,radius:r,life:.5,maxLife:.5});}state.skillEffects.push({type:'nova',x:state.x,y:state.y,radius:r,life:.5,maxLife:.5});state.novaTimer=augmentStat('nova','interval',3.4);window.GameAudio?.effect('auxShot');}
  if(state.weaponLevels.boomerang&&state.boomerangTimer<=0){const level=state.weaponLevels.boomerang,targets=state.enemies.filter(e=>!e.dead&&e.hp>0&&e.y>0&&e.y<H);if(targets.length){let target=targets[0],best=-1;for(const e of targets){const count=targets.filter(other=>Math.hypot(other.x-e.x,other.y-e.y)<75).length;if(count>best){best=count;target=e;}}const radius=45+Math.min(25,level*5),damage=state.auxPower*(augmentStat('boomerang','baseDamage',1.1)+level*augmentStat('boomerang','damagePerLevel',.35));for(const e of targets)if(Math.hypot(e.x-target.x,e.y-target.y)<radius+e.r)damageEnemy(e,damage);if(state.weaponLevels.repair)for(const side of [-1,1]){const origin=baseDronePosition(side);state.arcs.push({x:origin.x,y:origin.y,tx:target.x,ty:target.y,life:.2});for(const e of targets)if(Math.hypot(e.x-target.x,e.y-target.y)<radius+e.r)damageEnemy(e,damage*illusionCopyRatio()/2,false);}state.skillEffects.push({type:'mineExplosion',x:target.x,y:target.y,life:.72,maxLife:.72,radius});state.boomerangTimer=augmentStat('boomerang','interval',2.2);window.GameAudio?.effect('explosion');}}
  if(state.weaponLevels.lightning&&state.lightningTimer<=0)fireChainLightning();
  if(state.weaponLevels.missile&&state.missileTimer<=0){const target=state.enemies.filter(e=>!e.dead&&e.y>0).sort((a,b)=>Math.hypot(a.x-state.x,a.y-state.y)-Math.hypot(b.x-state.x,b.y-state.y))[0];if(target){window.GameAudio?.effect('auxShot');const empowered=state.activeSkills.includes('guided'),count=Math.min(5,state.weaponLevels.missile+(empowered?1:0));if(empowered)state.skillEffects.push({x:state.x,y:state.y,life:.35,maxLife:.35,color:'#ffce72',radius:40});for(let i=0;i<count;i++)state.bullets.push({...weaponLaunchPoint('missile',i,count),vx:0,missile:true,projectileKind:'missile',delay:i*.12,launchId:'missile',launchIndex:i,launchCount:count,empowered,target,angle:-Math.PI/2+(i-(count-1)/2)*.12,trail:[],damage:(augmentStat('missile','baseDamage',1.5)+state.weaponLevels.missile*augmentStat('missile','damagePerLevel',.5))/(1+.3*(count-1))});state.missileTimer=Math.max(count*.12,augmentStat('missile','minimumInterval',.55),augmentStat('missile','baseInterval',2.2)-state.weaponLevels.missile*augmentStat('missile','intervalReduction',.3));}}
  if(state.weaponLevels.pulse&&state.pulseTimer<=0)launchSplashBomb();
  if(illusionCopyRatio()){const ratio=illusionCopyRatio()/2;for(const bomb of state.grenades.slice(illusionGrenadeStart))for(const side of [-1,1]){const origin=baseDronePosition(side);state.grenades.push({...bomb,x:origin.x,y:origin.y,fromX:origin.x,fromY:origin.y,damage:bomb.damage*ratio,illusion:true});}}
  updateSplashBombs(dt);
  copyDroneProjectiles(illusionBulletStart);
  for(const b of state.bullets){if(b.delay>0){b.delay=Math.max(0,b.delay-dt);if(b.launchId){const origin=b.illusionDroneSide?baseDronePosition(b.illusionDroneSide):weaponLaunchPoint(b.launchId,b.launchIndex,b.launchCount);b.x=origin.x;b.y=origin.y-(b.illusionDroneSide?8:0);if(b.delay===0)weaponMuzzle(origin,b.weaponId||b.launchId);}continue;}if(b.boomerang){b.age+=dt;if(b.age<.7){b.x+=Math.sin(b.angle)*160*dt;b.y=Math.max(0,b.y-Math.cos(b.angle)*160*dt);}else{const dx=state.x-b.x,dy=state.y-b.y,d=Math.hypot(dx,dy)||1;b.x+=dx/d*320*dt;b.y+=dy/d*320*dt;if(d<16||b.age>2.4)b.dead=true;}}else if(b.flame){b.life-=dt;b.x+=b.vx*dt;b.y-=230*dt;if(b.life<=0)b.dead=true;}else if(b.missile){if(!b.target||b.target.dead||!state.enemies.includes(b.target)){b.target=state.enemies.filter(e=>!e.dead&&e.hp>0&&e.y>0&&e.y<H).sort((a,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y))[0];}if(b.target){const desired=Math.atan2(b.target.y-b.y,b.target.x-b.x);let angle=desired;if(b.missile){b.trail=b.trail||[];b.trailClock=(b.trailClock||0)+dt;if(b.trailClock>=.04){b.trailClock=0;b.trail.unshift({x:b.x,y:b.y});if(b.trail.length>6)b.trail.pop();}}if(b.projectileKind==='missile'){const previous=b.angle??desired,diff=Math.atan2(Math.sin(desired-previous),Math.cos(desired-previous));angle=previous+Math.max(-8*dt,Math.min(8*dt,diff));b.trail=b.trail||[];b.trail.unshift({x:b.x,y:b.y});if(b.trail.length>7)b.trail.pop();}if(b.weaponId==='a_wing'&&b.launchAge<.22){b.launchAge+=dt;angle=-Math.PI/2+b.launchSide*.55*(1-b.launchAge/.22);}b.angle=angle;const speed=b.weaponId==='a_rapid'?360:b.weaponId==='a_seeker'?315:b.weaponId==='a_hunter'?235:270;b.x+=Math.cos(angle)*speed*dt;b.y+=Math.sin(angle)*speed*dt;}else{b.dead=true;}}else if(b.aimed){b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x< -20||b.x>W+20||b.y>H+20)b.dead=true;}else{const previous=b.waveAge||0;if(b.waveAge!==undefined)b.waveAge+=dt;const speed=b.weaponId==='m_heavy'?290:b.weaponId==='a_cannon'?260:b.weaponId==='m_pierce'?500:420;b.y-=speed*dt;b.x+=b.vx*dt;if(b.waveAge!==undefined)b.x+=(Math.sin(b.waveAge*9+b.wavePhase)-Math.sin(previous*9+b.wavePhase))*9;}}
  for(const flame of state.flames)flame.life-=dt;state.flames=state.flames.filter(flame=>flame.life>0);
  for(const p of state.pulses)p.life-=dt;state.pulses=state.pulses.filter(p=>p.life>0);
  const satellites=[];for(let i=0;i<state.weaponLevels.orbit;i++){const angle=state.orbitAngle+i*Math.PI*2/state.weaponLevels.orbit;satellites.push({x:state.x+Math.cos(angle)*48,y:state.y+Math.sin(angle)*48});}if(state.weaponLevels.repair)for(const side of [-1,1]){const origin=baseDronePosition(side);for(let i=0;i<state.weaponLevels.orbit;i++){const angle=state.orbitAngle+i*Math.PI*2/state.weaponLevels.orbit;satellites.push({x:origin.x+Math.cos(angle)*36,y:origin.y+Math.sin(angle)*36,illusionSide:side});}}state.satellites=satellites;const saws=[];const sawCount=Math.min(5,state.weaponLevels.blade);for(let i=0;i<sawCount;i++){const angle=-state.orbitAngle*1.3+i*Math.PI*2/sawCount;saws.push({x:state.x+Math.cos(angle)*68,y:state.y+Math.sin(angle)*68,angle:state.t*9});}if(state.weaponLevels.repair)for(const side of [-1,1]){const origin=baseDronePosition(side);for(let i=0;i<sawCount;i++){const angle=-state.orbitAngle*1.3+i*Math.PI*2/sawCount;saws.push({x:origin.x+Math.cos(angle)*48,y:origin.y+Math.sin(angle)*48,angle:state.t*9,illusionSide:side});}}state.saws=saws;
  for(const e of state.enemies){
    if(e.miniBoss){if(e.y<125)e.y=Math.min(125,e.y+e.speed*dt);else{e.miniBossMoveTime=(e.miniBossMoveTime||0)+dt;e.x=W/2+Math.sin(e.miniBossMoveTime*Math.min(1.2,.35+e.speed/100))*100;}}else if(e.lateral){e.x+=e.direction*(e.speed+25)*dt;e.y+=e.speed*.08*dt;}else e.y+=e.speed*dt;if(e.kind==='hunter'&&!e.lateral){const dx=state.x-e.x;e.x+=Math.max(-55*dt,Math.min(55*dt,dx));}
    if(e.ground)updateTurretAim(e,dt);
    if(e.miniBoss&&e.entryProtection>0&&e.y>=40){if(!e.entryAnnounced){e.entryAnnounced=true;systemNotice('중간 보스 접근!');}e.entryProtection=Math.max(0,e.entryProtection-dt);}
    if(e.miniBoss&&e.entryProtection<=0&&e.y>40&&e.y<H-100){e.outerShot-=dt;e.innerShot-=dt;if(e.outerShot<=0){fireMiniBossRing(e,false);e.outerShot=gameStat('miniBossOuterInterval',2.3);}if(e.innerShot<=0){fireMiniBossRing(e,true);e.innerShot=gameStat('miniBossInnerInterval',1.65);}}
    if(e.boss&&e.y>125){e.y=125;e.speed=0;e.x=200+Math.sin(state.t*(.8+e.combatPhase*.15))*105;}if(e.boss){if(e.y>=125){e.bossTime+=dt;if(!e.enraged&&e.bossTime>=bossEnrageTimes(state.stage,state.round).first){e.enraged=true;e.enrageSirenTimer=0;systemNotice('광폭화! 공격 속도 증가',true);}if(e.enraged&&!e.enrageLevel)e.enrageLevel=1;if(e.enrageLevel===1&&e.bossTime>=bossEnrageTimes(state.stage,state.round).second){e.enrageLevel=2;e.enrageSirenTimer=0;systemNotice('2차 광폭화! 공격 강화',true);}if(e.enraged){e.enrageSirenTimer=(e.enrageSirenTimer||0)-dt;if(e.enrageSirenTimer<=0){window.GameAudio?.effect('siren');e.enrageSirenTimer=1.4;}}}const phase=bossPhase(e.hp,e.maxHp);while(phase>e.combatPhase){e.combatPhase++;const side=e.combatPhase===2?-1:1;state.debris.push({x:e.x+side*60,y:e.y,vx:side*55,vy:45,life:2,maxLife:2,side,type:e.type,rotation:0,spin:side*1.5});burst(e.x+side*55,e.y,'#ffad5a');e.shot=2;e.pendingRows=[];e.pendingExtras=[];state.enemyShots=[];systemNotice(e.combatPhase===2?'PHASE 2 · 왼쪽 파츠 파괴!':'PHASE 3 · 오른쪽 파츠 파괴!');}}
    if(e.boss){updateBossInheritedRings(e,dt,bossPhase(e.hp,e.maxHp));releaseBossRows(e,dt);}
    if((['shooter','gunner','salvo','venom','side','turret'].includes(e.kind)&&e.y>40&&e.y<H-100&&e.x>0&&e.x<W)||(e.boss&&e.y>=125)){
      e.shot-=dt;
      if(e.shot<=.65&&e.shot>0){if(!e.phase)e.lockedX=state.x;e.phase=1;}
      if(e.shot<=0){const aim=Math.atan2(e.lockedX-e.x,state.y-e.y);if(e.boss){const phase=bossPhase(e.hp,e.maxHp);const interval=fireBossVolley(e,phase);releaseBossRows(e,dt);e.shot=interval*(e.enrageLevel>=2?.55:e.enraged?.75:1);}else if(e.kind==='side'){const count=waveNumber(state.t);for(let i=0;i<count;i++)fireEnemy(e.x,e.y,aim+(i-(count-1)/2)*.19,145);e.shot=1.8;}else if(e.kind==='turret'){const barrel=e.turretAngle||0;for(const offset of [-.25,0,.25])fireEnemy(e.x+Math.sin(barrel)*18,e.y+Math.cos(barrel)*18,barrel+offset,118);e.shot=2.5;}else if(e.kind==='miniboss'){for(let i=-3;i<=3;i++)if(i!==0)fireEnemy(e.x,e.y,aim+i*.20,140);e.shot=2.1;}else if(e.kind==='gunner'){fireEnemy(e.x,e.y,aim,140);e.burst=(e.burst||0)+1;e.shot=e.burst<4?.30:2.8;if(e.burst>=4)e.burst=0;}else if(e.kind==='salvo'){for(let i=-6;i<=6;i++)if(i!==0)fireEnemy(e.x,e.y,i*.16,125);e.shot=3.4;}else{const spread=state.t>=100?4:state.t>=55?3:2;for(let i=-spread-1;i<=spread+1;i++)if(i!==0)fireEnemy(e.x,e.y,aim+i*.21,120+Math.min(15,state.t*.08));e.shot=state.t>=100?1.65:2;}e.phase=0;}
    }
    for(const b of state.bullets){if(!b.dead&&!b.delay&&(!e.miniBoss||!(e.entryProtection>0))&&(!b.missile||b.target===e)&&(!b.rail||!b.hit.has(e))&&Math.hypot(b.x-e.x,b.y-e.y)<e.r+4){if(b.rail){b.hit.add(e);if(b.baseDrone&&b.hit.size>=2)b.dead=true;}else b.dead=true;if(b.splashRadius&&!b.splashDone){b.splashDone=true;for(const other of state.enemies)if(other!==e&&!other.dead&&other.hp>0&&Math.hypot(other.x-e.x,other.y-e.y)<b.splashRadius+(other.r||0))damageEnemy(other,(b.auxiliary?state.auxPower:state.power)*(b.damage??1)*(b.splashFactor??.35),true);}if(b.weaponId==='a_barrage')state.skillEffects.push({type:'guidedImpact',x:e.x,y:e.y,life:.22,maxLife:.22,empowered:false});if(b.weaponId)state.skillEffects.push({type:'weaponImpact',weaponId:b.weaponId,x:e.x,y:e.y,life:.22,maxLife:.22});if(b.projectileKind==='missile')state.skillEffects.push({type:'guidedImpact',x:e.x,y:e.y,life:.25,maxLife:.25,empowered:b.empowered});else if(b.empowered)state.skillEffects.push({type:'guidedImpact',x:e.x,y:e.y,life:.36,maxLife:.36,empowered:true});if(b.railWeapon&&state.activeSkills.includes('breaker'))state.skillEffects.push({x:e.x,y:e.y,life:.3,maxLife:.3,color:'#ffcf78',radius:28});damageEnemy(e,(b.absoluteDamage??((b.auxiliary||b.missile&&!b.auxiliary?state.auxPower:state.power)*(b.damage??1)))*(b.railWeapon&&state.activeSkills.includes('breaker')?2:1),!!(!b.baseDrone&&(b.missile||b.rail||b.projectileKind==='cannon'))); }}
    for(const flame of state.flames){const origin=flame.side?baseDronePosition(flame.side):state,dy=origin.y-20-e.y,dx=Math.abs(e.x-origin.x),reach=Math.max(0,Math.min(flame.range,dy));if(dy>=-e.r&&dy<=flame.range+e.r&&dx<=12+flame.halfWidth*reach/flame.range+e.r&&(flame.hits.get(e)??-Infinity)<=state.t){damageEnemy(e,flame.damage);flame.hits.set(e,state.t+.22);}}
    e.sawCooldown=Math.max(0,(e.sawCooldown||0)-dt);if(!e.sawCooldown&&state.saws.some(saw=>!saw.illusionSide&&Math.hypot(saw.x-e.x,saw.y-e.y)<e.r+16)){damageEnemy(e,state.auxPower*(augmentStat('blade','baseDamage',.6)+state.weaponLevels.blade*augmentStat('blade','damagePerLevel',.2)));e.sawCooldown=augmentStat('blade','interval',.55);state.skillEffects.push({type:'sawHit',x:e.x,y:e.y,life:.2,maxLife:.2,color:'#ffe29a',radius:13});}
    e.orbitCooldown=Math.max(0,(e.orbitCooldown||0)-dt);if(!e.orbitCooldown&&state.satellites.some(sat=>!sat.illusionSide&&Math.hypot(sat.x-e.x,sat.y-e.y)<e.r+8)){if(state.activeSkills.includes('storm'))state.skillEffects.push({x:e.x,y:e.y,life:.25,maxLife:.25,color:'#c0a0ff',radius:30});damageEnemy(e,state.auxPower*augmentStat('orbit','damageMultiplier',1)*(state.activeSkills.includes('storm')?2:1));e.orbitCooldown=augmentStat('orbit','hitInterval',.45);}
    if(state.weaponLevels.repair){for(const side of [-1,1]){const suffix=side<0?'L':'R',sc='illusionSaw'+suffix,oc='illusionOrbit'+suffix;e[sc]=Math.max(0,(e[sc]||0)-dt);e[oc]=Math.max(0,(e[oc]||0)-dt);if(!e[sc]&&state.saws.some(saw=>saw.illusionSide===side&&Math.hypot(saw.x-e.x,saw.y-e.y)<e.r+16)){damageEnemy(e,state.auxPower*(augmentStat('blade','baseDamage',.6)+state.weaponLevels.blade*augmentStat('blade','damagePerLevel',.2))*illusionCopyRatio()/2,false);e[sc]=augmentStat('blade','interval',.55);state.skillEffects.push({type:'sawHit',x:e.x,y:e.y,life:.2,maxLife:.2,color:'#ffe29a',radius:13});}if(!e[oc]&&state.satellites.some(sat=>sat.illusionSide===side&&Math.hypot(sat.x-e.x,sat.y-e.y)<e.r+8)){damageEnemy(e,state.auxPower*augmentStat('orbit','damageMultiplier',1)*(state.activeSkills.includes('storm')?2:1)*illusionCopyRatio()/2,false);e[oc]=augmentStat('orbit','hitInterval',.45);}}}
    if(e.hp<=0&&!e.dead){e.dead=true;if(e.kind==='deathburst')fireDeathBurst(e);window.GameAudio?.effect('explosion');if(e.ground)state.wrecks.push({x:e.x,y:e.y});burst(e.x,e.y,e.boss||e.ground?'#ffba7c':'#8fffe1');state.kills++;state.score+=e.kind==='scout'?10:30;state.coins++;if(e.boss)state.drops.push({x:e.x,y:e.y,xpMultiplier:gameStat('bossXpMultiplier',10)});else{if(e.miniBoss)state.drops.push({x:e.x,y:e.y,xpMultiplier:gameStat('miniBossXpMultiplier',4)});else if(shouldDrop('xp',state.kills))state.drops.push({x:e.x,y:e.y});if(shouldDrop('shield',state.kills))state.drops.push({x:e.x+12,y:e.y,shield:true});if(shouldDrop('bomb',state.kills))state.drops.push({x:e.x,y:e.y,bomb:true});}if(e.boss){clearStage(e);return;}}
    if(!e.dead&&!e.ground&&state.inv<=0&&Math.hypot(state.x-e.x,state.y-e.y)<e.r+12){takeHit();e.dead=!e.boss&&!e.miniBoss;if(state.finished||state.paused)return;}
  }
  for(const shot of state.enemyShots){if(shot.dead)continue;if(shot.laser){shot.life-=dt;shot.warning-=dt;if(shot.life<=0)shot.dead=true;if(shot.warning<=0&&shot.life>0&&state.inv<=0&&state.y>=shot.y&&Math.abs(state.x-shot.x)<shot.r+PLAYER_SHOT_HIT_RADIUS){takeHit();if(state.finished||state.paused)return;}continue;}shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;if(!shot.sawChecked&&state.saws.some(saw=>!saw.illusionSide&&Math.hypot(saw.x-shot.x,saw.y-shot.y)<16+(shot.r||0))){shot.sawChecked=true;if(Math.random()<.12){shot.dead=true;state.skillEffects.push({type:'sawHit',x:shot.x,y:shot.y,life:.2,maxLife:.2});continue;}}if(state.weaponLevels.near_fuse&&!shot.grazed&&state.inv<=0&&!projectileHitsPlayer(shot,state.x,state.y)&&Math.hypot(state.x-shot.x,state.y-shot.y)<(shot.r||0)+gameStat('nearFuseGrazeRadius',22)){shot.grazed=true;state.grazeCharge=(state.grazeCharge||0)+1;if(state.grazeCharge>=gameStat('nearFuseRequired',5)&&(state.grazeCooldown||0)<=0)triggerNearFuse();}if(state.inv<=0&&projectileHitsPlayer(shot,state.x,state.y)){shot.dead=true;takeHit();if(state.finished||state.paused)return;}}
  for(const particle of state.particles){particle.x+=particle.vx*dt;particle.y+=particle.vy*dt;particle.life-=dt;}
  collectDrops(dt,false);
  state.bullets=state.bullets.filter(b=>!b.dead&&b.y>-20);state.enemyShots=state.enemyShots.filter(b=>!b.dead&&b.y<H+20&&b.x>-20&&b.x<W+20);state.particles=state.particles.filter(p=>p.life>0);state.enemies=state.enemies.filter(e=>!e.dead&&e.y<H+40&&(!e.lateral||(e.direction>0?e.x<W+40:e.x>-40)));state.drops=state.drops.filter(d=>!d.dead&&d.y<H+20);
}
function drawStageLayer(ctx){
 const stage=state.stage,offset=(state.t*(42+stage*8))%96;
 const colors=['#6b9bb0','#57c5b1','#cb9b57','#c25a63','#bba0d1'];const c=colors[stage-1];
 ctx.save();if(stage>1){ctx.globalAlpha=.19;ctx.fillStyle=c;ctx.fillRect(0,0,W,H);}ctx.globalAlpha=.55;ctx.fillStyle=c;
 for(let y=-100+offset;y<H+100;y+=96){if(stage===1){ctx.fillRect(28,y,4,45);ctx.fillRect(W-32,y,4,45);}else if(stage===2){ctx.fillRect(24,y,9,62);ctx.fillRect(W-33,y,9,62);ctx.fillRect(28,y+12,28,3);ctx.fillRect(W-56,y+12,28,3);}else if(stage===3){ctx.fillRect(24+(y%2?6:0),y,18,18);ctx.fillRect(W-42,y+35,18,18);}else if(stage===4){ctx.fillRect(20,y,36,7);ctx.fillRect(W-56,y+42,36,7);ctx.fillRect(36,y,5,34);ctx.fillRect(W-41,y+15,5,34);}else{ctx.fillRect(25,y,18,6);ctx.fillRect(W-43,y,18,6);ctx.fillRect(48,y+22,7,27);ctx.fillRect(W-55,y+22,7,27);}}
 ctx.restore();if(state.round>1){ctx.fillStyle='rgba(150,20,30,'+Math.min(.25,.12+(state.round-2)*.025)+')';ctx.fillRect(0,0,W,H);}
}
// Pickup symbols use different silhouettes from hostile projectiles.
// Cover the sprite's fixed barrel with an armored mount and draw the aiming barrel separately.
function drawTurretBarrel(ctx,e){ctx.save();ctx.translate(Math.round(e.x),Math.round(e.y));ctx.fillStyle='#24333e';ctx.fillRect(-8,3,16,20);ctx.fillStyle='#42525b';ctx.fillRect(-7,4,14,3);ctx.fillStyle='#1c2a36';ctx.fillRect(-6,7,12,13);ctx.rotate(-(e.turretAngle||0));ctx.fillStyle='#111c28';ctx.fillRect(-5,-4,10,26);ctx.fillStyle='#526876';ctx.fillRect(-3,-3,6,20);ctx.fillStyle='#a2b3af';ctx.fillRect(-3,2,2,12);ctx.fillStyle='#20303a';ctx.fillRect(-5,16,10,6);ctx.fillStyle='#ca744b';ctx.fillRect(-2,18,4,2);ctx.fillStyle='#192936';ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b3533d';ctx.fillRect(-3,-3,6,6);ctx.fillStyle='#ffb877';ctx.fillRect(-1,-1,2,2);ctx.restore();}
// Ground wreck remains attached to the scrolling stage until it leaves view.
function drawTurretWreck(ctx,wreck){ctx.save();ctx.translate(Math.round(wreck.x),Math.round(wreck.y));ctx.fillStyle='#17202a';ctx.fillRect(-25,-20,50,40);ctx.fillStyle='#39434a';ctx.fillRect(-22,-17,44,34);ctx.fillStyle='#253039';ctx.fillRect(-17,-14,34,28);ctx.fillStyle='#6b5142';ctx.fillRect(-12,-10,7,5);ctx.fillRect(7,4,9,5);ctx.fillStyle='#bd693d';ctx.fillRect(-3,-3,5,5);ctx.fillStyle='#e1a16a';ctx.fillRect(-2,-2,2,2);ctx.strokeStyle='#10171c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-18,14);ctx.lineTo(-4,2);ctx.lineTo(2,8);ctx.lineTo(17,-9);ctx.stroke();ctx.restore();}
// Compact pixel-styled combat VFX, drawn below enemy projectiles for readability.
// Draw on a small canvas, then scale with nearest-neighbour sampling for crisp pixel flames.
let flamePixelCanvas=null;
function drawFlamethrower(ctx,flame){
 if(!flamePixelCanvas){flamePixelCanvas=document.createElement('canvas');flamePixelCanvas.width=200;flamePixelCanvas.height=350;}
 const pixel=flamePixelCanvas.getContext('2d');if(!pixel)return;const width=100,height=175;
 pixel.setTransform(1,0,0,1,0,0);pixel.clearRect(0,0,flamePixelCanvas.width,flamePixelCanvas.height);pixel.setTransform(2,0,0,2,0,0);pixel.imageSmoothingEnabled=true;
 const age=flame.maxLife-flame.life,fade=Math.max(0,Math.min(1,age*14,flame.life*6)),reach=Math.min(1,.78+age*2.5),frame=state.t*18,rows=70;
 // Layer jagged strips of hot gas; the stepped edges and shifting pockets flow forward.
 for(let row=0;row<rows;row++){
  const t=(row+1)/rows,y=height-Math.round(t*height*reach),wobble=Math.sin(row*.71-frame*.42)*2,half=Math.max(2,Math.round(2+t*43)),edge=Math.round(2*Math.sin(row*1.9-frame*.7)),center=50+Math.round(wobble),left=center-half+edge,right=center+half-edge;
  pixel.globalAlpha=fade*(.28+.12*(1-t));pixel.fillStyle='#a63022';pixel.fillRect(left,y,Math.max(0,right-left),2.7);
  pixel.globalAlpha=fade*(.40+.18*(1-t));pixel.fillStyle='#e34a1e';const margin=2+Math.round((1+Math.sin(row*1.3+frame*.55))*2);pixel.fillRect(left+margin,y+1,Math.max(0,right-left-margin*2),2);
  const core=Math.max(1,Math.round(half*(.55-.32*t))),sway=Math.round(Math.sin(row*.9-frame*.8)*Math.max(1,t*5));pixel.globalAlpha=fade*(.65-.3*t);pixel.fillStyle='#ff9c2d';pixel.fillRect(center-core+sway,y+1,core*2,2);
  if(t<.8){pixel.globalAlpha=fade*(.75-.4*t);pixel.fillStyle='#ffe28b';const hot=Math.max(1,Math.round(core*.38));pixel.fillRect(center-hot+sway,y+2,hot*2,2);}
  for(let lane=-2;lane<=2;lane++){const wave=Math.sin(row*1.7+lane*5-frame*.9);if(wave>.6&&t<.88){const px=Math.round(center+lane*half*.34+wave*2);pixel.globalAlpha=fade*.48;pixel.fillStyle=lane%2?'#ffbd4c':'#fff0ac';pixel.fillRect(px,y,2,3);}}
 }
 // Interwoven hot currents flow outwards through the orange plume.
 pixel.save();pixel.globalCompositeOperation='source-atop';pixel.lineCap='square';
 for(let lane=-4;lane<=4;lane++){for(let strand=0;strand<2;strand++){pixel.globalAlpha=fade*(strand?.32:.5);pixel.strokeStyle=strand?'#ffe99b':'#ffbf42';pixel.lineWidth=strand?1:2;pixel.beginPath();for(let step=0;step<=24;step++){const t=step/24,y=height-t*height*reach,spread=2+t*40,drift=Math.sin(t*13+lane*2.1-frame*.35+strand)*Math.min(5,spread*.22),x=50+lane*spread*.2+drift;if(step===0)pixel.moveTo(Math.round(x),Math.round(y));else pixel.lineTo(Math.round(x),Math.round(y));}pixel.stroke();}}
 pixel.restore();
 // Cut separate irregular flame tips from the front instead of a straight edge.
 pixel.save();pixel.globalCompositeOperation='destination-out';pixel.globalAlpha=1;
 for(let x=0;x<width;x+=3){const lane=Math.floor(x/3),wave=Math.sin(lane*1.71+frame*.31)*.5+.5,variation=Math.sin(lane*.63-frame*.19)*.5+.5,tip=.70+.18*wave+.12*variation,cutoff=Math.max(0,Math.floor(height-height*reach*tip));pixel.fillRect(x,0,3,cutoff);}
 pixel.restore();
 // Short sparks break away at the tip, following the same forward flow.
 for(let i=0;i<14;i++){const progress=(state.t*1.8+i*.073)%1,lane=Math.sin(i*11.31),x=Math.round(50+lane*progress*40),y=Math.round(height-progress*height*reach);pixel.globalAlpha=fade*(1-progress)*.65;pixel.fillStyle=i%2?'#ffd075':'#ff6f2c';pixel.fillRect(x,y,1+(i%2),2+(i%3));}
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.shadowColor='#ff6c19';ctx.shadowBlur=14;ctx.globalAlpha=.62*(flame.side?.42:1);ctx.drawImage(flamePixelCanvas,state.x-flame.halfWidth,state.y-20-flame.range,flame.halfWidth*2,flame.range);ctx.shadowBlur=0;ctx.filter='blur(2px)';ctx.globalAlpha=.85*(flame.side?.42:1);ctx.drawImage(flamePixelCanvas,state.x-flame.halfWidth,state.y-20-flame.range,flame.halfWidth*2,flame.range);
 ctx.filter='none';
 // Layer soft, moving heat filaments over the textured fire.
 ctx.lineCap='round';ctx.lineJoin='round';for(let i=-3;i<=3;i++){const phase=state.t*9+i*1.9,spread=flame.halfWidth*.13*i,tipY=state.y-20-flame.range*reach*(.68+.08*Math.sin(phase));ctx.beginPath();ctx.moveTo(state.x+i*2,state.y-20);ctx.bezierCurveTo(state.x+spread*.25+Math.sin(phase)*8,state.y-flame.range*.3,state.x+spread*.75-Math.cos(phase)*9,state.y-flame.range*.62,state.x+spread+Math.sin(phase*1.2)*8,tipY);ctx.globalAlpha=fade*.28*(flame.side?.42:1);ctx.strokeStyle='#ffad34';ctx.lineWidth=7;ctx.shadowColor='#ff7323';ctx.shadowBlur=8;ctx.stroke();ctx.globalAlpha=fade*.38*(flame.side?.42:1);ctx.strokeStyle='#fff0a7';ctx.lineWidth=1.5;ctx.shadowBlur=4;ctx.stroke();}ctx.restore();
}
// Bright miniature trails and impact sparks distinguish hidden missiles without covering bullets.
// Small pixel-art silhouettes keep weapon types legible against enemy fire.
const extraWeaponColors=['#95edff','#ffd18b','#ff9952','#e8faff','#74dce9','#c5f8ff','#ffae61','#a8dfff','#78eee5','#ffe1a0','#8de4ff','#ffca82','#ff9d68','#b9edff','#a7ffdf','#96eaff','#ffc77e','#b3e9ff','#c5e9ff','#b8f9fa'];
function drawExtraProjectile(ctx,b){if(b.missile&&b.trail?.length){ctx.save();ctx.strokeStyle=b.weaponId==='a_pair'?'#eab4ff':b.weaponId==='a_hunter'?'#a5f5c7':'#79dff3';ctx.lineWidth=2;ctx.globalAlpha=.4;ctx.beginPath();ctx.moveTo(b.x,b.y);for(const point of b.trail)ctx.lineTo(point.x,point.y);ctx.stroke();ctx.restore();}const index=extraWeapons.findIndex(w=>w.id===b.weaponId),w=extraWeapons[index]||{homing:b.weaponId==='swarm'},color=b.weaponId==='a_barrage'?'#ffc171':extraWeaponColors[index]||'#a6e9ff';ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.missile?(b.angle??-Math.PI/2)+Math.PI/2:Math.atan2(b.vx||0,420));ctx.shadowColor=color;ctx.shadowBlur=7;ctx.fillStyle=color;if(w?.homing){const small=b.weaponId==='a_rapid'||b.weaponId==='a_barrage',wide=b.weaponId==='a_wing',hunter=b.weaponId==='a_hunter',pair=b.weaponId==='a_pair';ctx.beginPath();ctx.moveTo(0,small?-7:-11);ctx.lineTo(small?3:4,-4);ctx.lineTo(4,4);ctx.lineTo(wide?10:7,8);ctx.lineTo(wide?-10:-7,8);ctx.lineTo(-4,4);ctx.lineTo(-4,-4);ctx.closePath();ctx.fill();ctx.fillStyle='#203a4d';ctx.fillRect(-2,-4,4,7);ctx.fillStyle='#f5ffff';ctx.fillRect(-1,-8,2,6);if(hunter){ctx.fillStyle='#9fffc2';ctx.fillRect(-6,-1,3,4);ctx.fillRect(3,-1,3,4);}if(pair){ctx.fillStyle='#f3d9ff';ctx.fillRect(-3,2,6,2);}ctx.fillStyle='#81cfff';ctx.fillRect(-2,8,4,4);ctx.globalAlpha=.7;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-2,11);ctx.lineTo(0,17+Math.sin(state.t*20)*2);ctx.lineTo(2,11);ctx.fill();}else if(w?.pierce){ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(4,-3);ctx.lineTo(2,9);ctx.lineTo(0,14);ctx.lineTo(-2,9);ctx.lineTo(-4,-3);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(-1,-8,2,14);}else{const heavy=b.weaponId.includes('heavy')||b.weaponId.includes('cannon');ctx.beginPath();ctx.ellipse(0,0,heavy?5:3,heavy?9:7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(-1,-5,2,7);}ctx.globalAlpha=.9;ctx.shadowBlur=0;ctx.fillStyle='#172e44';ctx.fillRect(-3,-2,6,7);ctx.fillStyle='#c8e6ea';ctx.fillRect(-2,-2,4,4);ctx.fillStyle='#fff8df';ctx.fillRect(-1,-7,2,3);ctx.fillStyle='#ffb15a';ctx.fillRect(-2,4,4,2);ctx.fillStyle='#20384b';if(b.weaponId.includes('rapid')){ctx.fillRect(-4,2,2,3);ctx.fillRect(2,2,2,3);}else if(b.weaponId.includes('lance')||b.weaponId.includes('pierce')){ctx.fillStyle='#eaffff';ctx.fillRect(-1,-10,2,12);ctx.fillStyle=color;ctx.fillRect(-4,4,8,2);}else if(b.weaponId.includes('heavy')||b.weaponId.includes('cannon')){ctx.fillStyle='#ffe7ad';ctx.fillRect(-3,-5,6,2);ctx.fillStyle='#e2623a';ctx.fillRect(-3,3,6,3);}else if(b.weaponId.includes('wave')||b.weaponId.includes('spread')){ctx.fillStyle='#e5ffff';ctx.fillRect(-4,-1,8,2);ctx.fillRect(-1,-4,2,8);}ctx.restore();}
function drawExtraImpact(ctx,e){const index=extraWeapons.findIndex(w=>w.id===e.weaponId),color=extraWeaponColors[index]||'#bdefff',t=1-e.life/e.maxLife;ctx.save();ctx.translate(e.x,e.y);ctx.globalAlpha=(1-t)*.8;ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,3+9*t,0,Math.PI*2);ctx.stroke();for(let i=0;i<4;i++){const a=i*Math.PI/2+.4,r=4+8*t;ctx.beginPath();ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);ctx.lineTo(Math.cos(a)*(r+3),Math.sin(a)*(r+3));ctx.stroke();}ctx.restore();}
function drawPlayerProjectile(ctx,b){
 if(b.weaponId){drawExtraProjectile(ctx,b);return;}
 if(b.baseDrone){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle+Math.PI/2);ctx.fillStyle='#102940';ctx.fillRect(-3,-5,6,11);ctx.fillRect(-2,-8,4,3);ctx.fillStyle='#d4edf2';ctx.fillRect(-2,-5,4,8);ctx.fillStyle='#ffad4b';ctx.fillRect(-1,-8,2,3);ctx.fillStyle='#62e6fa';ctx.fillRect(-2,3,4,3);ctx.fillStyle='#efffff';ctx.fillRect(-1,-4,2,6);ctx.restore();return;}
 ctx.save();ctx.translate(Math.round(b.x),Math.round(b.y));
 if(b.missile||b.projectileKind==='rocket'){ctx.rotate((b.angle??-Math.PI/2)+Math.PI/2);const drone=b.projectileKind==='drone';ctx.fillStyle='#10202d';ctx.fillRect(-3,-9,6,16);ctx.fillRect(-5,1,10,5);ctx.fillStyle=drone?'#6de3d3':'#cedce0';ctx.fillRect(-2,-8,4,12);ctx.fillStyle=drone?'#d8fff0':'#f6f0cc';ctx.fillRect(-1,-10,2,5);ctx.fillStyle=drone?'#35a6b6':'#e89752';ctx.fillRect(-2,-2,4,3);ctx.fillStyle='#ff9c47';ctx.fillRect(-2,-9,4,2);ctx.fillStyle='#51d9f3';ctx.fillRect(-2,7,4,3);ctx.fillStyle='#e9ffff';ctx.fillRect(-1,8,2,4);}
 else if(b.projectileKind==='cannon'){ctx.fillStyle='#251f29';ctx.fillRect(-5,-9,10,18);ctx.fillRect(-3,-12,6,3);ctx.fillStyle='#ba6b3c';ctx.fillRect(-4,-8,8,13);ctx.fillStyle='#ffd17d';ctx.fillRect(-2,-10,4,12);ctx.fillStyle='#fff1bf';ctx.fillRect(-1,-8,2,6);ctx.fillStyle='#ef8a44';ctx.fillRect(-3,7,6,4);}
 else{ctx.rotate(Math.atan2(b.vx||0,420));ctx.fillStyle='#113751';ctx.fillRect(-3,-9,6,16);ctx.fillRect(-2,-11,4,3);ctx.fillStyle='#57c9e3';ctx.fillRect(-2,-8,4,12);ctx.fillStyle='#eaffff';ctx.fillRect(-1,-9,2,8);ctx.fillStyle='#70f0ed';ctx.fillRect(-1,6,2,4);}
 ctx.restore();
}
function drawEnemyProjectile(ctx,shot){ctx.save();ctx.translate(Math.round(shot.x),Math.round(shot.y));ctx.rotate(Math.atan2(-shot.vx,shot.vy));ctx.fillStyle='#621a2d';ctx.fillRect(-5,-5,10,10);ctx.fillRect(-3,-7,6,14);ctx.fillStyle='#e44835';ctx.fillRect(-4,-4,8,8);ctx.fillStyle='#ffa257';ctx.fillRect(-2,-3,4,6);ctx.fillStyle='#fff0ac';ctx.fillRect(-1,0,2,3);ctx.restore();}
function drawGuidedMissile(ctx,b){ctx.save();for(let i=(b.trail?.length||0)-1;i>=0;i--){const point=b.trail[i],fade=(1-i/7)*.55;ctx.globalAlpha=fade;ctx.fillStyle=b.empowered?(i%2?'#c47cff':'#ffe8a1'):(i%2?'#59c5ed':'#d8fbff');const size=Math.max(2,5-i*.45);ctx.fillRect(point.x-size/2,point.y-size/2,size,size);}ctx.globalAlpha=.35;ctx.fillStyle=b.empowered?'#bd7dff':'#65dcff';ctx.beginPath();ctx.arc(b.x,b.y,7,0,Math.PI*2);ctx.fill();ctx.translate(b.x,b.y);ctx.rotate((b.angle??-Math.PI/2)+Math.PI/2);ctx.globalAlpha=1;ctx.fillStyle='#182b40';ctx.fillRect(-4,-8,8,15);ctx.fillRect(-7,2,14,4);ctx.fillStyle='#ffae48';ctx.fillRect(-2,-11,4,3);ctx.fillStyle='#c5dbe6';ctx.fillRect(-3,-8,6,2);ctx.fillStyle=b.empowered?'#dca5ff':'#d5edf1';ctx.fillRect(-3,-7,6,10);ctx.fillStyle=b.empowered?'#ead4ff':'#5edff2';ctx.fillRect(-2,-4,4,3);ctx.fillStyle='#fff1b4';ctx.fillRect(-1,-6,2,7);ctx.fillStyle=b.empowered?'#ead4ff':'#bff9ff';ctx.fillRect(-2,7,4,5);ctx.globalAlpha=.7;ctx.fillStyle=b.empowered?'#ba7dff':'#67cfff';ctx.fillRect(-1,12,2,3+Math.floor((Math.sin(state.t*18)+1)*2));ctx.restore();}
function drawGuidedImpact(ctx,e){const t=1-e.life/e.maxLife,r=4+15*t;ctx.save();ctx.globalAlpha=(1-t)*.9;ctx.strokeStyle=e.empowered?'#e2b2ff':'#a2eaff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,r,0,Math.PI*2);ctx.stroke();for(let i=0;i<8;i++){const angle=i*Math.PI/4+t*.4,x=e.x+Math.cos(angle)*r,y=e.y+Math.sin(angle)*r;ctx.fillStyle=e.empowered?(i%2?'#c684ff':'#fff1bf'):(i%2?'#61cbe8':'#eaffff');ctx.fillRect(Math.round(x)-2,Math.round(y)-2,4,4);}ctx.restore();}
function drawSplashBomb(ctx,bomb){ctx.save();ctx.translate(bomb.x,bomb.y);ctx.rotate(Math.atan2(bomb.toY-bomb.fromY,bomb.toX-bomb.fromX)+Math.PI/2);ctx.shadowColor='#ff9a41';ctx.shadowBlur=7;ctx.fillStyle='#263744';ctx.beginPath();ctx.ellipse(0,0,5,9,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#aab9b6';ctx.beginPath();ctx.ellipse(-1,-2,3,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f5bd58';ctx.fillRect(-4,2,8,2);ctx.fillStyle='#d86a37';ctx.beginPath();ctx.moveTo(-4,5);ctx.lineTo(-7,10);ctx.lineTo(7,10);ctx.lineTo(4,5);ctx.fill();ctx.restore();}
function drawOrbitSatellite(ctx,sat){ctx.save();ctx.translate(Math.round(sat.x),Math.round(sat.y));ctx.shadowColor='#83eaff';ctx.shadowBlur=7;ctx.fillStyle='#112839';ctx.fillRect(-14,-5,28,10);ctx.fillStyle='#356984';ctx.fillRect(-13,-4,7,8);ctx.fillRect(6,-4,7,8);ctx.fillStyle='#88d6e5';ctx.fillRect(-12,-3,5,1);ctx.fillRect(7,-3,5,1);ctx.fillRect(-12,0,5,1);ctx.fillRect(7,0,5,1);ctx.shadowBlur=0;ctx.fillStyle='#1a2833';ctx.fillRect(-5,-8,10,16);ctx.fillStyle='#dbe9e9';ctx.fillRect(-4,-7,8,13);ctx.fillStyle='#6c8993';ctx.fillRect(-3,-5,6,7);ctx.fillStyle='#ff9c42';ctx.fillRect(-2,-3,4,4);ctx.fillStyle='#fff0c1';ctx.fillRect(-1,-2,2,2);ctx.fillStyle='#9baeb0';ctx.fillRect(-1,-11,2,3);ctx.fillRect(-3,-12,6,1);ctx.restore();}
function drawProximityMine(ctx,mine){ctx.save();ctx.translate(Math.round(mine.x),Math.round(mine.y));const armed=mine.arm<=0;if(augmentCombatAtlas.complete&&augmentCombatAtlas.naturalWidth){ctx.save();ctx.beginPath();ctx.moveTo(-5,-13);ctx.lineTo(5,-13);ctx.lineTo(5,-10);ctx.lineTo(10,-8);ctx.lineTo(10,-5);ctx.lineTo(13,-5);ctx.lineTo(13,5);ctx.lineTo(10,5);ctx.lineTo(10,9);ctx.lineTo(6,10);ctx.lineTo(5,13);ctx.lineTo(-5,13);ctx.lineTo(-6,10);ctx.lineTo(-10,9);ctx.lineTo(-10,5);ctx.lineTo(-13,5);ctx.lineTo(-13,-5);ctx.lineTo(-10,-5);ctx.lineTo(-10,-8);ctx.lineTo(-5,-10);ctx.closePath();ctx.clip();ctx.imageSmoothingEnabled=true;ctx.drawImage(augmentCombatAtlas,543,0,181,181,-14,-14,28,28);ctx.restore();ctx.restore();return;}ctx.fillStyle='#101d29';ctx.fillRect(-6,-10,12,20);ctx.fillRect(-10,-6,20,12);ctx.fillStyle='#7897a5';ctx.fillRect(-5,-8,10,16);ctx.fillRect(-8,-5,16,10);ctx.fillStyle='#e2eef0';ctx.fillRect(-4,-7,8,2);ctx.fillRect(-7,-4,2,7);ctx.fillStyle='#293b47';ctx.fillRect(-4,-4,8,8);ctx.fillStyle=armed?'#ff9c42':'#52cde1';ctx.fillRect(-3,-3,6,6);ctx.fillStyle=armed?'#fff0b2':'#b6d0cb';ctx.fillRect(-1,-2,2,3);if(armed){ctx.globalAlpha=.45;ctx.fillStyle='#ffc778';ctx.fillRect(-1,-12,2,2);ctx.fillRect(-1,10,2,2);}ctx.restore();}
function drawLightningArc(ctx,arc){
 const dx=arc.tx-arc.x,dy=arc.ty-arc.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,steps=Math.max(4,Math.min(18,Math.ceil(len/15))),alpha=Math.max(0,Math.min(1,arc.life/.2)),flicker=Math.floor((.2-arc.life)*35),points=[[arc.x,arc.y]];
 for(let i=1;i<steps;i++){const zig=(i%2?1:-1)*(3+(i*11+flicker*7)%9)*Math.sin(Math.PI*i/steps);points.push([Math.round(arc.x+dx*i/steps+nx*zig),Math.round(arc.y+dy*i/steps+ny*zig)]);}points.push([arc.tx,arc.ty]);
 ctx.save();ctx.lineJoin='miter';ctx.lineCap='square';
 for(const [color,width,opacity,blur] of [['#12638b',10,.23,12],['#28bce2',5,.55,7],['#a4e8ff',2,.95,3],['#ffffff',1,1,0]]){ctx.globalAlpha=alpha*opacity;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.shadowColor='#20bbdf';ctx.shadowBlur=blur;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(const point of points.slice(1))ctx.lineTo(point[0],point[1]);ctx.stroke();}
 ctx.shadowBlur=5;ctx.strokeStyle='#73e9f5';ctx.lineWidth=1.5;ctx.globalAlpha=alpha*.72;for(let i=2;i<steps-1;i+=3){const p=points[i],side=i%2?1:-1,reach=7+(i*3%10);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]+nx*side*reach+dx/len*4,p[1]+ny*side*reach+dy/len*4);ctx.lineTo(p[0]+nx*side*(reach+5)+dx/len*9,p[1]+ny*side*(reach+5)+dy/len*9);ctx.stroke();}
 ctx.shadowBlur=9;ctx.shadowColor='#36cde9';ctx.fillStyle='#eaffff';ctx.globalAlpha=alpha;ctx.fillRect(Math.round(arc.tx)-3,Math.round(arc.ty)-3,6,6);ctx.fillRect(Math.round(arc.tx)-1,Math.round(arc.ty)-7,2,14);ctx.fillRect(Math.round(arc.tx)-7,Math.round(arc.ty)-1,14,2);ctx.restore();
}
function drawSawHit(ctx,effect){const t=1-effect.life/effect.maxLife;ctx.save();ctx.translate(effect.x,effect.y);ctx.globalAlpha=1-t;ctx.shadowColor='#8feaff';ctx.shadowBlur=10;ctx.strokeStyle='#dcfaff';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,5+t*12,-1.3,1.2);ctx.stroke();ctx.rotate(-.7);ctx.strokeStyle='#fff5b8';for(let i=0;i<8;i++){const a=i*Math.PI/4,r=4+t*10;ctx.beginPath();ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);ctx.lineTo(Math.cos(a)*(r+5+4*(1-t)),Math.sin(a)*(r+5+4*(1-t)));ctx.stroke();}ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,3*(1-t)+1,0,Math.PI*2);ctx.fill();ctx.restore();}
// The mine uses the authored explosion frames at a compact in-game scale.
function drawMineExplosion(ctx,effect){const elapsed=effect.maxLife-effect.life,t=elapsed/effect.maxLife;ctx.save();ctx.translate(effect.x,effect.y);if(window.BossExplosion){window.BossExplosion.drawMine(ctx,elapsed,effect.maxLife);}if(t<.4){ctx.globalAlpha=(1-t/.4)*.7;ctx.strokeStyle='#ffd18a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,6+effect.radius*t*1.6,0,Math.PI*2);ctx.stroke();}ctx.restore();}
function drawMineBlast(ctx,effect){const t=1-Math.max(0,effect.life/effect.maxLife),r=8+t*effect.radius;ctx.save();ctx.globalAlpha=(1-t)*.8;ctx.strokeStyle='#ef9f5b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(effect.x,effect.y,r,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffe0a0';for(let i=0;i<8;i++){const a=i*Math.PI/4,px=Math.round(effect.x+Math.cos(a)*r),py=Math.round(effect.y+Math.sin(a)*r);ctx.fillRect(px-2,py-2,4,4);}if(t<.3){ctx.globalAlpha=(.3-t)*.8;ctx.fillStyle='#ffce83';ctx.beginPath();ctx.arc(effect.x,effect.y,11+t*20,0,Math.PI*2);ctx.fill();}ctx.restore();}
function drawSkillPulse(ctx,pulse){ctx.save();ctx.globalAlpha=Math.min(.65,Math.max(0,pulse.life/.3)*.6);ctx.strokeStyle='#60cbdd';ctx.lineWidth=3;ctx.setLineDash([9,5]);ctx.beginPath();ctx.arc(pulse.x,pulse.y,pulse.r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha*=.6;ctx.strokeStyle='#d6ffff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(pulse.x,pulse.y,Math.max(0,pulse.r-4),0,Math.PI*2);ctx.stroke();ctx.restore();}
function drawDrop(ctx,drop){
 const x=Math.round(drop.x),y=Math.round(drop.y);ctx.save();
 if(!drop.shield&&!drop.bomb){
  if(drop.xpMultiplier>1){ctx.globalAlpha=.65;ctx.strokeStyle='#8cecff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffc16a';ctx.fillRect(x-1,y-9,2,3);}
  ctx.globalAlpha=drop.tutorial?.9:.48;ctx.fillStyle='#75e5d6';
  ctx.fillRect(x-1,y-5,2,10);ctx.fillRect(x-3,y-3,6,6);ctx.fillRect(x-5,y-1,10,2);
  ctx.fillStyle='#d7fff4';ctx.fillRect(x-1,y-2,2,4);
  if(drop.tutorial){ctx.globalAlpha=.9;ctx.strokeStyle='#9af2e0';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,17,0,Math.PI*2);ctx.stroke();}
 }else{
  ctx.globalAlpha=.88;ctx.fillStyle=drop.shield?'#102f40':'#352443';ctx.fillRect(x-9,y-9,18,18);
  ctx.fillStyle=drop.shield?'#5fc9dd':'#b9a0e6';ctx.fillRect(x-7,y-9,14,2);ctx.fillRect(x-9,y-7,2,14);ctx.fillRect(x+7,y-7,2,14);ctx.fillRect(x-7,y+7,14,2);
  if(drop.shield){ctx.fillStyle='#b8f8ff';ctx.fillRect(x-5,y-5,10,2);ctx.fillRect(x-5,y-3,2,6);ctx.fillRect(x+3,y-3,2,6);ctx.fillRect(x-3,y+3,6,2);ctx.fillRect(x-1,y+5,2,2);ctx.fillStyle='#65d9e9';ctx.fillRect(x-2,y-2,4,4);}
  else{ctx.fillStyle='#f0dcff';ctx.fillRect(x-3,y-4,6,2);ctx.fillRect(x-5,y-2,10,6);ctx.fillRect(x-3,y+4,6,2);ctx.fillRect(x+2,y-6,3,2);ctx.fillStyle='#a987cf';ctx.fillRect(x-2,y-1,2,3);}
 }
 ctx.restore();
}
// Draw the detached pod from the same source art as the boss.
function drawBossDebris(ctx,part){ctx.save();ctx.translate(part.x,part.y);ctx.rotate(part.rotation||0);ctx.globalAlpha=Math.min(1,part.life/.45);const selected=stageBossArt[part.type||0];const image=selected&&selected.complete&&selected.naturalWidth?selected:combatArt.boss;
 if(image.complete&&image.naturalWidth){const sw=Math.floor(image.naturalWidth*.23),sx=part.side<0?0:image.naturalWidth-sw;ctx.imageSmoothingEnabled=false;ctx.drawImage(image,sx,0,sw,image.naturalHeight,-20,-28,40,56);}else{ctx.fillStyle='#243e60';ctx.fillRect(-12,-20,24,40);ctx.fillStyle='#83a8c6';ctx.fillRect(-8,-17,16,25);ctx.fillStyle='#f77d46';ctx.fillRect(-6,10,12,8);}
 ctx.fillStyle='#ffb858';ctx.fillRect(-4,25,8,7);ctx.fillStyle='#fff1a1';ctx.fillRect(-2,27,4,5);ctx.restore();}
function renderEnrageCountdown(boss){const indicator=overlay.querySelector('.enrage-countdown');const level=boss?.enrageLevel||0,remaining=boss?(level===0?bossEnrageTimes(state.stage,state.round).first:bossEnrageTimes(state.stage,state.round).second)-boss.bossTime:0;const visible=!!(boss&&level<2&&remaining>0&&remaining<=5);indicator.hidden=!visible;if(visible)indicator.textContent=(level?'2차 광폭화까지 ':'광폭화까지 ')+Math.ceil(remaining);}
function drawShieldBreak(ctx,effect){if(!effect||effect.life<=0)return;const t=1-effect.life/.4;ctx.save();ctx.globalAlpha=.8*(1-t);ctx.strokeStyle='#a4f4ff';ctx.lineWidth=2;const radius=18+t*13;for(let i=0;i<6;i++){const a=i*Math.PI/3+t*.2;ctx.beginPath();ctx.arc(effect.x,effect.y,radius,a,a+.42);ctx.stroke();ctx.fillStyle='#d7ffff';const x=effect.x+Math.cos(a+.22)*(radius+4*t),y=effect.y+Math.sin(a+.22)*(radius+4*t);ctx.fillRect(Math.round(x)-1,Math.round(y)-1,3,3);}ctx.restore();}
function draw(){ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#0a142c';ctx.fillRect(0,0,W,H);if(stageBackground.complete&&stageBackground.naturalWidth){const offset=(state.t*70)%H;ctx.save();ctx.filter=['none','hue-rotate(85deg) saturate(1.25)','sepia(.55) hue-rotate(330deg)','hue-rotate(160deg) saturate(1.3)','hue-rotate(260deg) saturate(1.4)'][state.stage-1]||'none';ctx.drawImage(stageBackground,0,offset-H,W,H);ctx.drawImage(stageBackground,0,offset,W,H);ctx.restore();}else{for(let i=0;i<40;i++){ctx.fillStyle='#526d9a';ctx.fillRect((i*113)%W,(i*79+state.t*20)%H,2,2);}}drawStageLayer(ctx);for(const wreck of state.wrecks)drawTurretWreck(ctx,wreck);for(const mine of state.mines)drawProximityMine(ctx,mine);for(const bomb of state.grenades)drawSplashBomb(ctx,bomb);for(const d of state.drops)drawDrop(ctx,d);for(const flame of state.flames){ctx.save();if(flame.side){const origin=baseDronePosition(flame.side);ctx.translate(origin.x-state.x,origin.y-state.y);}drawFlamethrower(ctx,flame);ctx.restore();}for(const b of state.bullets){if(b.delay>0)continue;if(b.boomerang){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.age*15);ctx.fillStyle='#91dff0';ctx.fillRect(-11,-3,22,6);ctx.fillRect(-3,-11,6,22);ctx.fillStyle='#f0ffff';ctx.fillRect(-3,-3,6,6);ctx.restore();continue;}if(b.empowered||b.projectileKind==='missile'){drawGuidedMissile(ctx,b);continue;}if(b.flame){ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,b.life*3));ctx.fillStyle='#ba3021';ctx.fillRect(b.x-6,b.y-7,12,14);ctx.fillStyle='#ff8b32';ctx.fillRect(b.x-4,b.y-6,8,11);ctx.fillStyle='#ffe59a';ctx.fillRect(b.x-2,b.y-4,4,6);ctx.restore();continue;}drawPlayerProjectile(ctx,b);}for(const arc of state.arcs)drawLightningArc(ctx,arc);for(const pulse of state.pulses)drawSkillPulse(ctx,pulse);ctx.globalAlpha=1;for(const sat of state.satellites||[])drawOrbitSatellite(ctx,sat);for(const saw of state.saws||[]){ctx.save();ctx.translate(saw.x,saw.y);ctx.rotate(saw.angle);ctx.shadowColor='#76dfff';ctx.shadowBlur=12;ctx.strokeStyle='rgba(164,239,255,.7)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,20,-1.8,1.5);ctx.stroke();ctx.shadowBlur=0;ctx.scale(1.5,1.5);ctx.fillStyle='#253943';for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.fillRect(-2,-13,4,6);}ctx.fillStyle='#d6e9eb';ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#526b74';ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffe09b';ctx.fillRect(-2,-2,4,4);ctx.restore();}for(const shot of state.enemyShots){if(shot.laser){ctx.save();const warning=shot.warning>0;ctx.globalAlpha=warning?.35:.65;ctx.fillStyle=warning?'#ffb76d':'#ff496e';ctx.fillRect(shot.x-(warning?shot.r:shot.r+5),shot.y,(warning?shot.r:shot.r+5)*2,H-shot.y);ctx.globalAlpha=warning?.85:1;ctx.fillStyle=warning?'#ffe5a3':'#fff2d1';ctx.fillRect(shot.x-(warning?1:4),shot.y,warning?2:8,H-shot.y);ctx.restore();continue;}drawEnemyProjectile(ctx,shot);}for(const p of state.particles){ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(p.x-2,p.y-2,4,4);}ctx.globalAlpha=1;for(const e of state.enemies){if(e.phase&&e.boss){const gap=bossGapCenter(e.pattern,0);ctx.save();ctx.globalAlpha=.22;ctx.fillStyle='#fbd88e';ctx.fillRect(gap-42,e.y+30,84,H-e.y-30);ctx.globalAlpha=.7;ctx.strokeStyle='#ffd68a';ctx.lineWidth=2;ctx.strokeRect(gap-42,e.y+30,84,H-e.y-30);ctx.restore();}ctx.save();if(e.kind==='side'&&e.direction<0){ctx.translate(e.x*2,0);ctx.scale(-1,1);}drawEnemySprite(ctx,e);ctx.restore();}for(const effect of state.skillEffects){if(effect.type==='nova'){const t=1-effect.life/effect.maxLife;ctx.save();ctx.globalAlpha=(1-t)*.8;ctx.strokeStyle='#83e9ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(effect.x,effect.y,effect.radius*t,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#ddd3ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(effect.x,effect.y,effect.radius*t*.78,0,Math.PI*2);ctx.stroke();ctx.restore();continue;}if(effect.type==='weaponMuzzle'){ctx.save();ctx.globalAlpha=Math.max(0,effect.life/effect.maxLife)*.65;ctx.fillStyle=extraWeaponColors[extraWeapons.findIndex(w=>w.id===effect.weaponId)]||'#bcefff';ctx.beginPath();ctx.arc(effect.x,effect.y,3,0,Math.PI*2);ctx.fill();ctx.restore();continue;}if(effect.type==='weaponImpact'){drawExtraImpact(ctx,effect);continue;}if(effect.type==='guidedImpact'){drawGuidedImpact(ctx,effect);continue;}if(effect.type==='mineExplosion'){drawMineExplosion(ctx,effect);continue;}if(effect.type==='mineBlast'){drawMineBlast(ctx,effect);continue;}if(effect.type==='sawHit'){drawSawHit(ctx,effect);continue;}ctx.save();ctx.globalAlpha=Math.max(0,effect.life/effect.maxLife);ctx.strokeStyle=effect.color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(effect.x,effect.y,effect.radius*(1-effect.life/effect.maxLife)+8,0,7);ctx.stroke();ctx.restore();}if(state.skillFlash>0&&visualSettings.flash){ctx.save();ctx.globalAlpha=Math.min(.22,state.skillFlash*.2);ctx.fillStyle='#ffe0a0';ctx.fillRect(0,0,W,H);ctx.restore();}for(const part of state.debris)drawBossDebris(ctx,part);if(state.bombFlash>0){const t=1-state.bombFlash/.65;ctx.save();if(visualSettings.flash){ctx.globalAlpha=Math.min(.5,state.bombFlash);ctx.fillStyle='#ffde9b';ctx.fillRect(0,0,W,H);}ctx.globalAlpha=1-t;ctx.strokeStyle='#fff0b1';ctx.lineWidth=8;ctx.beginPath();ctx.arc(state.x,state.y,30+t*500,0,7);ctx.stroke();ctx.restore();}if(!state.playerDestroyed&&!(state.inv>0&&Math.floor(state.inv*10)%2)){ctx.save();const seq=state.stageSequence,departing=seq&&seq.phase==='departure'&&!seq.advanced;const shipY=departing?seq.fromY-Math.min(1,seq.elapsed/1.05)*(seq.fromY+50):state.y;if(!departing){for(const p of state.phantoms||[]){ctx.save();ctx.globalAlpha=Math.max(0,Math.min(.32,p.life*.5));drawCombatSprite(ctx,'player',p.x,p.y,64,68,1,skinColors());ctx.restore();}drawBaseDrone(ctx,-1);drawBaseDrone(ctx,1);}ctx.translate(state.x,shipY);const bank=state.tilt||0;ctx.transform(1-Math.abs(bank)*.25,bank*.35,0,1,0,0);if(!state.shipId)drawShipEngineLight(ctx,0,0,48,56,false);drawCombatSprite(ctx,'player',0,0,64,68,1,skinColors());if(!state.shipId)drawPlayerEngineFlicker(ctx,48,56);ctx.restore();if(!departing){ctx.fillStyle='#153048';ctx.fillRect(state.x-4,state.y-4,8,8);ctx.fillStyle='#83e9f2';ctx.fillRect(state.x-3,state.y-3,6,6);ctx.fillStyle='#ffffff';ctx.fillRect(state.x-1,state.y-1,2,2);}}drawPlayerDestruction(ctx);drawShieldBreak(ctx,state.shieldBreak);drawStageSequence(ctx);const waveHud=overlay.querySelector('.wave-hud');waveHud.hidden=state.boss;overlay.querySelector('.wave-label').textContent='WAVE '+waveNumber(state.t)+'/3';overlay.querySelector('.round-status').textContent='R'+state.round+' S'+state.stage+' · Lv.'+((state.round-1)*5+state.stage);const remaining=Math.max(0,Math.ceil(duration-state.t));overlay.querySelector('.wave-time').textContent=remaining===0&&!state.boss&&state.enemies.some(e=>e.miniBoss&&!e.dead&&e.hp>0)?'중간 보스 격파 후 보스 등장':'보스까지 '+String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0');overlay.querySelector('.wave-progress i').style.width=Math.min(100,state.t/duration*100)+'%';overlay.querySelector('.bomb-button b').textContent=state.bombCooldown>0?Math.ceil(state.bombCooldown)+'초':state.bombs;overlay.querySelector('.bomb-button').disabled=!!state.stageSequence||state.bombs===0||state.bombCooldown>0;hpBar.style.width=Math.max(0,state.hp)+'%';overlay.querySelector('.shield-count').textContent='실드 '+state.shield;xpBar.style.width=(state.xp/state.need*100)+'%';overlay.querySelector('.time').textContent=`${String(Math.floor(state.t/60)).padStart(2,'0')}:${String(Math.floor(state.t%60)).padStart(2,'0')}`;overlay.querySelector('.level').textContent=`LV. ${state.level}`;overlay.querySelector('.live-score').textContent=(state.score+Math.floor(state.totalTime)*2).toLocaleString();overlay.querySelector('.live-kills').textContent=state.kills;overlay.querySelector('.live-coins').textContent=state.coins;const boss=state.enemies.find(e=>e.boss&&!e.dead);const fog=overlay.querySelector('.enrage-fog'),alarmActive=!!(boss?.enraged&&!state.stageSequence&&!state.playerDestroyed);fog.hidden=!alarmActive;fog.classList.toggle('fog-pulse',alarmActive&&visualSettings.flash);const bossHud=overlay.querySelector('.boss-hud');bossHud.hidden=!boss;renderEnrageCountdown(boss);if(boss){const bossHpPercent=Math.max(0,Math.min(100,boss.hp/boss.maxHp*100));bossHud.querySelector('i').style.width=bossHpPercent+'%';bossHud.querySelector('.boss-health-percent').textContent=Math.ceil(bossHpPercent)+'%';bossHud.querySelector('.boss-health-track').setAttribute('aria-valuenow',Math.ceil(bossHpPercent));overlay.querySelector('.boss-label').textContent=BOSS_TYPES[boss.type].name+' · PHASE '+bossPhase(boss.hp,boss.maxHp)+' / 3';const timer=overlay.querySelector('.boss-timer');timer.textContent=boss.enrageLevel>=2?'2차 광폭화':boss.enraged?'2차 광폭화까지 '+Math.max(0,Math.ceil(bossEnrageTimes(state.stage,state.round).second-boss.bossTime))+'초':'광폭화까지 '+Math.max(0,Math.ceil(bossEnrageTimes(state.stage,state.round).first-boss.bossTime))+'초';timer.classList.toggle('enraged',boss.enraged);}}
function loop(ts){if(!state||!state.running)return;if(!last)last=ts;const dt=Math.min((ts-last)/1000,.05);last=ts;if(state.deathSequence)updatePlayerDestruction(dt);else if(state.stageSequence)updateStageSequence(dt);else if(!state.paused){if(tutorial)updateTutorial(dt);else update(dt);}draw();frame=requestAnimationFrame(loop);}
const joystick=overlay.querySelector('.joystick'),stick=overlay.querySelector('.stick');
function syncKeyboardStick(){
 if(pointer||!state||state.paused)return;
 const x=(heldKeys.has('d')?1:0)-(heldKeys.has('a')?1:0),y=(heldKeys.has('s')?1:0)-(heldKeys.has('w')?1:0);
 const length=Math.hypot(x,y),rect=joystick.getBoundingClientRect(),radius=Math.max(1,rect.width*.32);
 if(!length){stick.style.transform='translate(-50%,-50%)';return;}
 const scale=radius/length;
 stick.style.transform='translate(calc(-50% + '+(x*scale)+'px),calc(-50% + '+(y*scale)+'px))';
}
function moveStick(event){if(!pointer||event.pointerId!==pointer.id||!state||state.paused)return;const rect=joystick.getBoundingClientRect();const dx=event.clientX-(rect.left+rect.width/2),dy=event.clientY-(rect.top+rect.height/2);const radius=Math.max(1,rect.width*.32),length=Math.hypot(dx,dy),scale=length>radius?radius/length:1;state.joyX=dx*scale/radius;state.joyY=dy*scale/radius;stick.style.transform='translate(calc(-50% + '+(dx*scale)+'px),calc(-50% + '+(dy*scale)+'px))';}
joystick.addEventListener('pointerdown',event=>{if(!state||state.paused||pointer||(tutorial&&!['move','collect'].includes(tutorial.phase)))return;pointer={id:event.pointerId};joystick.setPointerCapture(event.pointerId);moveStick(event);});
joystick.addEventListener('pointermove',moveStick);
for(const name of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(name,event=>{if(pointer&&pointer.id===event.pointerId)resetStick();});
function triggerBomb(){
 if(!state||state.paused||state.stageSequence||state.finished||state.bombs<=0||state.bombCooldown>0||(tutorial&&tutorial.phase!=='bomb'))return false;
 showBombCutin();
 if(tutorial&&tutorial.phase==='bomb'){state.enemyShots=[];state.bombFlash=.65;advanceTutorial();return true;}
 state.bombs--;state.bombCooldown=8;state.bombFlash=.65;
 for(let i=0;i<5;i++)burst(state.x+(Math.random()-.5)*100,state.y+(Math.random()-.5)*100,'#ffb75e');
 state.enemyShots=[];state.inv=Math.max(state.inv,2);state.pulses.push({x:state.x,y:state.y,r:Math.hypot(W,H),life:.45});
 for(const e of state.enemies)applyBombDamage(e);notice('폭탄 발사!');return true;
}
overlay.querySelector('.bomb-button').addEventListener('click',triggerBomb);
overlay.addEventListener('contextmenu',event=>{if(!state||!state.running)return;event.preventDefault();triggerBomb();});
document.addEventListener('keydown',event=>{const key=event.key.toLowerCase();if(event.code==='Space'&&state&&state.running){event.preventDefault();if(!event.repeat)triggerBomb();return;}if(['w','a','s','d'].includes(key)&&state&&state.running&&!state.paused&&(!tutorial||['move','collect'].includes(tutorial.phase))){heldKeys.add(key);syncKeyboardStick();event.preventDefault();}});
document.addEventListener('keyup',event=>{heldKeys.delete(event.key.toLowerCase());syncKeyboardStick();});
window.addEventListener('blur',()=>{heldKeys.clear();if(state&&state.running&&!state.paused)pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state&&state.running&&!state.paused)pause();});
document.querySelector('.primary').addEventListener('click',()=>openSortieSelection('normal'));
document.querySelector('.secondary').addEventListener('click',()=>{if(!window.tossGame)notice('브라우저에서는 랭킹 연습 모드로 진행돼요.');openSortieSelection('rank');});
document.querySelector('.ranking-card').addEventListener('click',openRanking);
const aircraftUpgradeModal=document.querySelector('.aircraft-upgrade-modal'),aircraftUpgradeButton=document.querySelector('.upgrade'),aircraftUpgradeBuy=aircraftUpgradeModal.querySelector('.aircraft-upgrade-buy'),aircraftUpgradeStatus=aircraftUpgradeModal.querySelector('.aircraft-upgrade-status');
const formatUpgradeNumber=n=>Number(n.toFixed(2)).toLocaleString();
function renderAircraftUpgrade(message=''){
 const level=progress.power,cost=20*(level+1),bonus=level*.15,attack=gameStat('playerMain',1)+bonus+passPartBonus('main')+shopPartBonus('main'),canBuy=progress.coins>=cost;
 aircraftUpgradeModal.querySelector('.aircraft-level').innerHTML=level+' <small>단계</small>';aircraftUpgradeModal.querySelector('.aircraft-next-level').textContent='다음 '+(level+1)+'단계';aircraftUpgradeModal.querySelector('.aircraft-bonus').textContent='+'+formatUpgradeNumber(bonus);aircraftUpgradeModal.querySelector('.aircraft-next-bonus').textContent='+'+formatUpgradeNumber(bonus+.15);aircraftUpgradeModal.querySelector('.aircraft-attack').textContent=formatUpgradeNumber(attack);aircraftUpgradeModal.querySelector('.aircraft-coins').textContent=Number(progress.coins).toLocaleString()+' 코인';
 aircraftUpgradeBuy.textContent=canBuy?cost.toLocaleString()+' 코인으로 강화':cost.toLocaleString()+' 코인 필요';aircraftUpgradeBuy.disabled=!canBuy;aircraftUpgradeStatus.textContent=message||(!canBuy?'코인이 '+(cost-progress.coins).toLocaleString()+'개 부족해요.':'강화할 때마다 주무기 공격력이 0.15 증가해요.');
}
function closeAircraftUpgrade(){aircraftUpgradeModal.hidden=true;aircraftUpgradeButton.focus();}
aircraftUpgradeButton.addEventListener('click',()=>{renderAircraftUpgrade();aircraftUpgradeModal.hidden=false;aircraftUpgradeModal.querySelector('.aircraft-upgrade-close').focus();});
aircraftUpgradeModal.querySelector('.aircraft-upgrade-close').addEventListener('click',closeAircraftUpgrade);aircraftUpgradeModal.addEventListener('click',event=>{if(event.target===aircraftUpgradeModal)closeAircraftUpgrade();});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!aircraftUpgradeModal.hidden)closeAircraftUpgrade();});
aircraftUpgradeBuy.addEventListener('click',()=>{const cost=20*(progress.power+1);if(progress.coins<cost){renderAircraftUpgrade();return;}const updated={...progress,coins:progress.coins-cost,power:progress.power+1};if(!save('starfall-progress',updated)){renderAircraftUpgrade('저장하지 못해 강화를 적용하지 않았어요.');return;}progress=updated;updateHome();renderAircraftUpgrade('강화 완료! '+progress.power+'단계가 적용됐어요.');});







// Cosmetic purchases are local-only until account-based server persistence is integrated.
const passModal=document.createElement('div');passModal.className='shop-modal';passModal.hidden=true;app.appendChild(passModal);
const passButton=document.querySelector('.season-pass-button');
let passAdCancel=()=>{},passAdPlaying=false,passAdGeneration=0;
function closePass(){if(passAdPlaying)return;passAdGeneration++;passAdCancel();passAdCancel=()=>{};passModal.hidden=true;passButton.focus();}
function showPass(message=''){
 if(passAdPlaying)return;passAdGeneration++;const generation=passAdGeneration;passAdCancel();passAdCancel=()=>{};passModal.hidden=false;passModal.replaceChildren();const p=passState(),xp=passXp(p),today=passAdDay(),claimedToday=Boolean(progress.passAdLastClaimDay&&progress.passAdLastClaimDay>=today),nextAd=nextPassAdReward(p);let adButton=null;
 const box=document.createElement('section');box.className='shop-dialog pass-dialog';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','시즌 패스');
 const head=document.createElement('div');head.className='shop-header';const title=document.createElement('h2');title.textContent='시즌 패스';const close=button('×',closePass,'shop-close');close.setAttribute('aria-label','시즌 패스 닫기');head.append(title,close);
 const intro=document.createElement('p');intro.className='pass-intro';intro.textContent=(window.GAME_SEASON?.label||'시즌 01')+' · 패스 경험치 '+xp+' XP';
 const note=document.createElement('p');note.className='shop-note';note.textContent='일반 출격 종료 시 미션이 반영됩니다. 진행과 보상은 현재 이 브라우저에 저장됩니다.';
 const missionTitle=document.createElement('h3');missionTitle.textContent='시즌 미션';const missions=document.createElement('div');missions.className='pass-missions';
 for(const m of passConfig.missions){const row=document.createElement('div');row.className='pass-mission';const n=Math.min(m.goal,p.metrics[m.metric]||0);if(n>=m.goal)row.classList.add('is-complete');const label=document.createElement('span');label.textContent=m.name;const value=document.createElement('b');value.textContent=n+' / '+m.goal+' · '+m.xp+' XP';row.append(label,value);missions.append(row);}
 const premium=document.createElement('p');premium.className='pass-premium-note';premium.textContent='광고 패스 · 한국 시간 기준 하루 1개 · 순서대로 해금';const adStatus=document.createElement('p');adStatus.className='pass-ad-status';adStatus.setAttribute('role','status');adStatus.setAttribute('aria-live','polite');adStatus.textContent=message||(claimedToday?'오늘의 광고 보상을 받았어요. 내일 다시 참여할 수 있어요.':'미션 XP를 달성한 다음 광고를 시청하면 보상을 받을 수 있어요.');
 const rewardsTitle=document.createElement('h3');rewardsTitle.textContent='달성 보상';const rewards=document.createElement('div');rewards.className='pass-rewards';
 for(const [i,r] of passConfig.rewards.entries()){
  const row=document.createElement('div');row.className='pass-reward';row.classList.add(p.claimed.includes(i)?'is-claimed':xp<r.xp?'is-locked':'is-ready');const threshold=document.createElement('strong');threshold.textContent=r.xp+' XP';const free=button(p.claimed.includes(i)?'무료 · 수령 완료':xp<r.xp?'무료 · 코인 '+r.coins+' (잠김)':'무료 · 코인 '+r.coins+' 받기',()=>{const current=passState();if(passXp(current)<r.xp||current.claimed.includes(i))return;const updated={...progress,coins:progress.coins+r.coins,seasonPass:{...current,claimed:[...current.claimed,i]}};if(!save('starfall-progress',updated)){notice('보상을 저장하지 못했어요.');return;}progress=updated;updateHome();showPass();notice('코인 '+r.coins+'개를 받았어요.');},'pass-free');free.disabled=p.claimed.includes(i)||xp<r.xp;if(!p.claimed.includes(i))free.classList.add('coin-button');
  const paidName=r.part?r.part.name+' ('+r.part.description+')':r.premiumCoins?'코인 '+r.premiumCoins.toLocaleString()+'개':'보상 준비 중',claimed=p.premiumClaimed.includes(i),eligible=i===nextAd&&xp>=r.xp&&!claimedToday;
  const paid=button(claimed?'광고 보상 · 수령 완료':xp<r.xp?'광고 보상 · '+paidName+' (XP 부족)':i!==nextAd?'광고 보상 · '+paidName+' (이전 보상 필요)':claimedToday?'광고 보상 · '+paidName+' (오늘 완료)':'광고 준비 중 · '+paidName,()=>{},'pass-paid pass-ad-reward');paid.disabled=true;if(r.premiumCoins)paid.classList.add('coin-button');if(eligible)adButton=paid;row.append(threshold,free,paid);rewards.append(row);
 }
 box.append(head,intro,note,missionTitle,missions,premium,adStatus,rewardsTitle,rewards);passModal.append(box);close.focus();
 if(adButton){const service=window.WebRewardedAds;if(!service){adButton.textContent='광고 이용 불가';adStatus.textContent='현재 광고를 사용할 수 없어요.';return;}const rewardIndex=nextAd;let shown=false;passAdCancel=service.prepare(show=>{if(generation!==passAdGeneration||passModal.hidden)return;adButton.disabled=false;adButton.textContent='광고 보고 보상 받기 · '+(passConfig.rewards[rewardIndex].part?.name||'코인 '+passConfig.rewards[rewardIndex].premiumCoins.toLocaleString()+'개');adButton.addEventListener('click',()=>{if(shown)return;shown=true;passAdPlaying=true;window.GameAudio?.setAdHold(true);close.disabled=true;adButton.disabled=true;adStatus.textContent='광고를 시청 중이에요.';try{show();}catch{passAdCancel();passAdPlaying=false;window.GameAudio?.setAdHold(false);close.disabled=false;adStatus.textContent='광고를 표시하지 못했어요.';}});},result=>{if(generation!==passAdGeneration||passModal.hidden)return;passAdPlaying=false;window.GameAudio?.setAdHold(false);close.disabled=false;if(result!=='viewed'){adButton.disabled=true;adButton.textContent='광고 이용 불가';adStatus.textContent=result==='dismissed'?'광고를 끝까지 시청하지 않아 보상이 지급되지 않았어요.':'현재 광고를 불러올 수 없어요. 잠시 후 다시 시도해 주세요.';return;}const current=passState(),day=passAdDay(),reward=passConfig.rewards[rewardIndex];if(!reward||nextPassAdReward(current)!==rewardIndex||passXp(current)<reward.xp||(progress.passAdLastClaimDay&&progress.passAdLastClaimDay>=day)){adStatus.textContent='오늘은 더 이상 광고 보상을 받을 수 없어요.';return;}const owned=[...progress.ownedParts],equipped=[...(progress.equippedPassParts||[])];if(reward.part&&!owned.includes(reward.part.id))owned.push(reward.part.id);if(reward.part&&!equipped.includes(reward.part.id))equipped.push(reward.part.id);const updated={...progress,coins:progress.coins+(reward.premiumCoins||0),ownedParts:owned,equippedPassParts:equipped,passAdLastClaimDay:day,seasonPass:{...current,premiumClaimed:[...current.premiumClaimed,rewardIndex]}};if(!save('starfall-progress',updated)){adStatus.textContent='보상을 저장하지 못했어요. 보상은 지급되지 않았습니다.';return;}progress=updated;updateHome();showPass(reward.part?'광고 보상을 받았어요. 파츠가 일반 출격에 자동 적용됩니다.':'광고 보상 코인을 받았어요.');},'season-pass-daily');}
}
passButton.addEventListener('click',showPass);passModal.addEventListener('click',event=>{if(event.target===passModal)closePass();});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!passModal.hidden)closePass();});

const shopModal=document.createElement('div');shopModal.className='shop-modal';shopModal.hidden=true;app.appendChild(shopModal);
const shopButton=document.querySelector('.shop-button');
function closeShop(){shopModal.hidden=true;shopButton.focus();}
function showShop(){
 shopModal.hidden=false;shopModal.replaceChildren();
 const box=document.createElement('section');box.className='shop-dialog parts-dialog';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','파츠 상점');
 const head=document.createElement('div');head.className='shop-header';const title=document.createElement('h2');title.textContent='파츠 상점';const close=button('×',closeShop,'shop-close');close.setAttribute('aria-label','상점 닫기');head.append(title,close);
 const balance=document.createElement('p');balance.className='shop-balance coin-value';balance.textContent='보유 코인  '+Number(progress.coins||0).toLocaleString();
 const note=document.createElement('p');note.className='shop-note';note.textContent='화력 코어는 일반 출격에 적용됩니다. 구매 및 장착 내역은 이 브라우저에 저장됩니다.';
 const list=document.createElement('div');list.className='shop-list';
 for(const slot of ['body','engine','aux_core','main_core']){
  const category=document.createElement('h3');category.textContent=({body:'기체 장갑',engine:'엔진 색상',aux_core:'보조무기 코어',main_core:'주무기 코어'})[slot];list.append(category);
  const reset=button(slot==='body'||slot==='engine'?'기본 외형으로 변경':'코어 장착 해제',()=>{const next={...progress,equippedParts:{...progress.equippedParts}};delete next.equippedParts[slot];if(!save('starfall-progress',next)){notice('저장하지 못해 장착을 변경하지 않았어요.');return;}progress=next;drawLobbyShip();updateHome();showShop();},'shop-reset');reset.disabled=!progress.equippedParts[slot];list.append(reset);
  for(const item of shopCatalog.filter(entry=>entry.slot===slot)){
   const owned=progress.ownedParts.includes(item.id),equipped=progress.equippedParts[slot]===item.id;
   const row=document.createElement('div');row.className='shop-item';const swatch=document.createElement('span');swatch.className='shop-swatch';swatch.style.backgroundColor=item.color;swatch.setAttribute('aria-hidden','true');const detail=document.createElement('div');detail.className='shop-item-info';const name=document.createElement('strong');name.textContent=item.name;const description=document.createElement('small');description.textContent=item.description;detail.append(name,description);
   const action=button(equipped?'장착 중':owned?'장착':item.price.toLocaleString()+' 코인',()=>{
    const alreadyOwned=progress.ownedParts.includes(item.id);if(!alreadyOwned&&progress.coins<item.price){notice('코인이 부족해요.');return;}
    const next={...progress,coins:progress.coins-(alreadyOwned?0:item.price),ownedParts:alreadyOwned?progress.ownedParts:[...progress.ownedParts,item.id],equippedParts:{...progress.equippedParts,[slot]:item.id}};
    if(!save('starfall-progress',next)){notice('저장하지 못해 구매 또는 장착하지 않았어요.');return;}progress=next;drawLobbyShip();updateHome();showShop();notice(alreadyOwned?'파츠를 장착했어요.':'구매 후 장착했어요.');
   },'shop-action');action.classList.add(equipped?'is-equipped':owned?'is-owned':'is-purchase');if(!owned)action.classList.add('coin-button');action.disabled=equipped;row.append(swatch,detail,action);list.append(row);
  }
 }
 if(!shopCatalog.length){const message=document.createElement('p');message.textContent='상품 목록을 불러오지 못했어요.';list.append(message);}
 box.append(head,balance,note,list);shopModal.append(box);close.focus();
}
shopButton.addEventListener('click',showShop);
shopModal.addEventListener('click',event=>{if(event.target===shopModal)closeShop();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!shopModal.hidden)closeShop();});


// Short startup sequence: waits for the local artwork or a bounded timeout.
function startIntro(){
 if(typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const intro=document.createElement('section');intro.className='startup-intro';intro.setAttribute('role','region');intro.setAttribute('aria-label','게임 시작 화면');
 intro.innerHTML='<div class="intro-scene" aria-hidden="true"><div class="intro-grid"></div><div class="intro-side-lights" aria-hidden="true"></div><div class="intro-platform"></div><div class="intro-craft"><canvas width="320" height="208"></canvas><div class="engine-effects" aria-hidden="true"><span class="engine-glow left"></span><span class="engine-glow right"></span><span class="engine-flame left"><i></i></span><span class="engine-flame right"><i></i></span></div></div><div class="intro-crosshair"></div></div><div class="intro-title"><span>ARCADE SHOOTER</span><strong>GALAXY <em>SURVIVOR</em></strong><small>격납고 진입 중</small></div><div class="intro-footer"><div class="intro-loading"><div class="intro-indicator"><span></span><b>그래픽 준비 중</b></div><div class="intro-loading-track" aria-hidden="true"><i></i></div></div><button class="intro-skip" type="button">건너뛰기</button></div>';
 const canvas=intro.querySelector('canvas'),ctx=canvas.getContext('2d'),flightArt=new Image();
 function paintFlight(){if(!ctx||typeof ctx.fillRect!=='function')return;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;
  if(!flightArt.complete||!flightArt.naturalWidth){PixelArt.sprite(ctx,'player',160,104,105,150,1,skinColors());return;}
  const scale=Math.min(290/flightArt.naturalWidth,200/flightArt.naturalHeight),w=flightArt.naturalWidth*scale,h=flightArt.naturalHeight*scale;
  const skin=skinColors(),shipId=selectedLoadout?.shipId||'ark',chosen=selectedShipSprites[shipId],ready=chosen?.complete&&chosen.naturalWidth;if(ready)drawImageContained(ctx,playerArtWithSkin(skin,false,shipId),canvas.width/2,canvas.height/2,290,200,SHIP_SPRITE_BOUNDS[shipId]);else ctx.drawImage(combatArt.player.complete&&combatArt.player.naturalWidth?playerArtWithSkin(skin):flightArt,(canvas.width-w)/2,(canvas.height-h)/2,w,h);updateEngineEffects(intro,skin);const fx=intro.querySelector('.engine-effects');if(fx)fx.style.visibility=ready?'hidden':'';
 }
 flightArt.onload=paintFlight;combatArt.player.addEventListener('load',paintFlight,{once:true});selectedShipSprites[selectedLoadout?.shipId||'ark'].addEventListener('load',paintFlight,{once:true});for(const mask of Object.values(skinMasks))mask.addEventListener('load',paintFlight,{once:true});flightArt.src='assets/player-arcade-v1.png';paintFlight();
 const blocked=[document.querySelector('.top'),document.querySelector('.hero'),document.querySelector('.content')];for(const part of blocked)part.inert=true;
 app.appendChild(intro);
 function alignIntro(){if(typeof intro.style.setProperty!=='function')return;const target=lobbyCanvas.getBoundingClientRect(),frame=intro.getBoundingClientRect();intro.style.setProperty('--craft-x',(target.left-frame.left+target.width/2)+'px');intro.style.setProperty('--craft-y',(target.top-frame.top+target.height/2)+'px');intro.style.setProperty('--craft-width',target.width+'px');intro.style.setProperty('--craft-height',target.height+'px');intro.style.setProperty('--platform-y',(target.top-frame.top+target.height-5)+'px');}
 alignIntro();window.addEventListener('resize',alignIntro);
 let done=false;function finish(){if(done)return;done=true;if(typeof window.removeEventListener==='function')window.removeEventListener('resize',alignIntro);intro.classList.add('intro-exit');for(const part of blocked)part.inert=false;window.setTimeout(()=>intro.remove(),350);}
 intro.querySelector('.intro-skip').addEventListener('click',finish);
 const pause=ms=>new Promise(resolve=>window.setTimeout(resolve,ms));
 function loadImage(src){return new Promise(resolve=>{const img=new Image();let settled=false;const end=ok=>{if(settled)return;settled=true;resolve(ok);};img.onload=()=>end(true);img.onerror=()=>end(false);img.src=src;if(img.complete)end(img.naturalWidth>0);window.setTimeout(()=>end(false),3800);});}
 const assets=['assets/hangar-flightdeck-v2.png','assets/station-arcade-v1.png','assets/ship-ark-v1.png','assets/escort-arcade-v1.png'];let completed=0;
 const graphicsReady=Promise.all(assets.map(src=>loadImage(src).then(ok=>{completed++;if(!done){intro.querySelector('.intro-loading-track i').style.width=(completed/assets.length*100)+'%';intro.querySelector('.intro-indicator b').textContent='그래픽 준비 '+completed+' / '+assets.length;}return ok;})));
 graphicsReady.then(results=>{if(done)return;intro.querySelector('.intro-indicator b').textContent=results.every(Boolean)?'그래픽 준비 완료':'격납고 입장 준비';intro.classList.add('intro-ready');});
 Promise.all([pause(3200),Promise.race([graphicsReady,pause(4000)])]).then(finish);
}
startIntro();
