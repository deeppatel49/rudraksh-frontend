/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#0d2d5e',
          700: '#174a8e',
          500: '#2978d6',
          100: '#eaf4ff',
        },
        accent: '#06b6d4',
      },
      boxShadow: {
        'soft': '0 10px 24px rgba(13, 45, 94, 0.08)',
        'card': '0 2px 8px rgba(13, 45, 94, 0.06)',
        'hover': '0 20px 40px rgba(13, 45, 94, 0.15)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.word-wrap': {
          'word-wrap': 'break-word',
          'word-break': 'break-word',
          'overflow-wrap': 'break-word',
          '-webkit-hyphens': 'auto',
          '-moz-hyphens': 'auto',
          'hyphens': 'auto',
        },
        '.word-break': {
          'word-break': 'break-all',
          'overflow-wrap': 'break-word',
        },
        '.break-inside-avoid': {
          'break-inside': 'avoid',
        },
      });
    }),
  ],
};
