// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
        depth: 99,
      },
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || "http://localhost:3000/api",
    },
  },

  modules: ["@nuxtjs/tailwindcss"],
});
