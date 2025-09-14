/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'gradient-shift': 'gradient-shift 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'card-lift': 'card-lift 0.3s ease-out',
        'button-glow': 'button-glow 2s ease-in-out infinite',
        'particle-float': 'particle-float 8s ease-in-out infinite',
        'particle-glow': 'particle-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
          },
          '50%': {
            transform: 'translateY(-20px) rotate(180deg)',
          },
        },
        'glow': {
          '0%, 100%': {
            'box-shadow': '0 0 20px rgba(6, 182, 212, 0.5)',
          },
          '50%': {
            'box-shadow': '0 0 40px rgba(6, 182, 212, 0.8)',
          },
        },
        'fadeIn': {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'card-lift': {
          '0%': {
            transform: 'translateY(0)',
          },
          '100%': {
            transform: 'translateY(-8px)',
          },
        },
        'button-glow': {
          '0%, 100%': {
            'box-shadow': '0 0 20px rgba(59, 130, 246, 0.3)',
          },
          '50%': {
            'box-shadow': '0 0 30px rgba(59, 130, 246, 0.6)',
          },
        },
        'particle-float': {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
          },
          '50%': {
            transform: 'translateY(-30px) rotate(180deg)',
          },
        },
        'particle-glow': {
          '0%, 100%': {
            'box-shadow': '0 0 10px rgba(6, 182, 212, 0.5)',
          },
          '50%': {
            'box-shadow': '0 0 20px rgba(6, 182, 212, 0.8)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
