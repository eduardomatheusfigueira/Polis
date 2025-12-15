import { 
  GameSessionState, 
  DemographicGroup, 
  Issue, 
  Proposal, 
  GameAction, 
  Character, 
  PoliticalParty,
  ScenarioLocation,
  TurnEvent,
  PlayerRole,
  VictoryConfig,
  Institutions
} from '../types';

// --- CONSTANTS ---
const MAX_TURNS = 48; // 4 years * 12 months
const PRIMARY_END_TURN = 36; // End of year 3

// --- CONTENT GENERATION ---

export const generateDemographics = (location: ScenarioLocation): DemographicGroup[] => {
  // Simple randomization based on location name length just to vary it slightly for the demo
  const variance = location.city.length % 3;
  
  return [
    { id: 'demo_union', name: 'Union Workers', size: 30 - variance, support: 20, satisfaction: 50, power: 1.2, demands: ['issue_wages', 'issue_transport'] },
    { id: 'demo_biz', name: 'Business Owners', size: 15 + variance, support: 20, satisfaction: 50, power: 2.0, demands: ['issue_tax', 'issue_security'] },
    { id: 'demo_youth', name: 'Students & Youth', size: 25, support: 10, satisfaction: 50, power: 0.8, demands: ['issue_transport', 'issue_environment'] },
    { id: 'demo_retirees', name: 'Retirees', size: 20, support: 30, satisfaction: 50, power: 1.5, demands: ['issue_health', 'issue_security'] },
    { id: 'demo_religious', name: 'Religious Groups', size: 10, support: 15, satisfaction: 50, power: 1.3, demands: ['issue_family'] },
  ];
};

export const getIssues = (): Issue[] => [
  { id: 'issue_transport', name: 'Public Transport', description: 'Bus fares, metro lines, and traffic.', controversial: false },
  { id: 'issue_health', name: 'Public Health', description: 'Hospital wait times and medicine availability.', controversial: false },
  { id: 'issue_security', name: 'Public Safety', description: 'Crime rates and policing.', controversial: true },
  { id: 'issue_tax', name: 'Tax Reform', description: 'Business incentives vs social funding.', controversial: true },
  { id: 'issue_environment', name: 'Environment', description: 'Parks, pollution, and sustainability.', controversial: true },
  { id: 'issue_wages', name: 'Fair Wages', description: 'Minimum wage and worker rights.', controversial: true },
  { id: 'issue_family', name: 'Family Values', description: 'Traditional values and education.', controversial: true },
];

export const getProposals = (issueId: string): Proposal[] => {
  const allProposals: Proposal[] = [
    { id: 'prop_metro', issueId: 'issue_transport', name: 'Expand Metro Lines', cost: 10, popEffect: { 'demo_youth': 10, 'demo_union': 5, 'demo_biz': 2 } },
    { id: 'prop_bus', issueId: 'issue_transport', name: 'Free Bus Fare (Students)', cost: 5, popEffect: { 'demo_youth': 15, 'demo_biz': -2 } },
    { id: 'prop_hosp', issueId: 'issue_health', name: 'Build New Hospital', cost: 15, popEffect: { 'demo_retirees': 12, 'demo_union': 5 } },
    { id: 'prop_police', issueId: 'issue_security', name: 'Increase Police Budget', cost: 8, popEffect: { 'demo_biz': 8, 'demo_retirees': 10, 'demo_youth': -5 } },
    { id: 'prop_taxcut', issueId: 'issue_tax', name: 'Small Biz Tax Cut', cost: 5, popEffect: { 'demo_biz': 15, 'demo_union': -5 } },
    { id: 'prop_park', issueId: 'issue_environment', name: 'City Green Belts', cost: 5, popEffect: { 'demo_youth': 8, 'demo_retirees': 5 } },
  ];
  return allProposals.filter(p => p.issueId === issueId);
};

// --- ACTION SYSTEM ---

