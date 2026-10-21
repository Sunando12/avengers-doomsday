/**
 * Avengers: Doomsday — Mock Data
 * All initial hero, mission, and event data used throughout the app.
 */

export const HEROES = [
  {
    id: 'h_doom', name: 'Doctor Doom', alias: 'Victor Von Doom', emoji: '👑',
    image: '/images/characters/doctor-doom.jpg',
    role: 'Supreme Sovereign & God Emperor', ultimate: 'Cosmic Syphon & Doombot Legion',
    team: 'villain', power: 100, speed: 92, intel: 100,
    status: 'critical', bio: 'Lord of Latveria, Beyonder-infused cosmic titan, master of mystic sorcery and cybernetic armor. The undisputed apex threat.'
  },
  {
    id: 'h12', name: 'Scarlet Witch', alias: 'Wanda Maximoff', emoji: '✨',
    image: '/images/characters/scarlet-witch.jpg',
    role: 'Chaos Sorceress', ultimate: 'Hex Reality Distortion',
    team: 'avenger', power: 94, speed: 74, intel: 86,
    status: 'active', bio: 'Reality-warping nexus being commanding catastrophic chaos magic across the multiverse.'
  },
  {
    id: 'h3', name: 'Thor', alias: 'Thor Odinson', emoji: '⚡',
    image: '/images/characters/thor.jpg',
    role: 'Thunder God', ultimate: 'God-Blast Lightning Surge',
    team: 'avenger', power: 92, speed: 82, intel: 72,
    status: 'active', bio: 'Asgardian god of thunder commanding storm celestial energy and Mjolnir.'
  },
  {
    id: 'h5', name: 'Hulk', alias: 'Bruce Banner', emoji: '💚',
    image: '/images/characters/hulk.jpg',
    role: 'Gamma Colossus', ultimate: 'World-Breaker Ground Slam',
    team: 'avenger', power: 90, speed: 62, intel: 88,
    status: 'active', bio: 'Limitless brute physical strength and unstoppable destructive rage.'
  },
  {
    id: 'h11', name: 'Doctor Strange', alias: 'Stephen Strange', emoji: '🔮',
    image: '/images/characters/doctor-strange.jpg',
    role: 'Sorcerer Supreme', ultimate: 'Mirror Dimension Banishment',
    team: 'ally', power: 89, speed: 68, intel: 96,
    status: 'active', bio: 'Master of mystic arts wielding eldritch spells and the Eye of Agamotto.'
  },
  {
    id: 'h1', name: 'Iron Man', alias: 'Tony Stark', emoji: '🦾',
    image: '/images/characters/iron-man.jpg',
    role: 'Tech Vanguard', ultimate: 'Unibeam Overcharge',
    team: 'avenger', power: 85, speed: 78, intel: 98,
    status: 'active', bio: 'Genius inventor in nanotech Model Prime armor with bleeding-edge weapon systems.'
  },
  {
    id: 'h10', name: 'Storm', alias: 'Ororo Munroe', emoji: '🌩️',
    image: '/images/characters/storm.jpg',
    role: 'Omega Weather Mistress', ultimate: 'Cataclysmic Hurricane',
    team: 'xmen', power: 84, speed: 80, intel: 82,
    status: 'active', bio: 'Omega-level mutant commanding the forces of the atmosphere, blizzards, and lightning.'
  },
  {
    id: 'h9', name: 'Wolverine', alias: 'Logan', emoji: '🐺',
    image: '/images/characters/wolverine.jpg',
    role: 'Berserker Mutant', ultimate: 'Adamantium Frenzy',
    team: 'xmen', power: 80, speed: 78, intel: 68,
    status: 'active', bio: 'Indestructible adamantium skeleton, razor claws, and hyper-accelerated healing factor.'
  },
  {
    id: 'h2', name: 'Captain America', alias: 'Steve Rogers', emoji: '🛡️',
    image: '/images/characters/captain-america.jpg',
    role: 'Tactical Leader', ultimate: 'Vibranium Shield Ricochet',
    team: 'avenger', power: 76, speed: 72, intel: 80,
    status: 'active', bio: 'Living legend, master tactician, and unwavering moral backbone of the Avengers.'
  },
  {
    id: 'h6', name: 'Spider-Man', alias: 'Peter Parker', emoji: '🕸️',
    image: '/images/characters/spider-man.jpg',
    role: 'Acrobatic Striker', ultimate: 'Iron Spider Web Barrage',
    team: 'avenger', power: 74, speed: 90, intel: 88,
    status: 'active', bio: 'Agile web-slinger with precognitive spider-sense and extraordinary acrobatic agility.'
  },
  {
    id: 'h8', name: 'Gamora', alias: 'Gamora Zen', emoji: '⚔️',
    image: '/images/characters/gamora.jpg',
    role: 'Deadliest Assassin', ultimate: 'Godslayer Blade Flurry',
    team: 'guardian', power: 72, speed: 84, intel: 76,
    status: 'active', bio: 'Supreme martial artist, assassin of the cosmos, and master of all bladed combat.'
  },
  {
    id: 'h4', name: 'Black Widow', alias: 'Natasha Romanoff', emoji: '🕷️',
    image: '/images/characters/black-widow.jpg',
    role: 'Infiltration Master', ultimate: 'Widow’s Bite Stun Array',
    team: 'avenger', power: 65, speed: 82, intel: 90,
    status: 'active', bio: 'World-class covert operative, assassin, and unmatched psychological strategist.'
  },
  {
    id: 'h7', name: 'Star-Lord', alias: 'Peter Quill', emoji: '🚀',
    image: '/images/characters/star-lord.jpg',
    role: 'Cosmic Outlaw', ultimate: 'Element Blaster Rapid Fire',
    team: 'guardian', power: 62, speed: 74, intel: 70,
    status: 'active', bio: 'Intergalactic rogue armed with twin element blasters and plasma jet propulsion.'
  },
];

