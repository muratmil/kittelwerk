-- ============================================================================
-- WIPELLO TEKLİFLERİNİ PORTALA TAŞIMA
--
-- Wipello'nun Supabase'i ayrı bir hesapta (ref lziwlbczimbrgzsiutcl), bu
-- makineden erişilemiyor. Bu yüzden taşıma iki adımda, senin elinle yapılıyor.
-- Müşteri verisi hiçbir sohbete düşmüyor: bir SQL editöründen diğerine gidiyor.
--
--   ADIM 1  →  WIPELLO'nun SQL editöründe ADIM 1 bloğunu çalıştır.
--              Çıktı, hazır INSERT satırlarıdır (tek sütun, çok satır).
--   ADIM 2  →  O çıktının tamamını kopyalayıp PORTAL veritabanının SQL
--              editöründe çalıştır.
--
-- Tekrar çalıştırmak güvenlidir: external_ref üzerinde tekil indeks var,
-- aynı teklif ikinci kez eklenmez (ON CONFLICT DO NOTHING).
-- ============================================================================


-- ============================================================================
-- ADIM 0 — ÖNCE BUNU ÇALIŞTIR (Wipello'da). Kaç kayıt ve hangi durumlar var?
-- ============================================================================
/*
select count(*) as toplam_teklif from public.quotes;
select status, count(*) from public.quotes group by status order by 2 desc;
select min(created_at) as ilk, max(created_at) as son from public.quotes;
*/


-- ============================================================================
-- ADIM 1 — WIPELLO'nun SQL editöründe çalıştır, çıktıyı kopyala
-- ============================================================================

select format(
  'insert into public.orders (site_id, kind, source, external_ref, status, '
  || 'name, company, email, phone, street, plz, city, country, vat_id, locale, '
  || 'items, subtotal, net_total, vat_rate, vat_amount, total, currency, created_at) values '
  || '(%L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L::jsonb, %s, %s, %s, %s, %s, %L, %L) '
  || 'on conflict (site_id, external_ref) where external_ref is not null do nothing;',
  'wipello',
  'angebot',
  'web',
  q.quote_number,
  -- Durum eşlemesi: bilinmeyen her değer açık teklif sayılır.
  case lower(coalesce(q.status, ''))
    when 'accepted'  then 'angebot_angenommen'
    when 'angenommen' then 'angebot_angenommen'
    when 'rejected'  then 'angebot_abgelehnt'
    when 'abgelehnt' then 'angebot_abgelehnt'
    when 'done'      then 'abgeschlossen'
    when 'cancelled' then 'storniert'
    else 'angebot_offen'
  end,
  q.customer_name,
  q.customer_company,
  q.customer_email,
  q.customer_phone,
  q.customer_street,
  q.customer_zip,
  q.customer_city,
  q.customer_country,
  q.customer_vat_id,
  q.locale,
  -- Wipello'da tek satırlık yapılandırma var; portalın çok kalemli `items`
  -- biçimine tek kalem olarak yazılıyor. Koku/ölçü/ambalaj korunuyor.
  jsonb_build_array(jsonb_build_object(
    'productId',  coalesce(q.wipe_type, 'feuchttuch'),
    'product',    concat_ws(' · ', nullif(q.wipe_type, ''), nullif(q.package_type, '')),
    'scent',      q.scent,
    'size',       q.size,
    'package',    q.package_type,
    'print',      coalesce(q.print_type, 'none'),
    'printFee',   coalesce(q.print_fee, 0),
    'qty',        q.quantity,
    'sizes',      jsonb_build_object('-', q.quantity),
    'unitPrice',  q.unit_price,
    'linePrice',  coalesce(q.product_subtotal, q.unit_price * q.quantity)
  ))::text,
  coalesce(q.product_subtotal, q.net_total, 0),
  coalesce(q.net_total, 0),
  coalesce(q.vat_rate, 19),
  coalesce(q.vat_amount, 0),
  coalesce(q.total, 0),
  coalesce(q.currency, 'EUR'),
  q.created_at
) as satir
from public.quotes q
order by q.created_at;


-- ============================================================================
-- ADIM 3 — Taşıma sonrası PORTAL veritabanında kontrol
-- ============================================================================
/*
select count(*) as tasinan from public.orders where site_id = 'wipello' and kind = 'angebot';
select status, count(*) from public.orders where site_id = 'wipello' group by status;
select min(created_at), max(created_at) from public.orders where site_id = 'wipello';

-- Tutarlar doğru mu (net + KDV = toplam)?
-- Yalnızca taşınan teklifleri sayar; portalda kendi doğan kayıtlar
-- (KDV alanı boş olanlar) bu kontrole girmemeli.
select count(*) as tutari_bozuk
from public.orders
where site_id = 'wipello' and kind = 'angebot' and net_total is not null
  and abs(net_total + coalesce(vat_amount,0) - coalesce(total,0)) > 0.02;
*/


-- ============================================================================
-- NOT — sonra yapılacaklar
--
-- 1. Wipello'nun `pricing_settings.settings` jsonb'si buraya taşınmadı.
--    Portal fiyatları products / product_prices / exchange_rates tablolarında
--    tutuyor. O JSON'un içeriğini gönderirsen karşılık gelen satırları yazarım.
--
-- 2. Taşıma bittikten sonra wipello.com'un ortam değişkenleri portalın
--    Supabase'ine çevrilmeli, yoksa yeni teklifler eski veritabanına düşmeye
--    devam eder. İki veritabanına birden yazmasın — kesme anı seçilmeli.
--
-- 3. Eski Supabase projesi bir süre DOKUNULMADAN dursun; geri dönüş yolu o.
-- ============================================================================
