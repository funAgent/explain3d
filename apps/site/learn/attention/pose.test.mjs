import assert from 'node:assert/strict';
import {sample} from './model.mjs';
import {lessonPose} from './pose.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10);
let count=0;
for(const id of [-1,0,1])for(const future of [0,100,1000])for(const reduced of [false,true]){
 const snapshots=[];
 for(let tick=0;tick<=960;tick++){
  const f=sample(tick/20,{id,future}),p=lessonPose(f,reduced);snapshots.push(p);
  assert.ok(p.active>=0&&p.active<4&&p.travel>=0&&p.travel<=1);
  // Raw and max-shifted exponential normalizations encode the same distribution.
  p.weights.forEach((w,i)=>near(w/p.denominator,f.probs[i]));
  near(p.products.reduce((a,b)=>a+b,0)/Math.SQRT2,f.scores[p.active]);
  near(p.cumulative[3],f.output);assert.equal(p.weights[3],0);assert.equal(p.flights[3],0);
  for(let i=1;i<4;i++)assert.ok(p.cumulative[i]>=p.cumulative[i-1]);
  assert.ok(p.flights.every(x=>x>=0&&x<=1));count++;
 }
 for(let tick=960;tick>=0;tick-=13)assert.deepEqual(lessonPose(sample(tick/20,{id,future}),reduced),snapshots[tick]);
}
console.log(`Attention teaching pose: ${count} cases; raw/stable normalization, dot products, cumulative sum, masked no-flight and reverse seek passed.`);
