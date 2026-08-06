-- ============================================================================
-- PROVA ORTAMI — canlı Kittelwerk'in GÖÇTEN ÖNCEKİ hâlinin taklidi
--
-- Bu dosya canlıda ASLA çalıştırılmaz. Amacı: göç betiklerini gerçek veriye
-- dokunmadan denemek. Sütunlar canlıdan birebir okundu (2026-08-06);
-- satır dağılımı da canlıdakiyle aynı:
--   profiles 9 = 1 admin + 4 reseller + 2 seller(atölyeli) + 1 seller + 1 verkauf
--   orders 5 (new 1, on_hold 2, cancelled 2), reseller_orders 5 (new 3, cancelled 2)
--   resellers 4, workshops 2, products 5, subscribers 1
-- İçindeki isimler/e-postalar uydurma — gerçek müşteri verisi buraya girmiyor.
-- ============================================================================

-- --- Supabase'in auth şemasının iskeleti -----------------------------------
create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz not null default now()
);

-- Gerçekte Supabase'in GUC'undan gelir; provada NULL döner, RLS testi burada
-- yapılmıyor (onun için ayrı `npm run test:rls` var).
create or replace function auth.uid() returns uuid
language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;


-- --- ESKİ ŞEMA (canlıdaki hâli) --------------------------------------------
create table public.workshops (
  id uuid primary key default gen_random_uuid(),
  name text not null, contact_name text, email text, phone text,
  active boolean default true, created_at timestamptz default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, role text not null, company text,
  created_at timestamptz default now(),
  workshop_id uuid references public.workshops(id)
);

create table public.resellers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id),
  company text not null, contact_name text not null, email text not null,
  phone text, discount_rate numeric not null default 15,
  active boolean not null default true, created_at timestamptz default now(),
  steuer_id text, gewerbe_info text, street text, plz text, city text,
  custom_prices jsonb not null default '{}'::jsonb
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  name text, company text, email text, phone text,
  street text, plz text, city text,
  items jsonb, subtotal numeric, discount_code text, discount_amount numeric,
  shipping_cost numeric, total numeric, status text, created_at timestamptz default now(),
  notes text, logo_url text, workshop_id uuid references public.workshops(id)
);

create table public.reseller_orders (
  id uuid primary key default gen_random_uuid(),
  reseller_id uuid not null references public.resellers(id),
  items jsonb not null, subtotal numeric not null, discount_rate numeric not null,
  discount_amount numeric not null, shipping_cost numeric not null, total numeric not null,
  status text not null, notes text, created_at timestamptz default now(),
  workshop_id uuid references public.workshops(id), job_name text
);

create table public.reseller_applications (
  id uuid primary key default gen_random_uuid(),
  company text, email text, created_at timestamptz default now()
);

create table public.workshop_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(), message text
);

create table public.products (
  id text primary key, name text not null, description text, image text,
  old_price numeric not null, new_price numeric not null, seller_price numeric,
  badge text, colors jsonb not null default '[]'::jsonb,
  has_sizes boolean not null default true, has_back_print boolean not null default false,
  sort_order int not null default 0, active boolean not null default true,
  created_at timestamptz default now()
);

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null, created_at timestamptz default now()
);


-- --- SAHTE VERİ (canlıdaki dağılımla birebir) ------------------------------
insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001','patron@ornek.de'),
  ('10000000-0000-0000-0000-000000000002','bayi1@ornek.de'),
  ('10000000-0000-0000-0000-000000000003','bayi2@ornek.de'),
  ('10000000-0000-0000-0000-000000000004','bayi3@ornek.de'),
  ('10000000-0000-0000-0000-000000000005','bayi4@ornek.de'),
  ('10000000-0000-0000-0000-000000000006','atolye1@ornek.de'),
  ('10000000-0000-0000-0000-000000000007','atolye2@ornek.de'),
  ('10000000-0000-0000-0000-000000000008','satis1@ornek.de'),
  ('10000000-0000-0000-0000-000000000009','satis2@ornek.de');

insert into public.workshops (id, name, contact_name, email) values
  ('20000000-0000-0000-0000-000000000001','Merkez Atölye','Ali Usta','merkez@ornek.de'),
  ('20000000-0000-0000-0000-000000000002','Test Atölye','Veli Usta','test@ornek.de');

insert into public.profiles (id, email, role, company, workshop_id) values
  ('10000000-0000-0000-0000-000000000001','patron@ornek.de','admin','Kittelwerk', null),
  ('10000000-0000-0000-0000-000000000002','bayi1@ornek.de','reseller','Bayi Bir', null),
  ('10000000-0000-0000-0000-000000000003','bayi2@ornek.de','reseller','Bayi İki', null),
  ('10000000-0000-0000-0000-000000000004','bayi3@ornek.de','reseller','Bayi Üç', null),
  ('10000000-0000-0000-0000-000000000005','bayi4@ornek.de','reseller','Bayi Dört', null),
  ('10000000-0000-0000-0000-000000000006','atolye1@ornek.de','seller', null,'20000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000007','atolye2@ornek.de','seller', null,'20000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000008','satis1@ornek.de','seller', null, null),
  ('10000000-0000-0000-0000-000000000009','satis2@ornek.de','verkauf', null, null);

