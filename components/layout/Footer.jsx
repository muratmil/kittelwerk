'use client';
import { useSprache } from '@/components/i18n/SpracheProvider';

export default function Footer() {
  const { t, p } = useSprache();
  return (
    <footer className="bg-ink text-white py-16 border-t-4 border-sun">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-2">
          <h3 className="font-serif font-black text-4xl mb-4 italic">Kittel<span className="text-tomato">werk</span>.</h3>
          <p className="text-paper/50 text-[10px] max-w-xs uppercase tracking-widest leading-loose">
            {t.footer.claim1}<br />
            {t.footer.claim2}
          </p>
        </div>
        <div className="space-y-4 text-xs">
          <h4 className="font-bold text-sun uppercase tracking-widest">{t.footer.rechtliches}</h4>
          <ul className="space-y-2 font-medium opacity-80 uppercase tracking-tighter">
            <li><a href={p('/impressum')} className="hover:text-tomato transition-colors">{t.footer.impressum}</a></li>
            <li><a href={p('/datenschutz')} className="hover:text-tomato transition-colors">{t.footer.datenschutz}</a></li>
            <li><a href={p('/agb')} className="hover:text-tomato transition-colors">{t.footer.agb}</a></li>
            <li><a href={p('/lieferbedingungen')} className="hover:text-tomato transition-colors">{t.footer.lieferbedingungen}</a></li>
          </ul>
        </div>
        <div className="space-y-4 text-xs">
          <h4 className="font-bold text-sun uppercase tracking-widest">{t.footer.navigation}</h4>
          <ul className="space-y-2 font-medium opacity-80 uppercase tracking-tighter">
            <li><a href={p('/produkte')} className="hover:text-tomato transition-colors">{t.nav.produkte}</a></li>
            <li><a href={p('/druckinfo')} className="hover:text-tomato transition-colors">{t.nav.druck}</a></li>
            <li><a href={p('/#rechner')} className="hover:text-tomato transition-colors">{t.nav.rechner}</a></li>
            <li><a href={p('/ueber-uns')} className="hover:text-tomato transition-colors">{t.nav.ueberUns}</a></li>
            <li><a href={p('/kontakt')} className="hover:text-tomato transition-colors">{t.nav.kontakt}</a></li>
            <li>
              {/* Bayi kaydı CCH'de (gastrocollect.de). Doğrudan oraya
                  bağlanıyor; eski /reseller/register adresi de yönlendirmede
                  duruyor ama iç bağlantı boşuna bir sıçrama yapmasın. */}
              <a href="https://www.gastrocollect.de/haendler/registrierung"
                className="inline-block mt-2 border border-sun text-sun px-3 py-1.5 hover:bg-sun hover:text-ink transition-all font-black tracking-widest">
                {t.footer.haendler}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-6 border-t border-white/15 pt-6 flex flex-wrap justify-between gap-4 text-[10px] opacity-50">
        <span>info@kittelwerk.de</span>
      </div>
    </footer>
  );
}
