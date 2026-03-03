// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui'],

  devServer: {
    port: 3002
  },

  // Target Cloudflare Pages + Workers for deployment.
  // Vercel Git integration automatically overrides this via NITRO_PRESET=vercel.
  // For manual Vercel CLI deploys, set NITRO_PRESET=vercel in your environment.
  nitro: {
    preset: 'cloudflare-pages',
  },

  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
  },
})
