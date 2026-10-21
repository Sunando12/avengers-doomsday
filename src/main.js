/**
 * Avengers: Doomsday — Main Application Entry Point
 * Wires together all modules, manages state, sound effects, incursion simulator,
 * battle arena, live countdown, and direct Google Calendar synchronization.
 */

import './styles/main.css';
import { initParticles } from './modules/particles.js';
import { initThemes } from './modules/themes.js';
import { initModal, openModal, closeModal } from './modules/modal.js';
import { showToast } from './modules/toast.js';
import { saveData, loadData, STORAGE_KEYS } from './modules/storage.js';
import {
  initCalendar, connectCalendar, disconnectCalendar,
  fetchEvents, createEvent, deleteEvent, isCalendarConnected,
  getCredentials, saveCredentials, clearCredentials,
  getGoogleCalendarUrl, downloadIcs
} from './modules/calendar.js';
import {
  playBlip, playSuccess, playAlert, playBlast, playShield,
  toggleAudio, isAudioEnabled
} from './modules/audio.js';
import { initIncursions } from './modules/incursions.js';
import { initArena, updateArenaHeroes, selectFighter1 } from './modules/arena.js';
import {
  drawThreatGauge, initReadinessChart,
  initMissionTrendChart, initPowerDistributionChart,
  initThreatCategoriesChart, initHeroRadarChart, initPriorityChart,
} from './modules/charts.js';
import { HEROES as DEFAULT_HEROES, MISSIONS as DEFAULT_MISSIONS } from './data/mock-data.js';
import Sortable from 'sortablejs';

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════
let heroes = [];
let missions = [];
let events = [];
let currentFilter = 'all';
let searchQuery = '';
let currentCalendarDate = new Date();
let selectedCalendarDate = null;
let countdownInterval = null;

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Load persisted data and synchronize official character images and power tiers
  const storedHeroes = loadData(STORAGE_KEYS.HEROES, null);
  if (storedHeroes && storedHeroes.length > 0) {
    heroes = storedHeroes.map(sh => {
      const def = DEFAULT_HEROES.find(d => d.id === sh.id);
      if (def) {
        return {
          ...sh,
          name: def.name,
          alias: def.alias,
          emoji: def.emoji,
          image: def.image,
          power: def.power,
          speed: def.speed,
          intel: def.intel,
          role: def.role,
          ultimate: def.ultimate,
          bio: def.bio,
          team: def.team
        };
      }
      return sh;
    });
    // Ensure all canonical characters are present
    DEFAULT_HEROES.forEach(def => {
      if (!heroes.some(h => h.id === def.id)) {
        heroes.push(def);
      }
    });
    saveData(STORAGE_KEYS.HEROES, heroes);
  } else {
    heroes = DEFAULT_HEROES;
    saveData(STORAGE_KEYS.HEROES, heroes);
  }
  missions = loadData(STORAGE_KEYS.MISSIONS, DEFAULT_MISSIONS);

  // Core modules
  initParticles();
  initThemes();
  initModal();

  // Tab navigation
  initTabs();

  // Search
  initSearch();

  // Interactive Incursions & Battle Arena
  initIncursions();
  initArena(heroes);

  // Live Movie Premiere Countdown
  initCountdown();

  // Audio system state
  updateAudioUI();

  // Calendar setup
  initCalendar({
    onConnectionChange: updateCalendarUI,
    onEventsLoaded: (evts) => {
      events = evts;
      renderDashboardEvents();
      renderAgenda();
      renderMiniCalendar();
      updateStats();
    }
  });

  // Button bindings
  bindButtons();
  initDoomParallax();

  // Initial renders
  renderDashboard();
  renderHeroes();
  renderMissions();

  // Render charts after a small delay to ensure DOM is ready
  setTimeout(() => {
    drawThreatGauge(85);
    initReadinessChart();
    initMissionTrendChart(missions);
    initPowerDistributionChart(heroes);
    initThreatCategoriesChart();
    initHeroRadarChart(heroes);
    initPriorityChart(missions);
    renderMiniCalendar();
  }, 100);

  // Welcome toast
  showToast('Welcome to the Doomsday Command Center, Avenger.', 'info');
});

