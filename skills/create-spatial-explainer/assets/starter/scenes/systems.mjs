/* Bounded procedural teaching assets. Time is absolute seconds, never a delta. */
const GOLD = 0xd7ad72;
const SILVER = 0xbac2c9;
const GRAPHITE = 0x242a31;
const INK = 0x10151b;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : lo));
const lerp = (a, b, p) => a + (b - a) * p;
const smooth = p => { const q = clamp(p, 0, 1); return q * q * (3 - 2 * q); };
const seconds = t => Math.max(0, Number.isFinite(t) ? t : 0);

function materials(THREE) {
  return {
    dark: new THREE.MeshStandardMaterial({ color: GRAPHITE, metalness: .78, roughness: .36 }),
    black: new THREE.MeshStandardMaterial({ color: INK, metalness: .55, roughness: .48 }),
    silver: new THREE.MeshStandardMaterial({ color: SILVER, metalness: .86, roughness: .28 }),
    gold: new THREE.MeshStandardMaterial({ color: GOLD, metalness: .8, roughness: .27 }),
    glow: new THREE.MeshStandardMaterial({ color: GOLD, emissive: GOLD, emissiveIntensity: .45, metalness: .5, roughness: .3 }),
  };
}

function mesh(THREE, parent, geometry, material, position = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

function box(THREE, parent, material, size, position) {
  return mesh(THREE, parent, new THREE.BoxGeometry(...size), material, position);
}

function sphere(THREE, parent, material, radius, position) {
  return mesh(THREE, parent, new THREE.SphereGeometry(radius, 16, 12), material, position);
}

function ring(THREE, parent, material, radius, tube, position) {
  return mesh(THREE, parent, new THREE.TorusGeometry(radius, tube, 8, 64), material, position);
}

function disc(THREE, parent, material, radius, depth, position) {
  const result = mesh(THREE, parent, new THREE.CylinderGeometry(radius, radius, depth, 48), material, position);
  result.rotation.x = Math.PI / 2;
  return result;
}

function rodBetween(THREE, parent, material, a, b, radius = .025) {
  const av = new THREE.Vector3(...a);
  const bv = new THREE.Vector3(...b);
  const result = mesh(THREE, parent, new THREE.CylinderGeometry(radius, radius, av.distanceTo(bv), 8), material);
  result.position.copy(av).add(bv).multiplyScalar(.5);
  result.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), bv.sub(av).normalize());
  return result;
}

function curveRail(THREE, parent, material, points, radius = .025) {
  const curve = new THREE.CubicBezierCurve3(...points.map(p => new THREE.Vector3(...p)));
  const rail = mesh(THREE, parent, new THREE.TubeGeometry(curve, 40, radius, 6, false), material);
  return { curve, rail, radius };
}

function updateRail(THREE, entry, points) {
  [entry.curve.v0, entry.curve.v1, entry.curve.v2, entry.curve.v3].forEach((v, i) => v.set(...points[i]));
  entry.rail.geometry.dispose();
  entry.rail.geometry = new THREE.TubeGeometry(entry.curve, 40, entry.radius, 6, false);
}

function studs(THREE, parent, material, xs, y, z) {
  xs.forEach(x => disc(THREE, parent, material, .042, .04, [x, y, z]));
}

/** The entire attention model: a three-score temperature-scaled softmax. */
export function attentionWeights(temperature = 1) {
  const temp = clamp(temperature, .3, 2);
  const scores = [2, 1, 0];
  const exponents = scores.map(score => Math.exp((score - 2) / temp));
  const total = exponents.reduce((sum, value) => sum + value, 0);
  return exponents.map(value => value / total);
}