export const getAvailableActions = (role: PlayerRole, victoryType: VictoryConfig['type']): GameAction[] => {
  const commonActions: GameAction[] = [
    { 
      id: 'act_poll', type: 'RESEARCH', name: 'Opinion Poll', 
      description: 'Spend funds to accurately gauge demographic support.', 
      cost: { funds: 5, energy: 10 }, difficulty: 5, statModifier: 'intelligence',
      requiredRole: ['CANDIDATE', 'INCUMBENT', 'OPPOSITION']
    },
    { 
      id: 'act_dinner', type: 'PARTY', name: 'Fundraising Dinner', 
      description: 'Schmooze with elites to raise funds.', 
      cost: { energy: 15 }, difficulty: 10, statModifier: 'charisma',
      requiredRole: ['CANDIDATE', 'INCUMBENT', 'OPPOSITION']
    },
    { 
      id: 'act_internal', type: 'PARTY', name: 'Internal Networking', 
      description: 'Meet with party cadres to secure your nomination.', 
      cost: { energy: 10 }, difficulty: 10, statModifier: 'intelligence',
      requiredRole: ['CANDIDATE', 'INCUMBENT', 'OPPOSITION']
    },
    { 
      id: 'act_rest', type: 'PERSONAL', name: 'Rest & Recover', 
      description: 'Take a break to restore energy.', 
      cost: {}, difficulty: 0, statModifier: 'resources',
      requiredRole: ['CANDIDATE', 'INCUMBENT', 'OPPOSITION']
    }
  ];

  const candidateActions: GameAction[] = [
    { 
      id: 'act_rally', type: 'CAMPAIGN', name: 'Public Rally', 
      description: 'Hold a rally to boost general popularity.', 
      cost: { funds: 10, energy: 20 }, difficulty: 12, statModifier: 'charisma',
      requiredRole: ['CANDIDATE']
    },
    { 
      id: 'act_media', type: 'CAMPAIGN', name: 'TV Interview', 
      description: 'High risk, high reward media appearance.', 
      cost: { energy: 25 }, difficulty: 15, statModifier: 'charisma',
      requiredRole: ['CANDIDATE']
    }
  ];

  const incumbentActions: GameAction[] = [
     { 
      id: 'act_gov_project', type: 'GOVERNANCE', name: 'Public Works Project', 
      description: 'Improve city services to boost satisfaction.', 
      cost: { budget: 20, energy: 20 }, difficulty: 12, statModifier: 'intelligence',
      requiredRole: ['INCUMBENT']
    },
    { 
      id: 'act_gov_law', type: 'GOVERNANCE', name: 'Pass Legislation', 
      description: 'Fulfill agenda promises. High impact.', 
      cost: { energy: 30 }, difficulty: 15, statModifier: 'intelligence',
      requiredRole: ['INCUMBENT']
    },
    { 
      id: 'act_gov_speech', type: 'GOVERNANCE', name: 'Address the Nation', 
      description: 'Explain your policies to maintain coherence.', 
      cost: { energy: 15 }, difficulty: 10, statModifier: 'charisma',
      requiredRole: ['INCUMBENT']
    }
  ];

  const oppositionActions: GameAction[] = [
    { 
      id: 'act_opp_criticize', type: 'ATTACK', name: 'Criticize Government', 
      description: 'Highlight unmet demands to lower incumbent popularity.', 
      cost: { energy: 15, funds: 5 }, difficulty: 12, statModifier: 'charisma',
      requiredRole: ['OPPOSITION']
    },
    { 
      id: 'act_opp_investigate', type: 'ATTACK', name: 'Launch Investigation', 
      description: 'Dig for scandals. Low chance, critical damage.', 
      cost: { energy: 25, funds: 15 }, difficulty: 18, statModifier: 'intelligence',
      requiredRole: ['OPPOSITION']
    },
    { 
      id: 'act_opp_protest', type: 'CAMPAIGN', name: 'Organize Protest', 
      description: 'Mobilize dissatisfied groups.', 
      cost: { energy: 20 }, difficulty: 14, statModifier: 'charisma',
      requiredRole: ['OPPOSITION']
    }
  ];

  // Dictator Mode specific actions
  const dictatorActions: GameAction[] = [
    { 
      id: 'act_inst_congress', type: 'INSTITUTION', name: 'Lobby Congress', 
      description: 'Build alliance with lawmakers to pass the Enabling Act.', 
      cost: { energy: 15, funds: 10 }, difficulty: 14, statModifier: 'intelligence',
      requiredRole: ['INCUMBENT']
    },
    { 
      id: 'act_inst_military', type: 'INSTITUTION', name: 'Military Parade', 
      description: 'Show strength and gain favor with the generals.', 
      cost: { energy: 20, budget: 10 }, difficulty: 14, statModifier: 'charisma',
      requiredRole: ['INCUMBENT']
    },
    { 
      id: 'act_inst_courts', type: 'INSTITUTION', name: 'Pack the Courts', 
      description: 'Appoint loyal judges to the high court.', 
      cost: { energy: 20 }, difficulty: 16, statModifier: 'intelligence',
      requiredRole: ['INCUMBENT']
    },
    { 
      id: 'act_win_dictator', type: 'GOVERNANCE', name: 'Declare State of Exception', 
      description: 'Attempt to seize absolute power. Requires massive support across all sectors.', 
      cost: { energy: 50, funds: 50 }, difficulty: 25, statModifier: 'charisma',
      requiredRole: ['INCUMBENT']
    }
  ];

  let specificActions: GameAction[] = [];
  if (role === 'CANDIDATE') specificActions = candidateActions;
  if (role === 'INCUMBENT') specificActions = incumbentActions;
  if (role === 'OPPOSITION') specificActions = oppositionActions;

  let allActions = [...commonActions, ...specificActions];
  
  if (victoryType === 'DICTATOR' && role === 'INCUMBENT') {
    allActions = [...allActions, ...dictatorActions];
  }

  return allActions;
};

