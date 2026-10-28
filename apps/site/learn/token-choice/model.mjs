// A complete four-candidate teaching vocabulary, not live language-model output.
export const TOKENS=Object.freeze(['mat','floor','bed','sofa']);
export const ZH=Object.freeze(['地垫','地板','床','沙发']);
export const LOGITS=Object.freeze([3,2,1,0]);
export const COLORS=Object.freeze(['#6b8fc6','#9b84ca','#73a995','#c58b73']);
export const STARTS=Object.freeze([0,8,18,27,36,45]);
export const DURATION=50;
const FOCUS=Object.freeze(['scores','temperature','weights','probability','sampling','result']);
const sum=values=>values.reduce((total,value)=>total+value,0);

export function compute(temperature=.8){
 if(!Number.isFinite(temperature)||temperature<.4||temperature>2)throw new RangeError('Temperature must be between 0.4 and 2.');
 const logits=[...LOGITS],scaled=logits.map(z=>z/temperature);
 // These bounded toy scores make the literal exp(z/T) safe and inspectable.
 // General-purpose softmax should subtract its largest input before exp.
 const weights=scaled.map(z=>Math.exp(z)),totalWeight=sum(weights),p=weights.map(w=>w/totalWeight);
 const cdf=[0];for(const probability of p)cdf.push(cdf.at(-1)+probability);cdf[cdf.length-1]=1;
 return {temperature,logits,scaled,weights,totalWeight,p,cdf,entropy:-sum(p.map(value=>value*Math.log2(value)))};
}

export function choose(u,p){
 if(!Number.isFinite(u)||u<0||u>=1)throw new RangeError('Uniform sample must be in [0, 1).');
 if(!Array.isArray(p)||!p.length||p.some(value=>!Number.isFinite(value)||value<0)||Math.abs(sum(p)-1)>1e-10)throw new RangeError('Probabilities must be non-negative and sum to one.');
 let cumulative=0;
 for(let i=0;i<p.length;i++){cumulative+=p[i];if(p[i]>0&&u<cumulative)return i;}
 // A last-bit rounding difference may leave the cumulative sum just below 1.
 return p.findLastIndex(value=>value>0);
}

export function random(seed,index=0){
 if(!Number.isSafeInteger(seed)||!Number.isSafeInteger(index)||index<0)throw new RangeError('A finite integer seed and non-negative draw index are required.');
 let a=seed+Math.imul(index+1,1831565813)|0,t=Math.imul(a^a>>>15,1|a);
 t=t+Math.imul(t^t>>>7,61|t)^t;
 return ((t^t>>>14)>>>0)/4294967296;
}

export function sample(time,{temperature=.8,seed=22,draw=0}={}){
 if(!Number.isFinite(time))throw new RangeError('Time must be finite.');
 const t=Math.max(0,Math.min(DURATION,time)),phase=STARTS.findLastIndex(start=>start<=t);
 const end=STARTS[phase+1]??DURATION,progress=Math.min(1,(t-STARTS[phase])/(end-STARTS[phase]));
 const data=compute(temperature),u=random(seed,draw);
 const selected=phase>4||phase===4&&progress>=.8?choose(u,data.p):null;
 return {time:t,phase,progress,...data,u,selected,focus:FOCUS[phase]};
}

// Reveals one exact operation at a time; travel is a teaching pointer, not compute latency.
export function operation(frame){
 const local=frame.phase===3?Math.min(1,frame.progress/.27):frame.progress;
 const scaled=Math.min(3.999999,Math.max(0,local)*4),candidate=Math.floor(scaled),progress=scaled-candidate;
 const i=candidate;
 if(frame.phase===1)return {candidate,progress,input:frame.logits[i],operator:`÷ ${frame.temperature.toFixed(2)}`,output:frame.scaled[i]};
 if(frame.phase===2)return {candidate,progress,input:frame.scaled[i],operator:'exp',output:frame.weights[i]};
 if(frame.phase===3)return {candidate,progress,input:frame.weights[i],operator:`÷ ${frame.totalWeight.toFixed(2)}`,output:frame.p[i]};
 return null;
}

const number=value=>value.toFixed(2).replace(/\.00$/,'');
const percent=value=>value>0&&value<.001?'<0.1':(value*100).toFixed(1);

export function narration(frame){
 const {phase,temperature,scaled,weights,totalWeight,p,u,selected}=frame;
 const t=number(temperature);
 return [
  {eyebrow:'看这里 · 候选分数',title:'先有分数，还没有概率。',body:'同一个输入，四个候选各有一个分数。数值越大，倾向越强；它们还不是百分比。',formula:'教学分数 z = [3, 2, 1, 0]'},
  {eyebrow:'看这里 · 温度缩放',title:'除以温度，改变分数之间的差距。',body:`原始分数保持不变。T = ${t} 时，相邻候选的分差从 1 变为 ${number(1/temperature)}。`,formula:`3 ÷ ${t} = ${number(scaled[0])}；2 ÷ ${t} = ${number(scaled[1])}`},
  {eyebrow:'看这里 · 指数权重',title:'取指数，让分差变成权重之比。',body:'每个数经过指数运算，得到一个正的权重。高分候选获得更多权重，此时总和还不是 1。',formula:`exp(${number(scaled[0])}) = ${number(weights[0])}；权重总和 = ${number(totalWeight)}`},
  {eyebrow:'看这里 · 概率分布',title:frame.progress<.73?'每个权重除以总和，得到概率。':'除以总和，所有机会合成 100%。',body:frame.progress<.27?'每一项都除以同一个权重总和。运算条逐个对应四个候选。':frame.progress<.73?'同色连线始终连着同一个候选；数值不变，高度正变成区间宽度。':'四段合为 100%；区间越宽，被均匀随机数命中的机会越大。',formula:`P(mat) = ${number(weights[0])} ÷ ${number(totalWeight)} = ${percent(p[0])}%`},
  {eyebrow:'看这里 · 随机数游标',title:selected===null?'一个随机数，落入一个概率区间。':`游标落定，选中了 ${TOKENS[selected]}。`,body:'先生成 0 到 1 之间的均匀随机数。游标展示它的位置，落入哪个区间，就选哪个候选。',formula:`u = ${u.toFixed(4)}；选择满足 Cᵢ ≤ u < Cᵢ₊₁ 的候选`},
  {eyebrow:'看这里 · 这次的选择',title:`这次得到 ${TOKENS[selected]??'一个候选'}。`,body:`${selected===null?'':ZH[selected]+' · 概率 '+percent(p[selected])+'%。'}同一个输入再抽一次，可能选到别的候选。`,formula:'固定上下文的一次采样 · 本节没有继续生成后续 Token'}
 ][phase];
}
