import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import Button from '../components/Button';
import { Icons } from '../constants';
import { getAllUsers, updateUserRole } from '../services/firestoreService';

interface AdminDashboardProps {
    user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS'>('OVERVIEW');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'USERS') {
            loadUsers();
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
            <div className="bg-slate-900 p-6 rounded-xl border border-amber-900/50 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-amber-500 mb-2">Admin Dashboard</h1>
                    <p className="text-slate-400">Manage global game settings, users, and content.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant={activeTab === 'OVERVIEW' ? 'primary' : 'ghost'} onClick={() => setActiveTab('OVERVIEW')}>Overview</Button>
                    <Button variant={activeTab === 'USERS' ? 'primary' : 'ghost'} onClick={() => setActiveTab('USERS')}>Users</Button>
                </div>
            </div>

            {activeTab === 'OVERVIEW' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* User Management */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 cursor-pointer hover:border-amber-500 transition-colors" onClick={() => setActiveTab('USERS')}>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Icons.Users className="w-5 h-5 text-amber-500" /> Users & Roles
                        </h2>
                        <p className="text-sm text-slate-400 mb-4">Manage {users.length > 0 ? users.length : ''} registered users.</p>
                        <Button fullWidth variant="outline">Manage Users</Button>
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

                    {/* System Status */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Icons.Award className="w-5 h-5 text-amber-500" /> System Status
                        </h2>
                        <div className="space-y-2 text-sm text-slate-400">
                            <div className="flex justify-between"><span>Server</span> <span className="text-green-500">Online</span></div>
                            <div className="flex justify-between"><span>Database</span> <span className="text-green-500">Connected</span></div>
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
                                    <th className="px-6 py-3">Joined</th>
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
        </div>
    );
};

export default AdminDashboard;
