// Self-contained teaching models. Dimensions are deliberately compressed:
// these are explanatory diagrams, not product CAD or astronomical scale models.
// All updates use absolute time in seconds and are safe to seek or replay.

const GOLD = 0xd7ad72;
const SILVER = 0xc9cdd1;
const GRAPHITE = 0x252a2e;
const clamp = (v, min, max) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min));

function standard(THREE, color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.36, metalness: 0.65, ...extra });
}

function mesh(THREE, geometry, material, parent, position) {
  const item = new THREE.Mesh(geometry, material);
  if (position) item.position.set(...position);
  parent.add(item);
  return item;
}

function line(THREE, points, color, opacity = 1, parent) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
  const material = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: false });
  const item = new THREE.Line(geometry, material);
  if (parent) parent.add(item);
  return item;
}

function setLine(THREE, item, points) {
  const positions = item.geometry.attributes.position;
  points.forEach((p, i) => positions.setXYZ(i, p[0], p[1], p[2]));
  positions.needsUpdate = true;
  item.geometry.computeBoundingSphere();
}

function annulus(THREE, inner, outer, depth, material, parent, arc = Math.PI * 2, start = 0) {
  const shape = new THREE.Shape();
  if (arc >= Math.PI * 2 - 0.001) {
    shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, inner, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  } else {
    shape.moveTo(Math.cos(start) * outer, Math.sin(start) * outer);
    shape.absarc(0, 0, outer, start, start + arc, false);
    shape.lineTo(Math.cos(start + arc) * inner, Math.sin(start + arc) * inner);
    shape.absarc(0, 0, inner, start + arc, start, true);
    shape.closePath();
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025,
    bevelSegments: 3, curveSegments: 80, steps: 1,
  });
  geometry.translate(0, 0, -depth / 2);
  return mesh(THREE, geometry, material, parent);
}

function bead(THREE, radius, color, parent, extra = {}) {
  return mesh(THREE, new THREE.SphereGeometry(radius, 16, 12), standard(THREE, color, extra), parent);
}

/**
 * A plausible smart-ring stack: casing, curved cell, PCB, and optical liner.
 * The visible layer construction is generic and is not a specific product.
 * p is normalized sensor intensity; exploded is normalized axial separation.
 */
