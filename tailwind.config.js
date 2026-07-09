/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#fafafa',
          dark: '#0b0b0d',
        },
        surface: {
          light: '#ffffff',
          dark: '#141417',
        },
        accent: {
          50: '#eef1ff',
          100: '#e0e4ff',
          200: '#c6ccff',
          300: '#a5aaff',
          400: '#8385fb',
          500: '#6a63f0',
          600: '#5a4bd6',
          700: '#4a3cb0',
          800: '#3d3390',
          900: '#352d74',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        card: '0 2px 8px -2px rgb(0 0 0 / 0.08), 0 4px 16px -4px rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
}
