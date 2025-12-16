
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole, NewsItem, GameRoom, PoliticalParty, Archetype } from '../types';
import Button from '../components/Button';
import { Icons } from '../constants';
import { ECONOMIC_STANCES, SOCIAL_STANCES, ARCHETYPE_BACKGROUNDS } from '../constants/traits';
import {
    getAllUsers, updateUserRole,
    addNews, deleteNews, getLiveNews,
    subscribeToRooms, deleteGameRoom,
    getParties, addParty, deleteParty,
    getArchetypes, addArchetype, deleteArchetype
} from '../services/firestoreService';

interface AdminDashboardProps {
    user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'NEWS' | 'SCENARIOS' | 'CONTENT'>('OVERVIEW');
    const [users, setUsers] = useState<User[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [rooms, setRooms] = useState<GameRoom[]>([]);
    const [parties, setParties] = useState<PoliticalParty[]>([]);
    const [archetypes, setArchetypes] = useState<Archetype[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [newsForm, setNewsForm] = useState<Partial<NewsItem>>({
        headline: '',
        preview: '',
        category: 'POLITICS',
        date: new Date().toISOString().split('T')[0]
    });

    const [partyForm, setPartyForm] = useState<Partial<PoliticalParty> & { economicStance: string, socialStance: string }>({
        name: '',
        acronym: '',
        economicStance: 'CENTR_ECON',
        socialStance: 'MODERATE',
        color: '#334155'
    });

    const [archetypeForm, setArchetypeForm] = useState<Partial<Archetype> & { background: string }>({
        name: '',
        description: '',
        icon: '👤',
        background: 'OUTSIDER'
    });

    useEffect(() => {
        if (activeTab === 'USERS') {
            loadUsers();
        } else if (activeTab === 'NEWS') {
            const unsubscribe = getLiveNews((items) => {
                setNews(items);
            });
            return () => unsubscribe();
        } else if (activeTab === 'SCENARIOS') {
            const unsubscribe = subscribeToRooms((fetchedRooms) => {
                setRooms(fetchedRooms);
            });
            return () => unsubscribe();
        } else if (activeTab === 'CONTENT') {
            const unsubParties = getParties(setParties);
            const unsubArchs = getArchetypes(setArchetypes);
            return () => { unsubParties(); unsubArchs(); };
        }
    }, [activeTab]);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const fetchedUsers = await getAllUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
        try {
            await updateUserRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Failed to update role:", error);
            alert("Failed to update role.");
        }
    };

    const handleAddNews = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newsForm.headline || !newsForm.preview) return;

