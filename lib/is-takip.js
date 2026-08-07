import 'server-only';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * İş takip verisi — Murat'ın reklam işleri ve cari hesabı.
 *
 * DİKKAT, bu dosyanın varlık sebebi bu: `is_` tablolarında RLS açık ve HİÇBİR
 * politika yok, `authenticated` role de yetki verilmedi. Yani portala giren
 * bayi/atölye bu veriye tarayıcıdan erişemez — anon anahtar kittelwerk.de'nin
 * içinde açıkta olduğu için bu bilerek böyle.
 *
 * Sonuç: okuma yalnızca service_role ile, yalnızca sunucudan yapılabiliyor.
 * Her fonksiyon önce owner mı diye bakar; middleware zaten yönlendirme yapıyor
 * ama gerçek sınır burası — middleware'deki bir hata en fazla yanlış sayfaya
 * götürür, buradaki bir eksiklik veri sızdırır.
 */

function ownerKontrol(profile) {
  if (!profile?.is_owner) {
    throw new Error('İş takip yalnızca işletme sahibine açıktır.');
  }
}

/** Müşteri listesi + her müşterinin para birimi başına bakiyesi. */
export async function loadMusteriler(profile) {
  ownerKontrol(profile);

  const [{ data: musteriler }, { data: cari }] = await Promise.all([
    supabaseAdmin.from('is_musteriler').select('id, ad, telefon, eposta, notlar').order('ad'),
    supabaseAdmin.from('is_cari').select('musteri_id, para_birimi, borc, tahsilat, kalan'),
  ]);

  const bakiyeler = new Map();
  for (const satir of cari ?? []) {
    const liste = bakiyeler.get(satir.musteri_id) ?? [];
    liste.push(satir);
    bakiyeler.set(satir.musteri_id, liste);
  }

  return (musteriler ?? []).map((m) => ({
    ...m,
    bakiye: (bakiyeler.get(m.id) ?? []).filter((b) => Number(b.borc) || Number(b.tahsilat)),
  }));
}

/** Tek müşterinin işleri, kalemleri, ölçüleri ve ödeme geçmişi. */
export async function loadMusteri(profile, musteriId) {
  ownerKontrol(profile);

  const [{ data: musteri }, { data: isler }, { data: odemeler }, { data: cari }] = await Promise.all([
    supabaseAdmin.from('is_musteriler').select('*').eq('id', musteriId).maybeSingle(),
    supabaseAdmin.from('is_isler_ozet').select('*').eq('musteri_id', musteriId)
      .order('olusturma', { ascending: false }),
    supabaseAdmin.from('is_odemeler').select('id, is_id, tarih, tutar, para_birimi, yontem, aciklama')
      .eq('musteri_id', musteriId).eq('iptal', false).order('tarih', { ascending: false }),
    supabaseAdmin.from('is_cari').select('para_birimi, borc, tahsilat, kalan').eq('musteri_id', musteriId),
  ]);

  if (!musteri) return null;

  // Kalemler ve ölçüler: iş sayısı az olduğu için tek turda çekilip
  // bellekte bağlanıyor, iş başına sorgu açmaya gerek yok.
  const isIds = (isler ?? []).map((i) => i.id);
  let kalemler = [];
  let olculer = [];
  if (isIds.length) {
    const { data: k } = await supabaseAdmin
      .from('is_kalemler')
      .select('id, is_id, ne, aciklama, adet, birim_fiyat, tutar, durum')
      .in('is_id', isIds).order('olusturma');
    kalemler = k ?? [];

    if (kalemler.length) {
      const { data: o } = await supabaseAdmin
        .from('is_olculer')
        .select('id, kalem_id, aciklama, en_cm, boy_cm, adet, notlar')
        .in('kalem_id', kalemler.map((x) => x.id)).order('olusturma');
      olculer = o ?? [];
    }
  }

  const olcuByKalem = new Map();
  for (const o of olculer) {
    const liste = olcuByKalem.get(o.kalem_id) ?? [];
    liste.push(o);
    olcuByKalem.set(o.kalem_id, liste);
  }

  const kalemByIs = new Map();
  for (const k of kalemler) {
    const liste = kalemByIs.get(k.is_id) ?? [];
    liste.push({ ...k, olculer: olcuByKalem.get(k.id) ?? [] });
    kalemByIs.set(k.is_id, liste);
  }

  return {
    musteri,
    cari: (cari ?? []).filter((c) => Number(c.borc) || Number(c.tahsilat)),
    isler: (isler ?? []).map((i) => ({ ...i, kalemler: kalemByIs.get(i.id) ?? [] })),
    odemeler: odemeler ?? [],
  };
}

