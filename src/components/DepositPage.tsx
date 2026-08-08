import React, { useState, useEffect } from 'react';
import { User, Deposit } from '../types';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Copy, 
  ArrowDownLeft, 
  Check
} from 'lucide-react';

interface DepositPageProps {
  user: User;
  deposits: Deposit[];
  onDepositSubmitted: () => void;
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

export const DepositPage: React.FC<DepositPageProps> = ({ user, deposits, onDepositSubmitted }) => {
  const [method, setMethod] = useState<'Bkash' | 'Nagad' | 'Rocket' | 'Crypto'>('Bkash');
  const [selectedNetworkIdx, setSelectedNetworkIdx] = useState<number>(0);
  const [amount, setAmount] = useState<number>(100);
  const [transactionId, setTransactionId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const [gatewaySettings, setGatewaySettings] = useState<GatewaySettings>({
    Bkash: { number: '01711982345', type: 'Cash Out' },
    Nagad: { number: '01812443890', type: 'Cash Out' },
    Rocket: { number: '01912443891', type: 'Send Money' },
    Crypto: []
  });

  useEffect(() => {
    fetch('/api/gateway-settings')
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data) setGatewaySettings(data);
      })
      .catch(err => console.error('Error loading settings', err));
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        setMessage({ 
          type: 'success', 
          text: 'Deposit request submitted successfully!' 
        });
        setTransactionId('');
        onDepositSubmitted();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit deposit' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection failure. Please retry.' });
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [50, 100, 250, 500, 1000];
  const selectedGateway = gatewaySettings[method];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 font-sans select-none text-slate-100">
      
      {/* Mini Minimalist Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
            <ArrowDownLeft className="w-6 h-6 text-emerald-400" />
            Deposit
          </h1>
          <p className="text-slate-400 text-xs">
            Fund your real wallet instantly.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Balance</span>
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

            {/* Revealed Credentials Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 overflow-hidden">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {method === 'Crypto' 
                    ? `Deposit Address (${gatewaySettings.Crypto?.[selectedNetworkIdx]?.network || 'N/A'})` 
                    : `${method} Number (${selectedGateway?.type})`}
                </span>
                <span className="text-lg md:text-xl font-mono font-black text-white tracking-wide block truncate">
                  {method === 'Crypto' 
                    ? gatewaySettings.Crypto?.[selectedNetworkIdx]?.address 
                    : selectedGateway?.number}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(
                  method === 'Crypto' 
                    ? (gatewaySettings.Crypto?.[selectedNetworkIdx]?.address || '') 
                    : (selectedGateway?.number || '')
                )}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl transition-all font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Deposit Form Input Fields */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Amount field */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Amount ($)
                </label>
                
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all border ${
                        amount === val
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-black'
                          : 'bg-slate-950/40 hover:bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  min="10"
                  step="5"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white font-mono font-bold outline-none transition-colors"
                  required
                />
              </div>

              {/* Transaction ID field */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Transaction ID / TrxID
                </label>
                <input
                  type="text"
                  placeholder="Enter Transaction number"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white font-mono font-bold outline-none transition-colors"
                  required
                />
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
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/10 uppercase tracking-wider text-xs"
              >
                {loading ? 'Submitting...' : 'Submit Deposit'}
              </button>
            </form>

          </div>
        </div>

        {/* Sidebar history */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-emerald-400" />
              History
            </h2>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {deposits.length === 0 ? (
                <div className="text-slate-500 text-xs text-center py-8">
                  No records found.
                </div>
              ) : (
                deposits.map((dep) => (
                  <div 
                    key={dep.id} 
                    className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2 font-mono text-xs hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between font-sans">
                      <span className="font-extrabold text-white text-xs">{dep.method}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          dep.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : dep.status === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {dep.status}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-white">
                        ${dep.amount.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-slate-500 font-sans">
                        {new Date(dep.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 truncate bg-slate-900 border border-slate-850 px-2 py-1 rounded">
                      ID: {dep.transaction_id}
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
