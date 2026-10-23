/**
 * Avengers: Doomsday — Tactical Boot Loader Module
 * Manages the high-tech, theme-responsive boot sequence,
 * holographic reactor HUD, diagnostic telemetry stream, and smooth transition.
 */

import { playBootHum, playBootChime, playBlip, playDataTick } from './audio.js';

let loaderEl = null;
let progressBarEl = null;
let progressPctEl = null;
let statusTextEl = null;
let terminalLogsEl = null;
let isBooting = false;
let bootInterval = null;
let stepTimeout = null;

const BOOT_LOGS = [
  { text: 'QUANTUM_LINK // Connecting to S.H.I.E.L.D. Sub-Orbital Transceiver...', status: 'OK' },
  { text: 'DECRYPTING // Latverian Multiverse Vector Signatures...', status: 'DECRYPTED' },
  { text: 'SCANNING // Reality Collision Horizons: Earth-838 & Earth-1610...', status: 'CRITICAL' },
  { text: 'THREAT_DETECTION // Doctor Doom Beyonder Siphon at 94.8% Capacity...', status: 'WARNING' },
  { text: 'HERO_TELEMETRY // Calibrating 13 Operative Quantum Bio-Signatures...', status: 'SYNCED' },
  { text: 'TACTICAL_HUD // Initializing Battleworld Real-Time Recon Matrix...', status: 'ONLINE' },
  { text: 'SECURITY_PROTOCOL // Omega Clearance Verified. Welcome, Commander.', status: 'GRANTED' },
];

/**
 * Initialize and start the themed boot loading screen.
 * @param {Object} options
 * @param {Function} options.onComplete - Callback when boot sequence finishes
 */
export function initLoader({ onComplete } = {}) {
  loaderEl = document.getElementById('theme-loader');
  if (!loaderEl) return;

  progressBarEl = document.getElementById('loader-progress-bar');
  progressPctEl = document.getElementById('loader-progress-pct');
  statusTextEl = document.getElementById('loader-status-text');
  terminalLogsEl = document.getElementById('loader-terminal-stream');

  const skipBtn = document.getElementById('loader-skip-btn');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      finishBoot(onComplete);
    });
  }

  // Keyboard shortcut: Space or Enter skips/advances
  const keyHandler = (e) => {
    if (!isBooting) return;
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      finishBoot(onComplete);
    }
  };
  window.addEventListener('keydown', keyHandler);

  startBootSequence(onComplete);
}

/**
 * Start the realistic cinematic boot sequence
 */
function startBootSequence(onComplete) {
  isBooting = true;
  if (!loaderEl) return;

  loaderEl.classList.remove('loader-hidden', 'loader-closing');
  loaderEl.setAttribute('aria-hidden', 'false');
  document.body.classList.add('loading-locked');

  // Trigger audio hum
  playBootHum();

  let progress = 0;
  let logIndex = 0;

  if (terminalLogsEl) {
    terminalLogsEl.innerHTML = '';
  }

  // Add initial log
  addLogEntry(BOOT_LOGS[0]);
  logIndex = 1;

  const totalDuration = 2400; // ~2.4 seconds for cinematic impact
  const intervalTime = 30;
  const increment = 100 / (totalDuration / intervalTime);

  clearInterval(bootInterval);
  bootInterval = setInterval(() => {
    // Non-linear realistic progress easing (pauses slightly at security checks)
    let delta = increment * (0.8 + Math.random() * 0.7);
    if (progress > 38 && progress < 45) delta *= 0.4; // decrypting slowdown
    if (progress > 75 && progress < 82) delta *= 0.5; // biometric sync

    progress = Math.min(100, progress + delta);

    if (progressBarEl) {
      progressBarEl.style.width = `${progress.toFixed(1)}%`;
    }
    if (progressPctEl) {
      progressPctEl.textContent = `${Math.floor(progress)}%`;
    }

    // Step logs based on progress thresholds
    const targetLogIndex = Math.floor((progress / 100) * BOOT_LOGS.length);
    while (logIndex <= targetLogIndex && logIndex < BOOT_LOGS.length) {
      addLogEntry(BOOT_LOGS[logIndex]);
      playDataTick();
      logIndex++;
    }

    // Update status text
    if (statusTextEl) {
      if (progress < 25) {
        statusTextEl.textContent = 'ESTABLISHING SECURE PROTOCOLS...';
      } else if (progress < 55) {
        statusTextEl.textContent = 'INTERCEPTING MULTIVERSAL TELEMETRY...';
      } else if (progress < 85) {
        statusTextEl.textContent = 'CALIBRATING AVENGERS DEFENSE GRID...';
      } else {
        statusTextEl.textContent = 'OMEGA ACCESS GRANTED // READY';
      }
    }

    if (progress >= 100) {
      clearInterval(bootInterval);
      setTimeout(() => {
        finishBoot(onComplete);
      }, 250);
    }
  }, intervalTime);
}

/**
 * Add a styled terminal log line to the diagnostic stream
 */
function addLogEntry(entry) {
  if (!terminalLogsEl || !entry) return;
  const line = document.createElement('div');
  line.className = 'loader-log-line';
  
  const badgeClass = entry.status === 'CRITICAL' ? 'status-critical' :
                     entry.status === 'WARNING' ? 'status-warning' : 'status-ok';

  line.innerHTML = `
    <span class="log-cursor">›</span>
    <span class="log-body">${entry.text}</span>
    <span class="log-status-badge ${badgeClass}">[${entry.status}]</span>
  `;

  terminalLogsEl.appendChild(line);
  terminalLogsEl.scrollTop = terminalLogsEl.scrollHeight;
}

/**
 * Complete the boot sequence with a high-tech holographic reveal
 */
function finishBoot(onComplete) {
  if (!isBooting) return;
  clearInterval(bootInterval);
  clearTimeout(stepTimeout);
  isBooting = false;

  if (progressBarEl) progressBarEl.style.width = '100%';
  if (progressPctEl) progressPctEl.textContent = '100%';
  if (statusTextEl) statusTextEl.textContent = 'COMMAND CENTER ARMED';

  // Play tactical resolution chime
  playBootChime();

  if (loaderEl) {
    loaderEl.classList.add('loader-closing');
    setTimeout(() => {
      loaderEl.classList.add('loader-hidden');
      loaderEl.classList.remove('loader-closing');
      loaderEl.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('loading-locked');
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }, 600);
  } else {
    document.body.classList.remove('loading-locked');
    if (typeof onComplete === 'function') {
      onComplete();
    }
  }
}

/**
 * Replay the boot loading screen (e.g. from System Diagnostics button)
 */
export function replayLoader(onComplete) {
  if (isBooting) return;
  playBlip(540);
  startBootSequence(onComplete);
}

/**
 * Check if the loading screen is currently running
 */
export function isLoaderActive() {
  return isBooting;
}
