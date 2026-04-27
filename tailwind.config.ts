import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#ff3b30',
        'brand-hover': '#e02d22',
        th: {
          bg: 'var(--bg)',
          card: 'var(--bg-card)',
          subtle: 'var(--bg-subtle)',
          input: 'var(--bg-input)',
          border: 'var(--border)',
          text: 'var(--text)',
          muted: 'var(--text-muted)',
          accent: 'var(--accent)',
          'accent-hover': 'var(--accent-hover)',
          'accent-text': 'var(--accent-text)',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        site: '1320px',
      },
    },
  },
}
export default config
