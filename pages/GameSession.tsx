import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { GameSessionState, GameAction, Issue, Proposal, Character, PoliticalParty, DemographicGroup } from '../types';
import { initializeGame, processTurn, getAvailableActions, getIssues, getProposals, updatePlatform, startNextSeason } from '../services/gameService';
import { saveGameSession, getGameSession } from '../services/firestoreService';
import Button from '../components/Button';
import { Icons } from '../constants';

const GameSession: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameSessionState | null>(null);
  const [activeTab, setActiveTab] = useState<'ACTIONS' | 'PLATFORM' | 'DEMOGRAPHICS' | 'GOVERNANCE'>('ACTIONS');

  // Platform UI State
  const [availableIssues, setAvailableIssues] = useState<Issue[]>([]);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  // Initialize Game on Mount
  useEffect(() => {
    if (!location.state?.room) return;

    const loadGame = async () => {
      const roomId = location.state.room.id;

      // Try to load existing session
      try {
        const existingSession = await getGameSession(roomId);
        if (existingSession) {
          setGameState(existingSession);
        } else {
          // New Game
          if (!location.state.character || !location.state.party) return; // Should handle error
          const { room, character, party } = location.state;
          const initial = initializeGame(room, character, party);
          await saveGameSession(initial);
          setGameState(initial);
        }
      } catch (error) {
        console.error("Failed to load/init game:", error);
      }
      setAvailableIssues(getIssues());
    };

    loadGame();
  }, [location.state]);

  const updateGameState = async (newState: GameSessionState) => {
    setGameState(newState);
    try {
      await saveGameSession(newState);
    } catch (error) {
      console.error("Failed to save game state:", error);
    }
  };

  if (!location.state?.room) return <Navigate to="/" />;
  if (!gameState) return <div className="text-white p-8">Initializing Campaign...</div>;

  const handleAction = (action: GameAction) => {
    const newState = processTurn(gameState, action);
    updateGameState(newState);
  };

  const toggleAgendaItem = (issueId: string) => {
    const currentAgenda = gameState.playerState.agenda;
    let newAgenda;
    if (currentAgenda.includes(issueId)) {
      newAgenda = currentAgenda.filter(id => id !== issueId);
    } else {
      if (currentAgenda.length >= 3) {
        alert("You can only focus on 3 key agenda items at a time.");
        return;
      }
      newAgenda = [...currentAgenda, issueId];
    }
    updateGameState(updatePlatform(gameState, newAgenda, gameState.playerState.program));
  };

  const toggleProposal = (proposalId: string) => {
    const currentProgram = gameState.playerState.program;
    let newProgram;
    if (currentProgram.includes(proposalId)) {
      newProgram = currentProgram.filter(id => id !== proposalId);
    } else {
      // Cost check could go here
      newProgram = [...currentProgram, proposalId];
    }
    updateGameState(updatePlatform(gameState, gameState.playerState.agenda, newProgram));
  };

  const handleEndSeason = (won: boolean) => {
    // Trigger Season 2 Transition
    const nextSeasonState = startNextSeason(gameState, won);
    updateGameState(nextSeasonState);
  };

  const currentYear = Math.ceil(gameState.currentTurn / 12);
  const currentMonth = ((gameState.currentTurn - 1) % 12) + 1;
  const isIncumbent = gameState.playerState.role === 'INCUMBENT';
  const victoryType = gameState.victoryConfig.type;

  // Render Game Over Modal
  if (gameState.gameOver) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="bg-slate-900 border-2 border-amber-600 rounded-xl max-w-lg w-full p-8 text-center shadow-2xl animate-fade-in">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${gameState.winner ? 'bg-green-900/50 text-green-500' : 'bg-red-900/50 text-red-500'}`}>
            <Icons.Award className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-white mb-2">{gameState.winner ? 'VICTORY' : 'GAME OVER'}</h1>
          <p className="text-slate-400 mb-8">
            {gameState.winner
              ? "You have achieved your political ambitions and etched your name in history."
              : "Your political career has come to an end. History will not remember this failure."
            }
          </p>
          <Button onClick={() => navigate('/')} size="lg" fullWidth>Return to Menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] grid grid-cols-12 gap-6 p-4">

      {/* LEFT COLUMN: STATS */}
      <div className="col-span-3 space-y-4 overflow-y-auto pr-2">
        {/* Date & Phase */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">Season {gameState.playerState.season}</span>
            <span className="text-xs font-bold text-amber-500 uppercase">{gameState.playerState.sphere}</span>
          </div>
          <div className="text-sm text-slate-400 uppercase tracking-widest">Year {currentYear} • Month {currentMonth}</div>
          <div className="text-2xl font-serif font-bold text-amber-500 mt-1">
            {gameState.phase === 'PRIMARY' ? 'Cycle Building' : 'Election Campaign'}
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3">
            <div className="bg-amber-600 h-2 rounded-full transition-all duration-500" style={{ width: `${(gameState.currentTurn / gameState.maxTurns) * 100}%` }}></div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Objective: <span className="text-slate-300 font-bold">{victoryType}</span>
            {victoryType !== 'DICTATOR' && <span className="ml-1">({gameState.victoryConfig.value})</span>}
          </div>
          {gameState.currentTurn >= gameState.maxTurns && (
            <div className="mt-4 flex flex-col gap-2 animate-bounce">
              <Button onClick={() => handleEndSeason(true)} className="bg-green-600 hover:bg-green-700 w-full">Win Election (Dev Skip)</Button>
              <Button onClick={() => handleEndSeason(false)} variant="secondary" className="w-full">Lose Election (Dev Skip)</Button>
            </div>
          )}
        </div>

        {/* Player Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
          {isIncumbent && <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded-bl">INCUMBENT</div>}
          <div className="flex items-center gap-3 mb-4">
            <img src={`https://ui-avatars.com/api/?name=${gameState.playerState.character.name}&background=random`} className="w-12 h-12 rounded-full" alt="" />
            <div>
              <div className="font-bold text-white">{gameState.playerState.character.name}</div>
              <div className="text-xs text-slate-400">{gameState.playerState.party.name}</div>
              <div className="text-[10px] text-slate-500 uppercase mt-1">{gameState.playerState.role}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Popularity</span>
                <span className="text-white font-bold">{gameState.playerState.stats.popularity}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${gameState.playerState.stats.popularity}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Party Support</span>
                <span className="text-white font-bold">{gameState.playerState.stats.partySupport}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${gameState.playerState.stats.partySupport}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-slate-950 p-2 rounded text-center border border-slate-800">
                <div className="text-xs text-slate-500 uppercase">Funds</div>
                <div className="font-mono text-amber-400 font-bold">${gameState.playerState.stats.funds}k</div>
              </div>
              <div className="bg-slate-950 p-2 rounded text-center border border-slate-800">
                <div className="text-xs text-slate-500 uppercase">Energy</div>
                <div className="font-mono text-blue-400 font-bold">{gameState.playerState.stats.energy}/100</div>
              </div>
            </div>
          </div>
        </div>

        {/* Turn History */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Event Log</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto text-sm">
            {gameState.turnHistory.map((event, i) => (
              <div key={i} className={`pb-2 border-b border-slate-800 last:border-0 ${event.type === 'CRITICAL' ? 'text-red-400 font-bold' :
                  event.type === 'SUCCESS' ? 'text-green-400' :
                    event.type === 'FAILURE' ? 'text-slate-500' : 'text-slate-300'
                }`}>
                <span className="text-xs opacity-50 mr-2">[T{event.turn}]</span>
                {event.message}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: ACTION AREA */}
      <div className="col-span-9 flex flex-col space-y-4">

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 w-fit">
          {(['ACTIONS', 'PLATFORM', 'DEMOGRAPHICS', 'GOVERNANCE'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* ACTION TAB */}
        {activeTab === 'ACTIONS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {getAvailableActions(gameState.playerState.role, victoryType).map(action => (
              <button
                key={action.id}
                disabled={
                  (action.cost.funds && gameState.playerState.stats.funds < action.cost.funds) ||
                  (action.cost.energy && gameState.playerState.stats.energy < action.cost.energy) ||
                  (action.cost.budget && gameState.governance.budget < action.cost.budget)
                }
                onClick={() => handleAction(action)}
                className={`bg-slate-900 border border-slate-800 p-5 rounded-xl text-left hover:border-amber-600 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden ${action.type === 'GOVERNANCE' ? 'ring-1 ring-amber-500/30' :
                    action.type === 'INSTITUTION' ? 'ring-1 ring-red-500/30 bg-red-950/20' : ''
                  }`}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${action.type === 'CAMPAIGN' ? 'bg-amber-900/50 text-amber-400' :
                        action.type === 'GOVERNANCE' ? 'bg-green-900/50 text-green-400' :
                          action.type === 'ATTACK' ? 'bg-red-900/50 text-red-400' :
                            action.type === 'INSTITUTION' ? 'bg-slate-700 text-white border border-slate-500' :
                              'bg-slate-700 text-slate-300'
                      }`}>
                      {action.type}
                    </span>
                    <div className="flex flex-col items-end text-xs font-mono text-slate-400">
                      {action.cost.funds && <span>${action.cost.funds}k</span>}
                      {action.cost.budget && <span className="text-green-500">PUB: ${action.cost.budget}k</span>}
                      {action.cost.energy && <span>{action.cost.energy} NRG</span>}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors">{action.name}</h3>
                  <p className="text-sm text-slate-400 mt-1 mb-4 h-10">{action.description}</p>

                  <div className="text-xs text-slate-500 flex items-center gap-1 bg-slate-950/50 p-2 rounded">
                    <span>Check: {action.statModifier.toUpperCase()}</span>
                    <span>•</span>
                    <span>DC {action.difficulty}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* PLATFORM TAB */}
        {activeTab === 'PLATFORM' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-fade-in h-full overflow-y-auto">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white">Political Agenda</h2>
                <p className="text-slate-400 text-sm">Select up to 3 key issues for your agenda, then define your specific proposals.</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-slate-400">Agenda Capacity</span>
                <div className="font-mono text-xl text-amber-500 font-bold">{gameState.playerState.agenda.length} / 3</div>
              </div>
            </div>

            <div className="space-y-4">
              {availableIssues.map(issue => {
                const isSelected = gameState.playerState.agenda.includes(issue.id);
                const proposals = getProposals(issue.id);
                const activeProposals = proposals.filter(p => gameState.playerState.program.includes(p.id));

                return (
                  <div key={issue.id} className={`border rounded-lg transition-all ${isSelected ? 'border-amber-600 bg-slate-800/30' : 'border-slate-700 bg-slate-900'}`}>
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleAgendaItem(issue.id)}
                          className="w-5 h-5 rounded border-slate-600 text-amber-600 focus:ring-amber-500 bg-slate-800"
                        />
                        <div onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)} className="cursor-pointer">
                          <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-slate-400'}`}>{issue.name}</h3>
                          <p className="text-sm text-slate-500">{issue.description}</p>
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        {activeProposals.length} Proposals Active
                      </div>
                    </div>

                    {(expandedIssue === issue.id || isSelected) && (
                      <div className="px-4 pb-4 pl-12 space-y-2 border-t border-slate-800 pt-4">
                        <p className="text-xs font-bold text-slate-400 uppercase">Available Proposals</p>
                        {proposals.map(prop => (
                          <div key={prop.id} className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                disabled={!isSelected}
                                checked={gameState.playerState.program.includes(prop.id)}
                                onChange={() => toggleProposal(prop.id)}
                                className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-800 disabled:opacity-50"
                              />
                              <span className={`text-sm ${gameState.playerState.program.includes(prop.id) ? 'text-white' : 'text-slate-400'}`}>{prop.name}</span>
                            </div>
                            <span className="text-xs font-mono text-amber-500">Cost: {prop.cost}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DEMOGRAPHICS TAB */}
        {activeTab === 'DEMOGRAPHICS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-fade-in h-full">
            <h2 className="text-2xl font-serif font-bold text-white mb-6">Voter Analysis</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gameState.demographics.map(group => (
                <div key={group.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white">{group.name}</h3>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">Size: {group.size}%</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Political Support</span>
                      <span>{group.support}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mb-2">
                      <div
                        className={`h-1.5 rounded-full ${group.support > 50 ? 'bg-green-500' : group.support > 25 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${group.support}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Reality Satisfaction</span>
                      <span>{group.satisfaction}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full">
                      <div
                        className={`h-1.5 rounded-full ${group.satisfaction > 60 ? 'bg-blue-400' : 'bg-slate-600'}`}
                        style={{ width: `${group.satisfaction}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase">Key Demands</p>
                    <div className="flex flex-wrap gap-1">
                      {group.demands.map(demandId => {
                        const issue = availableIssues.find(i => i.id === demandId);
                        const isAddressed = gameState.playerState.agenda.includes(demandId);
                        return (
                          <span key={demandId} className={`text-[10px] px-1.5 py-0.5 rounded border ${isAddressed
                              ? 'bg-green-900/30 border-green-700 text-green-400'
                              : 'bg-slate-900 border-slate-700 text-slate-500'
                            }`}>
                            {issue?.name || demandId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GOVERNANCE TAB (New for Season 2) */}
        {activeTab === 'GOVERNANCE' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-fade-in h-full overflow-y-auto">
            <h2 className="text-2xl font-serif font-bold text-white mb-2">City Administration</h2>
            <p className="text-slate-400 mb-6">Manage the reality of the city. Low stats here will anger the population.</p>

            {/* Dictator Mechanics */}
            {victoryType === 'DICTATOR' && (
              <div className="mb-8 p-4 bg-red-950/20 rounded-xl border border-red-900/50">
                <h3 className="text-red-400 font-bold mb-4 uppercase text-sm tracking-widest flex items-center gap-2">
                  <Icons.Lock className="w-4 h-4" /> State of Exception Progress
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-slate-400 uppercase">Congress</div>
                    <div className="text-2xl font-mono text-white font-bold">{gameState.institutions.congress}%</div>
                    <div className="text-[10px] text-slate-500">Target: 60%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase">Judiciary</div>
                    <div className="text-2xl font-mono text-white font-bold">{gameState.institutions.judiciary}%</div>
                    <div className="text-[10px] text-slate-500">Target: 60%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase">Military</div>
                    <div className="text-2xl font-mono text-white font-bold">{gameState.institutions.military}%</div>
                    <div className="text-[10px] text-slate-500">Target: 70%</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Public Budget */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center">
                <div className="text-slate-400 uppercase text-sm font-bold tracking-widest mb-2">Public Treasury</div>
                <div className="text-4xl font-mono text-green-500 font-bold">${gameState.governance.budget}k</div>
                <p className="text-xs text-slate-500 mt-2">Used for Public Works projects (Action)</p>
              </div>

              {/* Reality Stats */}
              <div className="space-y-4">
                {[
                  { label: 'Economy', val: gameState.governance.economy, icon: '📈' },
                  { label: 'Public Services', val: gameState.governance.services, icon: '🏥' },
                  { label: 'Security', val: gameState.governance.security, icon: '👮' }
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-bold flex items-center gap-2">{stat.icon} {stat.label}</span>
                      <span className={`font-mono font-bold ${stat.val > 50 ? 'text-green-400' : 'text-red-400'}`}>{stat.val}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className={`h-full ${stat.val > 60 ? 'bg-green-500' : stat.val > 30 ? 'bg-amber-500' : 'bg-red-600'}`} style={{ width: `${stat.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 p-4 bg-slate-950 rounded-lg border border-slate-800">
              <h3 className="text-white font-bold mb-2">Incumbent Status</h3>
              <div className="flex items-center gap-4">
                <div className="bg-slate-800 px-4 py-2 rounded">
                  <span className="text-slate-400 text-xs uppercase block">Coherence</span>
                  <span className="text-white font-mono">{gameState.playerState.stats.coherence}%</span>
                </div>
                <p className="text-sm text-slate-400 flex-1">
                  High coherence means your Agenda matches your Actions. Low coherence reduces trust over time.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GameSession;