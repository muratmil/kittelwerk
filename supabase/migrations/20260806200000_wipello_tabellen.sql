-- ============================================================================
-- WIPELLO TEK VERİTABANINA GEÇİYOR
--
-- Wipello'nun kendi Supabase'inde üç tablosu vardı: quotes, pricing_settings,
-- sponsor_requests. Üçü de buraya taşınıyor ki iki ayrı veritabanı kalmasın.
--
-- Hepsi `wipello_` önekiyle duruyor: portalın ZATEN `pricing_settings` adlı
-- bambaşka bir tablosu var (site başına yuvarlama kuralları). Önek olmasa
-- `create table if not exists` sessizce atlar, Wipello'nun fiyat paneli de
-- canlıda "column id does not exist" ile kırılırdı. Ayrı bir şema da olurdu
-- ama canlıda "Exposed schemas" ayarı unutulunca her istek 404 verir.
--
-- Fiyat YÖNETİMİ yine Wipello'nun kendi panelinde (sites.manages_pricing=false).
-- Burada duran şey sadece o panelin yazdığı satır; portal ona karışmıyor.
--
-- Köprü: quotes'a düşen her teklif, trigger ile orders'a `site_id='wipello'`,
-- `kind='angebot'` olarak yazılır. Uygulama kodu değil veritabanı yaptığı için
-- ağ hatası, yarı yazılmış kayıt ya da "portal erişilemedi" hâli yok.
-- ============================================================================

create extension if not exists "pgcrypto";


-- ============================================================================
-- 1) TEKLİFLER — Wipello'nun altı göçünün birleşmiş son hâli
-- ============================================================================
create table if not exists public.wipello_quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique default (
    'MND-' || to_char(now(), 'YYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
  ),
  created_at timestamptz not null default now(),
  status text not null default 'draft'
    check (status in ('draft', 'contacted', 'approved', 'cancelled')),
  locale text not null default 'tr',

  -- Ürün yapılandırması
  scent text,
  quantity integer not null check (quantity >= 10000),
  size text not null,
  package_type text not null,
  wipe_type text not null,
  print_type text,
  print_fee numeric(12, 2) not null default 0,

  -- Tutarlar. DİKKAT: vat_rate burada ORAN (0.19), orders tablosunda YÜZDE (19).
  unit_price numeric(12, 4) not null check (unit_price >= 0),
  product_subtotal numeric(14, 2) not null default 0 check (product_subtotal >= 0),
  net_total numeric(14, 2) not null check (net_total >= 0),
  vat_rate numeric(5, 4) not null check (vat_rate >= 0),
  vat_amount numeric(14, 2) not null default 0 check (vat_amount >= 0),
  total numeric(14, 2) not null check (total >= 0),
  currency text not null default 'EUR',

  -- Müşteri
  customer_name text not null,
  customer_company text not null,
  customer_email text not null,
  customer_phone text,
  customer_street text not null,
  customer_zip text not null,
  customer_city text not null,
  customer_country text not null,
  customer_vat_id text,
  customer_note text,

  ip_hash text,

  constraint wipello_quotes_customer_name_len check (char_length(customer_name) between 2 and 80),
  constraint wipello_quotes_customer_email_len check (char_length(customer_email) between 5 and 160),
  constraint wipello_quotes_customer_company_len check (char_length(customer_company) <= 120),
  constraint wipello_quotes_customer_phone_len check (customer_phone is null or char_length(customer_phone) <= 40),
  constraint wipello_quotes_customer_note_len check (customer_note is null or char_length(customer_note) <= 800),
  constraint wipello_quotes_customer_street_len check (char_length(customer_street) between 2 and 120),
  constraint wipello_quotes_customer_zip_len check (char_length(customer_zip) between 1 and 12),
  constraint wipello_quotes_customer_city_len check (char_length(customer_city) between 1 and 80),
  constraint wipello_quotes_customer_country_len check (char_length(customer_country) between 2 and 60),
  constraint wipello_quotes_customer_vat_id_len check (customer_vat_id is null or char_length(customer_vat_id) between 4 and 20)
);

alter table public.wipello_quotes enable row level security;

create index if not exists wipello_quotes_created_at_idx on public.wipello_quotes (created_at desc);
create index if not exists wipello_quotes_ip_hash_created_at_idx on public.wipello_quotes (ip_hash, created_at desc);

comment on table public.wipello_quotes is
  'Wipello ürün yapılandırıcısından gelen teklifler. Trigger ile orders''a yansır.';


-- ============================================================================
-- 2) FİYAT AYARLARI — tek satır (id = 'default'), çarpan bazlı Wipello modeli
-- ============================================================================
create table if not exists public.wipello_pricing_settings (
  id text primary key,
  settings jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.wipello_pricing_settings enable row level security;

comment on table public.wipello_pricing_settings is
  'Wipello''nun kendi fiyat motoru (maliyet₺ × çarpan ÷ kur). Portal buna karışmaz.';


-- ============================================================================
-- 3) SPONSORLUK TALEPLERİ — fiyatı elle verildiği için orders''a yansımaz
-- ============================================================================
create table if not exists public.wipello_sponsor_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique default (
    'SPN-' || to_char(now(), 'YYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
  ),
  created_at timestamptz not null default now(),
  status text not null default 'draft'
    check (status in ('draft', 'contacted', 'approved', 'cancelled')),
  locale text not null,

  role text not null check (role in ('sponsor', 'venue')),

  company text not null,
  contact_name text not null,
  email text not null,
  phone text,
  city text,

  size text not null default '8x13',
  venue_count integer check (venue_count is null or venue_count between 4 and 100),
  per_venue_quantity integer check (per_venue_quantity is null or per_venue_quantity >= 5000),
  quantity integer check (quantity is null or quantity >= 20000),
  partner_note text,
  message text,

  ip_hash text
);

