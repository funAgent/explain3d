import assert from 'node:assert/strict';
import {lookup,compare,sample,DURATION,TABLE} from './model.mjs';
const close=(a,b)=>assert(Math.abs(a-b)<1e-12,`${a} vs ${b}`);
// Gold outputs are independent authored fixtures, not recomputed from TABLE.
assert.deepEqual([0,1,2,3].map(lookup),[[2,1],[-2,1],[1.8,1.2],[-1,-2]]);
const a=lookup(1);a[0]=99;assert.deepEqual(lookup(1),[-2,1]);
for(const id of [-1,4,1.1,NaN,Infinity,'2',null])assert.throws(()=>lookup(id),RangeError);
close(compare([2,1],[-2,1]).distance,4);close(compare([2,1],[-2,1]).cosine,-.6);
close(compare([1.8,1.2],[2,1]).distance,Math.sqrt(.08));close(compare([-1,-2],[2,1]).cosine,-.8);
assert(compare(lookup(2),lookup(0)).distance<compare(lookup(1),lookup(0)).distance);
for(const v of TABLE)for(const w of TABLE){const ab=compare(v,w),ba=compare(w,v);close(ab.cosine,ba.cosine);close(ab.distance,ba.distance);assert(ab.cosine>=-1-1e-12&&ab.cosine<=1+1e-12);close(compare(v,v).cosine,1);close(compare(v,v).distance,0);close(compare(v.map(x=>2*x),w).cosine,ab.cosine);}
assert.throws(()=>compare([0,0],[1,1]),RangeError);
for(let id=0;id<4;id++){const frames=[];for(let t=0;t<=DURATION;t+=.05){const f=sample(t,{id});assert.deepEqual(f.vector,lookup(id));assert(f.phase>=0&&f.phase<=5);assert(f.progress>=0&&f.progress<=1+1e-12);frames.push([t,f]);}for(const[t,f]of frames.reverse())assert.deepEqual(sample(t,{id}),f);}
assert.equal(sample(-1).time,0);assert.equal(sample(Infinity).time,0);assert.equal(sample(100).time,DURATION);assert.equal(sample(DURATION).progress,1);
console.log('Embedding: golden rows, index boundaries, immutable lookup, exact distance/cosine, scale/symmetry invariants and deterministic forward/backward sampling passed.');
