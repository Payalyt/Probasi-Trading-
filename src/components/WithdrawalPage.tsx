import React, { useState, useEffect } from 'react';
import { User, Withdrawal } from '../types';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Check,
  AlertCircle
} from 'lucide-react';

interface WithdrawalPageProps {
  user: User;
  onWithdrawalSubmitted: () => void;
}

interface GatewayInfo {
  number: string;
  type: string;
}

interface CryptoNetwork {
  network: string;
  address: string;
}

interface GatewaySettings {
  Bkash: GatewayInfo;
  Nagad: GatewayInfo;
  Rocket: GatewayInfo;
  Crypto: CryptoNetwork[];
}

export const WithdrawalPage: React.FC<WithdrawalPageProps> = ({ user, onWithdrawalSubmitted }) => {
  const [method, setMethod] = useState<'Bkash' | 'Nagad' | 'Rocket' | 'Crypto'>('Bkash');
  const [selectedNetworkIdx, setSelectedNetworkIdx] = useState<number>(0);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [amount, setAmount] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  const [gatewaySettings, setGatewaySettings] = useState<GatewaySettings>({
    Bkash: { number: '01711982345', type: 'Cash Out' },
    Nagad: { number: '01812443890', type: 'Cash Out' },
    Rocket: { number: '01912443891', type: 'Send Money' },
    Crypto: []
  });

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch('/api/withdrawals');
      if (res.ok) {
        setWithdrawals(await res.json());
      }
    } catch (err) {
      // quiet fallback
    }
  };

  useEffect(() => {
    fetchWithdrawals();

    fetch('/api/gateway-settings')
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data) setGatewaySettings(data);
      })
      .catch(err => console.error('Error loading settings', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) {
      setMessage({ type: 'error', text: 'Account or wallet destination is required' });
      return;
    }

    if (amount > user.displayed_balance) {
      setMessage({ type: 'error', text: 'Insufficient available account balance' });
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
          text: 'Withdrawal requested successfully.'
        });
        setAccountNumber('');
        fetchWithdrawals();
        onWithdrawalSubmitted();
      } else {
        setMessage({ type: 'error', text: data.error || 'Withdrawal submission failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gateway communication error' });
    } finally {
      setLoading(false);
    }
  };

  const handleMaxBalance = () => {
    setAmount(Math.floor(user.displayed_balance));
  };

  const selectedGateway = gatewaySettings[method];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 font-sans select-none text-slate-100">
      
      {/* Mini Minimalist Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
            <ArrowUpRight className="w-6 h-6 text-amber-400" />
            Withdrawal
          </h1>
          <p className="text-slate-400 text-xs">
            Initiate settlements instantly.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Available</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono">
            ${user.displayed_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main form */}
        <div className="lg:col-span-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
            
            {/* Gateway Logo Selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* bKash */}
              <button
                type="button"
                onClick={() => setMethod('Bkash')}
                className={`relative p-4 rounded-xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 h-24 ${
                  method === 'Bkash'
                    ? 'bg-[#e2125b]/10 border-[#e2125b] text-[#e2125b] shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#e2125b] flex items-center justify-center font-black text-white text-xs shadow-md">
                  bKash
                </div>
                <span className="text-xs font-bold text-slate-200">bKash</span>
                {method === 'Bkash' && (
                  <span className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-[#e2125b] flex items-center justify-center text-white">
                    <Check className="w-2 h-2" />
                  </span>
                )}
              </button>

              {/* Nagad */}
              <button
                type="button"
                onClick={() => setMethod('Nagad')}
                className={`relative p-4 rounded-xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 h-24 ${
                  method === 'Nagad'
                    ? 'bg-[#f57c20]/10 border-[#f57c20] text-[#f57c20] shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#f57c20] flex items-center justify-center font-black text-white text-xs shadow-md">
                  Nagad
                </div>
                <span className="text-xs font-bold text-slate-200">Nagad</span>
                {method === 'Nagad' && (
                  <span className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-[#f57c20] flex items-center justify-center text-white">
                    <Check className="w-2 h-2" />
                  </span>
                )}
              </button>

              {/* Rocket */}
              <button
                type="button"
                onClick={() => setMethod('Rocket')}
                className={`relative p-4 rounded-xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 h-24 ${
                  method === 'Rocket'
                    ? 'bg-[#8c3c96]/10 border-[#8c3c96] text-[#8c3c96] shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#8c3c96] flex items-center justify-center font-black text-white text-[10px] shadow-md">
                  Rocket
                </div>
                <span className="text-xs font-bold text-slate-200">Rocket</span>
                {method === 'Rocket' && (
                  <span className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-[#8c3c96] flex items-center justify-center text-white">
                    <Check className="w-2 h-2" />
                  </span>
                )}
              </button>

              {/* Crypto */}
              <button
                type="button"
                onClick={() => setMethod('Crypto')}
                className={`relative p-4 rounded-xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 h-24 ${
                  method === 'Crypto'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-black text-white text-[10px] shadow-md">
                  Crypto
                </div>
                <span className="text-xs font-bold text-slate-200">Crypto</span>
                {method === 'Crypto' && (
                  <span className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <Check className="w-2 h-2" />
                  </span>
                )}
              </button>
            </div>

            {method === 'Crypto' && gatewaySettings.Crypto && gatewaySettings.Crypto.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Network
                </label>
                <div className="flex flex-wrap gap-2">
                  {gatewaySettings.Crypto.map((net, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedNetworkIdx(idx)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedNetworkIdx === idx
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {net.network}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Account details */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {method === 'Crypto' ? 'Wallet Address' : `${method} Number`}
                  </label>
                  <input
                    type="text"
                    placeholder={method === 'Crypto' ? 'Enter Crypto Address' : 'e.g., 017XXXXXXXX'}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white font-mono font-bold outline-none transition-colors"
                    required
                  />
                </div>

                {/* Payout amount */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Amount ($)
                    </label>
                    <button
                      type="button"
                      onClick={handleMaxBalance}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-extrabold uppercase tracking-wider"
                    >
                      Max
                    </button>
                  </div>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white font-mono font-bold outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-3 border ${
                    message.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black py-3 px-6 rounded-xl transition-all shadow-lg shadow-amber-500/10 uppercase tracking-wider text-xs"
              >
                {loading ? 'Processing...' : 'Withdraw Cash'}
              </button>
            </form>

          </div>
        </div>

        {/* Sidebar history */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-amber-400" />
              History
            </h2>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {withdrawals.length === 0 ? (
                <div className="text-slate-500 text-xs text-center py-8">
                  No records found.
                </div>
              ) : (
                withdrawals.map((w) => (
                  <div 
                    key={w.id} 
                    className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2 font-mono text-xs hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between font-sans">
                      <span className="font-extrabold text-white text-xs">{w.method}</span>
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-black text-[9px] uppercase">
                        {w.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-white">
                        ${w.amount.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-slate-500 font-sans">
                        {new Date(w.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 truncate bg-slate-900 border border-slate-850 px-2 py-1 rounded">
                      Number: {w.account_number}
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
