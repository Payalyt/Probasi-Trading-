import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Sparkles, Award, ArrowUpRight, Flame, Globe } from 'lucide-react';

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  country: string;
  flag: string;
  profit: number;
  winRate: number;
  totalTrades: number;
  favoriteAsset: string;
}

const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { id: '1', rank: 1, name: 'Akram K***', country: 'Bangladesh', flag: '🇧🇩', profit: 4850.50, winRate: 94, totalTrades: 142, favoriteAsset: 'EUR/USD' },
  { id: '2', rank: 2, name: 'Probashi_99', country: 'Malaysia', flag: '🇲🇾', profit: 4120.00, winRate: 91, totalTrades: 118, favoriteAsset: 'BTC/USD' },
  { id: '3', rank: 3, name: 'Rana_DXB', country: 'UAE', flag: '🇦🇪', profit: 3790.25, winRate: 89, totalTrades: 105, favoriteAsset: 'GOLD' },
  { id: '4', rank: 4, name: 'Kabir_KSA', country: 'Saudi Arabia', flag: '🇸🇦', profit: 3240.80, winRate: 88, totalTrades: 92, favoriteAsset: 'GBP/USD' },
  { id: '5', rank: 5, name: 'Tariq_KUL', country: 'Malaysia', flag: '🇲🇾', profit: 2890.00, winRate: 86, totalTrades: 84, favoriteAsset: 'ETH/USD' },
  { id: '6', rank: 6, name: 'Mamun_DOH', country: 'Qatar', flag: '🇶🇦', profit: 2540.60, winRate: 85, totalTrades: 79, favoriteAsset: 'EUR/USD' },
  { id: '7', rank: 7, name: 'Zahid_OMN', country: 'Oman', flag: '🇴🇲', profit: 2180.10, winRate: 83, totalTrades: 71, favoriteAsset: 'USD/JPY' },
  { id: '8', rank: 8, name: 'Hasan_BD', country: 'Bangladesh', flag: '🇧🇩', profit: 1950.40, winRate: 82, totalTrades: 65, favoriteAsset: 'GOLD' },
  { id: '9', rank: 9, name: 'Farhan_KW', country: 'Kuwait', flag: '🇰🇼', profit: 1720.00, winRate: 80, totalTrades: 58, favoriteAsset: 'AAPL' },
  { id: '10', rank: 10, name: 'Sharif_LND', country: 'UK', flag: '🇬🇧', profit: 1490.30, winRate: 79, totalTrades: 51, favoriteAsset: 'BTC/USD' },
];

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD);

  // Dynamic live rolling ticker simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard((prev) => {
        return prev.map((user) => {
          // 40% chance to increment profit slightly
          if (Math.random() > 0.6) {
            const increment = +(Math.random() * 45 + 5).toFixed(2);
            return {
              ...user,
              profit: +(user.profit + increment).toFixed(2),
              totalTrades: user.totalTrades + (Math.random() > 0.5 ? 1 : 0)
            };
          }
          return user;
        }).sort((a, b) => b.profit - a.profit).map((u, idx) => ({ ...u, rank: idx + 1 }));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 font-sans">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full text-emerald-400 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Hourly Traders Ranking</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400" />
              Top Winners Leaderboard
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl">
              Real-time performance tracker of top global Probashi traders. Updated live every 5 seconds.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top Trader Profit</div>
              <div className="text-xl font-black text-emerald-400 font-mono">+${leaderboard[0]?.profit.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Volume</div>
              <div className="text-xl font-black text-amber-400 font-mono">1,492 Trades</div>
            </div>
          </div>
        </div>
      </div>

      {/* Podium Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaderboard.slice(0, 3).map((user, index) => {
          const rankColors = [
            'from-amber-500/20 to-amber-500/5 border-amber-500/40 text-amber-400',
            'from-slate-400/20 to-slate-400/5 border-slate-400/40 text-slate-300',
            'from-amber-700/20 to-amber-700/5 border-amber-700/40 text-amber-600'
          ];
          const badgeLabels = ['🥇 #1 TOP TRADER', '🥈 #2 RUNNER UP', '🥉 #3 THIRD PLACE'];

          return (
            <div
              key={user.id}
              className={`bg-gradient-to-b ${rankColors[index]} bg-white dark:bg-slate-900 border rounded-2xl p-5 relative overflow-hidden shadow-lg transition-transform hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md bg-slate-950/50 text-white border border-slate-800">
                  {badgeLabels[index]}
                </span>
                <span className="text-2xl">{user.flag}</span>
              </div>

              <div className="space-y-1 mb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {user.name}
                  <span className="text-xs text-slate-400 font-normal">({user.country})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Fav Asset: <strong className="text-slate-700 dark:text-slate-200">{user.favoriteAsset}</strong></p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Live Hourly Profit</div>
                  <div className="text-xl font-black text-emerald-500">+${user.profit.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Win Rate</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{user.winRate}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 font-sans">
            <Globe className="w-4 h-4 text-emerald-500" />
            Global Probashi Trader Ranking Ledger
          </h2>
          <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            ● LIVE STREAM
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="uppercase bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="p-3.5">Rank</th>
                <th className="p-3.5">Trader Name</th>
                <th className="p-3.5">Region</th>
                <th className="p-3.5">Fav Asset</th>
                <th className="p-3.5">Win Rate</th>
                <th className="p-3.5">Trades</th>
                <th className="p-3.5 text-right">Profit Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
              {leaderboard.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white font-sans">
                    <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                      u.rank === 1 ? 'bg-amber-400 text-slate-950' : u.rank === 2 ? 'bg-slate-300 text-slate-950' : u.rank === 3 ? 'bg-amber-700 text-white' : 'text-slate-400'
                    }`}>
                      #{u.rank}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold font-sans text-slate-900 dark:text-white">
                    {u.name}
                  </td>
                  <td className="p-3.5 font-sans">
                    <span className="flex items-center gap-1.5">
                      <span className="text-base">{u.flag}</span>
                      <span className="text-slate-600 dark:text-slate-400">{u.country}</span>
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{u.favoriteAsset}</td>
                  <td className="p-3.5 text-emerald-500 font-bold">{u.winRate}%</td>
                  <td className="p-3.5 text-slate-500">{u.totalTrades}</td>
                  <td className="p-3.5 text-right font-bold text-emerald-500 text-sm">
                    +${u.profit.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
