import React, { useState, useEffect } from 'react';
import { User, Trade, AssetInfo } from '../types';
import { TradingViewChart } from './TradingViewChart';
import { ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, AlertCircle, Trophy, Sparkles, Flame } from 'lucide-react';

interface TradingDashboardProps {
  user: User;
  accountType: 'live' | 'demo';
  trades: Trade[];
  onTradeOpened: () => void;
  darkMode: boolean;
}

const ASSETS: AssetInfo[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', tvSymbol: 'FX:EURUSD', currentPrice: 1.0850, payoutRate: 85, category: 'Forex' },
  { symbol: 'GBP/USD', name: 'British Pound / USD', tvSymbol: 'FX:GBPUSD', currentPrice: 1.2720, payoutRate: 82, category: 'Forex' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', tvSymbol: 'FX:USDJPY', currentPrice: 154.30, payoutRate: 80, category: 'Forex' },
  { symbol: 'BTC/USD', name: 'Bitcoin BTC', tvSymbol: 'BINANCE:BTCUSDT', currentPrice: 94500, payoutRate: 88, category: 'Crypto' },
  { symbol: 'ETH/USD', name: 'Ethereum ETH', tvSymbol: 'BINANCE:ETHUSDT', currentPrice: 3250, payoutRate: 84, category: 'Crypto' },
  { symbol: 'SOL/USD', name: 'Solana SOL', tvSymbol: 'BINANCE:SOLUSDT', currentPrice: 145.20, payoutRate: 82, category: 'Crypto' },
  { symbol: 'GOLD', name: 'Gold XAU', tvSymbol: 'OANDA:XAUUSD', currentPrice: 2680.00, payoutRate: 85, category: 'Commodities' },
  { symbol: 'USOIL', name: 'Crude Oil', tvSymbol: 'TVC:USOIL', currentPrice: 82.50, payoutRate: 80, category: 'Commodities' },
  { symbol: 'SILVER', name: 'Silver XAG', tvSymbol: 'OANDA:XAGUSD', currentPrice: 31.20, payoutRate: 82, category: 'Commodities' },
  { symbol: 'AAPL', name: 'Apple AAPL', tvSymbol: 'NASDAQ:AAPL', currentPrice: 224.50, payoutRate: 86, category: 'Stocks' },
  { symbol: 'TSLA', name: 'Tesla TSLA', tvSymbol: 'NASDAQ:TSLA', currentPrice: 245.80, payoutRate: 85, category: 'Stocks' },
  { symbol: 'NVDA', name: 'Nvidia NVDA', tvSymbol: 'NASDAQ:NVDA', currentPrice: 132.40, payoutRate: 88, category: 'Stocks' },
];

const formatRemainingTime = (totalSeconds: number): string => {
  if (totalSeconds <= 0) return '0s';
  if (totalSeconds < 60) return `${totalSeconds}s`;
  if (totalSeconds < 3600) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  if (totalSeconds < 86400) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  const days = Math.floor(totalSeconds / 86400);
  const hrs = Math.floor((totalSeconds % 86400) / 3600);
  if (days >= 30) {
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    return remDays > 0 ? `${months}mo ${remDays}d` : `${months}mo`;
  }
  return hrs > 0 ? `${days}d ${hrs}h` : `${days}d`;
};

export const TradingDashboard: React.FC<TradingDashboardProps> = ({
  user,
  accountType,
  trades,
  onTradeOpened,
  darkMode
}) => {
  const [selectedAsset, setSelectedAsset] = useState<AssetInfo>(ASSETS[0]);
  const [investmentAmount, setInvestmentAmount] = useState<number>(10);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [tradeDuration, setTradeDuration] = useState<number>(30);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [leaderboard, setLeaderboard] = useState([
    { id: 1, rank: 1, flag: '🇧🇩', name: 'Akram_K***', profit: 4850.50 },
    { id: 2, rank: 2, flag: '🇲🇾', name: 'Probashi_99', profit: 4120.00 },
    { id: 3, rank: 3, flag: '🇦🇪', name: 'Rana_DXB', profit: 3790.25 }
  ]);

  // Leaderboard dynamic simulation
  useEffect(() => {
    const flags = ['🇧🇩', '🇲🇾', '🇦🇪', '🇸🇦', '🇶🇦', '🇴🇲', '🇧🇭'];
    const names = ['Akram_K***', 'Probashi_99', 'Rana_DXB', 'Malik_99', 'Shorif_Oman', 'Kamrul_BD', 'Zayed_KSA'];
    
    const interval = setInterval(() => {
      setLeaderboard(prev => {
        return prev.map(p => {
          if (Math.random() < 0.3) {
            return {
              ...p,
              flag: flags[Math.floor(Math.random() * flags.length)],
              name: names[Math.floor(Math.random() * names.length)],
              profit: p.profit + (Math.random() * 200 - 50)
            };
          }
          return {
            ...p,
            profit: p.profit + (Math.random() * 50)
          };
        }).sort((a, b) => b.profit - a.profit).map((p, i) => ({ ...p, rank: i + 1 }));
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Poll live price feed and current time for countdowns
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/market/prices');
        if (res.ok) {
          const data = await res.json();
          setLivePrices(data);
        }
      } catch (e) {
        // silent fallback
      }
    };

    fetchPrices();
    const interval = setInterval(() => {
      fetchPrices();
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentPrice = livePrices[selectedAsset.symbol] || selectedAsset.currentPrice;
  const currentBalance = accountType === 'demo' ? user.demo_balance : user.displayed_balance;
  const estimatedProfit = (investmentAmount * (selectedAsset.payoutRate / 100)).toFixed(2);

  const handleOpenTrade = async (tradeType: 'Buy' | 'Sell') => {
    if (investmentAmount <= 0) {
      setErrorMessage('Investment amount must be greater than $0');
      return;
    }

    if (investmentAmount > currentBalance) {
      setErrorMessage('Insufficient wallet balance');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/trade/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_name: selectedAsset.symbol,
          trade_type: tradeType,
          investment_amount: investmentAmount,
          payout_percentage: selectedAsset.payoutRate,
          duration: tradeDuration,
          account_type: accountType
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onTradeOpened();
      } else {
        setErrorMessage(data.error || 'Failed to place trade');
      }
    } catch (err) {
      setErrorMessage('Network connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const userTrades = trades.filter(t => t.user_id === user.id && t.account_type === accountType);
  const activeTrades = userTrades.filter(t => t.trade_status === 'Pending');
  const pastTrades = userTrades.filter(t => t.trade_status !== 'Pending');

  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-[#0b0e14] p-2 gap-2 overflow-hidden">
      
      {/* Left Area (Chart + Assets) */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative space-y-2">
        {/* Minimalist Asset Selector Cards */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
          {ASSETS.map((asset) => {
            const isSelected = selectedAsset.symbol === asset.symbol;
            const price = livePrices[asset.symbol] || asset.currentPrice;
            const isForex = asset.category === 'Forex';
            return (
              <button
                key={asset.symbol}
                onClick={() => setSelectedAsset(asset)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="text-left">
                  <div className="text-[10px] font-bold font-sans">{asset.symbol}</div>
                  <div className="text-[9px] text-emerald-500 font-semibold">{asset.payoutRate}%</div>
                </div>
                <div className="text-right font-mono text-[10px] font-semibold">
                  ${price.toFixed(isForex ? 4 : 2)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Chart Area */}
        <div className="flex-1 min-h-0 w-full rounded-lg overflow-hidden border border-slate-800">
          <TradingViewChart symbol={selectedAsset.symbol} tvSymbol={selectedAsset.tvSymbol} theme="dark" />
        </div>
      </div>

      {/* Right Control Terminal */}
      <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-2 h-full overflow-y-auto">
        <div className="bg-[#0b0e14] border border-slate-800 rounded-lg p-4 space-y-4 shadow-lg transition-colors flex-shrink-0">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white font-sans">
              Order
            </h2>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${accountType === 'demo' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              {accountType.toUpperCase()}
            </span>
          </div>

          {/* Absolute Investment Size Input Box */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
              <span>Amount ($)</span>
            </div>
            <input
              type="number"
              min="1"
              step="5"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-lg font-mono font-black text-white outline-none transition-all shadow-inner"
            />
            <div className="grid grid-cols-4 gap-1 mt-1.5">
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setInvestmentAmount(amt)}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-300 text-[10px] py-1 rounded border border-slate-800 font-mono transition-colors font-semibold"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Duration Timeline Box */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
              <span>Duration</span>
              <Clock className="w-3 h-3" />
            </div>
            <select
              value={tradeDuration}
              onChange={(e) => setTradeDuration(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs font-bold text-white outline-none cursor-pointer"
            >
              <option value={15}>15 Seconds</option>
              <option value={30}>30 Seconds</option>
              <option value={60}>1 Minute</option>
              <option value={120}>2 Minutes</option>
              <option value={300}>5 Minutes</option>
              <option value={600}>10 Minutes</option>
              <option value={900}>15 Minutes</option>
              <option value={2592000}>1 Month</option>
              <option value={7776000}>3 Months</option>
              <option value={15552000}>6 Months</option>
            </select>
          </div>

          {/* Active Trades Live Tracker */}
          {activeTrades.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase">Active Trades ({activeTrades.length})</h3>
              {activeTrades.map(trade => {
                const secondsLeft = Math.max(0, Math.ceil((trade.expires_at - currentTime) / 1000));
                const currentPrice = livePrices[trade.asset_name] || trade.entry_price;
                const isWinning = trade.trade_type === 'Buy' ? currentPrice > trade.entry_price : currentPrice < trade.entry_price;
                const profitAmount = isWinning ? trade.investment_amount + (trade.investment_amount * (trade.payout_percentage / 100)) : 0;

                return (
                  <div key={trade.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${isWinning ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    
                    <div className="flex justify-between items-start pl-2">
                      <div>
                        <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                          {trade.asset_name}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${trade.trade_type === 'Buy' ? 'bg-[#3cf06d]/20 text-[#3cf06d]' : 'bg-[#f23545]/20 text-[#f23545]'}`}>
                            {trade.trade_type === 'Buy' ? 'UP' : 'DOWN'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Entry: {trade.entry_price.toFixed(4)}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 mb-0.5">
                          <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                          <span className="text-sm font-black text-white font-mono">{formatRemainingTime(secondsLeft)}</span>
                        </div>
                        <div className={`text-xs font-bold font-mono ${isWinning ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isWinning ? `+$${profitAmount.toFixed(2)}` : `-$${trade.investment_amount.toFixed(2)}`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {errorMessage && (
            <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-500 text-[10px] flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Giant Standalone Execution Blocks */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => handleOpenTrade('Buy')}
              disabled={submitting}
              className="w-full bg-[#3cf06d] hover:bg-[#32cd58] text-black font-black py-3 px-4 rounded-xl transition-all shadow flex items-center justify-center group disabled:opacity-50"
            >
              <span className="text-sm uppercase tracking-wider flex items-center gap-2">
                UP ▲
              </span>
            </button>
            <button
              onClick={() => handleOpenTrade('Sell')}
              disabled={submitting}
              className="w-full bg-[#f23545] hover:bg-[#e02d3c] text-white font-black py-3 px-4 rounded-xl transition-all shadow flex items-center justify-center group disabled:opacity-50"
            >
              <span className="text-sm uppercase tracking-wider flex items-center gap-2">
                DOWN ▼
              </span>
            </button>
          </div>
        </div>

        {/* Sidebar Rolling Top Winners Leaderboard Ticker */}
        <div className="bg-[#0b0e14] border border-slate-800 rounded-lg p-3 flex-shrink-0 font-sans shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-white uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Top Winners</span>
            </div>
            <div className="flex items-center gap-1 bg-rose-500/10 px-1.5 py-0.5 rounded text-[8px] font-black text-rose-500 tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
              LIVE
            </div>
          </div>
          <div className="space-y-2 relative z-10">
            {leaderboard.slice(0, 3).map((w) => (
              <div key={w.id} className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-2 flex items-center justify-between text-[10px] font-mono hover:bg-slate-800 transition-all duration-300">
                <div className="flex items-center gap-2 font-sans font-bold text-white">
                  <span className="text-amber-400 w-3">#{w.rank}</span>
                  <span className="text-sm shadow-sm">{w.flag}</span>
                  <span className="truncate max-w-[70px] text-slate-300">{w.name}</span>
                </div>
                <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                   <span className="text-emerald-400 font-black">+$</span>
                   <span className="text-emerald-400 font-black">{w.profit.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Trades mini history inside sidebar to save space */}
        <div className="bg-[#0b0e14] border border-slate-800 rounded-lg p-3 flex-1 overflow-y-auto min-h-0 font-sans shadow-lg">
          <div className="text-[10px] font-bold text-white uppercase tracking-wider mb-2">
            Recent Trades
          </div>
          <div className="space-y-1.5">
            {[...activeTrades, ...pastTrades].slice(0, 5).map(trade => (
              <div key={trade.id} className="bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex items-center justify-between font-mono text-[10px]">
                <div>
                  <span className="font-bold font-sans text-white">{trade.asset_name}</span>
                  <span className="block text-[8px] text-slate-400">{trade.trade_type}</span>
                </div>
                <div className="text-right">
                  {trade.trade_status === 'Pending' ? (
                     <span className="text-amber-500">Wait</span>
                  ) : (
                     <span className={trade.trade_status === 'Win' ? 'text-emerald-500' : 'text-rose-500'}>
                        {trade.trade_status === 'Win' ? `+$${trade.profit?.toFixed(2)}` : `-$${trade.investment_amount}`}
                     </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
