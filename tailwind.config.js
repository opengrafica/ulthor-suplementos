/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ulthor: {
          black: '#000000',
          gold: '#D4AF37',
          'gold-light': '#E8C547',
          'gold-dark': '#B8960C',
          white: '#FFFFFF',
          gray: {
            900: '#0a0a0a',
            800: '#141414',
            700: '#1f1f1f',
            600: '#2a2a2a',
            500: '#3d3d3d',
            400: '#6b6b6b',
            300: '#9ca3af',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #B8960C 50%, #E8C547 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
      },
      boxShadow: {
        gold: '0 4px 20px rgba(212, 175, 55, 0.25)',
        'gold-lg': '0 8px 32px rgba(212, 175, 55, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