// ═══════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playBlip(680);
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  // Update buttons
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  // Update panels
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tab}`));

  // Lazy-init charts when analytics tab opens
  if (tab === 'analytics') {
    setTimeout(() => {
      initMissionTrendChart(missions);
      initPowerDistributionChart(heroes);
      initThreatCategoriesChart();
      initHeroRadarChart(heroes);
      initPriorityChart(missions);
    }, 50);
  }
}

// ═══════════════════════════════════════════════════════════════
// LIVE DOOMSDAY MOVIE COUNTDOWN (DECEMBER 18, 2026)
// ═══════════════════════════════════════════════════════════════
function initCountdown() {
  // Avengers: Doomsday premiere date: December 18, 2026
  const premiereDate = new Date('2026-12-18T00:00:00Z').getTime();

  function update() {
    const now = Date.now();
    const diff = premiereDate - now;

    if (diff <= 0) {
      const daysEl = document.getElementById('cd-days');
      if (daysEl) daysEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');

    const dEl = document.getElementById('cd-days');
    const hEl = document.getElementById('cd-hours');
    const mEl = document.getElementById('cd-mins');
    const sEl = document.getElementById('cd-secs');

    if (dEl) dEl.textContent = pad(days);
    if (hEl) hEl.textContent = pad(hours);
    if (mEl) mEl.textContent = pad(minutes);
    if (sEl) sEl.textContent = pad(seconds);
  }

  if (countdownInterval) clearInterval(countdownInterval);
  update();
  countdownInterval = setInterval(update, 1000);

  const premiereBtn = document.getElementById('btn-sync-premiere-cal');
  if (premiereBtn) {
    premiereBtn.addEventListener('click', () => {
      playSuccess();
      const premiereUrl = getGoogleCalendarUrl({
        summary: '🎬 Avengers: Doomsday — Global Theatrical Premiere',
        description: 'Marvel Studios Avengers: Doomsday arrives in theaters worldwide! Directed by the Russo Brothers, starring Robert Downey Jr. as Victor Von Doom.',
        startDateTime: '2026-12-18T19:00:00',
        endDateTime: '2026-12-18T22:30:00',
        location: 'IMAX Cinema / Worldwide Theaters',
      });
      window.open(premiereUrl, '_blank');
      showToast('Opening Google Calendar for December 18, 2026 Premiere!', 'success');
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// AUDIO TOGGLE
// ═══════════════════════════════════════════════════════════════
function updateAudioUI() {
  const enabled = isAudioEnabled();
  const icon = document.getElementById('sound-icon');
  const label = document.getElementById('sound-label');
  if (icon) icon.textContent = enabled ? '🔊' : '🔇';
  if (label) label.textContent = enabled ? 'Audio ON' : 'Audio OFF';
}

// ═══════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════
function initSearch() {
  const input = document.getElementById('global-search');
  if (!input) return;

  input.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderHeroes();
    renderDashboardMissions();
  });

  // Keyboard shortcut ⌘K / Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      input.focus();
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// BUTTON BINDINGS
// ═══════════════════════════════════════════════════════════════
function bindButtons() {
  // Sound toggle button
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const active = toggleAudio();
      updateAudioUI();
      if (active) playBlip(880);
      showToast(`Tactical audio ${active ? 'enabled' : 'muted'}.`, 'info');
    });
  }

  // Calendar connect button in top nav
  const calBtn = document.getElementById('calendar-connect-btn');
  if (calBtn) calBtn.addEventListener('click', () => {
    playBlip(720);
    if (isCalendarConnected()) {
      openCalendarSettingsModal();
    } else {
      const creds = getCredentials();
      if (!creds.clientId || !creds.apiKey) {
        openCalendarSettingsModal();
      } else {
        connectCalendar(() => openCalendarSettingsModal());
      }
    }
  });

  // Demo connect
  const demoBtn = document.getElementById('demo-connect-btn');
  if (demoBtn) demoBtn.addEventListener('click', () => {
    playBlip(720);
    const creds = getCredentials();
    if (!creds.clientId || !creds.apiKey) {
      openCalendarSettingsModal();
    } else {
      connectCalendar(() => openCalendarSettingsModal());
    }
  });

  // Settings button in demo banner
  const settingsBtn = document.getElementById('btn-open-cal-settings');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      playBlip(720);
      openCalendarSettingsModal();
    });
  }

  // New Mission from hero banner
  const newMissionBtn = document.getElementById('btn-new-mission');
  if (newMissionBtn) newMissionBtn.addEventListener('click', () => {
    playBlip(600);
    openMissionForm();
  });

  // View Roster button
  const viewRosterBtn = document.getElementById('btn-view-roster');
  if (viewRosterBtn) viewRosterBtn.addEventListener('click', () => {
    playBlip(650);
    switchTab('heroes');
  });

  // Watch Trailer button
  const watchTrailerBtn = document.getElementById('btn-watch-trailer');
  if (watchTrailerBtn) {
    watchTrailerBtn.addEventListener('click', () => {
      playBlip(750);
      switchTab('dashboard');
      const trailerCard = document.getElementById('trailer-hub-card');
      if (trailerCard) {
        trailerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        trailerCard.style.boxShadow = '0 0 35px var(--accent-primary)';
        setTimeout(() => {
          trailerCard.style.boxShadow = '';
        }, 1800);
      }
    });
  }

  // Theater Mode button
  const theaterBtn = document.getElementById('btn-theater-mode');
  if (theaterBtn) {
    theaterBtn.addEventListener('click', () => {
      playBlip(700);
      const isTheater = document.body.classList.toggle('theater-mode-on');
      theaterBtn.textContent = isTheater ? '💡 Lights On' : '💡 Theater Lights';
      showToast(isTheater ? 'Theater lighting engaged.' : 'Standard lighting restored.', 'info');
    });
  }

  // Trailer channel tabs
  document.querySelectorAll('.trailer-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playBlip(680);
      document.querySelectorAll('.trailer-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const vidId = btn.dataset.vid;
      const titleDisplay = btn.dataset.title;
      const iframe = document.getElementById('trailer-iframe');
      const ytLink = document.getElementById('btn-open-youtube');
      const titleEl = document.getElementById('trailer-title-display');

      if (titleEl && titleDisplay) {
        titleEl.textContent = titleDisplay;
      }
      if (iframe && vidId) {
        iframe.src = `https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0&modestbranding=1`;
      }
      if (ytLink && vidId) {
        ytLink.href = `https://www.youtube.com/watch?v=${vidId}`;
      }
      showToast(`Active Stream: ${titleDisplay || 'Avengers Doomsday Feed'}`, 'info');
    });
  });

  // Add quick mission from dashboard
  const quickMissionBtn = document.getElementById('btn-add-quick-mission');
  if (quickMissionBtn) quickMissionBtn.addEventListener('click', () => {
    playBlip(600);
    openMissionForm();
  });

  // Create mission from missions tab
  const createMissionBtn = document.getElementById('btn-create-mission');
  if (createMissionBtn) createMissionBtn.addEventListener('click', () => {
    playBlip(600);
    openMissionForm();
  });

  // Add hero button
  const addHeroBtn = document.getElementById('btn-add-hero');
  if (addHeroBtn) addHeroBtn.addEventListener('click', () => {
    playBlip(600);
    openHeroForm();
  });

  // Go to calendar
  const gotoCalBtn = document.getElementById('btn-goto-calendar');
  if (gotoCalBtn) gotoCalBtn.addEventListener('click', () => {
    playBlip(650);
    switchTab('calendar');
  });

  // Create event
  const createEventBtn = document.getElementById('btn-create-event');
  if (createEventBtn) createEventBtn.addEventListener('click', () => {
    playBlip(600);
    openEventForm();
  });

  // Refresh events
  const refreshBtn = document.getElementById('btn-refresh-events');
  if (refreshBtn) refreshBtn.addEventListener('click', () => {
    playBlip(700);
    fetchEvents();
  });

  // Calendar nav
  const calPrev = document.getElementById('cal-prev');
  const calNext = document.getElementById('cal-next');
  if (calPrev) calPrev.addEventListener('click', () => {
    playBlip(600);
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderMiniCalendar();
  });
  if (calNext) calNext.addEventListener('click', () => {
    playBlip(600);
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderMiniCalendar();
  });

  // Threat slider
  const threatSlider = document.getElementById('threat-slider');
  if (threatSlider) {
    threatSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      drawThreatGauge(val);
      const label = document.getElementById('threat-level-label');
      if (label) {
        if (val >= 80) label.textContent = 'OMEGA';
        else if (val >= 60) label.textContent = 'CRITICAL';
        else if (val >= 40) label.textContent = 'HIGH';
        else if (val >= 20) label.textContent = 'MODERATE';
        else label.textContent = 'LOW';
      }
    });
  }

  // Hero filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playBlip(640);
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderHeroes();
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// GOOGLE CALENDAR SETTINGS MODAL
// ═══════════════════════════════════════════════════════════════
function openCalendarSettingsModal() {
  const creds = getCredentials();
  const isConn = isCalendarConnected();

  const html = `
    <h3 class="form-title">🗓️ Google Calendar Integration</h3>
    <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:var(--space-md);">
      Connect directly to your live Google Calendar or use 1-click web calendar links for instantaneous scheduling.
    </p>

    <div style="background:var(--bg-input);border:1px solid var(--border-secondary);border-radius:var(--radius-md);padding:var(--space-md);margin-bottom:var(--space-md);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-sm);">
        <strong style="font-size:0.9rem;">Connection Status</strong>
        <span class="badge ${isConn ? 'badge-success' : 'badge-warning'}">
          ${isConn ? '● Connected to Google' : '○ Demo / Direct Sync Mode'}
        </span>
      </div>
      <p style="font-size:0.78rem;color:var(--text-secondary);margin:0;">
        ${isConn ? 'Authorized to sync events bidirectionally with Google Calendar.' : 'Running with built-in Marvel mission events. Any event can also be added directly to Google Calendar via 1-click web links.'}
      </p>
    </div>

    <div class="form-group">
      <label class="form-label" for="gcal-client-id">Google OAuth Client ID</label>
      <input class="form-input" id="gcal-client-id" type="text" placeholder="e.g. 123456789-xyz.apps.googleusercontent.com" value="${creds.clientId}" />
      <span style="font-size:0.72rem;color:var(--text-tertiary);">From Google Cloud Console > Credentials > OAuth 2.0 Client ID (Web Application)</span>
    </div>

    <div class="form-group">
      <label class="form-label" for="gcal-api-key">Google Calendar API Key</label>
      <input class="form-input" id="gcal-api-key" type="password" placeholder="AIzaSy..." value="${creds.apiKey}" />
      <span style="font-size:0.72rem;color:var(--text-tertiary);">From Google Cloud Console > Credentials > API Key (Calendar API enabled)</span>
    </div>

    <div class="form-actions" style="margin-top:var(--space-lg);">
      ${isConn ? '<button class="btn btn-danger btn-sm" id="btn-disconnect-cal">Disconnect</button>' : ''}
      <button class="btn btn-ghost" id="form-cancel">Close</button>
      <button class="btn btn-primary" id="btn-save-cal-creds">Save & Connect</button>
    </div>
  `;

  openModal(html);

  document.getElementById('form-cancel')?.addEventListener('click', closeModal);

  document.getElementById('btn-disconnect-cal')?.addEventListener('click', () => {
    disconnectCalendar();
    closeModal();
  });

  document.getElementById('btn-save-cal-creds')?.addEventListener('click', () => {
    const clientId = document.getElementById('gcal-client-id')?.value.trim() || '';
    const apiKey = document.getElementById('gcal-api-key')?.value.trim() || '';

    if (!clientId || !apiKey) {
      showToast('Please provide both Client ID and API Key to connect live, or close to use 1-click web mode.', 'warning');
      return;
    }

    saveCredentials(clientId, apiKey);
    closeModal();
    showToast('Credentials saved! Initiating authentication...', 'info');
    connectCalendar();
  });
}

