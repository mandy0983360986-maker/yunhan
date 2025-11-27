// 定義全域使用的型別

export interface StockCandle {
  t: number; // Time
  o: number; // Open
  h: number; // High
  l: number; // Low
  c: number; // Close
  v: number; // Volume
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  type: 'Stock' | 'Cash' | 'Crypto' | 'RealEstate';
}

export interface Transaction {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  timestamp: number;
}

export type TimeRange = '1D' | '1M' | '1Y';

export interface MarketData {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  candles: StockCandle[];
}
