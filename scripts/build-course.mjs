import fs from 'node:fs/promises';
import path from 'node:path';
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export async function buildCourse(root,out){
 const catalog=JSON.parse(await fs.readFile(path.join(root,'apps/course/catalog.json'),'utf8'));
 const available=catalog.filter(scene=>scene.route&&['reviewed','published'].includes(scene.status));
 const cards=catalog.map(scene=>{
  const open=available.includes(scene),tag=open?'a':'article';
  return `<${tag} class="lesson ${open?'available':'planned'}" ${open?`href="${escape(scene.route)}"`:''}><div class="lesson-meta"><span>${String(scene.order).padStart(2,'0')}</span><span>${open?'打开演示 ↗':'待开放'}</span></div><h2>${escape(scene.title)}</h2><p>${escape(scene.outcome)}</p><div class="lesson-foot">${open?'观看 · 调参 · 验证理解':'逐个打磨，通过验收后开放'}</div></${tag}>`;
 }).join('');
 const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f7f5ef"><title>AI 原理课堂 · Explain3D</title><meta name="description" content="从 Token 到 Personal Agent，用可暂停、可调参的图解逐步理解 AI。每个场景通过评审后开放。"><link rel="canonical" href="https://explain.funagent.app/learn/"><link rel="stylesheet" href="./course.css"></head><body><div class="page"><header><a class="brand" href="/"><i>e·</i> Explain3D</a><nav><a href="/start/">使用 Skill</a><a href="https://github.com/funAgent/explain3d">GitHub ↗</a></nav></header><main><section class="hero"><p class="eyebrow">AI PRINCIPLES, MADE VISIBLE</p><h1>AI 原理，<br><span>逐步看见。</span></h1><div class="hero-bottom"><p>跟着一次真实的计算关系。<br>看它变化，亲手调整，再验证自己的理解。</p><a class="start" href="${escape(available[0]?.route??'#lessons')}">从一件能操作的作品开始 ↗</a></div><div class="probability-art" aria-hidden="true"><i></i><i></i><i></i><i></i><span>分数 → 概率 → 一次选择</span></div></section><section id="lessons"><div class="section-title"><div><p class="eyebrow">TEN SMALL, COMPLETE EXPLANATIONS</p><h2>从底层，到完整任务。</h2></div><p>${available.length} / ${catalog.length} 个场景已开放</p></div><div class="lessons">${cards}</div></section><section class="method"><h2>看过之后，能解释为什么。</h2><div><p>每节只回答一个问题：先看动画中的因果，再暂停检查计算。改变一个参数，预测下一次会发生什么。</p><p>教学数据、简化关系与未覆盖内容都会说明。可运行的图形与自检题用于辅助理解；目前尚未开展真实学习者效果研究。</p><a href="/start/">把同样的方法，带进你的 Agent ↗</a></div></section></main><footer><span>Explain3D by funAgent</span><a href="https://github.com/funAgent/explain3d/tree/main/docs/ai-learning">制作进度与验收记录 ↗</a></footer></div></body></html>`;
 await fs.mkdir(path.join(out,'learn'),{recursive:true});
 await fs.writeFile(path.join(out,'learn/index.html'),html);
}
