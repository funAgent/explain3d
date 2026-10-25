import * as THREE from 'three';
import { spec, TAU, centerDistance, toothOutline, planetPhase, pose } from './model.mjs';

// All visible parts are procedural geometry, shared by the GPU and CPU renderers.
export function buildMechanism(scene, gpu) {
  function brushedTexture(){
    const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#9a9a9a';ctx.fillRect(0,0,256,256);
    for(let i=0;i<320;i++){const v=130+Math.round(45*(.5+.5*Math.sin(i*78.233)));ctx.strokeStyle=`rgba(${v},${v},${v},.27)`;ctx.lineWidth=.45;ctx.beginPath();ctx.arc(128,128,i*.65,0,TAU);ctx.stroke();}
    const texture=new THREE.CanvasTexture(c);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;return texture;
  }
  const texture=gpu?brushedTexture():null;
  const material=(color,metalness=.8,roughness=.32)=>new THREE.MeshStandardMaterial({color,metalness,roughness,...(texture?{roughnessMap:texture,bumpMap:texture,bumpScale:.0015}:{})});
  const mats={sun:material(0xc79b54,.8,.35),planet:material(0xb0b3b5,.86,.31),ring:material(0x666b6b,.85,.38),carrier:material(0xaeb2b4,.86,.29),steel:material(0xbcc0c1,.9,.27),dark:material(0x2f3232,.72,.43),black:material(0x111914,.3,.65),washer:material(0x6a7070,.85,.3),mark:material(0xdac9a6,.5,.4)};
  for(const m of Object.values(mats))m.userData.baseColor=m.color.clone();
  const machine=new THREE.Group();machine.position.z=-1.15;scene.add(machine);
  const rear=new THREE.Group(),ring=new THREE.Group(),sun=new THREE.Group(),orbit=new THREE.Group(),carrier=new THREE.Group();
  machine.add(rear,ring,sun,orbit,carrier);rear.userData.part=ring.userData.part='ring';sun.userData.part='sun';orbit.userData.part='planet';carrier.userData.part='carrier';
  let partCount=0;
  function mesh(geo,mat,parent,x=0,y=0,z=0){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);partCount++;return o;}
  function cylinder(r,h,mat,parent,x=0,y=0,z=0,segments=48){const g=new THREE.CylinderGeometry(r,r,h,gpu?segments:Math.min(segments,20));g.rotateX(Math.PI/2);return mesh(g,mat,parent,x,y,z);}
  function hole(r,x=0,y=0){const p=new THREE.Path();p.absarc(x,y,r,0,TAU,false);return p;}
  function extrude(s,h,mat,parent,x=0,y=0,z=0,bevel=.018){const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:1,curveSegments:gpu?40:32,steps:1});g.translate(0,0,-h/2);return mesh(g,mat,parent,x,y,z);}
  function annulus(ro,ri,h,mat,parent,x=0,y=0,z=0,bevel=.012){const s=new THREE.Shape();s.absarc(0,0,ro,0,TAU,false);s.holes.push(hole(ri));return extrude(s,h,mat,parent,x,y,z,bevel);}
  function poly(points){const s=new THREE.Shape();s.moveTo(...points[0]);points.slice(1).forEach(p=>s.lineTo(...p));s.closePath();return s;}
  function box(w,h,d,mat,parent,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),mat,parent,x,y,z);}
  function bolt(parent,x,y,z,r=.08){annulus(r*1.42,r*.62,.024,mats.washer,parent,x,y,z-.015,0);cylinder(r,.065,mats.steel,parent,x,y,z+.022,24);cylinder(r*.48,.003,mats.black,parent,x,y,z+.056,6);}
  function bearing(parent,x,y,z,r=.28){annulus(r,r*.81,.12,mats.steel,parent,x,y,z,.006);annulus(r*.58,r*.39,.12,mats.washer,parent,x,y,z,.005);for(let j=0;j<8;j++){const a=j*TAU/8;mesh(new THREE.SphereGeometry(r*.115,gpu?12:6,gpu?8:4),mats.steel,parent,x+Math.cos(a)*r*.69,y+Math.sin(a)*r*.69,z+.025);}}
  // Thick housing, continuous machined shoulders and a recessed rear plate.
  annulus(4.26,3.89,1.05,mats.dark,rear,0,0,-.63,.025);
  annulus(4.34,3.88,.15,mats.washer,rear,0,0,-1.19);
  annulus(4.2,.43,.16,mats.dark,rear,0,0,-.96);
  annulus(.61,.22,.19,mats.washer,rear,0,0,-.8);bearing(rear,0,0,-.67,.27);
  for(let j=0;j<4;j++){const a=Math.PI/4+j*TAU/4,x=3.15*Math.cos(a),y=3.15*Math.sin(a);bolt(rear,x,y,-.84,.105);}
  const rs=new THREE.Shape();rs.absarc(0,0,4.15,0,TAU,false);rs.holes.push(poly(toothOutline(spec.ring,true,gpu?8:3)));
  extrude(rs,.62,mats.ring,ring,0,0,0,.008);
  annulus(4.3,3.83,.15,mats.steel,ring,0,0,.38,.02);
  annulus(4.3,4.19,.018,mats.black,ring,0,0,.47,0);
  annulus(3.87,3.81,.025,mats.washer,ring,0,0,.47,.004);
  for(let j=0;j<12;j++){const a=j*TAU/12;bolt(ring,4.045*Math.cos(a),4.045*Math.sin(a),.48,.084);}
  for(let j=0;j<60;j++){const a=j*TAU/60;const tick=box(j%5===0?.095:.04,.014,.004,mats.dark,ring,4.2*Math.cos(a),4.2*Math.sin(a),.462);tick.rotation.z=a;}
  function gear(parent,kind){const s=poly(toothOutline(24,false,gpu?8:3));s.holes.push(hole(kind==='sun'?.215:.295));for(let j=0;j<4;j++){const a=j*TAU/4+Math.PI/4;s.holes.push(hole(.19,.69*Math.cos(a),.69*Math.sin(a)));}extrude(s,.58,mats[kind],parent,0,0,0,.009);annulus(.47,kind==='sun'?.215:.295,.055,mats[kind],parent,0,0,.327,.008);}
  gear(sun,'sun');cylinder(.205,1.15,mats.sun,sun,0,0,-.43);annulus(.34,.205,.15,mats.sun,sun,0,0,-1.04);
  for(let j=0;j<3;j++){const a=j*TAU/3;bolt(sun,.37*Math.cos(a),.37*Math.sin(a),.365,.034);}
  box(.28,.025,.006,mats.mark,sun,.78,0,.308);
  const planets=[];
  for(let j=0;j<3;j++){const a=j*TAU/3;const g=new THREE.Group();g.position.set(centerDistance*Math.cos(a),centerDistance*Math.sin(a),0);orbit.add(g);gear(g,'planet');box(.27,.024,.006,mats.mark,g,.79,0,.308);planets.push(g);}
  // A single continuous carrier plate, with three rounded tips and curved arm roots.
  const plate=new THREE.Shape(),tip=.36,dist=centerDistance;
  function pt(a,r,t=0){return [Math.cos(a)*r-Math.sin(a)*t,Math.sin(a)*r+Math.cos(a)*t];}
  plate.moveTo(...pt(0,dist,-tip));
  for(let j=0;j<3;j++){
    const a=j*TAU/3,b=(j+1)*TAU/3,m=(a+b)/2;
    plate.absarc(Math.cos(a)*dist,Math.sin(a)*dist,tip,a-Math.PI/2,a+Math.PI/2,false);
    plate.bezierCurveTo(...pt(a,.82,tip*.7),...pt(m,.63,-.16),...pt(m,.63));
    plate.bezierCurveTo(...pt(m,.63,.16),...pt(b,.82,-tip*.7),...pt(b,dist,-tip));
    plate.holes.push(hole(.13,...pt(a,dist)));
  }
  plate.closePath();extrude(plate,.22,mats.carrier,carrier,0,0,.82,.025);
  annulus(.61,.12,.12,mats.carrier,carrier,0,0,.98,.02);
  for(let j=0;j<3;j++){
    const a=j*TAU/3,x=dist*Math.cos(a),y=dist*Math.sin(a);
    cylinder(.115,1.25,mats.steel,carrier,x,y,.28);bearing(carrier,x,y,.37,.285);annulus(.31,.12,.07,mats.washer,carrier,x,y,.57);
    annulus(.255,.15,.028,mats.dark,carrier,x,y,.955,0);cylinder(.19,.07,mats.steel,carrier,x,y,.99);cylinder(.076,.003,mats.black,carrier,x,y,1.027,6);
    const strip=box(.8,.026,.004,mats.washer,carrier,1.45*Math.cos(a),1.45*Math.sin(a),.957);strip.rotation.z=a;
  }
  annulus(.36,.14,.9,mats.carrier,carrier,0,0,1.48,.02);
  annulus(.6,.14,.15,mats.steel,carrier,0,0,1.96,.015);
  annulus(.27,.14,.19,mats.carrier,carrier,0,0,2.12,.012);
  annulus(.31,.14,.025,mats.washer,carrier,0,0,2.23,.005);
  for(let j=0;j<3;j++){const a=j*TAU/3;bolt(carrier,.46*Math.cos(a),.46*Math.sin(a),2.07,.05);}
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.18}));ground.rotation.x=-Math.PI/2;ground.position.y=-4.5;ground.receiveShadow=true;scene.add(ground);
  function update(angle,e,x=0,y=0){machine.rotation.y=-x*.037;machine.rotation.x=y*.029;const p=pose(angle);sun.rotation.z=p.sun;carrier.rotation.z=orbit.rotation.z=p.carrier;planets.forEach(g=>{g.rotation.z=p.planet-p.carrier+planetPhase;g.position.z=e*1.65;});carrier.position.z=e*3.15;sun.position.z=-e*.22;ring.position.z=rear.position.z=-e*.58;}
  function focus(part,enabled){for(const [key,mat] of Object.entries(mats)){const own=['sun','planet','ring','carrier'].includes(key);mat.color.copy(mat.userData.baseColor);if(enabled&&((own&&key!==part)||(!own&&key!=='mark')))mat.color.multiplyScalar(own?.33:.58);mat.emissive.set(0);mat.emissiveIntensity=0;if(enabled&&key===part){mat.emissive.copy(mat.userData.baseColor);mat.emissiveIntensity=.09;}}}
  function anchor(part){const group=part==='sun'?sun:part==='planet'?planets[0]:part==='carrier'?carrier:ring;const v=part==='ring'?new THREE.Vector3(-2.9,2.7,.48):part==='sun'?new THREE.Vector3(.75,-.15,.34):part==='carrier'?new THREE.Vector3(0,0,2.25):new THREE.Vector3(.4,.35,.35);return group.localToWorld(v);}
  return {machine,update,focus,anchor,parts:partCount};
}
