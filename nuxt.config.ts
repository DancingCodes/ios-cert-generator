const siteUrl = process.env.NUXT_PUBLIC_SITE_URL ?? 'https://ioscert.moonc.love'

export default defineNuxtConfig({
  ssr: true,
  css: ['~/assets/scss/main.scss'],
  modules: ['@nuxtjs/sitemap'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'theme-color', content: '#f6f8fb' },
        { name: 'robots', content: 'index,follow' },
      ],
    },
  },
  site: {
    url: siteUrl,
    name: 'iOS 证书生成工具',
  },
  nitro: {
    prerender: { routes: ['/'] },
  },
  compatibilityDate: '2026-08-26',
})
