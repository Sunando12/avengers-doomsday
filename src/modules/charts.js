/**
 * Charts Module
 * Initializes and manages all Chart.js chart instances.
 */

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Store chart instances for cleanup / updates
const charts = {};

/**
 * Get shared Chart.js configuration defaults.
 */
function getChartDefaults() {
  const style = getComputedStyle(document.documentElement);
  return {
    textColor: style.getPropertyValue('--text-secondary').trim() || '#a0a0b8',
    gridColor: style.getPropertyValue('--border-secondary').trim() || 'rgba(160,160,184,0.1)',
    accent: style.getPropertyValue('--accent-primary').trim() || '#e63946',
    accentSecondary: style.getPropertyValue('--accent-secondary').trim() || '#ff6b6b',
    bg: style.getPropertyValue('--bg-tertiary').trim() || '#1a1a24',
  };
}

/**
 * Draw the threat gauge on a canvas.
 * @param {number} value - 0 to 100
 */
export function drawThreatGauge(value = 85) {
  const canvas = document.getElementById('threat-gauge');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const style = getComputedStyle(document.documentElement);
  const accent = style.getPropertyValue('--accent-primary').trim() || '#e63946';

  ctx.clearRect(0, 0, w, h);

  // Background arc
  const cx = w / 2;
  const cy = h - 10;
  const radius = 90;
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.strokeStyle = style.getPropertyValue('--bg-tertiary').trim() || '#1a1a24';
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
  ctx.fillStyle = accent;
  ctx.font = `bold 28px 'Orbitron', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${value}%`, cx, cy - 20);
}

/**
 * Initialize the readiness doughnut chart.
 * @param {Object} data - { ready, recovering, standby }
 */
export function initReadinessChart(data = { ready: 8, recovering: 2, standby: 2 }) {
  const ctx = document.getElementById('readiness-chart');
  if (!ctx) return;
  const d = getChartDefaults();

  if (charts.readiness) charts.readiness.destroy();
  charts.readiness = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Combat Ready', 'Recovering', 'Standby'],
      datasets: [{
        data: [data.ready, data.recovering, data.standby],
        backgroundColor: ['#22c55e', '#f59e0b', '#6366f1'],
        borderColor: 'transparent',
        borderWidth: 0,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: d.textColor, font: { family: 'Inter', size: 11 }, padding: 12 }
        }
      }
    }
  });
}

/**
 * Initialize mission trend line chart.
 */
export function initMissionTrendChart(missions = []) {
  const ctx = document.getElementById('mission-trend-chart');
  if (!ctx) return;
  const d = getChartDefaults();

  // Generate some data based on missions
  const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
  const completedData = [2, 3, 5, 4, 6, 8];
  const activeData = [5, 4, 6, 8, 7, 4];

  if (charts.missionTrend) charts.missionTrend.destroy();
  charts.missionTrend = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Completed',
          data: completedData,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 7,
        },
        {
          label: 'Active',
          data: activeData,
          borderColor: d.accent,
          backgroundColor: `${d.accent}15`,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 7,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          labels: { color: d.textColor, font: { family: 'Inter', size: 11 }, usePointStyle: true }
        }
      },
      scales: {
        x: { grid: { color: d.gridColor }, ticks: { color: d.textColor, font: { size: 11 } } },
        y: { grid: { color: d.gridColor }, ticks: { color: d.textColor, font: { size: 11 } }, beginAtZero: true }
      }
    }
  });
}

/**
 * Initialize power distribution polar area chart.
 */
export function initPowerDistributionChart(heroes = []) {
  const ctx = document.getElementById('power-distribution-chart');
  if (!ctx) return;
  const d = getChartDefaults();

  const topHeroes = [...heroes].sort((a, b) => (b.power || 0) - (a.power || 0)).slice(0, 6);
  const labels = topHeroes.map(h => h.name);
  const data = topHeroes.map(h => h.power);
  const colors = ['#10b981', '#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#06b6d4'];

  if (charts.powerDist) charts.powerDist.destroy();
  charts.powerDist = new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.map(c => c + '40'),
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
          labels: { color: d.textColor, font: { family: 'Inter', size: 10 }, padding: 8 }
        }
      },
      scales: {
        r: {
          grid: { color: d.gridColor },
          ticks: { display: false },
        }
      }
    }
  });
}

