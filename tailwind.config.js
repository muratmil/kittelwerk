module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        paper: '#FAFBF7',
        tomato: '#E63946',
        sun: '#F5B800',
        olive: '#3D6B4F',
      },
      boxShadow: {
        'brutalist': '4px 4px 0px 0px #111111',
        'brutalist-lg': '8px 8px 0px 0px #111111',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    }
  },
  plugins: [],
}
