/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg:         '#FAF6F0',   // warm cream background
          dark:       '#1C1009',   // near-black
          red:        '#7C2020',   // primary red-brown
          'red-dark': '#5C1818',   // hover state
          sand:       '#D0C4B0',   // border / divider
          muted:      '#9B8B7A',   // secondary text
          green:      '#C8DFC0',   // option selected bg
          'dark-green':'#2D5A27',  // option selected text
          card:       '#FFFFFF',
        },
        // Legacy aliases (for cart/confirmation compatibility)
        primary: {
          800: '#7C2020',
          700: '#5C1818',
        },
        cream: {
          100: '#FAF6F0',
        },
        hearth: {
          bg:       '#FAF6F0',
          espresso: '#7C2020',
          mocha:    '#5C1818',
          sand:     '#D0C4B0',
          stone:    '#9B8B7A',
          cream:    '#FAF6F0',
          dark:     '#1C1009',
          blush:    '#F5E8E0',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        card:       '0 2px 16px 0 rgba(28,16,9,0.07)',
        'card-lg':  '0 8px 32px 0 rgba(28,16,9,0.12)',
        'bottom-bar':'0 -4px 24px 0 rgba(28,16,9,0.10)',
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