/**
 * Initialize threat categories bar chart.
 */
export function initThreatCategoriesChart() {
  const ctx = document.getElementById('threat-categories-chart');
  if (!ctx) return;
  const d = getChartDefaults();

  if (charts.threatCat) charts.threatCat.destroy();
  charts.threatCat = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Cosmic', 'Temporal', 'Mystical', 'Tech', 'Mutant', 'Psychic'],
      datasets: [{
        label: 'Threat Score',
        data: [92, 85, 78, 70, 65, 55],
        backgroundColor: [
          '#ef444480', '#f59e0b80', '#a855f780', '#3b82f680', '#eab30880', '#06b6d480'
        ],
        borderColor: [
          '#ef4444', '#f59e0b', '#a855f7', '#3b82f6', '#eab308', '#06b6d4'
        ],
        borderWidth: 1,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { color: d.gridColor }, ticks: { color: d.textColor, font: { size: 11 } }, max: 100 },
        y: { grid: { display: false }, ticks: { color: d.textColor, font: { size: 11 } } }
      }
    }
  });
}

/**
 * Initialize hero radar chart.
 */
export function initHeroRadarChart(heroes = []) {
  const ctx = document.getElementById('hero-radar-chart');
  if (!ctx) return;
  const d = getChartDefaults();

  const hero1 = heroes[0] || { name: 'Iron Man', power: 88, speed: 72, intel: 98 };
  const hero2 = heroes[2] || { name: 'Thor', power: 99, speed: 85, intel: 68 };

  if (charts.heroRadar) charts.heroRadar.destroy();
  charts.heroRadar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Power', 'Speed', 'Intel', 'Defense', 'Stamina', 'Leadership'],
      datasets: [
        {
          label: hero1.name,
          data: [hero1.power, hero1.speed, hero1.intel, 75, 80, 85],
          borderColor: '#e63946',
          backgroundColor: 'rgba(230,57,70,0.15)',
          pointBackgroundColor: '#e63946',
        },
        {
          label: hero2.name,
          data: [hero2.power, hero2.speed, hero2.intel, 90, 92, 70],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.15)',
          pointBackgroundColor: '#3b82f6',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: d.textColor, font: { family: 'Inter', size: 11 }, usePointStyle: true }
        }
      },
      scales: {
        r: {
          grid: { color: d.gridColor },
          angleLines: { color: d.gridColor },
          pointLabels: { color: d.textColor, font: { size: 11 } },
          ticks: { display: false },
          suggestedMin: 0,
          suggestedMax: 100,
        }
      }
    }
  });
}

/**
 * Initialize mission priority doughnut chart.
 */
export function initPriorityChart(missions = []) {
  const ctx = document.getElementById('priority-chart');
  if (!ctx) return;
  const d = getChartDefaults();

  const high = missions.filter(m => m.priority === 'high').length || 3;
  const medium = missions.filter(m => m.priority === 'medium').length || 3;
  const low = missions.filter(m => m.priority === 'low').length || 2;

  if (charts.priority) charts.priority.destroy();
  charts.priority = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['High Priority', 'Medium Priority', 'Low Priority'],
      datasets: [{
        data: [high, medium, low],
        backgroundColor: ['#ef4444', '#f59e0b', '#22c55e'],
        borderColor: 'transparent',
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: d.textColor, font: { family: 'Inter', size: 11 }, padding: 12 }
        }
      }
    }
  });
}

/**
 * Destroy all chart instances (for theme changes / cleanup).
 */
export function destroyAllCharts() {
  Object.values(charts).forEach(c => { if (c) c.destroy(); });
}
