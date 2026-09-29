import { pfad } from '@/lib/i18n/config';

// Yasal metinlerdeki {email} {odr} {agb} {vercel} yer tutucularını bağlantıya
// çevirir; metnin geri kalanı sözlükte (lib/i18n/<dil>/recht.js).
const LINK = 'underline hover:text-tomato transition-colors';

export default function RechtText({ text, lang, agbLink = '' }) {
  const teile = String(text).split(/(\{\w+\})/);
  return teile.map((t, i) => {
    switch (t) {
      case '{email}':
        return <a key={i} href="mailto:info@kittelwerk.de" className={LINK}>info@kittelwerk.de</a>;
      case '{odr}':
        return (
          <a key={i} href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className={LINK}>
            https://ec.europa.eu/consumers/odr
          </a>
        );
      case '{agb}':
        return <a key={i} href={pfad(lang, '/agb')} className={LINK}>{agbLink}</a>;
      case '{vercel}':
        return <a key={i} href="https://vercel.com/legal/privacy-policy" target="_blank" className="text-tomato underline">Vercel Privacy Policy</a>;
      default:
        return t;
    }
  });
}

/** Almanca dışındaki dillerde metnin başındaki "bağlayıcı olan Almanca" notu. */
export function Massgeblich({ text }) {
  if (!text) return null;
  return (
    <p className="mb-10 border-2 border-ink bg-sun/40 px-4 py-3 text-xs font-bold leading-relaxed">{text}</p>
  );
}
