import assert from 'node:assert/strict';
import {sample,operation} from './model.mjs';
import {chartBandGeometry} from './geometry.mjs';
const close=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
let checked=0;
for(const mobile of [false,true])for(const temperature of [.4,.8,1,1.6,2])for(const reducedMotion of [false,true]){
 const states=[];
 for(let tick=0;tick<=180;tick++){
  const time=27+tick/20,frame={...sample(time,{temperature}),reducedMotion};
  const g=chartBandGeometry(frame,mobile);states.push(g);
  g.candidates.forEach((c,i)=>{
   assert.ok(c.w>0&&c.h>0);
   close(g.dock.y,c.y+c.h+1);assert.ok(g.dock.x<c.x&&g.dock.end>c.x+c.w,'carrier spans all four fronts without intersecting them');
   assert.ok(c.x>=0&&c.x+c.w<=g.width);
   if(i<3)assert.ok(c.x+c.w<=g.candidates[i+1].x+1e-8,'front faces must not overlap');
   // Every number stays in a readable identity lane BELOW all candidate faces.
   for(const other of g.candidates)assert.ok(c.valueY>other.y+other.h+20,'number inside another candidate');
   close(c.valueX,c.labelX);
   close(c.leader.x,c.x+c.w/2);close(c.leader.y,c.y+c.h+3);
   close(c.leader.endX,c.labelX);
   assert.ok(c.focus.x>=c.x&&c.focus.x<=c.x+c.w&&c.focus.y>=c.y&&c.focus.y<=c.y+c.h);
  });
  if(time===36){
   close(g.candidates.reduce((a,c)=>a+c.w,0),g.bandW);
   g.candidates.forEach((c,i)=>{close(c.w/g.bandW,frame.p[i]);close((c.x-g.bandX)/g.bandW,frame.cdf[i]);});
  }
  checked++;
 }
 // An arbitrary backward traversal reproduces the same complete pose exactly.
 for(let tick=180;tick>=0;tick-=7)assert.deepEqual(chartBandGeometry({...sample(27+tick/20,{temperature}),reducedMotion},mobile),states[tick]);
 if(!reducedMotion)for(let i=1;i<states.length;i++){
  const a=states[i-1].candidates[0].focus,b=states[i].candidates[0].focus;
  assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<8,'annotation must not jump halfway through morph');
 }
}
// Explicit regression: floor's 20.6% remains paired with floor at 32 seconds.
const mid=chartBandGeometry(sample(32),false),floor=mid.candidates[1];
assert.ok(floor.valueY>mid.candidates[0].y+mid.candidates[0].h);
assert.ok(floor.valueX>mid.candidates[0].valueX);
console.log(`Token choice geometry: ${checked} intermediate poses; ownership, non-overlap, CDF scale, continuous focus, reverse seek passed. Browser visual acceptance remains separate.`);

for(const temperature of [.4,.8,2])for(const phase of [1,2,3])for(const progress of [0,.05,.2499,.25,.50,.7499,.99,1]){
 const starts=[0,8,18,27,36,45],t=starts[phase]+progress*(starts[phase+1]-starts[phase]);
 const frame={...sample(t,{temperature}),phase,progress};
 const op=operation(frame),i=op.candidate;
 assert.ok(i>=0&&i<4&&op.progress>=0&&op.progress<=1);
 if(phase===1)close(op.output,op.input/temperature);
 if(phase===2)close(op.output,Math.exp(op.input));
 if(phase===3)close(op.output,op.input/frame.totalWeight);
}
for(const mobile of [false,true]){
 let previous=null;
 for(let i=0;i<=900;i++){
  const g=chartBandGeometry(sample(27+i/100),mobile);
  if(previous)assert.ok(Math.hypot(g.annotation.x-previous.x,g.annotation.y-previous.y)<5,'rail-to-face annotation jump');
  previous=g.annotation;
 }
}
console.log('Exact operation operands/results and rail-to-face annotation continuity passed.');
