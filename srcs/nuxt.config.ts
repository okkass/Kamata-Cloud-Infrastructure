// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: { enabled: true },

  // 開発環境でもカスタムエラーページを使用
  debug: false, // デバッグモードを無効化してカスタムエラーページを表示

  nitro: {
    // srcsフォルダから見て「一つ上(..)」の「mock」フォルダを読み込み対象にする
    scanDirs: ["../mock"],
    errorHandler: "server/errorHandler.ts",
  },

  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
        depth: 99,
      },
    },
  },

  modules: ["@nuxtjs/tailwindcss", "@nuxt/icon"],
  icon: {
    customCollections: [
      {
        prefix: "images",
        dir: "./app/assets/images",
      },
    ],
  },

  css: ["~/assets/css/tailwind.css"],

  runtimeConfig: {
    public: {
      apiBaseUrl: "",
    },
  },
});