export const INCURSION_ZONES = [
  { id: 'inc_1', name: 'Earth-838 Collision Horizon', reality: 'Earth-838', danger: 88, status: 'Imminent', timer: 1420, coordinates: '40.7128° N, 74.0060° W', sector: 'Sector Alpha' },
  { id: 'inc_2', name: 'Earth-1610 Quantum Rift', reality: 'Earth-1610', danger: 64, status: 'Expanding', timer: 3200, coordinates: '51.5074° N, 0.1278° W', sector: 'Sector Beta' },
  { id: 'inc_3', name: 'Battleworld Singularity Core', reality: 'Battleworld', danger: 95, status: 'Critical', timer: 680, coordinates: '35.6762° N, 139.6503° E', sector: 'Sector Omega' },
];

export const MISSIONS = [
  {
    id: 'm1', title: 'Neutralize Doom\'s Time Platform',
    description: 'Infiltrate Latveria and disable Doctor Doom\'s temporal displacement device.',
    status: 'critical', priority: 'high', assignee: 'Iron Man',
    created: '2026-10-18', deadline: '2026-10-25'
  },
  {
    id: 'm2', title: 'Secure the Infinity Stones',
    description: 'Prevent the remaining Infinity Stones from falling into Doom\'s hands.',
    status: 'active', priority: 'high', assignee: 'Thor',
    created: '2026-10-15', deadline: '2026-10-28'
  },
  {
    id: 'm3', title: 'Recruit X-Men Alliance',
    description: 'Negotiate with the X-Men for a joint tactical effort against the Doomsday threat.',
    status: 'planning', priority: 'medium', assignee: 'Captain America',
    created: '2026-10-19', deadline: '2026-11-01'
  },
  {
    id: 'm4', title: 'Multiverse Breach Detection',
    description: 'Deploy sensors to detect multiverse incursions across key global locations.',
    status: 'active', priority: 'medium', assignee: 'Doctor Strange',
    created: '2026-10-16', deadline: '2026-10-30'
  },
  {
    id: 'm5', title: 'Wakandan Shield Array',
    description: 'Upgrade Wakanda\'s vibranium shield array for planetary defense.',
    status: 'completed', priority: 'low', assignee: 'Black Widow',
    created: '2026-10-10', deadline: '2026-10-20'
  },
  {
    id: 'm6', title: 'Evacuate NYC Sector 7',
    description: 'Coordinate civilian evacuation from the projected impact zone.',
    status: 'planning', priority: 'high', assignee: 'Spider-Man',
    created: '2026-10-20', deadline: '2026-10-23'
  },
  {
    id: 'm7', title: 'Guardian Recon Sweep',
    description: 'Patrol the Andromeda sector for Doom\'s cosmic fleet signatures.',
    status: 'active', priority: 'low', assignee: 'Star-Lord',
    created: '2026-10-17', deadline: '2026-11-05'
  },
  {
    id: 'm8', title: 'Gamma Radiation Countermeasures',
    description: 'Develop anti-gamma weaponry for use against Doom\'s irradiated soldiers.',
    status: 'completed', priority: 'medium', assignee: 'Hulk',
    created: '2026-10-08', deadline: '2026-10-18'
  },
];

export const MOCK_EVENTS = [
  {
    id: 'ev1',
    summary: 'Avengers Tactical Briefing',
    description: 'Full team briefing on Operation Doomsday countermeasures.',
    start: { dateTime: new Date(Date.now() + 2 * 3600000).toISOString() },
    end: { dateTime: new Date(Date.now() + 3 * 3600000).toISOString() },
    colorId: '11'
  },
  {
    id: 'ev2',
    summary: 'Multiverse Portal Monitoring',
    description: 'Shift rotation for monitoring multiverse breach points.',
    start: { dateTime: new Date(Date.now() + 5 * 3600000).toISOString() },
    end: { dateTime: new Date(Date.now() + 7 * 3600000).toISOString() },
    colorId: '9'
  },
  {
    id: 'ev3',
    summary: 'Doom\'s Herald Interception',
    description: 'Intercept incoming scout drone from Latveria.',
    start: { dateTime: new Date(Date.now() + 24 * 3600000).toISOString() },
    end: { dateTime: new Date(Date.now() + 25 * 3600000).toISOString() },
    colorId: '4'
  },
  {
    id: 'ev4',
    summary: 'X-Men Alliance Summit',
    description: 'Joint strategy meeting with Professor Xavier and Cyclops.',
    start: { dateTime: new Date(Date.now() + 48 * 3600000).toISOString() },
    end: { dateTime: new Date(Date.now() + 50 * 3600000).toISOString() },
    colorId: '6'
  },
  {
    id: 'ev5',
    summary: 'Vibranium Weapons Test',
    description: 'Prototype testing at Wakandan outpost.',
    start: { dateTime: new Date(Date.now() + 72 * 3600000).toISOString() },
    end: { dateTime: new Date(Date.now() + 74 * 3600000).toISOString() },
    colorId: '1'
  }
];
