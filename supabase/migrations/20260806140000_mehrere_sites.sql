-- ============================================================================
-- Çok siteli portal
--
-- Tek admin, birden çok site. Kittelwerk ve Wipello aynı veritabanında,
-- aynı oturumla yönetiliyor; siparişler tek listede toplanıyor.
--
-- Siteye BAĞLI olanlar : ürünler, fiyatlar, siparişler, marj varsayılanları
-- Siteler ARASI ortak   : kullanıcılar, atölyeler, bayiler, kur, iz kaydı
--   (atölye ve kur ortak, çünkü üretim ve döviz siteden bağımsız)
-- ============================================================================

create table if not exists public.sites (
  id          text primary key,               -- 'kittelwerk', 'wipello'
  name        text not null,
  domain      text,
  currency    text not null default 'EUR',
  -- Geçiş dönemi: sitenin henüz portala taşınmamış kendi paneli.
  admin_url   text,
  active      boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

insert into public.sites (id, name, domain, sort_order) values
  ('kittelwerk', 'Kittelwerk', 'www.kittelwerk.de', 0)
on conflict (id) do nothing;

-- --- siteye bağlı tablolar ---------------------------------------------------
alter table public.products
  add column if not exists site_id text not null default 'kittelwerk'
    references public.sites(id) on update cascade;

alter table public.orders
  add column if not exists site_id text not null default 'kittelwerk'
    references public.sites(id) on update cascade;

alter table public.margin_defaults
  add column if not exists site_id text not null default 'kittelwerk'
    references public.sites(id) on update cascade;

create index if not exists products_site_idx on public.products (site_id);
create index if not exists orders_site_idx   on public.orders (site_id);

-- Ürün kimlikleri yalnızca kendi sitesi içinde tekil olmalı: Wipello'da da
-- 'kraft' diye bir ürün olabilir, Kittelwerk'inkiyle çakışmasın.
alter table public.products drop constraint if exists products_pkey cascade;
alter table public.products add primary key (site_id, id);

alter table public.product_prices
  add column if not exists site_id text not null default 'kittelwerk';
alter table public.product_prices drop constraint if exists product_prices_pkey cascade;
alter table public.product_prices drop constraint if exists product_prices_product_id_fkey;
alter table public.product_prices add primary key (site_id, product_id, min_qty);
alter table public.product_prices
  add constraint product_prices_product_fkey
  foreign key (site_id, product_id) references public.products (site_id, id) on delete cascade;

-- margin_defaults de site başına
alter table public.margin_defaults drop constraint if exists margin_defaults_pkey cascade;
alter table public.margin_defaults add primary key (site_id, scope, min_qty);

-- --- yuvarlama artık site başına ---------------------------------------------
-- Kittelwerk'te yukarı/tam euro doğru; Wipello'da kuruş altı birim fiyatları
-- tam euroya yuvarlamak fiyatı on iki katına çıkarırdı. Aynı kural ikisinde
-- de çalışmıyor, bu yüzden ayar siteye bağlandı.
alter table public.pricing_settings
  add column if not exists site_id text references public.sites(id) on update cascade;

update public.pricing_settings set site_id = 'kittelwerk' where site_id is null;

alter table public.pricing_settings drop constraint if exists pricing_settings_pkey cascade;
alter table public.pricing_settings drop column if exists id;
alter table public.pricing_settings alter column site_id set not null;
alter table public.pricing_settings add primary key (site_id);

-- pricing_settings artık site başına, eski tek satırlı imza geçersiz kaldı.
drop function if exists public.apply_rounding(numeric);

create or replace function public.apply_rounding(p_site text, p_value numeric)
returns numeric language sql stable as $$
  select case s.round_mode
    when 'up'   then ceil (p_value / s.round_to) * s.round_to
    when 'down' then floor(p_value / s.round_to) * s.round_to
    else              round(p_value / s.round_to) * s.round_to
  end
  from public.pricing_settings s where s.site_id = p_site
$$;

-- --- kimin hangi siteye erişimi var ------------------------------------------
-- Boş dizi = tüm siteler (owner ve site kısıtı olmayan admin).
alter table public.profiles
  add column if not exists site_access text[] not null default '{}';

create or replace function public.my_sites()
returns text[] language sql stable security definer set search_path = public as $$
  select coalesce((select site_access from public.profiles where id = auth.uid()), '{}')
$$;

revoke execute on function public.my_sites() from anon;

create or replace function public.can_see_site(p_site text)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((
    select p.is_owner
        or cardinality(p.site_access) = 0
        or p_site = any(p.site_access)
    from public.profiles p where p.id = auth.uid()
  ), false)
$$;

revoke execute on function public.can_see_site(text) from anon;

-- --- RLS: site erişimi her yerde ek koşul ------------------------------------
drop policy if exists orders_owner_admin on public.orders;
create policy orders_owner_admin on public.orders
  for select to authenticated
  using (
    public.can_see_site(site_id)
    and (public.is_owner() or (public.get_my_role() = 'admin' and public.has_permission('alle_bestellungen')))
  );

-- Bayi ve müşteri kendi siparişini her sitede görür — site kısıtı personel içindir.

-- --- parasız üretim görünümü de site bilsin ----------------------------------
-- `create or replace view` var olan sütunların arasına yenisini ekleyemiyor
-- ("cannot change name of view column"), o yüzden önce düşürülüyor.
drop view if exists public.orders_produktion;

create view public.orders_produktion
with (security_invoker = false) as
select
  o.id, o.order_no, o.site_id, o.source, o.status, o.werkstatt_id, o.haendler_id,
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
  (
       public.get_my_role() = 'vertrieb'
    or (o.werkstatt_id is not null and o.werkstatt_id = public.get_my_werkstatt_id())
    or public.is_staff()
  )
  and public.can_see_site(o.site_id);

revoke all on public.orders_produktion from anon;
grant select on public.orders_produktion to authenticated;

-- --- yetkiler -----------------------------------------------------------------
grant select on public.sites to anon, authenticated;
grant all on public.sites to service_role;
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
