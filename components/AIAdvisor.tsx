import React, { useEffect, useState } from 'react';
import { analyzeStock, analyzePortfolio } from '../services/geminiService';
import { StockCandle, Transaction } from '../types';

// Component for Stock Analysis
export const StockAdvisor = ({ symbol, price, candles, useReal }: { symbol: string, price: number, candles: StockCandle[], useReal: boolean }) => {
  const [advice, setAdvice] = useState<string>('分析中...');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAdvice('點擊下方按鈕開始分析...');
  }, [symbol]);

  const handleAnalyze = async () => {
    setLoading(true);
    setAdvice('Gemini 正在讀取市場數據...');
    const result = await analyzeStock(symbol, price, candles, useReal);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-indigo-900 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Gemini 智能行情分析
        </h3>
        <button 
            onClick={handleAnalyze} 
            disabled={loading}
            className={`text-xs px-3 py-1 rounded-full text-white font-medium transition ${loading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
            {loading ? '分析中...' : '立即分析'}
        </button>
      </div>
      <div className="bg-white p-4 rounded-lg text-sm text-slate-700 leading-relaxed min-h-[100px] whitespace-pre-line border border-indigo-100">
        {advice}
      </div>
    </div>
  );
};

// Component for Portfolio Advice
export const PortfolioAdvisor = ({ transactions, useReal }: { transactions: Transaction[], useReal: boolean }) => {
    const [advice, setAdvice] = useState<string>('');
    
    useEffect(() => {
        const fetchAdvice = async () => {
            if (transactions.length > 0) {
                const result = await analyzePortfolio(transactions, useReal);
                setAdvice(result);
            }
        };
        fetchAdvice();
    }, [transactions, useReal]);

    if (!advice) return null;

    return (
        <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-emerald-900 flex items-center mb-2">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                投資組合理財建議
            </h3>
            <p className="text-sm text-emerald-800 leading-relaxed">{advice}</p>
        </div>
    );
}