// ═══════════════════════════════════════════════════════════════
// RENDER: DASHBOARD
// ═══════════════════════════════════════════════════════════════
function renderDashboard() {
  updateStats();
  renderDashboardMissions();
  renderDashboardEvents();
}

function updateStats() {
  const activeHeroes = heroes.filter(h => h.status === 'active').length;
  const activeMissions = missions.filter(m => m.status === 'active' || m.status === 'critical').length;

  const statHeroes = document.getElementById('stat-heroes');
  const statMissions = document.getElementById('stat-missions');
  const statEvents = document.getElementById('stat-events');

  if (statHeroes) statHeroes.textContent = activeHeroes;
  if (statMissions) statMissions.textContent = activeMissions;
  if (statEvents) statEvents.textContent = events.length;
}

function renderDashboardMissions() {
  const container = document.getElementById('dashboard-missions');
  if (!container) return;

  const display = missions
    .filter(m => !searchQuery || m.title.toLowerCase().includes(searchQuery) || m.assignee.toLowerCase().includes(searchQuery))
    .slice(0, 4);

  if (display.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No active missions.</p></div>';
    return;
  }

  container.innerHTML = display.map(m => {
    const gcalUrl = getGoogleCalendarUrl(m);
    return `
      <div class="mission-item" data-id="${m.id}">
        <div class="mission-status-dot status-${m.status}"></div>
        <div class="mission-info">
          <div class="mission-title">${m.title}</div>
          <div class="mission-meta">${m.assignee} &bull; Due ${m.deadline}</div>
        </div>
        <div class="cal-quick-actions">
          <a href="${gcalUrl}" target="_blank" class="btn-cal-link" title="Add to Google Calendar">
            📅 Google Cal
          </a>
        </div>
      </div>
    `;
  }).join('');
}

