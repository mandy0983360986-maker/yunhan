import React, { useState, useEffect } from 'react';
import { Asset, Transaction, StockCandle, TimeRange } from './types';
import { isRealModeAvailable, fetchStockData, getTransactions, saveTransaction, getAssets, saveAsset } from './services/apiService';
import { StockChart } from './components/StockChart';
import { AssetDashboard } from './components/AssetDashboard';
import { TradingPanel } from './components/TradingPanel';
import { StockAdvisor, PortfolioAdvisor } from './components/AIAdvisor';
import { EducationalModal } from './components/EducationalModal';

const App: React.FC = () => {
  // --- State ---
  const [useReal, setUseReal] = useState<boolean>(isRealModeAvailable());
  const [ticker, setTicker] = useState<string>('AAPL');
  const [searchVal, setSearchVal] = useState<string>('AAPL');
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  
  const [stockData, setStockData] = useState<{ candles: StockCandle[], price: number }>({ candles: [], price: 0 });
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [isEduOpen, setIsEduOpen] = useState(false);

  // --- Effects ---

  // 1. Initial Load (Assets & Transactions)
  useEffect(() => {
    const loadUserData = async () => {
      const txs = await getTransactions(useReal);
      const userAssets = await getAssets(useReal);
      setTransactions(txs);
      setAssets(userAssets);
    };
    loadUserData();
  }, [useReal]);

  // 2. Fetch Stock Data on Ticker/Range/Mode change
  useEffect(() => {
    const getData = async () => {
      const data = await fetchStockData(ticker, timeRange, useReal);
      setStockData(data);
    };
    getData();
  }, [ticker, timeRange, useReal]);

  // --- Handlers ---

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTicker(searchVal.toUpperCase());
  };

  const handleTrade = async (type: 'BUY' | 'SELL', quantity: number) => {
    const totalPrice = stockData.price * quantity;
    const newTx: Transaction = {
      id: Date.now().toString(),
      symbol: ticker,
      type,
      quantity,
      price: stockData.price,
      total: totalPrice,
      timestamp: Date.now()
    };

    // Update Transactions
    await saveTransaction(newTx, useReal);
    setTransactions(prev => [newTx, ...prev]);

    // Update Assets (Simplified Logic: Find & Update or Create)
    const newAssets = [...assets];
    const assetIdx = newAssets.findIndex(a => a.symbol === ticker);
    
    if (type === 'BUY') {
      if (assetIdx >= 0) {
        const a = newAssets[assetIdx];
        // Calculate new avg price
        const totalCost = (a.quantity * a.avgPrice) + totalPrice;
        const totalQty = a.quantity + quantity;
        a.avgPrice = totalCost / totalQty;
        a.quantity = totalQty;
      } else {
        newAssets.push({
          id: Date.now().toString(),
          symbol: ticker,
          name: ticker,
          quantity: quantity,
          avgPrice: stockData.price,
          type: 'Stock'
        });
      }
    } else {
      // SELL
      if (assetIdx >= 0) {
         newAssets[assetIdx].quantity -= quantity;
         if (newAssets[assetIdx].quantity <= 0) {
            newAssets.splice(assetIdx, 1);
         }
      }
    }
    
    // Save Assets logic
    newAssets.forEach(a => saveAsset(a, useReal));
    setAssets(newAssets);
  };

  const handleAddAsset = async () => {
    const symbol = prompt("資產代號 (e.g., TSLA):");
    const qtyStr = prompt("數量:");
    const priceStr = prompt("平均成本:");
    
    if (symbol && qtyStr && priceStr) {
      const newAsset: Asset = {
        id: Date.now().toString(),
        symbol: symbol.toUpperCase(),
        name: symbol.toUpperCase(),
        quantity: Number(qtyStr),
        avgPrice: Number(priceStr),
        type: 'Stock'
      };
      await saveAsset(newAsset, useReal);
      setAssets(prev => [...prev, newAsset]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
               <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">AlphaTrade <span className="text-indigo-600">Pro</span></h1>
          </div>

          <div className="flex items-center space-x-4">
             {/* Mode Toggle */}
             <div className="flex items-center bg-slate-100 rounded-full p-1 cursor-pointer" onClick={() => setUseReal(!useReal)}>
                <div className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${!useReal ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>模擬 Mock</div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${useReal ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}`}>真實 Real</div>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dashboard Section */}
        <AssetDashboard assets={assets} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Chart & Analysis (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Control Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 justify-between items-center">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input 
                  type="text" 
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-bold text-slate-700 w-32"
                  placeholder="AAPL"
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">載入</button>
              </form>

              <div className="flex bg-slate-100 rounded-lg p-1">
                {(['1D', '1M', '1Y'] as TimeRange[]).map(r => (
                  <button 
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1 text-sm rounded-md transition ${timeRange === r ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              
              <button onClick={() => setIsEduOpen(true)} className="text-slate-400 hover:text-indigo-500 transition">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
            </div>

            {/* Main Chart */}
            <StockChart data={stockData.candles} />

            {/* AI Advisor */}
            <StockAdvisor 
                symbol={ticker} 
                price={stockData.price} 
                candles={stockData.candles} 
                useReal={useReal} 
            />
          </div>

          {/* RIGHT COLUMN: Trading & List (4 cols) */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            
            {/* Trading Panel */}
            <div className="flex-1 min-h-[500px]">
                <TradingPanel 
                  symbol={ticker} 
                  currentPrice={stockData.price} 
                  onTrade={handleTrade} 
                  transactions={transactions}
                />
            </div>

            {/* Quick Asset Add (Bookkeeping) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-700">記帳小幫手</h3>
                  <button onClick={handleAddAsset} className="text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full text-slate-600 font-medium transition">
                    + 新增資產
                  </button>
               </div>
               <div className="space-y-2 max-h-40 overflow-y-auto">
                  {assets.map(a => (
                    <div key={a.id} className="flex justify-between text-sm p-2 border-b border-slate-50 last:border-0">
                      <span className="font-medium text-slate-700">{a.symbol}</span>
                      <span className="text-slate-500">{a.quantity} 單位</span>
                    </div>
                  ))}
               </div>
            </div>

             {/* Portfolio AI Advisor */}
             <PortfolioAdvisor transactions={transactions} useReal={useReal} />

          </div>
        </div>
      </main>

      <EducationalModal isOpen={isEduOpen} onClose={() => setIsEduOpen(false)} />
    </div>
  );
};

export default App;
