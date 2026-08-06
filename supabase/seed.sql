-- ============================================================================
-- Yerel test verisi. Sadece geliştirme içindir — canlıya gitmez.
-- `npx supabase db reset` her seferinde bunu yeniden yükler.
--
-- Tüm test hesaplarının şifresi:  portal1234
-- ============================================================================

-- --- siteler -----------------------------------------------------------------
-- Bayraklar burada veriliyor, göçte değil: `sites` satırı seed'de doğuyor ve
-- göçler ondan önce çalışıyor — göçteki UPDATE hiçbir satıra denk gelmiyordu.
insert into public.sites (id, name, domain, sort_order, manages_pricing, allows_ordering, links) values
  ('wipello', 'Wipello', 'www.wipello.com', 1, false, false,
   '[{"label":"Angebote","url":"https://www.wipello.com/admin/teklifler"},
     {"label":"Preise","url":"https://www.wipello.com/admin/fiyat"}]'::jsonb)
on conflict (id) do nothing;

-- Wipello'da birim fiyat kuruş seviyesinde: yuvarlama tam euro OLAMAZ,
-- yoksa 0,08 €'luk mendil 1,00 € olurdu.
insert into public.pricing_settings (site_id, round_to, round_mode, low_margin_threshold)
values ('wipello', 0.01, 'up', 30)
on conflict (site_id) do nothing;

-- --- atölyeler ---------------------------------------------------------------
insert into public.werkstaetten (id, name, contact_name, email, active) values
  ('a0000000-0000-0000-0000-000000000001','Atölye Hannover','Ahmet Y.','atolye-a@test.local', true),
  ('a0000000-0000-0000-0000-000000000002','Atölye İstanbul','Fatma K.','atolye-b@test.local', true);

-- --- kullanıcılar ------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated',
       u.email, extensions.crypt('portal1234', extensions.gen_salt('bf')),
       now(), now(), now(),
       '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
       '', '', '', ''
from (values
  ('11111111-1111-1111-1111-111111111111'::uuid, 'murat@kittelwerk.de'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'vertrieb@kittelwerk.de'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'atolye-a@kittelwerk.de'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'atolye-b@kittelwerk.de'),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'haendler@test.local'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'admin2@kittelwerk.de')
) as u(id, email);

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  created_at, updated_at, last_sign_in_at
)
select gen_random_uuid(), u.id, u.id::text,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       'email', now(), now(), now()
from auth.users u;

-- trigger profilleri oluşturdu; rolleri şimdi veriyoruz
update public.profiles set role='owner', is_owner=true, company='Kittelwerk'
  where id='11111111-1111-1111-1111-111111111111';

update public.profiles set role='vertrieb', created_by='11111111-1111-1111-1111-111111111111'
  where id='22222222-2222-2222-2222-222222222222';

update public.profiles set role='werkstatt', werkstatt_id='a0000000-0000-0000-0000-000000000001',
       created_by='11111111-1111-1111-1111-111111111111'
  where id='33333333-3333-3333-3333-333333333333';

update public.profiles set role='werkstatt', werkstatt_id='a0000000-0000-0000-0000-000000000002',
       created_by='11111111-1111-1111-1111-111111111111'
  where id='44444444-4444-4444-4444-444444444444';

update public.profiles set role='haendler', company='Gastro Meier GmbH',
       created_by='11111111-1111-1111-1111-111111111111'
  where id='55555555-5555-5555-5555-555555555555';

-- Kısıtlı admin: fiyat göremez, yalnızca sipariş ve atölye yönetir.
-- "Bir admin sahip olmadığı yetkiyi veremez" kuralının test öznesi.
update public.profiles set role='admin',
       permissions = array['alle_bestellungen','werkstatt_zuweisen','werkstatt_verwalten'],
       created_by='11111111-1111-1111-1111-111111111111'
  where id='66666666-6666-6666-6666-666666666666';

-- --- bayi --------------------------------------------------------------------
insert into public.haendler (id, profile_id, company, contact_name, email, phone,
                             street, plz, city, discount_rate, active)
