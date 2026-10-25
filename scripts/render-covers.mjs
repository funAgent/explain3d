// Render real procedural scene geometry with the shipped CPU renderer.
// No browser, external images or synthetic product screenshots are involved.
import fs from 'node:fs/promises';
import path from 'node:path';
import * as THREE from '../packages/runtime/vendor/three.module.js';
import {SoftwareRenderer} from '../packages/runtime/software-renderer.mjs';
import {templates} from '../templates/catalog.mjs';
import {buildMechanism} from '../packages/runtime/planetary/scene.mjs';
const dest=path.resolve(import.meta.dirname,'../apps/site/assets');await fs.mkdir(dest,{recursive:true});
for(const s of templates){const scene=new THREE.Scene();let asset;
 if(s.id==='planetary'){const m=buildMechanism(scene,false);asset={group:m.machine,update:(t,p,e)=>m.update(.9,e,5.6,3.8)};}
 else{const mod=await import(`../packages/scenes/${s.module}.mjs`);asset=mod[s.builder](THREE);scene.add(asset.group);}
 const w=800,h=500,context={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(image){this.image=image;},save(){},restore(){},translate(){},scale(){},createRadialGradient(){return{addColorStop(){}};},fillRect(){},points:[],beginPath(){this.points=[];},moveTo(x,y){this.points.push([x,y,true]);},lineTo(x,y){this.points.push([x,y,false]);},stroke(){let last;for(const p of this.points){if(last&&!p[2]){const dx=p[0]-last[0],dy=p[1]-last[1],n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))));const color=parseInt(this.strokeStyle.slice(1),16),rgb=[color>>16,(color>>8)&255,color&255];for(let j=0;j<=n;j++){const x=Math.round(last[0]+dx*j/n),y=Math.round(last[1]+dy*j/n);if(x>=0&&x<w&&y>=0&&y<h){const k=(y*w+x)*4;for(let c=0;c<3;c++)this.image.data[k+c]=rgb[c];this.image.data[k+3]=255;}}}last=p;}}};
 const canvas={width:w,height:h,getContext:()=>context};const renderer=new SoftwareRenderer({canvas});renderer.pixelRatio=1;renderer.setSize(w,h);
 const camera=new THREE.PerspectiveCamera(36,w/h,.1,100);camera.position.set(.5,.5,17);camera.lookAt(0,0,0);
 asset.update(s.id==='conveyor'?9:s.id==='agent'?2.7:1.3,s.parameter.value,s.id==='smart-ring'?.65:s.id==='planetary'?.28:0);
 const bounds=new THREE.Box3().setFromObject(asset.group),size=bounds.getSize(new THREE.Vector3());camera.position.z=Math.max(size.y,size.x/(w/h))*1.75+size.z*.5;camera.lookAt(0,0,0);renderer.render(scene,camera);const pixels=context.image.data;
 // Composite transparent scene pixels over the actual graphite viewport color.
 for(let i=0;i<pixels.length;i+=4){const a=pixels[i+3]/255;pixels[i]=pixels[i]*a+20*(1-a);pixels[i+1]=pixels[i+1]*a+23*(1-a);pixels[i+2]=pixels[i+2]*a+24*(1-a);pixels[i+3]=255;}
 await fs.writeFile(path.join(dest,s.id+'.rgba'),pixels);console.log('Rendered',s.id);
 scene.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m?.dispose();});
}