export function buildRing(THREE) {
  const group = new THREE.Group();
  const assembly = new THREE.Group();
  assembly.rotation.set(0.18, -0.18, -0.06);
  group.add(assembly);

  const metal = standard(THREE, SILVER, { metalness: 0.95, roughness: 0.2 });
  const dark = standard(THREE, GRAPHITE, { roughness: 0.29, metalness: 0.35 });
  const gold = standard(THREE, GOLD, { metalness: 0.86, roughness: 0.28 });
  const pcbMat = standard(THREE, 0x3c4946, { metalness: 0.4, roughness: 0.6 });
  const glass = standard(THREE, 0x111b1c, { metalness: 0.1, roughness: 0.1 });
  const layers = Array.from({ length: 4 }, () => new THREE.Group());
  layers.forEach(layer => assembly.add(layer));
  const [casing, battery, pcb, liner] = layers;

  // A shallow annular sleeve exposes the components when separated along z.
  annulus(THREE, 1.64, 2.02, 0.34, metal, casing);
  const outerEdge = mesh(THREE, new THREE.TorusGeometry(1.99, 0.035, 12, 100), gold, casing);
  outerEdge.position.z = 0.17;
  const innerEdge = mesh(THREE, new THREE.TorusGeometry(1.65, 0.035, 12, 100), dark, casing);
  innerEdge.position.z = -0.17;
  // Small breaks between curved cell sections communicate manufacturable parts.
  annulus(THREE, 1.68, 1.93, 0.1, dark, battery, Math.PI * 1.22, -0.25);
  annulus(THREE, 1.68, 1.93, 0.1, dark, battery, Math.PI * 0.48, Math.PI * 1.06);
  for (const angle of [0.0, 3.8]) {
    const tab = mesh(THREE, new THREE.BoxGeometry(0.2, 0.12, 0.04), gold, battery);
    tab.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0.075);
    tab.rotation.z = angle;
  }

  annulus(THREE, 1.65, 1.96, 0.065, pcbMat, pcb);
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2;
    const track = [];
    for (let j = 0; j <= 6; j++) {
      const angle = a + j * 0.022;
      track.push([Math.cos(angle) * 1.81, Math.sin(angle) * 1.81, 0.06]);
    }
    line(THREE, track, GOLD, 0.8, pcb);
    const contact = bead(THREE, 0.037, GOLD, pcb);
    contact.position.set(Math.cos(a) * 1.9, Math.sin(a) * 1.9, 0.06);
  }
  for (const [angle, width] of [[0.4, 0.32], [2.35, 0.27], [4.6, 0.3]]) {
    const chip = mesh(THREE, new THREE.BoxGeometry(width, 0.19, 0.12), dark, pcb);
    chip.position.set(Math.cos(angle) * 1.79, Math.sin(angle) * 1.79, 0.1);
    chip.rotation.z = angle + Math.PI / 2;
    const mark = mesh(THREE, new THREE.BoxGeometry(width * 0.45, 0.025, 0.006), metal, chip, [0, 0, 0.064]);
    mark.rotation.z = 0;
  }

  annulus(THREE, 1.49, 1.73, 0.13, dark, liner);
  const rim = mesh(THREE, new THREE.TorusGeometry(1.5, 0.028, 12, 100), metal, liner);
  rim.position.z = 0.07;
  const sensors = [];
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + (i - 1) * 0.32;
    const module = new THREE.Group();
    module.position.set(Math.cos(a) * 1.59, Math.sin(a) * 1.59, 0.09);
    module.rotation.z = a + Math.PI / 2;
    liner.add(module);
    mesh(THREE, new THREE.BoxGeometry(0.28, 0.16, 0.065), glass, module);
    const eye = bead(THREE, i === 1 ? 0.072 : 0.052, i === 1 ? GOLD : 0x8bb7a2, module,
      { emissive: i === 1 ? GOLD : 0x7ca38e, emissiveIntensity: 0.3, metalness: 0.2 });
    eye.scale.z = 0.5;
    eye.position.z = 0.045;
    sensors.push(eye);
  }
  // Fine axial guides preserve the relationship between the separated parts.
  const guides = new THREE.Group();
  assembly.add(guides);
  for (let i = 0; i < 3; i++) {
    const a = Math.PI / 6 + i * Math.PI * 2 / 3;
    line(THREE, [[Math.cos(a) * 1.82, Math.sin(a) * 1.82, -1.3],
      [Math.cos(a) * 1.82, Math.sin(a) * 1.82, 1.3]], SILVER, 0.15, guides);
  }
  function update(t = 0, p = 0.6, exploded = 0) {
    const e = clamp(exploded, 0, 1);
    const assembled = [-0.14, -0.025, 0.065, 0.17];
    const separated = [-1.08, -0.35, 0.37, 1.08];
    layers.forEach((layer, i) => { layer.position.z = assembled[i] + (separated[i] - assembled[i]) * e; });
    guides.visible = e > 0.08;
    const pulse = (0.5 + 0.5 * Math.sin((Number.isFinite(t) ? t : 0) * 3.1)) * clamp(p, 0, 1);
    sensors.forEach((sensor, i) => { sensor.material.emissiveIntensity = 0.18 + pulse * (i === 1 ? 0.65 : 1.1); });
  }
  update();
  return { group, update };
}

function arrow(THREE, parent, material) {
  const item = new THREE.Group();
  mesh(THREE, new THREE.CylinderGeometry(0.028, 0.028, 0.83, 12), material, item, [0, 0.415, 0]);
  mesh(THREE, new THREE.ConeGeometry(0.12, 0.22, 20), material, item, [0, 0.89, 0]);
  parent.add(item);
  return item;
}

function pathPoint(THREE, points, fraction) {
  const lengths = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const length = new THREE.Vector3(...points[i]).distanceTo(new THREE.Vector3(...points[i - 1]));
    lengths.push(length);
    total += length;
  }
  let distance = fraction * total;
  for (let i = 0; i < lengths.length; i++) {
    if (distance <= lengths[i] || i === lengths.length - 1) {
      return new THREE.Vector3(...points[i]).lerp(new THREE.Vector3(...points[i + 1]), distance / lengths[i]);
    }
    distance -= lengths[i];
  }
  return new THREE.Vector3(...points[0]);
}

