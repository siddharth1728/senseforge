/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#09080D",
        burgundy: {
          DEFAULT: "#35101D",
          dark: "#200911",
          deep: "#2B0B17",
          light: "#4A1828",
        },
        royalwine: {
          DEFAULT: "#55182B",
          glow: "#6D2038",
        },
        gold: {
          champagne: "#D9B66F",
          warm: "#F3D99A",
          bright: "#FFDF95",
          deep: "#B38C43",
        },
        ivory: {
          DEFAULT: "#FFF5E6",
          parchment: "#F8EBD7",
          soft: "#FFFBF2",
        },
        rose: {
          muted: "#B97883",
          petal: "#D48B97",
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive'],
        handwriting: ['"Caveat"', 'cursive'],
        royal: ['"Cinzel"', 'serif'],
      },
      animation: {
        'flame-flicker': 'flame 2.2s infinite ease-in-out',
        'flame-glow': 'glow 3s infinite ease-in-out',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        flame: {
          '0%, 100%': { transform: 'scale(1) rotate(-1deg)', opacity: '0.96' },
          '25%': { transform: 'scale(1.08, 1.15) rotate(1.5deg)', opacity: '1' },
          '50%': { transform: 'scale(0.96, 0.98) rotate(-0.5deg)', opacity: '0.92' },
          '75%': { transform: 'scale(1.04, 1.08) rotate(1deg)', opacity: '0.98' },
        },
        glow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
