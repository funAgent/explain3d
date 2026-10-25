import * as THREE from 'three';
// A depth-buffered CPU rasterizer for browsers without WebGL. It renders the same
// triangles and kinematics; surface gradients approximate studio light on metal.
export class SoftwareRenderer {
  constructor({canvas}){this.domElement=canvas;this.ctx=canvas.getContext('2d');if(!this.ctx)throw new Error('Canvas unavailable');this.shadowMap={};this.info={render:{calls:0,triangles:0}};this.cache=new WeakMap();this.lastRenderMs=0;this.pixelRatio=1.2;}
  setPixelRatio(){} setClearColor(){}
  setSize(w,h){this.domElement.width=Math.round(w*this.pixelRatio);this.domElement.height=Math.round(h*this.pixelRatio);this.image=this.ctx.createImageData(this.domElement.width,this.domElement.height);this.depth=new Float32Array(this.domElement.width*this.domElement.height);}
  geometry(g){if(this.cache.has(g))return this.cache.get(g);const a=g.attributes.position.array,indices=g.index?.array||Array.from({length:a.length/3},(_,i)=>i),faces=[];for(let i=0;i<indices.length;i+=3){const ids=[indices[i],indices[i+1],indices[i+2]],p=ids.map(n=>new THREE.Vector3(a[n*3],a[n*3+1],a[n*3+2]));faces.push({ids,normal:new THREE.Vector3().crossVectors(new THREE.Vector3().subVectors(p[1],p[0]),new THREE.Vector3().subVectors(p[2],p[0])).normalize()});}const d={a,faces};this.cache.set(g,d);return d;}
  render(scene,camera){
    const now=performance.now(),ctx=this.ctx,w=this.domElement.width,h=this.domElement.height,pixels=this.image.data,depth=this.depth;pixels.fill(0);depth.fill(Infinity);
    scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
    const vp=new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),nm=new THREE.Matrix3(),v=new THREE.Vector3(),nn=new THREE.Vector3(),light=new THREE.Vector3(-.32,.5,.8).normalize(),fill=new THREE.Vector3(.8,-.1,.55).normalize();let calls=0,triangles=0;
    const stops=[[0,.69],[.2,.94],[.38,.65],[.55,.86],[.7,1.1],[.86,.84],[1,.6]];
    scene.traverseVisible(o=>{
      if(!o.isMesh||o.geometry.type==='PlaneGeometry')return;
      const d=this.geometry(o.geometry),m=new THREE.Matrix4().multiplyMatrices(vp,o.matrixWorld),verts=[];let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
      for(let i=0;i<d.a.length;i+=3){v.set(d.a[i],d.a[i+1],d.a[i+2]).applyMatrix4(m);const x=(v.x*.5+.5)*w,y=(-v.y*.5+.5)*h;verts.push([x,y,v.z]);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
      nm.getNormalMatrix(o.matrixWorld);const mat=Array.isArray(o.material)?o.material[0]:o.material,base=mat.color.clone().convertLinearToSRGB(),rgb=[base.r*255,base.g*255,base.b*255];
      const gradient=new Float32Array(256);let step=0;for(let i=0;i<256;i++){const t=i/255;while(step<stops.length-2&&t>stops[step+1][0])step++;const [a,b]=[stops[step],stops[step+1]];gradient[i]=a[1]+(b[1]-a[1])*(t-a[0])/(b[0]-a[0]);}
      const gx=255*.65/Math.max(1,maxX-minX),gy=255*.35/Math.max(1,maxY-minY);
      for(const f of d.faces){
        const p=verts[f.ids[0]],q=verts[f.ids[2]],r=verts[f.ids[1]];
        const area=(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);if(area<=.015||p[2]>1||q[2]>1||r[2]>1)continue;
        const x0=Math.max(0,Math.floor(Math.min(p[0],q[0],r[0]))),x1=Math.min(w-1,Math.ceil(Math.max(p[0],q[0],r[0]))),y0=Math.max(0,Math.floor(Math.min(p[1],q[1],r[1]))),y1=Math.min(h-1,Math.ceil(Math.max(p[1],q[1],r[1])));if(x0>x1||y0>y1)continue;
        nn.copy(f.normal).applyMatrix3(nm).normalize();const intensity=.18+Math.max(0,nn.dot(light))*.62+Math.max(0,nn.dot(fill))*.24,specular=Math.pow(Math.max(0,nn.dot(light)),22)*(mat.metalness||0)*.12*255;
        const metal=f.normal.z>.98&&mat.metalness>.6,br=metal?intensity*1.24:intensity,cr=rgb[0]*br,cg=rgb[1]*br,cb=rgb[2]*br;
        const ax=q[1]-r[1],ay=r[0]-q[0],bx=r[1]-p[1],by=p[0]-r[0],cx=p[1]-q[1],cy=q[0]-p[0];
        let ea=(r[0]-q[0])*(y0+.5-q[1])-(r[1]-q[1])*(x0+.5-q[0]),eb=(p[0]-r[0])*(y0+.5-r[1])-(p[1]-r[1])*(x0+.5-r[0]),ec=(q[0]-p[0])*(y0+.5-p[1])-(q[1]-p[1])*(x0+.5-p[0]);
        const zdx=(ax*p[2]+bx*q[2]+cx*r[2])/area,zdy=(ay*p[2]+by*q[2]+cy*r[2])/area;let zrow=(ea*p[2]+eb*q[2]+ec*r[2])/area;
        for(let y=y0;y<=y1;y++){let a=ea,b=eb,c=ec,z=zrow,offset=y*w+x0,t=(x0+.5-minX)*gx+(y+.5-minY)*gy;for(let x=x0;x<=x1;x++,offset++,a+=ax,b+=bx,c+=cx,z+=zdx,t+=gx){if(a>=-1e-6&&b>=-1e-6&&c>=-1e-6&&z<depth[offset]){depth[offset]=z;const l=metal?gradient[Math.min(255,Math.max(0,t|0))]:1,k=offset*4;pixels[k]=cr*l+specular;pixels[k+1]=cg*l+specular;pixels[k+2]=cb*l+specular;pixels[k+3]=255;}}ea+=ay;eb+=by;ec+=cy;zrow+=zdy;}
        triangles++;
      }calls++;
    });
    ctx.putImageData(this.image,0,0);
    ctx.save();ctx.globalCompositeOperation='destination-over';ctx.translate(w*.51,h*.77);ctx.scale(1,.12);const shadow=ctx.createRadialGradient(0,0,0,0,0,w*.28);shadow.addColorStop(0,'#00000055');shadow.addColorStop(1,'#00000000');ctx.fillStyle=shadow;ctx.fillRect(-w,-h,w*2,h*2);ctx.restore();
    this.info.render={calls,triangles};this.lastRenderMs=performance.now()-now;
  }
}
