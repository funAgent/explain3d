/**
 * A mathematical scene for Explain3D. Original vector geometry, inspired by
 * Anatomy's disciplined strokes and surface hierarchy. No wheel geometry reused.
 * Numerical lengths are front-face lengths; shallow extrusion only conveys depth.
 */
const NS='http://www.w3.org/2000/svg';
const TOKENS=['mat','floor','bed','sofa'];
const CHINESE=['地垫','地板','床','沙发'];
const COLORS=['#6b8fc6','#9b84ca','#73a995','#c58b73'];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
const mix=(a,b,t)=>a+(b-a)*t;
const f=x=>Math.round(x*100)/100;
const value=x=>x>=1000?x.toFixed(0):x>=100?x.toFixed(1):x>=10?x.toFixed(2):x.toFixed(3).replace(/0+$/,'').replace(/\.$/,'');
const percent=p=>p===0?'0%':p===1?'100%':p<.001?'<0.1%':p>.999?'>99.9%':`${(p*100).toFixed(1)}%`;
const css=`
 :host{display:block;width:100%;height:100%;min-height:0;color:#334056;font-family:Inter,"PingFang SC","Microsoft YaHei",system-ui,sans-serif}
 svg{display:block;width:100%;height:100%;overflow:visible;contain:layout style}
 path,line,rect,circle{vector-effect:non-scaling-stroke}
 text{user-select:none;paint-order:stroke;stroke:none;text-rendering:geometricPrecision}
 .axis{font:11px ui-monospace,SFMono-Regular,Consolas,monospace;fill:#8290a1}
 .token{font:25px Georgia,"Times New Roman",serif;fill:#3a4657;letter-spacing:.1px}
 .translation{font-size:11px;fill:#7e8795}
 .number{font:18px ui-monospace,SFMono-Regular,Consolas,monospace;fill:#485872;font-variant-numeric:tabular-nums}
 .note{font-size:12px;fill:#778292;letter-spacing:.15px}
 .formula{font:17px ui-monospace,SFMono-Regular,Consolas,monospace;fill:#5a6680;font-variant-numeric:tabular-nums}
 .small{font:11px ui-monospace,SFMono-Regular,Consolas,monospace;fill:#8992a0}
 .fine{fill:none;stroke:#c3ccd5;stroke-width:.6;stroke-linecap:round;stroke-linejoin:round}
 .guide{fill:none;stroke:#b2bfce;stroke-width:.6;stroke-dasharray:2 4}
 .grid{stroke:#dfe5ea;stroke-width:.5}
 .bright{stroke:#fff;stroke-width:1;fill:none}
 .mobile .axis{font-size:13px}.mobile .number{font-size:18px}.mobile .note{font-size:13px}.mobile .small{font-size:12px}.mobile .translation{font-size:12px}.mobile .token{font-size:23px}.mobile .formula{font-size:16px}
`;

function node(tag,attrs={},parent){const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));parent?.append(n);return n;}
function attr(n,a){for(const[k,v]of Object.entries(a))n.setAttribute(k,String(v));}
function text(n,s){if(n.textContent!==String(s))n.textContent=String(s);}
function poly(points){return points.map(([x,y],i)=>`${i?'L':'M'}${f(x)} ${f(y)}`).join('')+'Z';}
function bevel(x,y,w,h,b=2){b=Math.min(b,w/3,h/3);return poly([[x+b,y],[x+w-b,y],[x+w,y+b],[x+w,y+h-b],[x+w-b,y+h],[x+b,y+h],[x,y+h-b],[x,y+b]]);}