insert into public.resellers (id, profile_id, company, contact_name, email, phone,
                              discount_rate, active, steuer_id, street, plz, city, custom_prices) values
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Bayi Bir','Ahmet Y.','bayi1@ornek.de','+4915100000001',15,true,'DE111111111','Bahnhofstr. 1','30159','Hannover','{}'),
  ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000003','Bayi İki','Berk K.','bayi2@ornek.de','+4915100000002',20,true,'DE222222222','Marktstr. 2','30159','Hannover','{"tshirt":12.5}'),
  ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000004','Bayi Üç','Cem T.','bayi3@ornek.de',null,15,false,null,'Lange Laube 3','30159','Hannover','{}'),
  ('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000005','Bayi Dört','Deniz A.','bayi4@ornek.de','+4915100000004',10,true,'DE444444444','Georgstr. 4','30159','Hannover','{}');

insert into public.orders (name, company, email, phone, street, plz, city, items,
                           subtotal, discount_amount, shipping_cost, total, status, notes, workshop_id, created_at) values
  ('Web Müşteri 1','Gastro Eins','w1@ornek.de','+4915100001001','Weg 1','30159','Hannover',
   '[{"productId":"tshirt","product":"T-Shirt","color":"Schwarz","sizes":{"M":10,"L":10},"qty":20,"print":"dtf","unitPrice":19,"linePrice":380}]',380,0,0,380,'new',null,'20000000-0000-0000-0000-000000000001', now() - interval '80 days'),
  ('Web Müşteri 2','Gastro Zwei','w2@ornek.de',null,'Weg 2','30159','Hannover',
   '[{"productId":"polo","product":"Polo-Shirt","color":"Weiß","sizes":{"L":20},"qty":20,"print":"siebdruck","unitPrice":19,"linePrice":380}]',380,0,6.9,386.90,'on_hold','Acele','20000000-0000-0000-0000-000000000001', now() - interval '60 days'),
  ('Web Müşteri 3','Gastro Drei','w3@ornek.de','+4915100001003','Weg 3','30159','Hannover',
   '[{"productId":"apron","product":"Bistroschürze","color":"Schwarz","sizes":{"-":30},"qty":30,"print":"bestickung","unitPrice":16,"linePrice":480}]',480,20,0,460,'on_hold',null,'20000000-0000-0000-0000-000000000002', now() - interval '40 days'),
  ('Web Müşteri 4','Gastro Vier','w4@ornek.de',null,'Weg 4','30159','Hannover',
   '[{"productId":"cap","product":"Team-Kappe","color":"Schwarz","sizes":{"-":50},"qty":50,"print":"stick","unitPrice":9,"linePrice":450}]',450,0,0,450,'cancelled','İptal edildi','20000000-0000-0000-0000-000000000002', now() - interval '20 days'),
  ('Web Müşteri 5','Gastro Fünf','w5@ornek.de','+4915100001005','Weg 5','30159','Hannover',
   '[{"productId":"sweat","product":"Sweatshirt","color":"Marineblau","sizes":{"XL":15},"qty":15,"print":"dtf","unitPrice":29,"linePrice":435}]',435,0,0,435,'cancelled',null, null, now() - interval '1 day');

insert into public.reseller_orders (reseller_id, items, subtotal, discount_rate, discount_amount,
                                    shipping_cost, total, status, notes, workshop_id, job_name, created_at) values
  ('30000000-0000-0000-0000-000000000001','[{"productId":"tshirt","product":"T-Shirt","color":"Schwarz","sizes":{"M":25},"qty":25,"print":"dtf","unitPrice":15,"linePrice":375}]',375,15,56.25,0,318.75,'new','','20000000-0000-0000-0000-000000000001','Kebab Haus', now() - interval '75 days'),
  ('30000000-0000-0000-0000-000000000001','[{"productId":"polo","product":"Polo-Shirt","color":"Weiß","sizes":{"L":40},"qty":40,"print":"siebdruck","unitPrice":17,"linePrice":680}]',680,15,102,0,578,'cancelled',null,null,'Cafe Nord', now() - interval '55 days'),
  ('30000000-0000-0000-0000-000000000002','[{"productId":"apron","product":"Bistroschürze","color":"Schwarz","sizes":{"-":60},"qty":60,"print":"bestickung","unitPrice":14,"linePrice":840}]',840,20,168,0,672,'new','Logo ortada','20000000-0000-0000-0000-000000000002','Pizzeria Roma', now() - interval '35 days'),
  ('30000000-0000-0000-0000-000000000002','[{"productId":"cap","product":"Team-Kappe","color":"Schwarz","sizes":{"-":100},"qty":100,"print":"stick","unitPrice":8,"linePrice":800}]',800,20,160,0,640,'cancelled',null,null,null, now() - interval '25 days'),
  ('30000000-0000-0000-0000-000000000004','[{"productId":"sweat","product":"Sweatshirt","color":"Schwarz","sizes":{"XL":30},"qty":30,"print":"dtf","unitPrice":25,"linePrice":750}]',750,10,75,0,675,'new',null,'20000000-0000-0000-0000-000000000001','Bistro Süd', now() - interval '5 days');

insert into public.products (id, name, old_price, new_price, seller_price, colors, sort_order) values
  ('tshirt','T-Shirt',24,19,15,'["Schwarz","Weiß"]',1),
  ('sweat','Sweatshirt',39,29,25,'["Schwarz","Marineblau"]',2),
  ('apron','Bistroschürze',19,16,14,'["Schwarz"]',3),
  ('cap','Team-Kappe',12,9,8,'["Schwarz"]',4),
  ('latz','Latzschürze',22,18,16,'["Schwarz"]',5);

insert into public.subscribers (email) values ('bulten@ornek.de');
