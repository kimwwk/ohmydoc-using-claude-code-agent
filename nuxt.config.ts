// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui', '@vercel/analytics/nuxt'],

  app: {
    head: {
      title: 'OhMyDoc | Free Resume Formatter (No Sign Up, ATS-Friendly)',
      meta: [
        { name: 'description', content: 'The actually free resume formatter. Paste your text from ChatGPT or Google Docs, get an ATS-friendly PDF instantly. No paywalls, no login required. Open source.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://ohmydoc.vercel.app' },
        { property: 'og:title', content: 'OhMyDoc | Free Resume Formatter (No Sign Up, ATS-Friendly)' },
        { property: 'og:description', content: 'The actually free resume formatter. Paste your text from ChatGPT or Google Docs, get an ATS-friendly PDF instantly. No paywalls, no login required. Open source.' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'OhMyDoc | Free Resume Formatter (No Sign Up, ATS-Friendly)' },
        { name: 'twitter:description', content: 'The actually free resume formatter. Paste your text from ChatGPT or Google Docs, get an ATS-friendly PDF instantly. No paywalls, no login required. Open source.' },
      ],
    },
  },

  devServer: {
    port: 3002
  },

  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
  },
})
