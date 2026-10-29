import assert from 'node:assert/strict';
import {sample} from './model.mjs';
import {lessonPose,pointOnPath,handoff} from './pose.mjs';
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

const path=[[0,0],[10,0],[10,10],[30,10]];
assert.deepEqual(pointOnPath(path,0),[0,0]);assert.deepEqual(pointOnPath(path,1),[30,10]);
assert.deepEqual(pointOnPath(path,.25),[10,0]);assert.deepEqual(pointOnPath(path,.5),[10,10]);
for(let i=0;i<=100;i++){const [x,y]=pointOnPath(path,i/100);assert.ok(y===0||x===10||y===10);}
console.log('Causal pointer path: exact junctions/endpoints and segment containment pass.');

for(const id of [-1,0,1])for(const future of [0,1000])for(const phase of [2,3,4,5]){
 const f={...sample(48,{id,future}),phase,progress:0};
 const expected=phase===2?f.scores:phase===3?f.masked:phase===4?f.probs:f.terms;
 for(const progress of [0,.03,.09,.179,.18,1]){
  const h=handoff({...f,progress});assert.deepEqual(h.values,expected);assert.ok(h.progress>=0&&h.progress<=1);assert.equal(h.inTransit,progress<.18);
  assert.equal(handoff({...f,progress},true).inTransit,false);
 }
}
console.log('Chapter handoff: exact value/unit ownership and reduced-motion endpoints pass.');

// Causality boundaries, independently chosen from chapter start/end semantics.
for(const future of [0,1000])for(const id of [-1,0,1]){
 for(const phase of [2,3,4,5]){
  const base={...sample(48,{id,future}),phase};
  for(const progress of [0,.09,.179,.18]){
   const p=lessonPose({...base,progress});assert.equal(p.operation,0);
   assert.ok(p.flights.every(x=>x===0));
  }
  const end=lessonPose({...base,progress:1});assert.equal(end.operation,1);assert.equal(end.travel,1);
  end.flights.forEach((x,i)=>assert.equal(x,base.terms[i]===0?0:1));
 }
 const a=lessonPose({...sample(35,{id,future}),phase:4}),b=lessonPose({...sample(35,{id,future:1000-future}),phase:4});
 assert.deepEqual(a.flights,b.flights);assert.deepEqual(a.cumulative,b.cumulative);
}
console.log('Post-handoff operations wait for arrival, finish exactly, and preserve future isolation.');
