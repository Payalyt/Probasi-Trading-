import React, { useState } from 'react';
import { User, Deposit } from '../types';
import { CreditCard, CheckCircle2, AlertCircle, Clock, Copy, ShieldCheck, HelpCircle } from 'lucide-react';

interface DepositPageProps {
  user: User;
  deposits: Deposit[];
  onDepositSubmitted: () => void;
}

export const DepositPage: React.FC<DepositPageProps> = ({ user, deposits, onDepositSubmitted }) => {
  const [method, setMethod] = useState<'Bkash' | 'Nagad' | 'Crypto' | 'Bank Transfer'>('Bkash');
  const [amount, setAmount] = useState<number>(100);
  const [transactionId, setTransactionId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const walletAccounts = {
    Bkash: '+880 1711 982 345 (bKash Agent / Cash Out)',
    Nagad: '+880 1812 443 890 (Nagad Agent / Cash Out)',
    Crypto: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F (USDT TRC20 / ERC20)',
    'Bank Transfer': 'City Bank - A/C: 1102938481203 (Routing: 2202711)'
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setMessage({ type: 'error', text: 'Transaction ID / TrxID is required' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/deposit/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          amount,
          transaction_id: transactionId.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Deposit request submitted successfully! Awaiting automated Gateway verification.' });
        setTransactionId('');
        onDepositSubmitted();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit deposit' });
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
            <CreditCard className="w-6 h-6 text-emerald-500" />
            Probashi Deposit Portal
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Instantly top up your Real Trading Account using local mobile money gateways or crypto rails.
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Real Account Wallet</div>
          <div className="text-xl font-black text-emerald-500 font-mono">${user.displayed_balance.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Deposit Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm transition-colors">
            
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              1. Select Payment Method
            </h2>

            {/* Gateway Selection Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['Bkash', 'Nagad', 'Crypto', 'Bank Transfer'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`p-4 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 ${
                    method === m
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {m === 'Bkash' && <span className="text-pink-600 font-black text-base">bKash</span>}
                  {m === 'Nagad' && <span className="text-orange-500 font-black text-base">Nagad</span>}
                  {m === 'Crypto' && <span className="text-emerald-500 font-black text-base">USDT</span>}
                  {m === 'Bank Transfer' && <span className="text-blue-500 font-black text-base">Bank</span>}
                  <span>{m}</span>
                </button>
              ))}
            </div>

            {/* Instruction Card */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-3 relative">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Official {method} Merchant / Cashout Routing Address
                </span>
                <button
                  onClick={() => handleCopy(walletAccounts[method], method)}
                  className="text-[11px] bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-lg transition-colors font-bold"
                >
                  {copied === method ? 'Copied!' : 'Copy Address'}
                </button>
              </div>

              <div className="text-sm font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 break-all select-all shadow-inner">
                {walletAccounts[method]}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Cash Out Instructions:
                </p>
                <p>
                  1. Open your {method} App or dial USSD menu and choose <strong>Cash Out</strong> (or Send Money).
                </p>
                <p>
                  2. Transfer the exact amount to the Merchant Number listed above.
                </p>
                <p>
                  3. Copy the received <strong>TrxID / Transaction Hash</strong> and paste it into the field below.
                </p>
              </div>
            </div>

            {/* Submit TrxID Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
                2. Enter Transaction Hash & Amount
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Deposit Amount ($)</label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-slate-900 dark:text-white font-mono font-bold outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Transaction ID (TrxID)</label>
                  <input
                    type="text"
                    placeholder="e.g., BK8X92M10Q or Hash"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-slate-900 dark:text-white font-mono font-bold outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-3 ${
                    message.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-500'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                  <span>{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 uppercase tracking-wider text-xs"
              >
                {loading ? 'Processing...' : 'Submit Deposit Notification'}
              </button>
            </form>
          </div>
        </div>

        {/* Deposit History Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              Deposit Log
            </h2>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {deposits.length === 0 ? (
                <div className="text-slate-400 text-xs text-center py-8">No prior deposit records</div>
              ) : (
                deposits.map((dep) => (
                  <div key={dep.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between font-sans">
                      <span className="font-bold text-slate-900 dark:text-white">{dep.method}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          dep.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : dep.status === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {dep.status}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-black text-slate-900 dark:text-white">${dep.amount.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 font-sans">{new Date(dep.created_at).toLocaleTimeString()}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                      TrxID: {dep.transaction_id}
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
