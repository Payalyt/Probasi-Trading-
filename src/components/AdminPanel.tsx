import React, { useState, useEffect } from 'react';
import { User, Trade, Deposit, Withdrawal, CustomGateway, PlatformSettings, OutcomeControl } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  ShieldAlert,
  Users,
  TrendingUp,
  CreditCard,
  RefreshCw,
  DollarSign,
  Settings,
  Activity,
  ShieldCheck,
  Wallet,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  ExternalLink,
  Sliders,
  Sparkles,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Megaphone,
  UserPlus
} from 'lucide-react';

const BKASH_LOGO = "https://i.postimg.cc/MZNd4Pjq/55.png";
const NAGAD_LOGO = "https://i.postimg.cc/QtWfpBX1/1679248787Nagad-Logo.png";
const ROCKET_LOGO = "https://i.postimg.cc/ryRwMszC/unnamed.png";

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [customGateways, setCustomGateways] = useState<CustomGateway[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    platform_name: "PROBASHI TRADING",
    bdt_rate: 125,
    min_deposit_usd: 10,
    min_withdraw_usd: 15,
    default_win_rate: 30,
    whatsapp_number: "+8801711982345",
    whatsapp_message: "Hello Probashi Trading Support, I need assistance with my account.",
    telegram_link: "https://t.me/probashitrading_support",
    support_email: "support@probashitrading.com",
    support_phone: "+880 1711-982345",
    announcement_enabled: true,
    announcement_text: "🔥 স্পেশাল অফার: আজকের প্রতিটি ডিপোজিটে ২৫% বোনাস! ২৪/৭ হোয়াটসঅ্যাপ হেল্পলাইন সক্রিয়।"
  });

  const [activeTab, setActiveTab] = useState<'trades' | 'deposits' | 'withdrawals' | 'gateways' | 'support' | 'users' | 'settings'>('trades');
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Gateway Settings
  const [bkashSettings, setBkashSettings] = useState({ number: '01711982345', type: 'Cash Out', instructions: '', min_deposit: 10, max_deposit: 1000 });
  const [nagadSettings, setNagadSettings] = useState({ number: '01812443890', type: 'Cash Out', instructions: '', min_deposit: 10, max_deposit: 1000 });
  const [rocketSettings, setRocketSettings] = useState({ number: '01912443891', type: 'Send Money', instructions: '', min_deposit: 10, max_deposit: 1000 });
  const [cryptoNetworks, setCryptoNetworks] = useState([
    { network: "USDT (TRC20)", address: "TYDzsxd8V7U9xP1wQd98Bnm23Xcv987Zab" },
    { network: "USDT (BEP20)", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" },
    { network: "LTC (Litecoin)", address: "LTC1q56789abcdefghij987654321xyz" }
  ]);

  // Market Configs
  const [marketConfigs, setMarketConfigs] = useState<Record<string, { trend: number; volatility: number; tickStep: number }>>({});

  // Modals & Forms
  const [showAddGatewayModal, setShowAddGatewayModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState<CustomGateway | null>(null);
  const [newGatewayForm, setNewGatewayForm] = useState<Partial<CustomGateway>>({
    name: '',
    logo_url: '',
    account_number: '',
    account_type: 'Cash Out',
    min_amount: 10,
    max_amount: 1000,
    instructions: '',
    is_active: true
  });

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    actual_balance: 100,
    demo_balance: 10000,
    role: 'user'
  });

  const [editingUserBalance, setEditingUserBalance] = useState<{ user: User; live: number; demo: number } | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [depositFilter, setDepositFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'All' | 'Pending' | 'Audit_Required' | 'Approved' | 'Rejected'>('All');

  // Copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const showNotification = (msg: string) => {
    setSaveSuccessNotice(msg);
    setTimeout(() => setSaveSuccessNotice(null), 3500);
  };

  // Separate live real-time transactions polling from static form settings
  const fetchLiveTransactions = async () => {
    try {
      const [uRes, tRes, dRes, wRes, mcRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/trades'),
        fetch('/api/admin/deposits'),
        fetch('/api/admin/withdrawals'),
        fetch('/api/admin/market-configs')
      ]);

      if (uRes.ok) {
        let apiUsers: User[] = await uRes.json();
        try {
          const querySnapshot = await getDocs(collection(db, "users"));
          const firestoreUsers: User[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data && data.email) {
              firestoreUsers.push(data as User);
            }
          });
          if (firestoreUsers.length > 0) {
            const userMap = new Map<string, User>();
            apiUsers.forEach(u => userMap.set(u.email.toLowerCase(), u));
            firestoreUsers.forEach(u => {
              const key = u.email.toLowerCase();
              userMap.set(key, { ...userMap.get(key), ...u });
            });
            apiUsers = Array.from(userMap.values());
          }
        } catch (fsErr) {
          console.warn("Firestore users query note:", fsErr);
        }
        setUsers(apiUsers);
      }
      if (tRes.ok) setTrades(await tRes.json());
      if (dRes.ok) setDeposits(await dRes.json());
      if (wRes.ok) setWithdrawals(await wRes.json());
      if (mcRes.ok) setMarketConfigs(await mcRes.json());
    } catch (e) {
      console.error("Error polling transactions:", e);
    }
  };

  const fetchSettings = async () => {
    try {
      const [gRes, cgRes, sRes] = await Promise.all([
        fetch('/api/gateway-settings'),
        fetch('/api/custom-gateways'),
        fetch('/api/platform-settings')
      ]);

      if (gRes.ok) {
        const data = await gRes.json();
        if (data.Bkash) setBkashSettings(data.Bkash);
        if (data.Nagad) setNagadSettings(data.Nagad);
        if (data.Rocket) setRocketSettings(data.Rocket);
        if (data.Crypto) setCryptoNetworks(data.Crypto);
      }
      if (cgRes.ok) setCustomGateways(await cgRes.json());
      if (sRes.ok) setPlatformSettings(await sRes.json());
    } catch (e) {
      console.error("Error loading settings:", e);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchLiveTransactions(), fetchSettings()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
    // Live polling ONLY updates pending trades, deposits, and withdrawals without resetting form inputs
    const interval = setInterval(fetchLiveTransactions, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- TRADES CONTROL ---
  const handleSetOutcome = async (tradeId: string, outcome: OutcomeControl) => {
    try {
      const res = await fetch(`/api/admin/trade/${tradeId}/control`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome_control: outcome })
      });
      if (res.ok) {
        showNotification(`Trade ${tradeId} locked to ${outcome}`);
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateGlobalWinRate = async (rate: number) => {
    try {
      const updated = { ...platformSettings, default_win_rate: rate };
      setPlatformSettings(updated);
      await fetch('/api/admin/platform-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ default_win_rate: rate })
      });
      showNotification(`Default platform win rate updated to ${rate}%`);
    } catch (e) {
      console.error(e);
    }
  };

  // --- DEPOSITS CONTROL ---
  const handleProcessDeposit = async (depositId: string, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`/api/admin/deposit/${depositId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showNotification(`Deposit ${status === 'Approved' ? 'APPROVED & Auto-Credited' : 'REJECTED'}`);
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- WITHDRAWALS CONTROL ---
  const handleProcessWithdrawal = async (withdrawalId: string, status: 'Approved' | 'Rejected' | 'Audit_Required', refund: boolean = false) => {
    try {
      const res = await fetch(`/api/admin/withdrawal/${withdrawalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          notice: status === 'Audit_Required' ? 'SYSTEM PROTOCOL AUDIT REQUIRED' : status === 'Approved' ? 'PAYMENT COMPLETED' : 'WITHDRAWAL REJECTED',
          refund
        })
      });
      if (res.ok) {
        showNotification(`Withdrawal updated to ${status}${refund ? ' (Balance Refunded)' : ''}`);
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [savingBkash, setSavingBkash] = useState(false);
  const [savingNagad, setSavingNagad] = useState(false);
  const [savingRocket, setSavingRocket] = useState(false);
  const [savingAllGateways, setSavingAllGateways] = useState(false);

  // --- GATEWAY NUMBERS SAVE ---
  const handleSaveBkash = async () => {
    setSavingBkash(true);
    try {
      const res = await fetch('/api/admin/gateway-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Bkash: bkashSettings })
      });
      if (res.ok) {
        showNotification(`✅ বিকাশ নম্বর ${bkashSettings.number} সফলভাবে সেভ হয়েছে! (bKash saved)`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingBkash(false);
    }
  };

  const handleSaveNagad = async () => {
    setSavingNagad(true);
    try {
      const res = await fetch('/api/admin/gateway-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Nagad: nagadSettings })
      });
      if (res.ok) {
        showNotification(`✅ নগদ নম্বর ${nagadSettings.number} সফলভাবে সেভ হয়েছে! (Nagad saved)`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNagad(false);
    }
  };

  const handleSaveRocket = async () => {
    setSavingRocket(true);
    try {
      const res = await fetch('/api/admin/gateway-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Rocket: rocketSettings })
      });
      if (res.ok) {
        showNotification(`✅ রকেট নম্বর ${rocketSettings.number} সফলভাবে সেভ হয়েছে! (Rocket saved)`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingRocket(false);
    }
  };

  const handleSaveBuiltInGateways = async () => {
    setSavingAllGateways(true);
    try {
      const res = await fetch('/api/admin/gateway-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Bkash: bkashSettings,
          Nagad: nagadSettings,
          Rocket: rocketSettings,
          Crypto: cryptoNetworks
        })
      });
      if (res.ok) {
        showNotification('✅ All deposit numbers (bKash, Nagad, Rocket, Crypto) updated successfully!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAllGateways(false);
    }
  };

  // --- CUSTOM GATEWAYS ---
  const handleSaveCustomGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGateway) {
        const res = await fetch(`/api/admin/custom-gateway/${editingGateway.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newGatewayForm)
        });
        if (res.ok) {
          showNotification(`Gateway "${newGatewayForm.name}" updated!`);
          setShowAddGatewayModal(false);
          setEditingGateway(null);
          fetchAllData();
        }
      } else {
        const res = await fetch('/api/admin/custom-gateway', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newGatewayForm)
        });
        if (res.ok) {
          showNotification(`New Gateway "${newGatewayForm.name}" added successfully!`);
          setShowAddGatewayModal(false);
          setNewGatewayForm({
            name: '',
            logo_url: '',
            account_number: '',
            account_type: 'Cash Out',
            min_amount: 10,
            max_amount: 1000,
            instructions: '',
            is_active: true
          });
          fetchAllData();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCustomGateway = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment gateway?')) return;
    try {
      const res = await fetch(`/api/admin/custom-gateway/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('Payment gateway removed.');
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- PLATFORM & WHATSAPP SETTINGS ---
  const handleSavePlatformSettings = async () => {
    try {
      const res = await fetch('/api/admin/platform-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(platformSettings)
      });
      if (res.ok) {
        showNotification('WhatsApp support & platform settings saved successfully!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- USER CONTROLS ---
  const handleSaveUserBalance = async () => {
    if (!editingUserBalance) return;
    const { user, live, demo } = editingUserBalance;

    // Optimistic UI update
    setUsers(prev => prev.map(u => u.id === user.id ? {
      ...u,
      displayed_balance: live,
      actual_balance: live,
      demo_balance: demo
    } : u));

    try {
      const res = await fetch(`/api/admin/user/${user.id}/balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayed_balance: live,
          actual_balance: live,
          demo_balance: demo
        })
      });
      if (res.ok) {
        showNotification(`✅ Balance updated successfully for ${user.name || user.email}!`);
        setEditingUserBalance(null);
        fetchAllData();
      } else {
        const err = await res.json();
        showNotification(`⚠️ Failed: ${err.error || 'Server error'}`);
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
      showNotification('⚠️ Network error updating balance');
      fetchAllData();
    }
  };

  const handleQuickAddBalance = async (user: User, amount: number) => {
    // Optimistic UI update
    setUsers(prev => prev.map(u => u.id === user.id ? {
      ...u,
      displayed_balance: Number((u.displayed_balance + amount).toFixed(2)),
      actual_balance: Number((u.actual_balance + amount).toFixed(2))
    } : u));

    try {
      const res = await fetch(`/api/admin/user/${user.id}/balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ add_amount: amount })
      });
      if (res.ok) {
        showNotification(`✅ Added +$${amount} to ${user.name || user.email}`);
        fetchAllData();
      } else {
        showNotification(`⚠️ Failed to add funds`);
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
      fetchAllData();
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user account "${userName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/user/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification(`🗑️ User deleted: ${userName}`);
        setUsers(prev => prev.filter(u => u.id !== userId));
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleUserTradingMode = async (userId: string, currentMode?: string) => {
    const nextMode = currentMode === 'always_win' ? 'always_loss' : currentMode === 'always_loss' ? 'normal' : 'always_win';
    try {
      const res = await fetch(`/api/admin/user/${userId}/trading-mode`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trading_mode: nextMode })
      });
      if (res.ok) {
        showNotification(`User trading mode set to: ${nextMode.toUpperCase()}`);
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const res = await fetch(`/api/admin/user/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showNotification(`User account is now ${newStatus.toUpperCase()}`);
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm)
      });
      if (res.ok) {
        showNotification(`Account created for ${newUserForm.email}`);
        setShowAddUserModal(false);
        setNewUserForm({ name: '', email: '', actual_balance: 100, demo_balance: 10000, role: 'user' });
        fetchAllData();
      } else {
        const errorData = await res.json();
        showNotification(`Error: ${errorData.error || 'Failed to create user'}`);
      }
    } catch (e) {
      console.error(e);
      showNotification('An unexpected error occurred');
    }
  };

  // --- MARKET TREND CONTROL ---
  const handleUpdateMarketTrend = async (asset: string, trend: number, vol: number) => {
    try {
      await fetch(`/api/admin/market-config/${encodeURIComponent(asset)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trend, volatility: vol })
      });
      showNotification(`${asset} market bias updated`);
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered lists
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredDeposits = deposits.filter(d =>
    depositFilter === 'All' ? true : d.status === depositFilter
  );

  const filteredWithdrawals = withdrawals.filter(w =>
    withdrawalFilter === 'All' ? true : w.status === withdrawalFilter
  );

  const pendingDepositsCount = deposits.filter(d => d.status === 'Pending').length;
  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'Pending' || w.status === 'Audit_Required').length;
  const activeTradesCount = trades.filter(t => t.trade_status === 'Pending').length;

  return (
    <div className="w-full min-h-screen bg-[#07090e] text-slate-100 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {saveSuccessNotice && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-300">
          <CheckCircle2 className="w-5 h-5" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Top Header & System Status */}
      <div className="bg-[#0e121b] border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">MASTER ADMIN COMMAND CENTER</h1>
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">
                  Full Authority
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live control of Deposits, Cash Out Withdrawals, Gateways, WhatsApp Support, Win Rates, and User Balances.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchAllData}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Terminal</span>
            </button>
            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold">Engine Live</span>
            </div>
          </div>
        </div>

        {/* Global Key Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-[#131824] p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Pending Deposits</div>
            <div className="text-xl font-black text-amber-400 mt-1 flex items-center justify-between">
              <span>{pendingDepositsCount}</span>
              <CreditCard className="w-4 h-4 text-amber-400/60" />
            </div>
          </div>

          <div className="bg-[#131824] p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Pending Cash Outs</div>
            <div className="text-xl font-black text-rose-400 mt-1 flex items-center justify-between">
              <span>{pendingWithdrawalsCount}</span>
              <Wallet className="w-4 h-4 text-rose-400/60" />
            </div>
          </div>

          <div className="bg-[#131824] p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Active Live Trades</div>
            <div className="text-xl font-black text-cyan-400 mt-1 flex items-center justify-between">
              <span>{activeTradesCount}</span>
              <Activity className="w-4 h-4 text-cyan-400/60" />
            </div>
          </div>

          <div className="bg-[#131824] p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Total Users</div>
            <div className="text-xl font-black text-indigo-400 mt-1 flex items-center justify-between">
              <span>{users.length}</span>
              <Users className="w-4 h-4 text-indigo-400/60" />
            </div>
          </div>

          <div className="bg-[#131824] p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Global Win Rate</div>
            <div className="text-xl font-black text-emerald-400 mt-1 flex items-center justify-between">
              <span>{platformSettings.default_win_rate}%</span>
              <Sliders className="w-4 h-4 text-emerald-400/60" />
            </div>
          </div>

          <div className="bg-[#131824] p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">USD to BDT Rate</div>
            <div className="text-xl font-black text-white mt-1 flex items-center justify-between">
              <span>৳{platformSettings.bdt_rate}</span>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'trades', label: 'Live Trades & Rig Engine', icon: Activity, badge: activeTradesCount },
          { id: 'deposits', label: 'Deposits Review', icon: CreditCard, badge: pendingDepositsCount, alert: pendingDepositsCount > 0 },
          { id: 'withdrawals', label: 'Withdrawals (Cash Out)', icon: Wallet, badge: pendingWithdrawalsCount, alert: pendingWithdrawalsCount > 0 },
          { id: 'gateways', label: 'Payment Gateways & Numbers', icon: DollarSign },
          { id: 'support', label: 'WhatsApp & Support Setup', icon: MessageSquare },
          { id: 'users', label: 'Users & Balances', icon: Users },
          { id: 'settings', label: 'Platform & Currency', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/20'
                  : 'bg-[#0e121b] text-slate-400 hover:text-slate-200 hover:bg-[#151b27] border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  isActive ? 'bg-white text-rose-600' : tab.alert ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-200'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE TRADES & RIG ENGINE */}
      {/* ========================================================================= */}
      {activeTab === 'trades' && (
        <div className="space-y-6">
          {/* Win Rate Multiplier Slider Card */}
          <div className="bg-[#0e121b] border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base font-bold text-white">Platform Win/Loss Probability Engine</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust default win rate percentage for all user trades when set to Auto mode. (Currently {platformSettings.default_win_rate}% Win / {100 - platformSettings.default_win_rate}% Loss).
                </p>
              </div>

              <div className="flex items-center gap-4 bg-[#131824] p-3 rounded-xl border border-slate-700">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={platformSettings.default_win_rate}
                  onChange={(e) => handleUpdateGlobalWinRate(Number(e.target.value))}
                  className="w-44 accent-rose-500 cursor-pointer"
                />
                <div className="w-16 text-center font-mono font-black text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 py-1 px-2 rounded-lg">
                  {platformSettings.default_win_rate}%
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleUpdateGlobalWinRate(15)}
                    className="text-[10px] bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-bold px-2 py-1 rounded border border-rose-800/40"
                  >
                    15% (Hard)
                  </button>
                  <button
                    onClick={() => handleUpdateGlobalWinRate(30)}
                    className="text-[10px] bg-amber-950/60 hover:bg-amber-900 text-amber-300 font-bold px-2 py-1 rounded border border-amber-800/40"
                  >
                    30% (Std)
                  </button>
                  <button
                    onClick={() => handleUpdateGlobalWinRate(60)}
                    className="text-[10px] bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 font-bold px-2 py-1 rounded border border-emerald-800/40"
                  >
                    60% (Easy)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Trades Table with 1-Click Rig Control */}
          <div className="bg-[#0e121b] border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span>Real-Time Trades Monitoring & Rig Control</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  View all active and finished trades. Override individual outcomes to Force Win or Force Loss before expiry.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">Total Recorded: {trades.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-[#131824]">
                    <th className="p-3">Trade ID</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Asset</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Investment</th>
                    <th className="p-3">Entry Price</th>
                    <th className="p-3">Expires In</th>
                    <th className="p-3">Account</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Admin Rig Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {trades.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-slate-500">No trading activity recorded yet.</td>
                    </tr>
                  ) : (
                    trades.map((trade) => {
                      const isPending = trade.trade_status === 'Pending';
                      const secondsLeft = Math.max(0, Math.ceil((trade.expires_at - Date.now()) / 1000));
                      return (
                        <tr key={trade.id} className="hover:bg-[#131824]/60 transition-colors">
                          <td className="p-3 font-mono text-slate-400">{trade.id}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-200">{trade.user_name || trade.user_id}</div>
                          </td>
                          <td className="p-3 font-bold text-white">{trade.asset_name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              trade.trade_type === 'Buy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {trade.trade_type === 'Buy' ? 'CALL (UP)' : 'PUT (DOWN)'}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-white">${trade.investment_amount.toFixed(2)}</td>
                          <td className="p-3 font-mono text-slate-300">{trade.entry_price}</td>
                          <td className="p-3 font-mono">
                            {isPending ? (
                              <span className="text-amber-400 font-bold animate-pulse">{secondsLeft}s left</span>
                            ) : (
                              <span className="text-slate-500">Expired</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              trade.account_type === 'live' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'
                            }`}>
                              {trade.account_type.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              trade.trade_status === 'Win'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : trade.trade_status === 'Loss'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}>
                              {trade.trade_status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleSetOutcome(trade.id, 'Force_Win')}
                                  className={`px-2.5 py-1 rounded text-[10px] font-black transition-all ${
                                    trade.outcome_control === 'Force_Win'
                                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                                      : 'bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-700'
                                  }`}
                                >
                                  FORCE WIN
                                </button>
                                <button
                                  onClick={() => handleSetOutcome(trade.id, 'Force_Loss')}
                                  className={`px-2.5 py-1 rounded text-[10px] font-black transition-all ${
                                    trade.outcome_control === 'Force_Loss'
                                      ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                                      : 'bg-rose-950/80 hover:bg-rose-800 text-rose-300 border border-rose-700'
                                  }`}
                                >
                                  FORCE LOSS
                                </button>
                                <button
                                  onClick={() => handleSetOutcome(trade.id, 'Auto')}
                                  className={`px-2 py-1 rounded text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 ${
                                    trade.outcome_control === 'Auto' ? 'opacity-50' : ''
                                  }`}
                                >
                                  Auto
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-500 font-mono text-[11px]">
                                {trade.profit !== undefined ? (trade.profit >= 0 ? `+${trade.profit.toFixed(2)}` : `${trade.profit.toFixed(2)}`) : 'Settled'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DEPOSITS REVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'deposits' && (
        <div className="bg-[#0e121b] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span>Deposits Approvals & Balances Credit</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify mobile banking (bKash/Nagad/Rocket) and crypto transaction IDs. Approving will automatically credit the user's real balance.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-[#131824] p-1 rounded-xl border border-slate-800">
              {['All', 'Pending', 'Approved', 'Rejected'].map((f) => (
                <button
                  key={f}
                  onClick={() => setDepositFilter(f as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    depositFilter === f
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-[#131824]">
                  <th className="p-3">Deposit ID</th>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Amount ($ / ৳)</th>
                  <th className="p-3">Transaction ID (TrxID)</th>
                  <th className="p-3">Date / Time</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDeposits.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">No deposit requests found in this filter.</td>
                  </tr>
                ) : (
                  filteredDeposits.map((dep) => {
                    const isPending = dep.status === 'Pending';
                    const bdtAmount = (dep.amount * platformSettings.bdt_rate).toLocaleString();
                    return (
                      <tr key={dep.id} className="hover:bg-[#131824]/60 transition-colors">
                        <td className="p-3 font-mono text-slate-400">{dep.id}</td>
                        <td className="p-3">
                          <div className="font-bold text-white">{dep.user_name || dep.user_id}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {dep.method === 'Bkash' && <img src={BKASH_LOGO} alt="bKash" className="w-5 h-5 object-contain" />}
                            {dep.method === 'Nagad' && <img src={NAGAD_LOGO} alt="Nagad" className="w-5 h-5 object-contain" />}
                            {dep.method === 'Rocket' && <img src={ROCKET_LOGO} alt="Rocket" className="w-5 h-5 object-contain" />}
                            <span className="font-bold text-slate-200">{dep.method}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold">
                          <div className="text-emerald-400">${dep.amount.toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400">৳{bdtAmount} BDT</div>
                        </td>
                        <td className="p-3 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#161c2b] border border-slate-700 px-2 py-1 rounded text-amber-300 font-bold text-xs select-all">
                              {dep.transaction_id}
                            </span>
                            <button
                              onClick={() => copyToClipboard(dep.transaction_id, dep.id)}
                              className="text-slate-400 hover:text-white"
                              title="Copy TrxID"
                            >
                              {copiedId === dep.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-slate-400">{new Date(dep.created_at).toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            dep.status === 'Approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : dep.status === 'Rejected'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          }`}>
                            {dep.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleProcessDeposit(dep.id, 'Approved')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3 py-1.5 rounded-lg text-xs transition-all shadow-md shadow-emerald-900/40"
                              >
                                APPROVE & CREDIT
                              </button>
                              <button
                                onClick={() => handleProcessDeposit(dep.id, 'Rejected')}
                                className="bg-rose-950/80 hover:bg-rose-800 text-rose-300 border border-rose-700 font-black px-3 py-1.5 rounded-lg text-xs transition-all"
                              >
                                REJECT
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs">Processed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WITHDRAWALS (CASH OUT) */}
      {/* ========================================================================= */}
      {activeTab === 'withdrawals' && (
        <div className="bg-[#0e121b] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-rose-400" />
                <span>Withdrawals (Cash Out) Review & Payout</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review cash out requests to bKash, Nagad, Rocket, or crypto wallets. Rejecting can automatically refund the amount to the user.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-[#131824] p-1 rounded-xl border border-slate-800">
              {['All', 'Pending', 'Audit_Required', 'Approved', 'Rejected'].map((f) => (
                <button
                  key={f}
                  onClick={() => setWithdrawalFilter(f as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    withdrawalFilter === f
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-[#131824]">
                  <th className="p-3">ID</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Receiver Account</th>
                  <th className="p-3">Amount ($ / ৳)</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">No withdrawal requests found.</td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((wth) => {
                    const isPending = wth.status === 'Pending' || wth.status === 'Audit_Required';
                    const bdtAmount = (wth.amount * platformSettings.bdt_rate).toLocaleString();
                    return (
                      <tr key={wth.id} className="hover:bg-[#131824]/60 transition-colors">
                        <td className="p-3 font-mono text-slate-400">{wth.id}</td>
                        <td className="p-3 font-bold text-white">{wth.user_name || wth.user_id}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {wth.method === 'Bkash' && <img src={BKASH_LOGO} alt="bKash" className="w-5 h-5 object-contain" />}
                            {wth.method === 'Nagad' && <img src={NAGAD_LOGO} alt="Nagad" className="w-5 h-5 object-contain" />}
                            {wth.method === 'Rocket' && <img src={ROCKET_LOGO} alt="Rocket" className="w-5 h-5 object-contain" />}
                            <span className="font-bold text-slate-200">{wth.method}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#161c2b] border border-slate-700 px-2.5 py-1 rounded text-cyan-300 font-bold select-all">
                              {wth.account_number}
                            </span>
                            <button
                              onClick={() => copyToClipboard(wth.account_number, wth.id)}
                              className="text-slate-400 hover:text-white"
                              title="Copy Receiver Account"
                            >
                              {copiedId === wth.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold">
                          <div className="text-rose-400">${wth.amount.toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400">৳{bdtAmount} BDT</div>
                        </td>
                        <td className="p-3 text-slate-400">{new Date(wth.created_at).toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            wth.status === 'Approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : wth.status === 'Rejected'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : wth.status === 'Audit_Required'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 animate-pulse'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          }`}>
                            {wth.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleProcessWithdrawal(wth.id, 'Approved')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-2.5 py-1 rounded text-xs transition-all shadow-md shadow-emerald-900/40"
                              >
                                APPROVE & PAID
                              </button>
                              <button
                                onClick={() => handleProcessWithdrawal(wth.id, 'Audit_Required')}
                                className="bg-purple-950/80 hover:bg-purple-800 text-purple-300 border border-purple-700 font-bold px-2 py-1 rounded text-[11px]"
                              >
                                AUDIT FLAG
                              </button>
                              <button
                                onClick={() => handleProcessWithdrawal(wth.id, 'Rejected', true)}
                                className="bg-rose-950/80 hover:bg-rose-800 text-rose-300 border border-rose-700 font-bold px-2 py-1 rounded text-[11px]"
                              >
                                REJECT & REFUND
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs">Completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PAYMENT GATEWAYS & DEPOSIT NUMBERS */}
      {/* ========================================================================= */}
      {activeTab === 'gateways' && (
        <div className="space-y-6">
          {/* Built-in Bangladeshi Gateways Numbers */}
          <div className="bg-[#0e121b] border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-pink-500" />
                  <span>Bangladeshi Mobile Banking Deposit Numbers</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Change official bKash, Nagad, and Rocket account numbers and transfer types displayed to users on the Deposit page.
                </p>
              </div>
              <button
                onClick={handleSaveBuiltInGateways}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-600/30"
              >
                Save Numbers
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* bKash Card */}
              <div className="bg-[#131824] p-5 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={BKASH_LOGO} alt="bKash" className="w-8 h-8 object-contain" />
                      <div>
                        <h3 className="font-bold text-sm text-white">bKash Account</h3>
                        <span className="text-[10px] text-pink-400 font-semibold">Active Deposit Gateway</span>
                      </div>
                    </div>
                    <span className="bg-pink-950/60 text-pink-300 border border-pink-700/50 text-[10px] font-bold px-2 py-0.5 rounded">
                      Live on Deposit
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                        bKash Account Number (বিকাশ নম্বর)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={bkashSettings.number}
                          onChange={(e) => setBkashSettings({ ...bkashSettings, number: e.target.value })}
                          placeholder="e.g. 017XXXXXXXX"
                          className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono outline-none focus:border-pink-500 pr-16"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(bkashSettings.number, 'bkash_num')}
                          className="absolute right-2 top-2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
                        >
                          {copiedId === 'bkash_num' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Transfer Type</label>
                      <select
                        value={bkashSettings.type}
                        onChange={(e) => setBkashSettings({ ...bkashSettings, type: e.target.value })}
                        className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-pink-500"
                      >
                        <option value="Cash Out">Cash Out (ক্যাশ আউট)</option>
                        <option value="Send Money">Send Money (সেন্ড মানি)</option>
                        <option value="Payment / Merchant">Payment / Merchant</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Deposit Instructions (বাংলা নির্দেশাবলী)</label>
                      <textarea
                        rows={2}
                        value={bkashSettings.instructions}
                        onChange={(e) => setBkashSettings({ ...bkashSettings, instructions: e.target.value })}
                        placeholder="বিকাশ ক্যাশআউট করার পর TrxID সাবমিট করুন..."
                        className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveBkash}
                  disabled={savingBkash}
                  className="w-full bg-pink-600 hover:bg-pink-500 active:bg-pink-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md shadow-pink-900/30 flex items-center justify-center gap-2 mt-2"
                >
                  {savingBkash ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{savingBkash ? 'Saving bKash...' : 'Save bKash Number (বিকাশ সেভ করুন)'}</span>
                </button>
              </div>

              {/* Nagad Card */}
              <div className="bg-[#131824] p-5 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={NAGAD_LOGO} alt="Nagad" className="w-8 h-8 object-contain" />
                      <div>
                        <h3 className="font-bold text-sm text-white">Nagad Account</h3>
                        <span className="text-[10px] text-amber-400 font-semibold">Active Deposit Gateway</span>
                      </div>
                    </div>
                    <span className="bg-amber-950/60 text-amber-300 border border-amber-700/50 text-[10px] font-bold px-2 py-0.5 rounded">
                      Live on Deposit
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                        Nagad Account Number (নগদ নম্বর)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={nagadSettings.number}
                          onChange={(e) => setNagadSettings({ ...nagadSettings, number: e.target.value })}
                          placeholder="e.g. 018XXXXXXXX"
                          className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono outline-none focus:border-amber-500 pr-16"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(nagadSettings.number, 'nagad_num')}
                          className="absolute right-2 top-2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
                        >
                          {copiedId === 'nagad_num' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Transfer Type</label>
                      <select
                        value={nagadSettings.type}
                        onChange={(e) => setNagadSettings({ ...nagadSettings, type: e.target.value })}
                        className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-amber-500"
                      >
                        <option value="Cash Out">Cash Out (ক্যাশ আউট)</option>
                        <option value="Send Money">Send Money (সেন্ড মানি)</option>
                        <option value="Merchant Payment">Merchant Payment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Deposit Instructions (বাংলা নির্দেশাবলী)</label>
                      <textarea
                        rows={2}
                        value={nagadSettings.instructions}
                        onChange={(e) => setNagadSettings({ ...nagadSettings, instructions: e.target.value })}
                        placeholder="নগদ ক্যাশআউট সম্পন্ন করে TrxID প্রদান করুন..."
                        className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveNagad}
                  disabled={savingNagad}
                  className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md shadow-amber-900/30 flex items-center justify-center gap-2 mt-2"
                >
                  {savingNagad ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{savingNagad ? 'Saving Nagad...' : 'Save Nagad Number (নগদ সেভ করুন)'}</span>
                </button>
              </div>

              {/* Rocket Card */}
              <div className="bg-[#131824] p-5 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={ROCKET_LOGO} alt="Rocket" className="w-8 h-8 object-contain" />
                      <div>
                        <h3 className="font-bold text-sm text-white">Rocket (DBBL) Account</h3>
                        <span className="text-[10px] text-purple-400 font-semibold">Active Deposit Gateway</span>
                      </div>
                    </div>
                    <span className="bg-purple-950/60 text-purple-300 border border-purple-700/50 text-[10px] font-bold px-2 py-0.5 rounded">
                      Live on Deposit
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                        Rocket Account Number (রকেট ১২ ডিজিট নম্বর)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={rocketSettings.number}
                          onChange={(e) => setRocketSettings({ ...rocketSettings, number: e.target.value })}
                          placeholder="e.g. 019XXXXXXXXX"
                          className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono outline-none focus:border-purple-500 pr-16"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(rocketSettings.number, 'rocket_num')}
                          className="absolute right-2 top-2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
                        >
                          {copiedId === 'rocket_num' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Transfer Type</label>
                      <select
                        value={rocketSettings.type}
                        onChange={(e) => setRocketSettings({ ...rocketSettings, type: e.target.value })}
                        className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-purple-500"
                      >
                        <option value="Send Money">Send Money (সেন্ড মানি)</option>
                        <option value="Cash Out">Cash Out (ক্যাশ আউট)</option>
                        <option value="Merchant Payment">Merchant Payment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Deposit Instructions (বাংলা নির্দেশাবলী)</label>
                      <textarea
                        rows={2}
                        value={rocketSettings.instructions}
                        onChange={(e) => setRocketSettings({ ...rocketSettings, instructions: e.target.value })}
                        placeholder="রকেট ১২ ডিজিট নম্বরে টাকা পাঠিয়ে TrxID প্রদান করুন..."
                        className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveRocket}
                  disabled={savingRocket}
                  className="w-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md shadow-purple-900/30 flex items-center justify-center gap-2 mt-2"
                >
                  {savingRocket ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{savingRocket ? 'Saving Rocket...' : 'Save Rocket Number (রকেট সেভ করুন)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Custom Payment Gateways Manager */}
          <div className="bg-[#0e121b] border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  <span>Custom Payment Gateways (Upay, Cellfin, Bank, Binance Pay, etc.)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add custom deposit methods dynamically. Users will see these on the Deposit page.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingGateway(null);
                  setNewGatewayForm({
                    name: '',
                    logo_url: '',
                    account_number: '',
                    account_type: 'Cash Out',
                    min_amount: 10,
                    max_amount: 1000,
                    instructions: '',
                    is_active: true
                  });
                  setShowAddGatewayModal(true);
                }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-900/40"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Payment Gateway</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customGateways.map((gw) => (
                <div key={gw.id} className="bg-[#131824] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={gw.logo_url || "https://cdn-icons-png.flaticon.com/512/893/893081.png"}
                        alt={gw.name}
                        className="w-10 h-10 object-contain rounded-lg bg-white/5 p-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/893/893081.png";
                        }}
                      />
                      <div>
                        <h4 className="font-bold text-sm text-white">{gw.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          gw.is_active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {gw.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingGateway(gw);
                          setNewGatewayForm(gw);
                          setShowAddGatewayModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomGateway(gw.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-200 bg-rose-950/60 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs border-t border-slate-800 pt-2 font-mono">
                    <div className="text-slate-400 text-[11px]">Number / Address: <span className="text-slate-200 font-bold">{gw.account_number}</span></div>
                    <div className="text-slate-400 text-[11px]">Type: <span className="text-amber-400">{gw.account_type}</span></div>
                    <div className="text-slate-400 text-[11px]">Limit: <span className="text-emerald-400">${gw.min_amount} - ${gw.max_amount}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crypto Wallets */}
          <div className="bg-[#0e121b] border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-cyan-400" />
                  <span>Crypto Deposit Wallets</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure TRC20, BEP20, and other crypto deposit wallet addresses.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveBuiltInGateways}
                disabled={savingAllGateways}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-cyan-900/30 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Crypto Addresses</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cryptoNetworks.map((net, idx) => (
                <div key={idx} className="bg-[#131824] p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="font-bold text-xs text-white">{net.network}</div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Network Name</label>
                    <input
                      type="text"
                      value={net.network}
                      onChange={(e) => {
                        const updated = [...cryptoNetworks];
                        updated[idx].network = e.target.value;
                        setCryptoNetworks(updated);
                      }}
                      className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Wallet Address</label>
                    <input
                      type="text"
                      value={net.address}
                      onChange={(e) => {
                        const updated = [...cryptoNetworks];
                        updated[idx].address = e.target.value;
                        setCryptoNetworks(updated);
                      }}
                      className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: WHATSAPP & SUPPORT SETUP */}
      {/* ========================================================================= */}
      {activeTab === 'support' && (
        <div className="bg-[#0e121b] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>WhatsApp Live Chat & Helpline Management</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure WhatsApp contact number, welcome message, Telegram support channel, and website announcement banner.
              </p>
            </div>
            <button
              onClick={handleSavePlatformSettings}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/30"
            >
              Save Support Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WhatsApp Card */}
            <div className="bg-[#131824] p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-white">WhatsApp Official Support</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                    WhatsApp Number (with Country Code)
                  </label>
                  <input
                    type="text"
                    value={platformSettings.whatsapp_number}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, whatsapp_number: e.target.value })}
                    placeholder="+8801711982345"
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                    Default Pre-Filled Message
                  </label>
                  <textarea
                    rows={3}
                    value={platformSettings.whatsapp_message}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, whatsapp_message: e.target.value })}
                    placeholder="Hello Admin Support, I need help with deposit/withdrawal..."
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-3 bg-[#0a0d14] rounded-lg border border-slate-800 text-xs">
                  <div className="text-slate-400 text-[11px]">Direct WhatsApp Link Preview:</div>
                  <a
                    href={`https://wa.me/${platformSettings.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(platformSettings.whatsapp_message)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 font-mono flex items-center gap-1 mt-1 hover:underline break-all"
                  >
                    <span>https://wa.me/{platformSettings.whatsapp_number.replace(/\D/g, '')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Telegram & Helpline Card */}
            <div className="bg-[#131824] p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-white">Telegram & Email Support</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Telegram Support / Channel Link</label>
                  <input
                    type="text"
                    value={platformSettings.telegram_link}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, telegram_link: e.target.value })}
                    placeholder="https://t.me/your_channel"
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Support Email</label>
                  <input
                    type="email"
                    value={platformSettings.support_email}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, support_email: e.target.value })}
                    placeholder="support@probashi.com"
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Customer Helpline Phone</label>
                  <input
                    type="text"
                    value={platformSettings.support_phone}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, support_phone: e.target.value })}
                    placeholder="+880 1711-982345"
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Announcement Banner Setup */}
          <div className="bg-[#131824] p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Megaphone className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Top Notice / Announcement Banner</h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={platformSettings.announcement_enabled}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, announcement_enabled: e.target.checked })}
                  className="w-4 h-4 accent-rose-600 rounded"
                />
                <span>Enable Notice Banner</span>
              </label>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Banner Text (Bengali / English)</label>
              <input
                type="text"
                value={platformSettings.announcement_text}
                onChange={(e) => setPlatformSettings({ ...platformSettings, announcement_text: e.target.value })}
                className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2.5 text-xs text-amber-300 font-medium outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: USERS & BALANCES */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="bg-[#0e121b] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Users Accounts & Balances Manager</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage user balances, add funds instantly, ban/unban users, configure targeted trading bias (Normal, 100% Always Win, 100% Always Loss).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="bg-[#131824] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none w-52"
              />
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-indigo-900/40"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Create User</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-[#131824]">
                  <th className="p-3">User ID</th>
                  <th className="p-3">Name / Email</th>
                  <th className="p-3">Live Balance ($)</th>
                  <th className="p-3">Demo Balance ($)</th>
                  <th className="p-3">Quick Add Funds</th>
                  <th className="p-3">Trading Bias</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">
                      No users found. Create one using the "+ Create User" button above.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#131824]/60 transition-colors">
                      <td className="p-3 font-mono text-slate-400">{u.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{u.name || 'Trader'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400 text-sm">
                        ${(u.displayed_balance ?? u.actual_balance ?? 0).toFixed(2)}
                      </td>
                      <td className="p-3 font-mono text-amber-400">
                        ${(u.demo_balance ?? 10000).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickAddBalance(u, 10)}
                            className="bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/80 px-2 py-1 rounded text-[10px] font-bold transition-all"
                            title="Add +$10"
                          >
                            +$10
                          </button>
                          <button
                            onClick={() => handleQuickAddBalance(u, 50)}
                            className="bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/80 px-2 py-1 rounded text-[10px] font-bold transition-all"
                            title="Add +$50"
                          >
                            +$50
                          </button>
                          <button
                            onClick={() => handleQuickAddBalance(u, 100)}
                            className="bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/80 px-2 py-1 rounded text-[10px] font-bold transition-all"
                            title="Add +$100"
                          >
                            +$100
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleUserTradingMode(u.id, u.trading_mode)}
                          className={`px-2.5 py-1 rounded text-[10px] font-black uppercase transition-all ${
                            u.trading_mode === 'always_win'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
                              : u.trading_mode === 'always_loss'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                          title="Click to cycle: Normal -> Always Win -> Always Loss"
                        >
                          {u.trading_mode ? u.trading_mode.replace('_', ' ') : 'NORMAL'}
                        </button>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.status === 'active'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {u.status}
                        </button>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          u.role === 'admin' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingUserBalance({ user: u, live: u.displayed_balance ?? u.actual_balance ?? 0, demo: u.demo_balance ?? 10000 })}
                            className="flex items-center gap-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold px-3 py-1.5 rounded-lg text-xs border border-indigo-500/30 hover:border-indigo-600 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Balance</span>
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name || u.email)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-all"
                              title="Delete user account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: PLATFORM & CURRENCY SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="bg-[#0e121b] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-300" />
                <span>Global Platform & Currency Configuration</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set conversion rates for Bangladeshi Taka (BDT), min/max limits, and platform name.
              </p>
            </div>
            <button
              onClick={handleSavePlatformSettings}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-600/30"
            >
              Save Platform Config
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#131824] p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase">Platform Display Name</label>
              <input
                type="text"
                value={platformSettings.platform_name}
                onChange={(e) => setPlatformSettings({ ...platformSettings, platform_name: e.target.value })}
                className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-bold"
              />
            </div>

            <div className="bg-[#131824] p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase">1 USD = BDT Rate (৳)</label>
              <input
                type="number"
                value={platformSettings.bdt_rate}
                onChange={(e) => setPlatformSettings({ ...platformSettings, bdt_rate: Number(e.target.value) })}
                className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2.5 text-xs text-emerald-400 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-500">Auto converts all deposit & withdrawal amounts.</span>
            </div>

            <div className="bg-[#131824] p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase">Minimum Deposit ($)</label>
              <input
                type="number"
                value={platformSettings.min_deposit_usd}
                onChange={(e) => setPlatformSettings({ ...platformSettings, min_deposit_usd: Number(e.target.value) })}
                className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
              />
            </div>

            <div className="bg-[#131824] p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase">Minimum Cash Out / Withdrawal ($)</label>
              <input
                type="number"
                value={platformSettings.min_withdraw_usd}
                onChange={(e) => setPlatformSettings({ ...platformSettings, min_withdraw_usd: Number(e.target.value) })}
                className="w-full bg-[#0a0d14] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT USER BALANCE */}
      {/* ========================================================================= */}
      {editingUserBalance && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e121b] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Adjust User Balance</h3>
              </div>
              <button onClick={() => setEditingUserBalance(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#131824] p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm">{editingUserBalance.user.name || 'Trader'}</div>
                <div className="text-xs text-slate-400 font-mono">{editingUserBalance.user.email}</div>
              </div>
              <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                {editingUserBalance.user.role}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-emerald-400 uppercase">Live Real Balance ($ USD)</label>
                  <span className="text-[10px] text-slate-500 font-mono">Current: ${(editingUserBalance.user.displayed_balance ?? 0).toFixed(2)}</span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-emerald-400 font-bold text-base">$</span>
                  <input
                    type="number"
                    step="any"
                    value={editingUserBalance.live}
                    onChange={(e) => setEditingUserBalance({ ...editingUserBalance, live: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2.5 bg-[#0a0d14] border border-slate-700 focus:border-emerald-500 rounded-xl text-emerald-400 font-mono font-bold text-base outline-none transition-all"
                  />
                </div>

                {/* Quick Add Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 mr-1 font-semibold">Quick Add:</span>
                  {[10, 50, 100, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setEditingUserBalance({ ...editingUserBalance, live: Number((editingUserBalance.live + amt).toFixed(2)) })}
                      className="bg-slate-800/80 hover:bg-emerald-950 text-slate-300 hover:text-emerald-400 border border-slate-700 hover:border-emerald-700/60 px-2 py-1 rounded text-[10px] font-bold font-mono transition-all"
                    >
                      +${amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditingUserBalance({ ...editingUserBalance, live: 0 })}
                    className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/60 px-2 py-1 rounded text-[10px] font-bold transition-all ml-auto"
                  >
                    Reset 0
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-amber-400 uppercase">Demo Practice Balance ($ USD)</label>
                  <span className="text-[10px] text-slate-500 font-mono">Current: ${(editingUserBalance.user.demo_balance ?? 10000).toFixed(2)}</span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-amber-400 font-bold text-base">$</span>
                  <input
                    type="number"
                    step="any"
                    value={editingUserBalance.demo}
                    onChange={(e) => setEditingUserBalance({ ...editingUserBalance, demo: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2.5 bg-[#0a0d14] border border-slate-700 focus:border-amber-500 rounded-xl text-amber-400 font-mono font-bold text-base outline-none transition-all"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 mr-1 font-semibold">Presets:</span>
                  {[1000, 5000, 10000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setEditingUserBalance({ ...editingUserBalance, demo: amt })}
                      className="bg-slate-800/80 hover:bg-amber-950 text-slate-300 hover:text-amber-400 border border-slate-700 hover:border-amber-700/60 px-2 py-1 rounded text-[10px] font-bold font-mono transition-all"
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingUserBalance(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUserBalance}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Balance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CUSTOM GATEWAY */}
      {/* ========================================================================= */}
      {showAddGatewayModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e121b] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingGateway ? 'Edit Payment Gateway' : 'Add New Payment Gateway'}
              </h3>
              <button onClick={() => setShowAddGatewayModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomGateway} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Gateway Name (e.g. Upay, Cellfin, Bank Transfer)</label>
                <input
                  type="text"
                  required
                  value={newGatewayForm.name || ''}
                  onChange={(e) => setNewGatewayForm({ ...newGatewayForm, name: e.target.value })}
                  placeholder="e.g. Upay Personal"
                  className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Logo Image URL</label>
                <input
                  type="url"
                  value={newGatewayForm.logo_url || ''}
                  onChange={(e) => setNewGatewayForm({ ...newGatewayForm, logo_url: e.target.value })}
                  placeholder="https://i.postimg.cc/..."
                  className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Account Number / Address</label>
                  <input
                    type="text"
                    required
                    value={newGatewayForm.account_number || ''}
                    onChange={(e) => setNewGatewayForm({ ...newGatewayForm, account_number: e.target.value })}
                    placeholder="01711982345"
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Account Type</label>
                  <input
                    type="text"
                    value={newGatewayForm.account_type || ''}
                    onChange={(e) => setNewGatewayForm({ ...newGatewayForm, account_type: e.target.value })}
                    placeholder="Cash Out / Send Money"
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Min Deposit ($)</label>
                  <input
                    type="number"
                    value={newGatewayForm.min_amount || 10}
                    onChange={(e) => setNewGatewayForm({ ...newGatewayForm, min_amount: Number(e.target.value) })}
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Max Deposit ($)</label>
                  <input
                    type="number"
                    value={newGatewayForm.max_amount || 1000}
                    onChange={(e) => setNewGatewayForm({ ...newGatewayForm, max_amount: Number(e.target.value) })}
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Payment Instructions</label>
                <textarea
                  rows={2}
                  value={newGatewayForm.instructions || ''}
                  onChange={(e) => setNewGatewayForm({ ...newGatewayForm, instructions: e.target.value })}
                  placeholder="টাকা পাঠিয়ে ট্রানজেকশন আইডি প্রদান করুন..."
                  className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={newGatewayForm.is_active !== false}
                  onChange={(e) => setNewGatewayForm({ ...newGatewayForm, is_active: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <span>Set Gateway as Active</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGatewayModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/30"
                >
                  {editingGateway ? 'Save Changes' : 'Create Gateway'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW USER */}
      {/* ========================================================================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e121b] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create New User Account</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="Trader Name"
                  className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="trader@gmail.com"
                  className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Initial Real Balance ($)</label>
                  <input
                    type="number"
                    value={newUserForm.actual_balance}
                    onChange={(e) => setNewUserForm({ ...newUserForm, actual_balance: Number(e.target.value) })}
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl p-2.5 text-xs text-emerald-400 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Initial Demo Balance ($)</label>
                  <input
                    type="number"
                    value={newUserForm.demo_balance}
                    onChange={(e) => setNewUserForm({ ...newUserForm, demo_balance: Number(e.target.value) })}
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl p-2.5 text-xs text-amber-400 font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                >
                  <option value="user">Regular Trader (User)</option>
                  <option value="admin">Administrator (Admin)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/30"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
