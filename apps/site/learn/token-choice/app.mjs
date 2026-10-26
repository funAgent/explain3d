import {TOKENS,ZH,COLORS,STARTS,DURATION,sample,narration} from './model.mjs';
import {createStage} from './stage.mjs';
const $=selector=>document.querySelector(selector),$$=selector=>[...document.querySelectorAll(selector)];
const app=$('#app'),box=$('.exhibit'),art=$('#artwork'),bubble=$('#callout'),stage=createStage(art);
const motion=matchMedia('(prefers-reduced-motion: reduce)'),phaseNames=['候选分数','温度缩放','指数权重','概率归一化','随机采样','得到结果'];
let time=0,temperature=.8,draw=0,playing=false,raf=0,lastNow=0,lastCopy='',lastPhase=-1,disposed=false;
const settings=()=>({temperature,seed:22,draw});
const percent=x=>x>0&&x<.001?'<0.1':(x*100).toFixed(1);
const number=x=>x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
function focus(on){app.classList.toggle('is-playing',on);$$('.secondary').forEach(el=>{el.inert=on;el.setAttribute('aria-hidden',String(on));});}
function anchor(id){const outerRect=box.getBoundingClientRect(),bubbleRect=bubble.getBoundingClientRect();const top=Math.max(185,bubbleRect.bottom-outerRect.top+13);art.style.top=top+'px';const point=stage.projectAnchor(id);if(!point||!point.visible)return;const outer=box.getBoundingClientRect(),inner=art.getBoundingClientRect(),x=inner.left-outer.left+point.x*inner.width,y=inner.top-outer.top+point.y*inner.height;const half=bubble.offsetWidth/2,cx=Math.max(half+17,Math.min(outer.width-half-17,x));bubble.style.left=cx+'px';const sy=bubble.getBoundingClientRect().bottom-outer.top;$('#leader').setAttribute('viewBox',`0 0 ${outer.width} ${outer.height}`);$('#leader-line').setAttribute('d',`M${cx} ${sy} C${cx} ${sy+20},${x} ${Math.max(sy+20,y-24)},${x} ${y-8}`);$('#leader-dot').setAttribute('cx',x);$('#leader-dot').setAttribute('cy',y);}
function render(){if(disposed)return;const frame=sample(time,settings());frame.reducedMotion=motion.matches;stage.render(frame);const copy=narration(frame),key=JSON.stringify(copy);if(key!==lastCopy){lastCopy=key;$('#copy-eyebrow').textContent=copy.eyebrow;$('#copy-title').textContent=copy.title;$('#copy-body').textContent=copy.body;}
 $('#phase-label').textContent=`0${frame.phase+1} / 06 · ${phaseNames[frame.phase]}`;$('#live-temperature').textContent=`T = ${temperature.toFixed(2)}`;
 $('#temperature').value=temperature;$('#temperature-value').textContent=temperature.toFixed(2);$('#temperature').style.setProperty('--fill',((temperature-.4)/1.6*100)+'%');
 $$('[data-temperature]').forEach(button=>button.setAttribute('aria-pressed',String(Math.abs(+button.dataset.temperature-temperature)<.001)));
 $('#timeline').value=time;$('#timeline').style.setProperty('--fill',(time/DURATION*100)+'%');$('#timeline').setAttribute('aria-valuetext',`${time.toFixed(1)} 秒，共 ${DURATION} 秒，${phaseNames[frame.phase]}`);$('#time').textContent=`00:${String(Math.floor(time)).padStart(2,'0')} / 00:50`;
 $('#play-label').textContent=playing?'暂停':time>=DURATION?'再看一遍':time>0?'继续讲解':'播放讲解';$('#play-icon').textContent=playing?'Ⅱ':'▶';$('#play').setAttribute('aria-label',playing?'暂停讲解':time>=DURATION?'重新播放讲解':time>0?'继续讲解':'播放讲解');$('#play').setAttribute('aria-pressed',String(playing));
 $('#back').disabled=time<=0;$('#next').disabled=time>=DURATION;$('#play-note').textContent=playing?'配置已收起 · 空格暂停':'六个步骤 · 一条因果关系';
 $('#stage-note').textContent=frame.phase===5?`本次 u = ${frame.u.toFixed(4)} · 输入保持不变`:frame.phase===4?`u = ${frame.u.toFixed(4)} · 在 [0, 1) 上均匀取值`:frame.phase===2?'权重使用独立量程 · 当前总和 '+number(frame.totalWeight):'4 个完整教学候选 · 原始分数固定';
 $('#draw-again').hidden=frame.phase!==5;$('#challenge').hidden=frame.phase!==5;$('#detail').hidden=frame.phase===5;
 if(lastPhase!==frame.phase){lastPhase=frame.phase;box.dataset.phase=frame.phase;}
 anchor(frame.focus);
}
function advance(now){if(playing){time=Math.min(DURATION,time+Math.max(0,now-lastNow)/1000);lastNow=now;}}
function stop({capture=true}={}){if(playing&&capture)advance(performance.now());playing=false;cancelAnimationFrame(raf);raf=0;focus(false);render();}
function tick(now){if(!playing||disposed)return;advance(now);render();if(time>=DURATION){stop({capture:false});return;}raf=requestAnimationFrame(tick);}
function play(){if(playing){stop();return;}if(time>=DURATION)time=0;$('#play').focus({preventScroll:true});playing=true;focus(true);lastNow=performance.now();render();raf=requestAnimationFrame(tick);}
function seek(value){stop();time=Math.max(0,Math.min(DURATION,value));render();}
function changeTemperature(value){stop();temperature=Math.max(.4,Math.min(2,value));render();}
function drawAgain(){stop();draw++;time=STARTS[4];play();}
$('#play').onclick=play;$('#timeline').oninput=e=>seek(+e.target.value);$('#temperature').oninput=e=>changeTemperature(+e.target.value);$$('[data-temperature]').forEach(button=>button.onclick=()=>changeTemperature(+button.dataset.temperature));
$('#back').onclick=()=>seek(STARTS.filter(value=>value<time-.1).at(-1)??0);$('#next').onclick=()=>seek(STARTS.find(value=>value>time+.1)??DURATION);
$('#reset').onclick=()=>{stop();time=0;temperature=.8;draw=0;box.classList.remove('is-detailed');$('#detail').setAttribute('aria-pressed','false');$('#detail').textContent='放大细节 ⤢';render();};
$('#experiment').onclick=()=>{seek(STARTS[3]+7);$('#temperature').focus({preventScroll:true});};$('#new-draw').onclick=drawAgain;$('#draw-again').onclick=drawAgain;
$('#detail').onclick=()=>{const on=box.classList.toggle('is-detailed');$('#detail').setAttribute('aria-pressed',String(on));$('#detail').textContent=on?'恢复全景 ↙':'放大细节 ⤢';};
$('#calculation').onclick=()=>{stop();const frame=sample(time,settings());$('#calculation-summary').textContent=`温度 T = ${temperature.toFixed(2)}。每一行始终对应同一个候选。`;$('#formula').textContent=narration(frame).formula;
 $('#calculation-rows').innerHTML=TOKENS.map((token,i)=>`<tr><td><i style="background:${COLORS[i]}"></i>${token}</td><td>${number(frame.logits[i])}</td><td>${number(frame.scaled[i])}</td><td>${number(frame.weights[i])}</td><td>${percent(frame.p[i])}%</td></tr>`).join('');$('#calculation-total').textContent=`权重总和 ${number(frame.totalWeight)}　→　概率总和 100%`;$('#calculation-dialog').showModal();};
