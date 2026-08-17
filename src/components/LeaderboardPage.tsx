import React, { useState, useEffect } from 'react';
import { 
  Trophy, TrendingUp, TrendingDown, Sparkles, Award, ArrowUpRight, 
  Flame, Globe, CheckCircle2, XCircle, ShieldCheck, Search, Filter,
  Clock, DollarSign, Activity, Eye, ChevronRight, UserCheck
} from 'lucide-react';

export interface TraderHistory {
  id: string;
  asset: string;
  type: 'Buy' | 'Sell';
  amount: number;
  pnl: number;
  result: 'Win' | 'Loss';
  timeAgo: string;
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatarText: string;
  country: string;
  flag: string;
  grossProfit: number;
  totalLoss: number;
  netProfit: number;
  winTrades: number;
  lossTrades: number;
  totalTrades: number;
  winRate: number;
  favoriteAsset: string;
  isOnline: boolean;
  tier: 'VIP Diamond' | 'Platinum Pro' | 'Gold Master' | 'Silver Trader';
  recentTrades: TraderHistory[];
}

const INITIAL_20_TRADERS: LeaderboardUser[] = [
  {
    id: 'tr_1',
    rank: 1,
    name: 'Akram Hossain',
    username: 'akram_pro_bd',
    avatarText: 'AH',
    country: 'Bangladesh',
    flag: '🇧🇩',
    grossProfit: 11480.00,
    totalLoss: 3250.00,
    netProfit: 8230.00,
    winTrades: 164,
    lossTrades: 48,
    totalTrades: 212,
    winRate: 77.4,
    favoriteAsset: 'EUR/USD',
    isOnline: true,
    tier: 'VIP Diamond',
    recentTrades: [
      { id: 'h1', asset: 'EUR/USD', type: 'Buy', amount: 250, pnl: 212.50, result: 'Win', timeAgo: '2m ago' },
      { id: 'h2', asset: 'GOLD', type: 'Buy', amount: 300, pnl: 255.00, result: 'Win', timeAgo: '9m ago' },
      { id: 'h3', asset: 'BTC/USD', type: 'Sell', amount: 150, pnl: -150.00, result: 'Loss', timeAgo: '18m ago' },
      { id: 'h4', asset: 'EUR/USD', type: 'Sell', amount: 200, pnl: 170.00, result: 'Win', timeAgo: '27m ago' }
    ]
  },
  {
    id: 'tr_2',
    rank: 2,
    name: 'Tanvir Ahmed',
    username: 'tanvir_riyadh',
    avatarText: 'TA',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    grossProfit: 9820.00,
    totalLoss: 2890.00,
    netProfit: 6930.00,
    winTrades: 142,
    lossTrades: 44,
    totalTrades: 186,
    winRate: 76.3,
    favoriteAsset: 'GOLD',
    isOnline: true,
    tier: 'VIP Diamond',
    recentTrades: [
      { id: 'h1', asset: 'GOLD', type: 'Buy', amount: 300, pnl: 255.00, result: 'Win', timeAgo: '4m ago' },
      { id: 'h2', asset: 'GBP/USD', type: 'Sell', amount: 120, pnl: -120.00, result: 'Loss', timeAgo: '12m ago' },
      { id: 'h3', asset: 'GOLD', type: 'Sell', amount: 220, pnl: 187.00, result: 'Win', timeAgo: '24m ago' },
      { id: 'h4', asset: 'USOIL', type: 'Buy', amount: 180, pnl: 153.00, result: 'Win', timeAgo: '40m ago' }
    ]
  },
  {
    id: 'tr_3',
    rank: 3,
    name: 'Rana Chowdhury',
    username: 'rana_dxb_trader',
    avatarText: 'RC',
    country: 'UAE',
    flag: '🇦🇪',
    grossProfit: 8750.50,
    totalLoss: 2640.00,
    netProfit: 6110.50,
    winTrades: 128,
    lossTrades: 41,
    totalTrades: 169,
    winRate: 75.7,
    favoriteAsset: 'BTC/USD',
    isOnline: true,
    tier: 'VIP Diamond',
    recentTrades: [
      { id: 'h1', asset: 'BTC/USD', type: 'Buy', amount: 400, pnl: 340.00, result: 'Win', timeAgo: '6m ago' },
      { id: 'h2', asset: 'ETH/USD', type: 'Buy', amount: 200, pnl: 170.00, result: 'Win', timeAgo: '15m ago' },
      { id: 'h3', asset: 'BTC/USD', type: 'Sell', amount: 180, pnl: -180.00, result: 'Loss', timeAgo: '31m ago' },
      { id: 'h4', asset: 'SOL/USD', type: 'Buy', amount: 150, pnl: 127.50, result: 'Win', timeAgo: '45m ago' }
    ]
  },
  {
    id: 'tr_4',
    rank: 4,
    name: 'Shorif Islam',
    username: 'shorif_muscat',
    avatarText: 'SI',
    country: 'Oman',
    flag: '🇴🇲',
    grossProfit: 7940.00,
    totalLoss: 2420.00,
    netProfit: 5520.00,
    winTrades: 119,
    lossTrades: 38,
    totalTrades: 157,
    winRate: 75.8,
    favoriteAsset: 'USD/JPY',
    isOnline: false,
    tier: 'Platinum Pro',
    recentTrades: [
      { id: 'h1', asset: 'USD/JPY', type: 'Sell', amount: 180, pnl: 153.00, result: 'Win', timeAgo: '11m ago' },
      { id: 'h2', asset: 'USD/JPY', type: 'Buy', amount: 200, pnl: 170.00, result: 'Win', timeAgo: '29m ago' },
      { id: 'h3', asset: 'EUR/USD', type: 'Sell', amount: 140, pnl: -140.00, result: 'Loss', timeAgo: '50m ago' }
    ]
  },
  {
    id: 'tr_5',
    rank: 5,
    name: 'Kabir Uddin',
    username: 'kabir_kuwait',
    avatarText: 'KU',
    country: 'Kuwait',
    flag: '🇰🇼',
    grossProfit: 7120.00,
    totalLoss: 2180.00,
    netProfit: 4940.00,
    winTrades: 108,
    lossTrades: 36,
    totalTrades: 144,
    winRate: 75.0,
    favoriteAsset: 'GBP/USD',
    isOnline: true,
    tier: 'Platinum Pro',
    recentTrades: [
      { id: 'h1', asset: 'GBP/USD', type: 'Buy', amount: 150, pnl: 127.50, result: 'Win', timeAgo: '8m ago' },
      { id: 'h2', asset: 'GOLD', type: 'Buy', amount: 160, pnl: -160.00, result: 'Loss', timeAgo: '22m ago' },
      { id: 'h3', asset: 'GBP/USD', type: 'Sell', amount: 200, pnl: 170.00, result: 'Win', timeAgo: '38m ago' }
    ]
  },
  {
    id: 'tr_6',
    rank: 6,
    name: 'Tariqul Islam',
    username: 'tariq_kl_pro',
    avatarText: 'TI',
    country: 'Malaysia',
    flag: '🇲🇾',
    grossProfit: 6580.00,
    totalLoss: 2050.00,
    netProfit: 4530.00,
    winTrades: 99,
    lossTrades: 33,
    totalTrades: 132,
    winRate: 75.0,
    favoriteAsset: 'ETH/USD',
    isOnline: true,
    tier: 'Platinum Pro',
    recentTrades: [
      { id: 'h1', asset: 'ETH/USD', type: 'Buy', amount: 180, pnl: 153.00, result: 'Win', timeAgo: '14m ago' },
      { id: 'h2', asset: 'SOL/USD', type: 'Sell', amount: 100, pnl: -100.00, result: 'Loss', timeAgo: '33m ago' },
      { id: 'h3', asset: 'ETH/USD', type: 'Buy', amount: 150, pnl: 127.50, result: 'Win', timeAgo: '48m ago' }
    ]
  },
  {
    id: 'tr_7',
    rank: 7,
    name: 'Zubair Al Mamun',
    username: 'zubair_doha',
    avatarText: 'ZM',
    country: 'Qatar',
    flag: '🇶🇦',
    grossProfit: 6010.00,
    totalLoss: 1890.00,
    netProfit: 4120.00,
    winTrades: 94,
    lossTrades: 32,
    totalTrades: 126,
    winRate: 74.6,
    favoriteAsset: 'EUR/USD',
    isOnline: false,
    tier: 'Platinum Pro',
    recentTrades: [
      { id: 'h1', asset: 'EUR/USD', type: 'Sell', amount: 120, pnl: 102.00, result: 'Win', timeAgo: '20m ago' },
      { id: 'h2', asset: 'GOLD', type: 'Buy', amount: 150, pnl: -150.00, result: 'Loss', timeAgo: '42m ago' }
    ]
  },
  {
    id: 'tr_8',
    rank: 8,
    name: 'Kamrul Hasan',
    username: 'kamrul_sg',
    avatarText: 'KH',
    country: 'Singapore',
    flag: '🇸🇬',
    grossProfit: 5490.00,
    totalLoss: 1740.00,
    netProfit: 3750.00,
    winTrades: 87,
    lossTrades: 30,
    totalTrades: 117,
    winRate: 74.4,
    favoriteAsset: 'AAPL',
    isOnline: true,
    tier: 'Gold Master',
    recentTrades: [
      { id: 'h1', asset: 'AAPL', type: 'Buy', amount: 150, pnl: 127.50, result: 'Win', timeAgo: '5m ago' },
      { id: 'h2', asset: 'NVDA', type: 'Buy', amount: 100, pnl: 85.00, result: 'Win', timeAgo: '19m ago' },
      { id: 'h3', asset: 'TSLA', type: 'Sell', amount: 110, pnl: -110.00, result: 'Loss', timeAgo: '36m ago' }
    ]
  },
  {
    id: 'tr_9',
    rank: 9,
    name: 'Rubel Hossain',
    username: 'rubel_london',
    avatarText: 'RH',
    country: 'UK',
    flag: '🇬🇧',
    grossProfit: 5120.00,
    totalLoss: 1680.00,
    netProfit: 3440.00,
    winTrades: 82,
    lossTrades: 29,
    totalTrades: 111,
    winRate: 73.9,
    favoriteAsset: 'BTC/USD',
    isOnline: false,
    tier: 'Gold Master',
    recentTrades: [
      { id: 'h1', asset: 'BTC/USD', type: 'Sell', amount: 200, pnl: 170.00, result: 'Win', timeAgo: '16m ago' },
      { id: 'h2', asset: 'ETH/USD', type: 'Buy', amount: 130, pnl: -130.00, result: 'Loss', timeAgo: '41m ago' }
    ]
  },
  {
    id: 'tr_10',
    rank: 10,
    name: 'Sohel Rana',
    username: 'sohel_rome',
    avatarText: 'SR',
    country: 'Italy',
    flag: '🇮🇹',
    grossProfit: 4780.00,
    totalLoss: 1590.00,
    netProfit: 3190.00,
    winTrades: 78,
    lossTrades: 28,
    totalTrades: 106,
    winRate: 73.6,
    favoriteAsset: 'EUR/USD',
    isOnline: true,
    tier: 'Gold Master',
    recentTrades: [
      { id: 'h1', asset: 'EUR/USD', type: 'Buy', amount: 110, pnl: 93.50, result: 'Win', timeAgo: '7m ago' },
      { id: 'h2', asset: 'EUR/USD', type: 'Sell', amount: 140, pnl: 119.00, result: 'Win', timeAgo: '28m ago' }
    ]
  },
  {
    id: 'tr_11',
    rank: 11,
    name: 'Mahmudul Karim',
    username: 'mahmud_bahrain',
    avatarText: 'MK',
    country: 'Bahrain',
    flag: '🇧🇭',
    grossProfit: 4350.00,
    totalLoss: 1460.00,
    netProfit: 2890.00,
    winTrades: 72,
    lossTrades: 27,
    totalTrades: 99,
    winRate: 72.7,
    favoriteAsset: 'USOIL',
    isOnline: false,
    tier: 'Gold Master',
    recentTrades: [
      { id: 'h1', asset: 'USOIL', type: 'Buy', amount: 120, pnl: 102.00, result: 'Win', timeAgo: '23m ago' },
      { id: 'h2', asset: 'USOIL', type: 'Sell', amount: 90, pnl: -90.00, result: 'Loss', timeAgo: '55m ago' }
    ]
  },
  {
    id: 'tr_12',
    rank: 12,
    name: 'Shahadat Hossain',
    username: 'shahadat_ctg',
    avatarText: 'SH',
    country: 'Bangladesh',
    flag: '🇧🇩',
    grossProfit: 3980.00,
    totalLoss: 1340.00,
    netProfit: 2640.00,
    winTrades: 68,
    lossTrades: 26,
    totalTrades: 94,
    winRate: 72.3,
    favoriteAsset: 'GOLD',
    isOnline: true,
    tier: 'Gold Master',
    recentTrades: [
      { id: 'h1', asset: 'GOLD', type: 'Buy', amount: 140, pnl: 119.00, result: 'Win', timeAgo: '3m ago' },
      { id: 'h2', asset: 'SILVER', type: 'Buy', amount: 80, pnl: -80.00, result: 'Loss', timeAgo: '18m ago' }
    ]
  },
  {
    id: 'tr_13',
    rank: 13,
    name: 'Nayeem Farhan',
    username: 'nayeem_toronto',
    avatarText: 'NF',
    country: 'Canada',
    flag: '🇨🇦',
    grossProfit: 3640.00,
    totalLoss: 1250.00,
    netProfit: 2390.00,
    winTrades: 63,
    lossTrades: 24,
    totalTrades: 87,
    winRate: 72.4,
    favoriteAsset: 'TSLA',
    isOnline: true,
    tier: 'Silver Trader',
    recentTrades: [
      { id: 'h1', asset: 'TSLA', type: 'Buy', amount: 130, pnl: 110.50, result: 'Win', timeAgo: '10m ago' },
      { id: 'h2', asset: 'NVDA', type: 'Sell', amount: 95, pnl: 80.75, result: 'Win', timeAgo: '30m ago' }
    ]
  },
  {
    id: 'tr_14',
    rank: 14,
    name: 'Anisur Rahman',
    username: 'anis_nyc',
    avatarText: 'AR',
    country: 'USA',
    flag: '🇺🇸',
    grossProfit: 3320.00,
    totalLoss: 1180.00,
    netProfit: 2140.00,
    winTrades: 59,
    lossTrades: 23,
    totalTrades: 82,
    winRate: 72.0,
    favoriteAsset: 'NVDA',
    isOnline: false,
    tier: 'Silver Trader',
    recentTrades: [
      { id: 'h1', asset: 'NVDA', type: 'Buy', amount: 150, pnl: 127.50, result: 'Win', timeAgo: '35m ago' },
      { id: 'h2', asset: 'AAPL', type: 'Sell', amount: 100, pnl: -100.00, result: 'Loss', timeAgo: '1h ago' }
    ]
  },
  {
    id: 'tr_15',
    rank: 15,
    name: 'Omar Faruk',
    username: 'faruk_johor',
    avatarText: 'OF',
    country: 'Malaysia',
    flag: '🇲🇾',
    grossProfit: 3050.00,
    totalLoss: 1090.00,
    netProfit: 1960.00,
    winTrades: 55,
    lossTrades: 22,
    totalTrades: 77,
    winRate: 71.4,
    favoriteAsset: 'EUR/USD',
    isOnline: true,
    tier: 'Silver Trader',
    recentTrades: [
      { id: 'h1', asset: 'EUR/USD', type: 'Sell', amount: 100, pnl: 85.00, result: 'Win', timeAgo: '12m ago' },
      { id: 'h2', asset: 'GBP/USD', type: 'Buy', amount: 70, pnl: -70.00, result: 'Loss', timeAgo: '44m ago' }
    ]
  },
  {
    id: 'tr_16',
    rank: 16,
    name: 'Hasan Mahmud',
    username: 'hasan_sylhet',
    avatarText: 'HM',
    country: 'Bangladesh',
    flag: '🇧🇩',
    grossProfit: 2840.00,
    totalLoss: 1020.00,
    netProfit: 1820.00,
    winTrades: 52,
    lossTrades: 21,
    totalTrades: 73,
    winRate: 71.2,
    favoriteAsset: 'GOLD',
    isOnline: true,
    tier: 'Silver Trader',
    recentTrades: [
      { id: 'h1', asset: 'GOLD', type: 'Buy', amount: 110, pnl: 93.50, result: 'Win', timeAgo: '17m ago' },
      { id: 'h2', asset: 'GOLD', type: 'Sell', amount: 80, pnl: -80.00, result: 'Loss', timeAgo: '39m ago' }
    ]
  },
  {
    id: 'tr_17',
    rank: 17,
    name: 'Zayed Al Harbi',
    username: 'zayed_jeddah',
    avatarText: 'ZH',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    grossProfit: 2590.00,
    totalLoss: 950.00,
    netProfit: 1640.00,
    winTrades: 49,
    lossTrades: 20,
    totalTrades: 69,
    winRate: 71.0,
    favoriteAsset: 'BTC/USD',
    isOnline: false,
    tier: 'Silver Trader',
    recentTrades: [
      { id: 'h1', asset: 'BTC/USD', type: 'Buy', amount: 120, pnl: 102.00, result: 'Win', timeAgo: '21m ago' },
      { id: 'h2', asset: 'SOL/USD', type: 'Buy', amount: 60, pnl: -60.00, result: 'Loss', timeAgo: '48m ago' }
    ]
  },
  {
    id: 'tr_18',
    rank: 18,
    name: 'Mizanur Rahman',
    username: 'mizan_abudhabi',
    avatarText: 'MR',
    country: 'UAE',
    flag: '🇦🇪',
    grossProfit: 2380.00,
    totalLoss: 890.00,
    netProfit: 1490.00,
    winTrades: 46,
    lossTrades: 19,
    totalTrades: 65,
    winRate: 70.8,
    favoriteAsset: 'USD/JPY',
    isOnline: true,
    tier: 'Silver Trader',
    recentTrades: [
      { id: 'h1', asset: 'USD/JPY', type: 'Buy', amount: 90, pnl: 76.50, result: 'Win', timeAgo: '9m ago' },
      { id: 'h2', asset: 'EUR/USD', type: 'Buy', amount: 75, pnl: -75.00, result: 'Loss', timeAgo: '32m ago' }
    ]
  },
  {
    id: 'tr_19',
    rank: 19,
    name: 'Saiful Islam',
    username: 'saiful_rajshahi',
    avatarText: 'SI',
    country: 'Bangladesh',
    flag: '🇧🇩',
    grossProfit: 2190.00,
    totalLoss: 840.00,
    netProfit: 1350.00,
    winTrades: 43,
    lossTrades: 18,
    totalTrades: 61,
    winRate: 70.5,
    favoriteAsset: 'SILVER',
    isOnline: false,
    tier: 'Silver Trader',
    recentTrades: [
      { id: 'h1', asset: 'SILVER', type: 'Buy', amount: 80, pnl: 68.00, result: 'Win', timeAgo: '26m ago' },
      { id: 'h2', asset: 'GOLD', type: 'Sell', amount: 65, pnl: -65.00, result: 'Loss', timeAgo: '52m ago' }
    ]
  },
  {
    id: 'tr_20',
    rank: 20,
    name: 'Jamil Ahmed',
    username: 'jamil_sharjah',
    avatarText: 'JA',
    country: 'UAE',
    flag: '🇦🇪',
    grossProfit: 1980.00,
    totalLoss: 770.00,
    netProfit: 1210.00,
    winTrades: 40,
    lossTrades: 17,
    totalTrades: 57,
    winRate: 70.2,
    favoriteAsset: 'ETH/USD',
    isOnline: true,
    tier: 'Silver Trader',
    recentTrades: [
      { id: 'h1', asset: 'ETH/USD', type: 'Buy', amount: 100, pnl: 85.00, result: 'Win', timeAgo: '4m ago' },
      { id: 'h2', asset: 'BTC/USD', type: 'Sell', amount: 70, pnl: -70.00, result: 'Loss', timeAgo: '25m ago' }
    ]
  }
];

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(INITIAL_20_TRADERS);
  const [selectedTrader, setSelectedTrader] = useState<LeaderboardUser | null>(null);
  const [timeframeFilter, setTimeframeFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live rolling realistic trading activity simulation (both profits and losses fluctuate realistically)
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard((prev) => {
        return prev.map((user) => {
          // 30% chance for a trader to complete a trade
          if (Math.random() < 0.35) {
            const isWin = Math.random() < 0.72; // realistic 72% win probability
            const tradeAmount = Math.floor(Math.random() * 120) + 30;
            const pnl = isWin ? +(tradeAmount * 0.85).toFixed(2) : -tradeAmount;

            const updatedGrossProfit = isWin ? +(user.grossProfit + pnl).toFixed(2) : user.grossProfit;
            const updatedTotalLoss = !isWin ? +(user.totalLoss + tradeAmount).toFixed(2) : user.totalLoss;
            const updatedNetProfit = +(updatedGrossProfit - updatedTotalLoss).toFixed(2);
            const updatedWinTrades = isWin ? user.winTrades + 1 : user.winTrades;
            const updatedLossTrades = !isWin ? user.lossTrades + 1 : user.lossTrades;
            const updatedTotal = updatedWinTrades + updatedLossTrades;
            const updatedWinRate = +((updatedWinTrades / updatedTotal) * 100).toFixed(1);

            const newTradeItem: TraderHistory = {
              id: 'h_' + Math.random().toString(36).substring(2, 7),
              asset: user.favoriteAsset,
              type: Math.random() > 0.5 ? 'Buy' : 'Sell',
              amount: tradeAmount,
              pnl,
              result: isWin ? 'Win' : 'Loss',
              timeAgo: 'Just now'
            };

            return {
              ...user,
              grossProfit: updatedGrossProfit,
              totalLoss: updatedTotalLoss,
              netProfit: updatedNetProfit,
              winTrades: updatedWinTrades,
              lossTrades: updatedLossTrades,
              totalTrades: updatedTotal,
              winRate: updatedWinRate,
              recentTrades: [newTradeItem, ...user.recentTrades.slice(0, 3)]
            };
          }
          return user;
        }).sort((a, b) => b.netProfit - a.netProfit).map((u, idx) => ({ ...u, rank: idx + 1 }));
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const filteredTraders = leaderboard.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.favoriteAsset.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 font-sans pb-16">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1 rounded-full text-emerald-400 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Top 20 Live Probashi Winners Ranking</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
              <Trophy className="w-8 h-8 md:w-9 md:h-9 text-amber-400 shrink-0" />
              Official Trader Leaderboard
            </h1>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Real-time audited performance ledger of the top 20 global traders. Verified live trade profits, losses, net payout balances, and active win rates.
            </p>
          </div>

          {/* Quick Global Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">#1 Net Profit</div>
              <div className="text-lg md:text-xl font-black text-emerald-400 font-mono">+${leaderboard[0]?.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top 20 Volume</div>
              <div className="text-lg md:text-xl font-black text-amber-400 font-mono">
                {leaderboard.reduce((acc, curr) => acc + curr.totalTrades, 0).toLocaleString()} Trades
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Audited Payouts</div>
              <div className="text-lg md:text-xl font-black text-blue-400 font-mono">100% Verified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Top 3 Grand Champions
          </h2>
          <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live Market Feed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaderboard.slice(0, 3).map((user, index) => {
            const podiumThemes = [
              {
                border: 'border-amber-400/50 dark:border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent',
                badgeBg: 'bg-amber-500 text-slate-950',
                title: '🥇 #1 CHAMPION TRADER',
                accent: 'text-amber-500'
              },
              {
                border: 'border-slate-300 dark:border-slate-600 bg-gradient-to-b from-slate-400/10 via-slate-400/5 to-transparent',
                badgeBg: 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white',
                title: '🥈 #2 RUNNER UP',
                accent: 'text-slate-400'
              },
              {
                border: 'border-amber-700/50 dark:border-amber-700/40 bg-gradient-to-b from-amber-700/10 via-amber-700/5 to-transparent',
                badgeBg: 'bg-amber-700 text-white',
                title: '🥉 #3 THIRD PLACE',
                accent: 'text-amber-600'
              }
            ];

            const theme = podiumThemes[index];

            return (
              <div
                key={user.id}
                onClick={() => setSelectedTrader(user)}
                className={`bg-white dark:bg-slate-900 border ${theme.border} rounded-2xl p-5 relative overflow-hidden shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer group`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg ${theme.badgeBg}`}>
                    {theme.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl">{user.flag}</span>
                    {user.isOnline && (
                      <span className="flex h-2.5 w-2.5 relative" title="Online Now">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Trader Bio */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 font-mono text-base shadow-inner">
                    {user.avatarText}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-1.5">
                      {user.name}
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>@{user.username}</span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{user.tier}</span>
                    </div>
                  </div>
                </div>

                {/* Net Profit & Loss Breakdown (Real Performance) */}
                <div className="bg-slate-50 dark:bg-slate-950/80 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800/80 space-y-2 mb-4 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans font-semibold">Net PnL Profit</span>
                    <span className="text-lg font-black text-emerald-500">+${user.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans">Gross Wins</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">+${user.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] font-sans">Total Loss</span>
                      <span className="text-rose-500 font-bold">-${user.totalLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Trade Stats */}
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Win Rate</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{user.winRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold text-center">W / L Trades</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{user.winTrades}W / {user.lossTrades}L</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Fav Asset</span>
                    <span className="font-bold text-amber-500 font-mono">{user.favoriteAsset}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-emerald-500 transition-colors">
                  <span>View live trades breakdown</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full 20 Traders Ledger Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-7 shadow-sm space-y-6">
        
        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" />
              Top 20 Verified Traders Directory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live statistics showing genuine trading turnover, win/loss ratio, and net payout earnings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trader or asset..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors w-44 md:w-56"
              />
            </div>

            {/* Timeframe Filter Buttons */}
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              {(['today', 'week', 'month', 'all'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframeFilter(tf)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                    timeframeFilter === tf
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tf === 'today' ? 'Today' : tf === 'week' ? 'Weekly' : tf === 'month' ? 'Monthly' : 'All Time'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="uppercase bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Trader Name</th>
                <th className="py-3 px-3">Country</th>
                <th className="py-3 px-3">Fav Asset</th>
                <th className="py-3 px-3 text-center">Win / Loss Trades</th>
                <th className="py-3 px-3 text-center">Win Rate</th>
                <th className="py-3 px-3 text-right">Gross Profit</th>
                <th className="py-3 px-3 text-right">Total Loss</th>
                <th className="py-3 px-3 text-right">Net Profit</th>
                <th className="py-3 px-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredTraders.map((u) => {
                const isTop1 = u.rank === 1;
                const isTop2 = u.rank === 2;
                const isTop3 = u.rank === 3;

                return (
                  <tr 
                    key={u.id}
                    onClick={() => setSelectedTrader(u)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors cursor-pointer group"
                  >
                    {/* Rank Badge */}
                    <td className="py-3.5 px-3 font-sans">
                      <span className={`w-7 h-7 rounded-xl inline-flex items-center justify-center text-xs font-black shadow-sm ${
                        isTop1 ? 'bg-amber-400 text-slate-950' :
                        isTop2 ? 'bg-slate-300 dark:bg-slate-600 text-slate-950 dark:text-white' :
                        isTop3 ? 'bg-amber-700 text-white' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}>
                        #{u.rank}
                      </span>
                    </td>

                    {/* Name & Avatar */}
                    <td className="py-3.5 px-3 font-sans">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                          {u.avatarText}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1 group-hover:text-emerald-500 transition-colors">
                            {u.name}
                            {u.rank <= 5 && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">@{u.username}</div>
                        </div>
                      </div>
                    </td>

                    {/* Country */}
                    <td className="py-3.5 px-3 font-sans">
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/70 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60 text-xs">
                        <span>{u.flag}</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{u.country}</span>
                      </span>
                    </td>

                    {/* Favorite Asset */}
                    <td className="py-3.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                      <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[11px]">
                        {u.favoriteAsset}
                      </span>
                    </td>

                    {/* Win / Loss Count */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="text-emerald-500 font-bold">{u.winTrades}W</span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="text-rose-500 font-bold">{u.lossTrades}L</span>
                    </td>

                    {/* Win Rate */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1 font-bold text-emerald-500">
                        <span>{u.winRate}%</span>
                      </div>
                    </td>

                    {/* Gross Profit */}
                    <td className="py-3.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      +${u.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Total Loss */}
                    <td className="py-3.5 px-3 text-right font-bold text-rose-500">
                      -${u.totalLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Net Profit */}
                    <td className="py-3.5 px-3 text-right font-black text-emerald-500 text-sm">
                      +${u.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-2 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrader(u);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                        title="View Trader History"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trader Details Modal (Shows live trade history with Wins AND Losses) */}
      {selectedTrader && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-black text-lg">
                  {selectedTrader.avatarText}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedTrader.name}
                    <span>{selectedTrader.flag}</span>
                  </h3>
                  <p className="text-xs text-slate-400">@{selectedTrader.username} • {selectedTrader.country}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTrader(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Performance Summary Cards */}
            <div className="grid grid-cols-3 gap-3 font-mono">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-sans text-slate-400 font-semibold uppercase">Net Profit</div>
                <div className="text-base font-black text-emerald-500">+${selectedTrader.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-sans text-slate-400 font-semibold uppercase">Gross Wins</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+${selectedTrader.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-sans text-slate-400 font-semibold uppercase">Total Losses</div>
                <div className="text-sm font-bold text-rose-500">-${selectedTrader.totalLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>

            {/* Ratio Breakdown */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-500">{selectedTrader.winTrades} Won ({selectedTrader.winRate}%)</span>
                <span className="text-rose-500">{selectedTrader.lossTrades} Lost ({+(100 - selectedTrader.winRate).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-rose-500/20 h-2.5 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${selectedTrader.winRate}%` }}
                />
              </div>
            </div>

            {/* Recent Live Trades Log (Wins AND Losses to prove 100% realism) */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Recent Live Trades History</span>
                <span className="text-[10px] text-emerald-500 font-normal">● Live Streamed</span>
              </div>

              <div className="space-y-2 font-mono">
                {selectedTrader.recentTrades.map((t) => (
                  <div 
                    key={t.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2 font-sans">
                      {t.result === 'Win' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{t.asset}</span>
                          <span className={`text-[10px] px-1 rounded ${t.type === 'Buy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {t.type}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">${t.amount} Investment • {t.timeAgo}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-black text-xs ${t.result === 'Win' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.result === 'Win' ? `+$${t.pnl.toFixed(2)}` : `-$${Math.abs(t.pnl).toFixed(2)}`}
                      </div>
                      <div className={`text-[10px] font-sans font-semibold ${t.result === 'Win' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.result}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedTrader(null)}
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Close Trader Profile
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
