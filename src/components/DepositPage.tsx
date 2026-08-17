import React, { useState, useEffect } from 'react';
import { User, Deposit, CustomGateway, PlatformSettings } from '../types';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Copy, 
  ArrowDownLeft, 
  Check,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

const BKASH_LOGO = "https://i.postimg.cc/MZNd4Pjq/55.png";
const NAGAD_LOGO = "https://i.postimg.cc/QtWfpBX1/1679248787Nagad-Logo.png";
const ROCKET_LOGO = "https://i.postimg.cc/ryRwMszC/unnamed.png";

interface DepositPageProps {
  user: User;
  deposits: Deposit[];
  onDepositSubmitted: () => void;
}

export const DepositPage: React.FC<DepositPageProps> = ({ user, deposits, onDepositSubmitted }) => {
  const [method, setMethod] = useState<string>('Bkash');
  const [selectedNetworkIdx, setSelectedNetworkIdx] = useState<number>(0);
  const [amount, setAmount] = useState<number>(100);
  const [transactionId, setTransactionId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const [gatewaySettings, setGatewaySettings] = useState<any>({
    Bkash: { number: '01711982345', type: 'Cash Out', instructions: 'বিকাশ ক্যাশআউট করার পর ট্রানজেকশন আইডি (TrxID) প্রদান করুন।' },
    Nagad: { number: '01812443890', type: 'Cash Out', instructions: 'নগদ ক্যাশআউট সম্পন্ন করে TrxID প্রদান করুন।' },
    Rocket: { number: '01912443891', type: 'Send Money', instructions: 'রকেট সেন্ড মানি করে ট্রানজেকশন আইডি প্রদান করুন।' },
    Crypto: [
      { network: "USDT (TRC20)", address: "TYDzsxd8V7U9xP1wQd98Bnm23Xcv987Zab" },
      { network: "USDT (BEP20)", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" },
      { network: "LTC (Litecoin)", address: "LTC1q56789abcdefghij987654321xyz" }
    ]
  });

  const [customGateways, setCustomGateways] = useState<CustomGateway[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    platform_name: "PROBASHI TRADING",
    bdt_rate: 125,
    min_deposit_usd: 10,
    min_withdraw_usd: 15,
    default_win_rate: 30,
    whatsapp_number: "+8801711982345",
    whatsapp_message: "Hello Support, I need help with my deposit.",
    telegram_link: "https://t.me/probashitrading_support",
    support_email: "support@probashitrading.com",
    support_phone: "+880 1711-982345",
    announcement_enabled: true,
    announcement_text: "🔥 ডিপোজিট বোনাস সক্রিয়! ২৪/৭ সহায়তা হোয়াটসঅ্যাপে।"
  });

  useEffect(() => {
    fetch('/api/gateway-settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setGatewaySettings(data); })
      .catch(console.error);

    fetch('/api/custom-gateways')
      .then(res => res.ok ? res.json() : [])
      .then(data => { if (data) setCustomGateways(data.filter((g: CustomGateway) => g.is_active)); })
      .catch(console.error);

    fetch('/api/platform-settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setPlatformSettings(data); })
      .catch(console.error);
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

    if (amount < (platformSettings.min_deposit_usd || 10)) {
      setMessage({ type: 'error', text: `Minimum deposit amount is $${platformSettings.min_deposit_usd || 10}` });
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
          text: 'Deposit request submitted! Admin will verify and auto-credit balance shortly.' 
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

  const quickAmounts = [20, 50, 100, 250, 500, 1000];

  // Determine current active gateway details
  const isCustomGateway = customGateways.some(g => g.name === method);
  const selectedCustom = customGateways.find(g => g.name === method);
  const selectedBuiltIn = gatewaySettings[method];

  const currentNumber = isCustomGateway 
    ? selectedCustom?.account_number 
    : method === 'Crypto' 
    ? (gatewaySettings.Crypto?.[selectedNetworkIdx]?.address || '') 
    : selectedBuiltIn?.number;

  const currentType = isCustomGateway 
    ? selectedCustom?.account_type 
    : method === 'Crypto' 
    ? (gatewaySettings.Crypto?.[selectedNetworkIdx]?.network || 'Crypto') 
    : selectedBuiltIn?.type;

  const currentInstructions = isCustomGateway 
    ? selectedCustom?.instructions 
    : selectedBuiltIn?.instructions || 'প্রদত্ত নম্বরে টাকা পাঠিয়ে সঠিক ট্রানজেকশন আইডি (TrxID) নিচে প্রদান করুন।';

  const bdtCalculated = (amount * (platformSettings.bdt_rate || 125)).toLocaleString();

  const whatsappUrl = `https://wa.me/${(platformSettings.whatsapp_number || '+8801711982345').replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hello Probashi Trading Admin, I want to deposit $${amount} (৳${bdtCalculated} BDT) via ${method}.`
  )}`;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 font-sans select-none text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
            <ArrowDownLeft className="w-6 h-6 text-emerald-400" />
            Deposit Funds (ডিপোজিট)
          </h1>
          <p className="text-slate-400 text-xs">
            Instant automatic credit via bKash, Nagad, Rocket & Crypto. 1 USD = ৳{platformSettings.bdt_rate || 125} BDT.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live Wallet Balance</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              ${user.displayed_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp Help</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-8">
          <div className="bg-[#0e121b] border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
            
            {/* Gateway Selector (Built-in + Custom) */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Select Payment Gateway (পেমেন্ট মেথড সিলেক্ট করুন)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setMethod('Bkash')}
                  className={`relative p-3 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 h-24 ${
                    method === 'Bkash'
                      ? 'bg-[#e2125b]/10 border-[#e2125b] text-[#e2125b] shadow-lg ring-1 ring-[#e2125b]'
                      : 'bg-[#131824] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden">
                    <img src={BKASH_LOGO} alt="bKash" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">bKash</span>
                  {method === 'Bkash' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#e2125b] flex items-center justify-center text-white shadow">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setMethod('Nagad')}
                  className={`relative p-3 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 h-24 ${
                    method === 'Nagad'
                      ? 'bg-[#f57c20]/10 border-[#f57c20] text-[#f57c20] shadow-lg ring-1 ring-[#f57c20]'
                      : 'bg-[#131824] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden">
                    <img src={NAGAD_LOGO} alt="Nagad" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">Nagad</span>
                  {method === 'Nagad' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#f57c20] flex items-center justify-center text-white shadow">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>

                {/* Rocket */}
                <button
                  type="button"
                  onClick={() => setMethod('Rocket')}
                  className={`relative p-3 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 h-24 ${
                    method === 'Rocket'
                      ? 'bg-[#8c3c96]/10 border-[#8c3c96] text-[#8c3c96] shadow-lg ring-1 ring-[#8c3c96]'
                      : 'bg-[#131824] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden">
                    <img src={ROCKET_LOGO} alt="Rocket" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">Rocket</span>
                  {method === 'Rocket' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#8c3c96] flex items-center justify-center text-white shadow">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>

                {/* Crypto */}
                <button
                  type="button"
                  onClick={() => setMethod('Crypto')}
                  className={`relative p-3 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 h-24 ${
                    method === 'Crypto'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-lg ring-1 ring-blue-500'
                      : 'bg-[#131824] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xs shadow-md">
                    USDT
                  </div>
                  <span className="text-xs font-bold text-slate-200">Crypto</span>
                  {method === 'Crypto' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white shadow">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>

                {/* Custom Gateways (Upay, Cellfin, Bank, etc.) */}
                {customGateways.map((cg) => (
                  <button
                    key={cg.id}
                    type="button"
                    onClick={() => setMethod(cg.name)}
                    className={`relative p-3 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 h-24 ${
                      method === cg.name
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-lg ring-1 ring-cyan-500'
                        : 'bg-[#131824] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center shadow-md overflow-hidden">
                      <img
                        src={cg.logo_url || "https://cdn-icons-png.flaticon.com/512/893/893081.png"}
                        alt={cg.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-200 truncate max-w-[80px]">{cg.name}</span>
                    {method === cg.name && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-white shadow">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Crypto Networks Selection */}
            {method === 'Crypto' && gatewaySettings.Crypto && gatewaySettings.Crypto.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Blockchain Network
                </label>
                <div className="flex flex-wrap gap-2">
                  {gatewaySettings.Crypto.map((net: any, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedNetworkIdx(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                        selectedNetworkIdx === idx
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-[#131824] text-slate-300 hover:bg-slate-800 border border-slate-700'
                      }`}
                    >
                      {net.network}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gateway Account Card */}
            <div className="bg-[#131824] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Official {method} Deposit Number ({currentType})
                </span>
                <span className="text-[11px] bg-rose-950/60 text-rose-300 border border-rose-800/40 px-2 py-0.5 rounded-full font-semibold">
                  Type: {currentType}
                </span>
              </div>

              <div className="flex items-center justify-between bg-[#0a0d14] border border-slate-700 rounded-xl p-3.5">
                <span className="font-mono text-sm sm:text-base font-black text-amber-400 select-all tracking-wider break-all">
                  {currentNumber || "01711982345"}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(currentNumber || "01711982345")}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-bold transition-all border border-slate-700 ml-2 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {currentInstructions && (
                <div className="text-xs text-slate-300 flex items-start gap-2 bg-amber-950/20 border border-amber-500/20 p-3 rounded-xl">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{currentInstructions}</span>
                </div>
              )}
            </div>

            {/* Amount and TrxID Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Deposit Amount (USD / BDT)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-400 text-base">$</span>
                  <input
                    type="number"
                    min={platformSettings.min_deposit_usd || 10}
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl py-3 pl-9 pr-28 text-white font-mono font-black text-lg focus:border-emerald-500 outline-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-amber-400">
                    ৳{bdtCalculated} BDT
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(q)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        amount === q
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#131824] text-slate-300 hover:bg-slate-800 border border-slate-700'
                      }`}
                    >
                      ${q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Transaction ID / TrxID (লেনদেন আইডি)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BK8X92M10Q or Hash"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl p-3 text-amber-300 font-mono font-bold text-sm focus:border-amber-500 outline-none"
                />
              </div>

              {message && (
                <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                  message.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-xl shadow-emerald-900/30 disabled:opacity-50 text-sm tracking-wide"
              >
                {loading ? 'Submitting Deposit Request...' : `CONFIRM DEPOSIT OF $${amount} (৳${bdtCalculated} BDT)`}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar History & Helpline */}
        <div className="lg:col-span-4 space-y-6">
          {/* WhatsApp Direct Support Card */}
          <div className="bg-[#0e121b] border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Need Instant Deposit Help?</h3>
                <span className="text-[10px] text-emerald-400 font-semibold">24/7 WhatsApp Helpline Active</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              If your deposit takes longer than 5 minutes, message our official admin on WhatsApp with your TrxID.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-emerald-900/40"
            >
              <span>Chat on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* User's Recent Deposits History */}
          <div className="bg-[#0e121b] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Recent Deposits</span>
              </h3>
              <span className="text-xs font-mono text-slate-500">{deposits.length} Records</span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {deposits.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">No deposit history found.</div>
              ) : (
                deposits.map((dep) => (
                  <div key={dep.id} className="bg-[#131824] border border-slate-800 p-3 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white">{dep.method}</span>
                      <span className="text-emerald-400 font-mono">${dep.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono text-amber-300">{dep.transaction_id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        dep.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : dep.status === 'Rejected'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {dep.status}
                      </span>
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
