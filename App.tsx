import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'; // Import auth listener
import { auth } from './services/firebase'; // Import auth instance
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Lobby from './pages/Lobby';
import ScenarioRoom from './pages/ScenarioRoom';
import GameSession from './pages/GameSession';
import Layout from './components/Layout';
import { User } from './types';
import { getUserByUsername, createUser, updateUser, seedParties, getStoredParties } from './services/firestoreService';
import { getParties } from './services/dataService'; // For seeding source

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  // 1. Initialize Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        console.log("Firebase Auth Ready:", authUser.uid);
        setIsFirebaseReady(true);
      } else {
        console.log("Signing in anonymously...");
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous auth failed:", error);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Initialize App Data (Only after Firebase is ready)
  useEffect(() => {
    if (!isFirebaseReady) return;

    const initAppData = async () => {
      try {
        // Seed static data
        try {
          await seedParties(getParties());
        } catch (error) {
          console.error("Failed to seed parties (check rules):", error);
        }

        // Check for existing session
        const storedUsername = localStorage.getItem('polis_username');
        if (storedUsername) {
          try {
            const fetchedUser = await getUserByUsername(storedUsername);
            if (fetchedUser) {
              setUser(fetchedUser);
            } else {
              localStorage.removeItem('polis_username');
            }
          } catch (error) {
            console.error("Failed to restore session:", error);
          }
        }
      } catch (error) {
        console.error("App initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAppData();
  }, [isFirebaseReady]);

  const handleLogin = async (username: string, additionalData?: Partial<User>) => {
    setLoading(true);
    try {
      let existingUser = await getUserByUsername(username);

      if (!existingUser) {
        // Create new user
        const newUser: User = {
          id: 'u_' + Math.floor(Math.random() * 1000000), // Better ID gen
          username: username,
          fullName: additionalData?.fullName || username.charAt(0).toUpperCase() + username.slice(1),
          email: additionalData?.email || `${username}@polis.game`,
          avatarUrl: additionalData?.avatarUrl,
          level: 1,
          influence: 100,
          achievements: [],
          ...additionalData // Merge any other provided fields
        };
        await createUser(newUser);
        existingUser = newUser;
      } else if (additionalData) {
        // Optional: Update existing user with new Google info if missing?
        // For now, let's just log them in.
      }

      setUser(existingUser);
      localStorage.setItem('polis_username', existingUser.username); // Keep simple session
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('polis_username');
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      await updateUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-500">Loading Polis (Connecting to Server)...</div>;

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