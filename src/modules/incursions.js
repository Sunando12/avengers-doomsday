/**
 * Multiverse Incursions Module
 * Visualizes dimensional collision hazards and interactive stabilization minigame.
 */

import { INCURSION_ZONES } from '../data/mock-data.js';
import { playAlert, playSuccess, playShield } from './audio.js';
import { showToast } from './toast.js';

let zones = [...INCURSION_ZONES];
let activeZoneIndex = 0;
let incursionInterval = null;
let canvasAnimId = null;

export function initIncursions() {
  renderIncursionList();
  renderIncursionDetail();
  startIncursionTicker();
  initCollisionCanvas();

  const stabilizeBtn = document.getElementById('btn-stabilize-incursion');
  if (stabilizeBtn) {
    stabilizeBtn.addEventListener('click', handleStabilizeClick);
  }

  const alertBtn = document.getElementById('btn-incursion-siren');
  if (alertBtn) {
    alertBtn.addEventListener('click', () => {
      playAlert();
      showToast('⚠️ RED ALERT: Multiverse collision trajectory confirmed!', 'danger');
    });
  }
}

function startIncursionTicker() {
  if (incursionInterval) clearInterval(incursionInterval);
  incursionInterval = setInterval(() => {
    zones.forEach(z => {
      if (z.timer > 0) z.timer--;
    });
    updateTimersUI();
  }, 1000);
}

function updateTimersUI() {
  zones.forEach((z, i) => {
    const el = document.getElementById(`timer-zone-${i}`);
    if (el) {
      const mins = Math.floor(z.timer / 60);
      const secs = z.timer % 60;
      el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  });

  const detailTimer = document.getElementById('incursion-detail-timer');
  if (detailTimer && zones[activeZoneIndex]) {
    const t = zones[activeZoneIndex].timer;
    const mins = Math.floor(t / 60);
    const secs = t % 60;
    detailTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

function renderIncursionList() {
  const container = document.getElementById('incursions-list');
  if (!container) return;

  container.innerHTML = zones.map((z, idx) => `
    <div class="incursion-card ${idx === activeZoneIndex ? 'active-zone' : ''}" data-index="${idx}">
      <div class="incursion-header">
        <span class="danger-badge ${z.danger > 80 ? 'critical' : 'warning'}">${z.danger}% THREAT</span>
        <span class="incursion-reality">${z.reality}</span>
      </div>
      <h4 class="incursion-name">${z.name}</h4>
      <div class="incursion-meta">
        <span>📍 ${z.sector}</span>
        <span class="incursion-timer-badge">⏳ <strong id="timer-zone-${idx}">--:--</strong></span>
      </div>
      <div class="threat-progress-bar">
        <div class="threat-fill ${z.danger > 80 ? 'critical' : ''}" style="width: ${z.danger}%"></div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.incursion-card').forEach(card => {
    card.addEventListener('click', () => {
      activeZoneIndex = parseInt(card.dataset.index, 10);
      playShield();
      renderIncursionList();
      renderIncursionDetail();
    });
  });

  updateTimersUI();
}

function renderIncursionDetail() {
  const current = zones[activeZoneIndex];
  if (!current) return;

  const titleEl = document.getElementById('incursion-detail-title');
  const threatEl = document.getElementById('incursion-detail-threat');
  const coordEl = document.getElementById('incursion-detail-coords');
  const realityEl = document.getElementById('incursion-detail-reality');
  const meterFill = document.getElementById('incursion-meter-fill');

  if (titleEl) titleEl.textContent = current.name;
  if (threatEl) threatEl.textContent = `${current.danger}%`;
  if (coordEl) coordEl.textContent = current.coordinates;
  if (realityEl) realityEl.textContent = current.reality;
  if (meterFill) meterFill.style.width = `${current.danger}%`;
}

function handleStabilizeClick() {
  const current = zones[activeZoneIndex];
  if (!current) return;

  if (current.danger <= 15) {
    showToast('Reality anchor is already fully stabilized!', 'success');
    return;
  }

  current.danger = Math.max(10, current.danger - 15);
  current.timer += 300; // grant 5 minutes
  playShield();
  playSuccess();
  showToast(`Quantum stabilizers engaged! ${current.reality} threat reduced to ${current.danger}%.`, 'success');

  renderIncursionList();
  renderIncursionDetail();
}

function initCollisionCanvas() {
  const canvas = document.getElementById('incursion-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let angle = 0;
  function draw() {
    canvas.width = canvas.parentElement.clientWidth || 340;
    canvas.height = 240;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const cx1 = w * 0.35 + Math.sin(angle) * 12;
    const cy1 = h * 0.5 + Math.cos(angle * 0.8) * 8;
    const cx2 = w * 0.65 - Math.sin(angle) * 12;
    const cy2 = h * 0.5 - Math.cos(angle * 0.8) * 8;

    // Draw gravitational distortion rings
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.18)';
    ctx.lineWidth = 1.5;
    for (let r = 20; r < 90; r += 20) {
      ctx.beginPath();
      ctx.arc((cx1 + cx2) / 2, (cy1 + cy2) / 2, r + Math.sin(angle * 2) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Connective singularity beam
    const grad = ctx.createLinearGradient(cx1, cy1, cx2, cy2);
    grad.addColorStop(0, 'rgba(52, 211, 153, 0.8)');
    grad.addColorStop(0.5, 'rgba(239, 68, 68, 0.9)');
    grad.addColorStop(1, 'rgba(16, 185, 129, 0.8)');

    ctx.beginPath();
    ctx.moveTo(cx1, cy1);
    ctx.lineTo(cx2, cy2);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3 + Math.sin(angle * 3) * 1.5;
    ctx.stroke();

    // Planet 1 (Earth-616)
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(cx1, cy1, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('EARTH-616', cx1, cy1 + 42);

    // Planet 2 (Alternate Earth)
    const current = zones[activeZoneIndex] || zones[0];
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#f87171';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(cx2, cy2, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.fillText(current.reality, cx2, cy2 + 40);

    angle += 0.025;
    canvasAnimId = requestAnimationFrame(draw);
  }

  if (canvasAnimId) cancelAnimationFrame(canvasAnimId);
  draw();
}
