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
        primary: {
          DEFAULT: 'rgb(var(--twc-primary) / <alpha-value>)',
          dark: 'rgb(var(--twc-primary-dark) / <alpha-value>)',
          light: 'rgb(var(--twc-primary-light) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--twc-success) / <alpha-value>)',
          dark: 'rgb(var(--twc-success-dark) / <alpha-value>)',
          light: 'rgb(var(--twc-success-light) / <alpha-value>)',
          text: 'rgb(var(--twc-success-text) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--twc-warning) / <alpha-value>)',
          light: 'rgb(var(--twc-warning-light) / <alpha-value>)',
        },
        danger: 'rgb(var(--twc-danger) / <alpha-value>)',
        content: {
          DEFAULT: 'rgb(var(--twc-content) / <alpha-value>)',
          secondary: 'rgb(var(--twc-content-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--twc-content-tertiary) / <alpha-value>)',
          disabled: 'rgb(var(--twc-content-disabled) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--twc-surface) / <alpha-value>)',
          white: 'rgb(var(--twc-surface-white) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--twc-line) / <alpha-value>)',
          light: 'rgb(var(--twc-line-light) / <alpha-value>)',
          lighter: 'rgb(var(--twc-line-lighter) / <alpha-value>)',
        },
      },
      spacing: {
        ring: '6.25rem',
        'ring-inner': '5.3125rem',
      },
      fontSize: {
        countdown: ['6.25rem', { lineHeight: '1' }],
      },
      boxShadow: {
        card: '0 4px 14px rgba(20, 52, 84, 0.08)',
        'card-lg': '0 10px 24px rgba(9, 34, 58, 0.14)',
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeScaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        bounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
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
        'fade-scale-in': 'fadeScaleIn 0.45s ease-out',
        'bounce-slow': 'bounce 1s ease-in-out infinite',
        'countdown-pulse': 'countdownPulse 0.8s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        'gentle-pulse': 'gentlePulse 2s ease-in-out infinite',
      },
    },
  },
}
