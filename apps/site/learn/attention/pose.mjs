// One deterministic teaching pose. Traversal is pedagogical, not compute latency.
const clamp=x=>Math.max(0,Math.min(1,x));
export function lessonPose(f,reduced=false){
 const traversal=clamp(f.progress)*4,active=Math.min(3,Math.floor(traversal)),local=traversal-active;
 const weights=f.masked.map(s=>Math.exp(s)),denominator=weights.reduce((a,b)=>a+b,0);
 const mask=reduced?1:clamp(f.progress/.65);
 const flights=f.terms.map((term,i)=>term===0?0:reduced?1:clamp((f.progress-i*.15)/.4));
 return {active,travel:reduced?1:clamp(local),weights,denominator,mask,flights,
  products:f.keys[active].map((k,j)=>k*f.q[j]),
  cumulative:f.terms.map((_,i)=>f.terms.slice(0,i+1).reduce((a,b)=>a+b,0))};
}

export function pointOnPath(points,t){
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
 let distance=clamp(t)*lengths.reduce((a,b)=>a+b,0),i=0;
 while(i<lengths.length-1&&distance>lengths[i])distance-=lengths[i++];
 const fraction=lengths[i]?distance/lengths[i]:1;
 return points[i].map((v,j)=>v+(points[i+1][j]-v)*fraction);
}
