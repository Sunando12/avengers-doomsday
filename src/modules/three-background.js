/**
 * ============================================================================
 * AVENGERS: DOOMSDAY — THREE.JS 3D MULTIVERSAL BACKGROUND ENGINE
 * ============================================================================
 * High-performance 3D WebGL background effects engine built with Three.js.
 *
 * Features:
 *  - 3D Undulating Spacetime Incursion Grid (Warped mathematical quantum plane)
 *  - Floating Polyhedral Multiverse Monoliths & Shards (Icosahedrons, Octahedrons, Gimbal Rings)
 *  - 3D Quantum Particle Swarm & Dynamic Proximity Constellation Web (LineSegments)
 *  - Dimensional Incursion Halo anchored in 3D space behind the Hero section
 *  - Interactive mouse parallax & cursor gravitational repel/wave in 3D space
 *  - Scroll-linked camera fly-through depth parallax
 *  - Theme-adaptive color palettes (Doomsday, Infinity, Multiverse, Stark, Asgard)
 *  - Strict DPR capping (Math.min(window.devicePixelRatio, 2)) for locked 60-120fps performance
 *  - Complete non-blocking layout: pointer-events: none on canvas, zero UI obstruction
 *  - Full resource disposal on teardown (geometries, materials, textures, listeners)
 */

import * as THREE from 'three';

// --- Theme Color Palettes for 3D Background Lighting & Materials ---
const BG_PALETTES = {
  doomsday: {
    primary: 0x10b981,   // Latverian Emerald
    secondary: 0x34d399, // Bright Mint Glow
    tertiary: 0x065f46,  // Deep Forest Green
    grid: 0x10b981,      // Emerald Grid Wireframe
    shards: 0x059669,    // Floating Shard Core
    particles: 0x6ee7b7, // Quantum Star Nodes
    lines: 0x10b981,     // Constellation Filaments
    ambient: 0x03140c
  },
  infinity: {
    primary: 0xa855f7,   // Power Stone Purple
    secondary: 0xf59e0b, // Soul Stone Gold
    tertiary: 0x6b21a8,  // Deep Void Violet
    grid: 0xa855f7,      // Purple Grid
    shards: 0x7c3aed,    // Cosmic Shards
    particles: 0xc084fc, // Nebula Dust
    lines: 0xa855f7,
    ambient: 0x0e051c
  },
  multiverse: {
    primary: 0xec4899,   // Scarlet Hex Pink
    secondary: 0xef4444, // Reality Stone Red
    tertiary: 0x9d174d,  // Dark Crimson
    grid: 0xec4899,      // Reality Warp Grid
    shards: 0xdb2777,    // Chaos Shards
    particles: 0xf472b6, // Scarlet Nodes
    lines: 0xec4899,
    ambient: 0x17050f
  },
  stark: {
    primary: 0x06b6d4,   // Arc Reactor Cyan
    secondary: 0xeab308, // Hotrod Gold
    tertiary: 0x0e7490,  // Repulsor Blue
    grid: 0x06b6d4,      // Stark HUD Grid
    shards: 0x0284c7,    // Aerospace Titanium Shards
    particles: 0x67e8f9, // Arc Blue Particles
    lines: 0x06b6d4,
    ambient: 0x04131c
  },
  asgard: {
    primary: 0xeab308,   // Asgardian Royal Gold
    secondary: 0xf97316, // Bifrost Amber
    tertiary: 0xa16207,  // Valhalla Bronze
    grid: 0xeab308,      // Golden Bifrost Grid
    shards: 0xca8a04,    // Uru Shards
    particles: 0xfde047, // Golden Sparks
    lines: 0xeab308,
    ambient: 0x191203
  }
};

let scene, camera, renderer;
let canvasEl;
let animationFrameId = null;
let isAnimationPaused = false;
let clock = new THREE.Clock();

// 3D Scene Components
let spacetimeGridMesh, spacetimeGridOriginalPositions;
let floatingShards = [];
let particlesMesh, particlePositions, particleVelocities;
let linesMesh, linesPositions, linesColors;
let heroHaloGroup, haloRing1, haloRing2, haloRing3;
let pointLightPrimary, pointLightSecondary, ambientLight, dirLight;

