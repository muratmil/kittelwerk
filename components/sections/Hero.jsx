'use client';
import Image from 'next/image';
import { useSprache } from '@/components/i18n/SpracheProvider';

/**
 * Ana sayfa başlığı (2026-09-23'te yeniden yazıldı).
 *
 * Eskisi "Stark Reduziert! / Alles sehr günstig." diyordu: ürün sayfalarındaki
 * "Premium Alpaka-Gewebe" iddiasıyla çelişiyor ve markayı ucuzluk üzerinden
 * konumlandırıyordu. Yeni metin ekip görünümü + logo üzerine kurulu; indirim
 * ürün kartlarındaki rozete bırakıldı, çünkü dönüşümü orada yapıyor.
 *
 * Sektör sırası bilerek "Gastronomie" ile başlıyor: arama motorunda kazanılan
 * yer orası, ama cümle artık tamirhane/inşaat gibi alanları da içine alıyor.
 */
export default function Hero() {
  const { t } = useSprache();
  const h = t.hero;
  return (
    <section className="relative isolate overflow-hidden border-b-4 border-tomato bg-ink text-white">
      {/* Fotoğraf: geniş ekranda sağ yarıda, telefonda arka planda */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-team.webp"
          alt={h.bildAlt}
          fill
          priority
          sizes="100vw"
          className="hidden object-cover object-[70%_center] md:block"
        />
        <Image
          src="/images/hero-team-mobil.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center md:hidden"
        />
        {/* Metnin okunması için koyu perde — telefonda yoğun, geniş ekranda
            soldan sağa açılıyor. `md:bg-transparent` şart: renk katmanı
            kaldırılmazsa degradenin ALTINDA kalır ve fotoğrafı karartır. */}
        <div className="absolute inset-0 bg-ink/75 md:bg-transparent md:bg-gradient-to-r md:from-ink md:from-25% md:via-ink/70 md:to-ink/5" />
      </div>

      <div className="container relative mx-auto px-6 py-20 md:py-28">
        <div className="max-w-xl">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sun">
            {h.kicker}
          </span>

          <h1 className="mt-4 font-serif text-[2.4rem] font-black italic leading-none tracking-tighter sm:text-5xl lg:text-6xl">
            {h.titel1}<br />{h.titel2}
          </h1>

          <p className="mt-2 font-serif text-2xl font-black italic leading-none tracking-tighter text-tomato md:text-3xl">
            {h.unter}
          </p>

          <p className="mt-6 max-w-md text-lg font-medium leading-snug text-paper/80">
            {h.text}{' '}
            <span className="font-bold text-sun">{h.textStark}</span>
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <a
              href="#produkte"
              className="inline-block bg-tomato px-8 py-4 font-black uppercase text-white shadow-[4px_4px_0px_0px_#FAFBF7] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              {h.cta}
            </a>
            <a href="#rechner" className="text-[11px] font-black uppercase tracking-widest text-paper/70 underline underline-offset-4 hover:text-sun">
              {h.rechner}
            </a>
          </div>

          {/* Satın alma kararının üç sorusu: adet, baskı, süre */}
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-widest text-paper/60">
            <li>{h.punkte[0]}</li>
            <li className="text-sun">{h.punkte[1]}</li>
            <li>{h.punkte[2]}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