export function buildAttention(THREE) {
  const group = new THREE.Group();
  group.name = 'Three-token toy attention';
  const mat = materials(THREE);
  const xs = [-3, 0, 3];
  const tokenGroups = [];
  const bars = [];
  const pathMaterials = [];
  const paths = [];
  const beads = [];
  const collector = new THREE.Group();
  group.add(collector);
  collector.position.set(0, -1.82, .1);
  disc(THREE, collector, mat.dark, .58, .24);
  ring(THREE, collector, mat.silver, .47, .035, [0, 0, .16]);
  ring(THREE, collector, mat.gold, .32, .04, [0, 0, .2]);
  const center = sphere(THREE, collector, mat.glow, .16, [0, 0, .24]);
  const orbit = new THREE.Group();
  collector.add(orbit);
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2 / 3;
    sphere(THREE, orbit, mat.gold, .055, [Math.cos(a) * .4, Math.sin(a) * .4, .2]);
  }

  xs.forEach((x, i) => {
    const token = new THREE.Group();
    token.name = `Token ${i + 1}, fixed score ${2 - i}`;
    group.add(token);
    tokenGroups.push(token);
    token.position.set(x, 1.7, .1);
    box(THREE, token, mat.dark, [1.5, .86, .48]);
    box(THREE, token, mat.silver, [1.36, .68, .025], [0, 0, .255]);
    box(THREE, token, mat.black, [1.25, .57, .025], [0, 0, .28]);
    // A deliberately geometric token symbol; no fonts or network assets needed.
    for (let k = 0; k <= i; k++) {
      const bar = box(THREE, token, k === 0 ? mat.gold : mat.silver, [.105, .32 - k * .045, .06], [(k - i / 2) * .24, 0, .315]);
      bar.rotation.z = i === 1 ? -.24 : i === 2 ? .24 : 0;
    }
    studs(THREE, token, mat.gold, [-.57, .57], -.27, .32);
    for (let score = 0; score < 2 - i; score++) sphere(THREE, token, mat.gold, .055, [(score - (1 - i) / 2) * .2, .55, .1]);

    const bar = box(THREE, group, mat.gold, [.5, 1, .3], [x, -.2, .25]);
    bars.push(bar);
    box(THREE, group, mat.dark, [1.05, .08, .62], [x, -.75, .05]);
    for (let mark = 0; mark <= 4; mark++) {
      box(THREE, group, mat.silver, [.11, .018, .03], [x - .48, -.68 + mark * .4, .2]);
    }
    const railMaterial = mat.gold.clone();
    railMaterial.transparent = true;
    pathMaterials.push(railMaterial);
    const points = [[x, 1.24, -.13], [x, -.5, -.42], [x * .45, -1.82, -.42], [0, -1.82, .1]];
    paths.push(curveRail(THREE, group, railMaterial, points, .028));
    beads.push(sphere(THREE, group, mat.glow, .1));
  });

  let lastExplosion = -1;
  function update(t = 0, p = 1, exploded = 0) {
    const now = seconds(t);
    const e = clamp(exploded, 0, 1);
    const temperature = clamp(p, .3, 2);
    const weights = attentionWeights(temperature);
    xs.forEach((x, i) => {
      const spread = x === 0 ? 0 : Math.sign(x) * e * .25;
      const height = Math.max(.016, weights[i] * 1.6);
      tokenGroups[i].position.set(x + spread, 1.7 + e * .2, .1 - e * .35);
      bars[i].position.set(x, -.68 + height / 2, .25 + e * .45);
      bars[i].scale.y = height;
      pathMaterials[i].opacity = .2 + weights[i] * .8;
      if (Math.abs(lastExplosion - e) > .0001) {
        updateRail(THREE, paths[i], [[x + spread, 1.24 + e * .2, -.13 - e * .35], [x + spread, -.5, -.42 - e * .25], [x * .45, -1.82, -.42], [0, -1.82, .1]]);
      }
      beads[i].position.copy(paths[i].curve.getPoint((now * .24 + i / 3) % 1));
      beads[i].scale.setScalar(.45 + Math.sqrt(weights[i]) * 1.25);
    });
    lastExplosion = e;
    orbit.rotation.z = now * .3;
    center.scale.setScalar(.88 + weights[0] * .3);
    group.userData.stats = {
      model: 'toy softmax', temperature, scores: [2, 1, 0], weights,
      entropy: -weights.reduce((sum, weight) => sum + weight * Math.log(weight), 0),
      note: 'Three fixed example scores; the moving beads illustrate weighted paths, not model internals.',
    };
  }
  update(0, 1, 0);
  return { group, update };
}

const AGENT_NODES = ['input', 'plan', 'tool', 'check', 'output'];
const AGENT_ROUTE = [0, 1, 2, 3, 2, 3, 4];

