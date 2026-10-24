/**
 * ============================================================================
 * AVENGERS: DOOMSDAY — THREE.JS 3D INTERACTIVE HERO COMPONENT
 * ============================================================================
 * Specialist WebGL / Three.js interactive 3D scene.
 *
 * Features:
 *  - Floating, multi-layered wireframe icosahedron & metallic quantum tesseract
 *  - 3 Concentric holographic orbital gimbal rings with Latverian telemetry nodes
 *  - Interactive multiversal particle wave / accretion quantum swarm (400+ nodes)
 *  - Dynamic 3-point cinematic lighting with theme-reactive neon point lights
 *  - Damped mouse parallax tilt (lerped spatial depth)
 *  - Full 360° touch / drag-to-orbit inspection with inertial damping
 *  - Interactive click / tap EMP Shockwave explosion with particle burst & audio
 *  - Scroll-linked scale / camera depth parallax
 *  - Multi-geometry mode switching (Quantum Tesseract / Latverian Shield / Incursion Singularity)
 *  - Seamless reactive synchronization with website themes (Doomsday, Infinity, Multiverse, Stark, Asgard)
 *  - Strict DPR capping (Math.min(window.devicePixelRatio, 2)) for peak 60-120fps performance
 *  - Non-blocking layout: text & buttons on top remain 100% clickable with z-index separation
 *  - Full lifecycle cleanup & resource disposal (geometries, materials, renderers, listeners)
 */

import * as THREE from 'three';
import { playBlast, playShield, playBlip, isAudioEnabled } from './audio.js';

// --- Theme Color Palettes for WebGL Lighting & Materials ---
const THEME_PALETTES = {
  doomsday: {
    primary: 0x10b981,   // Latverian Emerald
    secondary: 0x34d399, // Bright Mint Glow
    tertiary: 0x065f46,  // Deep Forest Green
    metallic: 0x081f14,  // Dark Latverian Titanium
    particles: 0x6ee7b7,
    ambient: 0x03140c
  },
  infinity: {
    primary: 0xa855f7,   // Power Stone Purple
    secondary: 0xf59e0b, // Soul Stone Gold
    tertiary: 0x6b21a8,  // Deep Void Violet
    metallic: 0x170b2c,  // Cosmic Obsidian
    particles: 0xc084fc,
    ambient: 0x0e051c
  },
  multiverse: {
    primary: 0xec4899,   // Scarlet Hex Pink
    secondary: 0xef4444, // Reality Stone Red
    tertiary: 0x9d174d,  // Dark Crimson
    metallic: 0x240817,  // Dark Multiverse Matter
    particles: 0xf472b6,
    ambient: 0x17050f
  },
  stark: {
    primary: 0x06b6d4,   // Arc Reactor Cyan
    secondary: 0xeab308, // Hotrod Gold
    tertiary: 0x0e7490,  // Deep Repulsor Blue
    metallic: 0x0b1f2b,  // Stark Aerospace Titanium
    particles: 0x67e8f9,
    ambient: 0x04131c
  },
  asgard: {
    primary: 0xeab308,   // Asgardian Royal Gold
    secondary: 0xf97316, // Bifrost Amber
    tertiary: 0xa16207,  // Valhalla Bronze
    metallic: 0x221a06,  // Uru Metal Gold
    particles: 0xfde047,
    ambient: 0x191203
  }
};

// --- Module State ---
let scene, camera, renderer;
let canvasEl, containerEl;
let animationFrameId = null;
let isAnimationPaused = false;
let resizeObserver = null;

// Object Groups & Meshes
let masterGroup;
let outerIcosahedronMesh, vertexPoints;
let innerMetallicCore, innerSingularityCore;
let ring1, ring2, ring3, ringParticles;
let quantumParticles, particlePositions, particleVelocities;
let shockwaveRing;

// Mode 2 & 3 Alternate Geometries
let shieldMesh, vortexAccretionMesh;
let currentMode = 'tesseract'; // 'tesseract' | 'shield' | 'vortex'

// Lighting
let pointLightPrimary, pointLightSecondary, pointLightCore, dirLight, ambientLight;

// Interaction & Animation Interpolation State
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
const drag = {
  isDragging: false,
  previousX: 0,
  previousY: 0,
  targetRotationX: 0,
  targetRotationY: 0,
  rotationX: 0,
  rotationY: 0,
  velocityX: 0,
  velocityY: 0
};
let isHovered = false;
let scrollY = 0;
let shockwaveProgress = 1.0; // 0 to 1, 1 = inactive
let shockwaveIntensity = 0;
let clock = new THREE.Clock();

