/**
 * DEAD LETTERS — Three.js Vest Builder (ES Module)
 * Identical option set to crimwearco.com TCustomizer.
 * Uses real vest.glb model with dynamic color updates.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ── State ──────────────────────────────────────────────────
const state = {
  gender:   'male',
  style:    'australian',
  leather:  'black',
  cut:      'tom',
  closure:  'bolo',
  collar:   'widev',
  braid:    'none',
  stitch:   'matching',
  liner:    'standard',
  kevlar:   'none',
  piping:   'standard',
  reversible: 'no',
  zipperAccess: 'no',
  patch:    'none',
  addons:   new Set(),
  color:    0x1a1a1a,
};

// ── Color maps ─────────────────────────────────────────────
const COLORS = {
  black: 0x1a1a1a, white: 0xf0f0f0, blue: 0x1a3a6e, red: 0x8b0000,
  green: 0x2d4a1e, orange: 0xb35000, desertbrown: 0x8b5a2b,
  stormgrey: 0x4a4a4a, blackops: 0x0d0d0d, blackperf: 0x2a2a2a,
  multical: 0x5c5c3c,
};

// ── Pricing ────────────────────────────────────────────────
const STYLE_BASE = { australian: 825, nz: 825, american: 800, euro: 800, tactical: 999, swat: 800 };
const KEVLAR_PRICE = { none: 0, '1layer': 75, '2layers': 150, '3layers': 225, '4layers': 300,
  '5layers': 375, '6layers': 450, '7layers': 525, '8layers': 600, '9layers': 675, '10layers': 750 };
const ADDON_PRICE = {
  extrapocket: 15, hiddenstash: 15, gunpocket: 30, zipext: 100,
  heatedliner: 175, customprint: 100, fullzipliner: 75,
  customfit: 150, dutchback: 0, fatstrap: 0,
};
const PATCH_PRICE = { none: 0, eagle: 55, cross: 55, custom: 75 };
const REVERSIBLE_PRICE = { no: 0, yes: 75 };
const ZIPPER_ACCESS_PRICE = { no: 0, yes: 50 };

// ── Scene setup ────────────────────────────────────────────
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
scene.fog = new THREE.FogExp2(0x0a0a0a, 0.3);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.01, 50);
camera.position.set(0, 0.1, 4.8);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 2.5;
controls.maxDistance = 9;
controls.target.set(0, 0.1, 0);

// Lights
const ambient = new THREE.AmbientLight(0x3a2a1a, 3.5);
scene.add(ambient);
const key = new THREE.DirectionalLight(0xfff5e8, 2.8);
key.position.set(2, 4, 4); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5; key.shadow.camera.far = 20;
key.shadow.camera.left = -3; key.shadow.camera.right = 3;
key.shadow.camera.top = 3; key.shadow.camera.bottom = -3;
scene.add(key);
const fill1 = new THREE.DirectionalLight(0xc8d8ff, 0.6);
fill1.position.set(-3, 1, 2); scene.add(fill1);
const fill2 = new THREE.DirectionalLight(0xffd580, 0.4);
fill2.position.set(0, -2, -3); scene.add(fill2);

// Ground shadow
const groundGeo = new THREE.PlaneGeometry(20, 20);
const groundMat = new THREE.ShadowMaterial({ opacity: 0.25 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2; ground.position.y = -1.0;
ground.receiveShadow = true; scene.add(ground);

// ── Vest model ────────────────────────────────────────────
let vestGroup = null;
const loader = new GLTFLoader();
let meshMaterials = []; // Track leather meshes for color updates

function loadModel() {
  loader.load(
    'vest.glb?' + Date.now(),
    (gltf) => {
      if (vestGroup) { scene.remove(vestGroup); disposeGroup(vestGroup); }
      vestGroup = gltf.scene;
      meshMaterials = [];

      vestGroup.traverse(o => {
        if (o.isMesh) {
          o.castShadow = true; o.receiveShadow = true;
          // Capture all leather-colored meshes for dynamic updates
          if (o.material && o.material.isMeshStandardMaterial && !o.material.metalness) {
            meshMaterials.push(o.material);
          }
          // Ensure metalness materials stay metal
          if (o.material && o.material.metalness > 0.5) {
            o.material.metalness = 0.9;
            o.material.roughness = 0.3;
          }
        }
      });

      scene.add(vestGroup);
      // Apply initial color
      updateVestColor(state.color);
    },
    undefined,
    (err) => {
      console.error('GLB load error:', err);
    }
  );
}

function disposeGroup(group) {
  group.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
      else o.material.dispose();
    }
  });
}

// ── Color update ──────────────────────────────────────────
function updateVestColor(hexColor) {
  if (meshMaterials.length === 0) return;
  const color = new THREE.Color(hexColor);
  for (const mat of meshMaterials) {
    mat.color.copy(color);
    mat.needsUpdate = true;
  }
}

// ── Option image overlay ───────────────────────────────────
const overlay = document.getElementById('option-img-overlay');

function getOptionImageSrc() {
  const style = state.style;
  const leather = state.leather;
  // Check for cropped option-specific image
  const capPath = `assets/caps/${style}_${leather}.png`;
  const fs = document.createElement('fs');
  // Fall back to style screenshot
  const styleScreenshots = {
    australian: 'assets/australian_style.png',
    nz: 'assets/nz_style.png',
    american: 'assets/us_style.png',
    euro: 'assets/euro_style.png',
    tactical: 'assets/tactical_style.png',
    swat: 'assets/swat_style.png',
  };
  // Use the caps image if it exists
  if (style === 'australian') {
    const leatherMap = {
      black: 'assets/caps/australian_Black_Leather.png',
      suede: 'assets/caps/australian_Black_Suede.png',
      brown: 'assets/caps/australian_Brown_Leather.png',
      red: 'assets/caps/australian_Red_Leather.png',
      white: 'assets/caps/australian_White_Leather.png',
    };
    if (leatherMap[leather]) return leatherMap[leather];
  }
  return styleScreenshots[style] || 'assets/main_vest.png';
}

function updateOptionImage() {
  const src = getOptionImageSrc();
  overlay.style.backgroundImage = `url(${src})`;
  overlay.classList.add('visible');
}

// ── Price calculation ──────────────────────────────────────
function updatePrice() {
  let base = STYLE_BASE[state.style] || 825;
  let kevlar = KEVLAR_PRICE[state.kevlar] || 0;
  let patch = PATCH_PRICE[state.patch] || 0;
  let rev = REVERSIBLE_PRICE[state.reversible] || 0;
  let za = ZIPPER_ACCESS_PRICE[state.zipperAccess] || 0;
  let addons_total = 0;
  state.addons.forEach(a => { addons_total += ADDON_PRICE[a] || 0; });

  const total = base + kevlar + patch + rev + za + addons_total;
  document.getElementById('priceAmount').textContent =
    '$' + total.toLocaleString('en-US');
}

// ── UI event handling ──────────────────────────────────────
document.querySelectorAll('[data-group]').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.dataset.group;
    const value = btn.dataset.value;

    if (group === 'addons') {
      if (state.addons.has(value)) state.addons.delete(value);
      else state.addons.add(value);
    } else if (group === 'leather') {
      state.leather = value;
      state.color = COLORS[value] || 0x1a1a1a;
      updateVestColor(state.color);
    } else {
      state[group] = value;
    }

    // Update active states
    document.querySelectorAll(`[data-group="${group}"]`).forEach(b => {
      b.classList.toggle('active', b.dataset.value === value || (
        group === 'addons' && state.addons.has(b.dataset.value)
      ));
    });

    updatePrice();
    updateOptionImage();
  });
});

// ── Resize ─────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Animation loop ─────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ── Init ───────────────────────────────────────────────────
loadModel();
updatePrice();
updateOptionImage();
animate();
