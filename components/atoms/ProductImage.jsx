import Image from 'next/image';

/**
 * Ürün kapak görseli (2026-09-22'de `next/image`'a geçti).
 *
 * Eskiden düz `<img>` idi: telefon 1600 pikselik dosyayı indirip 400 piksele
 * sıkıştırıyordu ve görsel yüklenene kadar sayfa zıplıyordu. Artık Next
 * boyutu ve biçimi (AVIF/WebP) isteğe göre üretiyor; `sizes` hangi ekranda
 * hangi genişliğin gerektiğini söylüyor.
 *
 * `mix-blend-multiply` duruyor: ürün çekimleri beyaz zeminli, kâğıt rengi
 * arka planda böyle kesiliyor.
 *
 * FARE ÜSTÜNE GELİNCE ARKA YÜZ (2026-09-22 düzeltmesi): ürün kartında bu
 * kutunun ÜSTÜNDE ("Details anzeigen") saydam bir katman var ve o katman bu
 * kutunun KARDEŞİ. CSS'te `:hover` yalnız imlecin altındaki öğeye ve onun
 * ATALARINA işler — dolayısıyla kartta `group-hover` hiç tetiklenmiyordu,
 * arka yüz görseli aylardır listede görünmüyordu. Çözüm: kartın bağlantısı
 * `group/img` adını taşıdığı için her iki grup adını da dinliyoruz.
 */
export default function ProductImage({ src, backSrc, alt, priority = false }) {
  if (!src) return <div className="aspect-square w-full border-2 border-ink bg-paper" />;

  return (
    <div className="relative aspect-square w-full overflow-hidden border-2 border-ink bg-paper group">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        className={`object-contain mix-blend-multiply scale-90 transition-all duration-500 ${backSrc
          ? 'group-hover:opacity-0 group-hover:scale-95 group-hover/img:opacity-0 group-hover/img:scale-95'
          : 'group-hover:scale-95 group-hover/img:scale-95'}`}
      />
      {backSrc && (
        <Image
          src={backSrc}
          alt={`${alt} Rückseite`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain mix-blend-multiply scale-95 opacity-0 group-hover:opacity-100 group-hover/img:opacity-100 transition-all duration-500"
        />
      )}
    </div>
  );
}
