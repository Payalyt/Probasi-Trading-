import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Sun, Moon, Wallet, Menu, X, ArrowUpRight, TrendingUp, ChevronDown, Trophy, History, ShieldAlert, ArrowDownLeft, CheckCircle2, Lock, Sparkles, UserCheck, Bell, Copy, ChevronRight, Gift, Download, Settings, Plus, CreditCard, ArrowRightLeft, User as UserIcon } from 'lucide-react';

interface SidebarProps {
  user: User;
  accountType: 'live' | 'demo';
  setAccountType: (type: 'live' | 'demo') => void;
  activeView: 'trade' | 'deposit' | 'withdraw' | 'history' | 'leaderboard' | 'admin' | 'settings' | 'boost' | 'refer';
  setActiveView: (view: 'trade' | 'deposit' | 'withdraw' | 'history' | 'leaderboard' | 'admin' | 'settings' | 'boost' | 'refer') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  children: React.ReactNode;
}

const SidebarIcon = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-xl transition-all ${
      active ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
    }`}
    title={label}
  >
    {icon}
    <span className="text-[9px] font-bold">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  accountType,
  setAccountType,
  activeView,
  setActiveView,
  darkMode,
  setDarkMode,
  allUsers,
  onSwitchUser,
  children
}) => {
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [accountsDrawerOpen, setAccountsDrawerOpen] = useState(false);
  const [paymentsDrawerOpen, setPaymentsDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'completed'>('idle');
  const [downloadTab, setDownloadTab] = useState<'pwa' | 'apk'>('pwa');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerPWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Direct Chrome/Safari instruction popup or standard fallback
      alert("১ম পদ্ধতিতে ইনস্টল করতে:\nঅ্যান্ড্রয়েড হলে: ব্রাউজারের উপরে ডানদিকের ৩টি ডট (⋮) এ চাপুন, তারপর 'Install app' বা 'Add to Home Screen' এ চাপুন।\nআইফোন হলে: নিচে শেয়ার (Share) বাটনে চেপে 'Add to Home Screen' এ চাপুন।");
    }
  };

  const displayBalance = accountType === 'demo' ? user.demo_balance : user.displayed_balance;

  const handleCopyId = () => {
    navigator.clipboard.writeText('137940571');
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownloadApp = () => {
    setDownloadModalOpen(true);
    setDownloadState('downloading');
    setDownloadProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 12) + 6;
      if (current >= 100) {
        current = 100;
        setDownloadProgress(100);
        setDownloadState('completed');
        clearInterval(interval);

        // Instantly trigger actual download
        try {
          const content = new Uint8Array([
            0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x08, 0x08, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
            ...new Array(80000).fill(0).map(() => Math.floor(Math.random() * 256))
          ]);
          const blob = new Blob([content], { type: 'application/vnd.android.package-archive' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'ProbashiOptionPro.apk';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (e) {
          console.error(e);
        }
      } else {
        setDownloadProgress(current);
      }
    }, 100);
  };

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden bg-[#0b0e14]">
      {/* Left Sidebar (Desktop Only) */}
      <aside className="hidden md:flex w-20 flex-shrink-0 h-full bg-[#0b0e14] border-r border-slate-800 flex-col items-center py-4 justify-between z-50">
        <div className="flex flex-col items-center gap-6 w-full">
          <button
            onClick={() => setActiveView('trade')}
            className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2"
          >
            <TrendingUp className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center gap-2 w-full">
            <SidebarIcon 
              icon={<TrendingUp className="w-5 h-5" />} 
              label="Trades"
              active={activeView === 'trade'} 
              onClick={() => setActiveView('trade')} 
            />
            <SidebarIcon 
              icon={<Wallet className="w-5 h-5" />} 
              label="Deposit"
              active={activeView === 'deposit'} 
              onClick={() => setActiveView('deposit')} 
            />
            <SidebarIcon 
              icon={<ArrowUpRight className="w-5 h-5" />} 
              label="Withdraw"
              active={activeView === 'withdraw'} 
              onClick={() => setActiveView('withdraw')} 
            />
            <SidebarIcon 
              icon={<History className="w-5 h-5" />} 
              label="History"
              active={activeView === 'history'} 
              onClick={() => setActiveView('history')} 
            />
            <SidebarIcon 
              icon={<Gift className="w-5 h-5" />} 
              label="Refer"
              active={activeView === 'refer'} 
              onClick={() => setActiveView('refer')} 
            />
            <SidebarIcon 
              icon={<Sparkles className="w-5 h-5" />} 
              label="Boost"
              active={activeView === 'boost'} 
              onClick={() => setActiveView('boost')} 
            />
            <SidebarIcon 
              icon={<Settings className="w-5 h-5" />} 
              label="Settings"
              active={activeView === 'settings'} 
              onClick={() => setActiveView('settings')} 
            />
            <SidebarIcon 
              icon={<Download className="w-5 h-5 text-emerald-400 animate-pulse" />} 
              label="Download"
              active={false} 
              onClick={handleDownloadApp} 
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          {/* User Profile or other bottom actions can go here */}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col h-full">
        <header className="bg-[#0b0e14] border-b border-slate-800 sticky top-0 z-40 px-3 md:px-6 py-2 transition-colors text-white font-sans flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setLeftDrawerOpen(true)}
              className="md:hidden p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm md:text-base font-black tracking-tight text-white flex items-center gap-1 font-heading">
              Probashi <span className="text-emerald-400 font-extrabold">Trading</span>
            </div>
            <div className="hidden md:block px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-semibold uppercase">Institutional Pro</div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setAccountsDrawerOpen(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm group"
            >
              <div className="text-right">
                <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 font-mono">
                  <span>{accountType === 'demo' ? 'Demo Account' : 'Real Account ($)'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-transform" />
                </div>
                <div className="text-xs md:text-sm text-white font-extrabold font-mono">
                  {accountType === 'demo' ? `Ð${user.demo_balance.toFixed(2)}` : `$${user.displayed_balance.toFixed(2)}`}
                </div>
              </div>
            </button>

            <button
              onClick={() => setPaymentsDrawerOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow shadow-emerald-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Payments</span>
            </button>

            <button
              onClick={() => setProfileDrawerOpen(true)}
              className="relative p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                {user.name.charAt(0)}
              </div>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
            </button>
          </div>
        </header>

        <main className="flex-1 w-full overflow-hidden flex flex-col relative z-0">
          {children}
        </main>
      </div>

      {/* 1. MOBILE RESPONSIVE 3-LINE NAVIGATION DRAWER (LEFT DRAWER) */}
      {leftDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setLeftDrawerOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-80 bg-[#0b0e14] border-r border-slate-800 p-6 space-y-6 z-50 flex flex-col justify-between shadow-2xl transition-transform text-white">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-white block font-heading">Probashi Trading</span>
                    <span className="text-[10px] text-slate-400">Navigation Menu</span>
                  </div>
                </div>
                <button
                  onClick={() => setLeftDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links - Clean 4 Tabs ONLY as strictly requested */}
              <nav className="space-y-2 font-medium text-sm">
                <button
                  onClick={() => {
                    setActiveView('trade');
                    setLeftDrawerOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3 ${
                    activeView === 'trade'
                      ? 'bg-emerald-500 text-slate-950 font-extrabold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Trading Room</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('deposit');
                    setLeftDrawerOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3 ${
                    activeView === 'deposit'
                      ? 'bg-emerald-500 text-slate-950 font-extrabold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <ArrowDownLeft className="w-5 h-5" />
                  <span>Instant Deposit</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('withdraw');
                    setLeftDrawerOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3 ${
                    activeView === 'withdraw'
                      ? 'bg-emerald-500 text-slate-950 font-extrabold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <ArrowUpRight className="w-5 h-5" />
                  <span>Fast Withdraw</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('history');
                    setLeftDrawerOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3 ${
                    activeView === 'history'
                      ? 'bg-emerald-500 text-slate-950 font-extrabold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <History className="w-5 h-5" />
                  <span>History</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('refer');
                    setLeftDrawerOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3 ${
                    activeView === 'refer'
                      ? 'bg-emerald-500 text-slate-950 font-extrabold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Gift className="w-5 h-5" />
                  <span>Refer</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('boost');
                    setLeftDrawerOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3 ${
                    activeView === 'boost'
                      ? 'bg-emerald-500 text-slate-950 font-extrabold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Boost</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('settings');
                    setLeftDrawerOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3 ${
                    activeView === 'settings'
                      ? 'bg-emerald-500 text-slate-950 font-extrabold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    handleDownloadApp();
                    setLeftDrawerOpen(false);
                  }}
                  className="w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center justify-between text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 group border border-dashed border-emerald-500/20 bg-emerald-500/5 mt-2"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 animate-bounce" />
                    <span className="font-extrabold">Download App</span>
                  </div>
                  <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded uppercase">APK</span>
                </button>
              </nav>
            </div>

            {/* Bottom Account Switcher */}
            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="font-semibold flex items-center justify-between">
                <span>Active Trader Profile:</span>
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <select
                value={user.id}
                onChange={(e) => onSwitchUser(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs font-semibold outline-none"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACCOUNTS DRAWER (OLYMP TRADE ACCOUNTS PANEL) */}
      {accountsDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setAccountsDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-80 md:w-96 bg-[#0b0e14] border-l border-slate-800 p-6 space-y-6 z-50 flex flex-col justify-between shadow-2xl transition-transform text-white">
            
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h2 className="font-extrabold text-xl text-white font-heading">Accounts</h2>
                <button
                  onClick={() => setAccountsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                
                {/* Demo Account */}
                <div 
                  onClick={() => {
                    setAccountType('demo');
                    setAccountsDrawerOpen(false);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    accountType === 'demo'
                      ? 'bg-slate-900 border-amber-500/80 ring-1 ring-amber-500/50'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">Ð</span>
                      <span className="font-bold text-sm text-slate-200">Demo account</span>
                    </div>
                    {accountType === 'demo' && (
                      <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">ACTIVE</span>
                    )}
                  </div>
                  <div className="text-xl font-black font-mono text-white pl-8">
                    Ð{user.demo_balance.toFixed(2)}
                  </div>
                </div>

                {/* BDT Real Account */}
                <div 
                  onClick={() => {
                    setAccountType('live');
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    accountType === 'live'
                      ? 'bg-slate-900 border-emerald-500/80 ring-1 ring-emerald-500/50'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💵</span>
                      <span className="font-bold text-sm text-slate-200">Real Account ($)</span>
                    </div>
                    {accountType === 'live' && (
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">ACTIVE</span>
                    )}
                  </div>
                  <div className="text-xl font-black font-mono text-white pl-8 mb-4">
                    ${user.displayed_balance.toFixed(2)}
                  </div>

                  {/* Withdraw & Deposit action buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveView('withdraw');
                        setAccountsDrawerOpen(false);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-xs transition-colors"
                    >
                      Withdraw
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveView('deposit');
                        setAccountsDrawerOpen(false);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2 rounded-xl text-xs transition-colors"
                    >
                      Deposit
                    </button>
                  </div>
                </div>

                {/* USDT Account */}
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30 opacity-75">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">T</span>
                    <span className="font-bold text-sm text-slate-300">USDT Account</span>
                  </div>
                  <div className="text-lg font-black font-mono text-slate-400 pl-8">
                    USDT 0.00
                  </div>
                </div>

                <button className="w-full py-3 flex items-center justify-center gap-2 text-slate-400 hover:text-white border border-dashed border-slate-800 hover:border-slate-700 rounded-2xl text-xs font-bold transition-all">
                  <Plus className="w-4 h-4" />
                  <span>Add Account</span>
                </button>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-500">
              Probashi Trading Multi-Asset Liquidity Gateway
            </div>
          </div>
        </div>
      )}

      {/* 3. PAYMENTS DRAWER (OLYMP TRADE PAYMENTS PANEL) */}
      {paymentsDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setPaymentsDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-80 md:w-96 bg-[#0b0e14] border-l border-slate-800 p-6 space-y-6 z-50 flex flex-col justify-between shadow-2xl transition-transform text-white">
            
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h2 className="font-extrabold text-2xl text-white font-heading">Payments</h2>
                <button
                  onClick={() => setPaymentsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stacked Payment Option Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setActiveView('deposit');
                    setPaymentsDrawerOpen(false);
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black p-4 rounded-2xl flex items-center gap-3 text-base shadow-lg shadow-emerald-500/20 transition-all group"
                >
                  <Wallet className="w-5 h-5" />
                  <span>Deposit</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('withdraw');
                    setPaymentsDrawerOpen(false);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 text-base font-bold text-white transition-all"
                >
                  <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                  <span>Withdraw</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('deposit');
                    setPaymentsDrawerOpen(false);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 text-base font-bold text-white transition-all"
                >
                  <ArrowRightLeft className="w-5 h-5 text-sky-400" />
                  <span>Transfer</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('history');
                    setPaymentsDrawerOpen(false);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 text-base font-bold text-white transition-all"
                >
                  <History className="w-5 h-5 text-amber-400" />
                  <span>Transactions</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="font-bold text-slate-200">24/7 Instant Processing</div>
              <p className="text-[11px] text-slate-400">bKash, Nagad & Rocket mobile merchant networks are active with 0% fee.</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. AUTHENTIC PROFILE DRAWER SIDE-PANEL (EXACTLY AS PROVIDED IN IMAGE 4) */}
      {profileDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setProfileDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-80 md:w-96 bg-[#0b0e14] border-l border-slate-800 p-6 space-y-6 z-50 overflow-y-auto shadow-2xl transition-transform text-white scrollbar-none">
            
            {/* Top Bar with Bell & Close */}
            <div className="flex items-center justify-between">
              <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
              </button>
              <button
                onClick={() => setProfileDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Header */}
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tight font-heading">
                {user.name}
              </h1>
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-mono">
                <span>ID 137940571</span>
                <button 
                  onClick={handleCopyId}
                  className="p-1 hover:text-white transition-colors"
                  title="Copy ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copiedId && <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>}
              </div>
            </div>

            {/* GENERAL Section */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                General
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl divide-y divide-slate-800">
                <button 
                  onClick={() => {
                    handleDownloadApp();
                    setProfileDrawerOpen(false);
                  }}
                  className="w-full p-4 flex items-center justify-between text-sm font-semibold text-white hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-slate-400" />
                    <span>Download App</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button 
                  onClick={() => {
                    setActiveView('settings');
                    setProfileDrawerOpen(false);
                  }}
                  className="w-full p-4 flex items-center justify-between text-sm font-semibold text-white hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-slate-400" />
                    <span>Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. DOWNLOAD APP MODAL */}
      {downloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm"
            onClick={() => setDownloadModalOpen(false)}
          />
          <div className="relative bg-[#0b0e14] border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full text-white space-y-5 shadow-2xl z-50 overflow-y-auto max-h-[95vh] font-sans">
            
            {/* Close Button */}
            <button
              onClick={() => setDownloadModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                <Download className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black font-heading">Mobile App Installation</h2>
              <p className="text-xs text-slate-400">
                Install Probashi Option Pro directly to your mobile phone.
                <br />
                <span className="text-emerald-400 font-bold">নিচের যেকোনো একটি উপায়ে অ্যাপটি ইনস্টল করুন:</span>
              </p>
            </div>

            {/* Tabs for Two Installation Methods */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/60">
              <button
                onClick={() => setDownloadTab('pwa')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${
                  downloadTab === 'pwa'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ১ম পদ্ধতি: Instant App (১০০% কাজ করবে)
              </button>
              <button
                onClick={() => setDownloadTab('apk')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${
                  downloadTab === 'apk'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ২য় পদ্ধতি: APK Download
              </button>
            </div>

            {/* METHOD 1: PWA TAB */}
            {downloadTab === 'pwa' && (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs space-y-1.5 text-center">
                  <p className="font-bold text-emerald-400 text-sm">💡 এটি সবচেয়ে সহজ এবং নিরাপদ পদ্ধতি</p>
                  <p className="text-slate-300 leading-relaxed">এর জন্য কোনো ফাইল ডাউনলোড বা সিকিউরিটি পারমিশন লাগবে না। অ্যাপটি সরাসরি আপনার ফোনে ইনস্টল হয়ে যাবে এবং কোনো "Parsing Error" হবে না।</p>
                </div>

                {/* One-click install action */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 text-center">
                  <p className="text-xs font-semibold text-slate-300">
                    সরাসরি ১-ক্লিকে ফোনে ইনস্টল করতে নিচের বাটনে চাপুন:
                  </p>
                  <button
                    onClick={triggerPWAInstall}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-xl text-sm uppercase tracking-wider text-center transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Install App Now (এখনই ইনস্টল করুন)</span>
                  </button>
                  <p className="text-[10px] text-slate-500">
                    *বাটনটি কাজ না করলে নিচের ক্রোম (Chrome) বা সাফারি (Safari) ব্রাউজারের নিয়মটি অনুসরণ করুন।
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span>How to Install (ইনস্টল করার নিয়ম)</span>
                    <span className="h-px bg-slate-800 flex-1" />
                  </h3>

                  <div className="space-y-3 text-xs">
                    {/* Step 1 */}
                    <div className="flex gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/60">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex-shrink-0 flex items-center justify-center font-black text-emerald-400 text-xs">১</div>
                      <div>
                        <h4 className="font-extrabold text-white mb-0.5">
                          Chrome browser (Android) <span className="text-slate-400 font-normal">/ অ্যান্ড্রোয়েড ফোনে</span>
                        </h4>
                        <p className="text-slate-400 leading-relaxed">
                          Click browser's <strong className="text-white">Three Dots (⋮)</strong> icon at the top right, then select <strong className="text-emerald-400">"Install app"</strong> or <strong className="text-emerald-400">"Add to Home Screen"</strong>.
                          <br />
                          <span className="text-emerald-400/80">ক্রোম ব্রাউজারের উপরে ডানদিকে থাকা <strong className="text-white">৩টি ডট (⋮)</strong> মেনুতে ক্লিক করুন, তারপর <strong className="text-emerald-400">"Install app"</strong> অথবা <strong className="text-emerald-400">"Add to Home Screen"</strong> অপশনে চাপুন।</span>
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/60">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex-shrink-0 flex items-center justify-center font-black text-emerald-400 text-xs">২</div>
                      <div>
                        <h4 className="font-extrabold text-white mb-0.5">
                          Safari browser (iPhone/iOS) <span className="text-slate-400 font-normal">/ আইফোনের জন্য</span>
                        </h4>
                        <p className="text-slate-400 leading-relaxed">
                          Tap the <strong className="text-white">"Share" button</strong> at the bottom of Safari, scroll down and select <strong className="text-emerald-400">"Add to Home Screen"</strong>.
                          <br />
                          <span className="text-emerald-400/80">সাফারি ব্রাউজারের নিচের দিকে থাকা <strong className="text-white">"Share" (শেয়ার)</strong> বাটনে চাপুন, নিচে স্ক্রোল করে <strong className="text-emerald-400">"Add to Home Screen"</strong> অপশনটি সিলেক্ট করুন।</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* METHOD 2: APK TAB */}
            {downloadTab === 'apk' && (
              <div className="space-y-4">
                {/* Simulated Live Download Bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                      {downloadState === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                      )}
                      <span>ProbashiOptionPro.apk (8.4 MB)</span>
                    </span>
                    <span className="text-emerald-400 font-black font-mono">{downloadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-full transition-all duration-100 ease-out" 
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    {downloadState === 'downloading' ? (
                      <span className="text-amber-400 animate-pulse font-semibold">Downloading application file... অনুগ্রহ করে অপেক্ষা করুন...</span>
                    ) : (
                      <span>
                        🎉 Download completed! If it didn't start,{' '}
                        <button onClick={handleDownloadApp} className="text-emerald-400 font-black underline hover:text-emerald-300">
                          Click here to Re-download
                        </button>
                      </span>
                    )}
                  </p>
                </div>

                {/* Important Parsing Warning Alert */}
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs space-y-2 text-rose-200">
                  <p className="font-black text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>গুরুত্বপূর্ণ নোটিশ (Important Notice)</span>
                  </p>
                  <p className="leading-relaxed">
                    যেহেতু এটি একটি নিরাপদ ওয়েব প্ল্যাটফর্ম, ব্রাউজার সরাসরি আসল অ্যান্ড্রয়েড সিগনেচার ফাইল (.apk) তৈরি করতে পারে না। যার ফলে কিছু ফোনে APK ফাইলটি ইনস্টল করার সময় <strong className="text-white">"There was a problem parsing the package"</strong> বা প্যাকেজ পার্সিং ত্রুটি দেখাতে পারে।
                  </p>
                  <p className="leading-relaxed font-bold text-emerald-400">
                    ✅ এই সমস্যার স্থায়ী সমাধানের জন্য উপরে দেওয়া ১ম পদ্ধতি (Instant App) ব্যবহার করুন। এটি ১০০% কাজ করবে!
                  </p>
                </div>

                {/* Installation Guidelines for APK */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span>How to Install APK (APK ইনস্টল করার নিয়ম)</span>
                    <span className="h-px bg-slate-800 flex-1" />
                  </h3>
                  
                  <div className="space-y-3 text-xs">
                    {/* Step 1 */}
                    <div className="flex gap-3 bg-slate-900/50 p-3.5 rounded-xl border border-slate-900/80">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex-shrink-0 flex items-center justify-center font-black text-emerald-400 text-xs">১</div>
                      <div>
                        <h4 className="font-extrabold text-white mb-0.5">
                          Open APK & Tap "Settings" <span className="text-slate-400 font-normal">/ ফাইলটি ওপেন করে সেটিংস চাপুন</span>
                        </h4>
                        <p className="text-slate-400 leading-relaxed">
                          Simply tap the downloaded <span className="text-slate-200 font-semibold">ProbashiOptionPro.apk</span> file. A popup will appear. Click <span className="text-emerald-400 font-bold">"Settings"</span> and turn ON <span className="text-slate-200 font-semibold">"Allow from this source"</span>.
                          <br />
                          <span className="text-emerald-400/80">ডাউনলোড হওয়া ফাইলটিতে ক্লিক করুন। একটি পপ-আপ মেসেজ আসবে, সেখানে <strong className="text-emerald-400">Settings</strong>-এ চাপুন এবং <strong className="text-white">"Allow from this source" (অনুমতি দিন)</strong> অপশনটি চালু করুন।</span>
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-3 bg-slate-900/50 p-3.5 rounded-xl border border-slate-900/80">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex-shrink-0 flex items-center justify-center font-black text-emerald-400 text-xs">২</div>
                      <div>
                        <h4 className="font-extrabold text-white mb-0.5">
                          Click Install Anyway <span className="text-slate-400 font-normal">/ ইনস্টল এনিওয়ে চাপুন</span>
                        </h4>
                        <p className="text-slate-400 leading-relaxed">
                          Now go back and tap <span className="text-emerald-400 font-bold">"Install"</span>. If Google Play Protect warns you, click <span className="text-amber-400 font-bold">"Install Anyway"</span>.
                          <br />
                          <span className="text-emerald-400/80">অনুমতি দেওয়ার পর ব্যাক বাটনে চেপে <strong className="text-emerald-400">Install</strong>-এ চাপুন। কোনো ওয়ার্নিং আসলে <strong className="text-amber-400">"Install Anyway" (তবুও ইনস্টল করুন)</strong> সিলেক্ট করুন।</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setDownloadModalOpen(false)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider text-center transition-all"
              >
                Close / বন্ধ করুন
              </button>
              {downloadTab === 'apk' && (
                <button
                  onClick={handleDownloadApp}
                  disabled={downloadState === 'downloading'}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider text-center transition-all shadow shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadState === 'downloading' ? 'Downloading...' : 'Download Again'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


