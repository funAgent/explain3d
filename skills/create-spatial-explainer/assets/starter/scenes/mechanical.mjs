/*
 * Explain3D · Mechanical assemblies
 * All motion is sampled from absolute time. No accumulated rotation or timers.
 * The z axis is the shaft axis; the working mechanism is in the x/y plane.
 */

const C = {
  gold: 0xd7ad72, silver: 0xbac6d1, graphite: 0x28323d,
  dark: 0x121b25, edge: 0x617080, pale: 0xe5edf1,
};
const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const finite = (v, fallback) => Number.isFinite(v) ? v : fallback;
const smooth = (a, b, x) => {
  const q = clamp((x - a) / (b - a), 0, 1);
  return q * q * (3 - 2 * q);
};

function materials(THREE) {
  const metal = (color, roughness = 0.3, metalness = 0.78) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  return {
    gold: metal(C.gold, 0.28), silver: metal(C.silver, 0.25),
    graphite: metal(C.graphite, 0.42, 0.62), dark: metal(C.dark, 0.5, 0.42),
    edge: metal(C.edge, 0.36), pale: metal(C.pale, 0.3, 0.4),
    energized: new THREE.MeshStandardMaterial({
      color: C.gold, metalness: 0.65, roughness: 0.3,
      emissive: C.gold, emissiveIntensity: 0.18,
    }),
  };
}

function mesh(THREE, geo, mat, parent, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function box(THREE, parent, mat, w, h, d, x = 0, y = 0, z = 0) {
  return mesh(THREE, new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
}

function disk(THREE, parent, mat, r, d, x = 0, y = 0, z = 0, segments = 64) {
  const g = new THREE.CylinderGeometry(r, r, d, segments);
  g.rotateX(Math.PI / 2);
  return mesh(THREE, g, mat, parent, x, y, z);
}

function ring(THREE, parent, mat, r, tube, x = 0, y = 0, z = 0) {
  return mesh(THREE, new THREE.TorusGeometry(r, tube, 10, 96), mat, parent, x, y, z);
}

function roundedPlate(THREE, parent, mat, w, h, depth, x = 0, y = 0, z = 0, radius = 0.08) {
  const s = new THREE.Shape();
  const l = -w / 2, r = w / 2, b = -h / 2, t = h / 2;
  const q = Math.min(radius, w / 2, h / 2);
  s.moveTo(l + q, b); s.lineTo(r - q, b); s.quadraticCurveTo(r, b, r, b + q);
  s.lineTo(r, t - q); s.quadraticCurveTo(r, t, r - q, t);
  s.lineTo(l + q, t); s.quadraticCurveTo(l, t, l, t - q);
  s.lineTo(l, b + q); s.quadraticCurveTo(l, b, l + q, b);
  const g = new THREE.ExtrudeGeometry(s, {
    depth, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025,
    bevelSegments: 1, curveSegments: 8, steps: 1,
  });
  g.translate(0, 0, -depth / 2);
  return mesh(THREE, g, mat, parent, x, y, z);
}

function bar(THREE, parent, mat, x1, y1, x2, y2, width, depth, z) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const m = roundedPlate(THREE, parent, mat, length, width, depth,
    (x1 + x2) / 2, (y1 + y2) / 2, z, width * 0.35);
  m.rotation.z = Math.atan2(y2 - y1, x2 - x1);
  return m;
}

function bolt(THREE, parent, mat, x, y, z, r = 0.075) {
  const b = disk(THREE, parent, mat, r, 0.055, x, y, z, 6);
  b.rotation.z = Math.PI / 6;
  return b;
}

function axialRod(THREE, parent, mat, r, length, x, y, z) {
  return disk(THREE, parent, mat, r, length, x, y, z, 24);
}

function gear(THREE, parent, mat, teeth, rootR, outerR, depth, holeR = 0) {
  const s = new THREE.Shape();
  for (let i = 0; i < teeth; i++) {
    for (const [fraction, radius] of [[0, rootR], [0.21, rootR], [0.32, outerR], [0.68, outerR], [0.79, rootR]]) {
      const a = (i + fraction) * TAU / teeth;
      const x = radius * Math.cos(a), y = radius * Math.sin(a);
      if (i === 0 && fraction === 0) s.moveTo(x, y); else s.lineTo(x, y);
    }
  }
  s.closePath();
  if (holeR > 0) {
    const h = new THREE.Path(); h.absarc(0, 0, holeR, 0, TAU, true); s.holes.push(h);
  }
  const g = new THREE.ExtrudeGeometry(s, {
    depth, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015,
    bevelSegments: 1, curveSegments: 64, steps: 1,
  });
  g.translate(0, 0, -depth / 2);
  return mesh(THREE, g, mat, parent);
}

function sector(THREE, parent, mat, inner, outer, a0, a1, depth) {
  const s = new THREE.Shape();
  s.moveTo(outer * Math.cos(a0), outer * Math.sin(a0));
  s.absarc(0, 0, outer, a0, a1, false);
  s.lineTo(inner * Math.cos(a1), inner * Math.sin(a1));
  s.absarc(0, 0, inner, a1, a0, true); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025,
    bevelSegments: 1, curveSegments: 40, steps: 1,
  });
  g.translate(0, 0, -depth / 2);
  return mesh(THREE, g, mat, parent);
}

