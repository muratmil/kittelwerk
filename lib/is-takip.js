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

/** Vadesi gelen ve geçen açık işler — ana ekranın ikinci sekmesi. */
export async function loadYaklasan(profile) {
  ownerKontrol(profile);
  const { data } = await supabaseAdmin
    .from('is_yaklasan')
    .select('id, musteri_id, musteri, baslik, kalem_ozeti, para_birimi, tutar, odenen, kalan, vade');
  return data ?? [];
}