// Interaction & Camera Parallax State
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
let scrollY = 0;
let targetCameraY = 0;
let targetCameraZ = 16;
let isReducedMotion = false;

// Max connections and distance for constellation web
const MAX_PARTICLES = 160;
const MAX_CONNECTIONS = 280;
const CONNECTION_DISTANCE = 7.5;

const boundHandlers = {};

function getCurrentThemeName() {
  return document.documentElement.getAttribute('data-theme') || 'doomsday';
}

/**
 * Initialize the Three.js 3D Background Engine
 * @param {string} canvasSelector - CSS selector for target canvas element (#particle-canvas)
 */
export function initThreeBackground(canvasSelector = '#particle-canvas') {
  canvasEl = document.querySelector(canvasSelector);
  if (!canvasEl) {
    console.warn('[ThreeBackground] Canvas element not found:', canvasSelector);
    return;
  }

  // Prevent multiple instances
  if (renderer) {
    disposeThreeBackground();
  }

  // 1. SCENE SETUP
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06110b, 0.016);

  // 2. CAMERA SETUP
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 200);
  camera.position.set(0, 0, 16);

  // 3. RENDERER SETUP (Strict DPR cap: Math.min(window.devicePixelRatio, 2))
  renderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  // 4. LIGHTING SETUP
  setupLighting();

  // 5. BUILD 3D OBJECTS
  buildSpacetimeGrid();
  buildFloatingShards();
  buildQuantumConstellation();
  buildHeroSectionHalo();

  // 6. APPLY INITIAL THEME
  applyBackgroundPalette(getCurrentThemeName());

  // 7. EVENT LISTENERS
  setupEventListeners();

  // 8. START ANIMATION LOOP
  clock.start();
  animate();

  console.info('🌌 [ThreeBackground] Avengers: Doomsday 3D WebGL Background Engine active.');
}

/**
 * Configure 3-point scene lighting
 */
function setupLighting() {
  const theme = getCurrentThemeName();
  const pal = BG_PALETTES[theme] || BG_PALETTES.doomsday;

  ambientLight = new THREE.AmbientLight(pal.ambient, 1.6);
  scene.add(ambientLight);

  dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
  dirLight.position.set(10, 20, 15);
  scene.add(dirLight);

  pointLightPrimary = new THREE.PointLight(pal.primary, 4.0, 45, 1.2);
  pointLightPrimary.position.set(8, 4, -8);
  scene.add(pointLightPrimary);

  pointLightSecondary = new THREE.PointLight(pal.secondary, 2.8, 35, 1.2);
  pointLightSecondary.position.set(-10, -6, -10);
  scene.add(pointLightSecondary);
}

/**
 * 1. 3D Spacetime Incursion Grid (Warped Mathematical Horizon Plane)
 */
function buildSpacetimeGrid() {
  const gridWidth = 140;
  const gridHeight = 140;
  const segments = 56;

  const planeGeo = new THREE.PlaneGeometry(gridWidth, gridHeight, segments, segments);
  // Rotate to lie horizontally receding in perspective
  planeGeo.rotateX(-Math.PI / 2.25);
  planeGeo.translate(0, -9.5, -16);

  spacetimeGridOriginalPositions = planeGeo.attributes.position.array.slice();

  const theme = getCurrentThemeName();
  const pal = BG_PALETTES[theme] || BG_PALETTES.doomsday;

  const planeMat = new THREE.MeshBasicMaterial({
    color: pal.grid,
    wireframe: true,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending
  });

  spacetimeGridMesh = new THREE.Mesh(planeGeo, planeMat);
  scene.add(spacetimeGridMesh);
}

/**
 * 2. Floating 3D Multiverse Shards & Sacred Geometry Monoliths
 */
