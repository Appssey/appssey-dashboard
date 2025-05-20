/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#111111',
          card: '#1A1A1A',
          light: '#2A2A2A',
        },
        primary: {
          DEFAULT: '#FFFFFF',
          muted: '#999999',
        },
        accent: {
          DEFAULT: '#FF9500',
          muted: '#FFC46B',
        },
        border: {
          DEFAULT: '#333333',
          light: '#444444',
        },
      },
      fontFamily: {
        sans: [
          'Inter', 
          'ui-sans-serif', 
          'system-ui', 
          '-apple-system', 
          'BlinkMacSystemFont',
          'sans-serif'
        ],
      },
      spacing: {
        '4.5': '1.125rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};