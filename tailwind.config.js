/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false,
    container: false,
  },
  theme: {
    extend: {
      fontFamily: {
        heading: ['Lora', 'Georgia', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'serif'],
        body: ['Poppins', 'Arial', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
      },
      colors: {
        // shadcn/ui token 映射
        card: {
          DEFAULT: 'rgb(var(--twc-surface-white) / <alpha-value>)',
          foreground: 'rgb(var(--twc-content) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--twc-surface) / <alpha-value>)',
          foreground: 'rgb(var(--twc-content-secondary) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--twc-danger) / <alpha-value>)',
        },
        // 项目语义色彩
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
        info: {
          DEFAULT: 'rgb(var(--twc-info) / <alpha-value>)',
          dark: 'rgb(var(--twc-info-dark) / <alpha-value>)',
          light: 'rgb(var(--twc-info-light) / <alpha-value>)',
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
        section: '3rem',
        'section-lg': '4rem',
        block: '2rem',
        'block-sm': '1.5rem',
        'page-x': '1.5rem',
        'page-gap': '1.25rem',
        'section-gap': '3.5rem',
        'bottom-safe': '7rem',
      },
      fontSize: {
        countdown: ['6.25rem', { lineHeight: '1' }],
        'display-xl': ['2.75rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'display-md': ['1.75rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-sm': ['1.375rem', { lineHeight: '1.2', letterSpacing: '-0.005em' }],
        'paragraph-lg': ['1.125rem', { lineHeight: '1.6' }],
        'paragraph-md': ['1rem', { lineHeight: '1.6' }],
        'paragraph-sm': ['0.875rem', { lineHeight: '1.55' }],
        'label-md': ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.06em' }],
        'label-sm': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.08em' }],
        'label-xs': ['0.6875rem', { lineHeight: '1.35', letterSpacing: '0.1em' }],
      },
      borderRadius: {
        anthropic: '0.5rem',
        'anthropic-sm': '0.375rem',
        'anthropic-lg': '0.75rem',
      },
      boxShadow: {
        card: '0px 0px 0px 1px rgba(240, 238, 230, 1)',
        'card-hover': '0px 0px 0px 1px rgba(209, 207, 197, 1)',
        'card-lg': 'rgba(0, 0, 0, 0.05) 0px 4px 24px',
        nav: '0 -1px 0 rgba(240, 238, 230, 1)',
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeScaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        bounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
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
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        subtleScale: {
          from: { opacity: '0', transform: 'scale(0.98)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        arrowBounce: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(6px)' },
        },
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-scale-in': 'fadeScaleIn 0.45s ease-out',
        'bounce-slow': 'bounce 1s ease-in-out infinite',
        'countdown-pulse': 'countdownPulse 0.8s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        'gentle-pulse': 'gentlePulse 2s ease-in-out infinite',
        ripple: 'ripple 3s ease-out infinite',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-up-delay-1': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
        'fade-up-delay-2': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
        'fade-up-delay-3': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
        'fade-in': 'fadeIn 0.4s ease-out both',
        'subtle-scale': 'subtleScale 0.5s ease-out both',
      },
    },
  },
}