function buildFloatingShards() {
  floatingShards = [];
  const theme = getCurrentThemeName();
  const pal = BG_PALETTES[theme] || BG_PALETTES.doomsday;

  const shardMaterials = [
    new THREE.MeshBasicMaterial({
      color: pal.primary,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    }),
    new THREE.MeshStandardMaterial({
      color: pal.shards,
      roughness: 0.25,
      metalness: 0.85,
      flatShading: true,
      emissive: pal.tertiary,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.65
    })
  ];

  // 14 distinct polyhedral floating objects placed throughout the depth volume
  const shardConfigs = [
    { type: 'icosahedron', r: 1.8, x: -14, y: 7, z: -15, speed: 0.007 },
    { type: 'octahedron', r: 1.4, x: -18, y: -4, z: -20, speed: 0.009 },
    { type: 'dodecahedron', r: 1.6, x: -9, y: -7, z: -12, speed: 0.006 },
    { type: 'ring', r: 2.2, x: -22, y: 3, z: -28, speed: 0.008 },
    { type: 'icosahedron', r: 2.2, x: 16, y: 9, z: -18, speed: 0.007 },
    { type: 'octahedron', r: 1.5, x: 20, y: -5, z: -22, speed: 0.010 },
    { type: 'dodecahedron', r: 1.3, x: 12, y: -8, z: -14, speed: 0.008 },
    { type: 'ring', r: 2.6, x: 22, y: 4, z: -25, speed: 0.006 },
    { type: 'tetrahedron', r: 1.1, x: -6, y: 11, z: -16, speed: 0.011 },
    { type: 'tetrahedron', r: 1.2, x: 6, y: 12, z: -17, speed: 0.009 },
    { type: 'octahedron', r: 0.9, x: -2, y: -10, z: -10, speed: 0.012 },
    { type: 'icosahedron', r: 1.0, x: 3, y: -11, z: -11, speed: 0.010 },
    { type: 'dodecahedron', r: 1.5, x: -25, y: -12, z: -32, speed: 0.005 },
    { type: 'ring', r: 3.0, x: 26, y: -10, z: -30, speed: 0.006 }
  ];

  shardConfigs.forEach((cfg, i) => {
    let geo;
    if (cfg.type === 'icosahedron') geo = new THREE.IcosahedronGeometry(cfg.r, 0);
    else if (cfg.type === 'octahedron') geo = new THREE.OctahedronGeometry(cfg.r, 0);
    else if (cfg.type === 'dodecahedron') geo = new THREE.DodecahedronGeometry(cfg.r, 0);
    else if (cfg.type === 'tetrahedron') geo = new THREE.TetrahedronGeometry(cfg.r, 0);
    else geo = new THREE.TorusGeometry(cfg.r, 0.04, 12, 48);

    const mat = i % 2 === 0 ? shardMaterials[0] : shardMaterials[1];
    const mesh = new THREE.Mesh(geo, mat.clone());
    mesh.position.set(cfg.x, cfg.y, cfg.z);

    scene.add(mesh);
    floatingShards.push({
      mesh,
      initialPos: { x: cfg.x, y: cfg.y, z: cfg.z },
      speed: cfg.speed,
      rotAxisX: Math.random() - 0.5,
      rotAxisY: Math.random() - 0.5,
      rotAxisZ: Math.random() - 0.5,
      bobPhase: Math.random() * Math.PI * 2
    });
  });
}

/**
 * 3. 3D Quantum Particle Swarm & Dynamic Proximity Constellation Web
 */
function buildQuantumConstellation() {
  const theme = getCurrentThemeName();
  const pal = BG_PALETTES[theme] || BG_PALETTES.doomsday;

  // Star nodes
  const particleGeo = new THREE.BufferGeometry();
  particlePositions = new Float32Array(MAX_PARTICLES * 3);
  particleVelocities = [];

  for (let i = 0; i < MAX_PARTICLES; i++) {
    // Distribute across a wide 3D frustum box
    const x = (Math.random() - 0.5) * 55;
    const y = (Math.random() - 0.5) * 36;
    const z = (Math.random() - 0.5) * 35 - 5;

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    particleVelocities.push({
      vx: (Math.random() - 0.5) * 0.025,
      vy: (Math.random() - 0.5) * 0.025,
      vz: (Math.random() - 0.5) * 0.015,
      pulsePhase: Math.random() * Math.PI * 2
    });
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: pal.particles,
    size: 0.12,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });
  particlesMesh = new THREE.Points(particleGeo, particleMat);
  scene.add(particlesMesh);

  // Proximity Lines (Constellation filaments)
  const linesGeo = new THREE.BufferGeometry();
  linesPositions = new Float32Array(MAX_CONNECTIONS * 2 * 3);
  linesColors = new Float32Array(MAX_CONNECTIONS * 2 * 3);

  linesGeo.setAttribute('position', new THREE.BufferAttribute(linesPositions, 3));
  linesGeo.setAttribute('color', new THREE.BufferAttribute(linesColors, 3));

  const linesMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending
  });

  linesMesh = new THREE.LineSegments(linesGeo, linesMat);
  scene.add(linesMesh);
}