/** A scripted event replay, including exactly one failed check and retry per cycle. */
export function agentReplay(t = 0, toolLatency = 1) {
  const latency = clamp(toolLatency, .5, 2);
  const dwell = [.65, .95, latency, .65, latency, .65, .9];
  const transit = .42;
  const events = [];
  let cursor = 0;
  AGENT_ROUTE.forEach((node, i) => {
    events.push({ start: cursor, end: cursor + dwell[i], node, routeIndex: i, type: 'node' });
    cursor += dwell[i];
    if (i < AGENT_ROUTE.length - 1) {
      events.push({ start: cursor, end: cursor + transit, from: node, to: AGENT_ROUTE[i + 1], routeIndex: i, type: 'edge' });
      cursor += transit;
    }
  });
  const completeAt = cursor;
  events.push({ start: cursor, end: cursor + .7, node: 4, routeIndex: 6, type: 'hold' });
  const duration = cursor + .7;
  const absolute = seconds(t);
  const cycle = Math.floor(absolute / duration);
  const local = absolute - cycle * duration;
  const event = events.find(item => local >= item.start && local < item.end) || events[events.length - 1];
  const progress = clamp((local - event.start) / (event.end - event.start), 0, 1);
  const retryAt = events.find(item => item.type === 'edge' && item.from === 3 && item.to === 2).start;
  return {
    ...event, progress, local, duration, cycle, toolLatency: latency,
    activeNode: event.type === 'edge' ? null : AGENT_NODES[event.node],
    activeEdge: event.type === 'edge' ? [AGENT_NODES[event.from], AGENT_NODES[event.to]] : null,
    attempt: event.routeIndex >= 4 ? 2 : 1,
    retries: cycle + (local >= retryAt ? 1 : 0),
    completed: cycle + (local >= completeAt ? 1 : 0),
    status: event.type === 'hold' ? 'complete' : event.type === 'edge' && event.from === 3 && event.to === 2 ? 'retry' : event.type === 'node' && event.routeIndex === 3 ? 'check failed' : event.type === 'node' && event.routeIndex === 5 ? 'check passed' : AGENT_NODES[event.node ?? event.to],
  };
}

