import React, { useState } from 'react';
import { Transaction } from '../types';

interface Props {
  symbol: string;
  currentPrice: number;
  onTrade: (type: 'BUY' | 'SELL', quantity: number) => void;
  transactions: Transaction[];
}

export const TradingPanel: React.FC<Props> = ({ symbol, currentPrice, onTrade, transactions }) => {
  const [quantity, setQuantity] = useState<string>('1');
  const [activeTab, setActiveTab] = useState<'trade' | 'history'>('trade');

  const handleTrade = (type: 'BUY' | 'SELL') => {
    const qty = parseInt(quantity);
    if (qty > 0) {
      onTrade(type, qty);
    }
  };

  const estimatedTotal = (parseInt(quantity) || 0) * currentPrice;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      <div className="flex border-b border-slate-100">
        <button
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'trade' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('trade')}
        >
          模擬下單
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('history')}
        >
          交易紀錄
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {activeTab === 'trade' ? (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <span className="text-slate-500 text-xs uppercase tracking-wider">目前市價 ({symbol})</span>
              <div className="text-3xl font-bold text-slate-800 mt-1">${currentPrice.toFixed(2)}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">交易股數</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>

            <div className="flex justify-between items-center text-sm text-slate-600 px-1">
              <span>預估總額</span>
              <span className="font-semibold">${estimatedTotal.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => handleTrade('BUY')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition transform active:scale-95"
              >
                買入 (Buy)
              </button>
              <button
                onClick={() => handleTrade('SELL')}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition transform active:scale-95"
              >
                賣出 (Sell)
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
             {transactions.length === 0 && <p className="text-center text-slate-400 text-sm mt-10">尚無交易紀錄</p>}
             {transactions.map((tx) => (
               <div key={tx.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition">
                 <div>
                   <div className="flex items-center space-x-2">
                     <span className={`text-xs font-bold px-2 py-0.5 rounded ${tx.type === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                       {tx.type === 'BUY' ? '買入' : '賣出'}
                     </span>
                     <span className="font-semibold text-slate-700">{tx.symbol}</span>
                   </div>
                   <div className="text-xs text-slate-400 mt-1">{new Date(tx.timestamp).toLocaleDateString()}</div>
                 </div>
                 <div className="text-right">
                   <div className="font-medium text-slate-700">{tx.quantity} 股</div>
                   <div className="text-xs text-slate-500">@ ${tx.price}</div>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
