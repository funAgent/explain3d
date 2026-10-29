import {TOKENS,STARTS,DURATION,sample,narration} from './model.mjs';
import {createStage} from './stage.mjs';
import {lessonPose,handoff} from './pose.mjs';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],motion=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=motion.matches;
const stage=createStage($('#artwork'),{reducedMotion:()=>reduced});
let id=1,future=100,time=0,playing=false,raf=0,last=0,lastCopy='',dead=false;
const names=['输入 Q/K/V','匹配分数','因果遮罩','分配权重','加权内容','求和与实验'];
function focus(on){$('#app').classList.toggle('is-playing',on);$$('.secondary').forEach(x=>{x.inert=on;x.setAttribute('aria-hidden',String(on));});}
function anchor(){const box=$('.exhibit').getBoundingClientRect(),bubble=$('#callout').getBoundingClientRect(),art=$('#artwork');art.style.top=Math.max(185,bubble.bottom-box.top+13)+'px';const a=art.getBoundingClientRect(),point=stage.projectAnchor();if(!point)return;const x=a.left-box.left+point.x*a.width,y=a.top-box.top+point.y*a.height,cx=Math.max(bubble.width/2+17,Math.min(box.width-bubble.width/2-17,x));$('#callout').style.left=cx+'px';$('#leader').setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);const sy=bubble.bottom-box.top;const side=a.left-box.left+point.bendX*a.width,start=cx-bubble.width/2+10;$('#leader-line').setAttribute('d',point.routeLeft?`M${start} ${sy}C${side} ${sy+12},${side} ${sy+12},${side} ${sy+27}V${y-8}Q${side} ${y},${side+8} ${y}H${x-8}`:`M${cx} ${sy}C${cx} ${sy+20},${x} ${y-25},${x} ${y-8}`);$('#leader-dot').setAttribute('cx',x);$('#leader-dot').setAttribute('cy',y);}
function teachingCopy(f){
 const c=narration(f),p=lessonPose(f,reduced),h=handoff(f,reduced);
 if(h?.inTransit){c.title='同一数值，进入下一步';c.body=['','','保留每行的匹配分数，先送入因果遮罩。','把遮罩后的分数送入指数运算；未来 D 仍为 −∞。','把每行的权重送入乘法，接下来读取对应的 V。','把各位置贡献送入加法；不是只选最大的一项。'][f.phase];}
 else if(f.phase===2){c.body='D 的分数变为 −∞，exp(−∞)=0。无论未来 V 多大，它都不进入当前的输出。';}
 else if(f.phase===3){
  c.title=p.collect<1?'先求一个共同分母':`${TOKENS[p.active]} 的份额，除以同一分母`;
  c.body=p.collect<1?'把各行的指数权重相加。未来 D 的指数为 0，不进入分母。':'短条按 0→100% 的共同刻度描出份额。这是混合信息的权重，不是抽取下一个 Token。';
 }else if(f.phase===4){c.title=`读取 ${TOKENS[p.active]} 的 V，再汇入结果`;c.body='虚线是 V，实色是读出的份额，同一刻度。非零贡献沿连线汇入底部；零值与未来位置不发出贡献。';}
 if(f.phase===5&&!h?.inTransit)c.body='保持 K/V 不变，试着切换查询方向。再只改未来 D 的 V：输出为何不变？查询归零后又是多少？';
 return c;
}
function render(){if(dead)return;const f=sample(time,{id,future}),c=teachingCopy(f),key=JSON.stringify(c);stage.render(f);if(key!==lastCopy){lastCopy=key;$('#copy-eyebrow').textContent=c.eyebrow;$('#copy-title').textContent=c.title;$('#copy-body').textContent=c.body;}$('#phase-label').textContent=`0${f.phase+1} / 06 · ${names[f.phase]}`;$('#counts').textContent=`当前位置 C · 单头单行`;$$('[data-id]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.id===id)));$('#future').value=future;$('#future-value').textContent=future;$('#timeline').value=time;$('#timeline').style.setProperty('--fill',`${time/DURATION*100}%`);$('#time').textContent=`00:${String(Math.floor(time)).padStart(2,'0')} / 00:48`;$('#play-label').textContent=playing?'暂停':time>=DURATION?'再看一遍':time?'继续讲解':'播放讲解';$('#play-icon').textContent=playing?'Ⅱ':'▶';$('#play').setAttribute('aria-pressed',String(playing));$('#back').disabled=time===0;$('#next').disabled=time===DURATION;$('#play-note').textContent=playing?'配置已收起 · 空格暂停':'六个步骤 · 从查询到加权和';$('#challenge').hidden=time<DURATION;anchor();}
function advance(now){if(playing){time=Math.min(DURATION,time+Math.max(0,now-last)/1000);last=now;}}
function stop(capture=true){if(capture)advance(performance.now());playing=false;cancelAnimationFrame(raf);focus(false);render();}
function tick(now){if(!playing)return;advance(now);render();if(time===DURATION)stop(false);else raf=requestAnimationFrame(tick);}
function play(){if(playing){stop();return;}if(time===DURATION)time=0;$('#play').focus({preventScroll:true});playing=true;focus(true);last=performance.now();render();raf=requestAnimationFrame(tick);}
function seek(t){stop();time=Math.max(0,Math.min(DURATION,t));render();}
$('#play').onclick=play;$('#timeline').oninput=e=>seek(+e.target.value);$('#back').onclick=()=>seek(STARTS.filter(t=>t<time-.1).at(-1)??0);$('#next').onclick=()=>seek(STARTS.find(t=>t>time+.1)??DURATION);$('#reset').onclick=()=>{stop();time=0;id=1;future=100;render();};
$$('[data-id]').forEach(b=>b.onclick=()=>{stop();id=+b.dataset.id;render();});$('#experiment').onclick=()=>{seek(40);$('#app [data-id="1"]').focus();};
$('#future').oninput=e=>{const value=+e.target.value;stop();future=value;render();};
function setReduced(value){reduced=value;$('#reduce-motion').checked=value;$('#app').classList.toggle('reduce-motion',value);render();}
$('#reduce-motion').onchange=e=>setReduced(e.target.checked);motion.addEventListener('change',e=>setReduced(e.matches));
function info(){stop();$('#info').showModal();}$('#about').onclick=info;$('#show-table').onclick=info;$('#close-info').onclick=()=>$('#info').close();
$('#challenge').onclick=()=>{stop();$('#feedback').textContent='';$('#quiz-try').hidden=true;$$('[data-answer]').forEach(b=>b.removeAttribute('aria-pressed'));$('#quiz').showModal();};
$$('[data-answer]').forEach(b=>b.onclick=()=>{$$('[data-answer]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#feedback').textContent=(b.dataset.answer==='mean'?'预测正确。':'输出为 10。')+'q 归零使所有匹配分数为 0；D 仍被遮罩，A/B/C 的权重各为 1/3。结果是 0/3 + 10/3 + 20/3 = 10，不是取最大值，也不是把未来的 1000 混入。';$('#quiz-try').hidden=false;});
$('#quiz-try').onclick=()=>{$('#quiz').close();id=0;future=1000;time=48;render();};$('#close-quiz').onclick=()=>$('#quiz').close();
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)stop();});document.addEventListener('keydown',e=>{if($('#info').open||$('#quiz').open)return;if(e.key==='Escape')stop();if(e.code==='Space'&&!['INPUT','BUTTON','A'].includes(e.target.tagName)){e.preventDefault();play();}});
const observer=new ResizeObserver(()=>{stage.resize();anchor();});observer.observe($('#artwork'));$('.exhibit').addEventListener('transitionend',anchor);window.addEventListener('pagehide',e=>{stop();if(!e.persisted){dead=true;observer.disconnect();stage.dispose();}});setReduced(reduced);
