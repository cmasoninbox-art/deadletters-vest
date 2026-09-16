/**
 * DEAD LETTERS — Three.js Vest Builder
 * Builds a parametric leather vest mesh from scratch.
 * Works standalone — just open vest3d.html.
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// ── State ──────────────────────────────────────────────
export const state = {
  leather: 'black',   // black | brown | oxblood | tan
  cut:     'classic', // classic | racer | field
  closure: 'zip',     // zip | button | snap
  collar:  'notch',   // notch | shawl | flat
  braid:   'single',  // single | double | none
  color:   0x1a1a1a,
};

export const COLORS = {
  black:   0x1a1a1a,
  brown:   0x3d1a0a,
  oxblood: 0x4a0f0f,
  tan:     0x8c5a2e,
};

const METAL_COLORS = {
  zip:   0xc9a84c,  // brass
  button: 0x888888, // silver
  snap:  0xaaaaaa,  // chrome
};

// ── Material factory ───────────────────────────────────
function leatherMat(color) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
}

function metalMat(color) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.25,
    metalness: 0.95,
  });
}

function stitchMat() {
  return new THREE.LineBasicMaterial({ color: 0x9a7a5a, linewidth: 1 });
}

// ── Vest geometry builders ──────────────────────────────

/** Main torso — tapered box with V-cut bottom */
function buildTorso(cut) {
  const g = new THREE.Group();

  // Shape in XY plane, extrude along Z
  const shape = new THREE.Shape();
  const w = 1.2, h = 1.7, neck = 0.42, armW = 0.38, armH = 0.72;

  if (cut === 'classic') {
    shape.moveTo(-w/2, 0);
    shape.lineTo(-w/2, h - armH);
    shape.lineTo(-w/2 + armW, h - armH);  // armhole curve
    shape.quadraticCurveTo(-w/2 + armW + 0.08, h - armH + 0.05, -w/2 + armW + 0.15, h);
    shape.lineTo(-0.12, 0); // diagonal bottom left
    shape.lineTo(0.12, 0);  // diagonal bottom right
    shape.lineTo(w/2 - armW - 0.15, h);
    shape.quadraticCurveTo(w/2 - armW - 0.08, h - armH + 0.05, w/2 - armW, h - armH);
    shape.lineTo(w/2, h - armH);
    shape.lineTo(w/2, 0);
    shape.lineTo(-w/2, 0);
  } else if (cut === 'racer') {
    shape.moveTo(-w/2 + 0.1, 0);
    shape.lineTo(-w/2 + 0.1, h - armH - 0.12);
    shape.lineTo(-w/2 + armW + 0.05, h - armH - 0.12);
    shape.lineTo(-0.12, 0);
    shape.lineTo(0.12, 0);
    shape.lineTo(w/2 - armW - 0.05, h - armH - 0.12);
    shape.lineTo(w/2 - 0.1, h - armH - 0.12);
    shape.lineTo(w/2 - 0.1, 0);
    shape.lineTo(-w/2 + 0.1, 0);
  } else if (cut === 'field') {
    shape.moveTo(-w/2, 0);
    shape.lineTo(-w/2, h - armH + 0.1);
    shape.lineTo(-w/2 + armW + 0.1, h - armH + 0.1);
    shape.lineTo(-0.12, 0);
    shape.lineTo(0.12, 0);
    shape.lineTo(w/2 - armW - 0.1, h - armH + 0.1);
    shape.lineTo(w/2, h - armH + 0.1);
    shape.lineTo(w/2, 0);
    shape.lineTo(-w/2, 0);
  }

  // Neck cutout
  const neckCut = new THREE.Path();
  neckCut.moveTo(-neck, h);
  neckCut.lineTo(0, h - 0.35);
  neckCut.lineTo(neck, h);
  shape.holes.push(neckCut);

  const extSettings = {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.012,
    bevelSegments: 3,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extSettings);
  geo.center();
  const mesh = new THREE.Mesh(geo, leatherMat(state.color));
  g.add(mesh);

  // Stitch lines along bottom edge
  const stitchGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.12, -0.38, 0.08),
    new THREE.Vector3(0.12, -0.38, 0.08),
  ]);
  g.add(new THREE.Line(stitchGeo, stitchMat()));

  return g;
}

/** Collar trim */
function buildCollar(collarType) {
  const g = new THREE.Group();
  const c = state.color;

  if (collarType === 'notch') {
    // Left lapel
    const shape = new THREE.Shape();
    shape.moveTo(-0.42, 0.58);
    shape.lineTo(-0.12, 0.68);
    shape.lineTo(-0.18, 0.35);
    shape.lineTo(-0.5, 0.35);
    shape.lineTo(-0.42, 0.58);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false });
    const m = new THREE.Mesh(geo, leatherMat(c));
    m.rotation.z = -0.2;
    g.add(m);

    // Right lapel (mirror)
    const shapeR = new THREE.Shape();
    shapeR.moveTo(0.42, 0.58);
    shapeR.lineTo(0.12, 0.68);
    shapeR.lineTo(0.18, 0.35);
    shapeR.lineTo(0.5, 0.35);
    shapeR.lineTo(0.42, 0.58);
    const geoR = new THREE.ExtrudeGeometry(shapeR, { depth: 0.04, bevelEnabled: false });
    const mR = new THREE.Mesh(geoR, leatherMat(c));
    mR.rotation.z = 0.2;
    g.add(mR);
  } else if (collarType === 'shawl') {
    const shape = new THREE.Shape();
    shape.moveTo(-0.5, 0.5);
    shape.quadraticCurveTo(-0.3, 0.72, 0, 0.65);
    shape.quadraticCurveTo(0.3, 0.72, 0.5, 0.5);
    shape.lineTo(0.42, 0.4);
    shape.lineTo(-0.42, 0.4);
    shape.lineTo(-0.5, 0.5);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false });
    const m = new THREE.Mesh(geo, leatherMat(c));
    g.add(m);
  } else {
    // flat — simple band
    const geo = new THREE.TorusGeometry(0.36, 0.03, 8, 32, Math.PI);
    const m = new THREE.Mesh(geo, leatherMat(c));
    m.rotation.x = Math.PI / 2;
    m.position.y = 0.62;
    g.add(m);
  }

  return g;
}

