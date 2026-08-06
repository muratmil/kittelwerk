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

        // --- CCH teması ---------------------------------------------------
        // Portal (Central Communication Hub) dükkânın brutalist kimliğinden
        // ayrıldı: naneli yeşil vurgu, açık gri zemin, ince tipografi.
        // Dükkânın renkleri yukarıda duruyor, ikisi karışmıyor.
        cch: {
          mint:   '#6FC3B4',   // ana vurgu
          dark:   '#4EA697',   // vurgunun koyusu (hover, aktif)
          soft:   '#E7F4F1',   // vurgunun çok açığı (seçili satır zemini)
          slate:  '#3B4245',   // koyu çubuklar
          ash:    '#F2F4F5',   // sayfa zemini
          line:   '#E2E7E8',   // ince ayraçlar
          muted:  '#8A9396',   // ikincil yazı
          danger: '#E2725B',   // uyarı — brutalist kırmızıdan daha yumuşak
        },
      },
      boxShadow: {
        'brutalist': '4px 4px 0px 0px #111111',
        'brutalist-lg': '8px 8px 0px 0px #111111',
        // CCH: gölge neredeyse görünmez, kartı zeminden ayırmaya yetecek kadar
        'cch':    '0 1px 3px rgba(16,24,40,.06)',
        'cch-lg': '0 6px 20px rgba(16,24,40,.08)',
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
