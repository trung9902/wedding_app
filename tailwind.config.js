/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Royal Luxury Palette Spec
        royal: {
          gold: {
            50: '#FAF5E8',
            100: '#F4E7CE',
            200: '#ECC880',
            300: '#DEB05B',
            400: '#D4AF37',
            500: '#C5A059',
            600: '#AA7A2B',
            700: '#8C621E',
            800: '#644413',
            900: '#3D2808',
          },
          bordeaux: {
            50: '#FBF0F1',
            100: '#F6D9DC',
            200: '#EDB0B8',
            300: '#DF7B8B',
            400: '#B83A4B',
            500: '#852233',
            600: '#6B1724',
            700: '#5E121E',
            800: '#420B13',
            900: '#2A050A',
          },
          ivory: {
            light: '#FDFBF7',
            base: '#FAF7F2',
            dark: '#F4EBE1',
            silk: '#EAD8C7',
          },
          charcoal: {
            heading: '#2C2018',
            body: '#4A3B32',
            muted: '#736154',
          },
        },
        // Backwards compatibility with standard tokens
        gold: {
          50: '#FAF5E8',
          100: '#F4E7CE',
          200: '#ECC880',
          300: '#DEB05B',
          400: '#D4AF37',
          500: '#C5A059',
          600: '#AA7A2B',
          700: '#8C621E',
          800: '#644413',
          900: '#3D2808',
        },
        rose: {
          50: '#FBF0F1',
          100: '#F6D9DC',
          200: '#EDB0B8',
          300: '#DF7B8B',
          400: '#B83A4B',
          500: '#852233',
          600: '#6B1724',
          700: '#5E121E',
          800: '#420B13',
          900: '#2A050A',
        }
      },
      fontFamily: {
        cursive: ['"Great Vibes"', 'cursive'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Montserrat"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spinSlow 14s linear infinite',
        'pulse-glow': 'pulseGlow 2.8s ease-in-out infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'shimmer': 'goldShimmer 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
