import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole, NewsItem } from '../types';
import Button from '../components/Button';
import { Icons } from '../constants';
import { getAllUsers, updateUserRole, addNews, deleteNews, getLiveNews } from '../services/firestoreService';

interface AdminDashboardProps {
    user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'NEWS'>('OVERVIEW');
    const [users, setUsers] = useState<User[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form State for News
    const [newsForm, setNewsForm] = useState<Partial<NewsItem>>({
        headline: '',
        preview: '',
        category: 'POLITICS',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (activeTab === 'USERS') {
            loadUsers();
        } else if (activeTab === 'NEWS') {
            const unsubscribe = getLiveNews((items) => {
                setNews(items);
            });
            return () => unsubscribe();
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

                    {/* Game Content */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 opacity-50">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Icons.Map className="w-5 h-5 text-amber-500" /> Content (Coming Soon)
                        </h2>
                        <p className="text-sm text-slate-400 mb-4">Edit parties, archetypes, and cities.</p>
                        <div className="space-y-2">
                            <Button fullWidth variant="outline" disabled>Manage Parties</Button>
                        </div>
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
        </div>
    );
};

export default AdminDashboard;
