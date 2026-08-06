import React, { useState } from 'react';
import { User, Trade, Deposit, Withdrawal } from '../types';
import { History, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, ShieldAlert, Lock, Filter, FileText, Activity } from 'lucide-react';

interface TransactionHistoryPageProps {
  user: User;
  trades: Trade[];
  deposits: Deposit[];
}

export const TransactionHistoryPage: React.FC<TransactionHistoryPageProps> = ({ user, trades, deposits }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'withdrawals' | 'trades'>('all');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  // Fetch withdrawals
  React.useEffect(() => {
    fetch('/api/withdrawals')
      .then((res) => res.json())
      .then((data) => setWithdrawals(data))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-500" />
            Financial Audit & Transaction Ledger
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Complete records of local bKash/Nagad deposits, cashout settlements, and binary option executions.
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
          {(['all', 'deposits', 'withdrawals', 'trades'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase font-sans flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
            Total Deposited
          </div>
          <div className="text-xl font-black text-emerald-500">
            ${deposits.reduce((acc, d) => (d.status === 'Approved' ? acc + d.amount : acc), 0).toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 font-sans">{deposits.length} Records</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase font-sans flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
            Withdrawal Holds
          </div>
          <div className="text-xl font-black text-amber-500">
            ${withdrawals.reduce((acc, w) => acc + w.amount, 0).toFixed(2)}
          </div>
          <div className="text-[10px] text-amber-500/80 font-sans font-bold">Audit Freeze Active</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase font-sans flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            Total Binary Trades
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{trades.length}</div>
          <div className="text-[10px] text-slate-400 font-sans">Active History</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase font-sans flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-rose-500" />
            Compliance Status
          </div>
          <div className="text-sm font-black text-amber-500 uppercase font-sans">Hold 0x478</div>
          <div className="text-[10px] text-slate-400 font-sans">Verification Required</div>
        </div>
      </div>

      {/* Tabular Records */}
      {(activeTab === 'all' || activeTab === 'deposits') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
              Deposit Funding History
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">{deposits.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Transaction ID / Reference</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-6 text-slate-400 font-sans">No deposit transactions logged yet</td>
                  </tr>
                ) : (
                  deposits.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                      <td className="p-3 text-slate-500 font-sans">{new Date(d.created_at).toLocaleString()}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white font-sans">{d.method}</td>
                      <td className="p-3 text-emerald-500 font-bold">{d.transaction_id}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">${d.amount.toFixed(2)}</td>
                      <td className="p-3 text-right">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                          d.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'withdrawals') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-amber-500" />
              Express Withdrawals & Audit Holds Ledger
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">{withdrawals.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Gateway</th>
                  <th className="p-3">Account Number</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 text-right">Verification & Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-6 text-slate-400 font-sans">No cashout requests logged yet</td>
                  </tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                      <td className="p-3 text-slate-500 font-sans">{new Date(w.created_at).toLocaleString()}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white font-sans">{w.method}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{w.account_number}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">${w.amount.toFixed(2)}</td>
                      <td className="p-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-amber-500/10 text-amber-500 border border-amber-500/30">
                          <Lock className="w-3 h-3" />
                          Verification Hold 0x478
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'trades') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Binary Options Trade Log
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">{trades.length} Trades</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="p-3">Asset</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Account</th>
                  <th className="p-3">Investment</th>
                  <th className="p-3">Payout %</th>
                  <th className="p-3">Outcome</th>
                  <th className="p-3 text-right">Net Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                {trades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6 text-slate-400 font-sans">No trades recorded</td>
                  </tr>
                ) : (
                  trades.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-white font-sans">{t.asset_name}</td>
                      <td className="p-3">
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          t.trade_type === 'Buy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {t.trade_type === 'Buy' ? 'HIGHER ↑' : 'LOWER ↓'}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-slate-400 uppercase text-[10px] font-bold">{t.account_type}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">${t.investment_amount.toFixed(2)}</td>
                      <td className="p-3 text-slate-500">{t.payout_percentage}%</td>
                      <td className="p-3">
                        <span className={`font-bold text-[10px] uppercase px-2 py-0.5 rounded ${
                          t.trade_status === 'Win'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                            : t.trade_status === 'Loss'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/30 animate-pulse'
                        }`}>
                          {t.trade_status}
                        </span>
                      </td>
                      <td className={`p-3 text-right font-bold ${
                        t.profit && t.profit > 0 ? 'text-emerald-500' : 'text-slate-400'
                      }`}>
                        {t.profit !== undefined ? (t.profit > 0 ? `+$${t.profit.toFixed(2)}` : '$0.00') : 'In Progress...'}
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
