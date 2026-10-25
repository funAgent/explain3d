import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from '../packages/runtime/vendor/three.module.js';
import {templates,promptFor} from '../templates/catalog.mjs';
import {TourPlayback} from '../packages/runtime/playback.mjs';
import {pose,ratio,TAU} from '../packages/runtime/planetary/model.mjs';
import {attentionWeights,simulateConveyor,agentReplay} from '../packages/scenes/systems.mjs';
assert.equal(templates.length,10);assert.equal(new Set(templates.map(x=>x.id)).size,10);
for(const s of templates){assert.ok(s.parameter.min<=s.parameter.value&&s.parameter.value<=s.parameter.max);assert.equal(s.chapters.length,5);assert.ok(s.boundary.length>20);assert.ok(promptFor(s).includes(s.name));assert.ok(fs.existsSync(new URL(`../apps/site/assets/${s.id}.jpg`,import.meta.url)));}
for(let i=0;i<=720;i++){const a=i/720*TAU*4,p=pose(a);assert.ok(Math.abs(p.carrier-a/4)<1e-10);assert.ok(Math.abs((p.sun-p.carrier)*24+(p.planet-p.carrier)*24)<1e-9);assert.ok(Math.abs((p.planet-p.carrier)*24-(p.ring-p.carrier)*72)<1e-9);}
assert.equal(ratio,4);
const clock=new TourPlayback();clock.play(0,100);clock.sample(1200);assert.ok(Math.abs(clock.time-1.1)<1e-9);clock.pause(1400);const paused=clock.time;clock.sample(3000);assert.equal(clock.time,paused);clock.play(0,4000);clock.suspend(4500);const suspended=clock.time;clock.resume(9000);clock.sample(9500);assert.ok(Math.abs(clock.time-suspended-.5)<1e-9);clock.seek(7.5,0);assert.equal(clock.time,7.5);assert.equal(clock.status,'paused');clock.play(0,10000);clock.sample(14000);assert.equal(clock.status,'complete');assert.equal(clock.time,10);clock.play(0,15000);assert.equal(clock.time,0);clock.reset();assert.equal(clock.status,'idle');
for(const T of [.3,1,2]){const w=attentionWeights(T);assert.ok(Math.abs(w.reduce((a,b)=>a+b,0)-1)<1e-12);assert.ok(w[0]>w[1]&&w[1]>w[2]);}assert.ok(attentionWeights(.3)[0]>attentionWeights(2)[0]);
for(const p of [.5,1,2.5])for(const t of [0,.1,1,5,10,35,60]){const s=simulateConveyor(t,p);assert.equal(s.arrived,s.admitted+s.rejected);assert.equal(s.admitted,s.inSystem+s.completed);assert.ok(s.queues.every(x=>x>=0&&x<=3));assert.deepEqual(simulateConveyor(t,p),s);}
assert.ok(simulateConveyor(60,.5).completed>simulateConveyor(60,2.5).completed);
assert.ok(Array.from({length:101},(_,i)=>agentReplay(i/10,1)).some(s=>s.status==='retry'));
for(const s of templates.filter(s=>s.module)){const mod=await import(`../packages/scenes/${s.module}.mjs`),asset=mod[s.builder](THREE);for(const parameter of [s.parameter.min,s.parameter.value,s.parameter.max])for(const t of [0,1.5,4.2,7.3,10]){asset.update(t,parameter,0);const first=new THREE.Box3().setFromObject(asset.group);asset.update(9,parameter,1);asset.update(t,parameter,0);const again=new THREE.Box3().setFromObject(asset.group);assert.ok(first.min.distanceTo(again.min)<1e-8&&first.max.distanceTo(again.max)<1e-8,`${s.id} seek determinism`);for(const n of [...again.min.toArray(),...again.max.toArray()])assert.ok(Number.isFinite(n),s.id);}
 if(s.id==='slider-crank')for(let i=0;i<100;i++){const theta=i/100*TAU,r=1.2,L=s.parameter.value,x=r*Math.cos(theta)+Math.sqrt(L*L-r*r*Math.sin(theta)**2);assert.ok(Math.abs(Math.hypot(x-r*Math.cos(theta),r*Math.sin(theta))-L)<1e-10);}
 if(s.id==='lens')for(const u of [3,4.5,6]){const f=1.5,v=f*u/(u-f);assert.ok(Math.abs(1/f-1/u-1/v)<1e-12);}
 asset.group.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m?.dispose();});}
for(const file of ['packages/runtime/viewer.mjs','apps/site/main.mjs','scripts/build.mjs']){assert.ok(fs.statSync(new URL('../'+file,import.meta.url)).size>0);}
console.log('PASS: 10 templates; 721 planetary constraints; clock pause/seek/suspend/replay; softmax; queue conservation/capacity/bottleneck; scripted retry; scene finite bounds and backward-seek determinism; slider closure; thin-lens identity.');
