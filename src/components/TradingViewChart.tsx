import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  theme: 'dark' | 'light';
  tvSymbol?: string;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, theme, tvSymbol: customTvSymbol }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear existing container content
    containerRef.current.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    const widgetBody = document.createElement('div');
    widgetBody.className = 'tradingview-widget-container__widget';
    widgetBody.style.height = 'calc(100% - 20px)';
    widgetBody.style.width = '100%';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;

    // Determine TradingView symbol
    let tvSymbol = customTvSymbol || 'FX:EURUSD';
    if (!customTvSymbol) {
      if (symbol === 'GBP/USD') tvSymbol = 'FX:GBPUSD';
      else if (symbol === 'USD/JPY') tvSymbol = 'FX:USDJPY';
      else if (symbol === 'AAPL' || symbol === 'NASDAQ:AAPL') tvSymbol = 'NASDAQ:AAPL';
      else if (symbol === 'BTC/USD') tvSymbol = 'BINANCE:BTCUSDT';
      else if (symbol === 'ETH/USD') tvSymbol = 'BINANCE:ETHUSDT';
      else if (symbol === 'GOLD') tvSymbol = 'OANDA:XAUUSD';
      else if (symbol.includes(':')) tvSymbol = symbol;
    }

    script.innerHTML = JSON.stringify({
      "allow_symbol_change": true,
      "calendar": false,
      "details": false,
      "hide_side_toolbar": true,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "hide_volume": false,
      "hotlist": false,
      "interval": "1",
      "locale": "en",
      "save_image": false,
      "style": "1",
      "symbol": tvSymbol,
      "theme": theme,
      "timezone": "Etc/UTC",
      "backgroundColor": theme === 'dark' ? "#06090e" : "#ffffff",
      "gridColor": theme === 'dark' ? "rgba(242, 242, 242, 0.04)" : "rgba(0, 0, 0, 0.04)",
      "watchlist": [],
      "withdateranges": true,
      "compareSymbols": [],
      "studies": [],
      "autosize": true
    });

    widgetContainer.appendChild(widgetBody);
    widgetContainer.appendChild(script);
    containerRef.current.appendChild(widgetContainer);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, theme, customTvSymbol]);

  return (
    <div className="relative w-full h-full bg-white dark:bg-[#06090e] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div ref={containerRef} className="w-full h-full" id="tradingview_probashi_chart" />
    </div>
  );
};