/** Thin-lens ray construction. Optical units are displayed at 0.72 world units.
 * p = object distance u in [3,6], f=1.5, v=f*u/(u-f), m=-v/u.
 * Parallel and optical-center rays travel left to right and meet at the image.
 */
export function buildLens(THREE) {
  const group = new THREE.Group();
  const worldScale = 0.72;
  const focal = 1.5;
  const objectHeight = 1.12;
  const gold = standard(THREE, GOLD, { roughness: 0.3 });
  const silver = standard(THREE, SILVER, { metalness: 0.7, roughness: 0.3 });
  const dark = standard(THREE, GRAPHITE, { roughness: 0.5 });
  const radius = 1.53;
  const profile = [];
  for (let i = 0; i <= 28; i++) {
    const r = radius * i / 28;
    profile.push(new THREE.Vector2(r, 0.025 + 0.19 * (1 - (r / radius) ** 2)));
  }
  for (let i = 28; i >= 0; i--) {
    const r = radius * i / 28;
    profile.push(new THREE.Vector2(r, -0.025 - 0.19 * (1 - (r / radius) ** 2)));
  }
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0xa5c5ce, roughness: 0.08, metalness: 0, transparent: true,
    opacity: 0.2, transmission: 0.2, thickness: 0.42, ior: 1.48,
    depthWrite: false, side: THREE.DoubleSide,
  });
  const lens = mesh(THREE, new THREE.LatheGeometry(profile, 80), lensMat, group);
  lens.rotation.z = -Math.PI / 2;
  const frame = mesh(THREE, new THREE.TorusGeometry(1.59, 0.042, 12, 100), silver, group);
  frame.rotation.y = Math.PI / 2;
  const foot = mesh(THREE, new THREE.BoxGeometry(0.72, 0.14, 1.02), dark, group, [0, -2.33, 0]);
  mesh(THREE, new THREE.CylinderGeometry(0.06, 0.08, 0.64, 20), silver, group, [0, -1.94, 0]);
  foot.position.y = -2.33;
  line(THREE, [[-4.8, 0, 0], [4.5, 0, 0]], SILVER, 0.3, group);
  for (const sign of [-1, 1]) {
    const x = sign * focal * worldScale;
    line(THREE, [[x, -0.11, 0], [x, 0.11, 0]], GOLD, 0.8, group);
    const dot = bead(THREE, 0.043, GOLD, group, { emissive: GOLD, emissiveIntensity: 0.2 });
    dot.position.x = x;
  }
  const object = arrow(THREE, group, gold);
  const image = arrow(THREE, group, silver);
  const rayColors = [GOLD, SILVER, 0x8da9b0];
  const rays = rayColors.map(color => line(THREE, [[0, 0, 0], [0, 0, 0], [0, 0, 0]], color, 0.8, group));
  const photons = rayColors.map(color => Array.from({ length: 3 }, () =>
    bead(THREE, 0.047, color, group, { emissive: color, emissiveIntensity: 1.4, metalness: 0 })));
  const objectBase = mesh(THREE, new THREE.CylinderGeometry(0.18, 0.18, 0.045, 24), dark, group);
  objectBase.rotation.x = Math.PI / 2;
  const imageBase = objectBase.clone();
  group.add(imageBase);
  let currentPaths = [];

  function update(t = 0, p = 4.5, exploded = 0) {
    const time = Number.isFinite(t) ? t : 0;
    const u = clamp(p, 3, 6);
    const v = focal * u / (u - focal);
    const objectX = -u * worldScale;
    const imageX = v * worldScale;
    const imageHeight = -objectHeight * v / u;
    object.position.set(objectX, 0, 0.025);
    object.scale.y = objectHeight;
    image.position.set(imageX, 0, 0.025);
    image.scale.y = imageHeight;
    objectBase.position.set(objectX, 0, -0.025);
    imageBase.position.set(imageX, 0, -0.025);
    // exploded gently exposes the two physical lens surfaces without altering
    // the thin-lens plane used for the exact teaching construction.
    lens.scale.y = 1 + clamp(exploded, 0, 1) * 0.6;
    currentPaths = [
      [[objectX, objectHeight, 0.06], [0, objectHeight, 0.06], [imageX, imageHeight, 0.06]],
      [[objectX, objectHeight, 0.07], [0, 0, 0.07], [imageX, imageHeight, 0.07]],
      [[objectX, objectHeight, 0.05], [0, imageHeight, 0.05], [imageX, imageHeight, 0.05]],
    ];
    currentPaths.forEach((path, i) => {
      setLine(THREE, rays[i], path);
      photons[i].forEach((photon, j) => {
        const fraction = ((time * 0.19 + j / 3 + i * 0.12) % 1 + 1) % 1;
        photon.position.copy(pathPoint(THREE, path, fraction));
      });
    });
  }
  update();
  return { group, update };
}

