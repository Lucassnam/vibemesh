import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy compat
        bg: '#08090a',
        card: '#0f1011',
        'neon-green': '#00FF87',
        'electric-blue': '#00B4FF',
        purple: '#9B5CFF',
      },
      fontFamily: {
        heading: ['Cabinet Grotesk', 'Inter Variable', 'sans-serif'],
        body: ['Inter Variable', 'SF Pro Display', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'Berkeley Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '4': '4px',
        '6': '6px',
        '8': '8px',
        '9': '9px',
        '12': '12px',
        '16': '16px',
        '24': '24px',
      },
      transitionDuration: {
        '100': '100ms',
        '150': '150ms',
        '250': '250ms',
      },
    },
  },
  plugins: [],
};

export default config;
