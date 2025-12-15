import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import Button from '../components/Button';
import { Icons } from '../constants';

interface AdminDashboardProps {
    user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    const navigate = useNavigate();

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
            <div className="bg-slate-900 p-6 rounded-xl border border-amber-900/50">
                <h1 className="text-3xl font-serif font-bold text-amber-500 mb-2">Admin Dashboard</h1>
                <p className="text-slate-400">Manage global game settings, users, and content.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Management */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Icons.Users className="w-5 h-5 text-amber-500" /> Users
                    </h2>
                    <p className="text-sm text-slate-400 mb-4">Manage roles and permissions.</p>
                    <Button fullWidth variant="outline">View All Users</Button>
                </div>

                {/* Game Content */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Icons.Map className="w-5 h-5 text-amber-500" /> Content
                    </h2>
                    <p className="text-sm text-slate-400 mb-4">Edit parties, archetypes, and cities.</p>
                    <div className="space-y-2">
                        <Button fullWidth variant="outline">Manage Parties</Button>
                        <Button fullWidth variant="outline">Manage Archetypes</Button>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Icons.Award className="w-5 h-5 text-amber-500" /> System
                    </h2>
                    <div className="space-y-2 text-sm text-slate-400">
                        <div className="flex justify-between"><span>Server Status</span> <span className="text-green-500">Online</span></div>
                        <div className="flex justify-between"><span>Version</span> <span className="text-white">0.5.0 (Beta)</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
