/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false,
    container: false,
  },
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2DD4BF', dark: '#0D9488', light: '#F0FDFA' },
        success: { DEFAULT: '#10B981', dark: '#059669', light: '#ECFDF5', text: '#065F46' },
        warning: { DEFAULT: '#F97316', light: '#FFF7ED' },
        danger: '#EF4444',
        content: { DEFAULT: '#1E293B', secondary: '#94A3B8', tertiary: '#64748B', disabled: '#CBD5E1' },
        surface: { DEFAULT: '#F8FAFC', white: '#ffffff' },
        line: { DEFAULT: '#E2E8F0', light: '#F1F5F9', lighter: '#F8FAFC' },
        'gray-bg': '#E2E8F0',
      },
      spacing: {
        'ring': '6.25rem',
        'ring-inner': '5.3125rem',
      },
      fontSize: {
        'countdown': ['6.25rem', { lineHeight: '1' }],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-lg': '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)',
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeScaleIn: {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        bounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        countdownPulse: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gentlePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-scale-in': 'fadeScaleIn 0.5s ease-out',
        'bounce-slow': 'bounce 1s ease-in-out infinite',
        'countdown-pulse': 'countdownPulse 0.8s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'gentle-pulse': 'gentlePulse 2s ease-in-out infinite',
      },
    },
  },
}
