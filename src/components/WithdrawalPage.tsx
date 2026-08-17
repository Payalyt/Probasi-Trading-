import React, { useState, useEffect } from 'react';
import { User, Withdrawal, CustomGateway, PlatformSettings } from '../types';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Check,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Wallet,
  Info
} from 'lucide-react';

const BKASH_LOGO = "https://i.postimg.cc/MZNd4Pjq/55.png";
const NAGAD_LOGO = "https://i.postimg.cc/QtWfpBX1/1679248787Nagad-Logo.png";
const ROCKET_LOGO = "https://i.postimg.cc/ryRwMszC/unnamed.png";

interface WithdrawalPageProps {
  user: User;
  onWithdrawalSubmitted: () => void;
}

export const WithdrawalPage: React.FC<WithdrawalPageProps> = ({ user, onWithdrawalSubmitted }) => {
  const [method, setMethod] = useState<string>('Bkash');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [amount, setAmount] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [customGateways, setCustomGateways] = useState<CustomGateway[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    platform_name: "PROBASHI TRADING",
    bdt_rate: 125,
    min_deposit_usd: 10,
    min_withdraw_usd: 15,
    default_win_rate: 30,
    whatsapp_number: "+8801711982345",
    whatsapp_message: "Hello Support, I need help with my withdrawal.",
    telegram_link: "https://t.me/probashitrading_support",
    support_email: "support@probashitrading.com",
    support_phone: "+880 1711-982345",
    announcement_enabled: true,
    announcement_text: "🔥 ২৪/৭ ক্যাশ আউট হেল্পলাইন সক্রিয়।"
  });

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch('/api/withdrawals');
      if (res.ok) setWithdrawals(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWithdrawals();

    fetch('/api/custom-gateways')
      .then(res => res.ok ? res.json() : [])
      .then(data => { if (data) setCustomGateways(data.filter((g: CustomGateway) => g.is_active)); })
      .catch(console.error);

    fetch('/api/platform-settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setPlatformSettings(data); })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) {
      setMessage({ type: 'error', text: 'Receiver account or wallet number is required' });
      return;
    }

    const minWithdraw = platformSettings.min_withdraw_usd || 15;
    if (amount < minWithdraw) {
      setMessage({ type: 'error', text: `Minimum cash out amount is $${minWithdraw}` });
      return;
    }

    if (amount > user.displayed_balance) {
      setMessage({ type: 'error', text: 'Insufficient available real account balance' });
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
          text: 'Withdrawal request submitted! Admin will verify and transfer funds.'
        });
        setAccountNumber('');
        fetchWithdrawals();
        onWithdrawalSubmitted();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit withdrawal' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection failure. Please retry.' });
    } finally {
      setLoading(false);
    }
  };

  const bdtCalculated = (amount * (platformSettings.bdt_rate || 125)).toLocaleString();

  const whatsappUrl = `https://wa.me/${(platformSettings.whatsapp_number || '+8801711982345').replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hello Probashi Trading Admin, I requested a cash out of $${amount} (৳${bdtCalculated} BDT) to my ${method} account ${accountNumber}.`
  )}`;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 font-sans select-none text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
            <ArrowUpRight className="w-6 h-6 text-rose-400" />
            Withdrawal (ক্যাশ আউট)
          </h1>
          <p className="text-slate-400 text-xs">
            Fast payout directly to your bKash, Nagad, Rocket, or Crypto wallet. 1 USD = ৳{platformSettings.bdt_rate || 125} BDT.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Available Balance</span>
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
            
            {/* Gateway Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Select Payout Method (উত্তোলন মাধ্যম)
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

                {/* Custom Gateways */}
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

            {/* Withdrawal Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Receiver Account / Wallet Number ({method})
                </label>
                <input
                  type="text"
                  required
                  placeholder={method === 'Crypto' ? 'TRC20 / BEP20 Wallet Address' : `017XXXXXXXX (${method} Number)`}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl p-3 text-cyan-300 font-mono font-bold text-sm focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Withdrawal Amount (USD / BDT)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-rose-400 text-base">$</span>
                  <input
                    type="number"
                    min={platformSettings.min_withdraw_usd || 15}
                    max={user.displayed_balance}
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl py-3 pl-9 pr-28 text-white font-mono font-black text-lg focus:border-rose-500 outline-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-amber-400">
                    ৳{bdtCalculated} BDT
                  </div>
                </div>
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
                disabled={loading || user.displayed_balance < amount}
                className="w-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black py-3.5 rounded-xl transition-all shadow-xl shadow-rose-900/30 disabled:opacity-50 text-sm tracking-wide"
              >
                {loading ? 'Processing Withdrawal...' : `REQUEST CASH OUT OF $${amount} (৳${bdtCalculated} BDT)`}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar History */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0e121b] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Withdrawal History</span>
              </h3>
              <span className="text-xs font-mono text-slate-500">{withdrawals.length} Records</span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {withdrawals.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">No cash out requests yet.</div>
              ) : (
                withdrawals.map((wth) => (
                  <div key={wth.id} className="bg-[#131824] border border-slate-800 p-3 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white">{wth.method}</span>
                      <span className="text-rose-400 font-mono">-${wth.amount.toFixed(2)}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      To: <span className="text-slate-200">{wth.account_number}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/80">
                      <span className="text-slate-500">{new Date(wth.created_at).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded font-black uppercase ${
                        wth.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : wth.status === 'Rejected'
                          ? 'bg-rose-500/20 text-rose-400'
                          : wth.status === 'Audit_Required'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {wth.status.replace('_', ' ')}
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
