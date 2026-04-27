import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['nl', 'en'],
  defaultLocale: 'nl',
  pathnames: {
    '/': '/',
    '/verhuur': { nl: '/verhuur', en: '/rental' },
    '/verhuur/[slug]': { nl: '/verhuur/[slug]', en: '/rental/[slug]' },
    '/winkelwagen': { nl: '/winkelwagen', en: '/cart' },
    '/afrekenen': { nl: '/afrekenen', en: '/checkout' },
    '/bevestiging': { nl: '/bevestiging', en: '/confirmation' },
  },
})
