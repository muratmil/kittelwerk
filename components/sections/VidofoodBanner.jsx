'use client';
import { useSprache } from '@/components/i18n/SpracheProvider';

export default function VidofoodBanner() {
  const { t } = useSprache();
  return (
    <section className="bg-paper border-t-4 border-ink">
      <div className="container mx-auto px-6 py-6">
        <a
          href="https://www.vidofood.de"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row items-center justify-center gap-6 border-2 border-ink bg-white px-8 py-5 shadow-brutalist hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          <img src="/vidofood_logo.webp" alt="VidoFood" className="h-20 w-auto flex-shrink-0" />
          <div className="text-center sm:text-left">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] opacity-40">{t.vidofood.kicker}</span>
            <p className="font-black text-base uppercase tracking-tight leading-none">{t.vidofood.titel}</p>
            <p className="text-[12px] opacity-50 mt-1">{t.vidofood.text}</p>
          </div>
          <span className="text-[11px] font-black uppercase border-2 border-ink px-5 py-3 bg-[#5B21F5] text-white flex-shrink-0 sm:ml-auto">
            {t.vidofood.button}
          </span>
        </a>
      </div>
    </section>
  );
}
