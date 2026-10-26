export const WORDS=['hugs','hug','pug','unhug','bun'];
export const VOCAB=['b','g','h','n','p','s','u','ug','un','hug'];
export const RULES=[['u','g'],['u','n'],['h','ug']];
export const STARTS=[0,6,13,25,34,41],DURATION=46;
export function encode(word,limit=3){
 if(!WORDS.includes(word)||!Number.isInteger(limit)||limit<0||limit>3)throw new RangeError('Use a supported teaching word and 0–3 rules');
 let pieces=[...word].map((text,start)=>({text,start,end:start+1}));const trace=[pieces];
 for(const [a,b] of RULES.slice(0,limit)){
  const next=[];for(let i=0;i<pieces.length;i++){const left=pieces[i],right=pieces[i+1];if(right&&left.text===a&&right.text===b){next.push({text:a+b,start:left.start,end:right.end});i++;}else next.push({...left});}pieces=next;trace.push(pieces);
 }
 return {word,limit,trace,pieces,ids:pieces.map(p=>VOCAB.indexOf(p.text)),decoded:pieces.map(p=>p.text).join('')};
}
export function sample(time,{word='hugs',limit=3}={}){
 if(!Number.isFinite(time))throw new RangeError('Finite time required');const t=Math.max(0,Math.min(DURATION,time)),phase=STARTS.findLastIndex(s=>s<=t),progress=(t-STARTS[phase])/((STARTS[phase+1]??DURATION)-STARTS[phase]);
 const final=encode(word,limit),step=phase<2?0:phase===2?Math.min(limit,Math.floor(progress*(limit+1))):limit;
 return {...final,time:t,phase,progress,step,current:phase===0?[{text:word,start:0,end:word.length}]:final.trace[step],rule:phase===2&&step<limit?RULES[step]:null};
}
export function narration(f){const texts=[
 ['固定输入','一个词，不一定只对应一个 Token。',`先看 ${f.word}：它是一个英文词，含 ${f.word.length} 个字母。本节用小型教学词表解释如何得到模型输入。`],
 ['基础符号','先把输入展开为基础符号。','本例从单个英文字母开始。真实分词器也可能从字节开始；字符数不是普遍的 Token 数。'],
 ['固定规则','按已有规则，合并相邻片段。',f.rule?`下一条规则：${f.rule[0]} + ${f.rule[1]} → ${f.rule.join('')}。${f.current.some((p,i)=>p.text===f.rule[0]&&f.current[i+1]?.text===f.rule[1])?'合并这两个相邻片段。':'此输入没有这个相邻组合，本条跳过。'}规则在输入前已经确定。`:'本版本的规则已用完。没有匹配的规则会保留片段，不能为了凑成整个词而随意拼接。'],
 ['Token 边界','一个片段，就是本版本的一个 Token。',`${f.word} 现在分成 ${f.pieces.length} 个 Token。片段可以小于一个词，也可能刚好等于一个词。`],
 ['词表查找','把片段查成编号，顺序保持不变。','每个片段在这张词表中有固定 ID。编号是索引，不是含义、分数或概率；换词表后编号也可能不同。'],
 ['还原检查','编号可以查回片段，再拼回输入。',`这次得到 [${f.ids.join(', ')}]。按同一张词表解码，仍然是 ${f.decoded}。分词没有生成新内容，也没有解释词义。`]
 ][f.phase];return {eyebrow:'看这里 · '+texts[0],title:texts[1],body:texts[2]};}
