export const TAU = Math.PI * 2;
export const spec = Object.freeze({sun:24,planet:24,ring:72,module:0.1,pressure:20*Math.PI/180,planets:3});
export const ratio = 1 + spec.ring/spec.sun;
export const centerDistance = spec.module*(spec.sun+spec.planet)/2;
export function pose(input) {
  const carrier=input/ratio;
  return {sun:input,carrier,planet:carrier-(input-carrier)*spec.sun/spec.planet,ring:0};
}
export function speeds(rpm) { const p=pose(rpm); return {input:p.sun,output:p.carrier,planet:p.planet,ring:0}; }
const inv=(r,b)=>{const t=Math.sqrt(Math.max(0,r*r/(b*b)-1));return t-Math.atan(t);};
export function toothOutline(n,internal=false,samples=8) {
  const m=spec.module,r=n*m/2,b=r*Math.cos(spec.pressure),pitch=TAU/n;
  const root=internal?r+1.25*m:r-1.25*m,tip=internal?r-m:r+m;
  const backlash=0.008;
  const half=(radius)=>Math.PI/(2*n)-backlash/(2*r)+(internal?1:-1)*(inv(radius,b)-inv(r,b));
  const points=[];
  const add=(radius,a)=>points.push([radius*Math.cos(a),radius*Math.sin(a)]);
  for(let k=0;k<n;k++){
    const a=k*pitch;
    add(root,a-pitch/2);
    if(internal){
      add(root,a-half(root));
      for(let j=1;j<=samples;j++){const rad=root+(tip-root)*j/samples;add(rad,a-half(rad));}
      for(let j=1;j<=3;j++)add(tip,a-half(tip)+2*half(tip)*j/3);
      for(let j=1;j<=samples;j++){const rad=tip+(root-tip)*j/samples;add(rad,a+half(rad));}
    }else{
      const low=Math.max(b,root);
      add(root,a-half(low));
      for(let j=0;j<=samples;j++){const rad=low+(tip-low)*j/samples;add(rad,a-half(rad));}
      for(let j=1;j<=3;j++)add(tip,a-half(tip)+2*half(tip)*j/3);
      for(let j=1;j<=samples;j++){const rad=tip+(low-tip)*j/samples;add(rad,a+half(rad));}
      add(root,a+half(low));
    }
    add(root,a+pitch/2);
  }
  return points;
}
export const planetPhase=Math.PI/spec.planet;
export const smooth=(x)=>{const v=Math.max(0,Math.min(1,x));return v*v*(3-2*v);};
export function tourAt(t){
  if(t<2)return {part:'ring',explode:0,caption:0};
  if(t<4)return {part:'sun',explode:0,caption:1};
  if(t<6)return {part:'planet',explode:0,caption:2};
  if(t<8.2)return {part:'carrier',explode:smooth((t-6)/1.25),caption:3};
  return {part:'carrier',explode:1-smooth((t-8.2)/1.2),caption:4};
}