function tube(THREE, parent, mat, points, radius = 0.025) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  return mesh(THREE, new THREE.TubeGeometry(curve, Math.max(20, points.length * 3), radius, 8, false), mat, parent);
}

function arrow(THREE, parent, mat, length = 0.6, radius = 0.025) {
  const g = new THREE.Group(); parent.add(g);
  mesh(THREE, new THREE.CylinderGeometry(radius, radius, length - 0.13, 12), mat, g, 0, (length - 0.13) / 2);
  mesh(THREE, new THREE.ConeGeometry(radius * 3, 0.15, 16), mat, g, 0, length - 0.065);
  return g;
}

// Labels are markings on the hardware, not DOM UI. The no-DOM branch also makes
// the builders usable in offscreen geometry validation.
function marking(THREE, parent, text, width, height, x, y, z, color = '#e5edf1') {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 128); ctx.fillStyle = color;
  ctx.font = '600 60px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 68);
  const texture = new THREE.CanvasTexture(canvas);
  if ('colorSpace' in texture && THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  const label = mesh(THREE, new THREE.PlaneGeometry(width, height), material, parent, x, y, z);
  label.castShadow = false;
  return label;
}

function foundation(THREE, parent, m, width, y, centerX = 0, depth = 1.55) {
  roundedPlate(THREE, parent, m.graphite, width, 0.33, depth, centerX, y, -0.28, 0.13);
  roundedPlate(THREE, parent, m.edge, width - 0.1, 0.075, depth + 0.025, centerX, y + 0.17, -0.28, 0.07);
  for (const x of [centerX - width / 2 + 0.36, centerX + width / 2 - 0.36]) {
    for (const z of [-0.78, 0.22]) {
      const b = disk(THREE, parent, m.dark, 0.09, 0.05, x, y + 0.23, z, 6);
      b.rotation.x = Math.PI / 2;
    }
  }
}

