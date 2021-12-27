const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')

module.exports = {
  jit: false,
  purge: ['./public/index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      minHeight: {
        '480px': '480px'
      },
      maxHeight: {
        '385px': '385px',
        '90vh': '90vh'
      },
      maxWidth: {
        'lg2': '34rem',
        'lg3': '48rem'
      },
      colors: {
        gray: {
          ...colors.neutral,
          250: '#333333',
          350: '#a5a5a5',
          400: '#6b717f',
          450: '#9FA3B5',
          550: '#a1a5b0',
          575: '#1B1C20',
          650: '#595959',
          750: '#262626'
        },
        cgray: {
          500: '#212224'
        },
        purple: {
          800: '#752eeb'
        }
      },
      gridTemplateColumns: {
        icon: '2fr 40px 2fr',
        header: '1fr 4fr 1fr',
        pool: '2fr auto 2fr auto 2fr',
        bridge: '20px auto 20px'
      },
      fontFamily: {
        lato: ['Lato', 'Helvetica Neue','Arial','Helvetica', 'sans-serif'],
        circular: ['Circular Std Book', '-apple-system', 'system-ui', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      }
    },
  },
  variants: {
    extend: {
      margin: ['last'],
      backgroundColor: ['active'],
      opacity: ['disabled'],
      cursor: ['disabled']
      // display: ['group-focus']
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* Firefox */
          'scrollbar-width': 'none',
    
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    })
  ],
}