export function buildAgent(THREE) {
  const group = new THREE.Group();
  group.name = 'Deterministic agent workflow replay';
  const mat = materials(THREE);
  const positions = [[-3.65, 0, 0], [-1.85, .6, 0], [0, 0, 0], [1.85, .6, 0], [3.65, 0, 0]];
  const nodes = [];
  const halos = [];
  const indicators = [];
  const arcs = [];
  const arrowHeads = [];
  const edgePairs = [[0, 1], [1, 2], [2, 3], [3, 4], [3, 2]];
  const nodeParts = [];

  positions.forEach((position, i) => {
    const node = new THREE.Group();
    node.name = AGENT_NODES[i];
    node.position.set(...position);
    group.add(node);
    nodes.push(node);
    disc(THREE, node, mat.dark, .62, .28, [0, 0, -.13]);
    ring(THREE, node, mat.silver, .56, .028, [0, 0, .04]);
    const haloMat = mat.glow.clone();
    const halo = ring(THREE, node, haloMat, .66, .035, [0, 0, -.04]);
    halos.push(halo);
    const indicator = sphere(THREE, node, haloMat, .065, [0, -.82, .13]);
    indicators.push(indicator);
    const part = new THREE.Group();
    node.add(part);
    nodeParts.push(part);
    if (i === 0) {
      for (let j = 0; j < 3; j++) box(THREE, part, j === 2 ? mat.gold : mat.silver, [.52, .1, .1], [0, .22 - j * .2, .18]);
    } else if (i === 1) {
      for (let j = 0; j < 3; j++) {
        const tile = box(THREE, part, j === 1 ? mat.gold : mat.silver, [.48, .3, .09], [(j - 1) * .08, .2 - j * .2, .12 + j * .08]);
        tile.rotation.z = -.14;
      }
    } else if (i === 2) {
      ring(THREE, part, mat.gold, .3, .065, [0, 0, .18]);
      for (let j = 0; j < 8; j++) {
        const a = j * Math.PI / 4;
        const tooth = box(THREE, part, mat.silver, [.14, .17, .12], [Math.sin(a) * .36, Math.cos(a) * .36, .18]);
        tooth.rotation.z = -a;
      }
      disc(THREE, part, mat.dark, .16, .15, [0, 0, .22]);
    } else if (i === 3) {
      rodBetween(THREE, part, mat.gold, [-.3, -.02, .2], [-.08, -.25, .2], .052);
      rodBetween(THREE, part, mat.gold, [-.08, -.25, .2], [.32, .25, .2], .052);
    } else {
      box(THREE, part, mat.gold, [.38, .5, .12], [0, 0, .19]);
      box(THREE, part, mat.dark, [.25, .035, .04], [0, .1, .27]);
      box(THREE, part, mat.dark, [.25, .035, .04], [0, -.04, .27]);
    }
    // Small ordinal markers link the geometry to the five-stage replay.
    for (let j = 0; j <= i; j++) box(THREE, node, mat.silver, [.055, .06, .03], [(j - i / 2) * .13, -1.05, 0]);
  });

  function edgePoints(index, e) {
    const [a, b] = edgePairs[index];
    const ap = positions[a];
    const bp = positions[b];
    const z = -.16 - e * .3;
    if (index === 4) return [[ap[0], ap[1] - .6, z], [ap[0] + .25, -1.7 - e * .15, z], [bp[0] - .25, -1.7 - e * .15, z], [bp[0], bp[1] - .6, z]];
    return [[ap[0] + .59, ap[1], z], [ap[0] + .94, ap[1], z], [bp[0] - .94, bp[1], z], [bp[0] - .59, bp[1], z]];
  }

  edgePairs.forEach((pair, i) => {
    const railMaterial = mat.gold.clone();
    railMaterial.transparent = true;
    railMaterial.opacity = .22;
    const path = curveRail(THREE, group, railMaterial, edgePoints(i, 0), i === 4 ? .022 : .028);
    arcs.push(path);
    const arrow = mesh(THREE, group, new THREE.ConeGeometry(.09, .2, 12), mat.silver);
    arrowHeads.push(arrow);
  });
  const packet = sphere(THREE, group, mat.glow, .12);
  const packetHalo = ring(THREE, group, mat.gold, .19, .018);
  const retryMarker = ring(THREE, group, mat.glow.clone(), .12, .026, [.93, -1.36, .1]);
  let lastExplosion = -1;

  function update(t = 0, p = 1, exploded = 0) {
    const now = seconds(t);
    const e = clamp(exploded, 0, 1);
    const replay = agentReplay(now, p);
    positions.forEach((position, i) => {
      nodes[i].position.z = e * (i % 2 ? .35 : -.1);
      nodeParts[i].position.z = e * .3;
      const active = replay.activeNode === AGENT_NODES[i];
      halos[i].material.emissiveIntensity = active ? 1 : .05;
      halos[i].material.color.setHex(active ? GOLD : GRAPHITE);
      indicators[i].scale.setScalar(active ? 1.4 : .7);
      const pulse = active ? 1 + .03 * Math.sin(now * 5) : 1;
      halos[i].scale.setScalar(pulse);
    });
    // The tool rotates only while its recorded processing event is active.
    nodeParts[2].rotation.z = replay.activeNode === 'tool' ? replay.progress * Math.PI * 2 : 0;
    arcs.forEach((arc, i) => {
      if (Math.abs(lastExplosion - e) > .0001) updateRail(THREE, arc, edgePoints(i, e));
      const active = replay.type === 'edge' && edgePairs[i][0] === replay.from && edgePairs[i][1] === replay.to;
      arc.rail.material.opacity = active ? .95 : i === 4 ? .34 : .2;
      const point = arc.curve.getPoint(.8);
      const tangent = arc.curve.getTangent(.8).normalize();
      arrowHeads[i].position.copy(point);
      arrowHeads[i].quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
      arrowHeads[i].scale.setScalar(active ? 1.1 : .7);
    });
    lastExplosion = e;
    packet.visible = replay.type === 'edge';
    packetHalo.visible = packet.visible;
    if (!packet.visible) { packet.position.set(0,0,0);packetHalo.position.set(0,0,0);packetHalo.scale.setScalar(1); }
    if (packet.visible) {
      const index = edgePairs.findIndex(([a, b]) => a === replay.from && b === replay.to);
      packet.position.copy(arcs[index].curve.getPoint(replay.progress));
      packetHalo.position.copy(packet.position);
      packetHalo.scale.setScalar(1 + Math.sin(replay.progress * Math.PI) * .4);
    }
    retryMarker.material.emissiveIntensity = replay.status === 'retry' ? .8 : .05;
    retryMarker.scale.setScalar(replay.status === 'retry' ? 1.3 : 1);
    group.userData.stats = {
      model: 'scripted replay', activeNode: replay.activeNode, activeEdge: replay.activeEdge,
      status: replay.status, attempt: replay.attempt, retries: replay.retries,
      completed: replay.completed, toolLatency: replay.toolLatency,
      progress: replay.progress, localTime: replay.local, duration: replay.duration,
      note: 'A deterministic five-node replay with one retry per cycle; no live tool or API requests.',
    };
  }
  update(0, 1, 0);
  return { group, update };
}