export function buildSliderCrank(THREE) {
  const group = new THREE.Group(); group.name = 'Slider–crank';
  const m = materials(THREE);
  const ox = -2.3, oy = 0.28, radius = 1.2;
  group.userData = {
    model: 'Exact planar slider–crank', parameter: 'Connecting rod length, 2.5–4.5 units',
    assumptions: 'Rigid links, frictionless pins, constant crank angular speed. Slider displacement follows the positive square-root assembly branch.',
    constraint: 'x = r cos(theta) + sqrt(L² − r² sin²(theta)); r = 1.2',
  };
  foundation(THREE, group, m, 9.05, -1.94, 0.08, 1.6);

  // Rear bearing pedestal, kept behind the wheel so the crank sweep stays open.
  roundedPlate(THREE, group, m.graphite, 0.64, 1.65, 0.7, ox, -0.82, -0.57, 0.12);
  roundedPlate(THREE, group, m.silver, 1.05, 0.16, 1.05, ox, -1.65, -0.5, 0.07);
  disk(THREE, group, m.edge, 0.38, 0.6, ox, oy, -0.45);
  axialRod(THREE, group, m.silver, 0.16, 1.45, ox, oy, -0.22);

  for (const z of [-0.51, 0.45]) {
    const rail = mesh(THREE, new THREE.CylinderGeometry(0.085, 0.085, 6.05, 24), m.silver, group, 1.55, -0.32, z);
    rail.rotation.z = Math.PI / 2;
    for (const x of [-1.42, 4.5]) {
      roundedPlate(THREE, group, m.graphite, 0.3, 1.22, 0.36, x, -1.04, z, 0.06);
      disk(THREE, group, m.silver, 0.12, 0.065, x, -0.76, z + 0.2);
    }
  }
  roundedPlate(THREE, group, m.dark, 6.45, 0.14, 1.33, 1.53, -1.65, -0.02, 0.07);
  // A fine datum line on the rear guide bed makes the straight-line constraint visible.
  box(THREE, group, m.gold, 5.5, 0.025, 0.035, 1.65, -0.59, -0.6);
  for (let i = 0; i <= 20; i++) box(THREE, group, m.edge, 0.017, i % 5 ? 0.07 : 0.13, 0.025, -1.1 + i * 0.275, -0.69, -0.58);

  const wheel = new THREE.Group(); group.add(wheel); wheel.position.set(ox, oy, -0.16);
  ring(THREE, wheel, m.silver, 1.23, 0.095);
  ring(THREE, wheel, m.graphite, 1.13, 0.05, 0, 0, -0.015);
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    bar(THREE, wheel, m.edge, 0.2 * Math.cos(a), 0.2 * Math.sin(a), 1.14 * Math.cos(a), 1.14 * Math.sin(a), 0.17, 0.14, 0);
  }
  disk(THREE, wheel, m.graphite, 0.34, 0.25);
  disk(THREE, wheel, m.silver, 0.23, 0.29);
  disk(THREE, wheel, m.dark, 0.3, 0.19, -0.56, 0, 0.02);

  const crank = new THREE.Group(); group.add(crank); crank.position.set(ox, oy, 0.14);
  bar(THREE, crank, m.gold, 0, 0, radius, 0, 0.24, 0.18, 0);
  disk(THREE, crank, m.gold, 0.25, 0.21);
  disk(THREE, crank, m.silver, 0.17, 0.38, radius, 0, 0.06);
  bolt(THREE, crank, m.dark, 0, 0, 0.15, 0.115);

  const carriage = new THREE.Group(); group.add(carriage);
  roundedPlate(THREE, carriage, m.graphite, 0.95, 0.83, 0.97, 0, -0.01, -0.07, 0.1);
  roundedPlate(THREE, carriage, m.silver, 0.74, 0.65, 0.09, 0, -0.01, 0.47, 0.07);
  for (const x of [-0.29, 0.29]) for (const y of [-0.22, 0.22]) bolt(THREE, carriage, m.graphite, x, y, 0.54, 0.045);
  axialRod(THREE, carriage, m.silver, 0.14, 0.85, 0, 0, 0.39);
  disk(THREE, carriage, m.gold, 0.205, 0.09, 0, 0, 0.57);
  for (const z of [-0.51, 0.45]) {
    const sleeve = mesh(THREE, new THREE.CylinderGeometry(0.16, 0.16, 0.84, 24), m.edge, carriage, 0, -0.6, z);
    sleeve.rotation.z = Math.PI / 2;
    box(THREE, carriage, m.graphite, 0.65, 0.2, 0.25, 0, -0.45, z);
  }

  const rod = new THREE.Group(); group.add(rod);
  const rodBody = roundedPlate(THREE, rod, m.silver, 1, 0.21, 0.16, 0, 0, 0, 0.07);
  const rodInset = box(THREE, rod, m.edge, 1, 0.065, 0.02, 0, 0, 0.094);
  const bigEnd = new THREE.Group(), smallEnd = new THREE.Group(); rod.add(bigEnd, smallEnd);
  for (const end of [bigEnd, smallEnd]) {
    disk(THREE, end, m.silver, 0.23, 0.19);
    ring(THREE, end, m.gold, 0.15, 0.035, 0, 0, 0.115);
    disk(THREE, end, m.dark, 0.105, 0.025, 0, 0, 0.13);
    bolt(THREE, end, m.silver, 0, 0, 0.16, 0.07);
  }

  function update(t = 0, p = 3.5, exploded = 0) {
    const time = finite(t, 0), L = clamp(finite(p, 3.5), 2.5, 4.5);
    const e = clamp(finite(exploded, 0), 0, 1), theta = time * 1.15;
    const px = ox + radius * Math.cos(theta), py = oy + radius * Math.sin(theta);
    // Exact closure: (sx-px)^2 + (oy-py)^2 = L^2. L > r avoids singular assembly changes.
    const sx = ox + radius * Math.cos(theta) + Math.sqrt(L * L - radius * radius * Math.sin(theta) ** 2);
    wheel.rotation.z = theta; wheel.position.z = -0.16 - 0.36 * e;
    crank.rotation.z = theta; crank.position.z = 0.14 + 0.15 * e;
    carriage.position.set(sx, oy, 0.12 * e);
    rod.position.set((px + sx) / 2, (py + oy) / 2, 0.57 + 0.7 * e);
    rod.rotation.z = Math.atan2(oy - py, sx - px);
    rodBody.scale.x = Math.max(0.1, L - 0.23);
    rodInset.scale.x = Math.max(0.1, L - 0.65);
    bigEnd.position.x = -L / 2; smallEnd.position.x = L / 2;
    group.userData.sample = { crankAngle: theta, rodLength: L, sliderX: sx, crankPinX: px, crankPinY: py };
  }
  update(0, 3.5, 0);
  return { group, update };
}

