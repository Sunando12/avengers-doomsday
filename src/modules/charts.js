/**
 * Avengers: Doomsday — Advanced Tactical Analytics & Charts Engine
 * Manages all Chart.js instances, dynamic theme adaptations,
 * interactive hero radar comparisons, multiverse incursion bubble matrix,
 * resource allocation telemetries, and live data simulations.
 */

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Store chart instances
const charts = {};

// Keep track of current analytics state
let currentHeroesRef = [];
let currentMissionsRef = [];
let selectedHero1Id = 'h1'; // Iron Man default
let selectedHero2Id = 'h3'; // Thor default
let activeTimeframe = 'all';
let isThreatSpikeActive = false;

/**
 * Extract active theme colors from CSS custom properties.
 */
export function getChartThemeTokens() {
  const style = getComputedStyle(document.documentElement);
  const accent = style.getPropertyValue('--accent-primary').trim() || '#10b981';
  const accentSecondary = style.getPropertyValue('--accent-secondary').trim() || '#34d399';
  const textColor = style.getPropertyValue('--text-secondary').trim() || '#a7f3d0';
  const textMuted = style.getPropertyValue('--text-tertiary').trim() || '#6ee7b7';
  const gridColor = style.getPropertyValue('--border-secondary').trim() || 'rgba(16, 185, 129, 0.12)';
  const cardBg = style.getPropertyValue('--bg-card').trim() || 'rgba(10, 26, 18, 0.85)';
  const isDoomsday = document.documentElement.getAttribute('data-theme') === 'doomsday';

  return {
    accent,
    accentSecondary,
    textColor,
    textMuted,
    gridColor,
    cardBg,
    danger: '#ef4444',
    warning: '#f59e0b',
    success: '#22c55e',
    info: '#06b6d4',
    purple: '#a855f7',
    gold: '#eab308',
  };
}

/**
 * Configure shared Chart.js tooltip HUD aesthetics
 */
function getCustomTooltipConfig() {
  const tokens = getChartThemeTokens();
  return {
    backgroundColor: 'rgba(6, 17, 11, 0.92)',
    titleColor: tokens.accent,
    titleFont: { family: 'Orbitron', size: 12, weight: 'bold' },
    bodyColor: '#ecfdf5',
    bodyFont: { family: 'JetBrains Mono', size: 11 },
    borderColor: tokens.accent,
    borderWidth: 1,
    padding: 12,
    cornerRadius: 8,
    displayColors: true,
    boxPadding: 4,
  };
}

/**
 * Draw the dashboard threat gauge.
 * @param {number} value - 0 to 100
 */
export function drawThreatGauge(value = 85) {
  const canvas = document.getElementById('threat-gauge');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const tokens = getChartThemeTokens();

  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h - 10;
  const radius = 90;
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;

  // Background arc
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Value arc
  const valueAngle = startAngle + (value / 100) * Math.PI;
  const gradient = ctx.createLinearGradient(0, cy, w, cy);
  gradient.addColorStop(0, '#22c55e');
  gradient.addColorStop(0.4, '#eab308');
  gradient.addColorStop(0.7, '#f97316');
  gradient.addColorStop(1, '#ef4444');

  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, valueAngle);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Center text
  ctx.fillStyle = tokens.accent;
  ctx.font = `bold 28px 'Orbitron', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${value}%`, cx, cy - 20);
}

/**
 * Initialize the readiness doughnut chart on the dashboard.
 */
export function initReadinessChart(data = { ready: 10, recovering: 2, standby: 1 }) {
  const ctx = document.getElementById('readiness-chart');
  if (!ctx) return;
  const tokens = getChartThemeTokens();

  if (charts.readiness) charts.readiness.destroy();
  charts.readiness = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Combat Ready', 'Recovering', 'Standby'],
      datasets: [{
        data: [data.ready, data.recovering, data.standby],
        backgroundColor: ['#22c55e', '#f59e0b', tokens.accent],
        borderColor: 'rgba(0,0,0,0.5)',
        borderWidth: 2,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: tokens.textColor, font: { family: 'Inter', size: 11 }, padding: 12 }
        },
        tooltip: getCustomTooltipConfig(),
      }
    }
  });
}

