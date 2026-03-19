// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui', '@vercel/analytics/nuxt'],

  app: {
    head: {
      title: 'OhMyDoc — Free Resume Formatter | Paste → Format → PDF',
      meta: [
        { name: 'description', content: 'Paste your resume, get instant professional formatting, export to PDF. No signup, no AI rewriting, no paywall. Free and open source.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://ohmydoc.vercel.app' },
        { property: 'og:title', content: 'OhMyDoc — Free Resume Formatter | Paste → Format → PDF' },
        { property: 'og:description', content: 'Paste your resume, get instant professional formatting, export to PDF. No signup, no AI rewriting, no paywall. Free and open source.' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'OhMyDoc — Free Resume Formatter | Paste → Format → PDF' },
        { name: 'twitter:description', content: 'Paste your resume, get instant professional formatting, export to PDF. No signup, no AI rewriting, no paywall. Free and open source.' },
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
