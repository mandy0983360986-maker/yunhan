import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 載入當前模式的環境變數
  // 使用 '.' 代替 process.cwd() 以避免 TypeScript 類型錯誤
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react()],
    // 設定為 './' 確保資源路徑是相對的，適配 GitHub Pages 的非根目錄佈署
    base: './', 
    define: {
      // 為了相容程式碼中的 process.env 用法，我們在此定義全域變數
      // 注意：Gemini 的 API_KEY 會映射到 VITE_GEMINI_API_KEY
      'process.env.VITE_FINNHUB_API_KEY': JSON.stringify(env.VITE_FINNHUB_API_KEY),
      'process.env.VITE_FIREBASE_CONFIG_STRING': JSON.stringify(env.VITE_FIREBASE_CONFIG_STRING),
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.API_KEY),
    },
  }
})