// --- LOGIC ENGINE ---

export const initializeGame = (
  room: any, 
  character: Character, 
  party: PoliticalParty
): GameSessionState => {
  return {
    roomId: room.id,
    currentTurn: 1,
    maxTurns: MAX_TURNS,
    phase: 'PRIMARY',
    location: room.location,
    demographics: generateDemographics(room.location),
    governance: {
      economy: 50,
      security: 50,
      services: 50,
      budget: 100 
    },
    institutions: {
      congress: 30,
      judiciary: 40,
      military: 20
    },
    victoryConfig: room.config.victory,
    gameOver: false,
    turnHistory: [{ turn: 1, message: 'Season 1 begins. Formulate your agenda!', type: 'INFO' }],
    playerState: {
      character,
      party,
      role: 'CANDIDATE',
      currentOffice: null,
      targetOffice: 'Mayor', // Default start
      sphere: 'MUNICIPAL',
      season: 1,
      stats: {
        popularity: 10, 
        partySupport: 20,
        funds: character.stats.resources * 10,
        energy: 100,
        coherence: 100
      },
      agenda: [],
      program: []
    }
  };
};

// Demographic Drift: High performing politicians mold the public preference
const processDemographicDrift = (state: GameSessionState): DemographicGroup[] => {
  // If popular, people align with your party/issues
  if (state.playerState.stats.popularity > 70) {
    const targetDemoIndex = Math.floor(Math.random() * state.demographics.length);
    const newDemos = [...state.demographics];
    const demo = { ...newDemos[targetDemoIndex] };
    
    // Shift: Add support
    demo.support = Math.min(100, demo.support + 5);
    
    // Shift: Adopt an issue from player agenda if not present
    if (state.playerState.agenda.length > 0) {
      const randomAgendaItem = state.playerState.agenda[0];
      if (!demo.demands.includes(randomAgendaItem) && Math.random() > 0.5) {
        // Replace a random existing demand
        demo.demands = [randomAgendaItem, ...demo.demands.slice(1)];
      }
    }
    newDemos[targetDemoIndex] = demo;
    return newDemos;
  }
  return state.demographics;
};

