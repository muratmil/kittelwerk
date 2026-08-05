-- Yetki sınırlarının gerçekten tuttuğunu kanıtlayan test.
-- Çalıştırma:  docker exec -i supabase_db_kittelwerk psql -U postgres -d postgres -f -

\set ON_ERROR_STOP on
begin;

-- --- test kullanıcıları -----------------------------------------------------
insert into auth.users (id, email, aud, role, instance_id)
values
  ('11111111-1111-1111-1111-111111111111','owner@test.de','authenticated','authenticated','00000000-0000-0000-0000-000000000000'),
  ('22222222-2222-2222-2222-222222222222','vertrieb@test.de','authenticated','authenticated','00000000-0000-0000-0000-000000000000'),
  ('33333333-3333-3333-3333-333333333333','atolye-a@test.de','authenticated','authenticated','00000000-0000-0000-0000-000000000000'),
  ('44444444-4444-4444-4444-444444444444','atolye-b@test.de','authenticated','authenticated','00000000-0000-0000-0000-000000000000');

insert into public.werkstaetten (id, name) values
  ('aaaaaaaa-0000-0000-0000-000000000001','Atölye A'),
  ('aaaaaaaa-0000-0000-0000-000000000002','Atölye B');

update public.profiles set role='owner', is_owner=true where id='11111111-1111-1111-1111-111111111111';
update public.profiles set role='vertrieb'  where id='22222222-2222-2222-2222-222222222222';
update public.profiles set role='werkstatt', werkstatt_id='aaaaaaaa-0000-0000-0000-000000000001'
  where id='33333333-3333-3333-3333-333333333333';
update public.profiles set role='werkstatt', werkstatt_id='aaaaaaaa-0000-0000-0000-000000000002'
  where id='44444444-4444-4444-4444-444444444444';

-- --- Atölye A'ya atanmış bir sipariş ----------------------------------------
insert into public.orders (source, werkstatt_id, name, company, street, plz, city,
                           items, subtotal, total, status)
values ('web','aaaaaaaa-0000-0000-0000-000000000001',
        'Testmüşteri','Gasthaus Adler','Hauptstr. 1','30159','Hannover',
        '[{"productId":"tshirt","product":"Gastro T-Shirt","color":"Schwarz",
           "sizes":{"L":10},"qty":10,"print":"front",
           "unitPrice":19.00,"linePrice":190.00}]'::jsonb,
        190.00, 202.90, 'neu');

\echo ''
\echo '=============================================================='
\echo ' 1) VERTRIEB — orders tablosuna doğrudan erişim'
\echo '=============================================================='
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select count(*) as "orders_satir_sayisi_BEKLENEN_0" from public.orders;

\echo ''
\echo ' 2) VERTRIEB — parasız görünüm (satırı görmeli, fiyatı görmemeli)'
select order_no, company, city, status,
       (items->0) as ilk_kalem
from public.orders_produktion;

\echo ''
\echo ' 3) VERTRIEB — görünümde para sütunu var mı? (BEKLENEN: bos)'
reset role;
select string_agg(column_name, ', ') as para_sutunlari
from information_schema.columns
where table_name='orders_produktion'
  and column_name ~ 'total|price|subtotal|discount|cost|shipping';

\echo ''
\echo '=============================================================='
\echo ' 4) ATÖLYE A — sadece kendi isi (BEKLENEN: 1)'
\echo '=============================================================='
set local role authenticated;
set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';
select count(*) as "atolye_A_gordugu_BEKLENEN_1" from public.orders_produktion;

\echo ''
\echo ' 5) ATÖLYE B — baskasinin isi (BEKLENEN: 0)'
set local request.jwt.claims = '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated"}';
select count(*) as "atolye_B_gordugu_BEKLENEN_0" from public.orders_produktion;

\echo ''
\echo '=============================================================='
\echo ' 6) OWNER — her seyi gorur, fiyat dahil (BEKLENEN: 1 / 202.90)'
\echo '=============================================================='
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select count(*) as satir, max(total) as toplam from public.orders;

\echo ''
\echo '=============================================================='
\echo ' 7) Iki owner olabilir mi? (BEKLENEN: hata)'
\echo '=============================================================='
reset role;
do $$
begin
  update public.profiles set is_owner = true
    where id = '22222222-2222-2222-2222-222222222222';
  raise warning 'SORUN: ikinci owner olusturulabildi!';
exception when unique_violation then
  raise notice 'OK — ikinci owner veritabani tarafindan engellendi.';
end $$;

\echo ''
\echo '=============================================================='
\echo ' 8) Atolyesiz werkstatt olabilir mi? (BEKLENEN: hata)'
\echo '=============================================================='
do $$
begin
  update public.profiles set werkstatt_id = null
    where id = '33333333-3333-3333-3333-333333333333';
  raise warning 'SORUN: atolyesiz werkstatt olusturulabildi!';
exception when check_violation then
  raise notice 'OK — atolyesiz werkstatt engellendi.';
end $$;

rollback;