values ('b0000000-0000-0000-0000-000000000001','55555555-5555-5555-5555-555555555555',
        'Gastro Meier GmbH','Klaus Meier','haendler@test.local','0511 123456',
        'Bahnhofstr. 12','30159','Hannover', 18, true);

-- --- ürünler ve fiyatlar -----------------------------------------------------
-- seed-products.sql config.toml'daki sql_paths ile bundan ÖNCE yükleniyor.

-- alış fiyatları — kur çarpımını görebilmek için TL
update public.products set cost_price = 210.00 where id = 'tshirt';
update public.products set cost_price = 245.00 where id = 'oversize';
update public.products set cost_price = 380.00 where id = 'sweat';
update public.products set cost_price = 520.00 where id = 'fleece';
update public.products set cost_price = 165.00 where id = 'apron';
update public.products set cost_price = 190.00 where id = 'latz';
update public.products set cost_price = 155.00 where id = 'bistro';
update public.products set cost_price = 120.00 where id = 'cap';
update public.products set cost_price = 265.00 where id = 'polo';

-- --- Wipello ---------------------------------------------------------------
-- Wipello portalda YALNIZCA GÖRÜNTÜLENİYOR: fiyat yönetimi kendi panelinde
-- (çarpan bazlı, 124 varyantlı model). Bu yüzden burada ürün/fiyat satırı yok;
-- yalnızca gelen teklif ve siparişler duruyor.

-- Wipello teklifleri — orders'a ELLE yazılmıyor.
-- wipello.com kendi tablosuna yazar, trigger portalın orders'ına yansıtır
-- (bkz. 20260806200000_wipello_tabellen.sql). Seed de aynı yoldan gidiyor ki
-- her `db reset` köprünün çalıştığını fiilen kanıtlasın.
-- KDV burada ORAN (0.19); portala yüzde (19) olarak geçmesi trigger'ın işi.
insert into public.wipello_quotes (
  quote_number, created_at, status, locale,
  scent, quantity, size, package_type, wipe_type, print_type, print_fee,
  unit_price, product_subtotal, net_total, vat_rate, vat_amount, total, currency,
  customer_name, customer_company, customer_email, customer_phone,
  customer_street, customer_zip, customer_city, customer_country)
values
  ('MND-260805-A1B2C3', now() - interval '2 days', 'approved', 'de',
   'Zitrone', 20000, '6x8', 'triplex', 'normal', 'front', 0,
   0.0700, 1400.00, 1400.00, 0.19, 266.00, 1666.00, 'EUR',
   'Ayşe Demir','Café Mood','info@moodburger.de', null,
   'Georgstr. 5','30159','Hannover','DE'),
  ('MND-260806-D4E5F6', now() - interval '6 hours', 'contacted', 'de',
   'Kolonya', 40000, '7x12', 'kraft', 'normal', 'both', 0,
   0.0700, 2800.00, 2800.00, 0.19, 532.00, 3332.00, 'EUR',
   'Stefan Klein','Hotel Adler','post@adler-hotel.de', null,
   'Bahnhofstr. 2','30159','Hannover','DE');

-- Kabul edilen teklif işe dönüşünce sipariş olur; o adım portalda elle atılıyor.
update public.orders set kind = 'bestellung', status = 'in_produktion'
 where site_id = 'wipello' and external_ref = 'MND-260805-A1B2C3';

-- Yalnızca Kittelwerk'e erişebilen admin — site kısıtının test öznesi.
update public.profiles set site_access = array['kittelwerk']
  where id = '66666666-6666-6666-6666-666666666666';

-- --- kur ---------------------------------------------------------------------
insert into public.exchange_rates (currency, to_currency, rate, valid_from, created_by) values
  ('TRY','EUR', 0.0263, now() - interval '60 days', '22222222-2222-2222-2222-222222222222'),
  ('TRY','EUR', 0.0251, now() - interval '20 days', '22222222-2222-2222-2222-222222222222'),
  ('TRY','EUR', 0.0244, now() -  interval '2 days', '22222222-2222-2222-2222-222222222222');

