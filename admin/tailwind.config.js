/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fdf2ee',
          100: '#fae0d5',
          200: '#f5bfaa',
          300: '#ed9475',
          400: '#e36340',
          500: '#c2501f',
          600: '#a84118',
          700: '#8c3413',
          800: '#7c2d12',
          900: '#6b2410',
        },
        cream: {
          50:  '#fffdf7',
          100: '#fef9f0',
          200: '#fdf3de',
          300: '#fbe9c0',
        },
        amber: {
          400: '#f59e0b',
          500: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};