export function buildEscapement(THREE) {
  const group = new THREE.Group(); group.name = 'Idealized anchor escapement';
  const m = materials(THREE);
  const cx = -0.48, cy = 0.52, pivotY = 2.15, teeth = 24;
  group.userData = {
    model: 'Idealized anchor escapement — teaching model', parameter: 'Pendulum period, 0.6–2.0 seconds',
    assumptions: 'Prescribed pendulum motion, ideal lock and release, constant spring torque. Each half swing releases one half tooth. Pallet contact and impulse are schematic; the selected period is time-scaled, not derived from the displayed pendulum length.',
  };
  foundation(THREE, group, m, 7.7, -2.55, -0.12, 1.72);
  // Open clock frame gives the mechanism a real, supported shaft without a backplate hiding it.
  for (const x of [-3.72, 2.12]) {
    roundedPlate(THREE, group, m.graphite, 0.22, 4.72, 0.4, x, -0.03, -0.68, 0.07);
    roundedPlate(THREE, group, m.silver, 0.54, 0.13, 0.7, x, -2.3, -0.6, 0.05);
  }
  roundedPlate(THREE, group, m.graphite, 6.1, 0.2, 0.42, -0.8, 2.34, -0.68, 0.07);
  bar(THREE, group, m.edge, -3.65, -1.66, 2.05, -1.66, 0.15, 0.2, -0.7);
  bar(THREE, group, m.edge, cx, -1.65, cx, pivotY, 0.17, 0.22, -0.67);
  for (const [x, y] of [[cx, cy], [cx, pivotY], [-2.58, -0.11]]) {
    disk(THREE, group, m.silver, 0.22, 0.15, x, y, -0.5);
    axialRod(THREE, group, m.silver, 0.08, 1.25, x, y, -0.12);
  }

  const escape = new THREE.Group(); group.add(escape); escape.position.set(cx, cy, 0);
  // Radial saw-tooth escape wheel. The locking faces are deliberately enlarged for legibility.
  const shape = new THREE.Shape();
  for (let i = 0; i < teeth; i++) {
    for (const [f, r] of [[0, 1.12], [0.17, 1.12], [0.64, 1.34], [0.81, 1.31], [0.89, 1.12]]) {
      const a = (i + f) * TAU / teeth;
      if (i === 0 && f === 0) shape.moveTo(r * Math.cos(a), r * Math.sin(a));
      else shape.lineTo(r * Math.cos(a), r * Math.sin(a));
    }
  }
  shape.closePath(); const hole = new THREE.Path(); hole.absarc(0, 0, 0.91, 0, TAU, true); shape.holes.push(hole);
  const eg = new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: true, bevelSize: 0.014, bevelThickness: 0.014, bevelSegments: 1, curveSegments: 64 });
  eg.translate(0, 0, -0.09); mesh(THREE, eg, m.gold, escape);
  ring(THREE, escape, m.silver, 0.94, 0.035, 0, 0, 0.1);
  for (let i = 0; i < 5; i++) {
    const a = i * TAU / 5;
    bar(THREE, escape, m.edge, 0.17 * Math.cos(a), 0.17 * Math.sin(a), 0.96 * Math.cos(a), 0.96 * Math.sin(a), 0.115, 0.12, 0);
  }
  disk(THREE, escape, m.silver, 0.22, 0.25);
  bolt(THREE, escape, m.dark, 0, 0, 0.16, 0.11);

  const drive = new THREE.Group(); group.add(drive); drive.position.set(-2.58, -0.11, -0.06);
  gear(THREE, drive, m.edge, 16, 0.76, 0.88, 0.17, 0.6);
  ring(THREE, drive, m.silver, 0.6, 0.035, 0, 0, 0.1);
  for (let i = 0; i < 4; i++) {
    const a = i * TAU / 4;
    bar(THREE, drive, m.graphite, 0.12 * Math.cos(a), 0.12 * Math.sin(a), 0.64 * Math.cos(a), 0.64 * Math.sin(a), 0.12, 0.12, 0);
  }
  disk(THREE, drive, m.dark, 0.54, 0.08, 0, 0, 0.1);
  const springPoints = [];
  for (let i = 0; i <= 160; i++) {
    const a = i / 160 * TAU * 2.8, r = 0.08 + i / 160 * 0.4;
    springPoints.push([r * Math.cos(a), r * Math.sin(a), 0.17]);
  }
  tube(THREE, drive, m.gold, springPoints, 0.018);
  disk(THREE, drive, m.gold, 0.09, 0.1, 0, 0, 0.2);
  const energy = disk(THREE, drive, m.energized, 0.065, 0.05, 0.43, 0, 0.23);
  marking(THREE, group, 'DRIVE SPRING', 1.5, 0.27, -2.58, -1.2, 0.04, '#d7ad72');

  const anchor = new THREE.Group(); group.add(anchor); anchor.position.set(cx, pivotY, 0.42);
  // A rigid inverted anchor shares its arbor with the pendulum; the two pallets
  // alternate the lock. Contact is an instructional abstraction, not a collision simulation.
  bar(THREE, anchor, m.silver, 0, 0, -1.02, -0.66, 0.15, 0.15, 0);
  bar(THREE, anchor, m.silver, 0, 0, 1.02, -0.66, 0.15, 0.15, 0);
  bar(THREE, anchor, m.silver, -1.02, -0.66, -0.99, -0.88, 0.18, 0.15, 0);
  bar(THREE, anchor, m.silver, 1.02, -0.66, 0.99, -0.88, 0.18, 0.15, 0);
  const leftMaterial = m.energized.clone(), rightMaterial = m.energized.clone();
  const leftPallet = roundedPlate(THREE, anchor, leftMaterial, 0.25, 0.13, 0.22, -0.98, -0.88, 0.02, 0.025);
  const rightPallet = roundedPlate(THREE, anchor, rightMaterial, 0.25, 0.13, 0.22, 0.98, -0.88, 0.02, 0.025);
  leftPallet.rotation.z = -0.28; rightPallet.rotation.z = 0.28;
  disk(THREE, anchor, m.gold, 0.2, 0.25);
  bolt(THREE, anchor, m.dark, 0, 0, 0.16, 0.09);

  const pendulum = new THREE.Group(); group.add(pendulum); pendulum.position.set(cx, pivotY, 0.78);
  bar(THREE, pendulum, m.silver, 0, -0.12, 0, -3.65, 0.065, 0.075, 0);
  roundedPlate(THREE, pendulum, m.graphite, 0.18, 0.36, 0.12, 0, -0.22, 0, 0.04);
  disk(THREE, pendulum, m.gold, 0.43, 0.22, 0, -3.72, 0);
  ring(THREE, pendulum, m.silver, 0.35, 0.025, 0, -3.72, 0.13);
  disk(THREE, pendulum, m.graphite, 0.075, 0.06, 0, -3.72, 0.15);
  // Small regulating nut below the bob.
  roundedPlate(THREE, pendulum, m.silver, 0.2, 0.11, 0.16, 0, -4.18, 0, 0.025);
  marking(THREE, group, 'IDEALIZED ANCHOR', 2.8, 0.3, 0.14, -2.52, 0.61, '#bac6d1');

  function update(t = 0, p = 1.35, exploded = 0) {
    const time = finite(t, 0), period = clamp(finite(p, 1.35), 0.6, 2);
    const e = clamp(finite(exploded, 0), 0, 1);
    const halfCycles = time / (period / 2), n = Math.floor(halfCycles), phase = halfCycles - n;
    const release = smooth(0.015, 0.15, phase);
    // One tooth per full oscillation; the wheel remains locked between two short releases.
    const wheelAngle = -(n + release) * (TAU / teeth / 2);
    const swing = 0.14 * Math.sin(Math.PI * halfCycles);
    escape.rotation.z = wheelAngle; escape.position.z = -0.04 - 0.33 * e;
    drive.rotation.z = -wheelAngle * (1.23 / 0.82);
    drive.position.z = -0.06 - 0.18 * e;
    anchor.rotation.z = swing; anchor.position.z = 0.42 + 0.28 * e;
    pendulum.rotation.z = swing; pendulum.position.z = 0.78 + 0.68 * e;
    const leftLocked = ((n % 2) + 2) % 2 === 0;
    leftMaterial.emissiveIntensity = leftLocked ? 0.44 : 0.03;
    rightMaterial.emissiveIntensity = leftLocked ? 0.03 : 0.44;
    // A bright spring marker transfers a brief energy pulse only during release.
    const pulse = Math.sin(Math.PI * clamp((phase - 0.015) / 0.135, 0, 1));
    m.energized.emissiveIntensity = 0.12 + 0.65 * pulse;
    energy.scale.setScalar(1 + 0.35 * pulse);
    group.userData.sample = { period, pendulumAngle: swing, wheelAngle, lockedPallet: leftLocked ? 'left' : 'right', releasing: phase > 0.015 && phase < 0.15 };
  }
  update(0, 1.35, 0);
  return { group, update };
}