// Event Listener References for Clean Teardown
const boundHandlers = {};

/**
 * Get current active theme name from document
 */
function getCurrentThemeName() {
  return document.documentElement.getAttribute('data-theme') || 'doomsday';
}

/**
 * Initialize the Three.js 3D Interactive Hero Scene
 * @param {string} canvasSelector - CSS selector for target canvas element
 * @param {string} containerSelector - CSS selector for target parent wrapper
 */
export function initThreeScene(canvasSelector = '#hero-3d-canvas', containerSelector = '#hero-3d-stage') {
  canvasEl = document.querySelector(canvasSelector);
  containerEl = document.querySelector(containerSelector);

  if (!canvasEl || !containerEl) {
    console.warn('[ThreeScene] Target canvas or container not found in DOM.');
    return;
  }

  // Prevent multiple duplicate initializations
  if (renderer) {
    disposeThreeScene();
  }

  // 1. SCENE SETUP
  scene = new THREE.Scene();

  // 2. CAMERA SETUP
  const initialWidth = containerEl.clientWidth || 320;
  const initialHeight = containerEl.clientHeight || 320;
  camera = new THREE.PerspectiveCamera(45, initialWidth / initialHeight, 0.1, 100);
  camera.position.set(0, 0, 7.8);

  // 3. RENDERER SETUP (Strict DPR cap at Math.min(window.devicePixelRatio, 2))
  renderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(initialWidth, initialHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  // 4. LIGHTING SETUP
  setupLighting();

  // 5. 3D OBJECTS & GEOMETRY HIERARCHY
  buildSceneObjects();

  // 6. INITIAL THEME APPLICATION
  applyPaletteColors(getCurrentThemeName());

  // 7. EVENT LISTENERS
  setupEventListeners();

  // 8. START ANIMATION LOOP
  clock.start();
  animate();

  console.info('🛡️ [ThreeScene] Avengers: Doomsday 3D WebGL Hologram initialized.');
}

/**
 * Build cinematic lights
 */
function setupLighting() {
  const currentTheme = getCurrentThemeName();
  const palette = THEME_PALETTES[currentTheme] || THEME_PALETTES.doomsday;

  ambientLight = new THREE.AmbientLight(palette.ambient, 1.8);
  scene.add(ambientLight);

  dirLight = new THREE.DirectionalLight(0xffffff, 2.4);
  dirLight.position.set(5, 8, 6);
  scene.add(dirLight);

  // Theme-reactive primary point light (Top-Right specular highlight)
  pointLightPrimary = new THREE.PointLight(palette.primary, 4.5, 18, 1.2);
  pointLightPrimary.position.set(3.5, 3.2, 3.8);
  scene.add(pointLightPrimary);

  // Theme-reactive secondary point light (Bottom-Left rim light)
  pointLightSecondary = new THREE.PointLight(palette.secondary, 3.2, 16, 1.2);
  pointLightSecondary.position.set(-3.8, -2.8, -2.5);
  scene.add(pointLightSecondary);

  // Core internal emissive light (radiating outward through facets)
  pointLightCore = new THREE.PointLight(palette.primary, 3.0, 8, 1.5);
  pointLightCore.position.set(0, 0, 0);
  scene.add(pointLightCore);
}

/**
 * Construct the 3D Multiversal Doomsday Hologram & Particle Field
 */
function buildSceneObjects() {
  masterGroup = new THREE.Group();
  scene.add(masterGroup);

  const currentTheme = getCurrentThemeName();
  const palette = THEME_PALETTES[currentTheme] || THEME_PALETTES.doomsday;

  // ── A. OUTER WIREFRAME ICOSAHEDRON (Multiverse Horizon Cage) ──
  const icosahedronGeo = new THREE.IcosahedronGeometry(2.0, 1);
  const icosahedronMat = new THREE.MeshBasicMaterial({
    color: palette.primary,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending
  });
  outerIcosahedronMesh = new THREE.Mesh(icosahedronGeo, icosahedronMat);
  masterGroup.add(outerIcosahedronMesh);

  // Vertex Nodes for Icosahedron Corners
  const vertexPointsGeo = new THREE.BufferGeometry();
  const posAttr = icosahedronGeo.attributes.position;
  vertexPointsGeo.setAttribute('position', posAttr.clone());
  const vertexPointsMat = new THREE.PointsMaterial({
    color: palette.secondary,
    size: 0.09,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });
  vertexPoints = new THREE.Points(vertexPointsGeo, vertexPointsMat);
  masterGroup.add(vertexPoints);

  // ── B. INNER METALLIC QUANTUM TESSERACT (Faceted Titanium Core) ──
  // Mode 1: Dodecahedron / Octahedron core with sharp metallic reflections
  const metallicGeo = new THREE.DodecahedronGeometry(1.22, 0);
  const metallicMat = new THREE.MeshStandardMaterial({
    color: palette.metallic,
    roughness: 0.22,
    metalness: 0.92,
    flatShading: true,
    emissive: palette.tertiary,
    emissiveIntensity: 0.35
  });
  innerMetallicCore = new THREE.Mesh(metallicGeo, metallicMat);
  masterGroup.add(innerMetallicCore);

  // ── C. INNERMOST SINGULARITY CORE (Pulsing Energy Sphere) ──
  const singularityGeo = new THREE.SphereGeometry(0.58, 32, 32);
  const singularityMat = new THREE.MeshStandardMaterial({
    color: palette.primary,
    emissive: palette.primary,
    emissiveIntensity: 0.95,
    roughness: 0.1,
    metalness: 0.5,
    wireframe: true
  });
  innerSingularityCore = new THREE.Mesh(singularityGeo, singularityMat);
  masterGroup.add(innerSingularityCore);

  // ── D. MODE 2: LATVERIAN DEFENSE SHIELD (Alternate Geometry) ──
  const shieldShape = new THREE.Shape();
  // Doctor Doom Hexagonal / Latverian Shield Crest outline
  shieldShape.moveTo(0, 1.6);
  shieldShape.lineTo(1.3, 0.9);
  shieldShape.lineTo(1.1, -0.6);
  shieldShape.lineTo(0, -1.6);
  shieldShape.lineTo(-1.1, -0.6);
  shieldShape.lineTo(-1.3, 0.9);
  shieldShape.closePath();

  const extrudeSettings = {
    depth: 0.25,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.08,
    bevelThickness: 0.08
  };
  const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
  shieldGeo.center();
  const shieldMat = new THREE.MeshStandardMaterial({
    color: palette.metallic,
    roughness: 0.2,
    metalness: 0.95,
    flatShading: true,
    emissive: palette.tertiary,
    emissiveIntensity: 0.4
  });
  shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
  shieldMesh.visible = false;
  shieldMesh.scale.set(0.9, 0.9, 0.9);
  masterGroup.add(shieldMesh);

  // ── E. MODE 3: INCURSION ACCRETION DISK (Alternate Geometry) ──
  const vortexGeo = new THREE.TorusGeometry(1.6, 0.22, 16, 80);
  const vortexMat = new THREE.MeshStandardMaterial({
    color: palette.primary,
    emissive: palette.secondary,
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.7,
    wireframe: true
  });
  vortexAccretionMesh = new THREE.Mesh(vortexGeo, vortexMat);
  vortexAccretionMesh.rotation.x = Math.PI / 2.3;
  vortexAccretionMesh.visible = false;
  masterGroup.add(vortexAccretionMesh);

  // ── F. 3 CONCENTRIC HOLOGRAPHIC GIMBAL RINGS ──
  const ring1Geo = new THREE.TorusGeometry(2.45, 0.022, 16, 120);
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: palette.secondary,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });
  ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI / 3.5;
  masterGroup.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(2.85, 0.018, 16, 120);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: palette.primary,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
  });
  ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.y = Math.PI / 4;
  masterGroup.add(ring2);

  const ring3Geo = new THREE.TorusGeometry(3.25, 0.015, 16, 120);
  const ring3Mat = new THREE.MeshBasicMaterial({
    color: palette.secondary,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending
  });
  ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
  ring3.rotation.z = Math.PI / 5;
  masterGroup.add(ring3);

  // Ring Telemetry Nodes orbiting along Ring 2
  const ringNodesCount = 24;
  const ringNodesGeo = new THREE.BufferGeometry();
  const ringNodesPos = new Float32Array(ringNodesCount * 3);
  for (let i = 0; i < ringNodesCount; i++) {
    const angle = (i / ringNodesCount) * Math.PI * 2;
    ringNodesPos[i * 3] = Math.cos(angle) * 2.85;
    ringNodesPos[i * 3 + 1] = Math.sin(angle) * 2.85;
    ringNodesPos[i * 3 + 2] = 0;
  }
  ringNodesGeo.setAttribute('position', new THREE.BufferAttribute(ringNodesPos, 3));
  const ringNodesMat = new THREE.PointsMaterial({
    color: palette.primary,
    size: 0.07,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });
  ringParticles = new THREE.Points(ringNodesGeo, ringNodesMat);
  ring2.add(ringParticles);

  // ── G. QUANTUM PARTICLE SWARM (420+ Multiversal Nodes) ──
  const particleCount = 420;
  const particleGeo = new THREE.BufferGeometry();
  particlePositions = new Float32Array(particleCount * 3);
  particleVelocities = [];

  for (let i = 0; i < particleCount; i++) {
    // Spherical distribution with spiral density
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const radius = 1.8 + Math.random() * 2.2;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    particleVelocities.push({
      orbitSpeed: (0.3 + Math.random() * 0.7) * (Math.random() > 0.5 ? 1 : -1),
      radius,
      theta,
      phi,
      pulsePhase: Math.random() * Math.PI * 2
    });
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: palette.particles,
    size: 0.055,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });
  quantumParticles = new THREE.Points(particleGeo, particleMat);
  masterGroup.add(quantumParticles);

  // ── H. EMP SHOCKWAVE RING (Interactive Click Effect) ──
  const shockwaveGeo = new THREE.RingGeometry(0.3, 0.45, 64);
  const shockwaveMat = new THREE.MeshBasicMaterial({
    color: palette.secondary,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending
  });
  shockwaveRing = new THREE.Mesh(shockwaveGeo, shockwaveMat);
  masterGroup.add(shockwaveRing);
}

