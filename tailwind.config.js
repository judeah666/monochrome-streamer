/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './public/index.html',
    './public/app.js',
    './server.mjs',
    './src/react/**/*.{js,jsx}',
  ],
  safelist: [
    'tw-flex',
    'tw-grid',
    'tw-hidden',
    'tw-items-center',
    'tw-justify-between',
    'tw-gap-2',
    'tw-gap-3',
    'tw-rounded-card',
    'tw-rounded-pill',
    'tw-border',
    'tw-border-line',
    'tw-bg-surface',
    'tw-bg-surface2',
    'tw-bg-accent',
    'tw-p-4',
    'tw-px-4',
    'tw-py-2',
    'tw-text-text',
    'tw-text-muted',
    'tw-text-accent',
    'tw-font-bold',
    'tw-font-extrabold',
  ],
  corePlugins: {
    preflight: false,
  },
  prefix: 'tw-',
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        background: 'var(--background)',
        line: 'var(--line)',
        muted: 'var(--muted)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        text: 'var(--text)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        pill: '999px',
      },
      boxShadow: {
        glow: '0 18px 55px color-mix(in srgb, var(--accent) 18%, transparent)',
        panel: '0 24px 80px rgba(0, 0, 0, 0.24)',
      },
      fontFamily: {
        body: 'var(--font-body)',
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
