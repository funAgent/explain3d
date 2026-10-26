import assert from 'node:assert/strict';
import {WORDS,VOCAB,encode,sample,DURATION} from './model.mjs';
const golden={hugs:['hug','s'],hug:['hug'],pug:['p','ug'],unhug:['un','hug'],bun:['b','un']};
for(const word of WORDS){assert.deepEqual(encode(word).pieces.map(p=>p.text),golden[word]);for(let k=0;k<=3;k++){const f=encode(word,k);assert.equal(f.decoded,word);assert.equal(f.ids.map(i=>VOCAB[i]).join(''),word);for(const row of f.trace){assert.equal(row.map(x=>x.text).join(''),word);let pos=0;for(const p of row){assert.equal(p.start,pos);assert.equal(p.text,word.slice(p.start,p.end));pos=p.end;}assert.equal(pos,word.length);}}}
assert.deepEqual(encode('hugs').ids,[9,5]);assert.deepEqual(encode('unhug').ids,[8,9]);assert.equal(encode('hugs',0).pieces.length,4);assert.equal(encode('hugs',1).pieces.length,3);assert.deepEqual(encode('hugs',1).pieces,encode('hugs',2).pieces);
for(const word of WORDS)for(let limit=0;limit<=3;limit++)for(let t=0;t<=DURATION;t+=.1){const a=sample(t,{word,limit});assert(a.current.every(p=>p.text===word.slice(p.start,p.end)));assert.equal(a.current.map(p=>p.text).join(''),word);sample(46,{word,limit});assert.deepEqual(sample(t,{word,limit}),a);}
assert.throws(()=>encode('未知'));assert.throws(()=>encode('hugs',4));assert.equal(sample(-1).time,0);assert.equal(sample(99).time,DURATION);
console.log('Tokenization: independent golden segmentations/IDs, span conservation, reversible decode, rule no-op, limits and backward seeking pass.');
