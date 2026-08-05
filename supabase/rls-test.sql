-- Veritabanı sınırlarının testi — seed verisi üzerinde çalışır.
-- Çalıştırma:
--   docker exec -i supabase_db_kittelwerk psql -U postgres -d postgres -q < supabase/rls-test.sql
--
-- Şema her değiştiğinde tekrar çalıştır.

\set ON_ERROR_STOP on
begin;

\set owner    '''11111111-1111-1111-1111-111111111111'''
\set vertrieb '''22222222-2222-2222-2222-222222222222'''
\set atolyeA  '''33333333-3333-3333-3333-333333333333'''
\set atolyeB  '''44444444-4444-4444-4444-444444444444'''
\set haendler '''55555555-5555-5555-5555-555555555555'''

\echo ''
\echo '=============================================================='
\echo ' 1) VERTRIEB — orders tablosuna dogrudan erisim (BEKLENEN: 0)'
\echo '=============================================================='
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select count(*) as satir from public.orders;

\echo ''
\echo ' 2) VERTRIEB — parasiz gorunum (BEKLENEN: 5)'
select count(*) as satir from public.orders_produktion;

\echo ''
\echo ' 3) Gorunumde para sutunu (BEKLENEN: bos)'
reset role;
select coalesce(string_agg(column_name, ', '), '(yok)') as para_sutunlari
from information_schema.columns
where table_name = 'orders_produktion'
  and column_name ~ 'total|price|subtotal|discount|cost|shipping';

\echo ''
\echo ' 4) items icinde birim fiyat kaldi mi? (BEKLENEN: 0)'
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select count(*) as fiyatli_kalem
from public.orders_produktion o, jsonb_array_elements(o.items) it
where it ? 'unitPrice' or it ? 'linePrice';

\echo ''
\echo '=============================================================='
\echo ' 5) ATOLYE A — sadece kendi isi (BEKLENEN: 1)'
\echo '=============================================================='
set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';
select count(*) as gordugu from public.orders_produktion;

\echo ''
\echo ' 6) ATOLYE B — sadece kendi isi (BEKLENEN: 1)'
set local request.jwt.claims = '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated"}';
select count(*) as gordugu from public.orders_produktion;

\echo ''
\echo ' 7) HAENDLER — sadece kendi siparisi (BEKLENEN: 1)'
set local request.jwt.claims = '{"sub":"55555555-5555-5555-5555-555555555555","role":"authenticated"}';
select count(*) as gordugu from public.orders;

\echo ''
\echo ' 8) HAENDLER — baska bayinin kosullarini goremez (BEKLENEN: 1, kendi)'
select count(*) as gordugu from public.haendler;

\echo ''
\echo '=============================================================='
\echo ' 9) OWNER — her sey, fiyatlariyla (BEKLENEN: 5 / 2185.30)'
\echo '=============================================================='
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select count(*) as satir, sum(total) as toplam from public.orders;

\echo ''
\echo '=============================================================='
\echo ' 10) Veritabani kisitlari'
\echo '=============================================================='
reset role;
do $$
begin
  update public.profiles set is_owner = true
    where id = '22222222-2222-2222-2222-222222222222';
  raise warning 'SORUN: ikinci owner olusturulabildi!';
exception when unique_violation then
  raise notice 'OK - ikinci owner engellendi';
end $$;

do $$
begin
  update public.profiles set werkstatt_id = null
    where id = '33333333-3333-3333-3333-333333333333';
  raise warning 'SORUN: atolyesiz werkstatt olusturulabildi!';
exception when check_violation then
  raise notice 'OK - atolyesiz werkstatt engellendi';
end $$;

do $$
begin
  update public.profiles set role = 'chef'
    where id = '22222222-2222-2222-2222-222222222222';
  raise warning 'SORUN: gecersiz rol yazilabildi!';
exception when check_violation then
  raise notice 'OK - gecersiz rol engellendi';
end $$;

do $$
begin
  insert into public.orders (source, haendler_id, items)
  values ('haendler', null, '[]'::jsonb);
  raise warning 'SORUN: bayisiz haendler siparisi olusturulabildi!';
exception when check_violation then
  raise notice 'OK - kaynak/sahip tutarsizligi engellendi';
end $$;

\echo ''
\echo ' 11) Kur tarihcesi — gecmise donuk dogru kur'
select public.rate_at('TRY')                              as bugun,
       public.rate_at('TRY', now() - interval '30 days')   as otuz_gun_once,
       public.rate_at('TRY', now() - interval '90 days')   as doksan_gun_once;

rollback;