/** Center closure line + hardware */
function buildClosure(type) {
  const g = new THREE.Group();
  const mCol = METAL_COLORS[type] ?? 0xc9a84c;

  // Vertical strip (slight indent)
  const stripGeo = new THREE.BoxGeometry(0.025, 1.55, 0.01);
  const strip = new THREE.Mesh(stripGeo, leatherMat(state.color));
  strip.position.z = 0.075;
  g.add(strip);

  if (type === 'zip') {
    // Zipper teeth
    for (let y = -0.65; y <= 0.65; y += 0.05) {
      const geo = new THREE.BoxGeometry(0.025, 0.02, 0.025);
      const m = new THREE.Mesh(geo, metalMat(mCol));
      m.position.set(0, y, 0.08);
      g.add(m);
    }
    // Pull tab
    const tabGeo = new THREE.TorusGeometry(0.04, 0.01, 8, 16);
    const tab = new THREE.Mesh(tabGeo, metalMat(mCol));
    tab.position.set(0, 0.5, 0.08);
    tab.rotation.x = Math.PI / 2;
    g.add(tab);
  } else if (type === 'button') {
    const buttonCount = 5;
    for (let i = 0; i < buttonCount; i++) {
      const y = -0.55 + i * (1.1 / (buttonCount - 1));
      const geo = new THREE.CylinderGeometry(0.035, 0.035, 0.015, 16);
      const m = new THREE.Mesh(geo, metalMat(mCol));
      m.rotation.x = Math.PI / 2;
      m.position.set(0, y, 0.08);
      g.add(m);
    }
  } else if (type === 'snap') {
    const snapCount = 7;
    for (let i = 0; i < snapCount; i++) {
      const y = -0.6 + i * (1.2 / (snapCount - 1));
      const geo = new THREE.CylinderGeometry(0.02, 0.02, 0.01, 12);
      const m = new THREE.Mesh(geo, metalMat(mCol));
      m.rotation.x = Math.PI / 2;
      m.position.set(0, y, 0.08);
      g.add(m);
    }
  }

  return g;
}

/** Edge braid along bottom hem and armholes */
function buildBraid(braidType) {
  if (braidType === 'none') return new THREE.Group();

  const g = new THREE.Group();
  const r = 0.022;

  // Bottom braid — two ropes for double
  const addRope = (yOffset) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.12, yOffset - 0.38, 0.07),
      new THREE.Vector3(0.0,  yOffset - 0.41, 0.07),
      new THREE.Vector3(0.12, yOffset - 0.38, 0.07),
    ]);
    const geo = new THREE.TubeGeometry(curve, 16, r, 8, false);
    g.add(new THREE.Mesh(geo, leatherMat(state.color)));
  };

  if (braidType === 'single') {
    addRope(0);
    // Side braids
    const leftCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.55, -0.1, 0.07),
      new THREE.Vector3(-0.58, -0.25, 0.07),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(leftCurve, 8, r, 8, false), leatherMat(state.color)));
    const rightCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.55, -0.1, 0.07),
      new THREE.Vector3(0.58, -0.25, 0.07),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(rightCurve, 8, r, 8, false), leatherMat(state.color)));
  } else {
    addRope(0.025);
    addRope(-0.025);
    const leftCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.55, -0.1, 0.07),
      new THREE.Vector3(-0.58, -0.25, 0.07),
    ]);
    const rightCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.55, -0.1, 0.07),
      new THREE.Vector3(0.58, -0.25, 0.07),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(leftCurve, 8, r, 8, false), leatherMat(state.color)));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(leftCurve, 8, r, 8, false), leatherMat(state.color)));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(rightCurve, 8, r, 8, false), leatherMat(state.color)));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(rightCurve, 8, r, 8, false), leatherMat(state.color)));
  }

  return g;
}

/** Shoulder eppaulettes/patches */
function buildShoulderPatches() {
  const g = new THREE.Group();
  const patchGeo = new THREE.BoxGeometry(0.22, 0.06, 0.04);
  const positions = [[-0.98, 0.55], [0.98, 0.55]];
  for (const [x, y] of positions) {
    const m = new THREE.Mesh(patchGeo, leatherMat(state.color));
    m.position.set(x, y, 0.08);
    m.rotation.z = x > 0 ? 0.15 : -0.15;
    g.add(m);
  }
  return g;
}

// ── Scene builder ────────────────────────────────────────
export function buildVest() {
  const group = new THREE.Group();
  group.add(buildTorso(state.cut));
  group.add(buildCollar(state.collar));
  group.add(buildClosure(state.closure));
  group.add(buildBraid(state.braid));
  group.add(buildShoulderPatches());
  group.position.y = -0.3;
  return group;
}

export function updateVestColor(color) {
  state.color = COLORS[color] ?? COLORS.black;
  // Rebuild to apply new color
  // (In production, would cache meshes and update material.color only)
}
