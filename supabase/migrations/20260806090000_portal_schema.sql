-- ============================================================================
-- Kittelwerk Portal — birleşik şema
-- Tasarım belgesi v1 (5 Ağustos 2026) karşılığı.
--
-- Beş rol tek profiles tablosunda, tek orders tablosu, fiyat/maliyet/kur
-- veritabanında, parasız üretim görünümü ve RLS.
-- ============================================================================

-- Yardımcı fonksiyonlar (get_my_role, has_permission …) profiles tablosuna
-- baktığı için bölüm 11'de, tablolar kurulduktan sonra tanımlanıyor.

-- ---------------------------------------------------------------------------
-- 2. ATÖLYELER
-- ---------------------------------------------------------------------------

create table if not exists public.werkstaetten (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  contact_name  text,
  email         text,
  phone         text,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. PROFİLLER — beş rol + owner rütbesi + yetki kutucukları
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  role          text not null default 'kunde'
                  check (role in ('owner','admin','vertrieb','haendler','werkstatt','kunde')),
  is_owner      boolean not null default false,
  permissions   text[] not null default '{}',
  created_by    uuid references public.profiles(id) on delete set null,
  werkstatt_id  uuid references public.werkstaetten(id) on delete set null,
  company       text,
  created_at    timestamptz not null default now(),

  -- werkstatt rolündeki herkesin bir atölyesi olmalı; "atölyesi yok" durumu
  -- eskiden sessizce "merkez" anlamına geliyordu ve kaza kaynağıydı.
  constraint werkstatt_needs_werkstatt
    check (role <> 'werkstatt' or werkstatt_id is not null)
);

-- Sistemde en fazla bir owner olabilir — yapısal garanti, koda güvenmiyoruz.
create unique index if not exists profiles_single_owner
  on public.profiles (is_owner) where is_owner;

create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- 4. BAYİLER
-- ---------------------------------------------------------------------------

