/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // S-AI visual system tokens (Carbon / Chrome / Ice Blue)
        carbon: {
          950: '#0a0d12',
          900: '#0f141b',
          850: '#121821',
          800: '#151b23',
          700: '#1c242f',
          600: '#2a3441',
        },
        chrome: {
          300: '#dfe7ef',
          400: '#c9d3dd',
          500: '#a8b3bf',
          600: '#7d8894',
          700: '#5a6470',
        },
        ice: {
          200: '#b0e8ff',
          300: '#7fd7ff',
          400: '#3ec4ff',
          500: '#00a8ff',
          600: '#0088cc',
          700: '#006699',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
