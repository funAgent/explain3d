import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { SoftwareRenderer } from './software-renderer.mjs';
import { buildMechanism } from './scene.mjs';
import { spec, ratio, TAU, pose, tourAt } from './model.mjs';
import { TourPlayback, driveTime } from './playback.mjs';
const $=s=>document.querySelector(s),stage=$('#stage'),canvas=$('#view'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const HOME={x:5.6,y:3.8};
let presentation=false;
function presentationMode(active){
 if(presentation===active)return;presentation=active;
 const root=$('.instrument');root.classList.toggle('is-presenting',active);
 $('#presentation-controls').hidden=!active;
 const hidden=['.editorial','.controls','.stage-top','.annotation','.figure-id','.scene-caption','.transport','.header-actions'];
 if(active && hidden.some(q=>$(q)?.contains(document.activeElement)))$('#present-pause').focus({preventScroll:true});
 hidden.forEach(q=>{const el=$(q);el.inert=active;el.setAttribute('aria-hidden',String(active));});
 $('#presentation-controls').hidden=!active;
}

const playback=new TourPlayback();
function text(selector,value){const el=$(selector),str=String(value);if(el.textContent!==str)el.textContent=str;}
const state={angle:.9,rpm:24,playing:!reduced.matches,presentMix:0,explode:0,targetExplode:0,part:'sun',focus:false,x:HOME.x,y:HOME.y,targetX:HOME.x,targetY:HOME.y,tilt:false,visible:true};
const parts={ring:{title:'内齿圈',role:'固定 / 72 齿',description:'固定的内齿圈提供约束，让行星轮沿着内侧滚动。',caption:0},sun:{title:'太阳轮',role:'输入 / 24 齿',description:'中央的输入齿轮，推动三个行星轮转动。',caption:1},planet:{title:'行星轮',role:'传递 / 3 × 24 齿',description:'一边反向自转，一边围绕太阳轮同向公转。',caption:2},carrier:{title:'行星架',role:'输出 / 4:1 减速',description:'连接三根行星轮轴，将公转传递给输出轴。',caption:4}};
const captions=[['先固定，才能减速。','外圈的 72 齿内齿圈保持不动，三个行星轮沿内侧滚动。'],['金色太阳轮，负责输入。','中央的 24 齿输入齿轮，将转动传递给三个行星轮。'],['一边自转，一边公转。','齿面啮合约束了运动：行星轮反向自转，同时绕中心公转。'],['沿轴向拆开，看清连接。','三根行星轮轴连接银色行星架，行星架带动前端输出轴。'],['输入四圈，输出一圈。','内齿圈固定时，减速比 = 1 + 72 ÷ 24 = 4。输入与输出同向。']];
let captionIndex=-1;
function caption(index){if(captionIndex===index)return;captionIndex=index;$('#caption-title').textContent=captions[index][0];$('#caption-copy').textContent=captions[index][1];$('#step-number').textContent=String(index+1).padStart(2,'0');$('#announce').textContent=captions[index].join(' ');}
let renderer,gpu=true;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});}catch{gpu=false;renderer=new SoftwareRenderer({canvas});}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0x0c1014,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;renderer.shadowMap.enabled=gpu;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.1,90);
if(gpu){const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;scene.environmentIntensity=.82;room.dispose();pmrem.dispose();}
scene.add(new THREE.HemisphereLight(0xe9ece8,0x171a16,.5));
const key=new THREE.DirectionalLight(0xfff1dc,2.5);key.position.set(-5,7,10);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:1,far:30});key.shadow.bias=-.0003;key.shadow.normalBias=.02;scene.add(key);
const rim=new THREE.DirectionalLight(0xd6e0dd,2.1);rim.position.set(7,2,5);scene.add(rim);const fill=new THREE.DirectionalLight(0xffffff,.7);fill.position.set(-6,-3,4);scene.add(fill);
const mechanism=buildMechanism(scene,gpu);
$('#render-info').textContent=gpu?'当前显示：WebGL 实时渲染，包含环境反射与阴影。':'当前显示：兼容 3D 渲染。浏览器未提供 WebGL，使用同一模型的 CPU 投影，反射与阴影有所简化。';
let selectedPart=null,selectedFocus=null;
function select(part,explain=true){
  state.part=part;const changed=selectedPart!==part,p=parts[part];
  if(changed){document.querySelectorAll('[data-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.part===part)));text('#part-title',p.title);text('#part-role',p.role);text('#part-description',p.description);}
  if(changed||selectedFocus!==state.focus)mechanism.focus(part,state.focus);
  selectedPart=part;selectedFocus=state.focus;if(explain)caption(p.caption);
}
function paintRange(el){el.style.setProperty('--fill',`${100*(+el.value-(+el.min))/(+el.max-(+el.min))}%`);}
function setField(name,value){const range=$('#'+name),number=$('#'+name+'-number');range.value=value;paintRange(range);if(document.activeElement!==number)number.value=value;}
function running(){return state.explode<.001&&state.targetExplode<.001&&(playback.active?playback.running:state.playing);}
function labels(){
  const active=playback.status==='playing',paused=playback.status==='paused',done=playback.status==='complete';
  presentationMode(active);
  $('#present-fill').style.transform=`scaleX(${playback.time/playback.duration})`;
  text('#present-time',`${playback.time.toFixed(1)} / 10s`);
  const label=active?'暂停讲解':paused?'继续讲解':done?'重新播放10秒讲解':'播放10秒讲解';
  $('#play').setAttribute('aria-label',label);$('#play').title=label;$('#play use').setAttribute('href',active?'#i-pause':'#i-play');
  $('#play').setAttribute('aria-pressed',String(active));text('#tour span',active?'正在讲解':paused?'已暂停 · 继续':done?'讲解完成 · 重播':'播放讲解');
  $('.transport').classList.toggle('is-playing',active);
  $('#focus').setAttribute('aria-pressed',String(state.focus));$('#tilt').setAttribute('aria-pressed',String(state.tilt));
  $('#front-view').setAttribute('aria-pressed',String(Math.abs(state.targetX)<.02&&Math.abs(state.targetY)<.02));
  $('#assemble').setAttribute('aria-pressed',String(state.targetExplode<.001));$('#disassemble').setAttribute('aria-pressed',String(state.targetExplode>.999));
  const time=playback.time,fraction=time/playback.duration;
  $('#timeline').value=time.toFixed(2);$('#timeline').setAttribute('aria-valuetext',`已播放 ${time.toFixed(1)} 秒，共 10 秒`);
  $('#timeline-fill').style.transform=`scaleX(${fraction})`;$('#timeline-thumb').style.left=`${fraction*100}%`;
  text('#elapsed',time.toFixed(1).padStart(4,'0'));
  const checkpoint=time<2?0:time<4?2:time<6?4:time<8.2?7.3:time<10?8.2:10;document.querySelectorAll('[data-time]').forEach(b=>b.setAttribute('aria-current',String(playback.status!=='idle'&&+b.dataset.time===checkpoint)));
  const engaged=state.explode<.001&&state.targetExplode<.001,moving=running();
  text('#input-rpm',moving?state.rpm:0);text('#output-rpm',moving?+(state.rpm/ratio).toFixed(2):0);
  text('#mode-status',!engaged?'拆解观察 · 传动暂停':moving?'机构运转中':'机构已暂停');
  $('#status-dot').classList.toggle('paused',!moving);
  text('#mechanism-note',paused?'继续讲解以恢复演示':active?'按讲解步骤自动拆装':engaged?'理想传动 · 同向输出':state.playing?'复装到位后恢复传动':'复装后可手动开始转动');
  const motion=$('#motion');motion.disabled=playback.active;motion.title=playback.active?'使用底部播放键控制讲解':'单独控制机构转动';
  text('#motion',active?'讲解中':paused?'讲解暂停':state.targetExplode>.001?'复装运转':state.playing?'暂停转动':'开始转动');
}
function stopTour(){if(playback.active)state.playing=playback.status==='playing';playback.reset();labels();}
function guidedPose(){const frame=tourAt(playback.time);state.targetExplode=state.explode=frame.explode;state.angle=playback.baseAngle+state.rpm/60*TAU*driveTime(playback.time);select(frame.part,false);caption(frame.caption);setField('explode',Math.round(frame.explode*100));}
function toggleTour(){
  if(playback.status==='playing'){playback.pause(performance.now());guidedPose();}
  else{const fresh=playback.status==='idle'||playback.status==='complete';playback.play(state.angle,performance.now());state.focus=true;if(fresh){state.targetX=HOME.x;state.targetY=HOME.y;disableTilt();}guidedPose();}
  labels();wake();
}
function toggleMotion(){
  if(playback.active){toggleTour();return;}
  if(state.targetExplode>.001){state.targetExplode=0;state.playing=true;setField('explode',0);caption(4);}
  else state.playing=!state.playing;
  labels();wake();
}
$('#play').onclick=toggleTour;
$('#present-pause').onclick=()=>{toggleTour();$('#play').focus({preventScroll:true});};
$('#present-exit').onclick=()=>{if(playback.status==='playing'){playback.pause(performance.now());guidedPose();labels();wake();}$('#play').focus({preventScroll:true});};
document.addEventListener('keydown',e=>{if(presentation&&(e.code==='Space'||e.key==='Escape')){e.preventDefault();e.stopPropagation();toggleTour();$('#play').focus({preventScroll:true});}},true);
$('#motion').onclick=toggleMotion;
$('#timeline').addEventListener('pointerdown',()=>{if(playback.status==='playing'){playback.pause(performance.now());guidedPose();labels();}});
function seekTour(time){playback.seek(time,state.angle);state.playing=false;state.focus=true;guidedPose();labels();wake();}
$('#timeline').oninput=e=>seekTour(e.target.value);
document.querySelectorAll('[data-time]').forEach(button=>{button.style.left=`${+button.dataset.time*10}%`;button.onclick=()=>seekTour(+button.dataset.time);});
function bindParameter(name,min,max,change){const range=$('#'+name),number=$('#'+name+'-number');const commit=value=>{const n=Math.round(Math.max(min,Math.min(max,Number.isFinite(+value)&&value!==''?+value:name==='speed'?state.rpm:state.targetExplode*100)));change(n);range.value=number.value=n;paintRange(range);labels();wake();};range.oninput=e=>commit(e.target.value);number.onchange=e=>commit(e.target.value);number.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();commit(e.target.value);number.blur();}};paintRange(range);}
bindParameter('speed',8,60,v=>{stopTour();state.rpm=v;});
bindParameter('explode',0,100,v=>{stopTour();state.targetExplode=v/100;caption(v>0?3:parts[state.part].caption);});
$('#assemble').onclick=()=>{stopTour();state.targetExplode=0;setField('explode',0);caption(4);labels();};
$('#disassemble').onclick=()=>{stopTour();state.targetExplode=1;setField('explode',100);caption(3);labels();};
document.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>{stopTour();state.focus=true;select(b.dataset.part);labels();});
$('#focus').onclick=()=>{state.focus=!state.focus;mechanism.focus(state.part,state.focus);labels();};
function disableTilt(){state.tilt=false;$('#tilt').setAttribute('aria-pressed','false');$('#view-hint').textContent='拖动观察 · 轻点选中零件';}
$('#reset-view').onclick=()=>{state.targetX=HOME.x;state.targetY=HOME.y;disableTilt();labels();};
$('#front-view').onclick=()=>{const isFront=Math.abs(state.targetX)<.02&&Math.abs(state.targetY)<.02;state.targetX=isFront?HOME.x:0;state.targetY=isFront?HOME.y:0;disableTilt();labels();};
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('.instrument').requestFullscreen)await $('.instrument').requestFullscreen();else $('#view-hint').textContent='当前浏览器不支持全屏，可横屏放大查看';}catch{$('#view-hint').textContent='暂时无法全屏，可横屏放大查看';}};
const dialog=$('#info-dialog');$('#info').onclick=()=>{dialog.showModal();surfaceChanged();};$('#close-info').onclick=()=>dialog.close();dialog.addEventListener('close',surfaceChanged);dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
let drag=null;const raycaster=new THREE.Raycaster();
canvas.addEventListener('pointerdown',e=>{disableTilt();drag={id:e.pointerId,x:e.clientX,y:e.clientY,cx:state.targetX,cy:state.targetY};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;state.targetX=THREE.MathUtils.clamp(drag.cx-(e.clientX-drag.x)*.025,-6,6);state.targetY=THREE.MathUtils.clamp(drag.cy+(e.clientY-drag.y)*.025,-4.3,4.3);labels();wake();});
canvas.addEventListener('pointerup',e=>{if(drag&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<6){const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hits=raycaster.intersectObject(mechanism.machine,true);if(hits.length){let o=hits[0].object;while(o&&!o.userData.part)o=o.parent;if(o){stopTour();state.focus=true;select(o.userData.part);labels();}}}drag=null;});canvas.addEventListener('pointercancel',()=>{drag=null;});
stage.addEventListener('keydown',e=>{if(e.target!==stage)return;if(e.code==='Space'){e.preventDefault();toggleMotion();}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key)){e.preventDefault();disableTilt();if(e.key==='Home'){state.targetX=HOME.x;state.targetY=HOME.y;}else{state.targetX=THREE.MathUtils.clamp(state.targetX+(e.key==='ArrowLeft'?.7:e.key==='ArrowRight'?-.7:0),-6,6);state.targetY=THREE.MathUtils.clamp(state.targetY+(e.key==='ArrowUp'?.7:e.key==='ArrowDown'?-.7:0),-4.3,4.3);}labels();}});
let tiltOrigin=null,tiltSeen=false,tiltTimer;
window.addEventListener('deviceorientation',e=>{if(!state.tilt||e.gamma===null||e.beta===null)return;tiltSeen=true;if(!tiltOrigin)tiltOrigin={gamma:e.gamma,beta:e.beta};state.targetX=THREE.MathUtils.clamp(HOME.x+(e.gamma-tiltOrigin.gamma)*.13,-6,6);state.targetY=THREE.MathUtils.clamp(HOME.y+(e.beta-tiltOrigin.beta)*.1,-4.3,4.3);$('#view-hint').textContent='轻轻倾斜手机 · 观察前后层次';labels();wake();});
$('#tilt').onclick=async()=>{if(state.tilt){disableTilt();return;}if(!window.DeviceOrientationEvent){$('#view-hint').textContent='设备没有方向传感器，请拖动观察';return;}try{if(typeof DeviceOrientationEvent.requestPermission==='function'){const p=await DeviceOrientationEvent.requestPermission();if(p!=='granted'){$('#view-hint').textContent='未启用方向权限，仍可拖动观察';return;}}state.tilt=true;tiltOrigin=null;tiltSeen=false;labels();$('#view-hint').textContent='请轻轻倾斜手机';clearTimeout(tiltTimer);tiltTimer=setTimeout(()=>{if(state.tilt&&!tiltSeen){disableTilt();$('#view-hint').textContent='未收到方向数据，请拖动观察';}},2800);}catch{$('#view-hint').textContent='无法访问方向传感器，请拖动观察';}};
let width=1,height=1,halfW=6,halfH=6;
function resize(){width=Math.max(1,stage.clientWidth);height=Math.max(1,stage.clientHeight);renderer.setSize(width,height,false);const a=width/height;halfH=Math.max(5.85,5.15/a);halfW=halfH*a;}
function updateCamera(){const compact=matchMedia('(max-width:900px)').matches;const distance=14,n=camera.near,zoom=1+state.explode*.14+(compact&&height<400?.05:0),cx=(compact?.55:-1.8)*(1-state.presentMix),cy=(compact?(height<400?1.25:1.0):.45)*(1-state.presentMix);camera.position.set(state.x,state.y,distance);camera.rotation.set(0,0,0);camera.projectionMatrix.makePerspective((cx-halfW*zoom-state.x)*n/distance,(cx+halfW*zoom-state.x)*n/distance,(cy+halfH*zoom-state.y)*n/distance,(cy-halfH*zoom-state.y)*n/distance,n,camera.far);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();camera.updateMatrixWorld();}
function updateAnnotation(){
  const point=mechanism.anchor(state.part).project(camera),el=$('#annotation');
  const px=(point.x*.5+.5)*width,py=(-point.y*.5+.5)*height;
  const visible=!drag&&width>720&&px>165&&px<width-30&&py>100&&py<height-150;
  el.style.visibility=visible?'visible':'hidden';
  if(visible){el.style.transform=`translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0)`;text('#anchor-title',parts[state.part].title);text('#anchor-role',parts[state.part].role);}
}
let last=performance.now(),raf=0;
function tick(now){
  raf=0;if(!state.visible||document.hidden||dialog.open)return;
  const dt=Math.min((now-last)/1000,1);last=now;
  const wasGuided=playback.active;
  if(wasGuided){playback.sample(now);guidedPose();if(playback.status==='complete'){state.playing=true;state.focus=false;mechanism.focus(state.part,false);}}
  const follow=reduced.matches?1:1-Math.exp(-dt/.22);
  state.presentMix+=((presentation?1:0)-state.presentMix)*follow;
  state.explode+=(state.targetExplode-state.explode)*follow;if(Math.abs(state.explode-state.targetExplode)<.0002)state.explode=state.targetExplode;
  state.x+=(state.targetX-state.x)*follow;state.y+=(state.targetY-state.y)*follow;
  if(running()&&!wasGuided)state.angle+=dt*state.rpm/60*TAU;
  // UI and geometry share one sampled position, including during exploded pauses.
  labels();mechanism.update(state.angle,state.explode,state.x,state.y);updateCamera();renderer.render(scene,camera);updateAnnotation();
  canvas.dataset.renderMs=gpu?'GPU':renderer.lastRenderMs.toFixed(1);
  const phase=state.angle/TAU;$('#input-phase').style.strokeDashoffset=1-((phase%1+1)%1);$('#output-phase').style.strokeDashoffset=1-(((phase/4)%1+1)%1);
  const moving=playback.running||running()||Math.abs(state.targetExplode-state.explode)>.0001||Math.abs(state.targetX-state.x)>.001||Math.abs(state.targetY-state.y)>.001;
  if(moving)raf=requestAnimationFrame(tick);
}
function wake(){if(!raf&&state.visible&&!document.hidden&&!dialog.open){last=performance.now();raf=requestAnimationFrame(tick);}}
function surfaceChanged(){
  if(document.hidden||dialog.open||!state.visible){const wasGuided=playback.active;playback.suspend(performance.now());if(wasGuided){guidedPose();if(playback.status==='complete'){state.playing=true;state.focus=false;mechanism.focus(state.part,false);}}if(raf)cancelAnimationFrame(raf);raf=0;}
  else{playback.resume(performance.now());wake();}
}
new ResizeObserver(()=>{resize();wake();}).observe(stage);resize();
new IntersectionObserver(entries=>{state.visible=entries.at(-1).isIntersecting;surfaceChanged();},{rootMargin:'100px'}).observe(stage);
document.addEventListener('visibilitychange',surfaceChanged);
for(const event of ['input','change','click','keydown'])document.addEventListener(event,()=>{labels();wake();},{passive:true});
reduced.addEventListener('change',e=>{if(e.matches){if(playback.status==='playing'){playback.pause(performance.now());guidedPose();}state.playing=false;labels();wake();}});
document.addEventListener('fullscreenchange',()=>{const label=document.fullscreenElement?'退出全屏':'全屏查看';$('#fullscreen').setAttribute('aria-label',label);$('#fullscreen').title=label;});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#loading').style.display='flex';$('#loading').innerHTML='<b>图形显示暂时中断</b><small>刷新页面可重新装配模型。</small><button onclick="location.reload()">重新载入</button>';});
select('sun',false);setField('speed',24);setField('explode',0);labels();mechanism.update(state.angle,0,state.x,state.y);updateCamera();renderer.render(scene,camera);$('#loading').style.display='none';wake();
window.mechanicalLab={inspect:()=>({renderer:gpu?'WebGL':'CPU',teeth:spec,ratio,parts:mechanism.parts,angles:pose(state.angle),state:{...state},playback:{status:playback.status,time:playback.time},drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,renderMs:renderer.lastRenderMs,canvas:{width,height}})};
