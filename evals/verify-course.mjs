import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const roadmap=JSON.parse(fs.readFileSync(path.join(root,'docs/ai-learning/roadmap.json'),'utf8'));
const catalog=JSON.parse(fs.readFileSync(path.join(root,'apps/course/catalog.json'),'utf8'));
assert.equal(roadmap.target,10);assert.equal(roadmap.cadenceHours,12);assert.equal(catalog.length,10);
assert.equal(new Set(catalog.map(s=>s.id)).size,10);assert.deepEqual(catalog.map(s=>s.order),Array.from({length:10},(_,i)=>i+1));
for(const scene of catalog){
 assert(scene.title&&scene.outcome);
 assert(['planned','reviewed','published'].includes(scene.status));
 if(scene.status==='planned'){assert.equal(scene.route,null);continue;}
 assert(scene.route.startsWith('/learn/'));
 for(const name of ['index.html','app.mjs','model.mjs','stage.mjs','SCENE_SPEC.json','LESSON.md'])assert(fs.existsSync(path.join(root,'apps/site',scene.route,name)),`${scene.id}/${name}`);
 assert(roadmap.scenes.some(s=>s.id===scene.id&&s.status===scene.status));
}
console.log('Course checks passed: ten unique lessons, truthful planned/open states, existing source and persistent review roadmap.');