/**
 * Initialize / Update Mission Trajectory & Threat Velocity Trend Chart
 */
export function initMissionTrendChart(missions = [], timeframe = 'all') {
  currentMissionsRef = missions;
  activeTimeframe = timeframe;
  const ctx = document.getElementById('mission-trend-chart');
  if (!ctx) return;
  const tokens = getChartThemeTokens();

  // Timeframe-specific data
  let labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6 (Current)'];
  let completedData = [3, 4, 6, 5, 8, 11];
  let incursionData = [7, 6, 8, 10, 13, 16];
  let doomSiphonData = [45, 52, 64, 71, 84, isThreatSpikeActive ? 99 : 92];

  if (timeframe === '7d') {
    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    completedData = [1, 2, 0, 3, 2, 4, 3];
    incursionData = [4, 5, 4, 6, 7, 6, 8];
    doomSiphonData = [80, 82, 85, 88, 89, 91, isThreatSpikeActive ? 99 : 94];
  } else if (timeframe === '30d') {
    labels = ['Day 1-5', 'Day 6-10', 'Day 11-15', 'Day 16-20', 'Day 21-25', 'Day 26-30'];
    completedData = [4, 6, 7, 5, 9, 12];
    incursionData = [8, 9, 11, 10, 14, 15];
    doomSiphonData = [55, 62, 70, 78, 86, isThreatSpikeActive ? 99 : 93];
  } else if (timeframe === 'battleworld') {
    labels = ['Epoch α', 'Epoch β', 'Epoch γ', 'Singularity Pulse', 'Nexus Collapse', 'God Emperor Apex'];
    completedData = [2, 3, 4, 6, 7, 9];
    incursionData = [12, 14, 18, 22, 26, 31];
    doomSiphonData = [60, 72, 81, 89, 95, isThreatSpikeActive ? 100 : 98];
  }

  if (charts.missionTrend) charts.missionTrend.destroy();
  charts.missionTrend = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Completed Missions',
          data: completedData,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.12)',
          fill: true,
          tension: 0.38,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: '#22c55e',
          yAxisID: 'y',
        },
        {
          label: 'Incursion Breaches Mitigated',
          data: incursionData,
          borderColor: tokens.accent,
          backgroundColor: `${tokens.accent}18`,
          fill: true,
          tension: 0.38,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: tokens.accent,
          yAxisID: 'y',
        },
        {
          label: 'Doom Siphon Velocity (%)',
          data: doomSiphonData,
          borderColor: '#ef4444',
          borderDash: [5, 4],
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: '#ef4444',
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: tokens.textColor,
            font: { family: 'Inter', size: 11, weight: '500' },
            usePointStyle: true,
            padding: 16
          }
        },
        tooltip: getCustomTooltipConfig(),
      },
      scales: {
        x: {
          grid: { color: tokens.gridColor },
          ticks: { color: tokens.textColor, font: { family: 'JetBrains Mono', size: 10 } }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Missions / Breaches', color: tokens.textMuted, font: { size: 10 } },
          grid: { color: tokens.gridColor },
          ticks: { color: tokens.textColor, font: { family: 'JetBrains Mono', size: 10 }, beginAtZero: true }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'Doom Energy (%)', color: '#ef4444', font: { size: 10 } },
          grid: { drawOnChartArea: false },
          ticks: { color: '#ef4444', font: { family: 'JetBrains Mono', size: 10 }, min: 0, max: 100 }
        }
      }
    }
  });
}

/**
 * Initialize / Update Dynamic Hero Comparison Radar Chart
 * Allows picking any 2 heroes from the roster dynamically.
 */
