-- ============================================================================
-- GÖÇ ADIM 1 — ESKİ ŞEMAYI KENARA AL
--
-- Portal şeması `create table if not exists` kullanıyor. Canlıda ZATEN
-- orders / products / profiles adlı tablolar var ama YAPILARI FARKLI; şema
-- öylece uygulanırsa Postgres "zaten var" deyip atlar ve portal yanlış
-- tabloya bakar. Bu yüzden eskiler önce `alt_` önekine alınıyor.
--
-- SİLİNMİYORLAR — geri dönüş yolu bu. Göç oturmuş sayıldıktan sonra
-- (en az birkaç gün) elle düşürülebilirler.
--
-- Tamamı tek transaction: ya hepsi olur ya hiçbiri.
-- ============================================================================

begin;

-- --- Güvenlik kilitleri -----------------------------------------------------
do $$
begin
  -- Yanlış veritabanı: eski Kittelwerk şeması değilse dur.
  if not exists (select 1 from information_schema.tables
                 where table_schema = 'public' and table_name = 'resellers') then
    raise exception 'DURDURULDU: burada `resellers` tablosu yok — bu, göç bekleyen eski Kittelwerk veritabanı değil.';
  end if;

  -- Zaten göç edilmiş: portal şeması kuruluysa dur (ikinci kez çalıştırma).
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'haendler') then
    raise exception 'DURDURULDU: `haendler` zaten var — göç daha önce yapılmış.';
  end if;

  -- Elde olmayan bir görünüm eski tablolara bağlıysa yeniden adlandırma
  -- sessizce onu da taşır; önce görelim.
  if exists (select 1 from information_schema.views
             where table_schema = 'public') then
    raise notice 'UYARI: public şemada görünüm(ler) var, göç sonrası kontrol edin.';
  end if;
end $$;


-- --- Tabloları kenara al ----------------------------------------------------
alter table public.orders                rename to alt_orders;
alter table public.products              rename to alt_products;
alter table public.profiles              rename to alt_profiles;
alter table public.resellers             rename to alt_resellers;
alter table public.reseller_orders       rename to alt_reseller_orders;
alter table public.reseller_applications rename to alt_reseller_applications;
alter table public.workshops             rename to alt_workshops;
alter table public.workshop_messages     rename to alt_workshop_messages;
-- `subscribers` (bülten listesi) duruyor: portal şemasında karşılığı yok,
-- adı da çakışmıyor.


-- --- İndeksleri de yeniden adlandır ----------------------------------------
-- Tablo adı değişince indeks adı değişmez. `orders_pkey` eski tabloda
-- kalırsa yeni orders tablosu aynı adı isteyip "relation already exists"
-- ile patlar. Bu döngü olmadan göç ADIM 2'de kırılır.
do $$
declare r record;
begin
  for r in
    select indexname from pg_indexes
    where schemaname = 'public'
      and tablename like 'alt\_%'
      and indexname not like 'alt\_%'
  loop
    execute format('alter index public.%I rename to %I', r.indexname, 'alt_' || r.indexname);
  end loop;
end $$;


-- --- Eski kullanıcı→profil trigger'ını kaldır -------------------------------
-- Portal şeması bunu kendi sürümüyle yeniden kuracak. Arada yeni bir kayıt
-- gelirse artık var olmayan `profiles`'a yazmaya çalışıp kaydı düşürürdü.
drop trigger if exists on_auth_user_created on auth.users;

commit;
