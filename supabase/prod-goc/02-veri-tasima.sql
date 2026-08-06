-- ============================================================================
-- GÖÇ ADIM 2 — ESKİ VERİYİ PORTAL YAPISINA TAŞI
--
-- ADIM 1 (01-hazirlik.sql) ve portal göçleri çalıştıktan SONRA çalıştırılır.
-- Eşlemeler (canlı veriden okundu, 2026-08-06):
--   alt_workshops        → werkstaetten   (id korunur)
--   alt_profiles         → profiles       (rol eşlemesi aşağıda)
--   alt_resellers        → haendler       (id ve profile_id korunur)
--   alt_orders           → orders  (source='web')
--   alt_reseller_orders  → orders  (source='haendler')
--   alt_products         → TAŞINMIYOR: portalın ürün/fiyatları koddan üretiliyor
--                          (`supabase/seed-products.sql`), eski tablo 5 satırlık
--                          artık bir kalıntıydı.
--   subscribers          → dokunulmadı (portalda karşılığı yok)
--
-- Tamamı tek transaction.
-- ============================================================================

begin;

-- --- Ön kontroller: varsayımlarım hâlâ geçerli mi? -------------------------
do $$
declare bilinmeyen text;
begin
  if not exists (select 1 from information_schema.tables
                 where table_schema='public' and table_name='alt_resellers') then
    raise exception 'DURDURULDU: alt_ tabloları yok — önce 01-hazirlik.sql çalışmalı.';
  end if;
  if not exists (select 1 from information_schema.tables
                 where table_schema='public' and table_name='haendler') then
    raise exception 'DURDURULDU: portal şeması kurulmamış — önce göç dosyaları uygulanmalı.';
  end if;
  if exists (select 1 from public.orders) then
    raise exception 'DURDURULDU: orders boş değil — bu betik iki kez çalıştırılamaz.';
  end if;

  -- Eski uygulamanın durum listesi: new, processing, on_hold, shipped, done,
  -- cancelled. Başka bir değer çıkarsa eşleme eksik demektir; sessizce
  -- "neu" yapmak iptal edilmiş bir siparişi dirilturdu.
  select string_agg(distinct s, ', ') into bilinmeyen
  from (select status s from public.alt_orders
        union select status from public.alt_reseller_orders) t
  where s is not null
    and s not in ('new','processing','on_hold','shipped','done','cancelled');
  if bilinmeyen is not null then
    raise exception 'DURDURULDU: bilinmeyen sipariş durumu: %', bilinmeyen;
  end if;

  -- Aynısı roller için.
  select string_agg(distinct role, ', ') into bilinmeyen
  from public.alt_profiles
  where role not in ('admin','reseller','seller','verkauf');
  if bilinmeyen is not null then
    raise exception 'DURDURULDU: bilinmeyen kullanıcı rolü: %', bilinmeyen;
  end if;
end $$;


-- --- Durum eşlemesi (betik boyunca kullanılıyor, sonunda düşürülüyor) ------
create or replace function public.gecici_durum_esle(p text)
returns text language sql immutable as $$
  select case p
    when 'new'        then 'neu'
    when 'processing' then 'in_produktion'
    when 'on_hold'    then 'pausiert'
    when 'shipped'    then 'versandt'
    when 'done'       then 'abgeschlossen'
    when 'cancelled'  then 'storniert'
    else 'neu'
  end
$$;


-- --- 1) Siteler ------------------------------------------------------------
-- 'kittelwerk' satırı göç dosyasından geliyor. Wipello satırı yalnızca
-- seed.sql'de vardı, o da canlıda çalışmıyor — buraya taşındı.
insert into public.sites (id, name, domain, sort_order, manages_pricing, allows_ordering, links)
values ('wipello', 'Wipello', 'www.wipello.com', 1, false, false,
  '[{"label":"Angebote","url":"https://www.wipello.com/admin/teklifler"},
    {"label":"Preise","url":"https://www.wipello.com/admin/fiyat"}]'::jsonb)
on conflict (id) do nothing;

-- Wipello'da birim fiyat kuruş seviyesinde: yuvarlama tam euro OLAMAZ.
insert into public.pricing_settings (site_id, round_to, round_mode, low_margin_threshold)
values ('wipello', 0.01, 'up', 30)
on conflict (site_id) do nothing;


-- --- 2) Atölyeler ----------------------------------------------------------
insert into public.werkstaetten (id, name, contact_name, email, phone, active, created_at)
select w.id, w.name, w.contact_name, w.email, w.phone,
       coalesce(w.active, true), coalesce(w.created_at, now())
from public.alt_workshops w;


-- --- 3) Profiller ----------------------------------------------------------
-- Rol eşlemesi:
--   admin                        → owner (tek yönetici hesabı, @kittelwerk.de)
--   reseller                     → haendler
--   seller/verkauf + atölyesi var → werkstatt
--   seller/verkauf + atölyesi yok → vertrieb  (eski merkez/satış masası)
--
-- Yetki kutucukları (permissions) bilerek boş: owner'ın hepsi zaten var,
-- diğerlerine yetki vermek Murat'ın kararı — göç kimseye yetki dağıtmaz.
insert into public.profiles (id, email, role, is_owner, permissions, company,
                             werkstatt_id, site_access, created_at)
select p.id, p.email,
       case
         when p.role = 'admin' then 'owner'
         when p.role = 'reseller' then 'haendler'
         when p.workshop_id is not null then 'werkstatt'
         else 'vertrieb'
       end,
       p.role = 'admin',
       '{}'::text[],
       p.company,
       p.workshop_id,
       '{}'::text[],                        -- boş dizi = tüm siteler
       coalesce(p.created_at, now())
