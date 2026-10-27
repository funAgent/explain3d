import assert from 'node:assert/strict';
import {calculate,sample,DURATION} from './model.mjs';
const close=(a,b)=>assert(Math.abs(a-b)<1e-11,`${a} vs ${b}`);
const f=calculate();[.09003057317038046,.24472847105479764,.6652409557748218,0].forEach((p,i)=>close(f.probs[i],p));close(f.output,15.752103826044414);
close(calculate(-1).output,4.247896173955585);close(calculate(0).output,10);
for(const a of [-1,0,1])for(const future of [0,10,100,1000]){const f=calculate(a,future);close(f.probs.reduce((a,b)=>a+b),1);assert.equal(f.probs[3],0);assert.equal(f.terms[3],0);close(f.output,calculate(a,0).output);assert(f.output>=0&&f.output<=20);close(f.scores[0],-a);close(f.scores[2],a);const frames=[];for(let t=0;t<=DURATION;t+=.125)frames.push([t,sample(t,{id:a,future})]);for(const[t,s]of frames.reverse())assert.deepEqual(sample(t,{id:a,future}),s);}
for(const a of [-2,.5,NaN])assert.throws(()=>calculate(a),RangeError);for(const v of [-1,1001,NaN])assert.throws(()=>calculate(1,v),RangeError);
assert.equal(sample(100).time,48);assert.equal(sample(-1).time,0);assert.equal(sample(48).phase,5);
console.log('Attention: independent golden probabilities/output, mask isolation, normalization, convex bounds, index/parameter boundaries and deterministic reverse sampling passed.');
