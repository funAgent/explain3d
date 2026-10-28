import {TOKENS,COLORS} from './model.mjs';
import {lessonPose} from './pose.mjs';
const NS='http://www.w3.org/2000/svg';
const fmt=x=>Number.isFinite(x)?x.toFixed(3).replace(/\.?0+$/,''):'−∞';
export function createStage(host,{reducedMotion=()=>false}={}){
 const svg=document.createElementNS(NS,'svg');host.append(svg);svg.style.cssText='width:100%;height:100%;overflow:visible';svg.setAttribute('role','img');let last,anchor=[195,25];
 function render(f){last=f;const mobile=host.clientWidth<600,W=mobile?390:900,H=450,pose=lessonPose(f,reducedMotion()),phase=f.phase;
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.replaceChildren();
 const n=(tag,a,parent=svg)=>{const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(a))e.setAttribute(k,v);parent.append(e);return e;};
 const text=(x,y,s,size=18,c='#515d70',align='middle',parent=svg)=>{const e=n('text',{x,y,'font-family':'ui-monospace,monospace','font-size':size,fill:c,'text-anchor':align},parent);e.textContent=s;return e;};
 const line=(x,y,ex,ey,c='#c5cdd7',parent=svg)=>n('path',{d:`M${x} ${y}L${ex} ${ey}`,stroke:c,fill:'none','stroke-width':.8,'vector-effect':'non-scaling-stroke'},parent);
 const plate=(x,y,w,h,c='#f8f9fa',parent=svg)=>{
 n('path',{d:`M${x+5} ${y+h}H${x+w}l5 -4V${y+4}l-5 -4H${x+5}l-5 4V${y+h-4}Z`,fill:'#e7ebef',stroke:'#bbc7d3','stroke-width':.65},parent);
 n('rect',{x,y,width:w,height:h,rx:4,fill:c,stroke:'#c7d1db','stroke-width':.65},parent);line(x+4,y+1,x+w-4,y+1,'#fff',parent);
 };
 const active=pose.active,c=COLORS[active];
 plate(12,4,W-24,62);
 const titles=['查询 C · Q/K 决定读多少，V 提供内容',`逐项匹配 · ${TOKENS[active]}`, '先遮住未来 D，再做 Softmax',`同一个分母 · Σ exp(s) = ${fmt(pose.denominator)}`,`逐项读取 · ${TOKENS[active]}`,'所有贡献相加，不是挑最大的一项'];
 text(W/2,25,titles[phase],mobile?16:19,phase===2?COLORS[3]:c);
 let formula=`q = [${fmt(f.q[0])}, 0]`;
 if(phase===1)formula=mobile?`(${fmt(f.q[0])}×${f.keys[active][0]} + 0) / √2 = ${fmt(f.scores[active])}`:`(${fmt(f.q[0])} × ${f.keys[active][0]} + 0 × ${f.keys[active][1]}) / √2 = ${fmt(f.scores[active])}`;
 if(phase===2)formula=`${fmt(f.scores[3])} → −∞ → exp(−∞) = 0`;
 if(phase===3)formula=`${fmt(pose.weights[active])} / ${fmt(pose.denominator)} = ${(100*f.probs[active]).toFixed(1)}%`;
 if(phase===4)formula=`${f.probs[active].toFixed(3)} × ${f.values[active]} = ${f.terms[active].toFixed(3)}`;
 if(phase===5)formula=`o = ${f.output.toFixed(3)}`;
 text(W/2,50,formula,mobile?17:22,c);
 const col1=mobile?135:285,col2=mobile?280:645,rowTop=99,rowStep=64;
 text(col1,87,['键 K','点积 / √2','原分数 → 遮罩','指数权重 exp(s)','权重 × 内容 V','各位置贡献'][phase],16);
 text(col2,87,['内容 V','匹配分数','参与当前输出？','归一化权重','贡献 p × V','累计相加'][phase],16);
 for(let i=0;i<4;i++){
  const y=rowTop+i*rowStep,color=COLORS[i],g=n('g',{'data-position':TOKENS[i]});
  plate(20,y,W-40,50,i===3&&phase>=2?'#f2efeb':'#fffefa',g);
  n('rect',{x:21,y:y+5,width:3,height:40,rx:1,fill:color},g);
  text(45,y+28,TOKENS[i],22,color,'middle',g);
  let left='',right='';
  if(phase===0){left=`[${f.keys[i].join(', ')}]`;right=String(f.values[i]);}
  if(phase===1){left=`[${f.keys[i].join(', ')}]`;right=fmt(f.scores[i]);}
  if(phase===2){left=i===3?`${fmt(f.scores[i])} → −∞`:fmt(f.scores[i]);right=i===3?'未来 · 阻断':'可见 · 保留';}
  if(phase===3){left=fmt(pose.weights[i]);right=`${(100*f.probs[i]).toFixed(1)}%`;}
  if(phase===4){left=`${f.probs[i].toFixed(3)} × ${f.values[i]}`;right=f.terms[i].toFixed(3);}
  if(phase===5){left=f.terms[i].toFixed(3);right=pose.cumulative[i].toFixed(3);}
  text(col1,y+28,left,mobile?17:21,color,'middle',g);text(col2,y+28,right,mobile?17:21,color,'middle',g);
  if(phase===3){n('rect',{x:col2-(mobile?58:125),y:y+37,width:mobile?116:250,height:6,rx:2,fill:'#e9edf1'},g);n('rect',{x:col2-(mobile?58:125),y:y+37,width:(mobile?116:250)*f.probs[i],height:6,rx:2,fill:color},g);}
  if(phase===2&&i===3){const x=W-23-(W-46)*pose.mask;n('rect',{x,y:y+2,width:(W-46)*pose.mask,height:46,fill:'#d6cbbf',opacity:.16},g);line(W-32,y+6,x+5,y+44,color,g);}
  // Continuous trace links an exact operation to its owning row; values never interpolate.
  if(phase===1||phase===3){const x=col1+(col2-col1)*pose.travel;if(i===active){line(col1,y+33,col2,y+33,color,g);n('circle',{cx:x,cy:y+33,r:3,fill:color,stroke:'#fff'},g);}}
 }
 // V contributions travel to cumulative slots; final segment lengths use shared 0..20 scale.
 const bx=30,bw=W-60,by=390;
 if(phase>=4){let start=0;for(let i=0;i<4;i++){
  const w=bw*f.terms[i]/20,x=bx+bw*start/20;const q=phase===5?1:pose.flights[i];
  n('rect',{x,y:by,width:w,height:16,fill:COLORS[i],opacity:.25});
  if(w>0)n('rect',{x,y:by,width:w,height:16,fill:COLORS[i],opacity:q});
  const sx=col2,sy=rowTop+i*rowStep+34,tx=x+w/2;
  if(phase===4&&w>0&&q>0&&q<1){n('circle',{cx:sx+(tx-sx)*q,cy:sy+(by-sy)*q,r:4,fill:COLORS[i],stroke:'#fff'});}
  start+=f.terms[i];
 }line(bx,by+22,bx+bw,by+22);for(const v of [0,10,20]){const x=bx+bw*v/20;line(x,by+20,x,by+25);text(x,by+43,String(v),16);}
 text(W/2,by-10,`最终输出 o = ${f.output.toFixed(3)}`,20,'#66527e');
 }else text(W/2,414,phase===3?'每条长度用同一 0 → 100% 刻度':'手写教学 Q/K/V · 不运行真实模型',16,'#7d7285');
 anchor=phase===2?[24,rowTop+3*rowStep+25]:phase===4?[bx,by+8]:[W/2,4];
 svg.setAttribute('aria-label',`当前位置 C；阶段 ${phase+1}；${formula}。${phase>=3?'权重 '+f.probs.join('、'):''}`);
 }
 return {render,projectAnchor(){const m=svg.getScreenCTM(),r=host.getBoundingClientRect();if(!m||!r.width)return null;const pt=svg.createSVGPoint();pt.x=anchor[0];pt.y=anchor[1];const z=pt.matrixTransform(m);return{x:(z.x-r.left)/r.width,y:(z.y-r.top)/r.height,routeLeft:last.phase===2||last.phase===4,bendX:12/(host.clientWidth<600?390:900)};},resize(){if(last)render(last);},dispose(){svg.remove();}};
}
