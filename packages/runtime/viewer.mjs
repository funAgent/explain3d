import * as THREE from './vendor/three.module.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {SoftwareRenderer} from './software-renderer.mjs';
import {TourPlayback} from './playback.mjs';
import {templates} from '../../templates/catalog.mjs';

export async function mountViewer(host,{id='planetary',interactive=true,poster=false}={}){
 const spec=templates.find(x=>x.id===id);if(!spec)throw Error('未知场景');
 const canvas=host.querySelector('canvas'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let renderer,gpu=true;try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});}catch{gpu=false;renderer=new SoftwareRenderer({canvas});}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0x101213,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 renderer.setSize(Math.max(1,host.clientWidth),Math.max(1,host.clientHeight),false);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(.5,.5,18);camera.lookAt(0,0,0);
 if(gpu){const env=new RoomEnvironment(),pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(env,.04).texture;env.dispose();pm.dispose();}
 scene.add(new THREE.HemisphereLight(0xf2f2eb,0x22282a,2));for(const [x,y,z,power] of [[-5,7,10,3],[7,0,6,2]]){const l=new THREE.DirectionalLight(0xfff4e5,power);l.position.set(x,y,z);scene.add(l);}
 let asset,planetary=false;
 if(id==='planetary'){const {buildMechanism}=await import('./planetary/scene.mjs');const m=buildMechanism(scene,gpu);asset={group:m.machine,update:(t,p,e)=>m.update((Math.min(t,5)+Math.max(0,t-9))*p/60*Math.PI*2,e,5.6,3.8)};planetary=true;}
 else{const mod=await import(`../scenes/${spec.module}.mjs`);asset=mod[spec.builder](THREE);scene.add(asset.group);}
 asset.update(0,spec.parameter.value,0);
 const originalRotation=asset.group.rotation.clone();
 const initialBox=new THREE.Box3().setFromObject(asset.group),extent=initialBox.getSize(new THREE.Vector3());
 const clock=new TourPlayback(),shell=host.closest('.demo-shell'),q=s=>shell?.querySelector(s),isDemo=!!shell;
 let parameter=spec.parameter.value,exploded=0,ambient=0,playing=!reduce.matches&&!poster,last=performance.now(),visible=true,raf=0,yaw=0,pitch=0,drag=null,disposed=false;
 const text=(s,v)=>{const el=q(s);if(el&&el.textContent!==String(v))el.textContent=v;};
 function focusMode(active){if(!shell)return;const changed=shell.classList.contains('is-playing')!==active;shell.classList.toggle('is-playing',active);if(!changed)return;const island=q('.minimal-controls');island.hidden=!active;if(active&&shell.contains(document.activeElement))q('[data-pause]').focus({preventScroll:true});shell.querySelectorAll('.muted-during-play').forEach(el=>{el.inert=active;el.setAttribute('aria-hidden',String(active));});}
 function sync(){if(!isDemo)return;const active=clock.status==='playing';focusMode(active);q('[data-play]').textContent=active?'暂停讲解':clock.status==='paused'?'继续讲解':clock.status==='complete'?'重新播放':'播放 10 秒讲解';q('[data-play]').setAttribute('aria-pressed',String(active));q('[data-time]').value=clock.time;q('[data-time]').setAttribute('aria-valuetext',`${clock.time.toFixed(1)} 秒，共 10 秒`);shell.style.setProperty('--progress',`${clock.time*10}%`);text('[data-elapsed]',clock.time.toFixed(1)+' / 10s');text('[data-min-time]',clock.time.toFixed(1)+' / 10s');const ci=Math.min(4,Math.floor(clock.time/2));text('[data-caption]',spec.chapters[ci]);text('[data-parameter-value]',`${parameter}${spec.parameter.unit}`);q('[data-ambient]').textContent=playing?'暂停转动':'开始转动';text('[data-stats]',id==='lens'?`像距 ${(1.5*parameter/(parameter-1.5)).toFixed(2)}，放大率 ${(-1.5/(parameter-1.5)).toFixed(2)}`:id==='attention'?'权重 '+[2,1,0].map(s=>Math.exp(s/parameter)/[2,1,0].reduce((a,b)=>a+Math.exp(b/parameter),0)).map(x=>x.toFixed(3)).join(' / '):id==='planetary'?`${parameter} rpm → ${(parameter/4).toFixed(1)} rpm`:id==='conveyor'&&asset.group.userData.stats?`完成 ${asset.group.userData.stats.completed} 件 / 队列 ${asset.group.userData.stats.queued} 件`:'');}
 function draw(now){raf=0;if(disposed||!visible||document.hidden)return;const dt=Math.min(.12,(now-last)/1000);last=now;
  if(clock.active){clock.sample(now);if(clock.status==='complete')playing=false;}else if(playing)ambient+=dt;
  const t=clock.status==='idle'?ambient:clock.time;
  const e=clock.active||clock.status==='complete'?Math.max(0,Math.sin(Math.PI*Math.max(0,Math.min(1,(t-5)/4)))):exploded;
  asset.update(t,parameter,e);asset.group.rotation.y=(planetary?asset.group.rotation.y:originalRotation.y)+yaw;asset.group.rotation.x=(planetary?asset.group.rotation.x:originalRotation.x)+pitch;
  renderer.render(scene,camera);sync();host.dataset.ready='true';host.dataset.renderer=gpu?'webgl':'cpu';host.querySelector('.scene-loading')?.remove();
  if((clock.running||(!clock.active&&playing))&&!poster)raf=requestAnimationFrame(draw);
 }
 function wake(){if(!raf&&visible&&!document.hidden&&!disposed){last=performance.now();raf=requestAnimationFrame(draw);}}
 const ro=new ResizeObserver(()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=Math.max(extent.y,extent.x/camera.aspect)*1.9+extent.z*.5;camera.updateProjectionMatrix();wake();});ro.observe(host);
 const io=new IntersectionObserver(es=>{visible=es.at(-1).isIntersecting;if(visible){clock.resume(performance.now());wake();}else{clock.suspend(performance.now());cancelAnimationFrame(raf);raf=0;}},{rootMargin:'80px'});io.observe(host);
 const visibility=()=>{if(document.hidden){clock.suspend(performance.now());cancelAnimationFrame(raf);raf=0;}else{clock.resume(performance.now());wake();}};document.addEventListener('visibilitychange',visibility);
 const pause=()=>{if(clock.status==='playing'){clock.pause(performance.now());sync();q('[data-play]')?.focus({preventScroll:true});wake();}};
 const toggle=()=>{if(clock.running)pause();else{clock.play(0,performance.now());sync();shell?.scrollIntoView({block:'start',behavior:reduce.matches?'instant':'smooth'});wake();}};
 if(isDemo){q('[data-play]').onclick=toggle;q('[data-pause]').onclick=pause;q('[data-expand]').onclick=pause;q('[data-time]').oninput=e=>{clock.seek(+e.target.value,0);playing=false;sync();wake();};q('[data-parameter]').oninput=e=>{parameter=+e.target.value;sync();wake();};q('[data-explode]').oninput=e=>{clock.reset();exploded=+e.target.value/100;playing=false;sync();wake();};q('[data-reset]').onclick=()=>{yaw=pitch=0;wake();};q('[data-ambient]').onclick=()=>{clock.reset();playing=!playing;sync();wake();};}
 const key=e=>{if(!isDemo)return;if((e.code==='Space'&&(!['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target.tagName)))||e.key==='Escape'&&clock.running){e.preventDefault();clock.running?pause():toggle();}};if(isDemo)document.addEventListener('keydown',key);
 if(interactive){canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,yaw,pitch};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw=drag.yaw+(e.clientX-drag.x)*.005;pitch=THREE.MathUtils.clamp(drag.pitch+(e.clientY-drag.y)*.005,-.65,.65);wake();});canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);}
 const motion=e=>{if(e.matches){pause();playing=false;wake();}};reduce.addEventListener('change',motion);sync();wake();
 return {scene,camera,asset,renderer,draw:()=>draw(performance.now()),dispose(){disposed=true;cancelAnimationFrame(raf);ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',visibility);document.removeEventListener('keydown',key);reduce.removeEventListener('change',motion);scene.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m?.dispose();});renderer.dispose?.();scene.environment?.dispose();}};
}
