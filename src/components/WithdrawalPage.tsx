import React, { useState, useEffect } from 'react';
import { User, Withdrawal } from '../types';
import { ArrowUpRight, ShieldAlert, AlertOctagon, CheckCircle2, Clock, Lock, ShieldCheck } from 'lucide-react';

interface WithdrawalPageProps {
  user: User;
  onWithdrawalSubmitted: () => void;
}

export const WithdrawalPage: React.FC<WithdrawalPageProps> = ({ user, onWithdrawalSubmitted }) => {
  const [method, setMethod] = useState<'Bkash' | 'Nagad' | 'Crypto' | 'Bank Transfer'>('Bkash');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [amount, setAmount] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch('/api/withdrawals');
      if (res.ok) {
        setWithdrawals(await res.json());
      }
    } catch (err) {
      // quiet
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) {
      setMessage({ type: 'error', text: 'Account or wallet number is required' });
      return;
    }

    if (amount > user.displayed_balance) {
      setMessage({ type: 'error', text: 'Insufficient real account balance' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/withdraw/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          account_number: accountNumber.trim(),
          amount
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          type: 'success',
          text: 'Withdrawal request logged. Note: Volume index protocol audit required prior to execution.'
        });
        setAccountNumber('');
        fetchWithdrawals();
        onWithdrawalSubmitted();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit withdrawal request' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 font-sans">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-emerald-500" />
            Cash Out & Withdrawal Terminal
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Request real balance disbursements directly to your mobile money wallet or crypto account.
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Available Real Balance</div>
          <div className="text-xl font-black text-emerald-500 font-mono">${user.displayed_balance.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Terminal Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm transition-colors">
            
            {/* System Protocol Flag Notice Box */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                <span>System Protocol Flag (Compliance Audit Index)</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300/90 leading-relaxed font-sans">
                Notice: All outbound cash settlements are governed by automated risk index algorithms. To clear automatic verification audits, your trading volume index must maintain compliance across minimum cycle operations. Disbursements remain locked in <strong>AUDIT_REQUIRED</strong> status pending protocol clearing.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Withdrawal Gateway</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['Bkash', 'Nagad', 'Crypto', 'Bank Transfer'] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        method === m
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Number & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {method} Account / Wallet Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 01711XXXXXX"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-slate-900 dark:text-white font-mono font-bold outline-none transition-colors text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Withdrawal Amount ($)</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-slate-900 dark:text-white font-mono font-bold outline-none transition-colors text-sm"
                    required
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-3 ${
                    message.type === 'success'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-500'
                  }`}
                >
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span>{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-black py-4 px-6 rounded-xl transition-all shadow-md disabled:opacity-50 uppercase tracking-wider text-xs border border-slate-700"
              >
                {loading ? 'Initiating Verification...' : 'Request Cash Out Settlement'}
              </button>
            </form>
          </div>
        </div>

        {/* Withdrawal Logs */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              Cash Out Audit History
            </h2>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {withdrawals.length === 0 ? (
                <div className="text-slate-400 text-xs text-center py-8">No prior withdrawal activity</div>
              ) : (
                withdrawals.map((w) => (
                  <div key={w.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between font-sans">
                      <span className="font-bold text-slate-900 dark:text-white">{w.method}</span>
                      <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase">
                        {w.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-black text-slate-900 dark:text-white">${w.amount.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 font-sans">{new Date(w.created_at).toLocaleTimeString()}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                      Account: {w.account_number}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