        try {
            await addNews(newsForm as Omit<NewsItem, 'id'>);
            setNewsForm({
                headline: '',
                preview: '',
                category: 'POLITICS',
                date: new Date().toISOString().split('T')[0]
            });
            alert('News added!');
        } catch (error) {
            console.error("Error adding news:", error);
        }
    };

    const handleDeleteNews = async (id: string) => {
        if (!window.confirm("Delete this news item?")) return;
        try {
            await deleteNews(id);
        } catch (error) {
            console.error("Error deleting news:", error);
        }
    };

    const handleDeleteRoom = async (roomId: string) => {
        if (!window.confirm("Are you sure you want to delete this scenario? This action cannot be undone.")) return;
        try {
            await deleteGameRoom(roomId);
        } catch (error) {
            console.error("Error deleting room:", error);
            alert("Failed to delete room.");
        }
    };

    const handleDeleteParty = async (id: string) => {
        if (!window.confirm("Delete party?")) return;
        await deleteParty(id);
    };

    const handleDeleteArchetype = async (id: string) => {
        if (!window.confirm("Delete archetype?")) return;
        await deleteArchetype(id);
    };

    const handleAddParty = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!partyForm.name || !partyForm.acronym) return;

        const eco = ECONOMIC_STANCES[partyForm.economicStance as keyof typeof ECONOMIC_STANCES];
        const soc = SOCIAL_STANCES[partyForm.socialStance as keyof typeof SOCIAL_STANCES];

        const newParty: PoliticalParty = {
            id: 'party_' + Date.now(),
            name: partyForm.name!,
            acronym: partyForm.acronym!,
            economicStance: partyForm.economicStance as any,
            socialStance: partyForm.socialStance as any,
            color: partyForm.color!,
            bonuses: [eco.bonus, soc.bonus],
            maluses: [eco.malus, soc.malus]
        };

        try {
            await addParty(newParty);
            setPartyForm({ name: '', acronym: '', economicStance: 'CENTR_ECON', socialStance: 'MODERATE', color: '#334155' });
            alert("Party added!");
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddArchetype = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!archetypeForm.name) return;

        const bg = ARCHETYPE_BACKGROUNDS[archetypeForm.background as keyof typeof ARCHETYPE_BACKGROUNDS];

        const newArchetype: Archetype = {
            id: 'arch_' + Date.now(),
            name: archetypeForm.name!,
            description: archetypeForm.description || bg.description,
            icon: archetypeForm.icon!,
            background: archetypeForm.background as any,
            baseStats: bg.stats || { charisma: 5, intelligence: 5, resources: 5 } // Fallback
        };

        try {
            await addArchetype(newArchetype);
            setArchetypeForm({ name: '', description: '', icon: '👤', background: 'OUTSIDER' });
            alert("Archetype added!");
        } catch (err) {
            console.error(err);
        }
    };

    if (user.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
                <p className="text-slate-400">You do not have permission to view this page.</p>
                <Button onClick={() => navigate('/')} className="mt-6">Return Home</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-amber-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-amber-500 mb-2">Admin Dashboard</h1>
                    <p className="text-slate-400">Manage global game settings, users, and content.</p>
                </div>
                <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
                    <Button variant={activeTab === 'OVERVIEW' ? 'primary' : 'ghost'} onClick={() => setActiveTab('OVERVIEW')}>Overview</Button>
                    <Button variant={activeTab === 'USERS' ? 'primary' : 'ghost'} onClick={() => setActiveTab('USERS')}>Users</Button>
                    <Button variant={activeTab === 'NEWS' ? 'primary' : 'ghost'} onClick={() => setActiveTab('NEWS')}>News</Button>
                    <Button variant={activeTab === 'SCENARIOS' ? 'primary' : 'ghost'} onClick={() => setActiveTab('SCENARIOS')}>Scenarios</Button>
                    <Button variant={activeTab === 'CONTENT' ? 'primary' : 'ghost'} onClick={() => setActiveTab('CONTENT')}>Content</Button>
                </div>
            </div>

            {activeTab === 'OVERVIEW' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* User Management */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 cursor-pointer hover:border-amber-500 transition-colors" onClick={() => setActiveTab('USERS')}>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Icons.Users className="w-5 h-5 text-amber-500" /> Users & Roles
                        </h2>
                        <p className="text-sm text-slate-400 mb-4">Manage {users.length > 0 ? users.length : 'registered'} users.</p>
                        <Button fullWidth variant="outline">Manage Users</Button>
                    </div>

                    {/* News Management */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 cursor-pointer hover:border-amber-500 transition-colors" onClick={() => setActiveTab('NEWS')}>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Icons.Briefcase className="w-5 h-5 text-amber-500" /> News Feed
                        </h2>
                        <p className="text-sm text-slate-400 mb-4">Post global updates and events.</p>
                        <Button fullWidth variant="outline">Manage News</Button>
                    </div>

                    {/* Scenario Management */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 cursor-pointer hover:border-amber-500 transition-colors" onClick={() => setActiveTab('SCENARIOS')}>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Icons.Map className="w-5 h-5 text-amber-500" /> Scenarios
                        </h2>
                        <p className="text-sm text-slate-400 mb-4">Manage active game rooms.</p>
                        <Button fullWidth variant="outline">Manage Scenarios</Button>
                    </div>

                    {/* Game Content */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 cursor-pointer hover:border-amber-500 transition-colors" onClick={() => setActiveTab('CONTENT')}>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Icons.Map className="w-5 h-5 text-amber-500" /> Content Management
                        </h2>
                        <p className="text-sm text-slate-400 mb-4">Edit parties, archetypes, and game data.</p>
                        <Button fullWidth variant="outline">Manage Content</Button>
                    </div>
                </div>
            )}

            {activeTab === 'USERS' && (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">User Management</h2>
                        <Button size="sm" variant="ghost" onClick={loadUsers}><Icons.Cloud className="w-4 h-4" /></Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-900 text-slate-200 uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {isLoading ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center">Loading users...</td></tr>
                                ) : users.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-700/50">
                                        <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-600 overflow-hidden">
                                                {u.avatarUrl ? <img src={u.avatarUrl} alt="" /> : <Icons.User className="w-full h-full p-1" />}
                                            </div>
                                            {u.username}
                                            {u.id === user.id && <span className="text-xs bg-amber-900 text-amber-300 px-1 rounded ml-1">YOU</span>}
                                        </td>
                                        <td className="px-6 py-4">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <select
                                                className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white focus:border-amber-500 outline-none"
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                                                disabled={u.id === user.id} // Prevent self-demotion lockout
                                            >
                                                <option value="PLAYER">PLAYER</option>
                                                <option value="MANAGER">MANAGER</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4"> - </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'NEWS' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ... (keep news content) ... */}
                    {/* Create News Form */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
                        <h2 className="text-xl font-bold text-white mb-4">Publish News</h2>
                        <form onSubmit={handleAddNews} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Headline</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                                    value={newsForm.headline}
                                    onChange={e => setNewsForm({ ...newsForm, headline: e.target.value })}
                                    placeholder="E.g., Economic Crisis Looms"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Preview Text</label>
                                <textarea
                                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:border-amber-500 outline-none h-24"
                                    value={newsForm.preview}
                                    onChange={e => setNewsForm({ ...newsForm, preview: e.target.value })}
                                    placeholder="Brief summary..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                                        value={newsForm.category}
                                        onChange={e => setNewsForm({ ...newsForm, category: e.target.value as any })}
                                    >
                                        <option value="POLITICS">Politics</option>
                                        <option value="ECONOMY">Economy</option>
                                        <option value="SCANDAL">Scandal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:border-amber-500 outline-none"
                                        value={newsForm.date}
                                        onChange={e => setNewsForm({ ...newsForm, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button type="submit" fullWidth>Publish News</Button>
                        </form>
                    </div>

                    {/* News List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">Active News ({news.length})</h2>
                        <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2">
                            {news.map(item => (
                                <div key={item.id} className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex justify-between gap-4 group hover:border-slate-600">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.category === 'SCANDAL' ? 'bg-red-900/50 text-red-400' :
                                                item.category === 'ECONOMY' ? 'bg-blue-900/50 text-blue-400' :
                                                    'bg-slate-800 text-slate-400'
                                                }`}>
                                                {item.category}
                                            </span>
                                            <span className="text-xs text-slate-500">{item.date}</span>
                                        </div>
                                        <h3 className="font-bold text-white">{item.headline}</h3>
                                        <p className="text-xs text-slate-400 line-clamp-2">{item.preview}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteNews(item.id)}
                                        className="text-slate-500 hover:text-red-500 self-start p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete News"
                                    >
                                        <Icons.LogOut className="w-4 h-4" /> {/* Using LogOut as trash icon temporarily if Trash not available */}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'SCENARIOS' && (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Scenario Management</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-900 text-slate-200 uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-3">Room Name</th>
                                    <th className="px-6 py-3">Host</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Players</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {rooms.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center">No active scenarios found.</td></tr>
                                ) : rooms.map(room => (
                                    <tr key={room.id} className="hover:bg-slate-700/50">
                                        <td className="px-6 py-4 font-medium text-white">
                                            {room.name}
                                            <div className="text-xs text-slate-500">{room.id}</div>
                                        </td>
                                        <td className="px-6 py-4">{room.host}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${room.status === 'WAITING' ? 'bg-amber-900/50 text-amber-500' :
                                                room.status === 'IN_PROGRESS' ? 'bg-green-900/50 text-green-500' :
                                                    'bg-slate-700 text-slate-400'
                                                }`}>
                                                {room.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{room.players} / {room.maxPlayers}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDeleteRoom(room.id)}
                                                className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                                            >
                                                <Icons.LogOut className="w-4 h-4" /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {activeTab === 'CONTENT' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Parties Section */}
                    <div className="space-y-6">
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <h2 className="text-xl font-bold text-white mb-4">Add Party</h2>
                            <form onSubmit={handleAddParty} className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <input className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white w-full" placeholder="Name" value={partyForm.name} onChange={e => setPartyForm({ ...partyForm, name: e.target.value })} />
                                    <input className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white w-full" placeholder="Acronym" value={partyForm.acronym} onChange={e => setPartyForm({ ...partyForm, acronym: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Economic Stance</label>
                                        <select className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white w-full text-sm" value={partyForm.economicStance} onChange={e => setPartyForm({ ...partyForm, economicStance: e.target.value })}>
                                            {Object.entries(ECONOMIC_STANCES).map(([key, val]) => (
                                                <option key={key} value={key}>{val.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Social Stance</label>
                                        <select className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white w-full text-sm" value={partyForm.socialStance} onChange={e => setPartyForm({ ...partyForm, socialStance: e.target.value })}>
                                            {Object.entries(SOCIAL_STANCES).map(([key, val]) => (
                                                <option key={key} value={key}>{val.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <input type="color" className="bg-slate-900 border border-slate-600 rounded h-10 w-full cursor-pointer" value={partyForm.color} onChange={e => setPartyForm({ ...partyForm, color: e.target.value })} />

                                {/* Live Preview of Effects */}
                                <div className="bg-slate-900/50 p-3 rounded text-xs text-slate-400 space-y-1">
                                    <p><strong className="text-green-500">Eco Bonus:</strong> {ECONOMIC_STANCES[partyForm.economicStance as keyof typeof ECONOMIC_STANCES]?.bonus}</p>
                                    <p><strong className="text-red-500">Eco Malus:</strong> {ECONOMIC_STANCES[partyForm.economicStance as keyof typeof ECONOMIC_STANCES]?.malus}</p>
                                    <div className="h-px bg-slate-700 my-1"></div>
                                    <p><strong className="text-green-500">Soc Bonus:</strong> {SOCIAL_STANCES[partyForm.socialStance as keyof typeof SOCIAL_STANCES]?.bonus}</p>
                                    <p><strong className="text-red-500">Soc Malus:</strong> {SOCIAL_STANCES[partyForm.socialStance as keyof typeof SOCIAL_STANCES]?.malus}</p>
                                </div>

                                <Button type="submit" fullWidth>Create Party</Button>
                            </form>
                        </div>

                        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-700">
                                <h2 className="text-xl font-bold text-white">Political Parties</h2>
                            </div>
                            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                                {parties.map(p => (
                                    <div key={p.id} className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }}></div>
                                            <span className="font-bold text-white">{p.acronym}</span>
                                            <span className="text-sm text-slate-400">- {p.name}</span>
                                        </div>
                                        <button onClick={() => handleDeleteParty(p.id)} className="text-slate-500 hover:text-red-500"><Icons.LogOut className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                {parties.length === 0 && <p className="text-slate-500 text-center italic">No parties found.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Archetypes Section */}
                    <div className="space-y-6">
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <h2 className="text-xl font-bold text-white mb-4">Add Archetype</h2>
                            <form onSubmit={handleAddArchetype} className="space-y-3">
                                <div className="grid grid-cols-4 gap-2">
                                    <input className="col-span-3 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white w-full" placeholder="Name" value={archetypeForm.name} onChange={e => setArchetypeForm({ ...archetypeForm, name: e.target.value })} />
                                    <input className="col-span-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white w-full text-center" placeholder="Icon" value={archetypeForm.icon} onChange={e => setArchetypeForm({ ...archetypeForm, icon: e.target.value })} />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Background</label>
                                    <select className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white w-full text-sm" value={archetypeForm.background} onChange={e => setArchetypeForm({ ...archetypeForm, background: e.target.value })}>
                                        {Object.entries(ARCHETYPE_BACKGROUNDS).map(([key, val]) => (
                                            <option key={key} value={key}>{val.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <textarea className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white w-full text-sm" placeholder="Description (Optional override)" rows={2} value={archetypeForm.description} onChange={e => setArchetypeForm({ ...archetypeForm, description: e.target.value })} />

                                {/* Stats Preview */}
                                <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400 bg-slate-900/50 p-2 rounded">
                                    <div>
                                        <div className="text-amber-500 font-bold">{ARCHETYPE_BACKGROUNDS[archetypeForm.background as keyof typeof ARCHETYPE_BACKGROUNDS]?.stats?.charisma}</div>
                                        <div className="uppercase">Charisma</div>
                                    </div>
                                    <div>
                                        <div className="text-blue-500 font-bold">{ARCHETYPE_BACKGROUNDS[archetypeForm.background as keyof typeof ARCHETYPE_BACKGROUNDS]?.stats?.intelligence}</div>
                                        <div className="uppercase">Intel</div>
                                    </div>
                                    <div>
                                        <div className="text-green-500 font-bold">{ARCHETYPE_BACKGROUNDS[archetypeForm.background as keyof typeof ARCHETYPE_BACKGROUNDS]?.stats?.resources}</div>
                                        <div className="uppercase">Resources</div>
                                    </div>
                                </div>

                                <div className="text-xs text-slate-400 italic">
                                    <span className="text-amber-500 font-bold">Trait:</span> {ARCHETYPE_BACKGROUNDS[archetypeForm.background as keyof typeof ARCHETYPE_BACKGROUNDS]?.bonus}
                                </div>

                                <Button type="submit" fullWidth>Create Archetype</Button>
                            </form>
                        </div>

                        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-700">
                                <h2 className="text-xl font-bold text-white">Archetypes</h2>
                            </div>
                            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                                {archetypes.map(a => (
                                    <div key={a.id} className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{a.icon}</span>
                                            <div>
                                                <div className="font-bold text-white">{a.name}</div>
                                                <div className="text-xs text-slate-500">C:{a.baseStats.charisma} I:{a.baseStats.intelligence} R:{a.baseStats.resources}</div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteArchetype(a.id)} className="text-slate-500 hover:text-red-500"><Icons.LogOut className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                {archetypes.length === 0 && <p className="text-slate-500 text-center italic">No archetypes found.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
