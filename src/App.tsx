import React, { useState, useEffect } from 'react';
import { User, Trade, Deposit } from './types';
import { Sidebar } from './components/Layout';
import { TradingDashboard } from './components/TradingDashboard';
import { DepositPage } from './components/DepositPage';
import { WithdrawalPage } from './components/WithdrawalPage';
import { TransactionHistoryPage } from './components/TransactionHistoryPage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { AdminPanel } from './components/AdminPanel';
import { AuthScreen } from './components/AuthScreen';
import { SettingsPage } from './components/SettingsPage';
import { ReferralPage } from './components/ReferralPage';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [accountType, setAccountType] = useState<'live' | 'demo'>('demo');
  const [activeView, setActiveView] = useState<'trade' | 'deposit' | 'withdraw' | 'history' | 'leaderboard' | 'admin' | 'settings' | 'refer'>('trade');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Sync dark class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initial user session load and polling
  const fetchSessionData = async () => {
    // 1. Core User Data (Critical for loading the app)
    try {
      const meRes = await fetch('/api/user/me');
      if (meRes.ok) {
        const user = await meRes.json();
        setCurrentUser(user);
        if (user.role === "admin") { setActiveView("admin"); }
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Failed to sync me session state', err);
    }

    // 2. Admin Users Data (Non-blocking)
    try {
      const usersRes = await fetch('/api/admin/users');
      if (usersRes.ok) {
        const data = await usersRes.json();
        setAllUsers(data);
      }
    } catch (err) {
      console.error('Failed to sync admin users state', err);
    }

    // 3. Trades Data (Non-blocking)
    try {
      const tradesRes = await fetch('/api/trades');
      if (tradesRes.ok) {
        const data = await tradesRes.json();
        setTrades(data);
      }
    } catch (err) {
      console.error('Failed to sync trades state', err);
    }

    // 4. Deposits Data (Non-blocking)
    try {
      const depositsRes = await fetch('/api/deposits');
      if (depositsRes.ok) {
        const data = await depositsRes.json();
        setDeposits(data);
      }
    } catch (err) {
      console.error('Failed to sync deposits state', err);
    }
  };

  useEffect(() => {
    fetchSessionData();
    const interval = setInterval(fetchSessionData, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/user/switch/${userId}`, { method: 'POST' });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        fetchSessionData();
      }
    } catch (err) {
      console.error('Failed to switch active user', err);
    }
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-mono">Initializing Probashi Trading Platform Engine...</p>
      </div>
    );
  }

  return (
    <Sidebar
      user={currentUser}
      accountType={accountType}
      setAccountType={setAccountType}
      activeView={activeView}
      setActiveView={setActiveView}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      allUsers={allUsers}
      onSwitchUser={handleSwitchUser}
    >
      {activeView === 'trade' && (
        <div className="h-full w-full">
          <TradingDashboard
            user={currentUser}
            accountType={accountType}
            trades={trades}
            onTradeOpened={fetchSessionData}
            darkMode={darkMode}
            onUserUpdated={fetchSessionData}
          />
        </div>
      )}

      {activeView === 'deposit' && (
        <div className="flex-1 overflow-y-auto">
          <DepositPage
            user={currentUser}
            deposits={deposits}
            onDepositSubmitted={fetchSessionData}
          />
        </div>
      )}

      {activeView === 'withdraw' && (
        <div className="flex-1 overflow-y-auto">
          <WithdrawalPage
            user={currentUser}
            onWithdrawalSubmitted={fetchSessionData}
          />
        </div>
      )}

      {activeView === 'history' && (
        <div className="flex-1 overflow-y-auto">
          <TransactionHistoryPage
            user={currentUser}
            trades={trades}
            deposits={deposits}
          />
        </div>
      )}

      {activeView === 'leaderboard' && (
        <div className="flex-1 overflow-y-auto">
          <LeaderboardPage />
        </div>
      )}

      {activeView === 'admin' && (
        <div className="flex-1 overflow-y-auto">
          <AdminPanel />
        </div>
      )}

      {activeView === 'settings' && (
        <div className="flex-1 overflow-y-auto">
          <SettingsPage 
            user={currentUser} 
            onUserUpdated={fetchSessionData} 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
          />
        </div>
      )}

      {activeView === 'refer' && (
        <div className="flex-1 overflow-y-auto">
          <ReferralPage user={currentUser} />
        </div>
      )}
    </Sidebar>
  );
}

export default App;
