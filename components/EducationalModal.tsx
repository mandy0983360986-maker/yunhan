import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationalModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 relative animate-[fade-in_0.3s_ease-out]">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <h2 className="text-xl font-bold text-slate-800 mb-4">新手交易指南</h2>
        
        <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
            <div className="p-3 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-blue-800 text-sm mb-1">如何看 K 線 (Candlestick)？</h3>
                <p className="text-xs text-blue-700">K線由實體與影線組成。實體代表開盤與收盤價，影線代表最高與最低價。紅色通常代表收盤低於開盤(跌)，綠色代表收盤高於開盤(漲)。</p>
            </div>
            
             <div className="p-3 bg-indigo-50 rounded-lg">
                <h3 className="font-bold text-indigo-800 text-sm mb-1">成交量 (Volume) 的意義</h3>
                <p className="text-xs text-indigo-700">成交量代表該時段內的交易總股數。價格上漲配合爆量，通常代表趨勢強勁；無量上漲則可能代表動能不足。</p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg">
                <h3 className="font-bold text-emerald-800 text-sm mb-1">投資風險提示</h3>
                <p className="text-xs text-emerald-700">過往績效不代表未來表現。建議做好資產配置，不要將雞蛋放在同一個籃子裡。</p>
            </div>
        </div>

        <button 
            onClick={onClose}
            className="w-full mt-6 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-lg transition"
        >
            我瞭解了
        </button>
      </div>
    </div>
  );
};