export function initHeroRadarChart(heroes = [], h1Id = null, h2Id = null) {
  currentHeroesRef = heroes;
  if (h1Id) selectedHero1Id = h1Id;
  if (h2Id) selectedHero2Id = h2Id;

  const ctx = document.getElementById('hero-radar-chart');
  if (!ctx) return;
  const tokens = getChartThemeTokens();

  const hero1 = heroes.find(h => h.id === selectedHero1Id) || heroes[0] || {
    id: 'h1', name: 'Iron Man', power: 85, speed: 78, intel: 98
  };
  const hero2 = heroes.find(h => h.id === selectedHero2Id) || heroes[2] || {
    id: 'h3', name: 'Thor', power: 92, speed: 82, intel: 72
  };

  // Derive specialized combat attributes
  const getAttributes = (h) => {
    const defense = Math.min(100, Math.round((h.power * 0.4 + h.intel * 0.4 + (h.name.includes('Captain') ? 25 : 10))));
    const stamina = Math.min(100, Math.round((h.power * 0.5 + h.speed * 0.4 + (h.name.includes('Wolverine') ? 25 : 10))));
    const resilience = Math.min(100, Math.round((h.intel * 0.5 + h.power * 0.4 + (h.role?.includes('Sorcer') ? 20 : 10))));
    return [
      h.power || 75,
      h.speed || 70,
      h.intel || 80,
      defense,
      stamina,
      resilience
    ];
  };

  const hero1Stats = getAttributes(hero1);
  const hero2Stats = getAttributes(hero2);

  // Update dynamic comparison badge in HTML if present
  updateHeroComparisonMeta(hero1, hero2, hero1Stats, hero2Stats);

  if (charts.heroRadar) charts.heroRadar.destroy();
  charts.heroRadar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Power Output', 'Combat Speed', 'Tactical Intel', 'Defense Shield', 'Stamina', 'Multiverse Resilience'],
      datasets: [
        {
          label: `${hero1.name} (${hero1.power || 0})`,
          data: hero1Stats,
          borderColor: tokens.accent,
          backgroundColor: `${tokens.accent}25`,
          pointBackgroundColor: tokens.accent,
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
          borderWidth: 2,
        },
        {
          label: `${hero2.name} (${hero2.power || 0})`,
          data: hero2Stats,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.25)',
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
          borderWidth: 2,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: tokens.textColor, font: { family: 'Inter', size: 11 }, usePointStyle: true }
        },
        tooltip: getCustomTooltipConfig(),
      },
      scales: {
        r: {
          grid: { color: tokens.gridColor },
          angleLines: { color: tokens.gridColor },
          pointLabels: { color: tokens.textColor, font: { family: 'Orbitron', size: 9, weight: 'bold' } },
          ticks: { display: false },
          suggestedMin: 30,
          suggestedMax: 100,
        }
      }
    }
  });
}

/**
 * Update UI comparison readouts for the radar chart
 */
function updateHeroComparisonMeta(h1, h2, stats1, stats2) {
  const metaEl = document.getElementById('radar-matchup-info');
  if (!metaEl) return;

  const total1 = stats1.reduce((a, b) => a + b, 0);
  const total2 = stats2.reduce((a, b) => a + b, 0);
  const diff = total1 - total2;
  const leader = diff >= 0 ? h1.name : h2.name;
  const synergy = Math.round(50 + Math.abs(h1.intel - h2.intel) * 0.4 + (h1.power + h2.power) * 0.2);

  metaEl.innerHTML = `
    <div class="radar-meta-item">
      <span class="meta-label">Combat Edge:</span>
      <span class="meta-value">${leader} (${Math.abs(diff)} pts)</span>
    </div>
    <div class="radar-meta-item">
      <span class="meta-label">Tactical Synergy:</span>
      <span class="meta-value" style="color: var(--accent-primary);">${Math.min(99, synergy)}%</span>
    </div>
  `;
}

/**
 * Multiverse Incursion Threat Matrix (Bubble Chart)
 * Plots collision danger, reality instability, and spatial singularity diameter.
 */
