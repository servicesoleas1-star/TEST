/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Palette de marque (site vitrine) fusionnée avec l'échelle complète
      // 50-900 nécessaire aux pages back-office/organisateur (import-vote).
      // Les teintes du site vitrine (marquées ci-dessous) restent inchangées ;
      // les teintes ajoutées ne servent qu'aux pages tableau de bord.
      colors: {
        primary: {
          DEFAULT: '#FF6A00',
          50: '#FFF3EA',
          100: '#FFD599',
          200: '#FFA472',
          300: '#FFB847',
          400: '#FF8533',
          500: '#FF6A00',
          600: '#E85F00',
          700: '#C24B00',
          800: '#9C3C00',
          900: '#7A2F00',
        },
        secondary: {
          DEFAULT: '#2B6BFF',
          50: '#D0E8FF',
          100: '#8CB7FF',
          200: '#5F8EFF',
          300: '#2B6BFF',
          400: '#163B7A',
          500: '#2B6BFF',
          600: '#1B52DB',
          700: '#143FAD',
          800: '#0E2E80',
          900: '#0A2260',
        },
        ink: {
          900: '#0B1324',
          800: '#262838',
          700: '#475569',
          600: '#52546A',
          500: '#6B6D80',
          400: '#8D8FA0',
          300: '#B8BAC6',
          200: '#E2E8F0',
          100: '#F5F6F8',
          50: '#FAF7F4',
        },
        // Accent "premium" réservé à la section Scrutin & Vote (podium,
        // médailles, badges de statut, micro-détails) — jamais utilisé dans
        // le reste du site vitrine pour ne pas diluer la charte graphique.
        gold: {
          DEFAULT: '#F5B93D',
          50: '#FEF8E9',
          100: '#FBE9BB',
          200: '#F9DC94',
          300: '#F7CD69',
          400: '#F5C050',
          500: '#F5B93D',
          600: '#D89A1E',
          700: '#A8760F',
        },
      },
      fontFamily: {
        heading: ['Anton', 'sans-serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-orange': 'linear-gradient(90deg, #FF6A00, #FFB347)',
        'gradient-blue': 'linear-gradient(90deg, #2B6BFF, #6FA9FF)',
        'gradient-gold': 'linear-gradient(135deg, #F5C050, #D89A1E)',
        // Fond "premium sombre" commun à toutes les pages de la section
        // Scrutin & Vote — légèrement plus profond que le ink-900 uni, avec
        // un halo radial discret pour donner du relief sans surcharger.
        'poll-dark': 'radial-gradient(120% 120% at 50% -10%, #1B2340 0%, #0B1324 55%, #060A16 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