create table if not exists public.haendler (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid unique references public.profiles(id) on delete cascade,
  company        text not null,
  contact_name   text,
  email          text,
  phone          text,
  street         text,
  plz            text,
  city           text,
  steuer_id      text,
  gewerbe_info   text,
  discount_rate  numeric(5,2) not null default 15,
  custom_prices  jsonb,
  active         boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. DÖVİZ KURU — üzerine yazılmaz, her değişiklik yeni satır
-- ---------------------------------------------------------------------------

create table if not exists public.exchange_rates (
  id           uuid primary key default gen_random_uuid(),
  currency     text not null,                     -- kaynak para birimi (TRY, USD…)
  to_currency  text not null default 'EUR',
  rate         numeric(12,6) not null check (rate > 0),
  valid_from   timestamptz not null default now(),
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists exchange_rates_lookup
  on public.exchange_rates (currency, to_currency, valid_from desc);

-- Bir para biriminin belirli bir andaki kuru. Geçmiş sipariş hesabı için şart.
create or replace function public.rate_at(p_currency text, p_when timestamptz default now())
returns numeric language sql stable as $$
  select case when p_currency = 'EUR' then 1::numeric else (
    select rate from public.exchange_rates
    where currency = p_currency and to_currency = 'EUR' and valid_from <= p_when
    order by valid_from desc limit 1
  ) end
$$;

-- ---------------------------------------------------------------------------
-- 6. ÜRÜNLER VE FİYATLAR — koddan veritabanına
-- ---------------------------------------------------------------------------

create table if not exists public.products (
  id               text primary key,              -- 'tshirt', 'polo' … kodla aynı
  name             text not null,
  category         text not null check (category in ('bekleidung','schuerzen','accessoires')),
  active           boolean not null default true,
  coming_soon      boolean not null default false,
  sort_order       int not null default 0,

  cost_price       numeric(10,4),                 -- alış fiyatı
  cost_currency    text not null default 'TRY',   -- standart TL, gerektiğinde USD/EUR

  price_mode       text not null default 'manuell'
                     check (price_mode in ('manuell','marge')),
  margin_override  numeric(5,2),                  -- boşsa kategori/genel marj

  min_qty          int not null default 10,
  updated_at       timestamptz not null default now()
);

-- Kademeli fiyatlar (Staffelpreise). manuell modda elle girilir,
-- marge modunda hesaplanır — her iki durumda da satır burada durur.
create table if not exists public.product_prices (
  product_id    text not null references public.products(id) on delete cascade,
  min_qty       int  not null,
  price         numeric(10,2),                    -- elle girilen satış fiyatı
  margin        numeric(5,2),                     -- bu kademenin marjı (marge modu)
  primary key (product_id, min_qty)
);

-- Marj varsayılanları: ürün marjı → kategori marjı → genel marj.
-- Kademe sayısı sabit değil; Kittelwerk'te altı kademe var, Wipello'da dört.
-- Tek marj tüm kademelere uygulanırsa hacim indirimi çöker, o yüzden
-- marj kademe başına tanımlanıyor.
create table if not exists public.margin_defaults (
  scope     text not null,                        -- 'global' veya kategori adı
  min_qty   int  not null,
  margin    numeric(5,2) not null,
  primary key (scope, min_qty)
);

-- Yuvarlama proje başına ayarlanabilir olmalı: Kittelwerk'te tam euro yukarı,
-- Wipello'da kuruş seviyesi — aynı kural ikisinde de çalışmaz.
create table if not exists public.pricing_settings (
  id            boolean primary key default true check (id),
  round_to      numeric(10,4) not null default 1.00,   -- 1.00 = tam euro
  round_mode    text not null default 'up' check (round_mode in ('up','nearest','down')),
  low_margin_threshold numeric(5,2) not null default 35.00,
  updated_at    timestamptz not null default now()
);

insert into public.pricing_settings (id) values (true) on conflict do nothing;

create or replace function public.apply_rounding(p_value numeric)
returns numeric language sql stable as $$
  select case (select round_mode from public.pricing_settings where id)
    when 'up'      then ceil (p_value / s.round_to) * s.round_to
    when 'down'    then floor(p_value / s.round_to) * s.round_to
    else                round(p_value / s.round_to) * s.round_to
  end
  from public.pricing_settings s where s.id
$$;

-- ---------------------------------------------------------------------------
-- 7. BEKLEYEN FİYAT DEĞİŞİKLİKLERİ
--    Vertrieb maliyeti/kuru günceller; marj modundaki ürünlerde bu vitrin
--    fiyatını değiştireceği için önce onaya düşer.
-- ---------------------------------------------------------------------------

create table if not exists public.price_changes (
  id            uuid primary key default gen_random_uuid(),
  change_type   text not null check (change_type in ('cost','fx')),
  product_id    text references public.products(id) on delete cascade,
  currency      text,
  old_value     numeric(12,6),
  new_value     numeric(12,6) not null,
  status        text not null default 'pending'
                  check (status in ('pending','approved','rejected')),
  requested_by  uuid references public.profiles(id) on delete set null,
  decided_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  decided_at    timestamptz
);

create index if not exists price_changes_pending
  on public.price_changes (status) where status = 'pending';

-- ---------------------------------------------------------------------------
-- 8. SİPARİŞLER — tek tablo
-- ---------------------------------------------------------------------------

create sequence if not exists public.order_no_seq start 1000;

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  order_no      int  not null unique default nextval('public.order_no_seq'),

  source        text not null check (source in ('web','haendler','kunde','intern')),
  haendler_id   uuid references public.haendler(id)   on delete set null,
  kunde_id      uuid references public.profiles(id)   on delete set null,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  werkstatt_id  uuid references public.werkstaetten(id) on delete set null,

  -- müşteri bilgisi: misafir siparişte inline, hesaplı siparişte de kopyalanır
  name      text, company text, email text, phone text,
  street    text, plz text, city text,

  items         jsonb not null,     -- sipariş anında DONDURULMUŞ
  subtotal        numeric(10,2) not null default 0,
  discount_code   text,
  discount_amount numeric(10,2) not null default 0,
  shipping_cost   numeric(10,2) not null default 0,
  total           numeric(10,2) not null default 0,

  -- maliyet anlık görüntüsü: kur sonradan değişse de bu sipariş bozulmaz
  cost_total    numeric(10,2),
  fx_snapshot   jsonb,

  status        text not null default 'neu'
                  check (status in ('neu','in_produktion','pausiert','versandt','abgeschlossen','storniert')),

  -- Stripe için ayrılmış yer — bugün her sipariş 'nicht_erforderlich'
  payment_status   text not null default 'nicht_erforderlich'
                     check (payment_status in ('nicht_erforderlich','offen','bezahlt','erstattet')),
  payment_provider text,
  payment_ref      text,

  job_name      text,
  notes         text,
  logo_url      text,
  created_at    timestamptz not null default now(),

  -- kaynak ile sahip alanı tutarlı olsun
  constraint haendler_source_consistent
    check ((source = 'haendler') = (haendler_id is not null))
);

create index if not exists orders_queue_idx  on public.orders (created_at desc) where werkstatt_id is null;
create index if not exists orders_werkstatt_idx on public.orders (werkstatt_id);
create index if not exists orders_haendler_idx  on public.orders (haendler_id);
create index if not exists orders_kunde_idx     on public.orders (kunde_id);

-- ---------------------------------------------------------------------------
-- 9. SİPARİŞ YAZIŞMASI — Vertrieb'in "köprü" görevi
-- ---------------------------------------------------------------------------

create table if not exists public.order_messages (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  sender_id   uuid references public.profiles(id) on delete set null,
  sender_name text,
  audience    text not null default 'werkstatt'
                check (audience in ('werkstatt','kunde','intern')),
  message     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists order_messages_order on public.order_messages (order_id, created_at);

-- ---------------------------------------------------------------------------
-- 10. İZ KAYDI
-- ---------------------------------------------------------------------------

create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  target_type text,
  target_id   text,
  detail      jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists audit_log_time on public.audit_log (created_at desc);

-- ---------------------------------------------------------------------------
-- 11. YARDIMCI FONKSİYONLAR
--     RLS politikaları profiles'a bakacağı için bunlar SECURITY DEFINER olmalı,
--     yoksa politika kendi tablosunu sorgularken sonsuz döngüye girer.
-- ---------------------------------------------------------------------------

create or replace function public.get_my_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.get_my_werkstatt_id()
returns uuid language sql stable security definer set search_path = public as $$
  select werkstatt_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_owner from public.profiles where id = auth.uid()), false)
