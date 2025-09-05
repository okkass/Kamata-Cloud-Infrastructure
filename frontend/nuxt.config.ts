// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
        depth: 99
      }
    }
  }
})
