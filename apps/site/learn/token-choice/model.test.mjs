import assert from 'node:assert/strict';
import {TOKENS,ZH,LOGITS,COLORS,STARTS,DURATION,compute,choose,random,sample,narration} from './model.mjs';

const close=(actual,expected,tolerance=1e-11)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);
const sum=values=>values.reduce((a,b)=>a+b,0);

assert.deepEqual(LOGITS,[3,2,1,0]);
assert.equal(TOKENS.length,4);assert.equal(ZH.length,4);assert.equal(COLORS.length,4);
assert.equal(DURATION,50);assert.deepEqual(STARTS,[0,8,18,27,36,45]);
for(const t of [-1,0,.399,2.001,NaN,Infinity])assert.throws(()=>compute(t),RangeError);

// These reference values were generated independently with Python's math.exp
// and math.log2, not obtained by calling compute().
const golden=[
 [.4,[.9179566765447413,.07535047253097381,.006185143434015109,.0005077074902697469],.44538129291215134,1808.0424144560632],
 [.8,[.7183353083752138,.20580651160354263,.05896455279947734,.016893627221766207],1.1524816974330627,42.52108200006278],
 [1,[.6439142598879722,.23688281808991013,.08714431874203256,.03205860328008499],1.3670068789863308,20.085536923187668],
 [1.6,[.5062980458803836,.27100181529430745,.14505681878567053,.07764332003963831],1.6979195411088617,6.5208191203301125],
 [2,[.45505423392341127,.27600434470659363,.16740509727844333,.1015363240915518],1.7962280773638981,4.4816890703380645]
];
for(const [t,p,entropy,topWeight]of golden){
 const state=compute(t);p.forEach((value,i)=>close(state.p[i],value));
 close(state.entropy,entropy);close(state.weights[0],topWeight);
 assert.deepEqual(state.logits,[3,2,1,0]);close(state.scaled[0],3/t);
 assert.equal(state.weights.at(-1),1,'A zero logit has exp(0)=1, not zero weight.');
}

// Independent log-ratio identities expose wrong sign, temperature or normalization.
let previousEntropy=-1,previousLargest=Infinity;
for(let step=0;step<=32;step++){
 const t=.4+step*.05,state=compute(t);
 assert.ok(state.scaled.every(Number.isFinite));
 assert.ok(state.weights.every(x=>Number.isFinite(x)&&x>0));
 assert.ok(state.p.every(x=>x>0&&x<1));close(sum(state.p),1);
 close(sum(state.weights),state.totalWeight);
 close(Math.log(state.p[0]/state.p[1]),1/t);
 close(Math.log(state.p[0]/state.p[3]),3/t);
 assert.ok(state.entropy>previousEntropy);assert.ok(state.p[0]<previousLargest);
 previousEntropy=state.entropy;previousLargest=state.p[0];
 assert.equal(state.cdf[0],0);assert.equal(state.cdf[4],1);
 for(let i=0;i<4;i++){
  close(state.cdf[i+1]-state.cdf[i],state.p[i]);
  assert.equal(choose((state.cdf[i]+state.cdf[i+1])/2,state.p),i);
  if(i>0)assert.equal(choose(state.cdf[i],state.p),i,'CDF boundaries belong to the interval on their right.');
 }
}
const stable=LOGITS.map(z=>Math.exp((z-3)/.8)),stableSum=sum(stable);
stable.forEach((w,i)=>close(w/stableSum,compute(.8).p[i]));

// Half-open CDF intervals, including empty intervals; u=1 is excluded.
const fixture=[0,.2,0,.3,.5];
assert.equal(choose(0,fixture),1);assert.equal(choose(.2-Number.EPSILON,fixture),1);
assert.equal(choose(.2,fixture),3);assert.equal(choose(.5,fixture),4);
assert.equal(choose(1-Number.EPSILON,fixture),4);
for(const u of [-1,1,NaN,Infinity])assert.throws(()=>choose(u,[.5,.5]),RangeError);
for(const p of [[],[0,0],[.2,.3],[-.2,1.2],[NaN,1]])assert.throws(()=>choose(.5,p),RangeError);

assert.deepEqual([0,1,2,3,4].map(draw=>random(22,draw)),[
 .6218683323822916,.23673223098739982,.22517993114888668,.20531759224832058,.3645721802022308
]);
assert.throws(()=>random(22,-1),RangeError);assert.throws(()=>random(NaN),RangeError);
const p=compute(1.6).p,counts=[0,0,0,0],draws=20000;
for(let draw=0;draw<draws;draw++){
 const u=random(22,draw);assert.ok(u>=0&&u<1);assert.equal(u,random(22,draw));counts[choose(u,p)]++;
}
p.forEach((mass,i)=>assert.ok(Math.abs(counts[i]/draws-mass)<5*Math.sqrt(mass*(1-mass)/draws)+2/draws));
assert.equal(choose(random(22),compute(.4).p),0);
assert.equal(choose(random(22),compute(2).p),1,'With the same u, changing temperature can change the selected interval.');

for(const t of [NaN,Infinity,-Infinity])assert.throws(()=>sample(t),RangeError);
assert.deepEqual(sample(-1),sample(0));assert.deepEqual(sample(100),sample(50));
STARTS.forEach((time,phase)=>{assert.equal(sample(time).phase,phase);assert.equal(sample(time).progress,0);});
assert.equal(sample(50).progress,1);
for(const temperature of [.4,.8,1.6,2]){
 const options={temperature,seed:22,draw:2},numerical=compute(temperature);
 for(const time of [0,7.999,8,17.999,18,26.999,27,35.999,36,43.199999,43.2,44.999,45,50]){
  const frame=sample(time,options);assert.deepEqual(frame.p,numerical.p);
  assert.deepEqual(frame.logits,LOGITS);assert.equal(frame.u,random(22,2));
  assert.ok(frame.progress>=0&&frame.progress<=1);
  assert.equal(frame.selected,time<43.2?null:choose(frame.u,frame.p));
  const copy=narration(frame);assert.ok(copy.title&&copy.body&&copy.formula&&copy.eyebrow);
  assert.ok(!JSON.stringify(copy).includes('undefined'));
 }
 for(const boundary of STARTS.slice(1)){
  const before=sample(boundary-1e-6,options),after=sample(boundary,options);
  assert.deepEqual(before.scaled,after.scaled);assert.deepEqual(before.weights,after.weights);
  assert.deepEqual(before.p,after.p);assert.equal(before.u,after.u);
 }
}
const times=[0,5,8,12,18,22,27,31,36,40,43.2,45,50];
const frames=times.map(time=>sample(time,{temperature:1.3,seed:7,draw:4}));
for(let i=times.length-1;i>=0;i--)assert.deepEqual(sample(times[i],{temperature:1.3,seed:7,draw:4}),frames[i]);
const damaged=sample(50);damaged.logits[0]=999;damaged.p.fill(0);damaged.cdf.fill(0);damaged.weights.fill(0);
assert.deepEqual(sample(50).logits,[3,2,1,0]);close(sum(sample(50).p),1);assert.equal(sample(50).cdf.at(-1),1);
assert.equal(sample(0).selected,null);assert.equal(sample(50).selected,0);
assert.throws(()=>{LOGITS[0]=999;},TypeError);

console.log('Token-choice checks passed: independent golden values, exponent/normalization identities, temperature entropy, CDF boundaries, seeded sampling, phase boundaries and deterministic backward seek.');