const STATION_X = [-2.6, 0, 2.6];
const QUEUE_X = [[-3.35, -3.87, -4.39], [-.75, -1.27, -1.79], [1.85, 1.33, .81]];
const QUEUE_CAPACITY = 3;
const ARRIVAL_PERIOD = .9;
const TRANSFER_TIME = .32;
const EXIT_TIME = .72;

function motionX(job, t) {
  const motion = job.motion;
  return motion ? lerp(motion.from, motion.to, smooth((t - motion.at) / motion.duration)) : job.fromX;
}

function createConveyorState(serviceTime) {
  return {
    time: 0, serviceTime: clamp(serviceTime, .5, 2.5), durations: [.68, clamp(serviceTime, .5, 2.5), .78],
    nextArrival: 0, arrived: 0, admitted: 0, rejected: 0, completed: 0,
    queues: [[], [], []], stations: [null, null, null], exits: [], busy: [0, 0, 0],
  };
}

function relayoutQueues(state) {
  state.queues.forEach((queue, stage) => queue.forEach((job, slot) => {
    const target = QUEUE_X[stage][slot];
    if (!job.motion || job.motion.to !== target) {
      job.motion = { from: motionX(job, state.time), to: target, at: state.time, duration: TRANSFER_TIME };
    }
  }));
}

function settleConveyor(state) {
  let changed = true;
  while (changed) {
    changed = false;
    for (let stage = 2; stage >= 0; stage--) {
      const station = state.stations[stage];
      if (station && station.finish <= state.time + 1e-9) {
        if (stage === 2) {
          state.completed++;
          state.exits.push({ ...station.job, departed: state.time });
          state.busy[stage] += station.duration;
          state.stations[stage] = null;
          changed = true;
        } else if (state.queues[stage + 1].length < QUEUE_CAPACITY) {
          const job = station.job;
          job.fromX = STATION_X[stage];
          job.motion = null;
          job.ready = state.time + TRANSFER_TIME;
          state.queues[stage + 1].push(job);
          state.busy[stage] += station.duration;
          state.stations[stage] = null;
          changed = true;
        }
      }
      const queue = state.queues[stage];
      if (!state.stations[stage] && queue.length && queue[0].ready <= state.time + 1e-9) {
        const job = queue.shift();
        const startX = motionX(job, state.time);
        const duration = state.durations[stage];
        state.stations[stage] = { job, start: state.time, finish: state.time + duration, duration, startX };
        changed = true;
      }
    }
    relayoutQueues(state);
  }
  state.exits = state.exits.filter(job => state.time - job.departed < EXIT_TIME);
}

function advanceConveyor(state, target) {
  const until = seconds(target);
  for (;;) {
    let next = state.nextArrival;
    state.stations.forEach(station => {
      if (station && station.finish > state.time + 1e-9) next = Math.min(next, station.finish);
    });
    state.queues.forEach((queue, stage) => {
      if (!state.stations[stage] && queue.length && queue[0].ready > state.time + 1e-9) next = Math.min(next, queue[0].ready);
    });
    if (next > until + 1e-9) break;
    state.time = next;
    // Downstream completions release space before a same-time source arrival.
    settleConveyor(state);
    if (state.nextArrival <= next + 1e-9) {
      const id = state.arrived++;
      if (state.queues[0].length < QUEUE_CAPACITY) {
        state.admitted++;
        state.queues[0].push({ id, arrived: next, ready: next + TRANSFER_TIME, fromX: -4.77, motion: null });
      } else state.rejected++;
      state.nextArrival = state.arrived * ARRIVAL_PERIOD;
      settleConveyor(state);
    }
  }
  state.time = until;
  state.exits = state.exits.filter(job => until - job.departed < EXIT_TIME);
  return state;
}