export function buildMotor(THREE) {
  const group = new THREE.Group(); group.name = 'Two-pole brushed DC motor';
  const m = materials(THREE), cy = 0.12;
  group.userData = {
    model: 'Simplified two-pole brushed DC motor', parameter: 'Supply polarity: −1 or +1',
    assumptions: 'A single rigid armature coil in a left-to-right magnetic field, split-ring commutator, fixed brushes. Rotation is prescribed at constant speed; force/current directions are illustrative and no electromagnetic or acceleration solver is used.',
    physics: 'With B along +x and axial current I along ±z, F = I × B points along ±y. Commutator current sign changes with cos(theta), preserving the selected torque direction.',
  };
  foundation(THREE, group, m, 7.65, -2.7, 0, 1.85);
  const stator = new THREE.Group(); group.add(stator); stator.position.y = cy;
  ring(THREE, stator, m.graphite, 2.5, 0.16, 0, 0, -0.4);
  ring(THREE, stator, m.edge, 2.49, 0.035, 0, 0, -0.2);
  for (const x of [-1.83, 1.83]) {
    roundedPlate(THREE, group, m.graphite, 0.48, 0.66, 1.05, x, -2.22, -0.25, 0.08);
    roundedPlate(THREE, group, m.silver, 0.91, 0.12, 1.28, x, -2.46, -0.25, 0.05);
  }
  const north = sector(THREE, stator, m.gold, 1.66, 2.37, Math.PI * 0.69, Math.PI * 1.31, 0.7);
  const south = sector(THREE, stator, m.silver, 1.66, 2.37, -Math.PI * 0.31, Math.PI * 0.31, 0.7);
  marking(THREE, north, 'N', 0.45, 0.45, -2.05, 0, 0.39, '#28323d');
  marking(THREE, south, 'S', 0.45, 0.45, 2.05, 0, 0.39, '#28323d');
  for (const a of [0.56, 2.58, 3.7, 5.72]) {
    bolt(THREE, stator, m.silver, 2.5 * Math.cos(a), 2.5 * Math.sin(a), -0.18, 0.075);
  }
  // Flux arrows sit behind the rotor. The permanent field is always N → S.
  const fieldMaterial = new THREE.MeshStandardMaterial({ color: C.gold, transparent: true, opacity: 0.28, metalness: 0.15, roughness: 0.7, depthWrite: false });
  for (const y of [-1, -0.5, 0, 0.5, 1]) {
    const a = arrow(THREE, stator, fieldMaterial, 3.1, 0.012);
    a.position.set(-1.55, y, -0.62); a.rotation.z = -Math.PI / 2;
  }

  // Rear end bearing and a visible shaft; the housing is cut away for inspection.
  bar(THREE, group, m.edge, -1.8, -1.95, 0, cy, 0.15, 0.18, -0.91);
  bar(THREE, group, m.edge, 1.8, -1.95, 0, cy, 0.15, 0.18, -0.91);
  disk(THREE, group, m.silver, 0.3, 0.22, 0, cy, -0.92);
  const rotor = new THREE.Group(); group.add(rotor); rotor.position.y = cy;
  axialRod(THREE, rotor, m.silver, 0.13, 2.85, 0, 0, 0.08);
  roundedPlate(THREE, rotor, m.graphite, 2.26, 0.64, 0.67, 0, 0, 0, 0.2);
  for (const x of [-1.03, 1.03]) disk(THREE, rotor, m.edge, 0.39, 0.72, x, 0, 0);
  // Thin stack lines identify the laminated iron armature rather than a solid magnet.
  for (const z of [-0.29, -0.19, -0.09, 0.01, 0.11, 0.21, 0.31]) {
    roundedPlate(THREE, rotor, m.edge, 2.21, 0.028, 0.02, 0, 0.31, z, 0.01);
    roundedPlate(THREE, rotor, m.edge, 2.21, 0.028, 0.02, 0, -0.31, z, 0.01);
  }
  // Five actual rectangular turns in x/z planes: the two active sides run along
  // the shaft at x = ±1.02. Front/back end turns close each current loop.
  for (let i = 0; i < 5; i++) {
    const y = (i - 2) * 0.078;
    tube(THREE, rotor, m.gold, [
      [-1.02, y, -0.43], [-1.09, y, -0.36], [-1.09, y, 0.42],
      [-1.01, y, 0.5], [1.01, y, 0.5], [1.09, y, 0.42],
      [1.09, y, -0.36], [1.02, y, -0.43], [-1.02, y, -0.43],
    ], 0.032);
  }
  disk(THREE, rotor, m.silver, 0.23, 0.12, 0, 0, 0.6);

  const commutator = new THREE.Group(); rotor.add(commutator); commutator.position.z = 1.02;
  const commA = m.energized.clone(), commB = m.gold.clone();
  sector(THREE, commutator, commA, 0.18, 0.46, -Math.PI / 2 + 0.055, Math.PI / 2 - 0.055, 0.26);
  sector(THREE, commutator, commB, 0.18, 0.46, Math.PI / 2 + 0.055, Math.PI * 1.5 - 0.055, 0.26);
  disk(THREE, commutator, m.dark, 0.175, 0.28);
  axialRod(THREE, commutator, m.silver, 0.08, 0.36, 0, 0, 0.03);
  // Leads from coil ends to the two insulated copper commutator halves.
  tube(THREE, rotor, m.gold, [[-0.92, -0.2, 0.5], [-0.6, -0.3, 0.68], [-0.28, -0.2, 0.9]], 0.025);
  tube(THREE, rotor, m.gold, [[0.92, 0.2, 0.5], [0.6, 0.3, 0.68], [0.28, 0.2, 0.9]], 0.025);

  const brushes = new THREE.Group(); group.add(brushes); brushes.position.set(0, cy, 1.02);
  for (const sign of [-1, 1]) {
    roundedPlate(THREE, brushes, m.dark, 0.3, 0.26, 0.29, sign * 0.59, 0, 0, 0.025);
    roundedPlate(THREE, brushes, m.silver, 0.33, 0.41, 0.4, sign * 0.9, 0, -0.05, 0.04);
    // A visible compression spring maintains brush/commutator contact.
    const spring = [];
    for (let i = 0; i <= 50; i++) {
      const u = i / 50;
      spring.push([sign * (0.71 + u * 0.35), Math.sin(u * TAU * 5) * 0.065, 0.18 + Math.cos(u * TAU * 5) * 0.065]);
    }
    tube(THREE, brushes, m.gold, spring, 0.014);
    tube(THREE, brushes, m.graphite, [[sign * 1.05, 0, -0.05], [sign * 1.45, -0.4, -0.14], [sign * 1.48, -1.76, -0.22]], 0.035);
  }
  const positiveMark = marking(THREE, brushes, '+', 0.2, 0.2, -0.94, 0.37, 0.18, '#d7ad72');
  const negativeMark = marking(THREE, brushes, '−', 0.2, 0.2, 0.94, 0.37, 0.18, '#bac6d1');

  const forces = [arrow(THREE, group, m.energized, 0.58, 0.022), arrow(THREE, group, m.energized, 0.58, 0.022)];
  const torqueCues = [];
  for (const dir of [1, -1]) {
    const cue = new THREE.Group(); group.add(cue); cue.position.y = cy;
    for (const start of [0.25, Math.PI + 0.25]) {
      const points = [];
      for (let i = 0; i <= 26; i++) {
        const a = start + dir * i / 26 * 0.62;
        points.push([1.48 * Math.cos(a), 1.48 * Math.sin(a), 0.7]);
      }
      tube(THREE, cue, m.gold, points, 0.018);
      const a = start + dir * 0.62;
      const cone = mesh(THREE, new THREE.ConeGeometry(0.065, 0.16, 16), m.gold, cue, 1.48 * Math.cos(a), 1.48 * Math.sin(a), 0.7);
      cone.rotation.z = a + (dir > 0 ? 0 : Math.PI);
    }
    torqueCues.push(cue);
  }

  function update(t = 0, p = 1, exploded = 0) {
    const time = finite(t, 0), direction = finite(p, 1) < 0 ? -1 : 1;
    const e = clamp(finite(exploded, 0), 0, 1), theta = direction * time * 0.85;
    rotor.rotation.z = theta; rotor.position.z = 0.24 * e;
    north.position.x = -0.38 * e; south.position.x = 0.38 * e;
    commutator.position.z = 1.02 + 0.24 * e;
    brushes.position.z = 1.02 + 0.43 * e;
    // Brush polarity reverses axial coil current every half revolution. The
    // resulting torque tau_z ∝ direction * |cos(theta)| keeps the same sign.
    const current = direction * (Math.cos(theta) >= 0 ? 1 : -1);
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? 1 : -1;
      forces[i].position.set(side * 1.09 * Math.cos(theta), cy + side * 1.09 * Math.sin(theta), 0.74 + 0.24 * e);
      forces[i].rotation.z = side * current > 0 ? 0 : Math.PI;
    }
    torqueCues[0].visible = direction > 0; torqueCues[1].visible = direction < 0;
    commA.emissiveIntensity = current > 0 ? 0.36 : 0.05;
    commB.color.setHex(current > 0 ? C.gold : C.silver);
    if (positiveMark) positiveMark.position.x = -0.94 * direction;
    if (negativeMark) negativeMark.position.x = 0.94 * direction;
    group.userData.sample = { rotorAngle: theta, direction, axialCurrentSign: current, normalizedTorque: direction * Math.abs(Math.cos(theta)) };
  }
  update(0, 1, 0);
  return { group, update };
}
