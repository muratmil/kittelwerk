import { bildUrl } from '@/lib/bildUrl';
import { pfad } from '@/lib/i18n/config';

// Referenz galerisi (2026-09-29).
//
// Müşteri fotoğrafları CCH'den (gastrocollect → Marken → Kittelwerk →
// Referenzen) yönetiliyor; satırlar `marken_referenzen` tablosunda, anon
// anahtarıyla yalnız `sichtbar` olanlar okunabiliyor (RLS). Sayfalar ISR ile
// tazelendiği için yükleme en geç bir dakikada vitrinde — kod dağıtımı yok.
//
// Çeviri: `i18n = { en: { titel, beschreibung }, tr: {…} }`. Eksikse Almanca.
//
// Sütunlar tek tek yazılı (catalog.js'teki kural): `select('*')` kullanma.
const SUTUNLAR = 'id, src, titel, beschreibung, produkt_id, i18n';

export async function loadReferenzen(client, { siteId = 'kittelwerk', limit = null, lang = 'de' } = {}) {
  let sorgu = client
    .from('marken_referenzen')
    .select(SUTUNLAR)
    .eq('site_id', siteId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (limit) sorgu = sorgu.limit(limit);

  const [{ data, error }, { data: produkte }] = await Promise.all([
    sorgu,
    client.from('products').select('id, meta').eq('site_id', siteId).eq('active', true),
  ]);
  if (error) {
    // Tablo erişilemezse sayfa çökmesin, bölüm boş görünsün.
    console.error('[referenzen]', error.message);
    return [];
  }

  // Ürün bağlantısı yalnız satıştaki ürüne; adres ürünün konuşan adresi.
  const slugVon = new Map((produkte ?? []).map((p) => [p.id, p.meta?.slug ?? p.id]));
  return (data ?? [])
    .map((r) => {
      const ue = r.i18n?.[lang] ?? {};
      return {
        id: r.id,
        src: bildUrl(r.src),
        titel: ue.titel || r.titel || '',
        beschreibung: ue.beschreibung || r.beschreibung || '',
        produktHref: r.produkt_id && slugVon.has(r.produkt_id)
          ? pfad(lang, `/produkte/${slugVon.get(r.produkt_id)}`)
          : null,
      };
    })
    .filter((r) => r.src);
}
