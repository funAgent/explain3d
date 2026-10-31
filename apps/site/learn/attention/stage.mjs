import {TOKENS,COLORS} from './model.mjs';
import {lessonPose,pointOnPath,handoff} from './pose.mjs';
const NS='http://www.w3.org/2000/svg';
const INKS=['#3f6092','#73568f','#3e7560','#925b43'];
const fmt=x=>Number.isFinite(x)?x.toFixed(3).replace(/\.?0+$/,''):'−∞';
export function createStage(host,{reducedMotion=()=>false}={}){
 const svg=document.createElementNS(NS,'svg');host.append(svg);svg.style.cssText='width:100%;height:100%;overflow:visible';svg.setAttribute('role','img');let last,anchor=[195,25];
 function render(f){last=f;const mobile=host.clientWidth<600,W=mobile?390:900,H=500,pose=lessonPose(f,reducedMotion()),phase=f.phase,transfer=handoff(f,reducedMotion());
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.replaceChildren();
 const n=(tag,a,parent=svg)=>{const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(a))e.setAttribute(k,v);parent.append(e);return e;};
 const text=(x,y,s,size=18,c='#515d70',align='middle',parent=svg)=>{if(mobile)size=Math.max(size,18);const e=n('text',{x,y,'font-family':'ui-monospace,monospace','font-size':size,fill:COLORS.includes(c)?INKS[COLORS.indexOf(c)]:c,'text-anchor':align},parent);e.textContent=s;return e;};
 const line=(x,y,ex,ey,c='#c5cdd7',parent=svg)=>n('path',{d:`M${x} ${y}L${ex} ${ey}`,stroke:c,fill:'none','stroke-width':.8,'vector-effect':'non-scaling-stroke'},parent);
 const plate=(x,y,w,h,c='#f8f9fa',parent=svg)=>{
 // Quantitative faces stay frontal. Only the carrying plate has depth.
 n('rect',{x:x+3,y:y+5,width:w+4,height:h+3,rx:5,fill:'#8f9baa',opacity:.08},parent);
 n('path',{d:`M${x+w} ${y+4}l5 4v${h-4}l-5 -4Z`,fill:'#dfe5eb',stroke:'#b9c6d2','stroke-width':.7},parent);
 n('path',{d:`M${x+4} ${y+h}H${x+w}l5 4H${x+9}Z`,fill:'#d0d9e2',stroke:'#b9c6d2','stroke-width':.7},parent);
 n('rect',{x,y,width:w,height:h,rx:4,fill:c,stroke:'#bdcbd7','stroke-width':.85},parent);
 line(x+5,y+1,x+w-5,y+1,'#fff',parent);
 };
 const active=pose.active,c=COLORS[active],collecting=phase===3&&!transfer?.inTransit&&pose.collect<1;
 const arrived=(i,t=.9)=>i<active||i===active&&pose.travel>=t;
 plate(12,4,W-24,108);
 const titles=['查询 C · 一条 Q，四组 K/V',`逐项匹配 · ${TOKENS[active]}`, '先遮住未来 D，再做 Softmax',transfer?.inTransit?'分数 → 指数 → 共同分母':collecting?'共同分母 · 汇集全部指数权重':`同一个分母 · Σ exp(s) ≈ ${fmt(pose.denominator)}`,active===3?'未来 D · 权重为 0':`逐项读取 · ${TOKENS[active]}`,'所有贡献相加，不是挑最大的一项'];
 text(W/2,25,titles[phase],mobile?17:19,phase===2?COLORS[3]:c);
 let formula=`q ≈ [${fmt(f.q[0])}, 0]`;
 if(phase===1)formula=mobile?`(${fmt(f.q[0])}×${f.keys[active][0]} + 0) / √2 ≈ ${fmt(f.scores[active])}`:`(${fmt(f.q[0])} × ${f.keys[active][0]} + 0 × ${f.keys[active][1]}) / √2 ≈ ${fmt(f.scores[active])}`;
 if(phase===2)formula=`${fmt(f.scores[3])} → −∞ → exp(−∞) = 0`;
 if(phase===3&&transfer?.inTransit)formula=`exp(${fmt(f.masked[active])}) ≈ ${fmt(pose.weights[active])}`;
 if(phase===3&&!transfer?.inTransit)formula=`${fmt(pose.weights[active])} / ${fmt(pose.denominator)} ≈ ${(100*f.probs[active]).toFixed(1)}%`;
 if(phase===4)formula=`${(100*f.probs[active]).toFixed(1)}% × ${f.values[active]} ≈ ${f.terms[active].toFixed(3)}`;
 if(phase===5)formula=`${(active?pose.cumulative[active-1]:0).toFixed(3)} + ${f.terms[active].toFixed(3)} ≈ ${pose.cumulative[active].toFixed(3)}`;
 if(phase!==1&&!collecting)text(W/2,66,formula,mobile?17:22,c);
 if(collecting){
  const done=Math.min(4,Math.floor(pose.collect*4)),centers=[.15,.38,.61,.84].map(v=>v*W);
  for(let i=0;i<4;i++){const x=centers[i],on=i<=done;
   text(x,53,fmt(pose.weights[i]),mobile?17:21,on?COLORS[i]:'#a0a7af');
   if(i<3)text((x+centers[i+1])/2,53,'+',16);
   line(x,60,x,70,COLORS[i]);line(x,70,W/2,70,COLORS[i]);
  }
  const part=pose.weights.slice(0,done).reduce((a,b)=>a+b,0);
  formula=`Σ exp(s) ≈ ${fmt(part)}${done<4?' …':''}`;
  text(W/2,91,formula,mobile?17:21);
 }
 if(phase===1){
  const centers=[W*.27,W*.73],merge=W/2;
  for(let j=0;j<2;j++){
   const x=centers[j],on=pose.travel>=j*.28&&pose.travel<(j+1)*.28;
   n('rect',{x:x-(mobile?72:125),y:33,width:mobile?144:250,height:38,rx:4,fill:on?'#edf2f6':'#fffdfa',stroke:c,'stroke-width':on?1.2:.6});
   text(x,49,`${fmt(f.q[j])} × ${f.keys[active][j]}`,mobile?17:19,c);
   text(x,67,fmt(pose.products[j]),mobile?17:21,c);
   const path=[[x,71],[x,81],[merge,81],[merge,87]];
   n('path',{d:path.map((p,i)=>`${i?'L':'M'}${p.join(' ')}`).join(''),fill:'none',stroke:c,'stroke-width':.7});
   if(pose.travel>=.56&&pose.travel<.75){const dot=pointOnPath(path,(pose.travel-.56)/.19);n('circle',{cx:dot[0],cy:dot[1],r:3,fill:c});}
  }
  text(merge,108,`(${fmt(pose.products[0])} + ${fmt(pose.products[1])}) / √2 ≈ ${fmt(f.scores[active])}`,mobile?17:20,c);
 }
 if(phase===2)text(W/2,98,'展示遮罩规则；未来位置始终不参与',mobile?17:18,'#8e7466');
 if(phase===0)text(W/2,98,'同一行同色 · A → B → C → D',mobile?15:18);
 if((phase===3||phase===4)&&!collecting)text(W/2,98,transfer?.inTransit?'完整精度计算 · 交接时数值不变':'完整精度计算 · 展示值已取近似',mobile?17:18);

 const col1=mobile?135:285,col2=mobile?280:645,rowTop=145,rowStep=64;
 text(col1,133,['键 K','键 K','原始分数 s','指数权重 exp(s)','权重 × 内容 V','各位置贡献'][phase],16);
 text(col2,133,['内容 V','匹配分数','遮罩后 s̃','归一化权重','贡献 p × V','累计相加'][phase],16);
 for(let i=0;i<4;i++){
  const y=rowTop+i*rowStep,color=COLORS[i],g=n('g',{'data-position':TOKENS[i]});
  plate(20,y,W-40,50,i===3&&phase>=2?'#f2efeb':'#fffefa',g);
  if(!transfer?.inTransit&&!collecting&&phase!==0&&phase!==2&&i===active)n('rect',{x:20,y,width:W-40,height:50,rx:4,fill:'none',stroke:color,'stroke-width':1.4},g);
  n('rect',{x:21,y:y+5,width:3,height:40,rx:1,fill:color},g);
  text(45,y+28,TOKENS[i],22,color,'middle',g);
  let left='',right='';
  if(phase===0){left=`[${f.keys[i].join(', ')}]`;right=String(f.values[i]);}
  if(phase===1){left=`[${f.keys[i].join(', ')}]`;right=fmt(f.scores[i]);}
  if(phase===2){left=fmt(f.scores[i]);right=fmt(f.masked[i]);}
  if(phase===3){left=fmt(pose.weights[i]);right=`${(100*f.probs[i]).toFixed(1)}%`;}
  if(phase===4){left=`${(100*f.probs[i]).toFixed(1)}% × ${f.values[i]}`;right=f.terms[i].toFixed(3);}
  if(phase===5){left=f.terms[i].toFixed(3);right=pose.cumulative[i].toFixed(3);}
  if(transfer?.inTransit){
   const t=transfer.progress,x=col2+(col1-col2)*t;
   line(col2,y+40,col1,y+40,color,g);
   text(x,y+28,`${transfer.unit}${f.phase>=4?'≈':'='}${Number.isFinite(transfer.values[i])?f.phase===4?(100*transfer.values[i]).toFixed(1)+'%':fmt(transfer.values[i]):'−∞'}`,mobile?17:21,color,'middle',g);
  }else{
   text(col1,y+28,left,mobile?17:21,color,'middle',g);
   const scoreArrived=phase===1?arrived(i,.9):phase===3?!collecting&&arrived(i):phase===4?arrived(i,.55):phase===5?arrived(i,.6):true;
   if(scoreArrived)text(col2,y+28,right,mobile?17:21,color,'middle',g);
  }
  if(phase===1&&i===active&&pose.travel>=.75&&pose.travel<.9){
   const path=[[W/2,114],[W-12,114],[W-12,y+28],[col2,y+28]],q=(pose.travel-.75)/.15,point=pointOnPath(path,q);
   n('path',{d:path.map((p,j)=>`${j?'L':'M'}${p.join(' ')}`).join(''),fill:'none',stroke:color,'stroke-width':.7});
   text(point[0],point[1],fmt(f.scores[i]),mobile?17:21,color);
  }
  if(phase===3&&!transfer?.inTransit){
   const full=mobile?116:250,x=col2-full/2,reveal=collecting?0:i<active?1:i===active?Math.min(1,pose.travel/.9):0;
   n('rect',{x,y:y+37,width:full,height:6,rx:2,fill:'#e9edf1'},g);
   if(reveal>0)n('rect',{x,y:y+37,width:full*f.probs[i]*reveal,height:6,rx:2,fill:color},g);
   for(const t of [0,.5,1])line(x+full*t,y+44,x+full*t,y+47,'#bbc5ce',g);
  }
  if(phase===4&&!transfer?.inTransit&&i<3){
   const full=mobile?110:230,x=col1-full/2,yb=y+36;
   // Outline is V, filled length is pV, both on the same 0..20 scale. A zero V stays zero.
   n('rect',{x,y:yb,width:full*f.values[i]/20,height:7,fill:'none',stroke:color,'stroke-width':.7,'stroke-dasharray':'2 2'},g);
   const computed=arrived(i,.55),reveal=i<active?1:i===active?Math.min(1,pose.travel/.55):0;
   if(reveal>0)n('rect',{x,y:yb,width:full*f.terms[i]/20*reveal,height:7,fill:color},g);
   if(computed)line(x+full*f.terms[i]/20,yb-2,x+full*f.terms[i]/20,yb+10,color,g);
  }
  if(phase===2&&i===3){const x=W-23-(W-46)*pose.mask;n('rect',{x,y:y+2,width:(W-46)*pose.mask,height:46,fill:'#d6cbbf',opacity:.16},g);line(W-32,y+6,x+5,y+44,color,g);}
  // Continuous trace links an exact operation to its owning row; values never interpolate.
  if((phase===1||phase===3||phase===5)&&!transfer?.inTransit&&!collecting){const x=col1+(col2-col1)*pose.travel;if(i===active){line(col1,y+33,col2,y+33,color,g);n('circle',{cx:x,cy:y+33,r:3,fill:color,stroke:'#fff'},g);}}
 }
 // V contributions travel to cumulative slots; final segment lengths use shared 0..20 scale.
 const bx=30,bw=W-60,by=438;
 if(phase>=4){let start=0;for(let i=0;i<4;i++){
  const w=bw*f.terms[i]/20,x=bx+bw*start/20;const q=phase===5?1:pose.flights[i];
  if(w>0&&q===1)n('rect',{x,y:by,width:w,height:16,fill:COLORS[i]});
  const sx=W-20,sy=rowTop+i*rowStep+25,tx=x+w/2,corridor=W-14+i*3;
  const path=[[sx,sy],[corridor,sy],[corridor,by-2],[tx,by-2],[tx,by+8]];
  if(phase===4&&!transfer?.inTransit&&w>0&&q>0){n('circle',{cx:sx,cy:sy,r:2.5,fill:'#fffdfa',stroke:COLORS[i],'stroke-width':1});n('path',{d:path.map((p,j)=>`${j?'L':'M'}${p.join(' ')}`).join(''),fill:'none',stroke:COLORS[i],'stroke-width':.7,'stroke-dasharray':'2 3'});}
  if(phase===4&&w>0&&q>0&&q<1){const dot=pointOnPath(path,q);n('circle',{cx:dot[0],cy:dot[1],r:4,fill:COLORS[i],stroke:'#fff'});}
  start+=f.terms[i];
 }line(bx,by+22,bx+bw,by+22);for(const v of [0,10,20]){const x=bx+bw*v/20;line(x,by+20,x,by+25);text(x,by+43,String(v),16);}
 const allArrived=phase===5||pose.flights.every((q,i)=>f.terms[i]===0||q===1);
 text(W/2,by-10,allArrived?`最终输出 o ≈ ${f.output.toFixed(3)}`:mobile?'虚线 V · 实色 pV · 同尺度 0→20':'虚线是 V，实色是 pV · 同一 0→20 刻度',mobile?17:20,'#66527e');
 }else text(W/2,474,phase===3?'每条长度用同一 0 → 100% 刻度':'手写教学 Q/K/V · 不运行真实模型',16,'#7d7285');
 anchor=phase===2?[24,rowTop+3*rowStep+25]:phase===4?[24,rowTop+active*rowStep+25]:[W/2,4];
 svg.setAttribute('aria-label',`当前位置 C；阶段 ${phase+1}；${formula}。当前跟踪 ${TOKENS[active]}；未来 D 不参与输出`);
 }
 return {render,projectAnchor(){const m=svg.getScreenCTM(),r=host.getBoundingClientRect();if(!m||!r.width)return null;const pt=svg.createSVGPoint();pt.x=anchor[0];pt.y=anchor[1];const z=pt.matrixTransform(m);return{x:(z.x-r.left)/r.width,y:(z.y-r.top)/r.height,routeLeft:last.phase===2||last.phase===4,bendX:12/(host.clientWidth<600?390:900)};},resize(){if(last)render(last);},dispose(){svg.remove();}};
}