export const startNextSeason = (currentState: GameSessionState, wonElection: boolean): GameSessionState => {
  const nextSeason = currentState.playerState.season + 1;
  const newRole = wonElection ? 'INCUMBENT' : 'OPPOSITION';
  const newOffice = wonElection ? currentState.playerState.targetOffice : null;
  const sphere = currentState.playerState.sphere;

  // Check Victory Condition: CYCLES limit
  if (currentState.victoryConfig.type === 'CYCLES' && nextSeason > currentState.victoryConfig.value) {
    return {
      ...currentState,
      gameOver: true,
      winner: true, // In this simple single player, surviving = winning
      turnHistory: [{ turn: currentState.currentTurn, message: "Game Over! Cycle limit reached.", type: 'INFO' }, ...currentState.turnHistory]
    };
  }

  // Check Victory Condition: OFFICE
  // If we won the election, and the office we just won matches target value (simplified logic here: 1=Mayor, 2=State, etc)
  // For demo: assume Municipal = 1, State = 2.
  let currentSphereValue = 1; 
  if (sphere === 'STATE') currentSphereValue = 2;
  if (sphere === 'FEDERAL') currentSphereValue = 3;

  if (currentState.victoryConfig.type === 'OFFICE' && wonElection && currentSphereValue >= currentState.victoryConfig.value) {
    return {
       ...currentState,
       gameOver: true,
       winner: true,
       turnHistory: [{ turn: currentState.currentTurn, message: "Victory! You have achieved the target office.", type: 'SUCCESS' }, ...currentState.turnHistory]
    };
  }

  // Drift Logic
  const driftedDemographics = processDemographicDrift(currentState);

  // Carry over stats, but reset turn and phase
  return {
    ...currentState,
    currentTurn: 1,
    phase: 'PRIMARY',
    demographics: driftedDemographics,
    turnHistory: [
      { 
        turn: 1, 
        message: `Season ${nextSeason} Begins! You are now the ${newRole === 'INCUMBENT' ? newOffice : 'Opposition Leader'}. Public opinion has shifted slightly.`, 
        type: 'INFO' 
      },
      ...currentState.turnHistory
    ],
    playerState: {
      ...currentState.playerState,
      season: nextSeason,
      role: newRole,
      currentOffice: newOffice,
      // Logic for sphere climbing: if Incumbent and Season > 1, maybe go up?
      // For simplicity in this demo, toggle sphere on win
      sphere: (wonElection && sphere === 'MUNICIPAL') ? 'STATE' : sphere,
      targetOffice: (wonElection && sphere === 'MUNICIPAL') ? 'Governor' : 'President', 
      stats: {
        ...currentState.playerState.stats,
        energy: 100, // Refill energy
        funds: currentState.playerState.stats.funds + 50 // Fundraising bonus
      }
    }
  };
};

export const updatePlatform = (
  currentState: GameSessionState,
  newAgenda: string[],
  newProgram: string[]
): GameSessionState => {
  return {
    ...currentState,
    playerState: {
      ...currentState.playerState,
      agenda: newAgenda,
      program: newProgram
    }
  };
};

