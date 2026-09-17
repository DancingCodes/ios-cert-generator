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
    url: 'https://ioscert.dancingcodes.cn',
    name: 'iOS 证书生成工具',
  },
  nitro: {
    prerender: { routes: ['/'] },
  },
  compatibilityDate: '2026-08-26',
})
