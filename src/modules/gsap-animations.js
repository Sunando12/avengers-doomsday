/**
 * GSAP Animations Module — Avengers: Doomsday Command Center
 * ─────────────────────────────────────────────────────────────
 * Cinematic, high-impact tactical animations powered by GSAP + ScrollTrigger.
 * Features:
 * - Tactile magnetic button hover & click physics
 * - Doctor Doom holographic reactor breathing core & orbital rings
 * - Hero cards 3D tilt & stat bar fill animations
 * - Tab HUD transition effects
 * - Battle Arena screen shake & fighter clash animations
 * - Smooth digital counter rollups & countdown digit tick pulses
 * - Modal & toast springy physics
 *
 * NOTE: Designed to guarantee 100% element visibility at all times.
 * No element is left with opacity: 0.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Motion Preference Check ─────────────────────────────────
const MOTION_QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionAllowed = !MOTION_QUERY.matches;

MOTION_QUERY.addEventListener('change', (e) => {
  motionAllowed = !e.matches;
});

function shouldAnimate() {
  return motionAllowed;
}

// ═══════════════════════════════════════════════════════════════
// 1. TACTILE BUTTON INTERACTIONS (Hover & Click Physics)
// ═══════════════════════════════════════════════════════════════
export function initButtonInteractions() {
  if (!shouldAnimate()) return;

  const buttonSelectors = '.btn, .nav-btn, .tab-btn, .filter-btn, .btn-sim-run, .btn-mission-action, .search-filter-pill, .chip-btn, .timeframe-btn';
  
  // Delegate mouseenter, mouseleave, mousedown, mouseup for all buttons
  document.addEventListener('mouseover', (e) => {
    const btn = e.target.closest(buttonSelectors);
    if (!btn || btn.__gsapHoverInit) return;
    btn.__gsapHoverInit = true;

    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, {
        scale: 1.035,
        y: -2,
        duration: 0.22,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        scale: 1,
        y: 0,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    btn.addEventListener('mousedown', () => {
      gsap.to(btn, {
        scale: 0.94,
        y: 0,
        duration: 0.08,
        ease: 'power1.in',
        overwrite: 'auto'
      });
    });

    btn.addEventListener('mouseup', () => {
      gsap.to(btn, {
        scale: 1.035,
        y: -2,
        duration: 0.28,
        ease: 'back.out(2)',
        overwrite: 'auto'
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// 2. HERO BANNER & DOOM REACTOR CORE ANIMATIONS
// ═══════════════════════════════════════════════════════════════
export function animateHeroBanner() {
  if (!shouldAnimate()) return;

  const banner = document.getElementById('hero-banner');
  if (!banner) return;

  // Make sure buttons and content are 100% visible immediately
  const buttons = banner.querySelectorAll('.hero-actions .btn');
  buttons.forEach(b => {
    b.style.opacity = '1';
    b.style.visibility = 'visible';
  });

  // Snappy entrance pop for banner items
  const badge = banner.querySelector('.hero-badge');
  const title = banner.querySelector('.hero-title');
  const desc = banner.querySelector('.hero-desc');

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (badge) {
    tl.fromTo(badge, { y: -15, opacity: 0.6 }, { y: 0, opacity: 1, duration: 0.4 }, 0);
  }
  if (title) {
    tl.fromTo(title, { y: 20, opacity: 0.7 }, { y: 0, opacity: 1, duration: 0.5 }, 0.08);
  }
  if (desc) {
    tl.fromTo(desc, { y: 15, opacity: 0.8 }, { y: 0, opacity: 1, duration: 0.4 }, 0.16);
  }
  if (buttons.length) {
    tl.fromTo(buttons, 
      { scale: 0.92, y: 10 }, 
      { scale: 1, y: 0, stagger: 0.08, duration: 0.45, ease: 'back.out(1.5)', clearProps: 'transform' },
      0.22
    );
  }

  // Doctor Doom Avatar Dramatic Reveal
  const doomFrame = document.getElementById('doom-avatar-frame');
  if (doomFrame) {
    gsap.fromTo(doomFrame,
      { scale: 0.85, opacity: 0.8 },
      { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.4)', clearProps: 'transform' }
    );
  }
}

/** Continuous Doctor Doom breathing aura and rotating orbital rings */
export function initGsapDoomParallax() {
  if (!shouldAnimate()) return;

  const frame = document.getElementById('doom-avatar-frame');
  if (!frame) return;

  // Continuous subtle floating / breathing
  gsap.to(frame, {
    y: -8,
    duration: 3,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  });

  // Orbital rings continuous multi-speed rotation
  const rings = frame.querySelectorAll('.orbital-ring');
  rings.forEach((ring, i) => {
    const direction = i % 2 === 0 ? 360 : -360;
    const duration = 10 + i * 5;
    gsap.to(ring, {
      rotation: direction,
      duration: duration,
      ease: 'none',
      repeat: -1,
    });
  });

  // Interactive 3D tilt tracking cursor on hero banner
  const banner = document.getElementById('hero-banner');
  if (banner) {
    const xTo = gsap.quickTo(frame, 'rotationY', { duration: 0.4, ease: 'power2.out' });
    const yTo = gsap.quickTo(frame, 'rotationX', { duration: 0.4, ease: 'power2.out' });

    banner.addEventListener('mousemove', (e) => {
      const rect = banner.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      xTo(x * 16);
      yTo(-y * 16);
    });

    banner.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// 3. STAT CARDS & DIGITAL COUNTER ROLLUP
// ═══════════════════════════════════════════════════════════════
export function animateStatCards() {
  if (!shouldAnimate()) return;

  const cards = document.querySelectorAll('.stat-card');
  if (!cards.length) return;

  gsap.fromTo(cards,
    { y: 20, opacity: 0.8, scale: 0.96 },
    {
      y: 0, opacity: 1, scale: 1,
      stagger: 0.08,
      duration: 0.45,
      ease: 'power2.out',
      clearProps: 'transform,opacity'
    }
  );
}

/** Animate a numerical counter rolling up from 0 to target */
export function animateCounter(elementId, endValue, duration = 1.0) {
  const el = document.getElementById(elementId);
  if (!el) return;

  if (!shouldAnimate()) {
    el.textContent = endValue;
    return;
  }

  const current = parseInt(el.textContent) || 0;
  const obj = { val: current };

  gsap.to(obj, {
    val: endValue,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      el.textContent = Math.round(obj.val);
    },
    onComplete: () => {
      el.textContent = endValue;
      // Brief pop upon reaching target
      gsap.fromTo(el,
        { scale: 1.25, color: 'var(--accent-secondary)' },
        { scale: 1, color: '', duration: 0.25, ease: 'back.out(2)' }
      );
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// 4. HERO CARDS (Interactive 3D Tilt & Stagger Entrance)
// ═══════════════════════════════════════════════════════════════
export function animateHeroCards() {
  if (!shouldAnimate()) return;

  const cards = document.querySelectorAll('.hero-card');
  if (!cards.length) return;

  // Staggered pop-in
  gsap.fromTo(cards,
    { y: 25, opacity: 0.7, scale: 0.95 },
    {
      y: 0, opacity: 1, scale: 1,
      stagger: 0.04,
      duration: 0.4,
      ease: 'power2.out',
      clearProps: 'opacity'
    }
  );

  // Animate stat bars filling with energy
  document.querySelectorAll('.hero-card .stat-bar-fill').forEach(bar => {
    const targetWidth = bar.style.width;
    gsap.fromTo(bar,
      { width: '0%' },
      { width: targetWidth, duration: 0.7, delay: 0.15, ease: 'power2.out' }
    );
  });

  // Attach magnetic 3D tilt to each hero card
  cards.forEach(card => {
    if (card.__gsapTiltInit) return;
    card.__gsapTiltInit = true;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotationY: x * 14,
        rotationX: -y * 14,
        y: -6,
        scale: 1.02,
        duration: 0.25,
        ease: 'power1.out',
        transformPerspective: 800,
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px var(--accent-glow)'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationY: 0,
        rotationX: 0,
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
        clearProps: 'transform,boxShadow'
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// 5. TAB SWITCHING — Futuristic HUD Transition
// ═══════════════════════════════════════════════════════════════
export function animateTabSwitch(panelId) {
  if (!shouldAnimate()) return;

  const panel = document.getElementById(panelId);
  if (!panel) return;

  // Snappy sci-fi panel entrance
  gsap.fromTo(panel,
    { opacity: 0.7, y: 15 },
    { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out', clearProps: 'all' }
  );

  // Stagger child cards inside the newly active panel
  const cards = panel.querySelectorAll('.glass-card, .kanban-column, .kpi-card');
  if (cards.length) {
    gsap.fromTo(cards,
      { y: 20, opacity: 0.8 },
      { y: 0, opacity: 1, stagger: 0.04, duration: 0.35, ease: 'power2.out', clearProps: 'all' }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// 6. COUNTDOWN CARD & TICK PULSE
// ═══════════════════════════════════════════════════════════════
export function animateCountdownCard() {
  if (!shouldAnimate()) return;

  const card = document.getElementById('countdown-card');
  if (!card) return;

  gsap.fromTo(card,
    { y: 25, opacity: 0.8 },
    { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', clearProps: 'all' }
  );

  const timeBoxes = card.querySelectorAll('.time-box');
  if (timeBoxes.length) {
    gsap.fromTo(timeBoxes,
      { scale: 0.9, y: 12 },
      { scale: 1, y: 0, stagger: 0.08, duration: 0.45, ease: 'back.out(1.5)', clearProps: 'transform' }
    );
  }
}

/** Micro-pulse on digital tick */
export function flipDigit(elementId, newValue) {
  const el = document.getElementById(elementId);
  if (!el || el.textContent === newValue) return;

  el.textContent = newValue;

  if (!shouldAnimate()) return;

  gsap.fromTo(el,
    { scale: 1.15, color: 'var(--accent-secondary)' },
    { scale: 1, color: '', duration: 0.28, ease: 'power2.out', clearProps: 'scale,color' }
  );
}

// ═══════════════════════════════════════════════════════════════
// 7. KANBAN CARDS DROP-IN
// ═══════════════════════════════════════════════════════════════
export function animateKanbanCards() {
  if (!shouldAnimate()) return;

  const cards = document.querySelectorAll('.kanban-card');
  if (!cards.length) return;

  gsap.fromTo(cards,
    { y: 20, opacity: 0.7, scale: 0.97 },
    { y: 0, opacity: 1, scale: 1, stagger: 0.03, duration: 0.35, ease: 'power2.out', clearProps: 'all' }
  );
}

// ═══════════════════════════════════════════════════════════════
// 8. KPI CARDS & PROGRESS BARS
// ═══════════════════════════════════════════════════════════════
export function animateKPICards() {
  if (!shouldAnimate()) return;

  const kpiCards = document.querySelectorAll('.kpi-card');
  if (!kpiCards.length) return;

  gsap.fromTo(kpiCards,
    { y: 20, opacity: 0.8 },
    { y: 0, opacity: 1, stagger: 0.07, duration: 0.4, ease: 'power2.out', clearProps: 'all' }
  );

  // Fill KPI progress tracks
  document.querySelectorAll('.kpi-bar-fill').forEach(bar => {
    const targetWidth = bar.style.width;
    gsap.fromTo(bar,
      { width: '0%' },
      { width: targetWidth, duration: 1.0, ease: 'power2.out' }
    );
  });
}

// ═══════════════════════════════════════════════════════════════
// 9. ANALYTICS CHARTS CASCADE
// ═══════════════════════════════════════════════════════════════
export function animateAnalyticsCharts() {
  if (!shouldAnimate()) return;

  const chartCards = document.querySelectorAll('.analytics-grid .glass-card');
  if (!chartCards.length) return;

  gsap.fromTo(chartCards,
    { y: 30, opacity: 0.8 },
    { y: 0, opacity: 1, stagger: 0.06, duration: 0.45, ease: 'power2.out', clearProps: 'all' }
  );
}

// ═══════════════════════════════════════════════════════════════
// 10. INCURSION PANEL ENTRANCE
// ═══════════════════════════════════════════════════════════════
export function animateIncursionPanel() {
  if (!shouldAnimate()) return;

  const visualizer = document.querySelector('.incursion-visualizer-card');
  const zones = document.querySelector('.incursion-zones-card');

  if (visualizer) {
    gsap.fromTo(visualizer,
      { x: -30, opacity: 0.8 },
      { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out', clearProps: 'all' }
    );
  }
  if (zones) {
    gsap.fromTo(zones,
      { x: 30, opacity: 0.8 },
      { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out', delay: 0.08, clearProps: 'all' }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// 11. BATTLE ARENA — SCREEN SHAKE & FIGHTER CLASH
// ═══════════════════════════════════════════════════════════════
export function animateArenaEntrance() {
  if (!shouldAnimate()) return;

  const vsBadge = document.querySelector('.arena-vs-badge');
  if (vsBadge) {
    gsap.fromTo(vsBadge,
      { scale: 0.2, rotation: -180 },
      { scale: 1, rotation: 0, duration: 0.55, ease: 'back.out(2)', clearProps: 'all' }
    );
  }

  const fighters = document.querySelectorAll('.arena-fighter-card');
  if (fighters.length >= 2) {
    gsap.fromTo(fighters[0],
      { x: -50, opacity: 0.8 },
      { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out', clearProps: 'all' }
    );
    gsap.fromTo(fighters[1],
      { x: 50, opacity: 0.8 },
      { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out', clearProps: 'all' }
    );
  }
}

/** Shockwave + screen shake when combat simulation starts */
export function animateBattleImpact() {
  if (!shouldAnimate()) return;

  const container = document.querySelector('.arena-container');
  if (!container) return;

  // Screen shake
  const tl = gsap.timeline();
  tl.to(container, { x: -8, y: 3, duration: 0.05, ease: 'power1.inOut' })
    .to(container, { x: 8, y: -4, duration: 0.05, ease: 'power1.inOut' })
    .to(container, { x: -5, y: 2, duration: 0.05, ease: 'power1.inOut' })
    .to(container, { x: 5, y: -2, duration: 0.05, ease: 'power1.inOut' })
    .to(container, { x: 0, y: 0, duration: 0.05, ease: 'power1.out' });

  // Flashing combat energy ring
  gsap.fromTo(container,
    { boxShadow: '0 0 50px rgba(239, 68, 68, 0.7)' },
    { boxShadow: '0 0 0px transparent', duration: 0.6, ease: 'power2.out', clearProps: 'boxShadow' }
  );

  // Clash animation between fighters
  const fighters = document.querySelectorAll('.arena-fighter-card');
  if (fighters.length >= 2) {
    gsap.to(fighters[0], { x: 25, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.inOut' });
    gsap.to(fighters[1], { x: -25, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.inOut' });
  }
}

// ═══════════════════════════════════════════════════════════════
// 12. SEARCH DROPDOWN & MODALS
// ═══════════════════════════════════════════════════════════════
export function animateSearchOpen(dropdown) {
  if (!shouldAnimate() || !dropdown) return;

  gsap.fromTo(dropdown,
    { y: -12, opacity: 0, scale: 0.98 },
    { y: 0, opacity: 1, scale: 1, duration: 0.22, ease: 'back.out(1.4)', clearProps: 'all' }
  );
}

export function animateModalOpen() {
  if (!shouldAnimate()) return;

  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  if (!overlay || !content) return;

  gsap.fromTo(overlay,
    { opacity: 0 },
    { opacity: 1, duration: 0.2, ease: 'power2.out' }
  );

  gsap.fromTo(content,
    { y: 30, scale: 0.92, opacity: 0 },
    { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.3)', clearProps: 'transform' }
  );
}

export function animateModalClose(onComplete) {
  if (!shouldAnimate()) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  if (!overlay || !content) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  gsap.to(content, {
    y: 20,
    scale: 0.94,
    opacity: 0,
    duration: 0.2,
    ease: 'power2.in'
  });

  gsap.to(overlay, {
    opacity: 0,
    duration: 0.22,
    ease: 'power2.in',
    onComplete
  });
}

// ═══════════════════════════════════════════════════════════════
// 13. TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
export function animateToastIn(toastEl) {
  if (!shouldAnimate() || !toastEl) return;

  gsap.fromTo(toastEl,
    { x: 60, scale: 0.9, opacity: 0 },
    { x: 0, scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.4)', clearProps: 'transform' }
  );
}

export function animateToastOut(toastEl, onComplete) {
  if (!shouldAnimate()) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  gsap.to(toastEl, {
    x: 80,
    opacity: 0,
    duration: 0.25,
    ease: 'power2.in',
    onComplete
  });
}

// ═══════════════════════════════════════════════════════════════
// 14. ANOMALY STREAM NEW ROW
// ═══════════════════════════════════════════════════════════════
export function animateNewAnomalyRow() {
  if (!shouldAnimate()) return;

  const feed = document.getElementById('analytics-anomaly-feed');
  if (!feed) return;

  const firstRow = feed.querySelector('.anomaly-log-row:first-child');
  if (firstRow) {
    gsap.fromTo(firstRow,
      { x: -20, opacity: 0.2 },
      { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out', clearProps: 'all' }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// 15. MULTIVERSE SIMULATION RESULTS
// ═══════════════════════════════════════════════════════════════
export function animateSimResults() {
  if (!shouldAnimate()) return;

  const cards = document.querySelectorAll('.sim-stat-card');
  if (cards.length) {
    gsap.fromTo(cards,
      { scale: 0.9, y: 15 },
      { scale: 1, y: 0, stagger: 0.1, duration: 0.45, ease: 'back.out(1.5)', clearProps: 'all' }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// MASTER INITIALIZER
// ═══════════════════════════════════════════════════════════════
export function initAllAnimations() {
  // Ensure all interactive button listeners are bound
  initButtonInteractions();

  // Run banner & ambient animations
  animateHeroBanner();
  animateStatCards();
  animateCountdownCard();
  initGsapDoomParallax();
}

export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}