function conveyorSnapshot(state) {
  const now = state.time;
  const boxes = [];
  state.queues.forEach((queue, stage) => queue.forEach((job, slot) => boxes.push({
    id: job.id, kind: 'queued', stage, slot, x: motionX(job, now), progress: 0,
  })));
  const stationStats = state.stations.map((station, stage) => {
    if (!station) return { state: 'idle', progress: 0, job: null };
    const progress = clamp((now - station.start) / station.duration, 0, 1);
    boxes.push({ id: station.job.id, kind: progress >= 1 ? 'blocked' : 'processing', stage, progress,
      x: lerp(station.startX, STATION_X[stage], smooth((now - station.start) / Math.min(.22, station.duration * .3))) });
    return { state: progress >= 1 ? 'blocked' : 'processing', progress, job: station.job.id };
  });
  state.exits.forEach(job => boxes.push({ id: job.id, kind: 'exiting', stage: 3,
    x: lerp(STATION_X[2], 4.6, smooth((now - job.departed) / EXIT_TIME)), progress: (now - job.departed) / EXIT_TIME }));
  const queued = state.queues.reduce((sum, queue) => sum + queue.length, 0);
  return {
    time: now, serviceTime: state.serviceTime, arrived: state.arrived, admitted: state.admitted,
    rejected: state.rejected, completed: state.completed, queued,
    inSystem: queued + state.stations.filter(Boolean).length,
    throughput: now > 0 ? state.completed / now : 0,
    throughputPerMinute: now > 0 ? state.completed / now * 60 : 0,
    queues: state.queues.map(queue => queue.length), queueCapacity: QUEUE_CAPACITY,
    stations: stationStats, boxes,
    utilization: state.busy.map((busy, i) => now > 0 ? Math.min(1, (busy + (state.stations[i] ? Math.min(state.durations[i], now - state.stations[i].start) : 0)) / now) : 0),
  };
}

/** Exact finite-buffer tandem queue, replayable at any absolute time. */
export function simulateConveyor(t = 0, serviceTime = 1) {
  return conveyorSnapshot(advanceConveyor(createConveyorState(serviceTime), t));
}

