import React, { useState, useEffect } from 'react';
import { Home, UserCheck, ShieldAlert, Coffee, LogOut } from 'lucide-react';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { Input } from './components/ui/Input';
import { apiClient } from './services/apiClient';
// WHY: Import the live color-coded asset matrix grid component built in Days 23 & 24
import OccupancyGrid from './components/owner/OccupancyGrid';

export default function App() {
  // WHY: Main React state engines holding our security access configurations and view routers
  const [token, setToken] = useState(localStorage.getItem('pgms_jwt_token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('pgms_user_role') || '');
  const [userName, setUserName] = useState(localStorage.getItem('pgms_user_name') || '');
  const [currentView, setCurrentView] = useState('dashboard');

  // Form input field state monitors
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // WHY: Automatically sync token updates to browser local storage so logins persist on refresh
  useEffect(() => {
    if (token) {
      localStorage.setItem('pgms_jwt_token', token);
      localStorage.setItem('pgms_user_role', userRole);
      localStorage.setItem('pgms_user_name', userName);
    } else {
      localStorage.clear();
    }
  }, [token, userRole, userName]);

  // WHY: Communicates with backend authentication routes to approve token credentials
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
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
      setLoginError(err.message || 'Incorrect email or password combination configuration.');
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
  // CONDITIONAL VIEW ROUTING PANELS
  // =========================================================================

  // PANEL 1: GATEWAY ACCESS LOCK (If token keycard is missing)
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

  // PANEL 2: CORE WRAPPED INTERFACE CONTAINER (When logged in successfully)
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">

      {/* SIDEBAR NAVIGATION DOCK */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-md">
        <div>
          <div className="pb-4 mb-6 border-b border-slate-700 flex items-center gap-3">
            <Home className="text-blue-400 h-6 w-6" />
            <div>
              <h1 className="font-bold text-md tracking-wide truncate max-w-[160px]">{userName}</h1>
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

      {/* VIEW PANEL WORKSPACE */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 capitalize">{currentView} Panel</h2>
          <p className="text-sm text-gray-500">Coordinate and observe active PG operational workflows.</p>
        </header>

        {/* COMPONENT CONDITIONAL ROUTER ROUTING LOGIC */}
        {currentView === 'dashboard' ? (
          <div className="grid grid-cols-1 gap-6">
            {/* WHY: Enforce Role Based Frontend Rendering. 
                If an owner logs in, give them the complex interactive matrix grid map layout.
                If a caretaker or tenant logs in, display their custom baseline home spaces. */}
            {userRole === 'PropertyOwner' || userRole === 'SuperAdmin' ? (
              // NOTE: Swap this placeholder string with an actual generated property _id from your Postman response!
              <OccupancyGrid propertyId="6a466272a1d895507862c3c1" />
            ) : (
              <Card title="Tenant Hub Standby" subtitle="Welcome to your resident dashboard profile">
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Coffee className="h-12 w-12 text-slate-300 mb-3 animate-pulse" />
                  <p className="text-sm font-medium text-gray-600">Your roommate and billing ledger entries are standing by.</p>
                  <p className="text-xs text-gray-400 mt-1">Navigate using the control sidebar docks to log issues or opt out of meals.</p>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <Card title="Functional Pipeline Context" subtitle="Integrated Operational Features Portal">
              <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm font-medium">
                🔒 Security Verified Node: This area will host the interactive Tenant Ticketing Grid Form and Food Optimization Module Calendars in our upcoming days!
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}