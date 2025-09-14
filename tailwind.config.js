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
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      animation: {
        'gradient-shift': 'gradient-shift 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'particle-float': 'particle-float 8s ease-in-out infinite',
        'particle-glow': 'particle-glow 3s ease-in-out infinite',
        'card-hover': 'card-hover 0.3s ease-out',
        'button-pulse': 'button-pulse 2s ease-in-out infinite',
        'loading-dots': 'loading-dots 1.4s ease-in-out infinite both',
        'typing': 'typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite',
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
            'box-shadow': '0 0 20px rgba(59, 130, 246, 0.5)',
          },
          '50%': {
            'box-shadow': '0 0 40px rgba(59, 130, 246, 0.8)',
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
        'slideIn': {
          'from': {
            opacity: '0',
            transform: 'translateX(-100px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'scaleIn': {
          'from': {
            opacity: '0',
            transform: 'scale(0.9)',
          },
          'to': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'shimmer': {
          '0%': {
            'background-position': '-200% 0',
          },
          '100%': {
            'background-position': '200% 0',
          },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top',
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': 'center bottom',
          },
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': 'right center',
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
            'box-shadow': '0 0 10px rgba(59, 130, 246, 0.5)',
          },
          '50%': {
            'box-shadow': '0 0 20px rgba(59, 130, 246, 0.8)',
          },
        },
        'card-hover': {
          '0%': {
            transform: 'translateY(0)',
          },
          '100%': {
            transform: 'translateY(-8px)',
          },
        },
        'button-pulse': {
          '0%, 100%': {
            'box-shadow': '0 0 20px rgba(59, 130, 246, 0.3)',
          },
          '50%': {
            'box-shadow': '0 0 30px rgba(59, 130, 246, 0.6)',
          },
        },
        'loading-dots': {
          '0%, 80%, 100%': {
            transform: 'scale(0)',
            opacity: '0.5',
          },
          '40%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'typing': {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'blink-caret': {
          'from, to': { 'border-color': 'transparent' },
          '50%': { 'border-color': 'orange' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
        'gradient-aurora': 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)',
        'gradient-sunset': 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
        'gradient-ocean': 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
        'gradient-forest': 'linear-gradient(45deg, #134e5e 0%, #71b280 100%)',
        'gradient-fire': 'linear-gradient(45deg, #ff416c 0%, #ff4b2b 100%)',
        'gradient-ice': 'linear-gradient(45deg, #74b9ff 0%, #0984e3 100%)',
        'gradient-purple': 'linear-gradient(45deg, #a8edea 0%, #fed6e3 100%)',
        'gradient-pink': 'linear-gradient(45deg, #ffecd2 0%, #fcb69f 100%)',
        'gradient-blue': 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
        'gradient-green': 'linear-gradient(45deg, #84fab0 0%, #8fd3f4 100%)',
        'gradient-orange': 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 100%)',
        'gradient-red': 'linear-gradient(45deg, #ff6b6b 0%, #ee5a24 100%)',
        'gradient-yellow': 'linear-gradient(45deg, #fdcb6e 0%, #e17055 100%)',
        'gradient-indigo': 'linear-gradient(45deg, #6c5ce7 0%, #a29bfe 100%)',
        'gradient-teal': 'linear-gradient(45deg, #00b894 0%, #00cec9 100%)',
        'gradient-cyan': 'linear-gradient(45deg, #00cec9 0%, #55a3ff 100%)',
        'gradient-lime': 'linear-gradient(45deg, #a4b0be 0%, #ff7675 100%)',
        'gradient-emerald': 'linear-gradient(45deg, #00b894 0%, #00cec9 100%)',
        'gradient-rose': 'linear-gradient(45deg, #fd79a8 0%, #fdcb6e 100%)',
        'gradient-violet': 'linear-gradient(45deg, #a29bfe 0%, #6c5ce7 100%)',
        'gradient-fuchsia': 'linear-gradient(45deg, #e84393 0%, #fd79a8 100%)',
        'gradient-sky': 'linear-gradient(45deg, #74b9ff 0%, #0984e3 100%)',
        'gradient-slate': 'linear-gradient(45deg, #636e72 0%, #2d3436 100%)',
        'gradient-gray': 'linear-gradient(45deg, #b2bec3 0%, #636e72 100%)',
        'gradient-zinc': 'linear-gradient(45deg, #ddd6fe 0%, #c4b5fd 100%)',
        'gradient-neutral': 'linear-gradient(45deg, #f5f5f5 0%, #e5e5e5 100%)',
        'gradient-stone': 'linear-gradient(45deg, #f5f5f4 0%, #e7e5e4 100%)',
        'gradient-red-500': 'linear-gradient(45deg, #ef4444 0%, #dc2626 100%)',
        'gradient-orange-500': 'linear-gradient(45deg, #f97316 0%, #ea580c 100%)',
        'gradient-amber-500': 'linear-gradient(45deg, #f59e0b 0%, #d97706 100%)',
        'gradient-yellow-500': 'linear-gradient(45deg, #eab308 0%, #ca8a04 100%)',
        'gradient-lime-500': 'linear-gradient(45deg, #84cc16 0%, #65a30d 100%)',
        'gradient-green-500': 'linear-gradient(45deg, #22c55e 0%, #16a34a 100%)',
        'gradient-emerald-500': 'linear-gradient(45deg, #10b981 0%, #059669 100%)',
        'gradient-teal-500': 'linear-gradient(45deg, #14b8a6 0%, #0d9488 100%)',
        'gradient-cyan-500': 'linear-gradient(45deg, #06b6d4 0%, #0891b2 100%)',
        'gradient-sky-500': 'linear-gradient(45deg, #0ea5e9 0%, #0284c7 100%)',
        'gradient-blue-500': 'linear-gradient(45deg, #3b82f6 0%, #2563eb 100%)',
        'gradient-indigo-500': 'linear-gradient(45deg, #6366f1 0%, #4f46e5 100%)',
        'gradient-violet-500': 'linear-gradient(45deg, #8b5cf6 0%, #7c3aed 100%)',
        'gradient-purple-500': 'linear-gradient(45deg, #a855f7 0%, #9333ea 100%)',
        'gradient-fuchsia-500': 'linear-gradient(45deg, #d946ef 0%, #c026d3 100%)',
        'gradient-pink-500': 'linear-gradient(45deg, #ec4899 0%, #db2777 100%)',
        'gradient-rose-500': 'linear-gradient(45deg, #f43f5e 0%, #e11d48 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.8)',
        'glow-xl': '0 0 60px rgba(59, 130, 246, 1)',
        'inner-glow': 'inset 0 0 20px rgba(59, 130, 246, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'neon': '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
        'neon-lg': '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}