/** Vadesi gelen ve geçen açık işler — arşivdekiler görünümde eleniyor. */
export async function loadYaklasan(profile) {
  ownerKontrol(profile);
  const { data } = await supabaseAdmin
    .from('is_yaklasan')
    .select('id, musteri_id, musteri, baslik, kalem_ozeti, para_birimi, tutar, odenen, kalan, vade');
  return data ?? [];
}

/** Arşive çekilmiş WWS işleri. */
export async function loadArsiv(profile) {
  ownerKontrol(profile);
  const { data } = await supabaseAdmin
    .from('is_isler_ozet')
    .select('id, musteri_id, musteri, baslik, kalem_ozeti, para_birimi, durum, tutar, odenen, kalan, vade, olusturma, arsiv_tarihi')
    .eq('arsiv', true)
    .order('arsiv_tarihi', { ascending: false });
  return data ?? [];
}

/**
 * Bir işi arşive çeker ya da geri alır.
 *
 * Para tarafına dokunmuyor: kalemler, ödemeler ve `is_cari` olduğu gibi
 * kalıyor. Arşiv burada "aktif listede görünmesin" demek, "olmadı" demek
 * değil — onun karşılığı `iptal`.
 */
export async function setArsiv(profile, isId, arsiv) {
  ownerKontrol(profile);
  const { data, error } = await supabaseAdmin
    .from('is_isler')
    .update({ arsiv, arsiv_tarihi: arsiv ? new Date().toISOString() : null })
    .eq('id', isId)
    .select('id, arsiv')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * WWS'in "Tüm Siparişler" ekranı: Kittelwerk ve Wipello'nun siparişleri +
 * WWS'in kendi işleri tek listede.
 *
 * Sistemlerin kendi Bestellungen ekranları yalnız kendi sitelerini gösteriyor;
 * sistemler arası tek bakış bilerek YALNIZCA burada ve yalnızca owner'da —
 * WWS alanının kuralı bu (bkz. AREAS).
 *
 * Çıktı tek biçime indirgeniyor, çünkü iki kaynağın alan adları hiç tutmuyor
 * (orders: `total`/`created_at`/`status`, is_isler: `tutar`/`olusturma`/`durum`).
 * Ekran bu ayrımı bilmesin diye çeviri burada yapılıyor.
 */
export async function loadTumSiparisler(profile) {
  ownerKontrol(profile);

  const [{ data: orders }, { data: isler }, { data: sites }] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select('id, order_no, site_id, kind, status, source, company, name, job_name, total, currency, created_at')
      .order('created_at', { ascending: false })
      .limit(500),
    supabaseAdmin
      .from('is_isler_ozet')
      .select('id, musteri_id, musteri, baslik, kalem_ozeti, para_birimi, durum, tutar, kalan, olusturma')
      .eq('arsiv', false)
      .order('olusturma', { ascending: false }),
    supabaseAdmin.from('sites').select('id, name'),
  ]);

  const siteAd = new Map((sites ?? []).map((s) => [s.id, s.name]));

  const liste = [
    ...(orders ?? []).map((o) => ({
      key: `order:${o.id}`,
      sistem: o.site_id,
      sistemAd: siteAd.get(o.site_id) ?? o.site_id,
      no: `#${o.order_no}`,
      baslik: o.job_name || o.company || o.name || '—',
      alt: o.company && o.name && o.company !== o.name ? o.name : null,
      tutar: Number(o.total ?? 0),
      paraBirimi: o.currency ?? 'EUR',
      durum: o.status,
      tarih: o.created_at,
      kind: o.kind,
      source: o.source,
      link: null,
    })),
    ...(isler ?? []).map((i) => ({
      key: `is:${i.id}`,
      isId: i.id,
      // Ton anahtarı bilerek 'is-takip': menüdeki WWS noktası da bu id'yi
      // kullanıyor, ikisi farklı olsa listedeki renk menüyle tutmazdı.
      sistem: 'is-takip',
      sistemAd: 'WWS',
      no: null,
      baslik: i.baslik || i.kalem_ozeti || '—',
      alt: i.musteri,
      tutar: Number(i.tutar ?? 0),
      // Arşive çekerken "ödenmemiş bakiyesi var" uyarısı buna bakıyor.
      kalan: Number(i.kalan ?? 0),
      paraBirimi: i.para_birimi ?? 'EUR',
      durum: i.durum,
      tarih: i.olusturma,
      kind: null,
      source: null,
      // WWS işinin kendi sayfası yok; müşteri detayında yaşıyor.
      link: `/is-takip/${i.musteri_id}`,
    })),
  ];

  liste.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
  return liste;
}
