/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Green - Main brand color
        primary: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#2E7D32',
          600: '#2E7D32',
          700: '#1B5E20',
          800: '#1B5E20',
          900: '#0D3818',
        },
        
        // Secondary Blue
        secondary: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#1976D2',
          600: '#1E88E5',
          700: '#1565C0',
          800: '#1565C0',
          900: '#0D47A1',
        },
        
        // Success States
        success: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          500: '#43A047',
          600: '#00AA00',
          700: '#00AA00',
        },
        
        // Warning States
        warning: {
          50: '#FFF3E0',
          100: '#FFE0B2',
          500: '#F9A825',
          600: '#FB8C00',
          700: '#E65100',
        },
        
        // Danger/Error States
        danger: {
          50: '#FFEBEE',
          100: '#FFCDD2',
          500: '#D32F2F',
          600: '#D32F2F',
          700: '#B71C1C',
        },

        // Status Colors
        status: {
          online: '#43A047',
          offline: '#D32F2F',
          warning: '#F9A825',
          idle: '#90A4AE',
        },

        // Background
        background: '#F5F7FA',
      },

      spacing: {
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px',
      },

      borderRadius: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '20px',
        full: '9999px',
      },

      boxShadow: {
        xs: '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        sm: '0px 4px 8px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.08)',
        md: '0px 8px 16px rgba(0, 0, 0, 0.14), 0px 4px 8px rgba(0, 0, 0, 0.10)',
        lg: '0px 12px 24px rgba(0, 0, 0, 0.16), 0px 8px 16px rgba(0, 0, 0, 0.12)',
        xl: '0px 16px 32px rgba(0, 0, 0, 0.18), 0px 12px 24px rgba(0, 0, 0, 0.14)',
      },

      typography: {
        display: {
          large: {
            fontSize: '57px',
            fontWeight: '400',
            lineHeight: '64px',
            letterSpacing: '-0.5px',
          },
        },
        headline: {
          large: {
            fontSize: '32px',
            fontWeight: '400',
            lineHeight: '40px',
          },
          medium: {
            fontSize: '28px',
            fontWeight: '500',
            lineHeight: '36px',
          },
          small: {
            fontSize: '24px',
            fontWeight: '500',
            lineHeight: '32px',
          },
        },
        title: {
          large: {
            fontSize: '22px',
            fontWeight: '500',
            lineHeight: '28px',
          },
          medium: {
            fontSize: '18px',
            fontWeight: '600',
            lineHeight: '24px',
            letterSpacing: '0.15px',
          },
          small: {
            fontSize: '14px',
            fontWeight: '600',
            lineHeight: '20px',
            letterSpacing: '0.1px',
          },
        },
      },

      fontFamily: {
        primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        mono: 'Fira Code, Courier New, monospace',
      },

      screens: {
        mobile: '390px',
        tablet: '768px',
        laptop: '1440px',
        desktop: '1920px',
      },

      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}