export function initIncursionMatrixChart() {
  const ctx = document.getElementById('incursion-matrix-chart');
  if (!ctx) return;
  const tokens = getChartThemeTokens();

  const bubbleData = [
    { x: 88, y: 92, r: 16, label: 'Earth-838 (Titan Horizon)' },
    { x: 64, y: 70, r: 12, label: 'Earth-1610 (Ultimate Rift)' },
    { x: 96, y: 98, r: 24, label: 'Battleworld Singularity' },
    { x: 42, y: 55, r: 10, label: 'Earth-199999 Anchor Reality' },
    { x: 78, y: 84, r: 14, label: 'Latveria Temporal Breach' },
    { x: 50, y: 62, r: 9,  label: 'Quantum Realm Sub-Void' }
  ];

  if (charts.incursionMatrix) charts.incursionMatrix.destroy();
  charts.incursionMatrix = new Chart(ctx, {
    type: 'bubble',
    data: {
      datasets: [{
        label: 'Multiverse Collisions',
        data: bubbleData,
        backgroundColor: bubbleData.map(d => d.y > 85 ? 'rgba(239, 68, 68, 0.65)' :
                                              d.y > 70 ? 'rgba(245, 158, 11, 0.65)' :
                                              'rgba(16, 185, 129, 0.65)'),
        borderColor: bubbleData.map(d => d.y > 85 ? '#ef4444' : d.y > 70 ? '#f59e0b' : tokens.accent),
        borderWidth: 2,
        hoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...getCustomTooltipConfig(),
          callbacks: {
            title: (items) => items[0]?.raw?.label || 'Incursion Zone',
            label: (item) => [
              `Instability Index: ${item.raw.x}%`,
              `Collision Threat: ${item.raw.y}%`,
              `Impact Radius: ${item.raw.r * 100}k Light-Years`
            ]
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Reality Instability (%)', color: tokens.textMuted, font: { size: 10 } },
          grid: { color: tokens.gridColor },
          ticks: { color: tokens.textColor, font: { family: 'JetBrains Mono', size: 10 } },
          min: 30,
          max: 105
        },
        y: {
          title: { display: true, text: 'Collision Threat Score (%)', color: tokens.textMuted, font: { size: 10 } },
          grid: { color: tokens.gridColor },
          ticks: { color: tokens.textColor, font: { family: 'JetBrains Mono', size: 10 } },
          min: 40,
          max: 105
        }
      }
    }
  });
}

/**
 * Initialize Power Distribution Polar Area Chart
 */
export function initPowerDistributionChart(heroes = []) {
  currentHeroesRef = heroes;
  const ctx = document.getElementById('power-distribution-chart');
  if (!ctx) return;
  const tokens = getChartThemeTokens();

  const topHeroes = [...heroes].sort((a, b) => (b.power || 0) - (a.power || 0)).slice(0, 6);
  const labels = topHeroes.map(h => h.name);
  const data = topHeroes.map(h => h.power);
  const colors = [tokens.accent, '#ef4444', '#3b82f6', '#a855f7', '#f59e0b', '#06b6d4'];

  if (charts.powerDist) charts.powerDist.destroy();
  charts.powerDist = new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.map(c => c + '44'),
        borderColor: colors,
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: tokens.textColor, font: { family: 'Inter', size: 10 }, padding: 8 }
        },
        tooltip: getCustomTooltipConfig(),
      },
      scales: {
        r: {
          grid: { color: tokens.gridColor },
          ticks: { display: false },
        }
      }
    }
  });
}

/**
 * Initialize Threat Categories Horizontal Bar Chart
 */
export function initThreatCategoriesChart() {
  const ctx = document.getElementById('threat-categories-chart');
  if (!ctx) return;
  const tokens = getChartThemeTokens();

  const spike = isThreatSpikeActive ? 8 : 0;

  if (charts.threatCat) charts.threatCat.destroy();
  charts.threatCat = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Cosmic Singularity', 'Temporal Paradox', 'Eldritch Sorcery', 'Latverian Nanotech', 'Omega Mutant', 'Beyonder Siphon'],
      datasets: [{
        label: 'Threat Intensity',
        data: [
          Math.min(100, 92 + spike),
          Math.min(100, 85 + spike),
          Math.min(100, 78 + spike),
          Math.min(100, 88 + spike),
          Math.min(100, 68 + spike),
          Math.min(100, 96 + spike)
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(239, 68, 68, 0.9)'
        ],
        borderColor: ['#ef4444', '#f59e0b', '#a855f7', '#3b82f6', '#eab308', '#ef4444'],
        borderWidth: 1.5,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: getCustomTooltipConfig(),
      },
      scales: {
        x: {
          grid: { color: tokens.gridColor },
          ticks: { color: tokens.textColor, font: { family: 'JetBrains Mono', size: 10 } },
          max: 100
        },
        y: {
          grid: { display: false },
          ticks: { color: tokens.textColor, font: { family: 'Inter', size: 11 } }
        }
      }
    }
  });
}

