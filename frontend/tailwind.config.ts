import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Color Palette - Professional Dark Theme
      colors: {
        // Primary & Accent
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB', // Primary brand color
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        secondary: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FEE2BD',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // Secondary accent color
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Status Colors
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',

        // Neutrals - Dark Theme Optimized
        surface: {
          0: '#031019', // Darkest background
          1: '#051428', // Card/elevated backgrounds
          2: '#0A2540', // Slightly elevated
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },

        // Semantic text colors for dark theme
        text: {
          primary: '#FFFFFF', // Main text
          secondary: '#A3D3E8', // Secondary text (refined from cyan)
          tertiary: '#7A9FB5', // Muted text
          muted: '#5A7A8F', // Very muted
        },

        // Border colors
        border: {
          default: '#0F3A4F',
          light: '#1A4A63',
          lighter: '#2A5A7A',
        },

        // Overlay
        overlay: 'rgba(5, 20, 40, 0.8)',
      },

      // Typography System
      fontFamily: {
        display: ['var(--font-heading)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['ui-sans-serif', 'system-ui', 'sans-serif', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto'],
      },

      fontSize: {
        // Typography scale aligned with Material Design 3
        display: ['40px', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '700' }],
        heading1: ['32px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '700' }],
        heading2: ['28px', { lineHeight: '1.3', letterSpacing: '-0.005em', fontWeight: '600' }],
        heading3: ['24px', { lineHeight: '1.33', letterSpacing: '0', fontWeight: '600' }],
        heading4: ['20px', { lineHeight: '1.4', letterSpacing: '0.0125em', fontWeight: '600' }],
        body: ['16px', { lineHeight: '1.5', letterSpacing: '0.03125em', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.57', letterSpacing: '0.0178em', fontWeight: '400' }],
        label: ['14px', { lineHeight: '1.43', letterSpacing: '0.0071em', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '1.33', letterSpacing: '0.0833em', fontWeight: '500' }],
        caption: ['12px', { lineHeight: '1.33', letterSpacing: '0.0333em', fontWeight: '400' }],
      },

      // Spacing System - 8px Grid
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },

      // Border Radius System
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        full: '24px',
      },

      // Shadow System - Elevation
      boxShadow: {
        none: 'none',
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        focus: '0 0 0 3px rgba(37, 99, 235, 0.1), 0 0 0 1px rgba(37, 99, 235, 0.5)',
      },

      // Transition System
      transitionDuration: {
        fast: '150ms',
        default: '300ms',
        slow: '500ms',
      },

      transitionTimingFunction: {
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // Animation utilities
      animation: {
        'fade-in': 'fadeIn 300ms ease-in-out',
        'slide-up': 'slideUp 300ms ease-in-out',
        'scale-in': 'scaleIn 300ms ease-in-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'skeleton-loading': 'skeletonLoading 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        skeletonLoading: {
          '0%': { backgroundColor: 'rgba(10, 37, 64, 0.5)' },
          '50%': { backgroundColor: 'rgba(10, 37, 64, 0.8)' },
          '100%': { backgroundColor: 'rgba(10, 37, 64, 0.5)' },
        },
      },

      // Backdrop filters for glassmorphism
      backdropFilter: {
        blur: 'blur(12px)',
      },

      // Z-index scale
      zIndex: {
        auto: 'auto',
        0: '0',
        10: '10',
        20: '20',
        30: '30',
        40: '40',
        50: '50',
        modal: '999',
        toast: '9999',
      },
    },
  },
  plugins: [],
};

export default config;
