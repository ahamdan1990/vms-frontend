// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Primary brand colors with proper dark mode support
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
          DEFAULT: '#3b82f6'
        },
        
        // Semantic colors that work in both themes
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          DEFAULT: '#10b981'
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
          DEFAULT: '#f59e0b'
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
          DEFAULT: '#ef4444'
        },
        info: {
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
          DEFAULT: '#0ea5e9'
        },
        
        // Role-specific colors
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
      
      // Layout constants
      spacing: {
        '18': '4.5rem',
        '88': '22rem',  // Sidebar width
        '72': '18rem'   // Collapsed sidebar considerations
      },
      
      // Animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-gentle': 'bounce 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite'
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
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
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
      
      // Box shadows for depth
      boxShadow: {
        'soft': '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'strong': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'intense': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-strong': '0 0 30px rgba(59, 130, 246, 0.25)'
      },
      
      // Typography improvements
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      
      // Border radius consistency
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem'
      }
    }
  },
  plugins: [
    // Form styles plugin
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    
    // Typography plugin
    require('@tailwindcss/typography'),
    
    // Custom components plugin
    function({ addComponents, theme }) {
      addComponents({
        // Enhanced button styles
        '.btn': {
          '@apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.btn-primary': {
          '@apply btn bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600': {},
        },
        '.btn-secondary': {
          '@apply btn bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600': {},
        },
        '.btn-outline': {
          '@apply btn border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800': {},
        },
        '.btn-ghost': {
          '@apply btn text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800': {},
        },
        
        // Enhanced card styles
        '.card': {
          '@apply bg-white rounded-xl shadow-soft border border-gray-200 dark:bg-gray-800 dark:border-gray-700': {},
        },
        '.card-elevated': {
          '@apply card shadow-medium hover:shadow-strong transition-shadow duration-200': {},
        },
        
        // Form input styles
        '.form-input': {
          '@apply block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500': {},
        },
        '.form-input-error': {
          '@apply form-input border-error-500 focus:border-error-500 focus:ring-error-500': {},
        },
        
        // Navigation styles
        '.nav-item': {
          '@apply flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200': {},
        },
        '.nav-item-active': {
          '@apply nav-item bg-primary-100 text-primary-900 border-r-2 border-primary-600 dark:bg-primary-900/20 dark:text-primary-100': {},
        },
        '.nav-item-inactive': {
          '@apply nav-item text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white': {},
        },
        
        // Badge styles
        '.badge': {
          '@apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium': {},
        },
        '.badge-primary': {
          '@apply badge bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200': {},
        },
        '.badge-success': {
          '@apply badge bg-success-100 text-success-800 dark:bg-success-900/50 dark:text-success-200': {},
        },
        '.badge-warning': {
          '@apply badge bg-warning-100 text-warning-800 dark:bg-warning-900/50 dark:text-warning-200': {},
        },
        '.badge-error': {
          '@apply badge bg-error-100 text-error-800 dark:bg-error-900/50 dark:text-error-200': {},
        },
        '.badge-gray': {
          '@apply badge bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': {},
        },
        
        // Role-specific badges
        '.badge-role-staff': {
          '@apply badge bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200': {},
        },
        '.badge-role-operator': {
          '@apply badge bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200': {},
        },
        '.badge-role-administrator': {
          '@apply badge bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200': {},
        }
      });
    }
  ]
};