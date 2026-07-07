/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Exact palette from the brand charter ("COULEURS" sheet):
      //   gamme orange  #FF8533 #FF6A00 #FFB847 #FFA472 #FFD599
      //   gamme bleue   #163B7A #2B6BFF #5F8EFF #8CB7FF #D0E8FF
      //   neutres       #0B1324 #475569 #E2E8F0 #F5F6F8 #FFFFFF
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
        },
        secondary: {
          DEFAULT: '#2B6BFF',
          50: '#D0E8FF',
          100: '#8CB7FF',
          200: '#5F8EFF',
          300: '#2B6BFF',
          400: '#163B7A',
        },
        ink: {
          900: '#0B1324',
          700: '#475569',
          200: '#E2E8F0',
          100: '#F5F6F8',
          50: '#FAF7F4',
        },
      },
      fontFamily: {
        heading: ['Anton', 'sans-serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-orange': 'linear-gradient(90deg, #FF6A00, #FFB347)',
        'gradient-blue': 'linear-gradient(90deg, #2B6BFF, #6FA9FF)',
      },
    },
  },
  plugins: [],
};
