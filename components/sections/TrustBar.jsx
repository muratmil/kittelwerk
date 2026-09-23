/**
 * Hero'nun altındaki güven şeridi (2026-09-23'te yeniden yazıldı).
 *
 * Eskisi ürün künyesi sayıyordu: "24/1 Supreme Baumwolle", "3 Farben",
 * "10+ Stück Mindestmenge", "ab 9,90€ Versandkosten". İkisi yanlıştı
 * (kumaş yalnız tişörtün özelliği, renk sayısı artık ürüne göre değişiyor),
 * ikisi de engeli öne çıkarıyordu (minimum adet, kargo ÜCRETİ).
 *
 * Yeni şerit müşterinin sorduğu şeyleri, kazanç tarafından yazıyor:
 * kaç adetten, baskı dahil mi, ne zaman gelir, kargo ne zaman bedava,
 * kimden alıyorum, sonradan ekleyebilir miyim.
 *
 * Rakamlar gerçek: minimum 10 adet (ürünler birleştirilebilir),
 * kargo 300 €'dan sonra ücretsiz (`store/cartStore.js`), teslim 1–4 hafta
 * (ürüne göre), baskı ön + arka ücretsiz.
 */
export default function TrustBar() {
  const items = [
    { num: 'AB 10', lbl: 'Stück · auch gemischt' },
    { num: 'GRATIS', lbl: 'Logo-Druck vorne & hinten' },
    { num: '1–4', lbl: 'Wochen Lieferzeit' },
    { num: 'AB 300€', lbl: 'versandkostenfrei' },
    { num: 'DIREKT', lbl: 'ab Werk, ohne Zwischenhandel' },
    { num: 'JEDERZEIT', lbl: 'nachbestellbar' },
  ];
  return (
    <div className="bg-ink text-white py-5 border-b-4 border-sun">
      <div className="container mx-auto px-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
        {items.map((item) => (
          <div key={item.lbl}>
            <div className="font-serif font-black text-2xl text-sun leading-none">{item.num}</div>
            <div className="text-[9px] uppercase tracking-widest mt-1 opacity-70">{item.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
