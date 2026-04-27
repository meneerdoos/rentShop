import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#ff3b30',
        'brand-hover': '#e02d22',
      },
    },
  },
}
export default config
