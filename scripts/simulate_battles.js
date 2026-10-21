// Monte Carlo battle simulation of Avengers vs Doctor Doom

const doom = { name: 'Doctor Doom', power: 100, speed: 92, intel: 100 };

const heroes = [
  { name: 'Scarlet Witch', power: 94, speed: 74, intel: 86 },
  { name: 'Thor', power: 92, speed: 82, intel: 72 },
  { name: 'Hulk', power: 90, speed: 62, intel: 88 },
  { name: 'Doctor Strange', power: 89, speed: 68, intel: 96 },
  { name: 'Iron Man', power: 85, speed: 78, intel: 98 },
  { name: 'Storm', power: 84, speed: 80, intel: 82 },
  { name: 'Wolverine', power: 80, speed: 78, intel: 68 },
  { name: 'Captain America', power: 76, speed: 72, intel: 80 },
  { name: 'Spider-Man', power: 74, speed: 90, intel: 88 }
];

function getHp(f) {
  return Math.round(f.power * 1.5 + f.speed * 0.5 + 50);
}

// 1-on-1 duel simulation using the exact arena damage formula
function simulate1v1(hero, boss, iterations = 10000) {
  let heroWins = 0;
  let bossWins = 0;

  for (let i = 0; i < iterations; i++) {
    let hp1 = getHp(hero);
    let hp2 = getHp(boss);

    while (hp1 > 0 && hp2 > 0) {
      // Hero attacks
      const crit1 = Math.random() < ((hero.intel || 50) / 300);
      const dmg1 = Math.max(8, Math.round((hero.power * 0.25 + Math.random() * 10) * (crit1 ? 1.5 : 1)));
      hp2 -= dmg1;
      if (hp2 <= 0) {
        heroWins++;
        break;
      }

      // Boss attacks
      const crit2 = Math.random() < ((boss.intel || 50) / 300);
      const dmg2 = Math.max(8, Math.round((boss.power * 0.25 + Math.random() * 10) * (crit2 ? 1.5 : 1)));
      hp1 -= dmg2;
      if (hp1 <= 0) {
        bossWins++;
        break;
      }
    }
  }

  return { heroWins, bossWins, winRate: (heroWins / iterations * 100).toFixed(1) };
}

// Squad Battle: Avengers Strike Team vs God-Emperor Doom (Beyonder-infused)
function simulateSquadRaid(squad, boss, iterations = 14000605) {
  // We can sample 100,000 for lightning speed and extrapolate
  const sampleSize = 50000;
  let avengersWins = 0;
  let doomWins = 0;
  let incursionCataclysms = 0; // Both destroyed in multiverse collapse

  for (let i = 0; i < sampleSize; i++) {
    // God-Emperor Doom: Cosmic Forcefield & Doombot Vanguard
    let bossHp = 1200; 
    let forcefield = 450;
    let roster = squad.map(h => ({ ...h, hp: getHp(h) }));

    let round = 0;
    while (bossHp > 0 && roster.some(h => h.hp > 0) && round < 30) {
      round++;

      // Avengers attack
      for (const h of roster) {
        if (h.hp > 0) {
          const crit = Math.random() < (h.intel / 200);
          let rawDmg = Math.round((h.power * 0.32 + Math.random() * 15) * (crit ? 1.7 : 1));

          // Magic bypasses forcefield
          if (h.name === 'Scarlet Witch' || h.name === 'Doctor Strange') {
            bossHp -= Math.round(rawDmg * 1.25);
          } else if (forcefield > 0) {
            forcefield -= rawDmg;
            if (forcefield < 0) {
              bossHp += forcefield;
              forcefield = 0;
            }
          } else {
            bossHp -= rawDmg;
          }

          if (bossHp <= 0) break;
        }
      }

      if (bossHp <= 0) {
        avengersWins++;
        break;
      }

      // Incursion timer hazard: 8% chance per round of dimensional collapse
      if (round > 12 && Math.random() < 0.08) {
        incursionCataclysms++;
        break;
      }

      // Doom counterattacks: Cosmic Blast + Doombot Swarm
      const living = roster.filter(h => h.hp > 0);
      if (living.length === 0) break;

      // Targeted beam at highest threat
      const target = living.reduce((max, h) => h.power > max.power ? h : max, living[0]);
      const doomCrit = Math.random() < 0.35;
      const beamDmg = Math.round((boss.power * 0.65 + Math.random() * 20) * (doomCrit ? 1.6 : 1));
      target.hp -= beamDmg;

      // Siphon AoE to all others
      living.forEach(h => {
        if (h !== target && h.hp > 0) {
          h.hp -= Math.round(boss.power * 0.18 + Math.random() * 10);
        }
      });

      if (!roster.some(h => h.hp > 0)) {
        doomWins++;
        break;
      }
    }

    if (bossHp > 0 && !roster.some(h => h.hp > 0)) {
      doomWins++;
    }
  }

  return {
    sampleSize,
    avengersWins,
    doomWins,
    incursionCataclysms,
    avengersWinRate: (avengersWins / sampleSize * 100).toFixed(1),
    doomWinRate: (doomWins / sampleSize * 100).toFixed(1),
    cataclysmRate: (incursionCataclysms / sampleSize * 100).toFixed(1)
  };
}

console.log('=== 1-ON-1 DUEL SIMULATIONS (10,000 battles each) ===');
heroes.forEach(h => {
  const res = simulate1v1(h, doom, 10000);
  console.log(`${h.name} vs Doctor Doom: Win Rate = ${res.winRate}% (Doom Wins: ${(100 - res.winRate).toFixed(1)}%)`);
});

console.log('\n=== MULTIVERSE SQUAD WAR SIMULATION (10,000 battles) ===');
const topAvengers = heroes.slice(0, 6); // Wanda, Thor, Hulk, Strange, Stark, Storm
const squadRes = simulateSquadRaid(topAvengers, doom, 10000);
console.log(`Squad Avengers Win Rate: ${squadRes.avengersWinRate}%`);
console.log(`Doctor Doom God-Emperor Win Rate: ${squadRes.doomWinRate}%`);
console.log(`Pyrrhic Victory Rate (Critical Casualties): ${squadRes.pyrrhicRate}%`);
