import {TOKENS,COLORS} from './model.mjs';
const NS='http://www.w3.org/2000/svg';
export function createStage(host,{reducedMotion=()=>false}={}){
 const svg=document.createElementNS(NS,'svg');host.append(svg);svg.style.cssText='width:100%;height:100%;overflow:visible';svg.setAttribute('role','img');let last,key='',anchor=[250,0];
 function render(f){last=f;const mobile=host.clientWidth<600,W=mobile?500:900,H=360,cw=(W-70)/4,p=reducedMotion()?1:Math.min(1,f.progress*1.7),k=[W,f.phase,f.alpha,f.future,f.phase===4?Math.round(p*120):''].join('|');if(k===key)return;key=k;svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.replaceChildren();
 const n=(tag,attrs)=>{const el=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);svg.append(el);return el;};
 const text=(x,y,s,size=18,color='#6b6478',align='middle')=>{const el=n('text',{x,y,'font-family':'ui-monospace,monospace','font-size':size,fill:color,'text-anchor':align});el.textContent=s;};
 const rect=(x,y,w,h,fill,stroke='#ded8e3',rx=5)=>n('rect',{x,y,width:w,height:h,rx,fill,stroke,'stroke-width':.8});
 const line=(x,y,a,b,c='#d4cadc',dash='')=>n('path',{d:`M${x} ${y}L${a} ${b}`,stroke:c,fill:'none','stroke-dasharray':dash,'stroke-width':1});
 rect(W/2-140,3,280,33,'#f4f0f7');text(W/2,26,`查询 C：q = [${f.q[0].toFixed(2)}, 0]`,18,'#80669f');
 for(let i=0;i<4;i++){const x=35+i*cw,center=x+cw/2,c=COLORS[i],blocked=i===3&&f.phase>=2;
 n('path',{d:`M${x} 58l5 -4h${cw-10}l-5 4Z`,stroke:'#d8d3df',fill:'#fff','stroke-width':.7});rect(x,58,cw-10,87,blocked?'#eeebe9':'#fffdfa',blocked?'#c9c3bd':c);
 text(center-5,81,TOKENS[i]+(i===2?' · 当前':i===3?' · 未来':''),16,blocked?'#a2988f':c);
 text(center-5,108,`K=[${f.keys[i].join(',')}]`,mobile?15:17,blocked?'#b4aaa2':'#7d7488');text(center-5,134,`V=${f.values[i]}`,18,blocked?'#b4aaa2':c);
 if(f.phase>=1){text(center-5,172,blocked?'−∞':f.scores[i].toFixed(1),22,blocked?'#a99c91':c);if(blocked){line(x+8,92,x+cw-18,118,'#c8b9ae');text(center-5,195,'已遮罩',13,'#a8998e');}}
 if(f.phase>=3){const bw=cw-24;rect(x+3,204,bw,10,'#eeebef');rect(x+3,204,bw*f.probs[i],10,c,c,2);text(center-5,239,`${(f.probs[i]*100).toFixed(1)}%`,19,blocked?'#ad9f93':c);}
 if(f.phase===3)text(center-5,267,`exp=${i===3?'0':Math.exp(f.scores[i]).toFixed(3)}`,14,blocked?'#ad9f93':c);
 if(f.phase>=4){const q=f.phase===4?p:1;line(center-5,249,center-5,249+11*q,c,blocked?'2 4':'');text(center-5,281,`${f.terms[i].toFixed(3)}`,17,blocked?'#ad9f93':c);}
 }
 if(f.phase===0)text(W/2,213,'输入：一条查询 + 四组 K/V',18,'#8d7c9e');
 if(f.phase===1)text(W/2,223,'分数 sⱼ = q·kⱼ / √2',21,'#8d7c9e');
 if(f.phase===2)text(W/2,245,'未来 D：exp(−∞) = 0',21,'#9a8474');
 if(f.phase===3)text(W/2,329,`p = exp(s) / ${f.scores.slice(0,3).reduce((s,v)=>s+Math.exp(v),0).toFixed(3)}`,17,'#8d7c9e');
 if(f.phase>=3){text(W/2,f.phase===3?286:303,f.phase===3?'各条宽度：权重 0 → 100%':'每一项：pⱼ × Vⱼ',15,'#9b89a9');}
 if(f.phase>=4){const bx=65,bw=W-130,q=f.phase===4?p:1;let offset=0;for(let i=0;i<4;i++){const w=bw*f.terms[i]/20*q;rect(bx+offset,314,w,17,COLORS[i],COLORS[i],0);offset+=w;}line(bx,336,bx+bw,336);text(bx,354,'0',12,'#aa9bb3');text(bx+bw,354,'20',12,'#aa9bb3');text(W/2,354,`输出 o = ${f.output.toFixed(3)}`,19,'#80669f');}
 anchor=f.phase===0?[W/2,3]:f.phase===1?[28,165]:f.phase===2?[W-31,166]:f.phase===3?[30,209]:f.phase===4?[28,276]:[65,322];
 svg.setAttribute('aria-label',`当前位置 C，查询 ${f.alpha}，阶段 ${f.phase+1}；${f.phase>=3?'权重 '+f.probs.map(x=>x.toFixed(4)).join('、'):''}${f.phase>=4?'；输出 '+f.output.toFixed(3):''}`);
 }
 return {render,projectAnchor(){const m=svg.getScreenCTM(),r=host.getBoundingClientRect();if(!m||!r.width)return null;const pt=svg.createSVGPoint();pt.x=anchor[0];pt.y=anchor[1];const z=pt.matrixTransform(m);return {x:(z.x-r.left)/r.width,y:(z.y-r.top)/r.height,routeLeft:last.phase>0&&last.phase!==2,bendX:(m.a*12+m.e-r.left)/r.width};},resize(){key='';if(last)render(last);},dispose(){svg.remove();}};
}