function circlePoints(radius, count = 120) {
  return Array.from({ length: count + 1 }, (_, i) => {
    const a = i / count * Math.PI * 2;
    return [Math.cos(a) * radius, Math.sin(a) * radius, 0];
  });
}

function cylinderBetween(THREE, parent, bottomRadius, topRadius, material) {
  // Unit cylinder's bottom is the source and its top is downstream.
  return mesh(THREE, new THREE.CylinderGeometry(topRadius, bottomRadius, 1, 40, 1, true), material, parent);
}

function orientCylinder(THREE, item, start, direction, length) {
  item.position.copy(start).addScaledVector(direction, length / 2);
  item.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  item.scale.y = length;
}

/**
 * A compressed Sun–Earth–Moon model. Orbital radius is 2.1 world units;
 * the drawn disks and shadow-cone lengths are enlarged for legibility.
 * The reference orbit lies in xy; p inclines the orbit around y in [0,30]°.
 * Inclination moves the Moon above/below the Sun–Earth line in three dimensions.
 */
export function buildEclipse(THREE) {
  const group = new THREE.Group();
  const sunPosition = new THREE.Vector3(-4, 0, 0);
  const earthRadius = 0.61;
  const sun = bead(THREE, 0.68, GOLD, group, { emissive: GOLD, emissiveIntensity: 1.35, metalness: 0, roughness: 0.8 });
  sun.position.copy(sunPosition);
  const haloMaterial = new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.07, depthWrite: false });
  const halo = mesh(THREE, new THREE.SphereGeometry(0.82, 32, 24), haloMaterial, group);
  halo.position.copy(sunPosition);

  const earth = bead(THREE, earthRadius, 0x394850, group, { roughness: 0.82, metalness: 0.18 });
  // Hand-drawn geographical cues rather than a texture or external asset.
  const continents = [
    [[-1.3, 0.85], [-0.85, 1.0], [-0.45, 0.65], [-0.6, 0.3], [-0.35, 0.02], [-0.7, -0.15], [-0.95, 0.22], [-1.3, 0.85]],
    [[-0.65, -0.2], [-0.3, -0.4], [-0.42, -0.95], [-0.65, -1.1], [-0.78, -0.6], [-0.65, -0.2]],
    [[0.15, 0.7], [0.65, 0.98], [1.3, 0.55], [1.4, 0.1], [0.83, -0.05], [0.6, -0.5], [0.25, -0.65], [0.07, -0.12], [0.3, 0.2], [0.15, 0.7]],
  ];
  for (const contour of continents) {
    const points = contour.map(([longitude, latitude]) => {
      const r = earthRadius + 0.006;
      return [r * Math.cos(latitude) * Math.sin(longitude), r * Math.sin(latitude), r * Math.cos(latitude) * Math.cos(longitude)];
    });
    line(THREE, points, 0x9baca7, 0.75, earth);
  }
  for (const latitude of [-Math.PI / 3, 0, Math.PI / 3]) {
    const r = Math.cos(latitude) * (earthRadius + 0.008);
    const y = Math.sin(latitude) * (earthRadius + 0.008);
    const points = Array.from({ length: 81 }, (_, i) => {
      const a = i / 80 * Math.PI * 2;
      return [Math.cos(a) * r, y, Math.sin(a) * r];
    });
    line(THREE, points, SILVER, 0.12, earth);
  }
  const moon = bead(THREE, 0.235, SILVER, group, { roughness: 0.93, metalness: 0.04 });
  const craterMat = standard(THREE, 0x858b91, { roughness: 1, metalness: 0 });
  for (const [x, y, size] of [[-0.08, 0.06, 0.045], [0.08, -0.07, 0.055], [0.05, 0.11, 0.025], [-0.1, -0.08, 0.027]]) {
    const crater = mesh(THREE, new THREE.CircleGeometry(size, 20), craterMat, moon);
    crater.position.set(x, y, Math.sqrt(0.235 ** 2 - x ** 2 - y ** 2) + 0.001);
    crater.lookAt(new THREE.Vector3(x, y, crater.position.z).multiplyScalar(10));
  }

  line(THREE, circlePoints(2.1), SILVER, 0.15, group);
  const orbit = new THREE.Group();
  group.add(orbit);
  line(THREE, circlePoints(2.1), GOLD, 0.55, orbit);
  // A reference solar axis makes the missed alignment visible at inclination.
  line(THREE, [[-3.25, 0, 0], [4.5, 0, 0]], SILVER, 0.13, group);
  const umbraMat = new THREE.MeshBasicMaterial({ color: 0x10161e, transparent: true, opacity: 0.26, side: THREE.DoubleSide, depthWrite: false });
  const penumbraMat = new THREE.MeshBasicMaterial({ color: 0x76818b, transparent: true, opacity: 0.055, side: THREE.DoubleSide, depthWrite: false });
  const earthUmbra = cylinderBetween(THREE, group, 0.59, 0.32, umbraMat);
  const earthPenumbra = cylinderBetween(THREE, group, 0.61, 1.06, penumbraMat);
  const earthStart = new THREE.Vector3(0.42, 0, 0);
  const positiveX = new THREE.Vector3(1, 0, 0);
  orientCylinder(THREE, earthUmbra, earthStart, positiveX, 3.95);
  orientCylinder(THREE, earthPenumbra, earthStart, positiveX, 3.95);
  const moonUmbra = cylinderBetween(THREE, group, 0.22, 0.005, umbraMat.clone());
  moonUmbra.material.opacity = 0.38;
  const moonPenumbra = cylinderBetween(THREE, group, 0.23, 0.38, penumbraMat.clone());
  moonPenumbra.material.opacity = 0.095;

  const photons = [];
  for (let i = 0; i < 5; i++) {
    const y = (i - 2) * 0.57;
    const z = -0.22;
    line(THREE, [[-3.2, y, z], [-0.76, y, z]], GOLD, 0.2, group);
    const photon = bead(THREE, 0.035, GOLD, group, { emissive: GOLD, emissiveIntensity: 1.4, metalness: 0 });
    photons.push({ photon, y, z });
  }
  const direction = new THREE.Vector3();
  const shadowStart = new THREE.Vector3();
  function update(t = 0, p = 0, exploded = 0) {
    const time = Number.isFinite(t) ? t : 0;
    const inclination = clamp(p, 0, 30) * Math.PI / 180;
    // Start at new moon, so the initial view demonstrates a solar alignment.
    const phase = Math.PI + time * 0.27;
    const x = 2.1 * Math.cos(phase);
    const y = 2.1 * Math.sin(phase);
    moon.position.set(x * Math.cos(inclination), y, -x * Math.sin(inclination));
    orbit.rotation.y = inclination;
    direction.copy(moon.position).sub(sunPosition).normalize();
    shadowStart.copy(moon.position).addScaledVector(direction, 0.17);
    // Clip the illustrative cone to fixed scene bounds, including its radius.
    let length = 2.9;
    const limits = [4.55, 2.4, 1.4];
    const coordinates = ['x', 'y', 'z'];
    coordinates.forEach((axis, i) => {
      const component = direction[axis];
      if (Math.abs(component) > 0.0001) {
        const wall = component > 0 ? limits[i] : -limits[i];
        length = Math.min(length, (wall - shadowStart[axis]) / component);
      }
    });
    length = Math.max(0.12, length);
    orientCylinder(THREE, moonUmbra, shadowStart, direction, length);
    orientCylinder(THREE, moonPenumbra, shadowStart, direction, length);
    // Separation here means exposing the inner dark cone, without moving bodies.
    const e = clamp(exploded, 0, 1);
    earthPenumbra.material.opacity = 0.055 + e * 0.055;
    moonPenumbra.material.opacity = 0.095 + e * 0.07;
    photons.forEach(({ photon, y: rayY, z }, i) => {
      const phaseAlongRay = ((time * 0.45 + i * 0.18) % 1 + 1) % 1;
      photon.position.set(-3.2 + phaseAlongRay * 2.44, rayY, z);
    });
    halo.scale.setScalar(1 + Math.sin(time * 1.4) * 0.018);
  }
  update();
  return { group, update };
}
