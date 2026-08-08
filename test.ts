import { createChart, AreaSeries, CandlestickSeries } from 'lightweight-charts';
const chart = createChart(document.createElement('div'));
chart.addSeries(AreaSeries, { topColor: 'red' });
chart.addSeries(CandlestickSeries, { upColor: 'green' });
