import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { createChart, CandlestickSeries, AreaSeries, LineSeries, IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { CandlestickChart, TrendingUp, Clock, RefreshCw, ZoomIn, ZoomOut, Maximize2, Activity, Zap } from 'lucide-react';

interface TradingViewChartProps {
  symbol: string;
  theme?: 'dark' | 'light';
  tvSymbol?: string;
  price?: number;
  onBuy?: () => void;
  onSell?: () => void;
  isSubmitting?: boolean;
  investmentAmount?: number;
  setInvestmentAmount?: (amount: number) => void;
  balance?: number;
  accountType?: 'demo' | 'live';
  activeTrades?: any[];
  currentTime?: number;
}

type ChartType = 'candlestick' | 'area';
type Timeframe = '5s' | '15s' | '30s' | '1m' | '5m';

export const TradingViewChart: React.FC<TradingViewChartProps> = memo(({
  symbol,
  price: externalPrice,
  activeTrades = [],
  currentTime = Date.now(),
}) => {
  const [chartType, setChartType] = useState<ChartType>(() => {
    return (localStorage.getItem('preferred_chart_type') as ChartType) || 'candlestick';
  });
  const [timeframe, setTimeframe] = useState<Timeframe>(() => {
    return (localStorage.getItem('preferred_timeframe') as Timeframe) || '1m';
  });
  const [showSMA20, setShowSMA20] = useState<boolean>(true);
  const [showSMA50, setShowSMA50] = useState<boolean>(false);
  const [lastTickPrice, setLastTickPrice] = useState<number | null>(null);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [candleSecondsRemaining, setCandleSecondsRemaining] = useState<number>(0);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const sma20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const sma50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Store candles in a ref to manage real-time tick streaming smoothly and gapless
  const candlesRef = useRef<Array<{ time: number; open: number; high: number; low: number; close: number }>>([]);
  const tradeLinesRef = useRef<any[]>([]);
  const currentLivePriceRef = useRef<number>(externalPrice || 100);

  useEffect(() => {
    if (externalPrice && !isNaN(externalPrice)) {
      currentLivePriceRef.current = externalPrice;
    }
  }, [externalPrice]);

  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
    localStorage.setItem('preferred_chart_type', type);
  };

  const getTimeframeSeconds = (tf: Timeframe): number => {
    switch (tf) {
      case '5s': return 5;
      case '15s': return 15;
      case '30s': return 30;
      case '1m': return 60;
      case '5m': return 300;
      default: return 60;
    }
  };

  const getDecimals = (sym: string): number => {
    const clean = sym.toUpperCase();
    if (clean.includes('USD') && !clean.includes('BTC') && !clean.includes('ETH') && !clean.includes('GOLD')) {
      return 4;
    }
    return 2;
  };

  const getTickUnit = (sym: string, basePrice: number): number => {
    const clean = sym.toUpperCase();
    const isCrypto = clean.includes('BTC') || clean.includes('ETH') || clean.includes('SOL');
    const isForex = clean.includes('USD') && !isCrypto && !clean.includes('GOLD') && !clean.includes('OIL') && !clean.includes('SILVER');
    if (isForex) return 0.00008;
    if (clean.includes('BTC')) return 4.50;
    if (clean.includes('ETH')) return 0.50;
    if (clean.includes('SOL')) return 0.08;
    if (clean.includes('GOLD')) return 0.30;
    if (clean.includes('SILVER')) return 0.015;
    if (clean.includes('OIL')) return 0.04;
    return Number((basePrice * 0.0002).toFixed(2));
  };

  // Helper to load cached candles from sessionStorage for zero-flash refresh persistence
  const getInitialCandles = useCallback((sym: string, targetCurrentPrice: number, tf: Timeframe) => {
    try {
      const cached = sessionStorage.getItem(`cached_candles_${sym}_${tf}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}

    const intervalSec = getTimeframeSeconds(tf);
    const decimals = getDecimals(sym);
    const nowSec = Math.floor(Date.now() / 1000);
    const roundedNowSec = nowSec - (nowSec % intervalSec);
    const seed: Array<{ time: number; open: number; high: number; low: number; close: number }> = [];

    const base = targetCurrentPrice || 100;
    const tickUnit = getTickUnit(sym, base);
    const candleVol = tickUnit * 3;

    let runningClose = base;
    const totalBars = 100;

    for (let i = 0; i < totalBars; i++) {
      const time = roundedNowSec - (i * intervalSec);
      const close = runningClose;
      const delta = (Math.sin(i * 0.15) * 0.5) * candleVol;
      const open = Number((close - delta).toFixed(decimals));
      const upperWick = Math.abs(delta) * 0.6;
      const lowerWick = Math.abs(delta) * 0.6;
      const high = Number((Math.max(open, close) + upperWick).toFixed(decimals));
      const low = Number((Math.min(open, close) - lowerWick).toFixed(decimals));

      seed.unshift({ time, open, high, low, close });
      runningClose = open;
    }

    return seed;
  }, []);

  // Compute Moving Averages
  const computeSMA = (candles: any[], period: number) => {
    const smaData: Array<{ time: Time; value: number }> = [];
    const decimals = getDecimals(symbol);
    for (let i = 0; i < candles.length; i++) {
      if (i < period - 1) continue;
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += candles[i - j].close;
      }
      smaData.push({
        time: candles[i].time as Time,
        value: Number((sum / period).toFixed(decimals))
      });
    }
    return smaData;
  };

  // 1. Main Lightweight Charts Initialization
  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartContainerRef.current.innerHTML = '';

    const containerWidth = chartContainerRef.current.clientWidth || 600;
    const containerHeight = chartContainerRef.current.clientHeight || 400;

    const chart = createChart(chartContainerRef.current, {
      width: containerWidth,
      height: containerHeight,
      layout: {
        background: { color: '#0b0e14' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#161f2e' },
        horzLines: { color: '#161f2e' },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        scaleMargins: {
          top: 0.12,
          bottom: 0.12,
        },
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: timeframe === '5s' || timeframe === '15s' || timeframe === '30s',
      },
    });

    chartRef.current = chart;

    // Create primary series
    let candlestickSeries: ISeriesApi<'Candlestick'> | null = null;
    let areaSeries: ISeriesApi<'Area'> | null = null;

    if (chartType === 'candlestick') {
      candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: true,
        borderColor: '#10b981',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });
      candlestickSeriesRef.current = candlestickSeries;
    } else if (chartType === 'area') {
      areaSeries = chart.addSeries(AreaSeries, {
        topColor: 'rgba(16, 185, 129, 0.35)',
        bottomColor: 'rgba(16, 185, 129, 0.01)',
        lineColor: '#10b981',
        lineWidth: 2,
      });
      areaSeriesRef.current = areaSeries;
    }

    // Moving Average Lines
    if (showSMA20) {
      sma20SeriesRef.current = chart.addSeries(LineSeries, {
        color: '#f59e0b',
        lineWidth: 1,
        title: 'SMA 20',
      });
    }
    if (showSMA50) {
      sma50SeriesRef.current = chart.addSeries(LineSeries, {
        color: '#3b82f6',
        lineWidth: 1,
        title: 'SMA 50',
      });
    }

    // Initialize with persistent continuous candles (from cache or deterministic seed)
    const currentPrice = currentLivePriceRef.current || 100;
    const initialCandles = getInitialCandles(symbol, currentPrice, timeframe);
    candlesRef.current = initialCandles;

    if (candlestickSeriesRef.current) {
      candlestickSeriesRef.current.setData(initialCandles as any);
    }
    if (areaSeriesRef.current) {
      areaSeriesRef.current.setData(initialCandles.map(c => ({ time: c.time as Time, value: c.close })));
    }
    if (sma20SeriesRef.current && initialCandles.length >= 20) {
      sma20SeriesRef.current.setData(computeSMA(initialCandles, 20));
    }
    if (sma50SeriesRef.current && initialCandles.length >= 50) {
      sma50SeriesRef.current.setData(computeSMA(initialCandles, 50));
    }

    chart.timeScale().fitContent();

    // Resize Handler
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        const w = chartContainerRef.current.clientWidth;
        const h = chartContainerRef.current.clientHeight;
        if (w > 0 && h > 0) {
          chartRef.current.applyOptions({ width: w, height: h });
        }
      }
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartType, showSMA20, showSMA50, timeframe, symbol, getInitialCandles]);

  // 2. Fetch server klines when symbol or timeframe changes
  const fetchKlines = useCallback(async () => {
    try {
      const res = await fetch(`/api/klines/${encodeURIComponent(symbol)}`);
      const json = await res.json();
      
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const intervalSec = getTimeframeSeconds(timeframe);
        const decimals = getDecimals(symbol);

        const rawKlines = json.data;
        const formattedCandles: Array<{ time: number; open: number; high: number; low: number; close: number }> = [];

        let currentBar: any = null;
        rawKlines.forEach((k: any) => {
          const barTime = Math.floor(k.time / intervalSec) * intervalSec;
          if (!currentBar || currentBar.time !== barTime) {
            if (currentBar) formattedCandles.push(currentBar);
            currentBar = {
              time: barTime,
              open: Number(k.open.toFixed(decimals)),
              high: Number(k.high.toFixed(decimals)),
              low: Number(k.low.toFixed(decimals)),
              close: Number(k.close.toFixed(decimals)),
            };
          } else {
            currentBar.high = Number(Math.max(currentBar.high, k.high).toFixed(decimals));
            currentBar.low = Number(Math.min(currentBar.low, k.low).toFixed(decimals));
            currentBar.close = Number(k.close.toFixed(decimals));
          }
        });
        if (currentBar) formattedCandles.push(currentBar);

        if (formattedCandles.length > 0) {
          // Guarantee zero gap between history and live current tick
          const lastC = formattedCandles[formattedCandles.length - 1];
          if (currentLivePriceRef.current) {
            lastC.close = currentLivePriceRef.current;
            lastC.high = Math.max(lastC.high, currentLivePriceRef.current);
            lastC.low = Math.min(lastC.low, currentLivePriceRef.current);
          }

          candlesRef.current = formattedCandles;
          try {
            sessionStorage.setItem(`cached_candles_${symbol}_${timeframe}`, JSON.stringify(formattedCandles.slice(-100)));
          } catch (e) {}

          if (candlestickSeriesRef.current) {
            candlestickSeriesRef.current.setData(formattedCandles as any);
          }
          if (areaSeriesRef.current) {
            areaSeriesRef.current.setData(formattedCandles.map(c => ({ time: c.time as Time, value: c.close })));
          }
          if (sma20SeriesRef.current && formattedCandles.length >= 20) {
            sma20SeriesRef.current.setData(computeSMA(formattedCandles, 20));
          }
          if (sma50SeriesRef.current && formattedCandles.length >= 50) {
            sma50SeriesRef.current.setData(computeSMA(formattedCandles, 50));
          }
          if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
          }
        }
      }
    } catch (e) {
      console.error('Failed to load klines', e);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    fetchKlines();
  }, [fetchKlines]);

  // 3. Smooth Micro-Tick Processing Engine (Chhoto chhoto kore up down, realistic wicks, continuous flow)
  const applyPriceTick = useCallback((newPrice: number) => {
    if (!newPrice || isNaN(newPrice)) return;

    currentLivePriceRef.current = newPrice;
    const intervalSec = getTimeframeSeconds(timeframe);
    const decimals = getDecimals(symbol);
    const nowSec = Math.floor(Date.now() / 1000);
    const barTime = Math.floor(nowSec / intervalSec) * intervalSec;

    // Seconds remaining in current active candle
    const secPassed = nowSec - barTime;
    const secRemaining = Math.max(0, intervalSec - secPassed);
    setCandleSecondsRemaining(secRemaining);

    // Direction calculation for visual pulse
    setLastTickPrice(prev => {
      if (prev !== null) {
        if (newPrice > prev) setPriceDirection('up');
        else if (newPrice < prev) setPriceDirection('down');
      }
      return newPrice;
    });

    let candles = candlesRef.current;
    if (candles.length === 0) {
      candlesRef.current = [{
        time: barTime,
        open: newPrice,
        high: newPrice,
        low: newPrice,
        close: newPrice
      }];
      candles = candlesRef.current;
    }

    const lastCandle = candles[candles.length - 1];

    if (lastCandle.time === barTime) {
      // In the same candle bar: dynamically stretch high/low wicks & update close
      lastCandle.high = Number(Math.max(lastCandle.high, newPrice).toFixed(decimals));
      lastCandle.low = Number(Math.min(lastCandle.low, newPrice).toFixed(decimals));
      lastCandle.close = Number(newPrice.toFixed(decimals));
    } else if (barTime > lastCandle.time) {
      // New candle opened! Open strictly equals previous close (100% gapless!)
      const newCandle = {
        time: barTime,
        open: lastCandle.close,
        high: Number(Math.max(lastCandle.close, newPrice).toFixed(decimals)),
        low: Number(Math.min(lastCandle.close, newPrice).toFixed(decimals)),
        close: Number(newPrice.toFixed(decimals)),
      };
      candles.push(newCandle);
      if (candles.length > 250) candles.shift();
    }

    const currentBar = candles[candles.length - 1];

    // Real-time smooth lightweight chart update
    try {
      if (chartRef.current && candlestickSeriesRef.current) {
        candlestickSeriesRef.current.update(currentBar as any);
      }
      if (chartRef.current && areaSeriesRef.current) {
        areaSeriesRef.current.update({ time: currentBar.time as Time, value: currentBar.close });
      }

      if (chartRef.current && sma20SeriesRef.current && candles.length >= 20) {
        const sma20Val = computeSMA(candles.slice(-30), 20).pop();
        if (sma20Val) sma20SeriesRef.current.update(sma20Val);
      }
      if (chartRef.current && sma50SeriesRef.current && candles.length >= 50) {
        const sma50Val = computeSMA(candles.slice(-60), 50).pop();
        if (sma50Val) sma50SeriesRef.current.update(sma50Val);
      }
    } catch (e) {
      // Ignore disposed chart/series errors during unmount or transition
    }
  }, [timeframe, symbol]);

  // 4. Dynamic Continuous Candle Pulse Engine (Active Non-Stop Up-Down Fluctuations)
  useEffect(() => {
    if (externalPrice) {
      applyPriceTick(externalPrice);
    }

    // Continuous 250ms organic live pulse (ensures candle is always visibly moving up & down 24/7, with or without any bet)
    const tickInterval = setInterval(() => {
      const current = currentLivePriceRef.current;
      const tickUnit = getTickUnit(symbol, current);
      const decimals = getDecimals(symbol);

      // Active organic random-walk step so the active candle dynamically pulses and stretches
      const noise = (Math.random() - 0.495);
      const step = noise * tickUnit * (0.8 + Math.random() * 0.8);
      const nextTick = Number((current + step).toFixed(decimals));

      applyPriceTick(nextTick);
    }, 250);

    // Sync with server live prices every 400ms
    const serverSyncInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/market/prices');
        if (res.ok) {
          const prices = await res.json();
          if (prices[symbol] && !isNaN(prices[symbol])) {
            applyPriceTick(prices[symbol]);
          }
        }
      } catch (e) {
        // silent
      }
    }, 400);

    return () => {
      clearInterval(tickInterval);
      clearInterval(serverSyncInterval);
    };
  }, [symbol, externalPrice, applyPriceTick]);

  // 5. Active Trade Overlay Lines
  useEffect(() => {
    if (!chartRef.current) return;

    tradeLinesRef.current.forEach(line => {
      try {
        if (candlestickSeriesRef.current) candlestickSeriesRef.current.removePriceLine(line);
        if (areaSeriesRef.current) areaSeriesRef.current.removePriceLine(line);
      } catch (e) {}
    });
    tradeLinesRef.current = [];

    const activeAssetTrades = activeTrades.filter(t => t.asset_name === symbol && t.trade_status === 'Pending');

    activeAssetTrades.forEach(trade => {
      const isBuy = trade.trade_type === 'Buy';
      const color = isBuy ? '#10b981' : '#ef4444';
      const lineOptions = {
        price: trade.entry_price,
        color: color,
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: `${isBuy ? '▲ UP' : '▼ DOWN'} $${trade.investment_amount}`,
      };

      if (candlestickSeriesRef.current) {
        const line = candlestickSeriesRef.current.createPriceLine(lineOptions);
        tradeLinesRef.current.push(line);
      } else if (areaSeriesRef.current) {
        const line = areaSeriesRef.current.createPriceLine(lineOptions);
        tradeLinesRef.current.push(line);
      }
    });
  }, [activeTrades, symbol]);

  // Zoom Controls
  const handleZoomIn = useCallback(() => {
    if (chartRef.current) {
      const ts = chartRef.current.timeScale();
      const currentSpacing = ts.options().barSpacing || 6;
      ts.applyOptions({ barSpacing: Math.min(currentSpacing * 1.3, 60) });
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (chartRef.current) {
      const ts = chartRef.current.timeScale();
      const currentSpacing = ts.options().barSpacing || 6;
      ts.applyOptions({ barSpacing: Math.max(currentSpacing / 1.3, 1) });
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, []);

  const handleTimeframeChange = (tf: Timeframe) => {
    setTimeframe(tf);
    localStorage.setItem('preferred_timeframe', tf);
  };

  const latestCandle = candlesRef.current[candlesRef.current.length - 1];
  const displayPrice = lastTickPrice || currentLivePriceRef.current || (latestCandle ? latestCandle.close : 0);
  const decimals = getDecimals(symbol);
  const intervalSeconds = getTimeframeSeconds(timeframe);
  const candlePercent = intervalSeconds > 0 ? ((intervalSeconds - candleSecondsRemaining) / intervalSeconds) * 100 : 0;

  return (
    <div className="h-full w-full flex flex-col bg-[#0b0e14] border border-slate-800 rounded-lg overflow-hidden relative font-sans select-none">
      
      {/* Top Interactive Controls Toolbar */}
      <div className="bg-[#0f141c] border-b border-slate-800 p-2 flex flex-wrap items-center justify-between gap-2 z-10 flex-shrink-0">
        
        {/* Left Symbol Info & Live Price */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
            <span className="font-black text-xs text-white uppercase tracking-wide">{symbol}</span>
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <span className={`w-2 h-2 rounded-full ${priceDirection === 'up' ? 'bg-emerald-400 animate-ping' : priceDirection === 'down' ? 'bg-rose-400 animate-ping' : 'bg-emerald-500'}`}></span>
              <span className="text-[10px] font-black text-emerald-400 tracking-wider uppercase flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400 inline" />
                LIVE
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-2 font-mono">
            <span className={`text-base font-black transition-colors duration-100 ${priceDirection === 'up' ? 'text-emerald-400' : priceDirection === 'down' ? 'text-rose-400' : 'text-white'}`}>
              ${displayPrice.toFixed(decimals)}
            </span>
            {latestCandle && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${latestCandle.close >= latestCandle.open ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {latestCandle.close >= latestCandle.open ? '+' : ''}
                {((latestCandle.close - latestCandle.open) / (latestCandle.open || 1) * 100).toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        {/* Center Mode & Timeframe Selector */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => handleChartTypeChange('candlestick')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-black uppercase transition-colors ${
                chartType === 'candlestick' ? 'bg-emerald-500 text-black shadow font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>Candles</span>
            </button>
            <button
              onClick={() => handleChartTypeChange('area')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-black uppercase transition-colors ${
                chartType === 'area' ? 'bg-emerald-500 text-black shadow font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>
          </div>

          {/* Timeframe selector (5s, 15s, 30s, 1m, 5m) */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <Clock className="w-3 h-3 text-slate-500 ml-1.5 mr-1" />
            {(['5s', '15s', '30s', '1m', '5m'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                  timeframe === tf ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Dynamic Candle Countdown Badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300">
            <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Candle:</span>
            <span className="font-bold text-emerald-400">{candleSecondsRemaining}s</span>
            <div className="w-8 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-1">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${candlePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Indicators & Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-2 py-1 rounded text-[9px] font-bold border transition-colors ${
              showSMA20 ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            SMA 20
          </button>
          <button
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-2 py-1 rounded text-[9px] font-bold border transition-colors ${
              showSMA50 ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            SMA 50
          </button>
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 ml-1">
            <button
              onClick={handleZoomIn}
              title="Zoom In (+)"
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out (-)"
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset Zoom / Fit Content"
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={fetchKlines}
            title="Refresh Data"
            className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded transition-colors ml-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Chart Canvas Display Area */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        
        {/* Render Lightweight Chart Container */}
        <div
          ref={chartContainerRef}
          className="w-full h-full block"
        />

        {/* Active Trade Floating Marker Cards directly on chart area */}
        {activeTrades.filter(t => t.asset_name === symbol && t.trade_status === 'Pending').length > 0 && (
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
            {activeTrades.filter(t => t.asset_name === symbol && t.trade_status === 'Pending').map(t => {
              const secondsLeft = Math.max(0, Math.ceil((t.expires_at - currentTime) / 1000));
              const isWin = t.trade_type === 'Buy' ? displayPrice > t.entry_price : displayPrice < t.entry_price;
              return (
                <div key={t.id} className="bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg p-2 text-[10px] font-mono shadow-xl flex items-center gap-3">
                  <div className={`px-1.5 py-0.5 rounded font-black uppercase text-[9px] ${t.trade_type === 'Buy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {t.trade_type === 'Buy' ? '▲ BUY UP' : '▼ SELL DOWN'} ${t.investment_amount}
                  </div>
                  <div className="text-slate-300">
                    Entry: <span className="text-white font-bold">{t.entry_price.toFixed(decimals)}</span>
                  </div>
                  <div className={`font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isWin ? 'IN THE MONEY' : 'OUT OF MONEY'} ({secondsLeft}s)
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Bottom Live OHLC Bar */}
      {latestCandle && (
        <div className="bg-[#090c10] border-t border-slate-800/80 px-3 py-1 flex items-center justify-between text-[10px] font-mono text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span>O: <strong className="text-slate-200">{latestCandle.open.toFixed(decimals)}</strong></span>
            <span>H: <strong className="text-emerald-400">{latestCandle.high.toFixed(decimals)}</strong></span>
            <span>L: <strong className="text-rose-400">{latestCandle.low.toFixed(decimals)}</strong></span>
            <span>C: <strong className="text-slate-200">{latestCandle.close.toFixed(decimals)}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-sans font-bold">
              Timeframe: <span className="text-emerald-400">{timeframe}</span>
            </span>
            <span className="text-[9px] text-slate-500 font-sans uppercase font-bold">
              Continuous Real-Time Candlestick Flow
            </span>
          </div>
        </div>
      )}

    </div>
  );
});
