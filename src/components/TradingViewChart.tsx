import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { createChart, CandlestickSeries, AreaSeries, LineSeries, IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { CandlestickChart, TrendingUp, Clock, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

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
type Timeframe = '5s' | '15s' | '1m' | '5m';

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
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [lastTickPrice, setLastTickPrice] = useState<number | null>(null);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');

  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const sma20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const sma50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Store candles in a ref to manage real-time tick streaming smoothly
  const candlesRef = useRef<Array<{ time: number; open: number; high: number; low: number; close: number }>>([]);
  const tradeLinesRef = useRef<any[]>([]);

  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
    localStorage.setItem('preferred_chart_type', type);
  };

  const handleTimeframeChange = (tf: Timeframe) => {
    setTimeframe(tf);
    localStorage.setItem('preferred_timeframe', tf);
  };

  const getTimeframeSeconds = (tf: Timeframe): number => {
    switch (tf) {
      case '5s': return 5;
      case '15s': return 15;
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

  const generateSeedCandles = useCallback((sym: string, basePrice: number, tf: Timeframe) => {
    const intervalSec = getTimeframeSeconds(tf);
    const decimals = getDecimals(sym);
    const nowSec = Math.floor(Date.now() / 1000);
    const roundedNowSec = nowSec - (nowSec % intervalSec);
    const seed: Array<{ time: number; open: number; high: number; low: number; close: number }> = [];
    let p = basePrice || 100;

    for (let i = 80 - 1; i >= 0; i--) {
      const time = roundedNowSec - i * intervalSec;
      const open = p;
      const vol = (basePrice || 100) * 0.002;
      const delta = (Math.random() - 0.49) * vol * 2;
      const close = Number((open + delta).toFixed(decimals));
      const high = Number((Math.max(open, close) + Math.random() * vol).toFixed(decimals));
      const low = Number((Math.min(open, close) - Math.random() * vol).toFixed(decimals));
      seed.push({ time, open: Number(open.toFixed(decimals)), high, low, close });
      p = close;
    }
    return seed;
  }, []);

  // Helper to compute SMA
  const computeSMA = (candles: any[], period: number) => {
    const smaData: Array<{ time: Time; value: number }> = [];
    for (let i = 0; i < candles.length; i++) {
      if (i < period - 1) continue;
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += candles[i - j].close;
      }
      smaData.push({
        time: candles[i].time as Time,
        value: Number((sum / period).toFixed(getDecimals(symbol)))
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
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: '#334155',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
        secondsVisible: timeframe === '5s' || timeframe === '15s',
      },
    });

    chartRef.current = chart;

    // Create primary price series
    let candlestickSeries: ISeriesApi<'Candlestick'> | null = null;
    let areaSeries: ISeriesApi<'Area'> | null = null;

    if (chartType === 'candlestick') {
      candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
      candlestickSeriesRef.current = candlestickSeries;
    } else if (chartType === 'area') {
      areaSeries = chart.addSeries(AreaSeries, {
        topColor: 'rgba(38, 166, 154, 0.4)',
        bottomColor: 'rgba(38, 166, 154, 0.0)',
        lineColor: '#26a69a',
        lineWidth: 2,
      });
      areaSeriesRef.current = areaSeries;
    }

    // Add Moving Average lines if enabled
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

    // Immediately load existing candles or generate seed candles if empty
    if (candlesRef.current.length === 0) {
      candlesRef.current = generateSeedCandles(symbol, externalPrice || 100, timeframe);
    }

    const currentCandles = candlesRef.current;
    if (currentCandles.length > 0) {
      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setData(currentCandles as any);
      }
      if (areaSeriesRef.current) {
        areaSeriesRef.current.setData(currentCandles.map(c => ({ time: c.time as Time, value: c.close })));
      }
      if (sma20SeriesRef.current && currentCandles.length >= 20) {
        sma20SeriesRef.current.setData(computeSMA(currentCandles, 20));
      }
      if (sma50SeriesRef.current && currentCandles.length >= 50) {
        sma50SeriesRef.current.setData(computeSMA(currentCandles, 50));
      }
      chart.timeScale().fitContent();
    }

    // Handle Resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        const w = chartContainerRef.current.clientWidth;
        const h = chartContainerRef.current.clientHeight;
        if (w > 0 && h > 0) {
          chartRef.current.applyOptions({
            width: w,
            height: h,
          });
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
  }, [chartType, showSMA20, showSMA50, timeframe, symbol, generateSeedCandles]);

  // 2. Fetch Historical Data & Build Initial Candle Stream
  const fetchKlines = useCallback(async () => {
    try {
      const res = await fetch(`/api/klines/${encodeURIComponent(symbol)}`);
      const json = await res.json();
      
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const intervalSec = getTimeframeSeconds(timeframe);
        const decimals = getDecimals(symbol);

        const rawKlines = json.data;
        const formattedCandles: Array<{ time: number; open: number; high: number; low: number; close: number }> = [];

        // Aggregate into timeframe bars cleanly
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

        candlesRef.current = formattedCandles;

        // Populate lightweight charts series
        if (candlestickSeriesRef.current) {
          candlestickSeriesRef.current.setData(formattedCandles as any);
        }
        if (areaSeriesRef.current) {
          areaSeriesRef.current.setData(formattedCandles.map(c => ({ time: c.time as Time, value: c.close })));
        }

        if (sma20SeriesRef.current) {
          sma20SeriesRef.current.setData(computeSMA(formattedCandles, 20));
        }
        if (sma50SeriesRef.current) {
          sma50SeriesRef.current.setData(computeSMA(formattedCandles, 50));
        }

        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      }
    } catch (e) {
      console.error('Failed to load klines', e);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    fetchKlines();
  }, [fetchKlines]);

  // 3. Real-Time Moving Candle Tick Engine (Applies Live Micro-Ticks Continuous Updates)
  const applyPriceTick = useCallback((newPrice: number) => {
    if (!newPrice || isNaN(newPrice)) return;

    const intervalSec = getTimeframeSeconds(timeframe);
    const decimals = getDecimals(symbol);
    const nowSec = Math.floor(Date.now() / 1000);
    const barTime = Math.floor(nowSec / intervalSec) * intervalSec;

    // Price Direction Feedback
    if (lastTickPrice !== null) {
      if (newPrice > lastTickPrice) setPriceDirection('up');
      else if (newPrice < lastTickPrice) setPriceDirection('down');
    }
    setLastTickPrice(newPrice);

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
      // Update existing candle in place
      lastCandle.high = Number(Math.max(lastCandle.high, newPrice).toFixed(decimals));
      lastCandle.low = Number(Math.min(lastCandle.low, newPrice).toFixed(decimals));
      lastCandle.close = Number(newPrice.toFixed(decimals));
    } else if (barTime > lastCandle.time) {
      // Create and append brand new candle bar!
      const newCandle = {
        time: barTime,
        open: lastCandle.close,
        high: Number(Math.max(lastCandle.close, newPrice).toFixed(decimals)),
        low: Number(Math.min(lastCandle.close, newPrice).toFixed(decimals)),
        close: Number(newPrice.toFixed(decimals)),
      };
      candles.push(newCandle);
      if (candles.length > 300) candles.shift(); // keep memory tight
    }

    const updatedCandle = candles[candles.length - 1];

    // Push live update to lightweight charts
    if (candlestickSeriesRef.current) {
      candlestickSeriesRef.current.update(updatedCandle as any);
    }
    if (areaSeriesRef.current) {
      areaSeriesRef.current.update({ time: updatedCandle.time as Time, value: updatedCandle.close });
    }

    if (sma20SeriesRef.current && candles.length >= 20) {
      const sma20Val = computeSMA(candles.slice(-30), 20).pop();
      if (sma20Val) sma20SeriesRef.current.update(sma20Val);
    }
    if (sma50SeriesRef.current && candles.length >= 50) {
      const sma50Val = computeSMA(candles.slice(-60), 50).pop();
      if (sma50Val) sma50SeriesRef.current.update(sma50Val);
    }

    setIsLiveActive(true);
  }, [timeframe, symbol, lastTickPrice]);

  // Continuous micro-polling for tick updates (500ms pulse for high-frequency candle animation)
  useEffect(() => {
    if (externalPrice) {
      applyPriceTick(externalPrice);
    }

    const fetchLivePriceTick = async () => {
      try {
        const res = await fetch('/api/market/prices');
        if (res.ok) {
          const prices = await res.json();
          if (prices[symbol]) {
            applyPriceTick(prices[symbol]);
          }
        }
      } catch (e) {
        // silent
      }
    };

    const interval = setInterval(fetchLivePriceTick, 500);
    return () => clearInterval(interval);
  }, [symbol, externalPrice, applyPriceTick]);

  // 4. Draw Active Trade Overlay Price Lines directly on chart
  useEffect(() => {
    if (!chartRef.current) return;

    // Clear old lines
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
      const color = isBuy ? '#26a69a' : '#ef5350';
      const lineOptions = {
        price: trade.entry_price,
        color: color,
        lineWidth: 2,
        lineStyle: 2, // Dashed
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
  const latestCandle = candlesRef.current[candlesRef.current.length - 1];
  const displayPrice = externalPrice || lastTickPrice || (latestCandle ? latestCandle.close : 0);
  const decimals = getDecimals(symbol);

  return (
    <div className="h-full w-full flex flex-col bg-[#0b0e14] border border-slate-800 rounded-lg overflow-hidden relative font-sans">
      
      {/* Top Interactive Controls Toolbar */}
      <div className="bg-[#0f141c] border-b border-slate-800 p-2 flex flex-wrap items-center justify-between gap-2 z-10 flex-shrink-0">
        
        {/* Left Symbol Info & Live Price */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
            <span className="font-bold text-xs text-white uppercase">{symbol}</span>
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <span className={`w-2 h-2 rounded-full ${isLiveActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`}></span>
              <span className="text-[10px] font-black text-emerald-400 tracking-wider uppercase">LIVE CANDLE TICK</span>
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 font-mono">
            <span className={`text-sm font-black transition-colors ${priceDirection === 'up' ? 'text-emerald-400' : priceDirection === 'down' ? 'text-rose-400' : 'text-white'}`}>
              ${displayPrice.toFixed(decimals)}
            </span>
            {latestCandle && (
              <span className={`text-[10px] font-bold ${latestCandle.close >= latestCandle.open ? 'text-emerald-400' : 'text-rose-400'}`}>
                {((latestCandle.close - latestCandle.open) / (latestCandle.open || 1) * 100).toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        {/* Center Mode & Timeframe Selector */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => handleChartTypeChange('candlestick')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-black uppercase transition-colors ${
                chartType === 'candlestick' ? 'bg-emerald-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>Candles</span>
            </button>
            <button
              onClick={() => handleChartTypeChange('area')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-black uppercase transition-colors ${
                chartType === 'area' ? 'bg-emerald-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <Clock className="w-3 h-3 text-slate-500 ml-1.5 mr-1" />
            {(['5s', '15s', '1m', '5m'] as Timeframe[]).map((tf) => (
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
                <div key={t.id} className="bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg p-2 text-[10px] font-mono shadow-xl flex items-center gap-3 animate-fade-in">
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
          <div className="text-[9px] text-slate-500 font-sans uppercase font-bold">
            Real-Time Live Moving Candlestick Chart
          </div>
        </div>
      )}

    </div>
  );
});
