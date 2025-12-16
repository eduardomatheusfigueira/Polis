export type UserRole = 'PLAYER' | 'MANAGER' | 'ADMIN';

// --- STANCE & TRAIT ENUMS ---
export type EconomicStance = 'NEOLIBERAL' | 'DEVELOPMENTALIST' | 'SOCIAL_DEMOCRAT' | 'LIBERTARIAN' | 'CENTR_ECON';
export type SocialStance = 'CONSERVATIVE' | 'PROGRESSIVE' | 'MODERATE' | 'RADICAL' | 'TRADITIONALIST';
export type ArchetypeBackground = 'UNION_LEADER' | 'TYCOON' | 'INTELLECTUAL' | 'OUTSIDER' | 'MILITARY' | 'INFLUENCER';

export enum Temperament {
  PRAGMATIC = 'PRAGMATIC',
  IDEALIST = 'IDEALIST',
  RUTHLESS = 'RUTHLESS',
  CHARISMATIC = 'CHARISMATIC'
}

export enum Specialization {
  STRATEGIST = 'STRATEGIST',
  ORATOR = 'ORATOR',
  FUNDRAISER = 'FUNDRAISER',
  OPERATOR = 'OPERATOR'
}


export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole; // Permissions level
  avatarUrl?: string;
  bio?: string;
  level: number;
  influence: number;
  contactEmail?: string;
  website?: string;
  achievements: Achievement[];
  deck?: Character[]; // Characters the user has collected
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface ScenarioLocation {
  city: string;
  state: string;
  country: string;
}

export type VictoryType = 'CYCLES' | 'OFFICE' | 'DICTATOR';

export interface VictoryConfig {
  type: VictoryType;
  value: number; // CYCLES: Num cycles; OFFICE: 1=Mayor, 2=State, 3=Fed; DICTATOR: 0
}

export interface GameRoom {
  id: string;
  name: string;
  description: string;
  players: number;
  maxPlayers: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
  tags: string[];
  host: string;
  location: ScenarioLocation;
  config: {
    allowExistingCharacters: boolean;
    hasAiOpponents: boolean;
    isOpenToJoin: boolean;
    victory: VictoryConfig;
  };
}

export interface NewsItem {
  id: string;
  headline: string;
  preview: string;
  date: string;
  category: 'POLITICS' | 'ECONOMY' | 'SCANDAL';
}

export interface RankingItem {
  rank: number;
  username: string;
  score: number;
  faction: string;
}

// RPG Elements
export interface Archetype {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseStats: {
    charisma: number;
    intelligence: number;
    resources: number;
  };
  background: ArchetypeBackground;
}

export interface Character {
  id: string;
  name: string;
  archetypeId: string; // Links to the parent Archetype (Class)
  temperament: Temperament;
  specialization: Specialization;
  description: string;
  imageUrl?: string;
  stats: {
    charisma: number;
    intelligence: number;
    resources: number;
  };
  flavourText: string;
}

export interface PoliticalParty {
  id: string;
  name: string;
  acronym: string;
  economicStance: EconomicStance;
  socialStance: SocialStance;
  // spectrum: 'Left' | 'Center-Left' | ... (Removed in favor of distinct stances)
  color: string;
  bonuses: string[];
  maluses: string[];
}

// --- NEW GAMEPLAY TYPES ---

export interface DemographicGroup {
  id: string;
  name: string;
  size: number; // Percentage of population
  support: number; // 0-100
  demands: string[]; // IDs of issues they care about
  power: number; // Political influence multiplier
  satisfaction: number; // 0-100 (New for Season 2: How well reality matches their needs)
}

export interface Issue {
  id: string;
  name: string;
  description: string;
  controversial: boolean;
}

export interface Proposal {
  id: string;
  issueId: string;
  name: string;
  cost: number; // Resource cost to implement/maintain
  popEffect: Record<string, number>; // Demographic ID -> Support change
}

export type PoliticalSphere = 'MUNICIPAL' | 'STATE' | 'FEDERAL';
export type PlayerRole = 'CANDIDATE' | 'INCUMBENT' | 'OPPOSITION';

export interface PlayerState {
  character: Character;
  party: PoliticalParty;
  role: PlayerRole;
  currentOffice: string | null; // e.g., "Mayor", "Councilor"
  targetOffice: string | null; // What they are running for
  sphere: PoliticalSphere;
  season: number; // 1, 2, 3...
  stats: {
    popularity: number; // General public
    partySupport: number; // Internal party standing
    funds: number;
    energy: number;
    coherence: number; // How well actions match promises
  };
  agenda: string[]; // List of Issue IDs
  program: string[]; // List of Proposal IDs
}

export interface GovernanceStats {
  economy: number;
  security: number;
  services: number;
  budget: number; // Treasury
}

export interface Institutions {
  congress: number; // Support 0-100
  judiciary: number; // Support 0-100
  military: number; // Support 0-100
}

export interface TurnEvent {
  turn: number;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'FAILURE' | 'CRITICAL';
}

export interface GameSessionState {
  roomId: string;
  currentTurn: number; // 1 to 48
  maxTurns: number;
  phase: 'PRIMARY' | 'ELECTION'; // Years 1-3 vs Year 4
  playerState: PlayerState;
  demographics: DemographicGroup[];
  governance: GovernanceStats; // The "Reality" of the city
  institutions: Institutions; // For Dictator victory
  victoryConfig: VictoryConfig;
  winner?: boolean; // True if player won
  gameOver: boolean;
  turnHistory: TurnEvent[];
  location: ScenarioLocation;
}

export type ActionType = 'RESEARCH' | 'CAMPAIGN' | 'PARTY' | 'POLICY' | 'PERSONAL' | 'GOVERNANCE' | 'ATTACK' | 'INSTITUTION';

export interface GameAction {
  id: string;
  type: ActionType;
  name: string;
  description: string;
  cost: {
    energy?: number;
    funds?: number;
    budget?: number; // Public funds (Governance only)
  };
  requiredRole?: PlayerRole[]; // Who can use this
  requiredPhase?: 'PRIMARY' | 'ELECTION';
  difficulty: number; // Base DC
  statModifier: 'charisma' | 'intelligence' | 'resources';
}