-- WWS (iş takip): eski işleri arşive çekmek.
--
-- ARŞİV YALNIZCA GÖRÜNÜRLÜKTÜR. `is_cari` bilerek ellenmedi: arşive çekilen
-- işin borcu ve tahsilatı bakiyede aynen duruyor. Aksi hâlde bir işi listeden
-- kaldırmak sessizce müşterinin borcunu silerdi — arşivlemek muhasebe işlemi
-- değil, "gözümün önünden çekil" işlemi.
--
-- `iptal` ile karıştırma: iptal edilen iş borç doğurmaz (is_cari onu zaten
-- dışarıda bırakıyor), arşivlenen iş doğurur.

alter table is_isler add column if not exists arsiv boolean not null default false;
alter table is_isler add column if not exists arsiv_tarihi timestamptz;

-- Aktif liste her açılışta arşivdekileri eleyecek; kısmi indeks yeter.
create index if not exists is_isler_arsiv_idx on is_isler (arsiv) where arsiv;

-- Özete arşiv bilgisi eklendi. `create or replace view` yalnızca SONA kolon
-- eklemeye izin veriyor, o yüzden iki yeni alan en altta.
create or replace view is_isler_ozet as
 SELECT i.id,
    i.musteri_id,
    m.ad AS musteri,
    i.baslik,
    i.aciklama,
    i.para_birimi,
    i.durum,
    i.vade,
    i.olusturma,
    COALESCE(k.tutar, (0)::numeric) AS tutar,
    COALESCE(o.odenen, (0)::numeric) AS odenen,
    (COALESCE(k.tutar, (0)::numeric) - COALESCE(o.odenen, (0)::numeric)) AS kalan,
    k.kalem_sayisi,
    k.ozet AS kalem_ozeti,
    i.arsiv,
    i.arsiv_tarihi
   FROM (((is_isler i
     JOIN is_musteriler m ON ((m.id = i.musteri_id)))
     LEFT JOIN LATERAL ( SELECT sum(kk.tutar) AS tutar,
            count(*) AS kalem_sayisi,
            string_agg(((kk.ne || COALESCE(((' ('::text || o_1.olculer) || ')'::text), ''::text)) ||
                CASE
                    WHEN (kk.adet > 1) THEN (' ×'::text || kk.adet)
                    ELSE ''::text
                END), ', '::text ORDER BY kk.olusturma) AS ozet
           FROM (is_kalemler kk
             LEFT JOIN LATERAL ( SELECT string_agg((((is_sayi_kisa(oo.en_cm) || 'x'::text) || is_sayi_kisa(oo.boy_cm)) ||
                        CASE
                            WHEN (oo.adet > 1) THEN (' ×'::text || oo.adet)
                            ELSE ''::text
                        END), ', '::text ORDER BY oo.olusturma) AS olculer
                   FROM is_olculer oo
                  WHERE ((oo.kalem_id = kk.id) AND (oo.en_cm IS NOT NULL) AND (oo.boy_cm IS NOT NULL))) o_1 ON (true))
          WHERE ((kk.is_id = i.id) AND (kk.durum <> 'iptal'::text))) k ON (true))
     LEFT JOIN LATERAL ( SELECT sum(oo.tutar) AS odenen
           FROM is_odemeler oo
          WHERE ((oo.is_id = i.id) AND (NOT oo.iptal))) o ON (true))
  WHERE (NOT i.iptal);

-- Vadeler: arşivdeki iş artık vade listesinde çıkmıyor. Borcu duruyor ama
-- hatırlatmıyor — arşive çekmenin görünen etkisi bu, arayüzde uyarılıyor.
create or replace view is_yaklasan as
 SELECT id,
    musteri_id,
    musteri,
    baslik,
    aciklama,
    para_birimi,
    durum,
    vade,
    olusturma,
    tutar,
    odenen,
    kalan,
    kalem_sayisi,
    kalem_ozeti
   FROM is_isler_ozet
  WHERE ((kalan > (0)::numeric) AND (vade IS NOT NULL) AND (NOT arsiv))
  ORDER BY vade;
