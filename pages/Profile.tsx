import React, { useState } from 'react';
import { User, Achievement } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import { getAchievements } from '../services/dataService';
import { Icons } from '../constants';

interface ProfileProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    fullName: user.fullName,
    bio: user.bio || '',
    contactEmail: user.contactEmail || '',
    website: user.website || '',
  });

  const achievements: Achievement[] = getAchievements(); // Mock data

  const handleSave = () => {
    onUpdateUser({ ...user, ...formData });
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to server/blob storage. 
      // Here we simulate by creating a temporary object URL
      const url = URL.createObjectURL(file);
      onUpdateUser({ ...user, avatarUrl: url });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header / Main Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-900/20 to-transparent"></div>
        
        <div className="relative flex flex-col md:flex-row items-start gap-6">
          <div className="relative group">
            <img 
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
              alt="Profile" 
              className="w-32 h-32 rounded-full border-4 border-slate-900 shadow-xl object-cover"
            />
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">Change</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            )}
          </div>

          <div className="flex-1 w-full">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-serif font-bold text-white">{user.fullName}</h1>
                <p className="text-amber-500 font-medium">@{user.username}</p>
                <div className="mt-2 flex gap-4 text-sm text-slate-400">
                  <span>Level <span className="text-white font-bold">{user.level}</span></span>
                  <span>Influence <span className="text-white font-bold">{user.influence}</span></span>
                </div>
              </div>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>

            {isEditing ? (
              <div className="mt-6 space-y-4 bg-slate-800/50 p-4 rounded-lg">
                <Input 
                  label="Full Name" 
                  value={formData.fullName} 
                  onChange={e => setFormData({...formData, fullName: e.target.value})} 
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-300">Bio / Manifesto</label>
                  <textarea 
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    rows={3}
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Public Email" 
                    value={formData.contactEmail} 
                    onChange={e => setFormData({...formData, contactEmail: e.target.value})} 
                  />
                  <Input 
                    label="Website/Social" 
                    value={formData.website} 
                    onChange={e => setFormData({...formData, website: e.target.value})} 
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-slate-300 leading-relaxed italic border-l-2 border-amber-500 pl-4">
                  "{user.bio || "No political manifesto yet."}"
                </p>
                
                {(user.contactEmail || user.website) && (
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    {user.contactEmail && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Icons.Mail className="w-4 h-4" /> {user.contactEmail}
                      </span>
                    )}
                     {user.website && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Icons.Map className="w-4 h-4" /> {user.website}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
           <h2 className="text-xl font-serif font-bold text-white mb-4 flex items-center gap-2">
             <Icons.TrendingUp className="w-5 h-5 text-amber-500" /> Career History
           </h2>
           <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Campaigns Won</span>
                <span className="text-white font-mono">12</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Debates Succeeded</span>
                <span className="text-white font-mono">45</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Public Approval</span>
                <div className="w-24 bg-slate-800 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
           </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
           <h2 className="text-xl font-serif font-bold text-white mb-4 flex items-center gap-2">
             <Icons.Award className="w-5 h-5 text-amber-500" /> Achievements
           </h2>
           <div className="space-y-3">
             {achievements.map(ach => (
               <div key={ach.id} className={`flex gap-3 p-3 rounded-lg border ${ach.unlockedAt ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-900/50 border-slate-800 opacity-50'}`}>
                 <div className="text-2xl">{ach.icon}</div>
                 <div>
                   <h3 className="text-sm font-bold text-slate-200">{ach.title}</h3>
                   <p className="text-xs text-slate-500">{ach.description}</p>
                   {ach.unlockedAt && <p className="text-[10px] text-amber-500 mt-1">Unlocked: {ach.unlockedAt}</p>}
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;