alter table public.wipello_sponsor_requests enable row level security;

create index if not exists wipello_sponsor_requests_created_at_idx
  on public.wipello_sponsor_requests (created_at desc);

comment on table public.wipello_sponsor_requests is
  'Wipello sponsorluk talepleri: mendilin bir yüzü işletme, diğer yüzü sponsor.';


-- ============================================================================
-- 4) KÖPRÜ — quotes ➜ orders
--
-- Neden SECURITY DEFINER: teklifi yazan rol (service_role) orders üzerinde
-- yetkili olsa da, ileride başka bir rol yazarsa köprü sessizce kopmasın.
-- ============================================================================
create or replace function public.wipello_quote_to_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_status   text;
  v_vat_rate numeric;
begin
  v_status := case lower(coalesce(new.status, ''))
    when 'draft'     then 'angebot_offen'
    when 'contacted' then 'angebot_kontaktiert'
    when 'approved'  then 'angebot_angenommen'
    when 'cancelled' then 'angebot_abgelehnt'
    -- Bilinmeyen her değer açık teklif sayılır; kayıt kaybolmasın.
    else 'angebot_offen'
  end;

  -- Wipello oran tutuyor (0.19), portal yüzde gösteriyor ("MwSt. 19 %").
  v_vat_rate := case
    when coalesce(new.vat_rate, 0) <= 1 then coalesce(new.vat_rate, 0) * 100
    else new.vat_rate
  end;

  -- Önce ekle. Kayıt zaten varsa (güncelleme ya da tekrar) hiçbir şey olmaz.
  insert into public.orders (
    site_id, kind, source, external_ref, status,
    name, company, email, phone, street, plz, city, country, vat_id,
    locale, notes, items,
    subtotal, net_total, vat_rate, vat_amount, total, currency, created_at
  ) values (
    'wipello', 'angebot', 'web', new.quote_number, v_status,
    new.customer_name, new.customer_company, new.customer_email, new.customer_phone,
    new.customer_street, new.customer_zip, new.customer_city, new.customer_country,
    new.customer_vat_id, new.locale, new.customer_note,
    -- Wipello'da tek satırlık yapılandırma var; portalın çok kalemli `items`
    -- biçimine tek kalem olarak yazılıyor. Koku/ölçü/ambalaj korunuyor.
    jsonb_build_array(jsonb_build_object(
      'productId', coalesce(new.wipe_type, 'feuchttuch'),
      'product',   concat_ws(' · ', nullif(new.wipe_type, ''), nullif(new.package_type, '')),
      'scent',     new.scent,
      'size',      new.size,
      'package',   new.package_type,
      'print',     coalesce(new.print_type, 'none'),
      'printFee',  coalesce(new.print_fee, 0),
      'qty',       new.quantity,
      'sizes',     jsonb_build_object('-', new.quantity),
      'unitPrice', new.unit_price,
      'linePrice', coalesce(nullif(new.product_subtotal, 0), new.unit_price * new.quantity)
    )),
    coalesce(nullif(new.product_subtotal, 0), new.net_total, 0),
    new.net_total, v_vat_rate, new.vat_amount, new.total,
    coalesce(new.currency, 'EUR'), new.created_at
  )
  on conflict (site_id, external_ref) where external_ref is not null do nothing;

  -- Sonra güncelle: Wipello panelinde durum değişince portal de değişsin.
  --
  -- Ama durum yalnızca teklif çemberindeyken Wipello'nun malı. Teklif portalda
  -- işe dönüştürüldüyse (in_produktion, versandt…) Wipello'da "Onaylandı"ya
  -- basmak üretimdeki işi teklife geri çeviremez — iş kaybolurdu.
  update public.orders
     set name = new.customer_name, company = new.customer_company,
         email = new.customer_email, phone = new.customer_phone,
         notes = new.customer_note,
         status = case when status like 'angebot%' then v_status else status end
   where site_id = 'wipello' and external_ref = new.quote_number;

  return null;
end;
$fn$;

drop trigger if exists wipello_quotes_nach_orders on public.wipello_quotes;
create trigger wipello_quotes_nach_orders
  after insert or update on public.wipello_quotes
  for each row execute function public.wipello_quote_to_order();


-- ============================================================================
-- 5) YETKİLER
--
-- Supabase artık public şemadaki yeni tablolara otomatik GRANT vermiyor —
-- ne authenticated'a ne service_role'e. wipello.com yalnız service_role ile
-- bağlanıyor; unutulursa her istek sessizce "permission denied" alır.
-- anon ve authenticated'a bilerek yetki VERİLMİYOR: teklifler müşteri verisi,
-- portal onları orders üzerinden ve kendi RLS'i ile gösteriyor.
-- ============================================================================
grant select, insert, update, delete on public.wipello_quotes           to service_role;
grant select, insert, update, delete on public.wipello_pricing_settings to service_role;
grant select, insert, update, delete on public.wipello_sponsor_requests to service_role;
