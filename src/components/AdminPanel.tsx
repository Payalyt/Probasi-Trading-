import React, { useState, useEffect } from 'react';
import { User, Trade, Deposit, OutcomeControl } from '../types';
import { ShieldAlert, Users, TrendingUp, CreditCard, RefreshCw, DollarSign } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'trades' | 'deposits'>('trades');
  const [loading, setLoading] = useState<boolean>(true);
  const [editingBalanceUser, setEditingBalanceUser] = useState<string | null>(null);
  const [newDisplayedBalance, setNewDisplayedBalance] = useState<number>(0);
  const [newActualBalance, setNewActualBalance] = useState<number>(0);

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
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 font-sans">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-colors">
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
          className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          Refresh Feeds
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
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
      </div>

      {/* TAB 1: TRADES OVERRIDE */}
      {activeTab === 'trades' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span>Active Trades Matrix (Awaiting 30s Expiration)</span>
              <span className="text-[10px] font-semibold text-slate-400">Default: DEMO=75% Win, REAL=85% Loss</span>
            </h2>

            {pendingTrades.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800/50">
                No active pending trades right now. New trades will appear here instantly.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="uppercase bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
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
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 font-sans">
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
                                : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Resolved Trade Logs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="uppercase bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Traders List</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="uppercase bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
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
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
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
                        className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700"
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
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
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
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 uppercase font-semibold mb-1">Actual DB Balance ($)</label>
                    <input
                      type="number"
                      value={newActualBalance}
                      onChange={(e) => setNewActualBalance(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setEditingBalanceUser(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Deposit Verification Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="uppercase bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
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
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                      <td className="p-3.5 font-sans font-bold text-slate-900 dark:text-white">{d.user_name || d.user_id}</td>
                      <td className="p-3.5 font-sans">{d.method}</td>
                      <td className="p-3.5 text-emerald-500 font-bold">${d.amount.toFixed(2)}</td>
                      <td className="p-3.5 font-mono select-all bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
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
    </div>
  );
};