export function buildConveyor(THREE) {
  const group = new THREE.Group();
  group.name = 'Three-station finite-buffer conveyor';
  const mat = materials(THREE);
  const belt = new THREE.Group();
  const machinery = new THREE.Group();
  const parcels = new THREE.Group();
  group.add(belt, machinery, parcels);
  box(THREE, belt, mat.dark, [9.4, .18, 1.18], [0, -.7, 0]);
  box(THREE, belt, mat.black, [9.15, .065, 1.02], [0, -.565, 0]);
  for (let x = -4.45; x <= 4.5; x += .38) {
    const roller = mesh(THREE, belt, new THREE.CylinderGeometry(.1, .1, 1.22, 12), mat.silver, [x, -.71, 0]);
    roller.rotation.x = Math.PI / 2;
  }
  for (const x of [-4.1, -1.4, 1.4, 4.1]) {
    box(THREE, belt, mat.dark, [.12, .66, .12], [x, -1.08, -.42]);
    box(THREE, belt, mat.dark, [.12, .66, .12], [x, -1.08, .42]);
    box(THREE, belt, mat.silver, [.5, .075, 1.15], [x, -1.42, 0]);
  }
  for (const z of [-.56, .56]) box(THREE, belt, mat.silver, [9.35, .055, .045], [0, -.35, z]);
  // The three visibly bounded queue bays correspond exactly to capacity three.
  QUEUE_X.forEach(slots => slots.forEach(x => {
    box(THREE, belt, mat.gold, [.38, .012, .06], [x, -.52, .41]);
    box(THREE, belt, mat.gold, [.38, .012, .06], [x, -.52, -.41]);
  }));
  const punches = [];
  const progressBars = [];
  const stationLights = [];
  STATION_X.forEach((x, i) => {
    const station = new THREE.Group();
    station.position.x = x;
    station.name = `Station ${i + 1}`;
    machinery.add(station);
    box(THREE, station, mat.dark, [.86, 1.7, .44], [0, .25, -.79]);
    box(THREE, station, mat.silver, [.69, 1.5, .035], [0, .25, -.55]);
    box(THREE, station, mat.black, [.54, .92, .03], [0, .44, -.52]);
    box(THREE, station, i === 1 ? mat.gold : mat.silver, [.92, .18, .85], [0, 1.05, -.43]);
    const punch = new THREE.Group();
    station.add(punch);
    mesh(THREE, punch, new THREE.CylinderGeometry(.055, .055, .64, 12), mat.silver, [0, .55, 0]);
    box(THREE, punch, mat.gold, [.42, .12, .48], [0, .2, 0]);
    punches.push(punch);
    const progress = box(THREE, station, mat.gold, [.45, .055, .045], [-.225, .78, -.48]);
    progressBars.push(progress);
    const lightMaterial = mat.glow.clone();
    stationLights.push(sphere(THREE, station, lightMaterial, .065, [0, 1.3, -.56]));
    studs(THREE, station, mat.gold, [-.26, .26], -.4, -.5);
    for (let j = 0; j <= i; j++) box(THREE, station, mat.silver, [.045, .1, .04], [(j - i / 2) * .13, .44, -.48]);
  });
  const boxPool = Array.from({ length: 16 }, (_, i) => {
    const parcel = new THREE.Group();
    parcels.add(parcel);
    const bodyMaterial = mat.silver.clone();
    const body = box(THREE, parcel, bodyMaterial, [.36, .4, .4], [0, -.31, 0]);
    box(THREE, parcel, mat.dark, [.045, .405, .408], [0, -.31, 0]);
    box(THREE, parcel, mat.gold, [.15, .08, .018], [.075, -.25, .215]);
    parcel.userData.body = body;
    parcel.name = `Parcel pool ${i}`;
    return parcel;
  });
  let state = createConveyorState(1);
  let previousTime = -1;
  let previousParameter = 1;

  function update(t = 0, p = 1, exploded = 0) {
    const now = seconds(t);
    const parameter = clamp(p, .5, 2.5);
    const e = clamp(exploded, 0, 1);
    if (now < previousTime || parameter !== previousParameter) state = createConveyorState(parameter);
    advanceConveyor(state, now);
    const snapshot = conveyorSnapshot(state);
    previousTime = now;
    previousParameter = parameter;
    belt.position.z = e * .42;
    machinery.position.set(0, e * .32, -e * .5);
    parcels.position.z = e * .42;
    boxPool.forEach((parcel, i) => {
      const item = snapshot.boxes[i];
      parcel.visible = Boolean(item);
      if (!item) {
        // Box3 includes invisible descendants, so pooled parcels must have a
        // canonical inactive pose rather than retain their last replay pose.
        parcel.position.set(0, 0, 0);
        parcel.rotation.set(0, 0, 0);
        parcel.scale.set(1, 1, 1);
        parcel.userData.job = null;
        parcel.userData.state = null;
        parcel.userData.body.material.color.setHex(SILVER);
        return;
      }
      parcel.position.set(item.x, 0, 0);
      parcel.userData.job = item.id;
      parcel.userData.state = item.kind;
      parcel.userData.body.material.color.setHex(item.kind === 'processing' || item.kind === 'blocked' ? GOLD : SILVER);
      parcel.rotation.z = item.kind === 'exiting' ? -.08 * Math.sin(item.progress * Math.PI) : 0;
    });
    snapshot.stations.forEach((station, i) => {
      const active = station.state === 'processing';
      punches[i].position.y = active ? -.17 * Math.sin(station.progress * Math.PI) ** 2 : 0;
      progressBars[i].scale.x = Math.max(.01, station.progress);
      progressBars[i].position.x = -.225 + .225 * station.progress;
      stationLights[i].material.emissiveIntensity = active ? .7 : station.state === 'blocked' ? .25 : .02;
      stationLights[i].scale.setScalar(active ? 1.15 : .8);
    });
    group.userData.stats = {
      ...snapshot, model: 'deterministic finite-buffer tandem queue',
      arrivalPeriod: ARRIVAL_PERIOD, stationServiceTimes: [.68, parameter, .78], transferTime: TRANSFER_TIME,
      note: 'Three waiting places per buffer; a completed station blocks if the next buffer is full. Full source arrivals are rejected. Changing service time restarts the simulation at the current absolute time.',
    };
  }
  update(0, 1, 0);
  return { group, update };
}
