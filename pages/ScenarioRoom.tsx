import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { GameRoom, Archetype, PoliticalParty, Character } from '../types';
import { getArchetypes, getParties, generateCharacter } from '../services/dataService';
import Button from '../components/Button';
import { Icons } from '../constants';

type RoomState = 'LOBBY' | 'CHARACTER_DRAFT' | 'PARTY_SELECT' | 'READY';

const ScenarioRoom: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [viewState, setViewState] = useState<RoomState>('LOBBY');
  
  // Drafting State
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [draftedCharacter, setDraftedCharacter] = useState<Character | null>(null);
  const [selectedParty, setSelectedParty] = useState<PoliticalParty | null>(null);

  useEffect(() => {
    if (location.state?.room) {
      setRoom(location.state.room);
    }
    setArchetypes(getArchetypes());
    setParties(getParties());
  }, [location.state]);

  const handleStartSetup = () => {
    setViewState('CHARACTER_DRAFT');
  };

  const handleDraftCharacter = () => {
    if (!selectedArchetype) return;
    const newChar = generateCharacter(selectedArchetype.id);
    setDraftedCharacter(newChar);
  };

  const handleConfirmCharacter = () => {
    setViewState('PARTY_SELECT');
  };

  const handleFinalize = () => {
    setViewState('READY');
  };

  const handleStartGame = () => {
    if (room && draftedCharacter && selectedParty) {
      navigate(`/game/${room.id}`, { 
        state: { 
          room, 
          character: draftedCharacter, 
          party: selectedParty 
        } 
      });
    }
  };

  if (!room) return <div className="text-white p-8">Loading Scenario...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex justify-between items-start">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 rounded bg-amber-900/30 text-amber-500 text-xs font-bold uppercase tracking-wide">
               {room.location.city}, {room.location.state}
             </span>
             <span className="text-slate-500 text-xs">ID: {room.id}</span>
           </div>
           <h1 className="text-3xl font-serif font-bold text-white">{room.name}</h1>
           <p className="text-slate-400 max-w-2xl mt-2">{room.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400 mb-1">Status</div>
          <div className="text-xl font-bold text-green-400">{viewState === 'READY' ? 'Ready to Start' : 'Preparing'}</div>
        </div>
      </div>

      {/* Main Content Area based on State */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl min-h-[500px] p-6 relative overflow-hidden">
        
        {/* LOBBY VIEW */}
        {viewState === 'LOBBY' && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center">
              <Icons.Users className="w-10 h-10 text-slate-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Waiting Room</h2>
              <p className="text-slate-400">Waiting for players to join and set up...</p>
            </div>
            
            <div className="bg-slate-800 p-4 rounded-lg text-left max-w-md w-full space-y-2">
              <h3 className="text-sm font-bold text-slate-300 uppercase">Scenario Rules</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Location: {room.location.city}</li>
                <li>• Character Draft: {room.config.allowExistingCharacters ? 'Optional (Deck Allowed)' : 'Mandatory (New Character)'}</li>
                <li>• AI Opponents: {room.config.hasAiOpponents ? 'Yes' : 'No'}</li>
              </ul>
            </div>

            <Button size="lg" onClick={handleStartSetup} className="px-8">
              Prepare Character
            </Button>
          </div>
        )}

        {/* CHARACTER DRAFT VIEW */}
        {viewState === 'CHARACTER_DRAFT' && !draftedCharacter && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-serif font-bold text-white">Step 1: Select Archetype</h2>
               <Button variant="ghost" onClick={() => setViewState('LOBBY')}>Back</Button>
            </div>
            <p className="text-slate-400">Choose a political background. This will determine the pool of characters you can draw from.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {archetypes.map(arch => (
                <button 
                  key={arch.id}
                  onClick={() => setSelectedArchetype(arch)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedArchetype?.id === arch.id 
                    ? 'bg-amber-900/20 border-amber-500 ring-1 ring-amber-500' 
                    : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="text-3xl mb-3">{arch.icon}</div>
                  <h3 className="font-bold text-lg text-white">{arch.name}</h3>
                  <p className="text-sm text-slate-400 mt-1 mb-3 h-12">{arch.description}</p>
                  
                  <div className="space-y-1 text-xs text-slate-300 bg-slate-900/50 p-2 rounded">
                    <div className="flex justify-between"><span>Charisma</span><span className="text-white">{arch.baseStats.charisma}</span></div>
                    <div className="flex justify-between"><span>Intelligence</span><span className="text-white">{arch.baseStats.intelligence}</span></div>
                    <div className="flex justify-between"><span>Resources</span><span className="text-white">{arch.baseStats.resources}</span></div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                disabled={!selectedArchetype} 
                onClick={handleDraftCharacter}
                className="w-full md:w-auto"
              >
                Draft Character
              </Button>
            </div>
          </div>
        )}

        {/* CHARACTER REVEAL */}
        {viewState === 'CHARACTER_DRAFT' && draftedCharacter && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 animate-fade-in">
             <h2 className="text-2xl font-serif font-bold text-amber-500">Character Drafted!</h2>
             
             <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-1 rounded-2xl shadow-2xl border border-amber-500/50 max-w-sm w-full">
               <div className="bg-slate-950 p-6 rounded-xl text-center space-y-4">
                 <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full border-2 border-slate-700 overflow-hidden">
                   <img src={`https://ui-avatars.com/api/?name=${draftedCharacter.name}&background=random`} alt="Char" className="w-full h-full object-cover" />
                 </div>
                 
                 <div>
                   <h3 className="text-2xl font-bold text-white">{draftedCharacter.name}</h3>
                   <div className="flex items-center justify-center gap-2 text-amber-500 text-sm font-medium">
                     <span>{archetypes.find(a => a.id === draftedCharacter.archetypeId)?.name}</span>
                     <span>•</span>
                     <span>Lvl 1</span>
                   </div>
                 </div>

                 <p className="text-slate-400 text-sm italic">"{draftedCharacter.flavourText}"</p>

                 <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-slate-800">
                    <div className="text-center">
                      <div className="text-xs text-slate-500 uppercase">CHA</div>
                      <div className="text-lg font-mono font-bold text-white">{draftedCharacter.stats.charisma}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500 uppercase">INT</div>
                      <div className="text-lg font-mono font-bold text-white">{draftedCharacter.stats.intelligence}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500 uppercase">RES</div>
                      <div className="text-lg font-mono font-bold text-white">{draftedCharacter.stats.resources}</div>
                    </div>
                 </div>
               </div>
             </div>

             <div className="text-slate-400 text-sm">
               This character has been added to your permanent deck.
             </div>

             <Button onClick={handleConfirmCharacter} className="px-8">Continue to Party Selection</Button>
          </div>
        )}

        {/* PARTY SELECTION */}
        {viewState === 'PARTY_SELECT' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-serif font-bold text-white">Step 2: Select Party</h2>
               <div className="flex items-center gap-3">
                 <span className="text-sm text-slate-400">Playing as: <strong className="text-white">{draftedCharacter?.name}</strong></span>
               </div>
            </div>
            <p className="text-slate-400">Choose a political party to affiliate with. Consider the synergies with your character stats.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parties.map(party => (
                <button 
                  key={party.id}
                  onClick={() => setSelectedParty(party)}
                  className={`relative p-4 rounded-xl border text-left transition-all overflow-hidden ${
                    selectedParty?.id === party.id 
                    ? 'bg-slate-800 border-white ring-1 ring-white' 
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-xl opacity-20 ${party.color}`}></div>
                  
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <h3 className="font-bold text-lg text-white">{party.name} <span className="text-slate-500 text-sm">({party.acronym})</span></h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-slate-600 bg-slate-950 text-slate-300`}>
                      {party.spectrum}
                    </span>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <div className="text-xs space-y-1">
                      {party.bonuses.map((b, i) => (
                        <div key={i} className="text-green-400 flex items-start gap-1">
                          <span>+</span> {b}
                        </div>
                      ))}
                      {party.maluses.map((m, i) => (
                        <div key={i} className="text-red-400 flex items-start gap-1">
                          <span>-</span> {m}
                        </div>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                disabled={!selectedParty} 
                onClick={handleFinalize}
                className="w-full md:w-auto"
              >
                Join Scenario
              </Button>
            </div>
          </div>
        )}

        {/* READY VIEW */}
        {viewState === 'READY' && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 text-center animate-fade-in">
             <div className="w-20 h-20 bg-green-900/30 text-green-500 rounded-full flex items-center justify-center border border-green-500/50">
                <Icons.Award className="w-10 h-10" />
             </div>
             <div>
               <h2 className="text-3xl font-serif font-bold text-white">You are Ready</h2>
               <p className="text-slate-400 max-w-md mx-auto mt-2">
                 The campaign trail awaits. Make your decisions wisely.
               </p>
             </div>

             <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-lg">
                <div className="flex items-center gap-4">
                  <img src={`https://ui-avatars.com/api/?name=${draftedCharacter?.name}`} className="w-16 h-16 rounded-lg bg-slate-700" alt="" />
                  <div className="text-left flex-1">
                    <div className="text-xl font-bold text-white">{draftedCharacter?.name}</div>
                    <div className="text-sm text-slate-400">{selectedArchetype?.name}</div>
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded bg-slate-900 border border-slate-600 text-xs text-slate-300">
                      {selectedParty?.acronym} - {selectedParty?.name}
                    </div>
                  </div>
                  <div className="text-right space-y-1 text-xs font-mono text-slate-500">
                    <div>CHA: <span className="text-white">{draftedCharacter?.stats.charisma}</span></div>
                    <div>INT: <span className="text-white">{draftedCharacter?.stats.intelligence}</span></div>
                    <div>RES: <span className="text-white">{draftedCharacter?.stats.resources}</span></div>
                  </div>
                </div>
             </div>

             <div className="flex gap-4">
               <Button variant="outline" onClick={() => setViewState('LOBBY')}>Change Setup</Button>
               <Button onClick={handleStartGame}>Enter Game Session</Button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ScenarioRoom;