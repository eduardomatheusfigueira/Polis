import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Lobby from './pages/Lobby';
import ScenarioRoom from './pages/ScenarioRoom';
import GameSession from './pages/GameSession';
import Layout from './components/Layout';
import { User } from './types';
import { getAchievements } from './services/dataService';

const App: React.FC = () => {
  // Simple auth state management using local storage to persist mock login
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('polis_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (username: string) => {
    // Create mock user object
    const newUser: User = {
      id: 'u_' + Math.floor(Math.random() * 10000),
      username: username,
      fullName: username.charAt(0).toUpperCase() + username.slice(1), // Capitalize
      email: `${username}@polis.game`,
      level: 1,
      influence: 100,
      achievements: []
    };
    
    setUser(newUser);
    localStorage.setItem('polis_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('polis_user');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('polis_user', JSON.stringify(updatedUser));
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-500">Loading Polis...</div>;

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
          />
          
          <Route 
            path="/" 
            element={user ? <Home /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} onUpdateUser={handleUpdateUser} /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/lobby" 
            element={user ? <Lobby /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/room/:id" 
            element={user ? <ScenarioRoom /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/game/:id" 
            element={user ? <GameSession /> : <Navigate to="/login" />} 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;