-- --- yuvarlama: yukarı, tam euro --------------------------------------------
-- WHERE şart: bu satır site süzgeci olmadan Wipello'nun kuruş ayarını da ezer.
update public.pricing_settings set round_to = 1.00, round_mode = 'up', low_margin_threshold = 35
  where site_id = 'kittelwerk';

-- --- siparişler --------------------------------------------------------------
-- 1) Web'den, henüz atölyeye atanmamış → Vertrieb kuyruğunda
insert into public.orders (source, name, company, email, phone, street, plz, city,
                           items, subtotal, shipping_cost, total, status)
values ('web','Klaus Berger','Gasthaus Adler','berger@adler.de','0511 998877',
        'Hauptstr. 1','30159','Hannover',
        '[{"productId":"tshirt","product":"Gastro T-Shirt","color":"Schwarz","sizes":{"M":10,"L":15,"XL":5},"qty":30,"print":"front","unitPrice":14.00,"linePrice":420.00}]'::jsonb,
        420.00, 6.90, 426.90, 'neu');

-- 2) Bayiden, atanmamış
insert into public.orders (source, haendler_id, created_by_profile_id, company, name,
                           street, plz, city, job_name,
                           items, subtotal, discount_amount, total, status)
values ('haendler','b0000000-0000-0000-0000-000000000001','55555555-5555-5555-5555-555555555555',
        'Gastro Meier GmbH','Klaus Meier','Bahnhofstr. 12','30159','Hannover','Sommer-Kollektion',
        '[{"productId":"polo","product":"Polo-Shirt","color":"Weiß","sizes":{"L":20,"XL":20},"qty":40,"print":"bestickung_front","unitPrice":17.00,"linePrice":680.00}]'::jsonb,
        680.00, 122.40, 557.60, 'neu');

-- 3) Atölye Hannover'e atanmış, üretimde
insert into public.orders (source, werkstatt_id, name, company, email,
                           street, plz, city,
                           items, subtotal, shipping_cost, total, status)
values ('web','a0000000-0000-0000-0000-000000000001','Sema Yıldız','Café Dorf','sema@cafedorf.de',
        'Lindener Markt 4','30449','Hannover',
        '[{"productId":"apron","product":"Vorbinder-Schürze","color":"Schwarz","sizes":{"-":25},"qty":25,"print":"front","unitPrice":12.00,"linePrice":300.00},
          {"productId":"cap","product":"Team-Kappe","color":"Schwarz","sizes":{"-":25},"qty":25,"print":"bestickung_front","unitPrice":11.00,"linePrice":275.00}]'::jsonb,
        575.00, 6.90, 581.90, 'in_produktion');

-- 4) Atölye İstanbul'a atanmış — Atölye Hannover bunu GÖREMEMELİ
insert into public.orders (source, werkstatt_id, name, company,
                           street, plz, city,
                           items, subtotal, total, status)
values ('web','a0000000-0000-0000-0000-000000000002','Mehmet Arslan','Restaurant Bosporus',
        'Kurt-Schumacher-Str. 9','30159','Hannover',
        '[{"productId":"sweat","product":"Premium Sweatshirt","color":"Marineblau","sizes":{"L":12},"qty":12,"print":"back","unitPrice":26.00,"linePrice":312.00}]'::jsonb,
        312.00, 318.90, 'in_produktion');

-- 5) Şirketin kendi işi — ödemeye uğramaz
insert into public.orders (source, created_by_profile_id, company, name, city,
                           items, subtotal, total, status, payment_status)
values ('intern','11111111-1111-1111-1111-111111111111','Kittelwerk','Murat','Hannover',
        '[{"productId":"tshirt","product":"Gastro T-Shirt","color":"Rot","sizes":{"L":20},"qty":20,"print":"front","unitPrice":15.00,"linePrice":300.00}]'::jsonb,
        300.00, 300.00, 'neu', 'nicht_erforderlich');

-- --- sipariş yazışması --------------------------------------------------------
insert into public.order_messages (order_id, sender_id, sender_name, audience, message)
select id, '22222222-2222-2222-2222-222222222222', 'Vertrieb', 'werkstatt',
       'Müşteri logoyu koyu zeminde istiyor, baskı öncesi kontrol edin.'
from public.orders where company = 'Café Dorf' limit 1;

