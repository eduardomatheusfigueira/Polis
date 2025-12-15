import { NewsItem, RankingItem, GameRoom, Achievement, Archetype, PoliticalParty, Character } from '../types';

export const getNews = (): NewsItem[] => [
  {
    id: '1',
    headline: 'Senate Deadlock Continues',
    preview: 'The ruling coalition fails to pass the new budget bill for the third week in a row.',
    date: '2 Hours Ago',
    category: 'POLITICS',
  },
  {
    id: '2',
    headline: 'Market Crash in Tech Sector',
    preview: 'Major tech stocks plummet as new regulations are proposed by the opposition leader.',
    date: '5 Hours Ago',
    category: 'ECONOMY',
  },
  {
    id: '3',
    headline: 'Scandal at the Mayor\'s Office',
    preview: 'Leaked documents suggest impropriety in the allocation of public park funds.',
    date: '1 Day Ago',
    category: 'SCANDAL',
  },
];

export const getRankings = (): RankingItem[] => [
  { rank: 1, username: 'Senator_Caesar', score: 9540, faction: 'Reformist' },
  { rank: 2, username: 'Machiavelli_Reborn', score: 8920, faction: 'Traditionalist' },
  { rank: 3, username: 'Lady_Liberty', score: 8100, faction: 'Liberal' },
  { rank: 4, username: 'Iron_Chancellor', score: 7850, faction: 'Authoritarian' },
  { rank: 5, username: 'Grassroots_Guy', score: 7200, faction: 'Populist' },
];

export const getActiveRooms = (): GameRoom[] => [
  {
    id: '101',
    name: 'São Paulo Mayoral Race',
    description: 'A tight race for the heart of the metropolis. Requires balanced budgeting.',
    players: 3,
    maxPlayers: 5,
    status: 'WAITING',
    tags: ['Local', 'Economy'],
    host: 'Senator_Caesar',
    location: { city: 'São Paulo', state: 'SP', country: 'Brazil' },
    config: { 
      allowExistingCharacters: true, 
      hasAiOpponents: true, 
      isOpenToJoin: true,
      victory: { type: 'OFFICE', value: 1 } // Win by becoming Mayor
    }
  },
  {
    id: '102',
    name: 'Brasília: Senate Floor',
    description: 'High stakes national politics. Alliances are fragile.',
    players: 8,
    maxPlayers: 10,
    status: 'IN_PROGRESS',
    tags: ['National', 'Intrigue'],
    host: 'Iron_Chancellor',
    location: { city: 'Brasília', state: 'DF', country: 'Brazil' },
    config: { 
      allowExistingCharacters: false, 
      hasAiOpponents: false, 
      isOpenToJoin: false,
      victory: { type: 'CYCLES', value: 2 } // Win after 2 cycles
    }
  },
];

export const getAchievements = (): Achievement[] => [
  {
    id: 'a1',
    title: 'First Election',
    description: 'Win your first local election scenario.',
    icon: '🗳️',
    unlockedAt: '2023-10-15'
  },
  {
    id: 'a2',
    title: 'Silver Tongue',
    description: 'Successfully negotiate a treaty with 0% compromise.',
    icon: '🤝',
    unlockedAt: '2023-11-02'
  },
  {
    id: 'a3',
    title: 'Shadow Broker',
    description: 'Collect 100 Secrets cards.',
    icon: '🕵️',
  }
];

// --- RPG DATA ---