export const processTurn = (
  currentState: GameSessionState, 
  action: GameAction
): GameSessionState => {
  let newState = { ...currentState };
  let player = { ...newState.playerState };
  let governance = { ...newState.governance };
  let institutions = { ...newState.institutions };
  let demos = [...newState.demographics];
  let history = [...newState.turnHistory];
  
  // 1. Pay Costs
  if (action.cost.funds && player.stats.funds < action.cost.funds) return currentState;
  if (action.cost.energy && player.stats.energy < action.cost.energy) return currentState;
  if (action.cost.budget && governance.budget < action.cost.budget) return currentState;
  
  player.stats.funds -= (action.cost.funds || 0);
  player.stats.energy -= (action.cost.energy || 0);
  governance.budget -= (action.cost.budget || 0);

  // 2. Roll Dice
  const d20 = Math.floor(Math.random() * 20) + 1;
  const statVal = player.character.stats[action.statModifier];
  const totalScore = d20 + statVal;
  
  const isSuccess = totalScore >= action.difficulty;
  const isCritical = d20 === 20;
  const isCritFail = d20 === 1;

  // 3. Apply Effects
  let logMessage = `[${action.type}] ${action.name}: Rolled ${d20} + ${statVal} = ${totalScore} (DC ${action.difficulty}).`;
  let resultType: TurnEvent['type'] = isSuccess ? 'SUCCESS' : 'FAILURE';

  if (action.id === 'act_rest') {
    player.stats.energy = Math.min(100, player.stats.energy + 30);
    logMessage = "Rested and recovered 30 energy.";
    resultType = 'INFO';
  } else if (action.id === 'act_win_dictator') {
    if (isSuccess && player.stats.popularity > 80 && institutions.military > 70 && institutions.congress > 60) {
      logMessage = "STATE OF EXCEPTION DECLARED. YOU HAVE SEIZED ABSOLUTE POWER. VICTORY!";
      newState.gameOver = true;
      newState.winner = true;
      resultType = 'SUCCESS';
    } else {
      logMessage = "The coup failed! You have been impeached and arrested.";
      newState.gameOver = true;
      newState.winner = false;
      resultType = 'CRITICAL';
    }
  } else if (isSuccess) {
    const magnitude = isCritical ? 1.5 : 1.0;
    
    switch (action.type) {
      case 'CAMPAIGN':
        player.stats.popularity += Math.floor(3 * magnitude);
        logMessage += ` Public support increased.`;
        break;
      case 'PARTY':
        player.stats.partySupport += Math.floor(3 * magnitude);
        player.stats.funds += Math.floor(10 * magnitude); // Fundraising
        logMessage += ` Party standing improved.`;
        break;
      case 'GOVERNANCE':
        governance.services += Math.floor(5 * magnitude);
        governance.economy += Math.floor(2 * magnitude);
        player.stats.popularity += Math.floor(4 * magnitude);
        player.stats.coherence += 2; 
        demos = demos.map(d => ({ ...d, satisfaction: Math.min(100, d.satisfaction + 5) }));
        logMessage += ` Public services improved. Satisfaction up.`;
        break;
      case 'ATTACK':
        player.stats.popularity += Math.floor(3 * magnitude); 
        demos = demos.map(d => ({ ...d, satisfaction: Math.max(0, d.satisfaction - 5) }));
        logMessage += ` Effective criticism. Public satisfaction dropped.`;
        break;
      case 'INSTITUTION':
        if (action.id === 'act_inst_congress') institutions.congress += Math.floor(5 * magnitude);
        if (action.id === 'act_inst_military') institutions.military += Math.floor(5 * magnitude);
        if (action.id === 'act_inst_courts') institutions.judiciary += Math.floor(5 * magnitude);
        logMessage += ` Institutional support grew.`;
        break;
    }
  } else {
    if (isCritFail) {
      player.stats.popularity = Math.max(0, player.stats.popularity - 5);
      logMessage += " CRITICAL FAILURE! Major gaffe committed.";
      resultType = 'CRITICAL';
    } else {
      logMessage += " Little to no effect.";
    }
  }

  // 4. Decay / Governance Reality Check (End of Turn)
  if (player.role === 'INCUMBENT') {
    if (newState.currentTurn % 3 === 0) {
      governance.economy -= 1;
      governance.services -= 1;
      governance.security -= 1;
    }
    if (governance.services < 40) player.stats.popularity -= 1;
  }

  // 5. Advance Time (Only if game not over)
  if (!newState.gameOver) {
    newState.currentTurn += 1;
    
    // Phase Transition
    if (newState.currentTurn > PRIMARY_END_TURN && newState.phase === 'PRIMARY') {
      newState.phase = 'ELECTION';
      const office = player.targetOffice;
      if (player.stats.partySupport < 40) {
         history.unshift({ turn: newState.currentTurn, message: `CONVENTION: Party support too low. You were denied the ticket for ${office}.`, type: 'CRITICAL' });
      } else {
         history.unshift({ turn: newState.currentTurn, message: `CONVENTION: You are the official nominee for ${office}!`, type: 'SUCCESS' });
      }
    }
  }

  // Energy Regen
  if (action.id !== 'act_rest' && !newState.gameOver) {
    player.stats.energy = Math.min(100, player.stats.energy + 5);
  }

  history.unshift({ turn: currentState.currentTurn, message: logMessage, type: resultType });

  newState.playerState = player;
  newState.governance = governance;
  newState.institutions = institutions;
  newState.demographics = demos;
  newState.turnHistory = history;
  
  return newState;
};