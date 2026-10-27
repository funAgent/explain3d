export const TOKENS=Object.freeze(['cat','car','dog','book']);
export const COLORS=Object.freeze(['#6b8fc6','#c58b73','#73a995','#9b84ca']);
export const TABLE=Object.freeze([[2,1],[-2,1],[1.8,1.2],[-1,-2]].map(Object.freeze));
export const DURATION=44,STARTS=[0,6,13,22,30,38];
export function lookup(id){if(!Number.isInteger(id)||id<0||id>=TABLE.length)throw new RangeError('Token ID must be 0…3');return [...TABLE[id]];}
export function compare(a,b){const dot=a[0]*b[0]+a[1]*b[1],normA=Math.hypot(...a),normB=Math.hypot(...b);if(!normA||!normB)throw new RangeError('Cosine undefined for zero vector');return {dot,normA,normB,cosine:dot/normA/normB,distance:Math.hypot(a[0]-b[0],a[1]-b[1])};}
export function sample(t,{id=1}={}){const vector=lookup(id);t=Number.isFinite(t)?Math.max(0,Math.min(DURATION,t)):0;const phase=STARTS.findLastIndex(x=>t>=x),end=STARTS[phase+1]??DURATION;return {time:t,phase,progress:(t-STARTS[phase])/(end-STARTS[phase]),id,token:TOKENS[id],vector,reference:lookup(0),...compare(vector,lookup(0))};}
export function narration(f){const v='['+f.vector.join(', ')+']';return [
 {eyebrow:'01 · INPUT',title:'编号是一张地址标签',body:`输入是 ${f.token} 的 ID ${f.id}。它只决定取哪一行，不是词义大小，也不是向量的数值。`},
 {eyebrow:'02 · LOOKUP',title:`找到 E 的第 ${f.id} 行`,body:`从 0 开始编号。E 有 4 行、每行 2 个数；${f.token} 对应的这一行是 ${v}。表中数值已预先确定。`},
 {eyebrow:'03 · COPY',title:'整行取出，不乘编号',body:`e = E[${f.id}] = ${v}。两个分量原样成为输出；查表既不相加，也不把编号 ${f.id} 乘到这一行上。`},
 {eyebrow:'04 · COORDINATES',title:'两个数，定位一个向量',body:`从原点出发：横坐标 x₁ = ${f.vector[0]}，纵坐标 x₂ = ${f.vector[1]}。两条轴同尺度；负数向左或向下。坐标轴没有预设的语义名称。`},
 {eyebrow:'05 · COMPARE',title:'相近的是向量，不是编号',body:`与 cat 的 [2, 1] 比较：距离 ${f.distance.toFixed(3)}，方向余弦 ${f.cosine.toFixed(3)}。这些数由坐标计算，不能单凭 ID 的差值推断。`},
 {eyebrow:'06 · YOUR EXPERIMENT',title:'换一个地址，结果会怎样？',body:'暂停后依次选 car 与 dog，对比它们和 cat 的关系。ID 1 比 ID 2 更靠近 0，但此表中 dog 的向量离 cat 更近。'}
 ][f.phase];}
