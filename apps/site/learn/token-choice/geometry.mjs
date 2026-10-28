// Front-face coordinates only. Extrusion is decorative and never changes a value.
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return x*x*(3-2*x); };
const mix = (a,b,t) => a+(b-a)*t;
export function chartBandGeometry(frame, mobile=false) {
 const width=mobile?390:1000, height=mobile?430:420;
 const base=mobile?280:285, plotH=mobile?170:185, barW=mobile?32:110;
 const xs=mobile?[75,153,231,309]:[130,345,560,775];
 const bandX=mobile?25:110, bandW=mobile?340:780, bandY=170, bandH=mobile?60:72;
 let morph=frame.phase>3?1:frame.phase===3?ease((frame.progress-.27)/.46):0;
 if(frame.reducedMotion&&frame.phase===3)morph=frame.progress>=.5?1:0;
 const candidates=frame.p.map((p,i)=>{
  const h=p*plotH, x=mix(xs[i],bandX+frame.cdf[i]*bandW,morph);
  const y=mix(base-h,bandY,morph), w=mix(barW,p*bandW,morph), height=mix(h,bandH,morph);
  // Wide, ordered identity lanes remain readable even for a 0.05% interval.
  // The connector always starts on THIS candidate's current front face.
  const labelX=mix(xs[i]+barW/2,bandX+bandW*(i+.5)/4,morph);
  const labelY=mix(base+48,bandY+bandH+69,morph);
  return {x,y,w,h:height,labelX,labelY,valueX:labelX,valueY:labelY+22,
   leader:{x:x+w/2,y:y+height+3,endX:labelX,endY:labelY-21},
   focus:{x:x+w/2,y:y+height*.3}};
 });
 const focusT=frame.phase>3?1:frame.reducedMotion?(frame.progress>=.27?1:0):ease((frame.progress-.20)/.15);
 const annotation={x:mix(width/2,candidates[0].focus.x,focusT),y:mix(33,candidates[0].focus.y,focusT)};
 const dock={x:candidates[0].x-6,y:candidates[0].y+candidates[0].h+1,end:candidates[3].x+candidates[3].w+6};
 return {width,height,base,plotH,barW,xs,bandX,bandW,bandY,bandH,morph,candidates,annotation,dock};
}
