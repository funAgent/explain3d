import {TOKENS,TABLE,COLORS} from './model.mjs';
const NS='http://www.w3.org/2000/svg';
const node=(tag,attrs,parent)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n;};
export function createStage(host,{reducedMotion=()=>false}={}){
 const svg=node('svg',{role:'img','viewBox':'0 0 1000 360'},host);svg.style.cssText='width:100%;height:100%;overflow:visible';let anchor=[0,0],last,key='';
 function render(f){last=f;const mobile=host.clientWidth<600,W=mobile?500:1000,H=360,p=reducedMotion()?1:f.progress,k=[f.id,f.phase,mobile,reducedMotion(),f.phase===2||f.phase===3?Math.round(p*180):''].join('|');if(k===key)return;key=k;svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${W} ${H}`);const color=COLORS[f.id];
 const text=(x,y,s,size=18,fill='#777487',align='middle')=>{const n=node('text',{x,y,'text-anchor':align,fill,'font-size':size,'font-family':'ui-monospace,monospace'},svg);n.textContent=s;return n;};
 const line=(x1,y1,x2,y2,c='#d8d5dc',dash='')=>node('line',{x1,y1,x2,y2,stroke:c,'stroke-width':1,'stroke-dasharray':dash},svg);
 const rect=(x,y,w,h,c='#fffdfa',stroke='#ddd7df',r=6)=>node('rect',{x,y,width:w,height:h,rx:r,fill:c,stroke,'stroke-width':.8},svg);
 const plate=(x,y,w,h,c)=>{node('path',{d:`M${x} ${y}l6 -5h${w}l-6 5Z`,fill:'#fff',stroke:'#d6d6df','stroke-width':.7},svg);rect(x,y,w,h,'#fdfbfa',c);line(x+4,y+3,x+w-4,y+3,'#fff');};
 const arrow=(x,y,a,b,c,width=2)=>{line(x,y,a,b,c);const ang=Math.atan2(b-y,a-x),sz=7;node('path',{d:`M${a} ${b}L${a-sz*Math.cos(ang-.42)} ${b-sz*Math.sin(ang-.42)}M${a} ${b}L${a-sz*Math.cos(ang+.42)} ${b-sz*Math.sin(ang+.42)}`,stroke:c,fill:'none','stroke-width':width},svg);};
 if(f.phase<3){
  const tx=mobile?83:160,ty=mobile?78:70,tw=mobile?334:350,rh=38,ox=mobile?130:660,oy=mobile?300:138,ow=mobile?240:240;
  plate(mobile?145:170,0,210,34,color);text(mobile?250:275,24,`${f.token}  ·  ID ${f.id}`,21,color);
  text(tx+tw/2,ty-14,'E · 4 行 × 2 列',16,'#9a8aa5');
  text(tx+12,ty+13,'ID / Token',12,'#a798ac','start');text(tx+tw-105,ty+13,'x₁',14);text(tx+tw-40,ty+13,'x₂',14);
  TABLE.forEach((v,i)=>{const y=ty+24+i*rh,hot=i===f.id&&f.phase>=1,c=COLORS[i];plate(tx,y,tw,rh-3,hot?c:'#ddd7df');if(hot)node('rect',{x:tx+1,y:y+1,width:tw-2,height:rh-5,rx:5,fill:c,'fill-opacity':.13},svg);node('circle',{cx:tx+13,cy:y+17,r:3,fill:c},svg);text(tx+28,y+23,`${i}  ${TOKENS[i]}`,19,c,'start');text(tx+tw-105,y+23,v[0].toFixed(1),20,hot?c:'#88818e');text(tx+tw-40,y+23,v[1].toFixed(1),20,hot?c:'#88818e');});
  const sy=ty+24+f.id*rh;
  if(f.phase>=1){const bx=tx-13;node('path',{d:`M${bx+6} ${sy+1}H${bx}v${rh-5}h6`,stroke:color,fill:'none','stroke-width':1.5},svg);anchor=[tx-8,sy+17];}else anchor=[mobile?145:170,28];
  if(!mobile){line(tx+tw+15,sy+17,ox-18,oy+25,'#d7cbdc','3 4');}
  rect(ox-8,oy-8,ow+16,66,'#f3f0f5','#ddd5e3');text(ox+ow/2,oy-20,'输出向量 e = E[id]',15,'#9a8aa5');
  if(f.phase<2)text(ox+ow/2,oy+30,'[  ?,  ?  ]',23,'#b6aabd');
  if(f.phase===2){const u=Math.min(1,p*1.65),q=u*u*(3-2*u),sx=tx+tw-147,sw=130,dx=ox+(ow-180)/2,x=sx+(dx-sx)*q,y=sy+(oy-sy)*q,w=sw+(180-sw)*q;rect(x,y,w,rh-3,'#fffdfa',color);text(x+w/2,y+23,`[${f.vector.map(n=>n.toFixed(1)).join(', ')}]`,20,color);anchor=mobile?[ox-15,oy+17]:[x-5,y+17];if(!mobile)text(780,250,'整行取出 · 数值保持不变',17,'#9a8aa5');}
 }else{
  // Exact front-plane coordinates. The same scale is used on both axes.
  const cx=mobile?245:500,cy=176,unit=41,xy=v=>[cx+v[0]*unit,cy-v[1]*unit];
  for(let n=-3;n<=3;n++){line(cx-3*unit,cy+n*unit,cx+3*unit,cy+n*unit,'#efebef');line(cx+n*unit,cy-3*unit,cx+n*unit,cy+3*unit,'#efebef');if(n){text(cx+n*unit,cy+17,String(n),12,'#aaa0af');text(cx-13,cy-n*unit+4,String(n),12,'#aaa0af');}}
  arrow(cx-135,cy,cx+143,cy,'#b1a8b8',1);arrow(cx,cy+135,cx,cy-143,'#b1a8b8',1);text(cx+160,cy+5,'x₁',17);text(cx+1,cy-154,'x₂',17);text(cx-12,cy+17,'0',12,'#aaa0af');
  const end=xy(f.vector),reference=xy(f.reference);
  if(f.phase===3){const u=Math.min(1,p*1.7),h=Math.min(1,u*2),v=Math.max(0,u*2-1),px=cx+(end[0]-cx)*h,py=cy+(end[1]-cy)*v;line(cx,cy,end[0],cy,color,'3 3');line(end[0],cy,end[0],end[1],color,'3 3');arrow(cx,cy,px,py,color,2);node('circle',{cx:px,cy:py,r:4,fill:color},svg);anchor=[end[0]+8,end[1]];text(mobile?250:W/2,334,`x₁ = ${f.vector[0]}    x₂ = ${f.vector[1]}`,20,color);}
  else{
   if(f.id!==0){arrow(cx,cy,...reference,COLORS[0],2);node('circle',{cx:reference[0],cy:reference[1],r:3.5,fill:COLORS[0]},svg);text(reference[0]+9,reference[1]-12,'cat [2, 1]',15,COLORS[0],'start');line(...reference,...end,'#c8b5d4','4 4');}
   arrow(cx,cy,...end,color,2);node('circle',{cx:end[0],cy:end[1],r:4,fill:color},svg);text(end[0]+(f.vector[0]<0?-10:10),end[1]+(f.id===2?22:-14),`${f.token} [${f.vector.join(', ')}]`,16,color,f.vector[0]<0?'end':'start');anchor=[end[0]+(f.vector[0]<0?-8:8),end[1]];
   const bx=mobile?40:85,by=mobile?317:140;
   if(!mobile){text(bx,by,'对照 cat · [2, 1]',17,COLORS[0],'start');text(bx,by+35,`距离  ${f.distance.toFixed(3)}`,21,'#8a6fa1','start');text(bx,by+66,`余弦  ${f.cosine.toFixed(3)}`,21,'#8a6fa1','start');text(bx,by+100,'距离越小，端点越接近',12,'#9a8aa5','start');text(bx,by+122,'余弦越接近 1，方向越一致',12,'#9a8aa5','start');}
   else{text(W/2,by,`与 cat：距离 ${f.distance.toFixed(3)} · 余弦 ${f.cosine.toFixed(3)}`,17,'#8a6fa1');text(W/2,by+26,'虚线看距离 · 余弦越近 1，方向越一致',12,'#9a8aa5');}
  }
  if(!mobile){text(800,150,'e = E['+f.id+']',23,color);text(800,185,'['+f.vector.join(', ')+']',26,color);text(800,219,'输入 ID → 一行参数',13,'#9a8aa5');}
 }
 svg.setAttribute('aria-label',`${f.token} 的 ID 为 ${f.id}，阶段 ${f.phase+1}。查表向量 [${f.vector.join(', ')}]。${f.phase>=4?`与 cat 的距离 ${f.distance.toFixed(3)}，方向余弦 ${f.cosine.toFixed(3)}。`:''}`);
 }
 return {render,projectAnchor(){const m=svg.getScreenCTM(),r=host.getBoundingClientRect();if(!m||!r.width||!r.height)return null;const point=svg.createSVGPoint();point.x=anchor[0];point.y=anchor[1];const p=point.matrixTransform(m);return{x:(p.x-r.left)/r.width,y:(p.y-r.top)/r.height,visible:true,routeLeft:(host.clientWidth<600&&last.phase<3)||(last.phase>=3&&last.vector[0]<0),bendX:((host.clientWidth<600?20:300)*m.a+m.e-r.left)/r.width};},resize(){key='';if(last)render(last);},dispose(){svg.remove();}};
}
