export const TOKENS=['A','B','C','D'],COLORS=['#6b8fc6','#9b84ca','#73a995','#c58b73'];
export const STARTS=[0,7,15,23,31,40],DURATION=48;
export function calculate(alpha=1,future=100){if(![-1,0,1].includes(alpha)||!Number.isFinite(future)||future<0||future>1000)throw new RangeError('Invalid teaching input');const q=[Math.SQRT2*alpha,0],keys=[[-1,0],[0,0],[1,0],[2,0]],values=[0,10,20,future],scores=keys.map(k=>(q[0]*k[0]+q[1]*k[1])/Math.sqrt(2)),masked=scores.map((s,i)=>i>2?-Infinity:s),max=Math.max(...masked),weights=masked.map(s=>Math.exp(s-max)),sum=weights.reduce((a,b)=>a+b),probs=weights.map(w=>w/sum),terms=values.map((v,i)=>v*probs[i]);return {alpha,future,q,keys,values,scores,masked,weights,probs,terms,output:terms.reduce((a,b)=>a+b)};}
export function sample(t,{id=1,future=100}={}){t=Number.isFinite(t)?Math.max(0,Math.min(DURATION,t)):0;const phase=STARTS.findLastIndex(x=>t>=x);return {...calculate(id,future),time:t,phase,progress:(t-STARTS[phase])/((STARTS[phase+1]??DURATION)-STARTS[phase])};}
export function narration(f){return [
{title:'C 正在读取谁的信息？',body:'当前查询位置是 C。A、B、C 可以参与；D 在未来。本页只计算这一行、一个头，Q/K 是二维，V 用一个数简化展示。'},
{title:'Q 和 K 相比，得到分数',body:`q = [${f.q[0].toFixed(3)}, 0]；分数 sⱼ = q·kⱼ / √2。A、B、C、D 的分数为 ${f.scores.map(x=>x.toFixed(1)).join('、')}。分数还不是权重。`},
{title:'先挡住未来，再分配权重',body:`D 的分数 ${f.scores[3].toFixed(1)} 被改为 −∞，指数为 0。它不进入分母；即使它的 V 是 ${f.future}，也不能参与当前输出。`},
{title:'可见位置共同分到 100%',body:`指数归一化（Softmax）后：A ${(f.probs[0]*100).toFixed(1)}%、B ${(f.probs[1]*100).toFixed(1)}%、C ${(f.probs[2]*100).toFixed(1)}%、D 0%。这里是信息混合的权重，不是在抽取下一个 Token。`},
{title:'用权重乘 V，而不是乘 K',body:`各通道贡献为 ${f.terms.map(x=>x.toFixed(3)).join(' + ')}。Q/K 决定读多少，V 提供读出的内容；这些贡献会全部相加，不只取最大的一项。`},
{title:`得到一个混合结果：${f.output.toFixed(3)}`,body:'保持 K/V 固定，切换查询方向，观察输出改变；再拖动未来 D 的 V，输出应保持不变。检验理解：查询归零后，输出会是多少？'}
].map((c,i)=>({...c,eyebrow:`0${i+1} · ${['INPUT','Q × K','CAUSAL MASK','SOFTMAX','WEIGHT × VALUE','SUM & TRY'][i]}`}))[f.phase];}
