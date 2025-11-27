/// <reference types="vite/client" />

// 解決 TypeScript 在瀏覽器環境找不到 'process' 的問題
// 我們在 vite.config.ts 中使用了 define 來模擬 process.env，這裡補上型別定義

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY?: string;
    VITE_FINNHUB_API_KEY?: string;
    VITE_FIREBASE_CONFIG_STRING?: string;
    [key: string]: string | undefined;
  }
}