$('#challenge').onclick=()=>{stop();$('#challenge-feedback').textContent='';$('#challenge-try').hidden=true;$$('[data-answer]').forEach(button=>button.removeAttribute('aria-pressed'));$('#challenge-dialog').showModal();};
$$('[data-answer]').forEach(button=>button.onclick=()=>{const frame=sample(DURATION,{temperature:2,seed:22,draw:0}),correct=+button.dataset.answer===frame.selected;$$('[data-answer]').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));$('#challenge-feedback').textContent=`${correct?'预测正确。':'这次会选中 '+TOKENS[frame.selected]+'。'}T = 2 时，mat 区间结束于 ${frame.cdf[1].toFixed(4)}，floor 区间结束于 ${frame.cdf[2].toFixed(4)}。u = ${frame.u.toFixed(4)} 落在 floor 区间。原始分数和随机数都没有改变。`;$('#challenge-try').hidden=false;});
$('#challenge-try').onclick=()=>{$('#challenge-dialog').close();temperature=2;draw=0;time=DURATION;render();};$('#close-challenge').onclick=()=>$('#challenge-dialog').close();
$('#about').onclick=()=>{stop();$('#info').showModal();};$('#close-about').onclick=()=>$('#info').close();$('#close-calculation').onclick=()=>$('#calculation-dialog').close();
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)stop();});document.addEventListener('keydown',e=>{if($('#info').open||$('#calculation-dialog').open||$('#challenge-dialog').open)return;if(e.key==='Escape'){stop();return;}if(e.code==='Space'&&!['INPUT','BUTTON','A'].includes(e.target.tagName)){e.preventDefault();play();}});
motion.addEventListener('change',render);const resize=new ResizeObserver(()=>{stage.resize();anchor(sample(time,settings()).focus);});resize.observe(art);box.addEventListener('transitionend',()=>anchor(sample(time,settings()).focus));
window.addEventListener('pagehide',event=>{if(event.persisted){stop();return;}disposed=true;playing=false;cancelAnimationFrame(raf);stage.dispose();resize.disconnect();motion.removeEventListener('change',render);});render();
