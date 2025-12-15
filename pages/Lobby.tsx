import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameRoom, VictoryType } from '../types';
import { createGameRoom, subscribeToRooms } from '../services/firestoreService'; // Updated import
import Button from '../components/Button';
import Input from '../components/Input';
import { Icons } from '../constants';

const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Create Room Form State
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationState, setLocationState] = useState('');
  const [hasAi, setHasAi] = useState(false);
  const [allowExisting, setAllowExisting] = useState(false);
  const [isOpenToJoin, setIsOpenToJoin] = useState(true);
  const [victoryType, setVictoryType] = useState<VictoryType>('OFFICE');
  const [victoryValue, setVictoryValue] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToRooms((updatedRooms) => {
      setRooms(updatedRooms);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName || !locationCity || !locationState) return;

    setIsSubmitting(true);
    const newRoom: GameRoom = {
      id: Math.random().toString(36).substr(2, 9),
      name: newRoomName,
      description: newRoomDesc || 'A new political battleground.',
      players: 1,
      maxPlayers: 4,
      status: 'WAITING',
      tags: ['Custom', locationState],
      host: 'You', // TODO: Use real user name
      location: {
        city: locationCity,
        state: locationState,
        country: 'Brazil'
      },
      config: {
        allowExistingCharacters: allowExisting,
        hasAiOpponents: hasAi,
        isOpenToJoin: isOpenToJoin,
        victory: {
          type: victoryType,
          value: victoryValue
        }
      }
    };

    try {
      await createGameRoom(newRoom);
      setIsCreating(false);
      navigate(`/room/${newRoom.id}`, { state: { room: newRoom } });
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = (room: GameRoom) => {
    navigate(`/room/${room.id}`, { state: { room } });
  };

  return (
    <div className="space-y-6">

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">Political Scenarios</h1>
          <p className="text-sm text-slate-400">Join a lobby or create your own simulation.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="flex items-center gap-2">
          <Icons.Plus className="w-4 h-4" /> Create Scenario
        </Button>
      </div>

      {/* Create Room Modal/Expandable */}
      {isCreating && (
        <div className="bg-slate-800 border border-amber-600/30 p-6 rounded-xl animate-fade-in shadow-2xl">
          <h2 className="text-xl font-bold mb-4 text-amber-500 flex items-center gap-2">
            <Icons.Map className="w-5 h-5" /> Draft New Scenario
          </h2>
          <form onSubmit={handleCreateRoom} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Scenario Details</h3>
                <Input
                  label="Scenario Name"
                  placeholder="e.g. The 2028 Crisis"
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    rows={3}
                    placeholder="Describe the political context..."
                    value={newRoomDesc}
                    onChange={e => setNewRoomDesc(e.target.value)}
                  />
                </div>
              </div>

              {/* Location & Rules */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Location & Rules</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    placeholder="e.g. Rio de Janeiro"
                    value={locationCity}
                    onChange={e => setLocationCity(e.target.value)}
                    required
                  />
                  <Input
                    label="State"
                    placeholder="e.g. RJ"
                    value={locationState}
                    onChange={e => setLocationState(e.target.value)}
                    required
                  />
                </div>

                {/* Victory Conditions */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3">
                  <label className="block text-sm font-medium text-slate-300">Victory Condition</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={victoryType}
                    onChange={(e) => setVictoryType(e.target.value as VictoryType)}
                  >
                    <option value="OFFICE">Target Office (Race)</option>
                    <option value="CYCLES">Turn Limit (Score)</option>
                    <option value="DICTATOR">Dictator (Absolute Power)</option>
                  </select>

                  {victoryType === 'OFFICE' && (
                    <div className="text-sm text-slate-400">First to reach elected office level. (1=Mayor, 2=State, 3=Fed)</div>
                  )}
                  {victoryType === 'CYCLES' && (
                    <div className="text-sm text-slate-400">Accumulate most influence after X election cycles.</div>
                  )}
                  {victoryType === 'DICTATOR' && (
                    <div className="text-sm text-slate-400">Pass the State of Exception Act. Requires immense institutional support.</div>
                  )}

                  {victoryType !== 'DICTATOR' && (
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      label={victoryType === 'OFFICE' ? 'Target Sphere Level' : 'Number of Cycles'}
                      value={victoryValue}
                      onChange={e => setVictoryValue(parseInt(e.target.value))}
                    />
                  )}
                </div>

                <div className="space-y-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-amber-600 rounded border-slate-600 bg-slate-800 focus:ring-amber-500"
                      checked={hasAi}
                      onChange={e => setHasAi(e.target.checked)}
                    />
                    <span className="text-slate-300 text-sm">Include AI Opponents</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-amber-600 rounded border-slate-600 bg-slate-800 focus:ring-amber-500"
                      checked={allowExisting}
                      onChange={e => setAllowExisting(e.target.checked)}
                    />
                    <span className="text-slate-300 text-sm">Allow Existing Deck Characters</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Publishing...' : 'Publish Scenario'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.length === 0 ? (
          <div className="col-span-3 text-center text-slate-500 py-10">
            No active scenarios found. Create one to start!
          </div>
        ) : rooms.map(room => (
          <div key={room.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all group relative flex flex-col">

            <div className="p-6 space-y-4 flex-1">
              <div className="flex justify-between items-start">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${room.status === 'WAITING' ? 'bg-green-900/50 text-green-400' :
                    room.status === 'IN_PROGRESS' ? 'bg-amber-900/50 text-amber-400' :
                      'bg-slate-800 text-slate-500'
                  }`}>
                  {room.status === 'WAITING' ? 'Recruiting' : 'In Session'}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Icons.Users className="w-3 h-3" /> {room.players}/{room.maxPlayers}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold text-slate-100 group-hover:text-amber-500 transition-colors">{room.name}</h3>
                <p className="text-xs text-amber-500 mb-2 uppercase tracking-wide">
                  {room.location.city}, {room.location.state}
                </p>
                <p className="text-sm text-slate-400 line-clamp-2">{room.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] uppercase tracking-wider bg-amber-900/30 text-amber-300 px-2 py-1 rounded border border-amber-900">
                  {room.config.victory.type}
                </span>
                {room.tags.map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-500">Host: {room.host}</span>
              <Button size="sm" variant={room.status === 'WAITING' ? 'primary' : 'secondary'} onClick={() => handleJoin(room)}>
                {room.status === 'WAITING' ? 'Join Lobby' : 'Spectate'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lobby;