export function createStage(host){
 const root=host.shadowRoot??host.attachShadow({mode:'open'});root.innerHTML='';
 const style=document.createElement('style');style.textContent=css;root.append(style);
 const svg=node('svg',{viewBox:'0 0 1000 560',preserveAspectRatio:'xMidYMid meet',role:'img','aria-label':'四个候选词的分数、温度缩放、指数权重、概率和采样过程'},root);
 const desc=node('desc',{},svg);text(desc,'教学用四候选分布。图形的正面高度表示数值；侧面厚度只表示层次。');
 const defs=node('defs',{},svg);
 const floorGradient=node('linearGradient',{id:'tc-floor',x1:0,y1:0,x2:0,y2:1},defs);node('stop',{offset:0,'stop-color':'#fdfefe'},floorGradient);node('stop',{offset:1,'stop-color':'#edf1f4'},floorGradient);
 const goldGradient=node('linearGradient',{id:'tc-gold',x1:0,y1:0,x2:0,y2:1},defs);node('stop',{offset:0,'stop-color':'#f4d799'},goldGradient);node('stop',{offset:1,'stop-color':'#d7ac57'},goldGradient);
 const glow=node('filter',{id:'tc-shadow',x:'-40%',y:'-100%',width:'180%',height:'300%'},defs);node('feGaussianBlur',{stdDeviation:4},glow);
 const gradients=COLORS.map((c,i)=>{const g=node('linearGradient',{id:`tc-bar-${i}`,x1:0,y1:0,x2:1,y2:0},defs);const a=node('stop',{offset:0,'stop-color':c,'stop-opacity':.48},g),b=node('stop',{offset:.83,'stop-color':c,'stop-opacity':.28},g);node('stop',{offset:1,'stop-color':'#fff','stop-opacity':.7},g);return[a,b];});
 const axisGroup=node('g',{},svg),axisTicks=[];
 const plotBacking=node('path',{fill:'#f5f7f9',opacity:.6},axisGroup);
 const gridGroup=node('g',{},axisGroup);
 for(let i=0;i<=4;i++){const g=node('g',{},gridGroup);axisTicks.push({line:node('line',{class:'grid'},g),tick:node('line',{class:'fine'},g),label:node('text',{class:'axis','text-anchor':'end'},g)});}
 const axisSpine=node('path',{class:'fine'},axisGroup),axisName=node('text',{class:'small','text-anchor':'start'},axisGroup);
 const baseGroup=node('g',{},svg),baseShadow=node('path',{fill:'#9daab9',opacity:.1,filter:'url(#tc-shadow)'},baseGroup),baseTop=node('path',{fill:'url(#tc-floor)',stroke:'#d3dbe3','stroke-width':.6},baseGroup),baseFront=node('path',{fill:'#e9eef3',stroke:'#c7d2dd','stroke-width':.6},baseGroup),baseShine=node('path',{class:'bright'},baseGroup);
 const barGroup=node('g',{},svg);
 const bars=TOKENS.map((token,i)=>{
  const g=node('g',{'data-candidate':token},barGroup);
  const ghost=node('path',{class:'guide',opacity:0},g);
  const side=node('path',{fill:COLORS[i],opacity:.32,stroke:'#a4b1c1','stroke-width':.6},g);
  const front=node('path',{fill:`url(#tc-bar-${i})`,stroke:COLORS[i],'stroke-opacity':.65,'stroke-width':.65},g);
  const top=node('path',{fill:'#f8fbfe',stroke:'#a6b5c5','stroke-width':.6},g);
  const shine=node('path',{class:'bright',opacity:.9},g);
  const seam=node('path',{fill:'none',stroke:COLORS[i],'stroke-opacity':.25,'stroke-width':.5},g);
  const foot=node('path',{fill:'url(#tc-floor)',stroke:'#b8c5d1','stroke-width':.6},g);
  g.append(ghost);
  const operation=node('g',{opacity:0},g),operationLine=node('path',{fill:'none',stroke:COLORS[i],'stroke-width':.7},operation),operationDot=node('circle',{r:2.4,fill:COLORS[i]},operation);
  const number=node('text',{class:'number','text-anchor':'middle'},g);
  const original=node('text',{class:'small','text-anchor':'middle',opacity:0},g);
  const labelGroup=node('g',{},g),dot=node('circle',{r:3.5,fill:COLORS[i]},labelGroup),label=node('text',{class:'token','text-anchor':'middle'},labelGroup),translation=node('text',{class:'translation','text-anchor':'middle'},labelGroup);
  text(label,token);text(translation,CHINESE[i]);
  return{g,ghost,side,front,top,shine,seam,foot,operation,operationLine,operationDot,number,original,labelGroup,dot,label,translation};
 });
 const bandScale=node('g',{opacity:0},svg),bandTicks=[];
 for(let i=0;i<=20;i++){const tick=node('line',{class:'fine'},bandScale);const label=i%5===0?node('text',{class:'axis','text-anchor':'middle'},bandScale):null;bandTicks.push({tick,label});}
 const bandBounds=node('g',{},bandScale),bounds=Array.from({length:3},()=>node('path',{fill:'none',stroke:'#b0bdca','stroke-width':.65},bandBounds));
 const formulaGroup=node('g',{},svg),formulaBack=node('path',{fill:'#fcfdfd',stroke:'#dce2e8','stroke-width':.6},formulaGroup),formulaBottom=node('path',{class:'fine',opacity:.55},formulaGroup),formulaLabel=node('text',{class:'formula','text-anchor':'middle'},formulaGroup);
 const weightScaleNote=node('text',{class:'small','text-anchor':'middle',opacity:0},formulaGroup);
 const bandLeaders=node('g',{opacity:0},svg),labelLeaders=Array.from({length:4},()=>node('path',{fill:'none',stroke:'#b9c6d3','stroke-width':.6},bandLeaders));
 const cursorGroup=node('g',{opacity:0},svg),cursorGlow=node('line',{stroke:'#d8b972','stroke-width':6,opacity:.14},cursorGroup),cursorLine=node('line',{stroke:'#bc9144','stroke-width':1},cursorGroup),cursorHead=node('path',{fill:'url(#tc-gold)',stroke:'#ae884b','stroke-width':.65},cursorGroup),cursorReadout=node('text',{class:'small','text-anchor':'middle'},cursorGroup),cursorNumber=node('text',{class:'number','text-anchor':'middle',fill:'#9b783a'},cursorGroup);
 const resultGroup=node('g',{opacity:0},svg),resultLink=node('path',{class:'guide'},resultGroup),resultShadow=node('rect',{rx:8,fill:'#8998ab',opacity:.1,filter:'url(#tc-shadow)'},resultGroup),resultSide=node('path',{fill:'#e4eaf0',stroke:'#c7d3df','stroke-width':.6},resultGroup),resultPlate=node('rect',{rx:8,fill:'#fff',stroke:'#becbd9','stroke-width':.7},resultGroup),resultAccent=node('rect',{height:3,rx:1.5},resultGroup),resultToken=node('text',{class:'token','text-anchor':'middle','font-size':30},resultGroup),resultProbability=node('text',{class:'small','text-anchor':'middle'},resultGroup),resultTitle=node('text',{class:'small','text-anchor':'middle'},resultGroup);
 let lastFrame=null,disposed=false,anchors={},width=1000,height=560;
 function render(frame){
  if(disposed)return;lastFrame=frame;
  const mobile=host.getBoundingClientRect().width<600; width=mobile?560:1000;height=mobile?430:420;
  attr(svg,{viewBox:`0 0 ${width} ${height}`,class:mobile?'mobile':'desktop'});
  const phase=clamp(frame.phase,0,5),pr=clamp(frame.progress??0),P=frame.p,T=frame.temperature;
  const cdf=frame.cdf?.length===5?frame.cdf:[0,...P.map((_,i)=>P.slice(0,i+1).reduce((a,b)=>a+b,0))];
  const chosen=frame.selected,base=mobile?290:285,plotH=mobile?214:225,barW=mobile?62:110,dx=mobile?7:11,dy=mobile?5:8;
  const xs=mobile?[91,202,313,424]:[130,345,560,775];
  const axisX=mobile?64:87,plotEnd=xs[3]+barW+dx;
  const bandX=mobile?52:110,bandW=mobile?456:780,bandY=170,bandH=mobile?68:72;
  let morph=phase>3?1:phase===3?ease((pr-.27)/.46):0;
  if(frame.reducedMotion&&phase===3)morph=pr>=.5?1:0;
  const isBand=morph>.99,chartOpacity=1-morph;
  let values=frame.logits,max=4,axisTitle='原始分数 z';
  if(phase===1){values=frame.scaled;max=8;axisTitle='缩放分数 z / T';}
  if(phase===2){values=frame.weights;max=Math.max(...values);axisTitle='指数权重 exp(z / T)';}
  if(phase>=3){values=P;max=1;axisTitle='概率 p';}
  attr(axisGroup,{opacity:chartOpacity});attr(baseGroup,{opacity:chartOpacity});
  attr(plotBacking,{d:poly([[axisX,base],[axisX,base-plotH],[plotEnd,base-plotH],[plotEnd,base]])});
  attr(axisSpine,{d:`M${axisX} ${base-plotH-8}V${base}H${plotEnd+12}`});
  attr(axisName,{x:axisX,y:base-plotH-25});text(axisName,axisTitle);
  axisTicks.forEach((a,i)=>{const y=base-plotH*i/4;attr(a.line,{x1:axisX,y1:y,x2:plotEnd,y2:y});attr(a.tick,{x1:axisX-4,y1:y,x2:axisX,y2:y});attr(a.label,{x:axisX-12,y:y+4});text(a.label,phase>=3?`${i*25}%`:value(max*i/4));});
  const bx=xs[0]-25,bw=plotEnd-bx+24,by=base+8;
  attr(baseShadow,{d:poly([[bx-6,by+12],[bx+bw+12,by+12],[bx+bw+19,by+26],[bx,by+26]])});
  attr(baseTop,{d:poly([[bx,by],[bx+dx,by-dy],[bx+bw+dx,by-dy],[bx+bw,by]])});
  attr(baseFront,{d:poly([[bx,by],[bx+bw,by],[bx+bw,by+8],[bx,by+8]])});
  attr(baseShine,{d:`M${bx+1} ${by+.8}H${bx+bw-1}`});
  bars.forEach((b,i)=>{
   const color=frame.color===false?['#8e9bad','#9eabba','#aeb9c5','#bdc7d0'][i]:COLORS[i];
   gradients[i].forEach(stop=>stop.setAttribute('stop-color',color));attr(b.side,{fill:color});attr(b.front,{stroke:color});attr(b.dot,{fill:color});attr(b.seam,{stroke:color});
   const h=Math.max(0,values[i]/max*plotH),targetX=bandX+cdf[i]*bandW,targetW=P[i]*bandW;
   const x=mix(xs[i],targetX,morph),y=mix(base-h,bandY,morph),w=mix(barW,targetW,morph),hh=mix(h,bandH,morph);
   const depthX=mix(dx,mobile?5:8,morph),depthY=mix(dy,mobile?4:6,morph);
   const active=phase>=4&&chosen!==null,muted=active&&i!==chosen;
   attr(b.g,{opacity:muted?.49:1});
   attr(b.front,{d:bevel(x,y,w,Math.max(.5,hh),Math.min(2,w/5))});
   attr(b.side,{d:poly([[x+w,y],[x+w+depthX,y-depthY],[x+w+depthX,y+hh-depthY],[x+w,y+hh]])});
   attr(b.top,{d:poly([[x,y],[x+depthX,y-depthY],[x+w+depthX,y-depthY],[x+w,y]]),opacity:hh>.5?1:0});
   attr(b.shine,{d:`M${f(x+1.5)} ${f(y+1.7)}H${f(x+w-1.5)}M${f(x+1.5)} ${f(y+1.7)}V${f(y+hh-1.5)}`,opacity:w>4&&hh>4?.8:0});
   attr(b.seam,{d:`M${f(x+4)} ${f(y+hh-4)}H${f(x+w-4)}`,opacity:hh>10&&w>12?.8:0});
   attr(b.foot,{d:poly([[xs[i]-4,base+1],[xs[i]+barW+5,base+1],[xs[i]+barW+dx+5,base-dy+1],[xs[i]+barW+dx+5,base+1],[xs[i]+barW+5,base+dy+1],[xs[i]-4,base+dy+1]]),opacity:chartOpacity});
   const ghostH=frame.logits[i]/8*plotH;attr(b.ghost,{d:bevel(xs[i]-4,base-ghostH,barW+8,Math.max(.4,ghostH),0),opacity:phase===1?.9:0});
   attr(b.operation,{opacity:phase===1&&i<3&&Math.abs(h-ghostH)>2?1:0});
   const ox=xs[i]+barW+17,oy=base-ghostH,ey=base-h,travel=frame.reducedMotion?1:ease((pr-.12)/.65);
   attr(b.operationLine,{d:`M${ox-4} ${f(oy)}H${ox}V${f(ey)}H${ox-4}`,stroke:color});
   attr(b.operationDot,{cx:ox,cy:mix(oy,ey,travel),fill:color});
   const nx=xs[i]+barW/2;attr(b.number,{x:nx,y:base-h-18,opacity:chartOpacity});text(b.number,phase>=3?percent(P[i]):value(values[i]));
   attr(b.original,{x:nx,y:base+22,opacity:phase===1?1:0});text(b.original,`z = ${frame.logits[i]}`);
   const lx=mix(nx,bandX+bandW*(i+.5)/4,morph),ly=mix(base+(phase===1?53:48),bandY+bandH+69,morph);
   attr(b.labelGroup,{transform:`translate(${f(lx)} ${f(ly)})`});attr(b.label,{x:0,y:0});attr(b.translation,{x:0,y:19});attr(b.dot,{cx:-(mobile?25:28),cy:-7});
   text(b.translation,isBand?percent(P[i]):CHINESE[i]);
  });
  attr(bandScale,{opacity:morph});
  bandTicks.forEach((a,i)=>{const x=bandX+bandW*i/20;attr(a.tick,{x1:x,y1:bandY-18,x2:x,y2:bandY-(i%5===0?29:23)});if(a.label){attr(a.label,{x,y:bandY-38});text(a.label,phase>=4?(i/20).toFixed(i===0||i===20?0:2):`${i*5}%`);}});
  bounds.forEach((p,i)=>{const x=bandX+cdf[i+1]*bandW;attr(p,{d:`M${f(x)} ${bandY+bandH+4}V${bandY+bandH+12}`});});
  attr(bandLeaders,{opacity:morph});
  labelLeaders.forEach((leader,i)=>{const sx=bandX+(cdf[i]+P[i]/2)*bandW,ex=bandX+bandW*(i+.5)/4,sy=bandY+bandH+7,ey=bandY+bandH+40;attr(leader,{d:`M${f(sx)} ${sy}C${f(sx)} ${sy+14},${f(ex)} ${ey-13},${f(ex)} ${ey}`,stroke:frame.color===false?'#a7b3c0':COLORS[i],opacity:.55});});
  const formulaY=mobile?378:365,fw=mobile?490:570;
  attr(formulaBack,{d:bevel((width-fw)/2,formulaY,fw,44,7)});attr(formulaBottom,{d:`M${(width-fw)/2+7} ${formulaY+47}H${(width+fw)/2-7}`});attr(formulaLabel,{x:width/2,y:formulaY+(phase===2?18:28)});
  const sum=frame.weights.reduce((a,b)=>a+b,0),selected=chosen??0;
  const formulas=[`z = [ ${frame.logits.join(' , ')} ]`,`z / T     T = ${T.toFixed(2)}`,`wᵢ = exp(zᵢ / T)`,`pᵢ = wᵢ / Σw     Σp = 100%`,`u = ${frame.u.toFixed(3)}     u ∈ [0, 1)`,`本次选择  ${TOKENS[selected]}   ·   ${percent(P[selected])}`];
  text(formulaLabel,formulas[phase]);
  attr(weightScaleNote,{x:width/2,y:formulaY+35,opacity:phase===2?1:0});text(weightScaleNote,`高度按最大权重 ${value(max)} 缩放 · Σw = ${value(sum)}`);
  const cursorTravel=phase>4?1:frame.reducedMotion?(pr>=.8?1:0):ease(pr/.8),cursorX=bandX+frame.u*bandW*cursorTravel;
  attr(cursorGroup,{opacity:phase===4?1:0});attr(cursorGlow,{x1:cursorX,y1:bandY-10,x2:cursorX,y2:bandY+bandH+8});attr(cursorLine,{x1:cursorX,y1:bandY-10,x2:cursorX,y2:bandY+bandH+8});attr(cursorHead,{d:poly([[cursorX-6,bandY-19],[cursorX+6,bandY-19],[cursorX+6,bandY-11],[cursorX,bandY-5],[cursorX-6,bandY-11]])});
  attr(cursorReadout,{x:width/2,y:bandY-85,opacity:0});text(cursorReadout,chosen===null?'定位随机数':'已落入对应区间');attr(cursorNumber,{x:width/2,y:bandY-60,opacity:0});text(cursorNumber,chosen===null?`x = ${(frame.u*cursorTravel).toFixed(3)}`:`u = ${frame.u.toFixed(3)}`);
  const resultT=phase===5?(frame.reducedMotion?1:ease(pr/.3)):0;
  attr(resultGroup,{opacity:phase===5?1:0});
  const resultW=mobile?156:174,resultH=77,segmentX=bandX+(cdf[selected]+P[selected]/2)*bandW,resultX=clamp(segmentX,resultW/2+28,width-resultW/2-28),resultY=mix(bandY-12,bandY-(mobile?100:118),resultT);
  attr(resultLink,{d:`M${f(resultX)} ${f(resultY+resultH)}C${f(resultX)} ${f(resultY+resultH+12)},${f(segmentX)} ${bandY-16},${f(segmentX)} ${bandY+8}`});
  attr(resultShadow,{x:resultX-resultW/2+2,y:resultY+6,width:resultW,height:resultH});
  attr(resultSide,{d:poly([[resultX-resultW/2,resultY+resultH-5],[resultX+resultW/2,resultY+resultH-5],[resultX+resultW/2+7,resultY+resultH-12],[resultX+resultW/2+7,resultY+resultH-4],[resultX+resultW/2,resultY+resultH+3],[resultX-resultW/2,resultY+resultH+3]])});
  attr(resultPlate,{x:resultX-resultW/2,y:resultY,width:resultW,height:resultH});attr(resultAccent,{x:resultX-resultW/2+15,y:resultY+12,width:resultW-30,fill:COLORS[selected]});attr(resultToken,{x:resultX,y:resultY+43});text(resultToken,TOKENS[selected]);attr(resultProbability,{x:resultX,y:resultY+62});text(resultProbability,`${CHINESE[selected]}  ·  ${percent(P[selected])}`);attr(resultTitle,{x:resultX,y:resultY-13});text(resultTitle,'SELECTED TOKEN');
  anchors={scores:[xs[0]+barW*.5,base-frame.logits[0]/4*plotH*.72],temperature:[xs[0]+barW+17,base-frame.scaled[0]/8*plotH*.72],weights:[xs[0]+barW/2,base-plotH*.7],probability:morph>.5?[bandX+P[0]*bandW*.5,bandY+bandH/2]:[xs[0]+barW/2,base-P[0]*plotH*.7],cursor:[cursorX,bandY+bandH/2],sampling:[cursorX,bandY+bandH/2],result:[resultX,resultY+12]};
  const spoken=phase<3?TOKENS.map((token,i)=>`${token} ${phase===0?'原始分数':phase===1?'缩放分数':'指数权重'} ${value(values[i])}`).join('，'):TOKENS.map((token,i)=>`${token} 概率 ${percent(P[i])}`).join('，');
  text(desc,`阶段 ${phase+1}。温度 ${T.toFixed(2)}。${spoken}。${chosen===null?'尚未完成采样。':`本次选中 ${TOKENS[chosen]}。`}`);
 }
 function projectAnchor(id){const a=anchors[id]??anchors.probability??[width/2,height/2],m=svg.getScreenCTM(),r=host.getBoundingClientRect();if(!m||!r.width||!r.height)return{x:.5,y:.5,visible:false};const p=svg.createSVGPoint();p.x=a[0];p.y=a[1];const q=p.matrixTransform(m),x=(q.x-r.left)/r.width,y=(q.y-r.top)/r.height;return{x,y,visible:x>=0&&x<=1&&y>=0&&y<=1};}
 return{backend:'svg',render,projectAnchor,resize(){if(lastFrame)render(lastFrame);},dispose(){disposed=true;root.innerHTML='';lastFrame=null;}};
}