$$;

-- Owner her yetkiye sahiptir; admin yalnızca kutucuğu işaretliyse.
create or replace function public.has_permission(perm text)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((
    select p.is_owner or (p.role = 'admin' and perm = any(p.permissions))
    from public.profiles p where p.id = auth.uid()
  ), false)
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((
    select role in ('owner','admin') or is_owner
    from public.profiles where id = auth.uid()
  ), false)
$$;

-- RLS politika ifadeleri sorguyu yapan rolün haklarıyla çalışır, dolayısıyla
-- `authenticated` bu fonksiyonları çalıştırabilmeli — yoksa her politika
-- "permission denied" ile patlar. Zararsız: hepsi yalnızca auth.uid()'in
-- KENDİ bilgisini döndürür, kullanıcı zaten kendi rolünü bilir.
-- anon'un ise hiçbirine ihtiyacı yok.
revoke execute on function public.get_my_role()         from anon;
revoke execute on function public.get_my_werkstatt_id() from anon;
revoke execute on function public.is_owner()            from anon;
revoke execute on function public.has_permission(text)  from anon;
revoke execute on function public.is_staff()            from anon;

-- ---------------------------------------------------------------------------
-- 11b. PARASIZ ÜRETİM GÖRÜNÜMÜ
--     Vertrieb ve Werkstatt yalnızca bunu okur. Para sütunları yok; items
--     içindeki birim fiyatlar da temizleniyor — asıl tuzak orası.
-- ---------------------------------------------------------------------------

