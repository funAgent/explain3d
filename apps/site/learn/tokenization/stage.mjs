import {VOCAB,RULES} from './model.mjs';
const NS='http://www.w3.org/2000/svg',colors=['#6b8fc6','#9b84ca','#73a995','#c58b73','#87a7b4',' #a3b68c'];
const node=(tag,attrs,parent)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n;};
export function createStage(host){
 const svg=node('svg',{viewBox:'0 0 900 360',role:'img','aria-label':'文字片段按规则合并，再查表变成编号'},host);svg.style.cssText='width:100%;height:100%;overflow:visible';let anchors={},last,lastKey='';
 function render(f){last=f;const mobile=host.clientWidth<600,W=mobile?500:900,key=[f.phase,f.step,f.word,f.limit,W].join('|');if(key===lastKey)return;lastKey=key;svg.setAttribute('viewBox',`0 0 ${W} 360`);svg.replaceChildren();const text=(x,y,s,size=18,fill='#6d687b',anchor='middle')=>{const t=node('text',{x,y,'font-size':size,fill,'text-anchor':anchor,'font-family':'ui-monospace,monospace'},svg);t.textContent=s;return t;};
 const xs=(start,end)=>40+(W-80)*(start+end)/2/f.word.length,barX=40,barW=W-80;
 text(W/2,25,f.phase===0?'固定输入 / 一个英文词':f.phase===4?'同一张教学词表 / 固定索引':f.phase===5?'解码 / 保持原来的顺序':'同一个输入 / 观察边界怎样变化',mobile?13:15,'#9c8aab');
 // Engraved input rail stays spatially aligned with the token spans.
 node('path',{d:`M38 72H${W-35}l8 -6H46Z`,fill:'#fbfcff',stroke:'#d3d9e2','stroke-width':.7},svg);
 [...f.word].forEach((char,i)=>{text(xs(i,i+1),61,char,20,'#9a94a3');node('line',{x1:xs(i,i+1),x2:xs(i,i+1),y1:77,y2:96,stroke:'#ded7e5','stroke-dasharray':'2 4'},svg);});
 const rowY=115,rowH=70;
 f.current.forEach((p,i)=>{const x=barX+barW*p.start/f.word.length+3,w=barW*(p.end-p.start)/f.word.length-6,c=colors[p.start%colors.length],hot=f.rule&&f.current[i+1]&&p.text===f.rule[0]&&f.current[i+1].text===f.rule[1];
 node('path',{d:`M${x} ${rowY}l7 -6h${w}l-7 6Z`,fill:'#eef1f6',stroke:'#c4cedb','stroke-width':.6},svg);
 node('rect',{x,y:rowY,width:w,height:rowH,rx:4,fill:c,'fill-opacity':.25,stroke:c,'stroke-width':hot?1.8:.7},svg);node('path',{d:`M${x+3} ${rowY+3}h${w-6}`,stroke:'#fff','stroke-width':1.3},svg);
 text(x+w/2,rowY+43,p.text,mobile?25:30,'#536078');
 if(f.phase>=4){const id=VOCAB.indexOf(p.text);node('path',{d:`M${x+w/2} 192V220`,stroke:c,'stroke-width':1},svg);node('rect',{x:x+w/2-28,y:223,width:56,height:37,rx:5,fill:'#fbf8fc',stroke:c,'stroke-width':.7},svg);text(x+w/2,248,String(id),21,'#80669b');}
 });
 if(f.phase===2){const index=Math.min(f.step,f.limit-1),rule=RULES[index];text(W/2,232,f.rule?`${f.rule[0]} + ${f.rule[1]} → ${f.rule.join('')}`:'规则应用完毕',mobile?20:24,'#8a70a3');text(W/2,265,f.limit?`按优先顺序应用规则 · 已完成 ${f.step} / ${f.limit}`:'字符版本 · 不使用合并规则',mobile?12:14,'#9b8ba7');}
 if(f.phase===3)text(W/2,238,`${f.word.length} 个字母 → ${f.pieces.length} 个 Token`,mobile?19:23,'#8b72a5');
 if(f.phase===4)text(W/2,307,f.pieces.map(p=>`${p.text} ↦ ${VOCAB.indexOf(p.text)}`).join('    '),mobile?15:18,'#8b72a5');
 if(f.phase===5){text(W/2,305,`[${f.ids.join(', ')}] → ${f.decoded}`,mobile?22:27,'#80689c');text(W/2,338,'同一词表解码 · 与输入逐字相同',mobile?12:14,'#9a8ba7');}
 if(f.phase<2)text(W/2,259,f.phase===0?'不是按空格数计算 Token':'本例只处理预设英文词；空格与字节级编码另有规则',mobile?13:16,'#9989a6');
 const match=f.rule?f.current.findIndex((p,i)=>p.text===f.rule[0]&&f.current[i+1]?.text===f.rule[1]):-1;const a=f.current[Math.max(0,match)];anchors={focus:match>=0?[xs(a.start,f.current[match+1].end),115]:f.phase===2?[W/2,232]:[xs(a.start,a.end)+(f.phase>=4?28:0),f.phase>=4?238:115]};
 svg.setAttribute('aria-label',`${f.word}，阶段${f.phase+1}，当前片段 ${f.current.map(p=>p.text).join('、')}${f.phase>=4?'；编号 '+f.ids.join('、'):''}。`);
 }
 return {render,projectAnchor:()=>{const a=anchors.focus,m=svg.getScreenCTM(),r=host.getBoundingClientRect();if(!a||!m)return null;const p=svg.createSVGPoint();p.x=a[0];p.y=a[1];const q=p.matrixTransform(m);return{x:(q.x-r.left)/r.width,y:(q.y-r.top)/r.height,visible:true};},resize(){if(last)render(last);},dispose(){svg.remove();}};
}