/**
 * 4. Dimensional Incursion Halo (Positioned in 3D space behind the Hero Section)
 */
function buildHeroSectionHalo() {
  heroHaloGroup = new THREE.Group();
  // Anchor in background behind the hero banner right quadrant
  heroHaloGroup.position.set(7.5, 3.2, -13);
  scene.add(heroHaloGroup);

  const theme = getCurrentThemeName();
  const pal = BG_PALETTES[theme] || BG_PALETTES.doomsday;

  // Concentric holographic rings
  haloRing1 = new THREE.Mesh(
    new THREE.TorusGeometry(3.6, 0.03, 16, 90),
    new THREE.MeshBasicMaterial({ color: pal.primary, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending })
  );
  heroHaloGroup.add(haloRing1);

  haloRing2 = new THREE.Mesh(
    new THREE.TorusGeometry(4.3, 0.02, 16, 90),
    new THREE.MeshBasicMaterial({ color: pal.secondary, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending })
  );
  heroHaloGroup.add(haloRing2);

  haloRing3 = new THREE.Mesh(
    new THREE.TorusGeometry(5.0, 0.015, 16, 90),
    new THREE.MeshBasicMaterial({ color: pal.primary, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending })
  );
  heroHaloGroup.add(haloRing3);
}

/**
 * Apply theme palette colors across all background objects
 * @param {string} themeName
 */
export function updateBackgroundTheme(themeName) {
  applyBackgroundPalette(themeName);
}

function applyBackgroundPalette(themeName) {
  const pal = BG_PALETTES[themeName] || BG_PALETTES.doomsday;
  const prim = new THREE.Color(pal.primary);
  const sec = new THREE.Color(pal.secondary);
  const grid = new THREE.Color(pal.grid);
  const part = new THREE.Color(pal.particles);
  const amb = new THREE.Color(pal.ambient);

  if (scene && scene.fog) {
    scene.fog.color.copy(amb);
  }
  if (ambientLight) ambientLight.color.copy(amb);
  if (pointLightPrimary) pointLightPrimary.color.copy(prim);
  if (pointLightSecondary) pointLightSecondary.color.copy(sec);

  if (spacetimeGridMesh) {
    spacetimeGridMesh.material.color.copy(grid);
  }
  if (particlesMesh) {
    particlesMesh.material.color.copy(part);
  }

  floatingShards.forEach((s, idx) => {
    if (s.mesh && s.mesh.material) {
      if (idx % 2 === 0) {
        s.mesh.material.color.copy(prim);
      } else {
        s.mesh.material.color.copy(new THREE.Color(pal.shards));
        s.mesh.material.emissive.copy(new THREE.Color(pal.tertiary));
      }
    }
  });

  if (haloRing1) haloRing1.material.color.copy(prim);
  if (haloRing2) haloRing2.material.color.copy(sec);
  if (haloRing3) haloRing3.material.color.copy(prim);
}

/**
 * Main WebGL Animation Loop
 */