-- DİKKAT: bu görünüm bilerek SECURITY DEFINER (security_invoker = false).
-- Sebebi: Supabase'de herkes aynı `authenticated` rolüyle bağlanır, dolayısıyla
-- sütun bazlı yetki (grant select (col)) ile Vertrieb'i Admin'den ayıramayız.
-- Görünüm security_invoker olsaydı, Vertrieb'in orders üzerinde bir RLS
-- politikası olması gerekirdi — o politika da `select * from orders` demesine
-- ve fiyatları görmesine izin verirdi. Bu yüzden Vertrieb ve Werkstatt'ın
-- orders tablosunda HİÇ politikası yok; erişimleri yalnızca bu görünümden ve
-- satır süzgeci aşağıdaki where içinde.
create or replace view public.orders_produktion
with (security_invoker = false) as
select
  o.id, o.order_no, o.source, o.status, o.werkstatt_id, o.haendler_id,
  o.name, o.company, o.email, o.phone, o.street, o.plz, o.city,
  o.job_name, o.notes, o.logo_url, o.created_at,
  (
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'product', it->>'product',
        'productId', it->>'productId',
        'color',   it->>'color',
        'sizes',   it->'sizes',
        'qty',     it->'qty',
        'print',   it->>'print'
      )
    ), '[]'::jsonb)
    from jsonb_array_elements(o.items) it
  ) as items
from public.orders o
where
     public.get_my_role() = 'vertrieb'
  or (o.werkstatt_id is not null and o.werkstatt_id = public.get_my_werkstatt_id())
  or public.is_staff();

revoke all on public.orders_produktion from anon;
grant select on public.orders_produktion to authenticated;

-- ---------------------------------------------------------------------------
-- 12. RLS
--     Gerçek sınır burası. Arayüzdeki kutucuklar yalnızca ekranı düzenler.
-- ---------------------------------------------------------------------------

alter table public.profiles       enable row level security;
alter table public.werkstaetten   enable row level security;
alter table public.haendler       enable row level security;
alter table public.orders         enable row level security;
alter table public.order_messages enable row level security;
alter table public.products       enable row level security;
alter table public.product_prices enable row level security;
alter table public.margin_defaults    enable row level security;
alter table public.pricing_settings   enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.price_changes  enable row level security;
alter table public.audit_log      enable row level security;

-- Tablo yetkileri açıkça veriliyor — Supabase artık public şemadaki yeni
-- tablolara otomatik GRANT uygulamıyor. GRANT "deneme hakkı", hangi SATIRIN
-- görüneceğine RLS karar verir. Vertrieb'in orders üzerinde politikası
-- olmadığı için GRANT'i olsa da sıfır satır görür.
grant select on public.products, public.product_prices to anon, authenticated;

grant select on
  public.profiles, public.werkstaetten, public.haendler, public.orders,
  public.order_messages, public.exchange_rates, public.price_changes,
  public.audit_log, public.margin_defaults, public.pricing_settings
  to authenticated;

grant insert on public.order_messages, public.exchange_rates, public.price_changes
  to authenticated;
grant update on public.profiles, public.price_changes to authenticated;
grant insert, update, delete on
  public.products, public.product_prices, public.margin_defaults, public.pricing_settings
  to authenticated;

-- orders'a INSERT/UPDATE bilerek verilmedi: sipariş yazma ve durum değişikliği
-- sunucu tarafındaki API uçlarından (service role) geçer.

-- service_role RLS'i atlar ama tablo yetkisi yine de gerekiyor; Supabase artık
-- bunu da otomatik vermiyor. Bu satır olmadan bütün yönetim API'leri
-- "permission denied" alır.
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated;

-- --- profiles ---------------------------------------------------------------
create policy profiles_self_read on public.profiles
  for select to authenticated using (id = auth.uid());

create policy profiles_staff_read on public.profiles
  for select to authenticated using (public.is_staff());

create policy profiles_self_update on public.profiles
  for update to authenticated using (id = auth.uid())
  with check (id = auth.uid());

-- Rol/yetki değişikliği ve hesap silme yalnızca sunucu tarafından
-- (service role) yapılır; kural motoru API katmanında.

-- --- werkstaetten -----------------------------------------------------------
create policy werkstaetten_read on public.werkstaetten
  for select to authenticated
  using (public.is_staff() or public.get_my_role() = 'vertrieb' or id = public.get_my_werkstatt_id());

