import React, { useState, useEffect } from 'react';
import { Copy, Gift, Sparkles, Trophy, Star, Users, ArrowRight, Wallet, ArrowUpRight, Check } from 'lucide-react';
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
          text: `Reward Claimed! $${data.claimed_amount.toFixed(2)} added to your wallet.`
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
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full text-slate-100 transition-colors font-sans space-y-8 select-none">
      
      {/* Upper Premium Golden Accent Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-500 rounded-3xl p-6 md:p-10 text-slate-950 shadow-2xl shadow-amber-500/10 border border-amber-400/20">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/20 text-slate-950 text-[10px] font-black uppercase tracking-widest">
              <Trophy className="w-3.5 h-3.5" />
              PRO PARTNER CLUB
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-slate-950 font-heading">
              Invite & Earn <br />Lifetime Commission
            </h1>
            <p className="text-slate-950/80 text-xs md:text-sm font-medium leading-relaxed">
              Earn high-yield passive income. Receive up to 5% commission on every trading contract processed by your referred network, credited in real-time.
            </p>
          </div>

          {/* Quick Stats Block inside Golden Card */}
          <div className="bg-slate-950 text-white rounded-2xl p-6 border border-white/10 w-full lg:w-auto min-w-[280px] shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                Affiliate Balance
              </span>
              <span className="bg-amber-500/20 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-wider">
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Referred</span>
                <span className="text-2xl font-black font-mono text-white">
                  {stats ? stats.total_referrals : '0'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Unclaimed Money</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  ${stats ? stats.total_earned.toFixed(2) : '0.00'}
                </span>
              </div>
            </div>

            <button
              onClick={handleClaim}
              disabled={claiming || !stats || stats.total_earned <= 0}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 transition-all font-black py-3 px-4 rounded-xl text-xs text-slate-950 uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
            >
              <Wallet className="w-4 h-4" />
              <span>{claiming ? 'Claiming...' : 'Claim & Transfer to Wallet'}</span>
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          <Check className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Content Sections: Share Link & How it Works */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Share card & Instructions */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Custom Link card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-heading">
              Your Personalized Invite Link
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Copy your unique link and share it across forums, YouTube, Telegram groups, or social channels. Any user signing up with this link will automatically bind under your affiliate umbrella.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 truncate select-all">
                {referralLink}
              </div>
              <button 
                onClick={handleCopy}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 text-xs uppercase tracking-wider"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Three-step visual system */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-heading">
              Affiliate Operations System
            </h2>

            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <span className="w-7 h-7 rounded-full bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">1</span>
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Share your invitation</h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">Distribute your custom invitation link among friends or online trading communities.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span className="w-7 h-7 rounded-full bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">2</span>
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Traders Register & Fund</h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">They create account and fund their balances using bKash, Nagad or Rocket.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span className="w-7 h-7 rounded-full bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">3</span>
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Accumulate Live Profit</h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">Earn commissions on every trade executed. Claim rewards anytime directly to your real wallet balance.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Affiliate List Table */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-white font-heading flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  Referred Traders
                </h2>
                <span className="bg-slate-950 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 border border-slate-800">
                  {stats ? stats.referrals.length : '0'} Traders
                </span>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {!stats || stats.referrals.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-500 font-sans">
                    No referred users yet. Link has been generated successfully.
                  </div>
                ) : (
                  stats.referrals.map((ref, idx) => (
                    <div 
                      key={idx}
                      className="bg-slate-950/60 border border-slate-850 rounded-2xl p-3.5 space-y-2 hover:border-slate-800 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white font-sans">{ref.name}</div>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">{ref.email}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                          ref.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {ref.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px] font-mono">
                        <span className="text-slate-500 text-[9px] font-sans">Earned</span>
                        <span className="font-extrabold text-emerald-400">${ref.commission.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500">
              <span>Dynamic Cashback Commission Index</span>
              <span>Level 1</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
