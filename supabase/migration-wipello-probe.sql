-- Taşıma provası: Wipello'nun quotes tablosu yerelde birebir kurulup
-- migration-wipello.sql'in ADIM 1 sorgusu gerçek veriyle denenmiş oluyor.
-- Canlıya dokunmadan, üretilen INSERT'lerin çalıştığını kanıtlar.
--   docker exec -i supabase_db_kittelwerk psql -U postgres -d postgres -q < supabase/migration-wipello-probe.sql

\set ON_ERROR_STOP on
begin;

-- --- Wipello'nun şeması (kullanıcının verdiği sütun listesiyle birebir) ------
create table probe_quotes (
  id uuid default gen_random_uuid(), quote_number text, scent text,
  quantity integer, size text, package_type text, wipe_type text,
  unit_price numeric, net_total numeric, vat_rate numeric, total numeric,
  currency text, status text, created_at timestamptz, print_type text,
  print_fee numeric, product_subtotal numeric, vat_amount numeric,
  customer_name text, customer_company text, customer_email text,
  customer_phone text, customer_note text, locale text, ip_hash text,
  customer_street text, customer_zip text, customer_city text,
  customer_country text, customer_vat_id text
);

insert into probe_quotes (quote_number, scent, quantity, size, package_type, wipe_type,
  unit_price, product_subtotal, net_total, vat_rate, vat_amount, total, currency,
  status, created_at, print_type, print_fee, customer_name, customer_company,
  customer_email, customer_phone, locale, customer_street, customer_zip,
  customer_city, customer_country, customer_vat_id)
values
  ('WP-2026-0001','Zitrone',20000,'6x8','triplex','Vlies',
   0.0700, 1400.00, 1400.00, 19, 266.00, 1666.00, 'EUR',
   'open', now() - interval '20 days', 'front', 0, 'Ayşe Demir','Café Mood',
   'ayse@moodburger.de','0511 111111','de','Georgstr. 5','30159','Hannover','DE','DE123456789'),
  -- Kesme işareti içeren isim: %L kaçışının çalıştığını kanıtlıyor.
  ('WP-2026-0002','Kolonya',40000,'7x10','kraft','Spunlace',
   0.0650, 2600.00, 2600.00, 19, 494.00, 3094.00, 'EUR',
   'accepted', now() - interval '5 days', 'both', 120.00, 'O''Brien Ltd','O''Brien & Söhne',
   'info@obrien.ie','+353 1 234','en','Main St. 7','D02','Dublin','IE',null),
  ('WP-2026-0003',null,10000,null,'coated',null,
   0.0900, 900.00, 900.00, 19, 171.00, 1071.00, 'EUR',
   null, now() - interval '2 days', null, null, 'Test Kunde', null,
   'test@example.com', null, 'tr', null, null, null, null, null);

\echo ''
\echo '=== ADIM 1 ciktisi uretiliyor ve dogrudan calistiriliyor ==='

-- Gerçek akışta bu çıktı elle kopyalanıyor; provada doğrudan çalıştırıyoruz.
do $prova$
declare
  satir text;
begin
  for satir in
    select format(
      'insert into public.orders (site_id, kind, source, external_ref, status, '
      || 'name, company, email, phone, street, plz, city, country, vat_id, locale, '
      || 'items, subtotal, net_total, vat_rate, vat_amount, total, currency, created_at) values '
      || '(%L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L::jsonb, %s, %s, %s, %s, %s, %L, %L) '
      || 'on conflict (site_id, external_ref) where external_ref is not null do nothing;',
      'wipello', 'angebot', 'web', q.quote_number,
      case lower(coalesce(q.status, ''))
        when 'accepted'   then 'angebot_angenommen'
        when 'angenommen' then 'angebot_angenommen'
        when 'rejected'   then 'angebot_abgelehnt'
        when 'abgelehnt'  then 'angebot_abgelehnt'
        when 'done'       then 'abgeschlossen'
        when 'cancelled'  then 'storniert'
        else 'angebot_offen'
      end,
      q.customer_name, q.customer_company, q.customer_email, q.customer_phone,
      q.customer_street, q.customer_zip, q.customer_city, q.customer_country,
      q.customer_vat_id, q.locale,
      jsonb_build_array(jsonb_build_object(
        'productId',  coalesce(q.wipe_type, 'feuchttuch'),
        'product',    concat_ws(' · ', nullif(q.wipe_type, ''), nullif(q.package_type, '')),
        'scent',      q.scent, 'size', q.size, 'package', q.package_type,
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
    )
    from probe_quotes q order by q.created_at
  loop
    execute satir;
  end loop;
end
$prova$;

\echo ''
\echo '=== SONUC: tasinan teklifler ==='
select external_ref, status, company, city, country,
       net_total, vat_amount, total,
       items->0->>'scent' as koku, items->0->>'qty' as adet
from public.orders where site_id='wipello' and kind='angebot'
order by external_ref;

\echo ''
\echo '=== Tutar tutarliligi (BEKLENEN: 0 bozuk) ==='
select count(*) as tutari_bozuk from public.orders
where site_id='wipello' and kind='angebot' and net_total is not null
  and abs(net_total + coalesce(vat_amount,0) - coalesce(total,0)) > 0.02;

\echo ''
\echo '=== Iki kez calistirma guvenli mi? (BEKLENEN: sayi degismez) ==='
insert into public.orders (site_id, kind, source, external_ref, status, items, subtotal, total)
values ('wipello','angebot','web','WP-2026-0001','angebot_offen','[]'::jsonb,0,0)
on conflict (site_id, external_ref) where external_ref is not null do nothing;
select count(*) as wipello_teklif_sayisi from public.orders where site_id='wipello' and kind='angebot';

rollback;