function animate() {
  animationFrameId = requestAnimationFrame(animate);

  if (isAnimationPaused) return;

  const elapsedTime = clock.getElapsedTime();

  // 1. DAMPED MOUSE INTERPOLATION
  mouse.x += (mouse.targetX - mouse.x) * 0.045;
  mouse.y += (mouse.targetY - mouse.y) * 0.045;

  // 2. SCROLL FLY-THROUGH CAMERA PARALLAX
  targetCameraY = -scrollY * 0.007;
  targetCameraZ = 16 - Math.min(scrollY * 0.012, 5.0);

  camera.position.x = mouse.x * 2.2;
  camera.position.y += (targetCameraY + mouse.y * 1.5 - camera.position.y) * 0.06;
  camera.position.z += (targetCameraZ - camera.position.z) * 0.06;
  camera.rotation.x = -mouse.y * 0.06;
  camera.rotation.y = -mouse.x * 0.08;

  // 3. UNDULATING SPACETIME INVERSION GRID WAVES
  if (spacetimeGridMesh && spacetimeGridOriginalPositions) {
    const pos = spacetimeGridMesh.geometry.attributes.position.array;
    const orig = spacetimeGridOriginalPositions;
    const len = pos.length;
    const waveSpeed = isReducedMotion ? 0.3 : 1.2;

    for (let i = 0; i < len; i += 3) {
      const ox = orig[i];
      const oy = orig[i + 1];

      // Undulating sine-wave surface
      const wave = Math.sin(ox * 0.12 + elapsedTime * waveSpeed) * Math.cos(oy * 0.12 + elapsedTime * 0.8) * 1.5;

      // Cursor ripple influence on grid
      const dx = ox - mouse.x * 30;
      const dy = oy - (-9.5 + mouse.y * 20);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const mouseWave = Math.sin(dist * 0.3 - elapsedTime * 3.0) * Math.max(0, 1 - dist / 22) * 1.8;

      pos[i + 2] = orig[i + 2] + wave + mouseWave;
    }
    spacetimeGridMesh.geometry.attributes.position.needsUpdate = true;
  }

  // 4. FLOATING POLYHEDRAL SHARDS ROTATION & BOBBING
  floatingShards.forEach((s) => {
    const m = s.mesh;
    const motionMult = isReducedMotion ? 0.2 : 1.0;

    m.rotation.x += s.speed * s.rotAxisX * motionMult;
    m.rotation.y += s.speed * s.rotAxisY * motionMult;
    m.rotation.z += s.speed * s.rotAxisZ * motionMult;

    // Organic floating levitation
    m.position.y = s.initialPos.y + Math.sin(elapsedTime * 1.4 + s.bobPhase) * 0.45;

    // 3D Parallax shift relative to mouse
    const depthRatio = (m.position.z / -35); // Shards closer to camera shift faster
    m.position.x = s.initialPos.x + mouse.x * (1.5 + depthRatio * 2.2);
  });

  // 5. QUANTUM PARTICLES & DYNAMIC CONSTELLATION FILAMENTS
  if (particlesMesh && linesMesh && particlePositions) {
    const pCount = MAX_PARTICLES;
    const motionMult = isReducedMotion ? 0.2 : 1.0;
    const theme = getCurrentThemeName();
    const pal = BG_PALETTES[theme] || BG_PALETTES.doomsday;
    const primColor = new THREE.Color(pal.lines);

    // Update particle positions
    for (let i = 0; i < pCount; i++) {
      const v = particleVelocities[i];
      particlePositions[i * 3] += v.vx * motionMult;
      particlePositions[i * 3 + 1] += v.vy * motionMult;
      particlePositions[i * 3 + 2] += v.vz * motionMult;

      // Wrap boundaries
      if (particlePositions[i * 3] > 28) particlePositions[i * 3] = -28;
      if (particlePositions[i * 3] < -28) particlePositions[i * 3] = 28;
      if (particlePositions[i * 3 + 1] > 20) particlePositions[i * 3 + 1] = -20;
      if (particlePositions[i * 3 + 1] < -20) particlePositions[i * 3 + 1] = 20;
      if (particlePositions[i * 3 + 2] > 10) particlePositions[i * 3 + 2] = -25;
      if (particlePositions[i * 3 + 2] < -25) particlePositions[i * 3 + 2] = 10;
    }
    particlesMesh.geometry.attributes.position.needsUpdate = true;

    // Build dynamic proximity lines
    let lineIdx = 0;
    const maxConn = MAX_CONNECTIONS;

    for (let i = 0; i < pCount && lineIdx < maxConn; i++) {
      const xi = particlePositions[i * 3];
      const yi = particlePositions[i * 3 + 1];
      const zi = particlePositions[i * 3 + 2];

      for (let j = i + 1; j < pCount && lineIdx < maxConn; j++) {
        const xj = particlePositions[j * 3];
        const yj = particlePositions[j * 3 + 1];
        const zj = particlePositions[j * 3 + 2];

        const dx = xi - xj;
        const dy = yi - yj;
        const dz = zi - zj;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < CONNECTION_DISTANCE) {
          const alpha = 1.0 - (dist / CONNECTION_DISTANCE);

          // Point A
          linesPositions[lineIdx * 6] = xi;
          linesPositions[lineIdx * 6 + 1] = yi;
          linesPositions[lineIdx * 6 + 2] = zi;

          linesColors[lineIdx * 6] = primColor.r * alpha;
          linesColors[lineIdx * 6 + 1] = primColor.g * alpha;
          linesColors[lineIdx * 6 + 2] = primColor.b * alpha;

          // Point B
          linesPositions[lineIdx * 6 + 3] = xj;
          linesPositions[lineIdx * 6 + 4] = yj;
          linesPositions[lineIdx * 6 + 5] = zj;

          linesColors[lineIdx * 6 + 3] = primColor.r * alpha;
          linesColors[lineIdx * 6 + 4] = primColor.g * alpha;
          linesColors[lineIdx * 6 + 5] = primColor.b * alpha;

          lineIdx++;
        }
      }
    }

    // Zero out unused connections
    for (let k = lineIdx; k < maxConn; k++) {
      linesPositions[k * 6] = 0; linesPositions[k * 6 + 1] = 0; linesPositions[k * 6 + 2] = 0;
      linesPositions[k * 6 + 3] = 0; linesPositions[k * 6 + 4] = 0; linesPositions[k * 6 + 5] = 0;
      linesColors[k * 6] = 0; linesColors[k * 6 + 1] = 0; linesColors[k * 6 + 2] = 0;
      linesColors[k * 6 + 3] = 0; linesColors[k * 6 + 4] = 0; linesColors[k * 6 + 5] = 0;
    }

    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.color.needsUpdate = true;
  }

  // 6. HERO SECTION DIMENSIONAL HALO ROTATION
  if (heroHaloGroup) {
    if (haloRing1) { haloRing1.rotation.x += 0.006; haloRing1.rotation.y += 0.009; }
    if (haloRing2) { haloRing2.rotation.y -= 0.008; haloRing2.rotation.z += 0.005; }
    if (haloRing3) { haloRing3.rotation.z += 0.005; haloRing3.rotation.x -= 0.007; }
    heroHaloGroup.position.x = 7.5 + mouse.x * 1.8;
    heroHaloGroup.position.y = 3.2 + mouse.y * 1.2;
  }

  // 7. RENDER FRAME
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