/**
 * Apply theme color updates to all Three.js materials and lights
 * @param {string} themeName
 */
export function updateThreeTheme(themeName) {
  const palette = THEME_PALETTES[themeName] || THEME_PALETTES.doomsday;
  applyPaletteColors(themeName);
}

function applyPaletteColors(themeName) {
  const palette = THEME_PALETTES[themeName] || THEME_PALETTES.doomsday;
  const prim = new THREE.Color(palette.primary);
  const sec = new THREE.Color(palette.secondary);
  const tert = new THREE.Color(palette.tertiary);
  const met = new THREE.Color(palette.metallic);
  const amb = new THREE.Color(palette.ambient);
  const part = new THREE.Color(palette.particles);

  if (ambientLight) ambientLight.color.copy(amb);
  if (pointLightPrimary) pointLightPrimary.color.copy(prim);
  if (pointLightSecondary) pointLightSecondary.color.copy(sec);
  if (pointLightCore) pointLightCore.color.copy(prim);

  if (outerIcosahedronMesh) outerIcosahedronMesh.material.color.copy(prim);
  if (vertexPoints) vertexPoints.material.color.copy(sec);
  if (innerMetallicCore) {
    innerMetallicCore.material.color.copy(met);
    innerMetallicCore.material.emissive.copy(tert);
  }
  if (innerSingularityCore) {
    innerSingularityCore.material.color.copy(prim);
    innerSingularityCore.material.emissive.copy(prim);
  }
  if (shieldMesh) {
    shieldMesh.material.color.copy(met);
    shieldMesh.material.emissive.copy(tert);
  }
  if (vortexAccretionMesh) {
    vortexAccretionMesh.material.color.copy(prim);
    vortexAccretionMesh.material.emissive.copy(sec);
  }
  if (ring1) ring1.material.color.copy(sec);
  if (ring2) ring2.material.color.copy(prim);
  if (ring3) ring3.material.color.copy(sec);
  if (ringParticles) ringParticles.material.color.copy(prim);
  if (quantumParticles) quantumParticles.material.color.copy(part);
  if (shockwaveRing) shockwaveRing.material.color.copy(sec);
}

