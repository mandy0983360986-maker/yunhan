import { GoogleGenAI } from "@google/genai";
import { StockCandle, Transaction } from "../types";

export const analyzeStock = async (
  symbol: string, 
  price: number, 
  candles: StockCandle[], 
  useReal: boolean
): Promise<string> => {
  
  if (!useReal || !process.env.API_KEY) {
    return `[模擬分析模式]
    
針對 ${symbol} 的分析如下：
1. 目前價格為 ${price}，近期走勢顯示波動性增加。
2. K線型態呈現短期整理區間，支撐位約在 ${Math.round(price * 0.95)}。
3. 投資建議：建議觀察成交量變化，若突破壓力位可考慮少量佈局。
(此為無金鑰狀態下的預設回應)`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // 計算簡單指標
    const prices = candles.map(c => c.c);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const trend = prices[prices.length - 1] > prices[0] ? "上升" : "下降";

    const prompt = `
      請擔任專業的金融分析師。
      股票代號: ${symbol}
      現價: ${price}
      趨勢: 近期呈現${trend}趨勢
      週期均價: ${avg.toFixed(2)}
      
      請給出約 150 字的專業分析與投資建議。
      請直接給出純文字回應，不要使用 Markdown 格式 (不要 bold，不要 list 符號)，請像真人在對話一樣。
      請使用繁體中文。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "無法產生分析結果。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 服務暫時無法使用，請檢查 API 金鑰。";
  }
};

export const analyzePortfolio = async (transactions: Transaction[], useReal: boolean): Promise<string> => {
    if (!useReal || !process.env.API_KEY) {
        return `[模擬投顧模式] 根據您的交易歷史，您的投資風格偏向穩健。建議可以增加不同產業的配置以分散風險。`;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const historyStr = transactions.slice(0, 10).map(t => `${t.type} ${t.symbol} @ ${t.price}`).join(', ');
        
        const prompt = `
          請擔任個人財富管理顧問。
          這是使用者的近期交易紀錄: ${historyStr}
          
          請根據這些操作，簡短分析其投資風格並給出一個調整建議。
          請直接給出純文字回應，不要使用 Markdown。
          請使用繁體中文，語氣鼓勵且專業。
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "無法產生建議。";
    } catch (e) {
        return "AI 服務異常。";
    }
}