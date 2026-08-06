-- ============================================================================
-- İŞ TAKİP DEVRİ — ÜRETEÇ
--
-- Bu dosya İŞ TAKİP'in kendi yerel veritabanında çalıştırılır
-- (`docker exec -i supabase_db_is-takip psql -U postgres -d postgres`).
-- Çıktısı, portalın veritabanında çalıştırılacak hazır INSERT satırlarıdır.
--
-- İki ayrı Postgres olduğu için doğrudan kopyalama yok; araya bu üreteç giriyor.
-- Kimlikler (id) korunuyor, `on conflict do nothing` ile tekrar çalıştırılabilir.
--
-- Eski modelde para İŞİN üstünde tek sayıydı (`alinan_odeme`); yeni modelde
-- tarihli ödeme kaydı. Devirde o sayı tek bir "devir" ödemesine dönüşüyor —
-- geçmiş tarihleri bilmiyoruz, uydurmuyoruz da.
-- ============================================================================

\pset format unaligned
\pset tuples_only on

select 'begin;'

union all select format(
  'insert into public.is_musteriler (id, ad, telefon, eposta, notlar, olusturma) values (%L,%L,%L,%L,%L,%L) on conflict (id) do nothing;',
  m.id, m.ad, m.telefon, m.eposta, m.notlar, m.olusturma)
from musteriler m

union all select format(
  'insert into public.is_isler (id, musteri_id, baslik, aciklama, para_birimi, durum, vade, olusturma) values (%L,%L,%L,%L,%L,%L,%L,%L) on conflict (id) do nothing;',
  i.id, i.musteri_id, i.baslik, i.aciklama, i.para_birimi, i.is_durumu, i.odeme_tarihi, i.olusturma)
from isler i where i.musteri_id is not null

union all select format(
  'insert into public.is_kalemler (id, is_id, ne, aciklama, adet, birim_fiyat, tutar, durum, olusturma) values (%L,%L,%L,%L,%s,%L,%s,%L,%L) on conflict (id) do nothing;',
  k.id, k.is_id, k.tur, k.aciklama, coalesce(k.adet,1), k.birim_fiyat, coalesce(k.tutar,0), coalesce(k.durum,'planlandi'), k.olusturma)
from kalemler k

-- Kalemlerin toplamı işin toplamını tutmuyorsa aradaki farkı bir kalem olarak
-- ekle. Yoksa devirde para sessizce buharlaşır (yeni modelde işin tutarı
-- kalemlerden hesaplanıyor, artık ayrı bir toplam alanı yok).
union all select format(
  'insert into public.is_kalemler (is_id, ne, aciklama, adet, tutar) values (%L, %L, %L, 1, %s);',
  i.id, 'Devir farkı', 'Eski kayıtta iş toplamı kalemler toplamından farklıydı', fark.d)
from isler i
join lateral (select i.toplam_tutar - coalesce((select sum(tutar) from kalemler where is_id = i.id),0) as d) fark on true
where i.musteri_id is not null and fark.d <> 0

union all select format(
  'insert into public.is_olculer (id, kalem_id, aciklama, en_cm, boy_cm, adet, notlar) values (%L,%L,%L,%L,%L,%s,%L) on conflict (id) do nothing;',
  o.id, o.kalem_id, o.aciklama, o.en_cm, o.boy_cm, coalesce(o.adet,1), o.notlar)
from olculer o

-- Ödemenin eski tarafta kimliği yok (tek sayıydı). Kimlik işin id'sinden
-- türetiliyor ki betik iki kez çalıştırılırsa ödeme İKİLENMESİN — provada
-- tam bu oldu: tahsilat 2.500 yerine 5.000 göründü, bakiye yanlış çıktı.
union all select format(
  'insert into public.is_odemeler (id, musteri_id, is_id, tarih, tutar, para_birimi, aciklama) values (%L,%L,%L,%L,%s,%L,%L) on conflict (id) do nothing;',
  md5(i.id::text || ':devir')::uuid,
  i.musteri_id, i.id, i.olusturma::date, i.alinan_odeme, i.para_birimi, 'Devir: eski kayıttaki alınan ödeme toplamı')
from isler i where i.musteri_id is not null and i.alinan_odeme > 0

union all select 'commit;';