/**
 * Switch 3D Geometry Mode
 * @param {'tesseract'|'shield'|'vortex'} mode
 */
export function switch3DMode(mode) {
  currentMode = mode;

  if (!masterGroup) return;

  const isTesseract = mode === 'tesseract';
  const isShield = mode === 'shield';
  const isVortex = mode === 'vortex';

  if (innerMetallicCore) innerMetallicCore.visible = isTesseract;
  if (outerIcosahedronMesh) outerIcosahedronMesh.visible = isTesseract;
  if (vertexPoints) vertexPoints.visible = isTesseract;
  if (shieldMesh) shieldMesh.visible = isShield;
  if (vortexAccretionMesh) vortexAccretionMesh.visible = isVortex;

  // Sound feedback
  if (isAudioEnabled()) {
    playBlip(540, 'triangle', 0.08);
  }

  // Update HUD active pill button
  document.querySelectorAll('.hero-3d-mode-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
}

/**
 * Trigger high-energy EMP Shockwave pulse on 3D Core
 */
export function triggerEMPShockwave() {
  shockwaveProgress = 0.0;
  shockwaveIntensity = 1.0;

  // Sound blast feedback
  if (isAudioEnabled()) {
    playBlast();
  }

  // Brief rotational surge
  drag.velocityX += (Math.random() - 0.5) * 0.12;
  drag.velocityY += 0.14;

  // Visual shockwave ring reset
  if (shockwaveRing) {
    shockwaveRing.scale.set(1, 1, 1);
    shockwaveRing.material.opacity = 0.95;
    shockwaveRing.rotation.x = Math.random() * Math.PI;
    shockwaveRing.rotation.y = Math.random() * Math.PI;
  }
}

/**
 * Main WebGL Animation Loop
 */
function animate() {
  animationFrameId = requestAnimationFrame(animate);

  if (isAnimationPaused) return;

  const elapsedTime = clock.getElapsedTime();
  const delta = clock.getDelta();

  // 1. DAMPED MOUSE PARALLAX TILT
  mouse.x += (mouse.targetX - mouse.x) * 0.055;
  mouse.y += (mouse.targetY - mouse.y) * 0.055;

  // 2. DRAG / INERTIAL ROTATION
  if (!drag.isDragging) {
    drag.velocityX *= 0.92;
    drag.velocityY *= 0.92;
    drag.targetRotationY += drag.velocityX;
    drag.targetRotationX += drag.velocityY;

    // Idle organic spin
    const idleSpeed = isHovered ? 0.016 : 0.007;
    drag.targetRotationY += idleSpeed;
  }
  drag.rotationX += (drag.targetRotationX - drag.rotationX) * 0.1;
  drag.rotationY += (drag.targetRotationY - drag.rotationY) * 0.1;

  // 3. APPLY ROTATIONS TO MASTER GROUP
  if (masterGroup) {
    masterGroup.rotation.y = drag.rotationY + mouse.x * 0.45;
    masterGroup.rotation.x = drag.rotationX - mouse.y * 0.35;

    // Subtle breathing float elevation
    masterGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.12;

    // Scroll parallax depth effect
    const scrollFactor = Math.min(scrollY / 600, 1.0);
    masterGroup.position.z = -scrollFactor * 0.8;
  }

  // 4. ROTATE INNER & ALTERNATE MESHES
  if (innerMetallicCore && innerMetallicCore.visible) {
    innerMetallicCore.rotation.x -= 0.008;
    innerMetallicCore.rotation.z += 0.006;
  }

  if (shieldMesh && shieldMesh.visible) {
    shieldMesh.rotation.y = Math.sin(elapsedTime * 1.5) * 0.25;
    shieldMesh.rotation.z = Math.cos(elapsedTime * 1.2) * 0.1;
  }

  if (vortexAccretionMesh && vortexAccretionMesh.visible) {
    vortexAccretionMesh.rotation.z += 0.035;
  }

  // 5. INNER SINGULARITY PULSE
  if (innerSingularityCore) {
    const pulseScale = 1.0 + Math.sin(elapsedTime * 3.6) * 0.09 + shockwaveIntensity * 0.3;
    innerSingularityCore.scale.set(pulseScale, pulseScale, pulseScale);
    innerSingularityCore.rotation.y += 0.02;
    if (pointLightCore) {
      pointLightCore.intensity = 2.4 + Math.sin(elapsedTime * 3.6) * 0.8 + shockwaveIntensity * 4.0;
    }
  }

  // 6. GIMBAL RINGS INDEPENDENT ROTATIONS
  if (ring1) {
    ring1.rotation.x += 0.009;
    ring1.rotation.y += 0.005;
  }
  if (ring2) {
    ring2.rotation.y -= 0.012;
    ring2.rotation.z += 0.007;
  }
  if (ring3) {
    ring3.rotation.z += 0.006;
    ring3.rotation.x -= 0.008;
  }

  // 7. QUANTUM PARTICLE SWARM DYNAMICS
  if (quantumParticles && particlePositions) {
    const count = particlePositions.length / 3;
    const speedMult = isHovered ? 1.8 : 1.0;

    for (let i = 0; i < count; i++) {
      const v = particleVelocities[i];
      v.theta += 0.006 * v.orbitSpeed * speedMult;

      // Radial perturbation
      const r = v.radius + Math.sin(elapsedTime * 2.2 + v.pulsePhase) * 0.18 + shockwaveIntensity * 1.4;

      particlePositions[i * 3] = r * Math.sin(v.phi) * Math.cos(v.theta);
      particlePositions[i * 3 + 1] = r * Math.sin(v.phi) * Math.sin(v.theta);
      particlePositions[i * 3 + 2] = r * Math.cos(v.phi);
    }
    quantumParticles.geometry.attributes.position.needsUpdate = true;
  }

  // 8. EMP SHOCKWAVE EXPANSION & FADE
  if (shockwaveRing && shockwaveProgress < 1.0) {
    shockwaveProgress += delta * 1.8;
    shockwaveIntensity = Math.max(0, 1.0 - shockwaveProgress);

    const s = 1.0 + shockwaveProgress * 7.5;
    shockwaveRing.scale.set(s, s, s);
    shockwaveRing.material.opacity = (1.0 - shockwaveProgress) * 0.85;

    if (shockwaveProgress >= 1.0) {
      shockwaveRing.material.opacity = 0;
      shockwaveIntensity = 0;
    }
  }

  // 9. RENDER SCENE
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

/**
 * Set up user interactions, parallax, drag, click shockwave, theme & resize listeners
 */
function setupEventListeners() {
  // --- MOUSE PARALLAX TRACKING ---
  boundHandlers.onMouseMove = (e) => {
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    // Normalize coordinates relative to container center (-1 to +1)
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouse.targetX = ((e.clientX - centerX) / (window.innerWidth / 2));
    mouse.targetY = ((e.clientY - centerY) / (window.innerHeight / 2));
  };
  window.addEventListener('mousemove', boundHandlers.onMouseMove, { passive: true });

  // --- HOVER STATE ---
  boundHandlers.onPointerEnter = () => {
    isHovered = true;
  };
  boundHandlers.onPointerLeave = () => {
    isHovered = false;
    mouse.targetX = 0;
    mouse.targetY = 0;
  };
  canvasEl.addEventListener('pointerenter', boundHandlers.onPointerEnter);
  canvasEl.addEventListener('pointerleave', boundHandlers.onPointerLeave);

  // --- DRAG / ORBIT INSPECTION ---
  boundHandlers.onPointerDown = (e) => {
    drag.isDragging = true;
    drag.previousX = e.clientX;
    drag.previousY = e.clientY;
    canvasEl.style.cursor = 'grabbing';
    canvasEl.setPointerCapture(e.pointerId);
  };

  boundHandlers.onPointerMove = (e) => {
    if (!drag.isDragging) return;
    const deltaX = e.clientX - drag.previousX;
    const deltaY = e.clientY - drag.previousY;

    drag.velocityX = deltaX * 0.008;
    drag.velocityY = deltaY * 0.008;

    drag.targetRotationY += drag.velocityX;
    drag.targetRotationX += drag.velocityY;

    drag.previousX = e.clientX;
    drag.previousY = e.clientY;
  };

  boundHandlers.onPointerUp = (e) => {
    if (drag.isDragging) {
      drag.isDragging = false;
      canvasEl.style.cursor = 'grab';
      try {
        canvasEl.releasePointerCapture(e.pointerId);
      } catch (err) {
        // Safe catch if pointer was not captured
      }
    }
  };

  canvasEl.addEventListener('pointerdown', boundHandlers.onPointerDown);
  canvasEl.addEventListener('pointermove', boundHandlers.onPointerMove);
  canvasEl.addEventListener('pointerup', boundHandlers.onPointerUp);
  canvasEl.addEventListener('pointercancel', boundHandlers.onPointerUp);

  // --- INTERACTIVE CLICK: QUANTUM EMP SHOCKWAVE ---
  boundHandlers.onClick = (e) => {
    // Only trigger shockwave on intentional click, not drag release
    if (Math.abs(drag.velocityX) < 0.02 && Math.abs(drag.velocityY) < 0.02) {
      triggerEMPShockwave();
    }
  };
  canvasEl.addEventListener('click', boundHandlers.onClick);

  // --- SCROLL PARALLAX ---
  boundHandlers.onScroll = () => {
    scrollY = window.scrollY;
  };
  window.addEventListener('scroll', boundHandlers.onScroll, { passive: true });

  // --- RESIZE HANDLING (Smooth responsive adaptivity) ---
  boundHandlers.handleResize = () => {
    if (!containerEl || !renderer || !camera) return;
    const width = containerEl.clientWidth || 320;
    const height = containerEl.clientHeight || 320;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  window.addEventListener('resize', boundHandlers.handleResize);
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(boundHandlers.handleResize);
    resizeObserver.observe(containerEl);
  }

  // --- THEME CHANGE LISTENER ---
  boundHandlers.onThemeChange = (e) => {
    const newTheme = e.detail?.theme || getCurrentThemeName();
    applyPaletteColors(newTheme);
  };
  window.addEventListener('themechange', boundHandlers.onThemeChange);

  // --- ACCESSIBILITY / MOTION TOGGLE LISTENER ---
  const toggleMotionBtn = document.getElementById('toggle-motion');
  if (toggleMotionBtn) {
    boundHandlers.onToggleMotion = () => {
      isAnimationPaused = !isAnimationPaused;
    };
    toggleMotionBtn.addEventListener('click', boundHandlers.onToggleMotion);
  }

  // Respect system reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduced.matches) {
    isAnimationPaused = true;
  }
}

/**
 * Toggle between 3D Interactive Stage and 2D Classified Dossier Photo
 * @param {'3d'|'photo'} view
 */
export function toggleHeroVisualView(view = '3d') {
  const stageEl = document.getElementById('hero-3d-stage');
  const photoFrame = document.getElementById('doom-avatar-frame');
  const toggleBtns = document.querySelectorAll('.hero-view-toggle-btn');

  if (view === '3d') {
    if (stageEl) stageEl.classList.remove('hidden');
    if (photoFrame) photoFrame.classList.add('hidden');
    // Ensure proper canvas size after becoming visible
    if (boundHandlers.handleResize) {
      setTimeout(boundHandlers.handleResize, 50);
    }
  } else {
    if (stageEl) stageEl.classList.add('hidden');
    if (photoFrame) photoFrame.classList.remove('hidden');
  }

  toggleBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  if (isAudioEnabled()) {
    playShield();
  }
}

/**
 * Dispose all Three.js geometries, materials, renderers and detach event listeners
 * Prevents WebGL context memory leaks.
 */
export function disposeThreeScene() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Detach event listeners
  if (boundHandlers.onMouseMove) window.removeEventListener('mousemove', boundHandlers.onMouseMove);
  if (boundHandlers.onScroll) window.removeEventListener('scroll', boundHandlers.onScroll);
  if (boundHandlers.handleResize) window.removeEventListener('resize', boundHandlers.handleResize);
  if (boundHandlers.onThemeChange) window.removeEventListener('themechange', boundHandlers.onThemeChange);

  if (canvasEl) {
    if (boundHandlers.onPointerEnter) canvasEl.removeEventListener('pointerenter', boundHandlers.onPointerEnter);
    if (boundHandlers.onPointerLeave) canvasEl.removeEventListener('pointerleave', boundHandlers.onPointerLeave);
    if (boundHandlers.onPointerDown) canvasEl.removeEventListener('pointerdown', boundHandlers.onPointerDown);
    if (boundHandlers.onPointerMove) canvasEl.removeEventListener('pointermove', boundHandlers.onPointerMove);
    if (boundHandlers.onPointerUp) canvasEl.removeEventListener('pointerup', boundHandlers.onPointerUp);
    if (boundHandlers.onClick) canvasEl.removeEventListener('click', boundHandlers.onClick);
  }

  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  // Deep recursive scene disposal
  if (scene) {
    scene.traverse((obj) => {
      if (obj.geometry) {
        obj.geometry.dispose();
      }
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((mat) => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }

  if (renderer) {
    renderer.dispose();
    renderer = null;
  }

  scene = null;
  camera = null;
  masterGroup = null;
  console.info('🛡️ [ThreeScene] 3D scene cleanly disposed.');
}
