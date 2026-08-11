'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Çerez bilgilendirme kutusu.
 *
 * 2026-08-11'de üç kusuru düzeltildi — üçü de gerçek yasal risk taşıyordu:
 *
 *  1. "Ablehnen" HİÇBİR ŞEY KAYDETMİYORDU, yalnız kutuyu gizliyordu. Ziyaretçi
 *     bir sonraki sayfada kutuyu yine görüyordu: yani "kabul edene kadar sor".
 *     GDPR bunu karanlık desen sayıyor. Artık ret de kaydediliyor.
 *  2. Kabul kocaman sarı düğme, ret %50 saydam küçük yazıydı. GDPR reddetmenin
 *     kabul kadar KOLAY olmasını şart koşuyor; iki düğme artık aynı boyutta.
 *  3. Metin "Wir nutzen Cookies" diyordu ama site hiç çerez kurmuyor
 *     (2026-08-11: kaynakta Analytics/Pixel yok, canlıda Set-Cookie yok,
 *     üçüncü taraf isteği yok). Kullanılmayan şey için onay istemek yanlış.
 *
 * Eski anahtar `kittelwerk-cookies` yalnız 'true' tutuyordu ve reddi
 * saklayamıyordu. Yeni anahtar iki kararı da tutuyor; eskisi okunmaya devam
 * ediyor ki daha önce kabul etmiş ziyaretçiye kutu yeniden çıkmasın.
 */
const ANAHTAR = 'kittelwerk-consent';
const ESKI_ANAHTAR = 'kittelwerk-cookies';

/** Analytics eklenirse bunu sor; false dönerken YÜKLEME. */
export function hasAnalyticsConsent() {
  try { return localStorage.getItem(ANAHTAR) === 'accepted'; } catch { return false; }
}

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const yeni = localStorage.getItem(ANAHTAR);
      if (yeni === 'accepted' || yeni === 'rejected') return;
      // Eskiden kabul etmiş ziyaretçiyi yeniden rahatsız etme.
      if (localStorage.getItem(ESKI_ANAHTAR) === 'true') {
        localStorage.setItem(ANAHTAR, 'accepted');
        return;
      }
      setIsVisible(true);
    } catch {
      // Gizli sekmede depolama hata atar: çökmek yerine soruyoruz.
      setIsVisible(true);
    }
  }, []);

  const karar = (deger) => {
    try { localStorage.setItem(ANAHTAR, deger); } catch { /* yazamadıysak sessiz geç */ }
    setIsVisible(false);
  };

  // İKİ DÜĞME AYNI SINIF. Birine "birincil" görünüm vermek kuralı çiğniyor.
  const dugme = 'flex-1 border-2 border-sun bg-transparent text-sun font-black py-2 text-xs '
    + 'uppercase transition-all hover:bg-sun hover:text-ink '
    + 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
          role="region" aria-label="Hinweis zu Cookies"
          className="fixed bottom-6 left-6 right-6 md:left-auto md:w-[400px] bg-ink text-white p-6 border-4 border-sun z-[200] shadow-brutalist-lg"
        >
          <h5 className="font-serif font-black text-xl mb-2 italic text-sun">Kekse? 🍪</h5>
          <p className="text-[10px] leading-relaxed uppercase tracking-widest opacity-80 mb-4">
            Wir speichern nur, was für die Seite nötig ist. Messungen finden nur statt,
            wenn du zustimmst.{' '}
            <a href="/datenschutz" className="underline hover:text-sun">Datenschutz</a>
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={() => karar('rejected')} className={dugme}>
              Ablehnen
            </button>
            <button type="button" onClick={() => karar('accepted')} className={dugme}>
              Einverstanden
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
