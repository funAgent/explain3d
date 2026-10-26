import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('apps/site/learn/token-choice');
const cache=new Map();
function moduleURL(file){
 const absolute=path.resolve(file);
 if(!absolute.startsWith(root+path.sep))throw Error('Import outside scene');
 if(cache.has(absolute))return cache.get(absolute);
 const source=fs.readFileSync(absolute,'utf8').replace(/\bfrom\s*(['"])(\.\/[^'"]+)\1/g,(_,quote,relative)=>`from ${JSON.stringify(moduleURL(path.resolve(path.dirname(absolute),relative)))}`);
 const url='data:text/javascript;base64,'+Buffer.from(source).toString('base64');
 cache.set(absolute,url);return url;
}
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=read('index.html')
 .replace('<link rel="stylesheet" href="./style.css">',()=>`<style>${read('style.css')}</style>`)
 .replace('<script type="module" src="./app.mjs"></script>',()=>`<script type="module">import ${JSON.stringify(moduleURL(path.join(root,'app.mjs')))};</script>`);
const out=process.argv[2]??'dist/ai-token-choice.html';
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,html);
console.log(`Bundled ${out} (${Buffer.byteLength(html)} bytes, ${cache.size} local modules)`);
