
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            marian: { 50: '#eff6ff', 100: '#dbeaff', 200: '#bfdbfe', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' },
            sacred: { 700: '#9f1239', 800: '#881337', 900: '#4c0519' },
            gold: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' }
          },
          fontFamily: {
            cinzel: ['Cinzel', 'serif'],
            garamond: ['EB Garamond', 'serif'],
            sans: ['Inter', 'sans-serif'],
          },
          animation: {
            'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            'parallax-bg': 'parallaxBg 30s ease-in-out infinite alternate',
            'shine': 'shine 5s linear infinite',
            'float': 'float 3s ease-in-out infinite',
          },
          keyframes: {
            fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
            slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
            parallaxBg: { '0%': { backgroundPosition: '0% 0%' }, '100%': { backgroundPosition: '100% 100%' } },
            shine: { '0%': { backgroundPosition: '200% center' }, '100%': { backgroundPosition: '-200% center' } },
            float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } }
          }
        }
      }
    }