function renderDashboardEvents() {
  const container = document.getElementById('dashboard-events');
  if (!container) return;

  if (events.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No upcoming events.</p></div>';
    return;
  }

  const display = events.slice(0, 3);
  container.innerHTML = display.map(e => {
    const start = new Date(e.start?.dateTime || e.start?.date);
    const timeStr = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const gcalUrl = getGoogleCalendarUrl(e);

    return `
      <div class="event-mini-item">
        <div class="event-mini-time">
          <strong>${timeStr}</strong>
          <span>${dateStr}</span>
        </div>
        <div class="event-mini-info">
          <div class="event-mini-title">${e.summary}</div>
          <div class="event-mini-desc">${e.description || 'Command operation briefing.'}</div>
        </div>
        <a href="${gcalUrl}" target="_blank" class="btn-cal-link" title="Open in Google Calendar">
          📅 Cal
        </a>
      </div>
    `;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
// RENDER: HEROES
// ═══════════════════════════════════════════════════════════════
function renderHeroes() {
  const grid = document.getElementById('heroes-grid');
  if (!grid) return;

  const filtered = heroes.filter(h => {
    const matchesFilter = currentFilter === 'all' || h.team === currentFilter;
    const matchesSearch = !searchQuery ||
      h.name.toLowerCase().includes(searchQuery) ||
      h.alias.toLowerCase().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><p>No operatives found.</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(h => `
    <div class="hero-card" data-id="${h.id}">
      <div class="hero-card-header">
        <div class="hero-card-photo-wrapper">
          <img
            src="${h.image || '/images/characters/doctor-doom.svg'}"
            alt="${h.name}"
            class="hero-card-photo"
            loading="lazy"
            onerror="this.onerror=null;this.src='/images/characters/doctor-doom.svg';"
          />
          <span class="hero-emoji-sub">${h.emoji}</span>
        </div>
        <div class="hero-card-identity">
          <h4 class="hero-card-name">${h.name}</h4>
          <span class="hero-card-alias">${h.alias}</span>
          <span class="hero-card-role">${h.role || 'Operative'}</span>
        </div>
        <span class="badge badge-${h.team}">${h.team}</span>
      </div>
      ${h.ultimate ? `<div class="hero-ultimate-badge">⚡ <strong>Ultimate:</strong> ${h.ultimate}</div>` : ''}
      <div class="hero-card-stats">
        <div class="stat-bar-group">
          <div class="stat-bar-label"><span>Power</span><span>${h.power}</span></div>
          <div class="stat-bar-track"><div class="stat-bar-fill power" style="width:${h.power}%"></div></div>
        </div>
        <div class="stat-bar-group">
          <div class="stat-bar-label"><span>Speed</span><span>${h.speed || 50}</span></div>
          <div class="stat-bar-track"><div class="stat-bar-fill speed" style="width:${h.speed || 50}%"></div></div>
        </div>
        <div class="stat-bar-group">
          <div class="stat-bar-label"><span>Intel</span><span>${h.intel || 50}</span></div>
          <div class="stat-bar-track"><div class="stat-bar-fill intel" style="width:${h.intel || 50}%"></div></div>
        </div>
      </div>
      <div class="hero-card-actions">
        <button class="btn btn-sm btn-primary-outline" onclick="window.__duelHero('${h.id}')">⚔️ Duel in Arena</button>
        <button class="btn btn-sm btn-ghost" onclick="window.__editHero('${h.id}')">Edit</button>
        <button class="btn btn-sm btn-ghost" onclick="window.__deleteHero('${h.id}')">Remove</button>
      </div>
    </div>
  `).join('');

  attachCardTiltEffects();
}

window.__duelHero = (id) => {
  selectFighter1(id);
  switchTab('arena');
  playBlip(750);
  showToast('Operative summoned to the Battle Arena ring!', 'info');
};

window.__editHero = (id) => {
  const hero = heroes.find(h => h.id === id);
  if (hero) openHeroForm(hero);
};

window.__deleteHero = (id) => {
  heroes = heroes.filter(h => h.id !== id);
  saveData(STORAGE_KEYS.HEROES, heroes);
  renderHeroes();
  updateArenaHeroes(heroes);
  updateStats();
  showToast('Operative removed from roster.', 'info');
};

function attachCardTiltEffects() {
  document.querySelectorAll('.hero-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

function initDoomParallax() {
  const frame = document.getElementById('doom-avatar-frame');
  if (!frame) return;
  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    frame.style.transform = `perspective(900px) rotateY(${dx * 15}deg) rotateX(${-dy * 15}deg)`;
  });
}

// ═══════════════════════════════════════════════════════════════
// RENDER: MISSIONS (KANBAN)
// ═══════════════════════════════════════════════════════════════
function renderMissions() {
  const statuses = ['planning', 'active', 'critical', 'completed'];

  statuses.forEach(status => {
    const container = document.getElementById(`kanban-${status}`);
    const countEl = document.getElementById(`count-${status}`);
    if (!container) return;

    const items = missions.filter(m => m.status === status);
    if (countEl) countEl.textContent = items.length;

    container.innerHTML = items.map(m => {
      const gcalUrl = getGoogleCalendarUrl(m);
      return `
        <div class="kanban-card" data-id="${m.id}">
          <div class="kanban-card-title">${m.title}</div>
          <div class="kanban-card-desc">${m.description}</div>
          <div class="kanban-card-footer">
            <span class="kanban-card-priority priority-${m.priority}">${m.priority}</span>
            <span class="kanban-card-assignee">${m.assignee}</span>
          </div>
          <div class="cal-quick-actions">
            <a href="${gcalUrl}" target="_blank" class="btn-cal-link" title="Add this mission to Google Calendar">
              📅 Add to Google Cal
            </a>
            <button class="btn-cal-ics" onclick="window.__downloadMissionIcs('${m.id}')" title="Download .ics file">
              📥 .ics
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Init Sortable for drag-and-drop
    new Sortable(container, {
      group: 'missions',
      animation: 250,
      ghostClass: 'sortable-ghost',
      onEnd: (evt) => {
        playBlast();
        const cardId = evt.item.dataset.id;
        const newStatus = evt.to.id.replace('kanban-', '');
        const mission = missions.find(m => m.id === cardId);
        if (mission) {
          mission.status = newStatus;
          saveData(STORAGE_KEYS.MISSIONS, missions);
          renderMissions();
          renderDashboardMissions();
          updateStats();
          showToast(`"${mission.title}" moved to ${newStatus}.`, 'success');
        }
      }
    });
  });
}

window.__downloadMissionIcs = (id) => {
  const mission = missions.find(m => m.id === id);
  if (mission) {
    downloadIcs(mission);
  }
};

// ═══════════════════════════════════════════════════════════════
// RENDER: CALENDAR
// ═══════════════════════════════════════════════════════════════
function updateCalendarUI(connected) {
  const dot = document.getElementById('calendar-status-dot');
  const label = document.getElementById('calendar-status-label');
  const banner = document.getElementById('demo-banner');

  if (dot) {
    dot.className = `status-dot ${connected ? 'connected' : 'disconnected'}`;
  }
  if (label) {
    label.textContent = connected ? 'Live Calendar' : 'Connect Calendar';
  }
  if (banner) {
    const bannerText = document.getElementById('calendar-banner-text');
    if (bannerText) {
      bannerText.innerHTML = connected
        ? '<strong>Google Calendar Active:</strong> Live bidirectional event synchronization enabled.'
        : '<strong>Google Calendar Integration:</strong> Sync missions to Google Calendar live or use 1-click instant web sync.';
    }
  }
}

function renderMiniCalendar() {
  const grid = document.getElementById('mini-cal-grid');
  const monthYearEl = document.getElementById('cal-month-year');
  if (!grid) return;

  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const today = new Date();

  if (monthYearEl) {
    monthYearEl.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // Day labels
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let html = dayLabels.map(d => `<div class="mini-cal-day-label">${d}</div>`).join('');

  // Calculate grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="mini-cal-day other-month">${prevMonthDays - i}</div>`;
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const isToday = date.toDateString() === today.toDateString();
    const isSelected = selectedCalendarDate && date.toDateString() === selectedCalendarDate.toDateString();
    const hasEvent = events.some(e => {
      const eDate = new Date(e.start?.dateTime || e.start?.date);
      return eDate.toDateString() === date.toDateString();
    });

    let classes = 'mini-cal-day';
    if (isToday) classes += ' today';
    if (isSelected) classes += ' selected';
    if (hasEvent) classes += ' has-event';

    html += `<div class="${classes}" data-date="${date.toISOString()}" onclick="window.__selectCalDay(this)">${d}</div>`;
  }

  // Next month days
  const totalCells = firstDay + daysInMonth;
  const remaining = 7 - (totalCells % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      html += `<div class="mini-cal-day other-month">${i}</div>`;
    }
  }

  grid.innerHTML = html;
}

window.__selectCalDay = (el) => {
  playBlip(700);
  selectedCalendarDate = new Date(el.dataset.date);
  renderMiniCalendar();
  renderAgenda();
};

function renderAgenda() {
  const container = document.getElementById('agenda-list');
  const title = document.getElementById('agenda-title');
  if (!container) return;

  let filtered = events;
  if (selectedCalendarDate) {
    filtered = events.filter(e => {
      const eDate = new Date(e.start?.dateTime || e.start?.date);
      return eDate.toDateString() === selectedCalendarDate.toDateString();
    });
    if (title) {
      title.textContent = `Agenda — ${selectedCalendarDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  } else {
    if (title) title.textContent = "Today's Agenda";
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No operations scheduled for this date.</p></div>';
    return;
  }

  container.innerHTML = filtered.map(e => {
    const start = new Date(e.start?.dateTime || e.start?.date);
    const timeStr = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const gcalUrl = getGoogleCalendarUrl(e);

    return `
      <div class="agenda-item" data-id="${e.id}">
        <div class="agenda-time">${timeStr}</div>
        <div class="agenda-info">
          <div class="agenda-title">${e.summary}</div>
          <div class="agenda-desc">${e.description || 'Command operations event.'}</div>
          <div class="cal-quick-actions">
            <a href="${gcalUrl}" target="_blank" class="btn-cal-link">
              📅 Open Google Cal
            </a>
            <button class="btn-cal-ics" onclick="window.__downloadEventIcs('${e.id}')">
              📥 .ics
            </button>
            <button class="btn btn-sm btn-ghost" onclick="window.__deleteEvent('${e.id}')" style="margin-left:auto;padding:2px 8px;font-size:0.75rem;">
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.__downloadEventIcs = (id) => {
  const ev = events.find(e => e.id === id);
  if (ev) downloadIcs(ev);
};

window.__deleteEvent = async (id) => {
  await deleteEvent(id);
};

// ═══════════════════════════════════════════════════════════════
// FORMS & MODALS
// ═══════════════════════════════════════════════════════════════
function openMissionForm(existing = null) {
  const isEdit = !!existing;
  const title = isEdit ? 'Edit Mission' : 'Create Mission';

  const html = `
    <h3 class="form-title">${title}</h3>
    <div class="form-group">
      <label class="form-label" for="mission-title">Mission Title</label>
      <input class="form-input" id="mission-title" type="text" placeholder="e.g. Infiltrate Latveria" value="${existing?.title || ''}" required />
      <div class="form-error hidden" id="err-mission-title">Title is required.</div>
    </div>
    <div class="form-group">
      <label class="form-label" for="mission-desc">Description</label>
      <textarea class="form-textarea" id="mission-desc" placeholder="Mission briefing...">${existing?.description || ''}</textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="mission-assignee">Assignee</label>
        <select class="form-select" id="mission-assignee">
          ${heroes.map(h => `<option value="${h.name}" ${existing?.assignee === h.name ? 'selected' : ''}>${h.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="mission-priority">Priority</label>
        <select class="form-select" id="mission-priority">
          <option value="low" ${existing?.priority === 'low' ? 'selected' : ''}>Low</option>
          <option value="medium" ${existing?.priority === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="high" ${existing?.priority === 'high' ? 'selected' : ''}>High</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="mission-status">Status</label>
        <select class="form-select" id="mission-status">
          <option value="planning" ${existing?.status === 'planning' ? 'selected' : ''}>Planning</option>
          <option value="active" ${existing?.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="critical" ${existing?.status === 'critical' ? 'selected' : ''}>Critical</option>
          <option value="completed" ${existing?.status === 'completed' ? 'selected' : ''}>Completed</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="mission-deadline">Deadline</label>
        <input class="form-input" id="mission-deadline" type="date" value="${existing?.deadline || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)}" />
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-ghost" id="form-cancel">Cancel</button>
      <button class="btn btn-primary" id="form-submit">${isEdit ? 'Update' : 'Create'} Mission</button>
    </div>
  `;

  openModal(html);

  document.getElementById('form-cancel')?.addEventListener('click', closeModal);
  document.getElementById('form-submit')?.addEventListener('click', () => {
    const titleInput = document.getElementById('mission-title');
    const titleVal = titleInput?.value.trim();
    const errEl = document.getElementById('err-mission-title');

    if (!titleVal) {
      errEl?.classList.remove('hidden');
      titleInput?.focus();
      return;
    }

    const missionData = {
      id: existing?.id || 'm_' + Date.now(),
      title: titleVal,
      description: document.getElementById('mission-desc')?.value.trim() || '',
      assignee: document.getElementById('mission-assignee')?.value || 'Iron Man',
      priority: document.getElementById('mission-priority')?.value || 'medium',
      status: document.getElementById('mission-status')?.value || 'planning',
      deadline: document.getElementById('mission-deadline')?.value || '',
      created: existing?.created || new Date().toISOString().slice(0, 10),
    };

    if (isEdit) {
      const idx = missions.findIndex(m => m.id === existing.id);
      if (idx >= 0) missions[idx] = missionData;
    } else {
      missions.push(missionData);
    }

    saveData(STORAGE_KEYS.MISSIONS, missions);
    renderMissions();
    renderDashboardMissions();
    updateStats();
    closeModal();
    playSuccess();
    showToast(`Mission "${titleVal}" ${isEdit ? 'updated' : 'created'}!`, 'success');
  });
}

function openHeroForm(existing = null) {
  const isEdit = !!existing;
  const title = isEdit ? 'Edit Hero' : 'Add Hero to Roster';
  const emojis = ['🦸', '🦹', '⚡', '🔥', '🛡️', '🕷️', '🌩️', '🔮', '💚', '⚔️', '🚀', '✨', '🐺', '🦅', '🎯', '👑'];

  const html = `
    <h3 class="form-title">${title}</h3>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="hero-name">Hero Name</label>
        <input class="form-input" id="hero-name" type="text" placeholder="e.g. Iron Man" value="${existing?.name || ''}" required />
        <div class="form-error hidden" id="err-hero-name">Hero name is required.</div>
      </div>
      <div class="form-group">
        <label class="form-label" for="hero-alias">Real Name</label>
        <input class="form-input" id="hero-alias" type="text" placeholder="e.g. Tony Stark" value="${existing?.alias || ''}" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="hero-team">Team</label>
        <select class="form-select" id="hero-team">
          <option value="avenger" ${existing?.team === 'avenger' ? 'selected' : ''}>Avengers</option>
          <option value="guardian" ${existing?.team === 'guardian' ? 'selected' : ''}>Guardians</option>
          <option value="xmen" ${existing?.team === 'xmen' ? 'selected' : ''}>X-Men</option>
          <option value="ally" ${existing?.team === 'ally' ? 'selected' : ''}>Ally</option>
          <option value="villain" ${existing?.team === 'villain' ? 'selected' : ''}>Villain / Anti-Hero</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="hero-emoji">Icon</label>
        <select class="form-select" id="hero-emoji">
          ${emojis.map(e => `<option value="${e}" ${existing?.emoji === e ? 'selected' : ''}>${e}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row" style="grid-template-columns:1fr 1fr 1fr;">
      <div class="form-group">
        <label class="form-label" for="hero-power">Power <span id="power-val">${existing?.power || 50}</span></label>
        <input class="form-input" id="hero-power" type="range" min="1" max="100" value="${existing?.power || 50}" oninput="document.getElementById('power-val').textContent=this.value" />
      </div>
      <div class="form-group">
        <label class="form-label" for="hero-speed">Speed <span id="speed-val">${existing?.speed || 50}</span></label>
        <input class="form-input" id="hero-speed" type="range" min="1" max="100" value="${existing?.speed || 50}" oninput="document.getElementById('speed-val').textContent=this.value" />
      </div>
      <div class="form-group">
        <label class="form-label" for="hero-intel">Intel <span id="intel-val">${existing?.intel || 50}</span></label>
        <input class="form-input" id="hero-intel" type="range" min="1" max="100" value="${existing?.intel || 50}" oninput="document.getElementById('intel-val').textContent=this.value" />
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-ghost" id="form-cancel">Cancel</button>
      <button class="btn btn-primary" id="form-submit">${isEdit ? 'Update' : 'Add'} Hero</button>
    </div>
  `;

  openModal(html);

  document.getElementById('form-cancel')?.addEventListener('click', closeModal);
  document.getElementById('form-submit')?.addEventListener('click', () => {
    const nameInput = document.getElementById('hero-name');
    const nameVal = nameInput?.value.trim();
    const errEl = document.getElementById('err-hero-name');

    if (!nameVal) {
      errEl?.classList.remove('hidden');
      nameInput?.focus();
      return;
    }

    const heroData = {
      id: existing?.id || 'h_' + Date.now(),
      name: nameVal,
      alias: document.getElementById('hero-alias')?.value.trim() || '',
      team: document.getElementById('hero-team')?.value || 'avenger',
      emoji: document.getElementById('hero-emoji')?.value || '🦸',
      power: parseInt(document.getElementById('hero-power')?.value) || 50,
      speed: parseInt(document.getElementById('hero-speed')?.value) || 50,
      intel: parseInt(document.getElementById('hero-intel')?.value) || 50,
      status: 'active',
    };

    if (isEdit) {
      const idx = heroes.findIndex(h => h.id === existing.id);
      if (idx >= 0) heroes[idx] = heroData;
    } else {
      heroes.push(heroData);
    }

    saveData(STORAGE_KEYS.HEROES, heroes);
    renderHeroes();
    updateArenaHeroes(heroes);
    updateStats();
    closeModal();
    playSuccess();
    showToast(`${nameVal} ${isEdit ? 'updated' : 'added to roster'}!`, 'success');
  });
}

function openEventForm() {
  const now = new Date();
  const start = new Date(now.getTime() + 3600000);
  const end = new Date(now.getTime() + 7200000);
  const toLocalISO = (d) => {
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 16);
  };

  const html = `
    <h3 class="form-title">Create Mission Event</h3>
    <p style="color:var(--text-secondary);font-size:0.8rem;margin-bottom:14px;">
      ${isCalendarConnected() ? '✅ Synced directly with your Google Calendar account.' : '⚡ Local & 1-Click Google Calendar web sync supported.'}
    </p>
    <div class="form-group">
      <label class="form-label" for="event-summary">Event Title</label>
      <input class="form-input" id="event-summary" type="text" placeholder="e.g. Team Strategy Meeting" required />
      <div class="form-error hidden" id="err-event-summary">Event title is required.</div>
    </div>
    <div class="form-group">
      <label class="form-label" for="event-desc">Description</label>
      <textarea class="form-textarea" id="event-desc" placeholder="Tactical briefing notes..."></textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="event-start">Start</label>
        <input class="form-input" id="event-start" type="datetime-local" value="${toLocalISO(start)}" />
      </div>
      <div class="form-group">
        <label class="form-label" for="event-end">End</label>
        <input class="form-input" id="event-end" type="datetime-local" value="${toLocalISO(end)}" />
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-ghost" id="form-cancel">Cancel</button>
      <button class="btn btn-primary" id="form-submit">Save Event</button>
    </div>
  `;

  openModal(html);

  document.getElementById('form-cancel')?.addEventListener('click', closeModal);
  document.getElementById('form-submit')?.addEventListener('click', async () => {
    const summaryInput = document.getElementById('event-summary');
    const summary = summaryInput?.value.trim();
    const errEl = document.getElementById('err-event-summary');

    if (!summary) {
      errEl?.classList.remove('hidden');
      summaryInput?.focus();
      return;
    }

    const eventData = {
      summary,
      description: document.getElementById('event-desc')?.value.trim() || '',
      startDateTime: new Date(document.getElementById('event-start')?.value).toISOString(),
      endDateTime: new Date(document.getElementById('event-end')?.value).toISOString(),
    };

    closeModal();
    playSuccess();
    await createEvent(eventData);
  });
}