export const getArchetypes = (): Archetype[] => [
  {
    id: 'arch_student',
    name: 'Student Leader',
    description: 'Energetic, idealistic, and great at mobilizing crowds, but lacks funding.',
    icon: '🎓',
    baseStats: { charisma: 8, intelligence: 6, resources: 2 }
  },
  {
    id: 'arch_union',
    name: 'Union Leader',
    description: 'Strong base of support and negotiation skills. Resistant to scandals.',
    icon: '🏭',
    baseStats: { charisma: 6, intelligence: 5, resources: 5 }
  },
  {
    id: 'arch_heir',
    name: 'Oligarch Heir',
    description: 'Born into power. Massive resources and connections, but struggles with popularity.',
    icon: '🏛️',
    baseStats: { charisma: 4, intelligence: 6, resources: 10 }
  },
  {
    id: 'arch_tech',
    name: 'Technocrat',
    description: 'Expert in policy and administration. Poor at public speaking.',
    icon: '📊',
    baseStats: { charisma: 3, intelligence: 10, resources: 6 }
  },
  {
    id: 'arch_outsider',
    name: 'Media Outsider',
    description: 'A celebrity turned politician. Unpredictable and highly charismatic.',
    icon: '📺',
    baseStats: { charisma: 10, intelligence: 3, resources: 7 }
  }
];

export const getParties = (): PoliticalParty[] => [
  {
    id: 'party_prog',
    name: 'Progressive Union',
    acronym: 'UP',
    spectrum: 'Left',
    color: 'bg-red-600',
    bonuses: ['+2 Charisma in low income areas', 'Base mobilization cost -20%'],
    maluses: ['-10% Support from Business Sector']
  },
  {
    id: 'party_lib',
    name: 'Liberal Front',
    acronym: 'LF',
    spectrum: 'Center-Right',
    color: 'bg-blue-600',
    bonuses: ['+2 Resources per turn', '+15% Campaign Donation efficiency'],
    maluses: ['-2 Charisma in Debate Defense']
  },
  {
    id: 'party_green',
    name: 'Eco Future',
    acronym: 'ECO',
    spectrum: 'Center-Left',
    color: 'bg-green-600',
    bonuses: ['Immune to Environmental Scandals', '+3 Charisma with Youth'],
    maluses: ['Cannot accept Industry donations']
  },
  {
    id: 'party_trad',
    name: 'National Order',
    acronym: 'NO',
    spectrum: 'Right',
    color: 'bg-slate-700', // Dark grey/black
    bonuses: ['+3 Defense against Attack Ads', 'High loyalty in rural areas'],
    maluses: ['Difficulty forming coalitions']
  },
  {
    id: 'party_cent',
    name: 'Democratic Center',
    acronym: 'DC',
    spectrum: 'Center',
    color: 'bg-amber-500',
    bonuses: ['Can form coalition with any spectrum', '+1 Intelligence'],
    maluses: ['No strong base support (0 bonus starting votes)']
  }
];

// Mock generator to simulate "drawing" a card
export const generateCharacter = (archetypeId: string): Character => {
  const archetype = getArchetypes().find(a => a.id === archetypeId)!;
  
  const names = {
    'arch_student': ['Sofia "The Voice"', 'Pedro Activist', 'Lucas Undergraduate'],
    'arch_union': ['Big John', 'Maria of the Metalworkers', 'Carlos Negotiator'],
    'arch_heir': ['Viscountess Julia', 'Arthur III', 'Richie Rico'],
    'arch_tech': ['Dr. Silva', 'Professor X', 'Analyst Santos'],
    'arch_outsider': ['TV Host Bob', 'Influencer K', 'Actor Leo']
  };

  const nameList = names[archetypeId as keyof typeof names] || ['Unknown Politician'];
  const randomName = nameList[Math.floor(Math.random() * nameList.length)];
  
  // Add some random variance to stats
  const variance = () => Math.floor(Math.random() * 3) - 1; // -1, 0, or +1

  return {
    id: `char_${Date.now()}_${Math.random()}`,
    name: randomName,
    archetypeId: archetypeId,
    stats: {
      charisma: Math.max(1, archetype.baseStats.charisma + variance()),
      intelligence: Math.max(1, archetype.baseStats.intelligence + variance()),
      resources: Math.max(1, archetype.baseStats.resources + variance())
    },
    flavourText: `A rising star in the ${archetype.name} movement.`
  };
};