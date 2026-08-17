import React, { useState, useEffect } from 'react';
import { User, PlatformSettings } from '../types';
import { 
  LogOut, 
  MessageCircle, 
  Sun, 
  Moon, 
  Wallet, 
  Menu, 
  X, 
  ArrowUpRight, 
  TrendingUp, 
  ChevronDown, 
  Trophy, 
  History, 
  ShieldAlert, 
  ArrowDownLeft, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  UserCheck, 
  Bell, 
  Copy, 
  ChevronRight, 
  Gift, 
  Download, 
  Settings, 
  Plus, 
  CreditCard, 
  ArrowRightLeft, 
  User as UserIcon,
  Shield,
  Volume2
} from 'lucide-react';

interface SidebarProps {
  user: User;
  accountType: 'live' | 'demo';
  setAccountType: (type: 'live' | 'demo') => void;
  activeView: 'trade' | 'deposit' | 'withdraw' | 'history' | 'leaderboard' | 'admin' | 'settings' | 'refer';
  setActiveView: (view: 'trade' | 'deposit' | 'withdraw' | 'history' | 'leaderboard' | 'admin' | 'settings' | 'refer') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  children: React.ReactNode;
}

const SidebarIcon = ({ icon, label, active, onClick, highlight }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, highlight?: boolean }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-xl transition-all ${
      active 
        ? highlight ? 'bg-amber-500/20 text-amber-400 font-black' : 'bg-emerald-500/10 text-emerald-400 font-black' 
        : highlight 
        ? 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10' 
        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
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

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    platform_name: "PROBASHI TRADING",
    bdt_rate: 125,
    min_deposit_usd: 10,
    min_withdraw_usd: 15,
    default_win_rate: 30,
    whatsapp_number: "+8801711982345",
    whatsapp_message: "Hello Support, I need assistance.",
    telegram_link: "https://t.me/probashitrading_support",
    support_email: "support@probashitrading.com",
    support_phone: "+880 1711-982345",
    announcement_enabled: true,
    announcement_text: "🔥 ডিপোজিট বোনাস ও ২৪/৭ ক্যাশ আউট হেল্পলাইন সক্রিয়।"
  });

  useEffect(() => {
    fetch('/api/platform-settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setPlatformSettings(data); })
      .catch(console.error);
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id.slice(0, 8));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const whatsappUrl = `https://wa.me/${(platformSettings.whatsapp_number || '+8801711982345').replace(/\D/g, '')}?text=${encodeURIComponent(platformSettings.whatsapp_message || 'Hello Probashi Trading Support, I need help.')}`;

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden bg-[#0b0e14]">
      {/* Left Sidebar (Desktop Only) */}
      <aside className="hidden md:flex w-20 flex-shrink-0 h-full bg-[#0b0e14] border-r border-slate-800 flex-col items-center py-4 justify-between z-50">
        <div className="flex flex-col items-center gap-5 w-full">
          <button
            onClick={() => setActiveView('trade')}
            className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-1 hover:scale-105 transition-transform"
          >
            <TrendingUp className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center gap-1.5 w-full">
            <SidebarIcon 
              icon={<TrendingUp className="w-5 h-5" />} 
              label="Trades"
              active={activeView === 'trade'} 
              onClick={() => setActiveView('trade')} 
            />
            <SidebarIcon 
              icon={<Trophy className="w-5 h-5 text-amber-400" />} 
              label="Top 20"
              active={activeView === 'leaderboard'} 
              onClick={() => setActiveView('leaderboard')} 
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

            {/* Admin Panel Icon (Visible only to admins) */}
            {user.role === 'admin' && (
              <SidebarIcon 
                icon={<Shield className="w-5 h-5 text-amber-400" />} 
                label="Admin"
                highlight={true}
                active={activeView === 'admin'} 
                onClick={() => setActiveView('admin')} 
              />
            )}

            <SidebarIcon 
              icon={<Settings className="w-5 h-5" />} 
              label="Settings"
              active={activeView === 'settings'} 
              onClick={() => setActiveView('settings')} 
            />
            <SidebarIcon 
              icon={<MessageCircle className="w-5 h-5 text-emerald-400" />} 
              label="Support"
              active={false} 
              onClick={() => window.open(whatsappUrl, "_blank")} 
            />
            <SidebarIcon 
              icon={<LogOut className="w-5 h-5 text-rose-400" />} 
              label="Logout"
              active={false} 
              onClick={() => fetch("/api/logout", { method: "POST" }).then(() => window.location.reload())} 
            />
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col h-full">
        {/* Top Announcement Bar if enabled */}
        {platformSettings.announcement_enabled && platformSettings.announcement_text && (
          <div className="bg-gradient-to-r from-amber-600 via-emerald-700 to-teal-800 text-white text-[11px] font-bold py-1.5 px-4 flex items-center justify-between shadow-sm select-none z-50">
            <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <span className="bg-black/30 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono">Notice</span>
              <span className="truncate">{platformSettings.announcement_text}</span>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-4 shrink-0 underline text-emerald-200 hover:text-white flex items-center gap-1 font-mono text-[10px]"
            >
              <span>WhatsApp Admin</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        )}

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
            <div className="hidden md:block px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-semibold uppercase">
              {user.role === 'admin' ? 'Admin Controller' : 'Institutional Pro'}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {/* Top 20 Winner Button */}
            <button
              onClick={() => setActiveView('leaderboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                activeView === 'leaderboard'
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-400'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-amber-400'
              }`}
              title="Top 20 Winners Leaderboard"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Top 20</span>
            </button>

            {/* Admin Direct Button in Header */}
            {user.role === 'admin' && (
              <button
                onClick={() => setActiveView('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                  activeView === 'admin'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400'
                }`}
                title="Admin Full Website Control Panel"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Panel</span>
              </button>
            )}

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
          <div className="fixed top-0 left-0 bottom-0 w-80 bg-[#0b0e14] border-r border-slate-800 p-6 space-y-6 z-50 flex flex-col justify-between shadow-2xl transition-transform text-white overflow-y-auto">
            
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

              {/* Navigation Links */}
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

                {user.role === 'admin' && (
                  <button
                    onClick={() => {
                      setActiveView('admin');
                      setLeftDrawerOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3 ${
                      activeView === 'admin'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 font-bold border border-amber-500/20'
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                    <span>Admin Control Panel (অ্যাডমিন)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveView('leaderboard');
                    setLeftDrawerOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3 ${
                    activeView === 'leaderboard'
                      ? 'bg-emerald-500 text-slate-950 font-extrabold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Top 20 Winners (টপ উইনার)</span>
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
                  <span>Instant Deposit (ডিপোজিট)</span>
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
                  <span>Fast Withdraw (ক্যাশ আউট)</span>
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
                  <span>Transactions History</span>
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
                  <span>Refer & Earn</span>
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
                <div className="h-px bg-slate-800 my-2"></div>
                <button
                  onClick={() => window.open(whatsappUrl, "_blank")}
                  className="w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3 text-emerald-400 hover:bg-slate-900 font-bold"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Support (WhatsApp)</span>
                </button>
                <button
                  onClick={() => fetch("/api/logout", { method: "POST" }).then(() => window.location.reload())}
                  className="w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3 text-rose-400 hover:bg-slate-900 font-bold"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>


          </div>
        </div>
      )}

      {/* 2. ACCOUNTS DRAWER */}
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

                {/* Real Account */}
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
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-500">
              Probashi Trading Multi-Asset Liquidity Gateway
            </div>
          </div>
        </div>
      )}

      {/* 3. PAYMENTS DRAWER */}
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

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setActiveView('deposit');
                    setPaymentsDrawerOpen(false);
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black p-4 rounded-2xl flex items-center gap-3 text-base shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Wallet className="w-5 h-5" />
                  <span>Deposit (ডিপোজিট)</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('withdraw');
                    setPaymentsDrawerOpen(false);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 text-base font-bold text-white transition-all"
                >
                  <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                  <span>Withdraw (ক্যাশ আউট)</span>
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

      {/* 4. PROFILE DRAWER */}
      {profileDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setProfileDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-80 md:w-96 bg-[#0b0e14] border-l border-slate-800 p-6 space-y-6 z-50 overflow-y-auto shadow-2xl transition-transform text-white scrollbar-none">
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

            <div className="text-center space-y-1">
              <h1 className="text-2xl font-black text-white tracking-tight font-heading">
                {user.name}
              </h1>
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-mono">
                <span>Role: <strong className="text-amber-400 uppercase">{user.role}</strong></span>
                <span className="text-slate-600">|</span>
                <span>ID {user.id.slice(0, 8)}</span>
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

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Menu Options
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl divide-y divide-slate-800">
                {user.role === 'admin' && (
                  <button 
                    onClick={() => {
                      setActiveView('admin');
                      setProfileDrawerOpen(false);
                    }}
                    className="w-full p-4 flex items-center justify-between text-sm font-bold text-amber-400 hover:bg-slate-800/50 transition-colors bg-amber-500/5"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-amber-400" />
                      <span>Admin Control Dashboard</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>
                )}

                <button 
                  onClick={() => {
                    setActiveView('leaderboard');
                    setProfileDrawerOpen(false);
                  }}
                  className="w-full p-4 flex items-center justify-between text-sm font-semibold text-white hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span>Top 20 Winners</span>
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

                <button 
                  onClick={() => window.open(whatsappUrl, "_blank")}
                  className="w-full p-4 flex items-center justify-between text-sm font-semibold text-white hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                    <span>WhatsApp Support</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button 
                  onClick={() => fetch("/api/logout", { method: "POST" }).then(() => window.location.reload())}
                  className="w-full p-4 flex items-center justify-between text-sm font-semibold text-rose-400 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
