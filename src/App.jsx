import React, { useState, useEffect } from 'react';
import { Home, LogIn, UserCheck, ShieldAlert, Coffee, LogOut } from 'lucide-react';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { Input } from './components/ui/Input';
import { apiClient } from './services/apiClient';

export default function App() {
  // WHY: Application-wide core state hooks to track authentication status, role permissions, and active views
  const [token, setToken] = useState(localStorage.getItem('pgms_jwt_token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('pgms_user_role') || '');
  const [userName, setUserName] = useState(localStorage.getItem('pgms_user_name') || '');
  const [currentView, setCurrentView] = useState('dashboard');

  // Login Form field inputs state
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // WHY: Sync state changes instantly with browser vault caches
  useEffect(() => {
    if (token) {
      localStorage.setItem('pgms_jwt_token', token);
      localStorage.setItem('pgms_user_role', userRole);
      localStorage.setItem('pgms_user_name', userName);
    } else {
      localStorage.clear();
    }
  }, [token, userRole, userName]);

  // WHY: Handle user authentication submission event strings
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      // Hit our backend login controller node via our secure apiClient
      const response = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });

      if (response.status === 'success') {
        setToken(response.token);
        setUserRole(response.data.user.role);
        setUserName(response.data.user.name);
        setCurrentView('dashboard');
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid credentials profile signature configuration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUserRole('');
    setUserName('');
    setCurrentView('dashboard');
  };

  // =========================================================================
  // VIEW RENDER LAYOUTS (RENDER CONDITIONS)
  // =========================================================================

  // 1. UNAUTHENTICATED STATE: Render clean form panels
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">PGMS Enterprise Portal</h2>
            <p className="text-sm text-gray-500 mt-2">Sign in to coordinate property schedules and accounts</p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleLoginSubmit}>
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="you@domain.com"
                required
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                error={loginError ? ' ' : ''}
              />
              <Input
                label="Account Password String"
                type="password"
                placeholder="••••••••"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                error={loginError}
              />

              <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmitting}>
                Sign In Securely
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED SYSTEM SHELL GRID
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">

      {/* SIDEBAR NAVIGATION CONTROL DOCK */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-md">
        <div>
          <div className="pb-4 mb-6 border-b border-slate-700 flex items-center gap-3">
            <Home className="text-blue-400 h-6 w-6" />
            <div>
              <h1 className="font-bold text-md tracking-wide truncate">{userName}</h1>
              <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">{userRole}</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <UserCheck className="h-4 w-4" /> Dashboard Workspace
            </button>
            <button
              onClick={() => setCurrentView('features')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${currentView === 'features' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <ShieldAlert className="h-4 w-4" /> Core Functional Logs
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:bg-slate-800 mt-6 transition-colors border-t border-slate-700 pt-4"
        >
          <LogOut className="h-4 w-4" /> System Sign Out
        </button>
      </aside>

      {/* CORE CONTENT WORKSPACE DISPLAY PANELS */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 capitalize">{currentView} Panel</h2>
          <p className="text-sm text-gray-500">Welcome back! Manage your physical residency operational actions here.</p>
        </header>

        {currentView === 'dashboard' ? (
          <div className="grid grid-cols-1 gap-6">
            <Card title="Active System Workspace Shell" subtitle="Operational Matrix Baseline Standby">
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Coffee className="h-12 w-12 text-slate-300 mb-3 animate-pulse" />
                <p className="text-sm font-medium">Ready to inject live analytical grids and management modules.</p>
                <p className="text-xs text-gray-400 mt-1">Select menu views on the sidebar to inspect structural assets.</p>
              </div>
            </Card>
          </div>
        ) : (
          <Card title="Feature Pipeline Context" subtitle="Target Area Node Loading Screen Link">
            <p className="text-sm text-gray-600">This target lane area holds domain views (Occupancy Matrices / Ticket Forms) connecting next week.</p>
          </Card>
        )}
      </main>
    </div>
  );
}