/**
 * Configure DOM, resize, mouse, scroll, and theme change listeners
 */
function setupEventListeners() {
  // Global mousemove parallax (non-blocking, passive)
  boundHandlers.onMouseMove = (e) => {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  };
  window.addEventListener('mousemove', boundHandlers.onMouseMove, { passive: true });

  // Scroll parallax tracking
  boundHandlers.onScroll = () => {
    scrollY = window.scrollY;
  };
  window.addEventListener('scroll', boundHandlers.onScroll, { passive: true });

  // Smooth window resize handling
  boundHandlers.onResize = () => {
    if (!renderer || !camera) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
  window.addEventListener('resize', boundHandlers.onResize);

  // Theme change synchronization
  boundHandlers.onThemeChange = (e) => {
    const newTheme = e.detail?.theme || getCurrentThemeName();
    applyBackgroundPalette(newTheme);
  };
  window.addEventListener('themechange', boundHandlers.onThemeChange);

  // Motion toggle button hook (#toggle-motion)
  const toggleBtn = document.getElementById('toggle-motion');
  if (toggleBtn) {
    boundHandlers.onToggleMotion = () => {
      isAnimationPaused = !isAnimationPaused;
    };
    toggleBtn.addEventListener('click', boundHandlers.onToggleMotion);
  }

  // Check system prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduced.matches) {
    isReducedMotion = true;
  }
}

/**
 * Clean disposal of Three.js background resources
 */
export function disposeThreeBackground() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (boundHandlers.onMouseMove) window.removeEventListener('mousemove', boundHandlers.onMouseMove);
  if (boundHandlers.onScroll) window.removeEventListener('scroll', boundHandlers.onScroll);
  if (boundHandlers.onResize) window.removeEventListener('resize', boundHandlers.onResize);
  if (boundHandlers.onThemeChange) window.removeEventListener('themechange', boundHandlers.onThemeChange);

  if (scene) {
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
  }

  if (renderer) {
    renderer.dispose();
    renderer = null;
  }

  scene = null;
  camera = null;
  floatingShards = [];
  console.info('🌌 [ThreeBackground] Background engine cleanly disposed.');
}
