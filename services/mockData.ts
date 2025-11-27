import { StockCandle, Asset, Transaction } from '../types';

// 產生模擬 K 線資料
export const generateMockCandles = (days: number, startPrice: number = 150): StockCandle[] => {
  let currentPrice = startPrice;
  const now = new Date();
  const candles: StockCandle[] = [];

  for (let i = days; i > 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // 隨機波動
    const volatility = currentPrice * 0.02;
    const change = (Math.random() - 0.5) * volatility;
    
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 1000000) + 500000;

    candles.push({
      t: date.getTime(),
      o: Number(open.toFixed(2)),
      h: Number(high.toFixed(2)),
      l: Number(low.toFixed(2)),
      c: Number(close.toFixed(2)),
      v: volume
    });

    currentPrice = close;
  }
  return candles;
};

// 模擬資產
export const MOCK_ASSETS: Asset[] = [
  { id: '1', symbol: 'USD', name: '美金現金', quantity: 50000, avgPrice: 1, type: 'Cash' },
  { id: '2', symbol: 'AAPL', name: 'Apple Inc.', quantity: 150, avgPrice: 145.20, type: 'Stock' },
  { id: '3', symbol: 'TSLA', name: 'Tesla Inc.', quantity: 50, avgPrice: 210.50, type: 'Stock' },
];

// 模擬交易紀錄
export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', symbol: 'AAPL', type: 'BUY', quantity: 100, price: 140.00, total: 14000, timestamp: Date.now() - 86400000 * 10 },
  { id: 't2', symbol: 'TSLA', type: 'BUY', quantity: 50, price: 210.50, total: 10525, timestamp: Date.now() - 86400000 * 5 },
  { id: 't3', symbol: 'AAPL', type: 'BUY', quantity: 50, price: 155.40, total: 7770, timestamp: Date.now() - 86400000 * 2 },
];
