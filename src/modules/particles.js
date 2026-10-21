/**
 * Particle Canvas Background Module
 * Interactive floating nodes with cursor parallax/repel.
 * Supports pause/resume and respects prefers-reduced-motion.
 */

let canvas, ctx;
let particles = [];
let mouse = { x: -1000, y: -1000 };
let animationId = null;
let isPaused = false;

const CONFIG = {
  particleCount: 80,
  maxSpeed: 0.4,
  connectionDistance: 150,
  mouseRepelRadius: 120,
  mouseRepelForce: 0.03,
  particleMinSize: 1,
  particleMaxSize: 2.5,
};

class Particle {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * CONFIG.maxSpeed;
    this.vy = (Math.random() - 0.5) * CONFIG.maxSpeed;
    this.size = CONFIG.particleMinSize + Math.random() * (CONFIG.particleMaxSize - CONFIG.particleMinSize);
    this.opacity = 0.3 + Math.random() * 0.5;
  }

  update(w, h) {
    // Mouse repel
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < CONFIG.mouseRepelRadius && dist > 0) {
      const force = (CONFIG.mouseRepelRadius - dist) / CONFIG.mouseRepelRadius * CONFIG.mouseRepelForce;
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;
    }

    // Dampen velocity
    this.vx *= 0.999;
    this.vy *= 0.999;

    this.x += this.vx;
    this.y += this.vy;

    // Wrap edges
    if (this.x < 0) this.x = w;
    if (this.x > w) this.x = 0;
    if (this.y < 0) this.y = h;
    if (this.y > h) this.y = 0;
  }

  draw(ctx, color) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = this.opacity;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    particle: style.getPropertyValue('--particle-color').trim() || 'rgba(230,57,70,0.6)',
    line: style.getPropertyValue('--particle-line-color').trim() || 'rgba(230,57,70,0.15)',
  };
}

function drawConnections(colors) {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONFIG.connectionDistance) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = colors.line;
        ctx.globalAlpha = 1 - dist / CONFIG.connectionDistance;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }
}

function animate() {
  if (isPaused) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const colors = getThemeColors();

  particles.forEach(p => {
    p.update(w, h);
    p.draw(ctx, colors.particle);
  });
  drawConnections(colors);

  animationId = requestAnimationFrame(animate);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

/**
 * Initialize the particle canvas.
 */
export function initParticles() {
  canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resizeCanvas();

  // Check for reduced motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduced.matches) {
    isPaused = true;
    updateMotionButton();
  }

  // Create particles
  particles = [];
  for (let i = 0; i < CONFIG.particleCount; i++) {
    particles.push(new Particle(canvas.width, canvas.height));
  }

  // Mouse tracking (throttled via requestAnimationFrame inherently)
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Resize handling
  window.addEventListener('resize', () => {
    resizeCanvas();
  });

  // Motion toggle button
  const toggleBtn = document.getElementById('toggle-motion');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      updateMotionButton();
      if (!isPaused) animate();
    });
  }

  // Start animation
  if (!isPaused) animate();
}

function updateMotionButton() {
  const playIcon = document.getElementById('motion-icon-play');
  const pauseIcon = document.getElementById('motion-icon-pause');
  if (playIcon && pauseIcon) {
    playIcon.classList.toggle('hidden', !isPaused);
    pauseIcon.classList.toggle('hidden', isPaused);
  }
}
