import { StockCandle, TimeRange, Transaction, Asset } from '../types';
import { generateMockCandles, MOCK_ASSETS, MOCK_TRANSACTIONS } from './mockData';

// 環境變數檢查
const FINNHUB_KEY = process.env.VITE_FINNHUB_API_KEY;
// 這裡簡單模擬 Firebase Config 的檢查，實際專案中應初始化 Firebase App
const FIREBASE_CONFIG = process.env.VITE_FIREBASE_CONFIG_STRING;

// 檢查是否處於真實模式
export const isRealModeAvailable = (): boolean => {
  return !!FINNHUB_KEY && FINNHUB_KEY.length > 5;
};

// --- FINNHUB SERVICE ---

export const fetchStockData = async (symbol: string, range: TimeRange, useReal: boolean): Promise<{ candles: StockCandle[], price: number }> => {
  if (!useReal || !FINNHUB_KEY) {
    console.log(`[Mock Mode] Generating data for ${symbol}`);
    const days = range === '1D' ? 1 : (range === '1M' ? 30 : 365);
    // 如果是 1D，我們需要分鐘級別的數據，這裡簡化為生成 24 個點代表小時
    const points = range === '1D' ? 24 : (range === '1M' ? 30 : 52); 
    const mockCandles = generateMockCandles(points, 150 + Math.random() * 50);
    return {
      candles: mockCandles,
      price: mockCandles[mockCandles.length - 1].c
    };
  }

  try {
    // 這裡實作真實 API 呼叫 (Finnhub Quote & Candles)
    // 為了節省代碼空間與複雜度，這裡展示概念。實際應使用 fetch 呼叫 Finnhub
    // https://finnhub.io/api/v1/quote?symbol=AAPL&token=...
    // https://finnhub.io/api/v1/stock/candle?symbol=AAPL&resolution=...
    
    // 由於無法保證使用者提供有效的 Key，為了程式穩定性，若 fetch 失敗會自動 fallback 到 mock
    const quoteRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
    const quoteData = await quoteRes.json();
    
    // 計算解析度
    let resolution = 'D';
    let from = Math.floor(Date.now() / 1000) - 86400 * 30; // 預設 1M
    const to = Math.floor(Date.now() / 1000);

    if (range === '1D') { resolution = '30'; from = to - 86400; } // 30 min candles for 1 day
    if (range === '1Y') { resolution = 'W'; from = to - 31536000; }

    const candleRes = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_KEY}`);
    const candleData = await candleRes.json();

    if (candleData.s === 'ok') {
      const candles: StockCandle[] = candleData.t.map((t: number, i: number) => ({
        t: t * 1000,
        o: candleData.o[i],
        h: candleData.h[i],
        l: candleData.l[i],
        c: candleData.c[i],
        v: candleData.v[i]
      }));
      return { candles, price: quoteData.c || candles[candles.length - 1].c };
    } else {
      throw new Error('No data');
    }

  } catch (error) {
    console.warn("Finnhub API failed, falling back to mock", error);
    return fetchStockData(symbol, range, false);
  }
};

// --- STORAGE SERVICE (Firebase / LocalStorage) ---

const STORAGE_KEY_TX = 'alphatrade_transactions';
const STORAGE_KEY_ASSETS = 'alphatrade_assets';

export const saveTransaction = async (tx: Transaction, useReal: boolean): Promise<void> => {
  if (useReal && FIREBASE_CONFIG) {
    // 真實模式：寫入 Firestore (模擬介面)
    console.log('[Real Mode] Saving to Firestore:', tx);
    // 在此處實作 Firestore addDoc 邏輯
    // 由於沒有實際初始化 firebase，我們這邊僅 log 並同時寫入 localstorage 以確保 Demo 可用
  } 
  
  // 模擬/備份模式：LocalStorage
  const existing = getTransactions(false); // Force local read
  const updated = [tx, ...(await existing)];
  localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(updated));
};

export const getTransactions = async (useReal: boolean): Promise<Transaction[]> => {
  // 真實模式讀取 Firestore 省略...
  const data = localStorage.getItem(STORAGE_KEY_TX);
  return data ? JSON.parse(data) : MOCK_TRANSACTIONS;
};

export const saveAsset = async (asset: Asset, useReal: boolean): Promise<void> => {
  const existing = await getAssets(false);
  // Check if exists, update or add
  const index = existing.findIndex(a => a.symbol === asset.symbol && a.type === asset.type);
  let updated;
  if (index >= 0) {
    updated = [...existing];
    updated[index] = asset;
  } else {
    updated = [...existing, asset];
  }
  localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(updated));
};

export const getAssets = async (useReal: boolean): Promise<Asset[]> => {
  const data = localStorage.getItem(STORAGE_KEY_ASSETS);
  return data ? JSON.parse(data) : MOCK_ASSETS;
};