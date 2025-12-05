// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  nitro: {
    // srcsフォルダから見て「一つ上(..)」の「mock」フォルダを読み込み対象にする
    scanDirs: ["../mock"],
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
