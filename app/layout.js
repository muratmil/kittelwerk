import './globals.css';
import { Fraunces, DM_Sans } from 'next/font/google';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['900'], style: ['italic'], variable: '--font-serif' });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-sans' });

export const metadata = {
  title: 'Kittelwerk | Stark Reduziert — Neukundenangebot für Gastro-Profis',
  description: 'Hochwertige Gastro-Textilien zu unschlagbaren Preisen. Neukundenangebot für begrenzte Zeit — inkl. kostenlosem Logo-Druck. Direkt vom Hersteller.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className="scroll-smooth">
      <body className={`${fraunces.variable} ${dmSans.variable} font-sans bg-paper text-ink selection:bg-sun selection:text-ink`}>
        {children}
      </body>
    </html>
  );
}
