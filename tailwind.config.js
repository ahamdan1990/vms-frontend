/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
          DEFAULT: 'var(--primary-500)'
        },
        
        // Semantic colors - FIXED: Added ALL missing color values
        success: {
          50: 'var(--success-50)',
          100: '#d1fae5',
          200: 'var(--success-200)',
          400: '#34d399',
          500: 'var(--success-500)',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          DEFAULT: 'var(--success-500)'
        },
        warning: {
          50: 'var(--warning-50)',
          100: '#fef3c7',
          200: 'var(--warning-200)',
          400: '#fbbf24',
          500: 'var(--warning-500)',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          DEFAULT: 'var(--warning-500)'
        },
        error: {
          50: 'var(--error-50)',
          100: '#fee2e2',
          200: 'var(--error-200)',
          400: '#f87171',
          500: 'var(--error-500)',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          DEFAULT: 'var(--error-500)'
        },
        info: {
          50: 'var(--info-50)',
          100: '#e0f2fe',
          200: 'var(--info-200)',
          400: '#22d3ee',
          500: 'var(--info-500)',
          600: '#0891b2',
          700: '#0e7490',
          DEFAULT: 'var(--info-500)'
        },
        info: {
          50: 'var(--info-50)',
          100: 'var(--info-100)',
          200: 'var(--info-200)',
          500: 'var(--info-500)',
          600: '#0891b2', // ✅ Added for consistency
          700: '#0e7490',
          DEFAULT: 'var(--info-500)'
        },
        
        // Extended gray scale
        gray: {
          50: 'var(--gray-50)',
          100: 'var(--gray-100)',
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          400: 'var(--gray-400)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          700: 'var(--gray-700)',
          800: 'var(--gray-800)',
          900: 'var(--gray-900)'
        },
        
        // Role-specific colors for user badges
        role: {
          staff: '#10b981',      // Green
          operator: '#3b82f6',   // Blue  
          admin: '#ef4444'       // Red
        },
        
        // Status colors
        status: {
          active: '#10b981',
          inactive: '#6b7280',
          pending: '#f59e0b',
          approved: '#10b981',
          rejected: '#ef4444',
          cancelled: '#6b7280',
          expired: '#f59e0b',
          completed: '#06b6d4',
          draft: '#6b7280',
          locked: '#ef4444'
        }
      },
      
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'base': 'var(--font-size-base)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)'
      },
      
      spacing: {
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '5': 'var(--spacing-5)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
        '10': 'var(--spacing-10)',
        '12': 'var(--spacing-12)'
      },
      
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'DEFAULT': 'var(--radius)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)'
      },
      
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)'
      },
      
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms'
      },
      
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-gentle': 'bounce 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite'
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' }
        }
      },
      
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px'
      },
      
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px'
      },
      
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080'
      },
      
      maxWidth: {
        'screen-xs': '475px',
        'screen-sm': '640px',
        'screen-md': '768px',
        'screen-lg': '1024px',
        'screen-xl': '1280px',
        'screen-2xl': '1536px'
      }
    }
  },
  plugins: [
    // Form styles plugin
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    
    // Typography plugin for rich text content
    require('@tailwindcss/typography'),
    
    // Aspect ratio plugin
    require('@tailwindcss/aspect-ratio'),
    
    // Custom utilities plugin
    function({ addUtilities, addComponents, theme }) {
      // Custom utilities
      addUtilities({
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.text-pretty': {
          'text-wrap': 'pretty',
        },
        
        // Loading state utilities
        '.loading': {
          'opacity': '0.6',
          'pointer-events': 'none',
          'position': 'relative'
        },
        
        '.loading::after': {
          'content': '""',
          'position': 'absolute',
          'top': '50%',
          'left': '50%',
          'width': '20px',
          'height': '20px',
          'margin': '-10px 0 0 -10px',
          'border': '2px solid var(--gray-200)',
          'border-top': '2px solid var(--primary-500)',
          'border-radius': '50%',
          'animation': 'spin 1s linear infinite'
        },
        
        // Shimmer loading effect
        '.shimmer': {
          'background': 'linear-gradient(90deg, var(--gray-100) 25%, var(--gray-50) 50%, var(--gray-100) 75%)',
          'background-size': '200px 100%',
          'animation': 'shimmer 2s linear infinite'
        },
        
        // Glassmorphism utilities
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)'
        },
        
        '.glass-dark': {
          'background': 'rgba(0, 0, 0, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)'
        }
      });
      
      // Custom components
      addComponents({
        // Button base styles
        '.btn': {
          'display': 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'border-radius': theme('borderRadius.md'),
          'font-weight': '500',
          'transition': 'all 150ms ease-in-out',
          'focus': {
            'outline': 'none',
            'ring': '2px',
            'ring-color': theme('colors.primary.500'),
            'ring-offset': '2px'
          },
          'disabled': {
            'opacity': '0.6',
            'pointer-events': 'none'
          }
        },
        
        '.btn-sm': {
          'padding': `${theme('spacing.2')} ${theme('spacing.3')}`,
          'font-size': theme('fontSize.sm')
        },
        
        '.btn-md': {
          'padding': `${theme('spacing.2')} ${theme('spacing.4')}`,
          'font-size': theme('fontSize.base')
        },
        
        '.btn-lg': {
          'padding': `${theme('spacing.3')} ${theme('spacing.6')}`,
          'font-size': theme('fontSize.lg')
        },
        
        // Card component
        '.card': {
          'background-color': 'white',
          'border-radius': theme('borderRadius.lg'),
          'box-shadow': theme('boxShadow.md'),
          'padding': theme('spacing.6'),
          'border': '1px solid var(--gray-200)'
        },
        
        // Input base styles
        '.input': {
          'width': '100%',
          'padding': `${theme('spacing.2')} ${theme('spacing.3')}`,
          'border': '1px solid var(--gray-300)',
          'border-radius': theme('borderRadius.md'),
          'font-size': theme('fontSize.base'),
          'transition': 'border-color 150ms ease-in-out, box-shadow 150ms ease-in-out',
          'focus': {
            'outline': 'none',
            'border-color': 'var(--primary-500)',
            'box-shadow': '0 0 0 3px rgb(59 130 246 / 0.1)'
          },
          'invalid': {
            'border-color': 'var(--error-500)'
          }
        }
      });
    }
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  future: {
    hoverOnlyWhenSupported: true, // Improve mobile experience
  }
};