-- --- haendler ---------------------------------------------------------------
create policy haendler_own on public.haendler
  for select to authenticated using (profile_id = auth.uid());

-- Vertrieb bayinin varlığını görür ama iskonto oranı ona kapalı;
-- sütun kısıtı API katmanında, satır kısıtı burada.
create policy haendler_staff on public.haendler
  for select to authenticated
  using (public.is_owner() or (public.get_my_role() = 'admin' and public.has_permission('haendler_konditionen')));

-- --- orders -----------------------------------------------------------------
create policy orders_owner_admin on public.orders
  for select to authenticated
  using (public.is_owner() or (public.get_my_role() = 'admin' and public.has_permission('alle_bestellungen')));

create policy orders_haendler_own on public.orders
  for select to authenticated
  using (haendler_id in (select id from public.haendler where profile_id = auth.uid()));

create policy orders_kunde_own on public.orders
  for select to authenticated using (kunde_id = auth.uid());

-- Vertrieb ve Werkstatt için BİLEREK politika yok. orders tablosuna hiç
-- erişemezler; yalnızca parasız orders_produktion görünümünü okurlar.
-- Bir politika eklenirse fiyatlar da açılmış olur.

-- --- order_messages ---------------------------------------------------------
create policy order_messages_read on public.order_messages
  for select to authenticated
  using (
    public.is_staff()
    or public.get_my_role() = 'vertrieb'
    or exists (select 1 from public.orders o
               where o.id = order_id and o.werkstatt_id = public.get_my_werkstatt_id())
  );

create policy order_messages_write on public.order_messages
  for insert to authenticated
  with check (
    public.is_staff()
    or public.get_my_role() = 'vertrieb'
    or exists (select 1 from public.orders o
               where o.id = order_id and o.werkstatt_id = public.get_my_werkstatt_id())
  );

-- --- ürünler ve fiyatlar ----------------------------------------------------
-- Katalog herkese açık (vitrin okur), fiyat düzenleme yetkiye bağlı.
create policy products_public_read on public.products for select to anon, authenticated using (true);
create policy product_prices_public_read on public.product_prices for select to anon, authenticated using (true);

create policy products_write on public.products
  for all to authenticated
  using (public.has_permission('preise_pflegen')) with check (public.has_permission('preise_pflegen'));

create policy product_prices_write on public.product_prices
  for all to authenticated
  using (public.has_permission('preise_pflegen')) with check (public.has_permission('preise_pflegen'));

create policy margin_defaults_rw on public.margin_defaults
  for all to authenticated
  using (public.has_permission('preise_pflegen')) with check (public.has_permission('preise_pflegen'));

create policy pricing_settings_read on public.pricing_settings
  for select to authenticated using (true);

create policy pricing_settings_write on public.pricing_settings
  for all to authenticated
  using (public.has_permission('preise_pflegen')) with check (public.has_permission('preise_pflegen'));

-- --- kur --------------------------------------------------------------------
-- Vertrieb kuru okur ve YENİ SATIR ekler; güncelleme/silme kimseye açık değil.
create policy exchange_rates_read on public.exchange_rates
  for select to authenticated
  using (public.is_staff() or public.get_my_role() = 'vertrieb');

create policy exchange_rates_insert on public.exchange_rates
  for insert to authenticated
  with check (public.get_my_role() = 'vertrieb' or public.has_permission('preise_pflegen'));

-- --- bekleyen fiyat değişiklikleri -----------------------------------------
create policy price_changes_read on public.price_changes
  for select to authenticated
  using (public.is_staff() or public.get_my_role() = 'vertrieb');

create policy price_changes_insert on public.price_changes
  for insert to authenticated
  with check (public.get_my_role() = 'vertrieb' or public.has_permission('preise_pflegen'));

create policy price_changes_decide on public.price_changes
  for update to authenticated
  using (public.has_permission('preise_pflegen')) with check (public.has_permission('preise_pflegen'));

-- --- iz kaydı ---------------------------------------------------------------
create policy audit_log_read on public.audit_log
  for select to authenticated using (public.is_owner());

-- ---------------------------------------------------------------------------
-- 13. YENİ KULLANICI → PROFİL
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
