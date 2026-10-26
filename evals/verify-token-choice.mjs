// Validation for this site's self-contained SVG adapter (no scaffold runtime).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {sample,compute,STARTS,DURATION} from '../apps/site/learn/token-choice/model.mjs';
const dir=path.resolve('apps/site/learn/token-choice');
for(const name of ['index.html','style.css','app.mjs','stage.mjs','model.mjs','SCENE_SPEC.json','LESSON.md'])assert(fs.statSync(path.join(dir,name)).isFile(),name);
for(const name of ['app.mjs','stage.mjs','model.mjs']){
 const source=fs.readFileSync(path.join(dir,name),'utf8');
 for(const match of source.matchAll(/\bfrom\s*['"](\.[^'"]+)['"]/g))assert(fs.existsSync(path.resolve(dir,match[1])),`missing ${match[1]}`);
 assert(!/https?:\/\/.*\.(?:js|css|png|jpg)/.test(source),'runtime asset must be local');
}
const spec=JSON.parse(fs.readFileSync(path.join(dir,'SCENE_SPEC.json'),'utf8'));assert(spec.question);
// Check every phase and temperature endpoint for finite, ordered and exact domains.
for(const temperature of [.4,.8,1,2])for(const t of [...STARTS,DURATION,43.199,43.2]){
 const f=sample(t,{temperature});assert(f.cdf.length===5);assert(f.cdf[0]===0&&f.cdf.at(-1)===1);assert(f.cdf.every((c,i)=>!i||c>f.cdf[i-1]));assert(f.scaled.every(z=>z>=0&&z<=8));assert(f.weights.every(w=>w>0&&Number.isFinite(w)));
 if(f.selected!==null)assert(f.u>=f.cdf[f.selected]&&f.u<f.cdf[f.selected+1]);
}
assert.equal(sample(50,{temperature:.8}).selected,0);assert.equal(sample(50,{temperature:2}).selected,1);
assert.deepEqual(compute(.4).logits,compute(2).logits);
console.log('Token-choice delivery checks passed: local imports, complete spec, bounded scales, CDF interval membership and paired-temperature experiment.');
