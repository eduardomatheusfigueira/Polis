import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Icons } from '../constants';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Don't show layout on login page
  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-2xl font-serif font-bold text-amber-500 tracking-wider">POLIS</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/') ? 'bg-slate-800 text-amber-500' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-2">
                    <Icons.Home className="w-4 h-4" /> Home
                  </div>
                </Link>

                <Link
                  to="/lobby"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/lobby') ? 'bg-slate-800 text-amber-500' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-2">
                    <Icons.Map className="w-4 h-4" /> Scenarios
                  </div>
                </Link>

                <Link
                  to="/profile"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/profile') ? 'bg-slate-800 text-amber-500' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-2">
                    <Icons.User className="w-4 h-4" /> Profile
                  </div>
                </Link>

                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin') ? 'bg-slate-800 text-amber-500' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Icons.Award className="w-4 h-4" /> Dashboard
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* User Info / Logout */}
            <div className="hidden md:block">
              <div className="flex items-center gap-4">
                {user && (
                  <div className="flex items-center gap-2">
                    <img
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border border-slate-600"
                    />
                    <span className="text-sm font-medium text-amber-100">{user.username}</span>
                  </div>
                )}
                <button onClick={onLogout} className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800">
                  <Icons.LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-400 hover:text-white p-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-slate-800">Home</Link>
              <Link to="/lobby" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">Scenarios</Link>
              <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">Profile</Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-amber-500 hover:text-amber-400 hover:bg-slate-800">Admin Dashboard</Link>
              )}
              <button onClick={onLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-slate-800">Logout</button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;