/**
 * Initialize Mission Priority Doughnut Chart
 */
export function initPriorityChart(missions = []) {
  currentMissionsRef = missions;
  const ctx = document.getElementById('priority-chart');
  if (!ctx) return;
  const tokens = getChartThemeTokens();

  const high = missions.filter(m => m.priority === 'high').length || 4;
  const medium = missions.filter(m => m.priority === 'medium').length || 3;
  const low = missions.filter(m => m.priority === 'low').length || 2;

  if (charts.priority) charts.priority.destroy();
  charts.priority = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['High Priority (Critical)', 'Medium Priority', 'Low / Recon'],
      datasets: [{
        data: [high, medium, low],
        backgroundColor: ['#ef4444', '#f59e0b', '#22c55e'],
        borderColor: 'rgba(0,0,0,0.6)',
        borderWidth: 2,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '66%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: tokens.textColor, font: { family: 'Inter', size: 11 }, padding: 12 }
        },
        tooltip: getCustomTooltipConfig(),
      }
    }
  });
}

/**
 * Initialize Strategic Resource Allocation Chart (Stacked Horizontal Bar)
 */
export function initResourceAllocationChart() {
  const ctx = document.getElementById('resource-allocation-chart');
  if (!ctx) return;
  const tokens = getChartThemeTokens();

  if (charts.resourceAlloc) charts.resourceAlloc.destroy();
  charts.resourceAlloc = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Vibranium Defense', 'Stark Nanotech Grid', 'Asgardian Uru Conduit', 'Pym Quantum Cell'],
      datasets: [
        {
          label: 'Deployed Active (MW)',
          data: [82, 94, 76, 88],
          backgroundColor: tokens.accent,
          borderRadius: 4,
        },
        {
          label: 'Emergency Reserve (MW)',
          data: [18, 6, 24, 12],
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          borderRadius: 4,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          position: 'top',
          labels: { color: tokens.textColor, font: { family: 'Inter', size: 11 } }
        },
        tooltip: getCustomTooltipConfig(),
      },
      scales: {
        x: {
          stacked: true,
          grid: { color: tokens.gridColor },
          ticks: { color: tokens.textColor, font: { family: 'JetBrains Mono', size: 10 } },
          max: 100
        },
        y: {
          stacked: true,
          grid: { display: false },
          ticks: { color: tokens.textColor, font: { family: 'Inter', size: 11 } }
        }
      }
    }
  });
}

/**
 * Simulate Doom Energy Spike (Interactive emergency pulse)
 */
export function triggerDoomThreatPulse() {
  isThreatSpikeActive = !isThreatSpikeActive;
  initMissionTrendChart(currentMissionsRef, activeTimeframe);
  initThreatCategoriesChart();
  drawThreatGauge(isThreatSpikeActive ? 99 : 85);
  return isThreatSpikeActive;
}

/**
 * Re-render all charts with current theme palette
 */
export function updateChartsTheme() {
  drawThreatGauge(isThreatSpikeActive ? 99 : 85);
  initReadinessChart();
  initMissionTrendChart(currentMissionsRef, activeTimeframe);
  initHeroRadarChart(currentHeroesRef, selectedHero1Id, selectedHero2Id);
  initIncursionMatrixChart();
  initPowerDistributionChart(currentHeroesRef);
  initThreatCategoriesChart();
  initPriorityChart(currentMissionsRef);
  initResourceAllocationChart();
}

/**
 * Destroy all chart instances (for cleanup)
 */
export function destroyAllCharts() {
  Object.values(charts).forEach(c => {
    if (c) c.destroy();
  });
}
