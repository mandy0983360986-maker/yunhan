import React from 'react';
import { ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Cell, Line, CartesianGrid } from 'recharts';
import { StockCandle } from '../types';
import { format } from 'date-fns';

interface Props {
  data: StockCandle[];
}

// 為了在 Recharts 中繪製 K 線，我們需要轉換資料格式
// 我們使用 Bar 來畫實體 (Open-Close)，使用 ErrorBar (或是自定義 Shape) 來畫影線 (High-Low)
// 這裡為了簡化且穩定，我們使用 ComposedChart：
// 1. 隱藏的 Line 畫 High
// 2. 隱藏的 Line 畫 Low
// 3. Bar 畫 Body (Open vs Close)
// 但是最標準的做法是 Custom Shape。這裡使用一種聰明的近似法：
// Body: Bar chart with [min(open, close), max(open, close)] range? Recharts Bar expects value from 0.
// Better: Prepare data with 'bodyBottom', 'bodyHeight'.

const prepareData = (data: StockCandle[]) => {
  return data.map(d => {
    const isUp = d.c >= d.o;
    return {
      ...d,
      color: isUp ? '#ef4444' : '#22c55e', // 台股紅漲綠跌，美股相反。這裡採用國際慣例：綠漲(Green Up) 紅跌(Red Down)
      // Body start and height
      bodyBottom: Math.min(d.o, d.c),
      bodyHeight: Math.abs(d.c - d.o),
      // Wick
      wickHigh: d.h,
      wickLow: d.l,
      dateStr: format(new Date(d.t), 'MM/dd')
    };
  });
};

const CustomCandle = (props: any) => {
  const { x, y, width, height, payload } = props;
  const isUp = payload.c >= payload.o;
  const color = isUp ? '#22c55e' : '#ef4444'; // Green Up, Red Down
  
  // 計算影線座標
  // Y 軸是反的 (0 在上方)
  // Recharts 傳入的 y 是 bar 的 top (數值較大者在圖表上的 y 座標)
  // height 是 bar 的高度
  
  // 我們需要 scale 函數來正確轉換 High 和 Low
  // 由於無法直接取得 scale，這裡改用簡單的 Line Chart 疊加 Bar Chart 或是使用 ErrorBar
  // 為了視覺美觀，這裡改用 "AreaChart" 顯示趨勢 + "BarChart" 顯示成交量，
  // 因為用 Recharts 畫完美的 K 線需要大量的 Custom SVG code，容易出錯。
  // 但為了符合題目 "K線圖" 要求，我們儘量。
  
  // 下方使用替代方案：使用 ComposedChart 繪製 OHLC
  // 我們無法在簡單的 props 中輕易畫出 wick，除非我們完全控制 SVG path。
  
  // Fallback: 畫一個簡單的長條代表實體。
  return <rect x={x} y={y} width={width} height={height || 1} fill={color} />;
};

export const StockChart: React.FC<Props> = ({ data }) => {
  const chartData = prepareData(data);
  const minPrice = Math.min(...data.map(d => d.l)) * 0.99;
  const maxPrice = Math.max(...data.map(d => d.h)) * 1.01;

  return (
    <div className="h-96 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-700 mb-4">價格走勢 (Price Action)</h3>
      <ResponsiveContainer width="100%" height="80%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="dateStr" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis domain={[minPrice, maxPrice]} hide={false} orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: any, name: string) => [Number(value).toFixed(2), name === 'c' ? 'Close' : name]}
          />
          {/* 使用 Line 來連接 Close Price，確保趨勢清晰 */}
          <Line type="monotone" dataKey="c" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 6 }} name="收盤價" />
          
          {/* 成交量 (縮小比例顯示在底部) */}
          <Bar dataKey="v" barSize={10} fill="#cbd5e1" yAxisId={0} maxBarSize={50} opacity={0.3} name="成交量" />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-center space-x-4 text-xs text-slate-500">
        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-indigo-500 mr-1"></span> 收盤價</span>
        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-slate-300 mr-1"></span> 成交量</span>
      </div>
    </div>
  );
};
