import React, { useState, useEffect } from 'react';
import { Users, Copy, Gift, ArrowRight, Share2, TrendingUp, CheckCircle2, AlertCircle, Sparkles, Coins, DollarSign } from 'lucide-react';
import { User } from '../types';

interface ReferralPageProps {
  user: User;
}

interface Referral {
  name: string;
  email: string;
  date: string;
  status: string;
  commission: number;
}

interface ReferralStats {
  total_referrals: number;
  total_earned: number;
  referrals: Referral[];
}

export const ReferralPage: React.FC<ReferralPageProps> = ({ user }) => {
  const referralLink = `https://probashi.app/ref/${user.id}`;
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/referral/stats');
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error('Failed to load referral stats', err);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll every 3 seconds to update real stats
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = async () => {
    if (!stats || stats.total_earned <= 0) return;
    setClaiming(true);
    setMessage(null);

    try {
      const res = await fetch('/api/referral/claim', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          type: 'success',
          text: `Success! $${data.claimed_amount.toFixed(2)} transfer complete to your Real Wallet.`
        });
        fetchStats();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to claim rewards.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection error' });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full text-slate-900 dark:text-white transition-colors font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-black font-heading mb-2 flex items-center gap-2">
          <Gift className="w-7 h-7 text-emerald-500" />
          Refer & Earn
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Invite traders and receive dynamic cashback commission based on their volume.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Share Link Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <Share2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold mb-2">Your Invite Link</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Share your custom referral link. When they register and deposit, you earn commission on every trade they execute.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm font-mono text-slate-600 dark:text-slate-300 truncate select-all">
              {referralLink}
            </div>
            <button 
              onClick={handleCopy}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-3 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-1.5 text-sm"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-emerald-500 text-slate-950 rounded-2xl p-6 shadow-lg shadow-emerald-500/20 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Affiliate Ledger
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-400 font-extrabold uppercase">
              Pro Partner
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 my-4">
            <div>
              <div className="text-[10px] font-bold text-emerald-950/70 uppercase tracking-wider mb-1">Total Referrals</div>
              <div className="text-3xl font-black font-mono leading-none">
                {stats ? stats.total_referrals : '3'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-950/70 uppercase tracking-wider mb-1">Unclaimed Earnings</div>
              <div className="text-3xl font-black font-mono leading-none">
                ${stats ? stats.total_earned.toFixed(2) : '40.40'}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-900/10 flex items-center justify-between">
            <button
              onClick={handleClaim}
              disabled={claiming || !stats || stats.total_earned <= 0}
              className="w-full bg-slate-950 hover:bg-slate-900 text-white disabled:bg-emerald-600/30 disabled:text-emerald-950/50 transition-all font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Coins className="w-4 h-4" />
              <span>{claiming ? 'Claiming...' : 'Claim & Transfer to Wallet'}</span>
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 mb-6 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-500'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Referrals Detailed Breakdown table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm mb-8">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/50">
          Referred Traders List
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-4">Username</th>
                <th className="p-4">Signed Up</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Commission Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800 font-mono">
              {stats?.referrals.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 font-sans font-bold text-slate-900 dark:text-slate-200">
                    <div>{r.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{r.email}</div>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{r.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      r.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-emerald-500">
                    ${r.commission.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-base font-bold mb-4 font-heading uppercase tracking-wider text-slate-400">How affiliate works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-emerald-500 mb-3">1</div>
          <h3 className="font-bold mb-1">Share Link</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Distribute your customized partner link across forums or social media groups.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-emerald-500 mb-3">2</div>
          <h3 className="font-bold mb-1">Traders Register</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Referred traders register accounts on the portal and fund their live balance.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-emerald-500 mb-3">3</div>
          <h3 className="font-bold mb-1">Earn Daily Cash</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Accumulate up to 5% commission on their total volume index, payable on demand.</p>
        </div>
      </div>
    </div>
  );
};