from public.alt_profiles p;


-- --- 4) Bayiler ------------------------------------------------------------
insert into public.haendler (id, profile_id, company, contact_name, email, phone,
                             street, plz, city, steuer_id, gewerbe_info,
                             discount_rate, custom_prices, active, created_at)
select r.id, r.profile_id, r.company, r.contact_name, r.email, r.phone,
       r.street, r.plz, r.city, r.steuer_id, r.gewerbe_info,
       r.discount_rate, nullif(r.custom_prices, '{}'::jsonb),
       coalesce(r.active, false), coalesce(r.created_at, now())
from public.alt_resellers r;


-- --- 5) Siparişler ---------------------------------------------------------
-- İki eski tablo tek tabloda birleşiyor. Sipariş numarası ikisinin ortak
-- zaman sırasına göre veriliyor ki numara akışı tarihle uyumlu olsun.
insert into public.orders (
  id, order_no, site_id, kind, source, haendler_id, werkstatt_id,
  name, company, email, phone, street, plz, city,
  items, subtotal, discount_code, discount_amount, shipping_cost, total,
  status, job_name, notes, logo_url, created_at)
select k.id,
       999 + (row_number() over (order by k.created_at, k.id))::int,
       'kittelwerk', 'bestellung', k.source, k.haendler_id, k.werkstatt_id,
       k.name, k.company, k.email, k.phone, k.street, k.plz, k.city,
       k.items, k.subtotal, k.discount_code, k.discount_amount, k.shipping_cost, k.total,
       k.status, k.job_name, k.notes, k.logo_url, k.created_at
from (
  -- Web siparişleri
  select o.id,
         'web'::text as source, null::uuid as haendler_id, o.workshop_id as werkstatt_id,
         o.name, o.company, o.email, o.phone, o.street, o.plz, o.city,
         coalesce(o.items, '[]'::jsonb) as items,
         coalesce(o.subtotal, 0) as subtotal, o.discount_code,
         coalesce(o.discount_amount, 0) as discount_amount,
         coalesce(o.shipping_cost, 0) as shipping_cost,
         coalesce(o.total, 0) as total,
         public.gecici_durum_esle(o.status) as status,
         null::text as job_name, o.notes, o.logo_url,
         coalesce(o.created_at, now()) as created_at
  from public.alt_orders o

  union all

  -- Bayi siparişleri. Müşteri alanları bayi kaydından dolduruluyor; eski
  -- tabloda yoklardı ve portal listesi "kim sipariş verdi"yi buradan okuyor.
  select ro.id,
         'haendler', ro.reseller_id, ro.workshop_id,
         h.contact_name, h.company, h.email, h.phone, h.street, h.plz, h.city,
         ro.items,
         ro.subtotal, null,
         ro.discount_amount, ro.shipping_cost, ro.total,
         public.gecici_durum_esle(ro.status),
         ro.job_name, ro.notes, null,
         coalesce(ro.created_at, now())
  from public.alt_reseller_orders ro
  left join public.haendler h on h.id = ro.reseller_id
) k;

-- Sıra numarası sayacını taşınan en büyük numaranın üstüne al, yoksa yeni
-- sipariş var olan bir numarayı isteyip benzersizlik kısıtına takılır.
select setval('public.order_no_seq', coalesce((select max(order_no) from public.orders), 999));


-- --- 6) Temizlik -----------------------------------------------------------
drop function public.gecici_durum_esle(text);


-- --- 7) Sağlama ------------------------------------------------------------
do $$
declare
  eski_siparis int; yeni_siparis int;
  eski_profil  int; yeni_profil  int;
  eski_bayi    int; yeni_bayi    int;
  eski_atolye  int; yeni_atolye  int;
begin
  select count(*) into eski_siparis from (
    select 1 from public.alt_orders union all select 1 from public.alt_reseller_orders) t;
  select count(*) into yeni_siparis from public.orders;
  select count(*) into eski_profil from public.alt_profiles;
  select count(*) into yeni_profil from public.profiles;
  select count(*) into eski_bayi   from public.alt_resellers;
  select count(*) into yeni_bayi   from public.haendler;
  select count(*) into eski_atolye from public.alt_workshops;
  select count(*) into yeni_atolye from public.werkstaetten;

  if yeni_siparis <> eski_siparis then
    raise exception 'SAĞLAMA HATASI sipariş: eski %, yeni %', eski_siparis, yeni_siparis;
  end if;
  if yeni_profil <> eski_profil then
    raise exception 'SAĞLAMA HATASI profil: eski %, yeni %', eski_profil, yeni_profil;
  end if;
  if yeni_bayi <> eski_bayi then
    raise exception 'SAĞLAMA HATASI bayi: eski %, yeni %', eski_bayi, yeni_bayi;
  end if;
  if yeni_atolye <> eski_atolye then
    raise exception 'SAĞLAMA HATASI atölye: eski %, yeni %', eski_atolye, yeni_atolye;
  end if;
  if (select count(*) from public.profiles where is_owner) <> 1 then
    raise exception 'SAĞLAMA HATASI: owner sayısı 1 değil';
  end if;
  if (select count(*) from public.orders where source = 'haendler' and haendler_id is null) > 0 then
    raise exception 'SAĞLAMA HATASI: bayisiz bayi siparişi var';
  end if;

  raise notice 'Göç tamam — % sipariş, % profil, % bayi, % atölye taşındı.',
    yeni_siparis, yeni_profil, yeni_bayi, yeni_atolye;
end $$;

commit;
