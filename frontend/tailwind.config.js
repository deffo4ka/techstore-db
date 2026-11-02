/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Syne"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f4f6f8',
          100: '#e4e9ee',
          200: '#c9d3dd',
          300: '#a3b3c4',
          400: '#768fa5',
          500: '#5b738c',
          600: '#485d73',
          700: '#3b4c5e',
          800: '#33414f',
          900: '#2d3844',
          950: '#1a2129',
        },
        accent: {
          DEFAULT: '#0d9488',
          soft: '#14b8a6',
          muted: '#ccfbf1',
        },
      },
      boxShadow: {
        panel: '0 1px 2px rgba(26, 33, 41, 0.04), 0 8px 24px rgba(26, 33, 41, 0.06)',
      },
    },
  },
  plugins: [],
};
