// Monotonic-clock transport. Rendering frequency never determines elapsed time.
export class TourPlayback {
  constructor(duration=10){this.duration=duration;this.reset();}
  reset(){this.status='idle';this.time=0;this.baseAngle=null;this.anchorTime=0;this.anchorAt=null;this.suspended=false;}
  get active(){return this.status==='playing'||this.status==='paused';}
  get running(){return this.status==='playing'&&!this.suspended;}
  sample(now){if(this.running){this.time=Math.min(this.duration,this.anchorTime+Math.max(0,now-this.anchorAt)/1000);if(this.time>=this.duration){this.status='complete';this.anchorAt=null;}}return this.time;}
  play(angle,now){if(this.status==='idle'||this.status==='complete'){this.baseAngle=angle;this.time=0;}this.anchorTime=this.time;this.anchorAt=now;this.suspended=false;this.status='playing';}
  pause(now){this.sample(now);if(this.status==='playing')this.status='paused';this.anchorTime=this.time;this.anchorAt=null;}
  seek(value,angle){if(this.baseAngle===null)this.baseAngle=angle;this.time=Math.max(0,Math.min(this.duration,Number(value)||0));this.status=this.time>=this.duration?'complete':'paused';this.anchorTime=this.time;this.anchorAt=null;this.suspended=false;}
  suspend(now){this.sample(now);this.anchorTime=this.time;this.anchorAt=null;this.suspended=true;}
  resume(now){this.anchorTime=this.time;this.anchorAt=now;this.suspended=false;}
}
export const driveTime=t=>Math.min(t,6)+Math.max(0,t-9.4);
