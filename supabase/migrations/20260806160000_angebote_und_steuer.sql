-- ============================================================================
-- Teklifler (Angebote) ve KDV
--
-- Wipello'nun `quotes` tablosu buraya taşınacak. Teklif ile sipariş aynı
-- tabloda duruyor çünkü ikisi de "gelen iş talebi" — Kittelwerk'in web
-- siparişleri de zaten "Bestellanfrage". Ayrımı `kind` sütunu taşıyor.
--
-- Wipello KDV'yi ayrı gösteriyor (net + %19), Kittelwerk göstermiyor.
-- Alanlar boş bırakılabilir olduğu için ikisi de aynı tabloda durabiliyor.
-- ============================================================================

alter table public.orders
  add column if not exists kind text not null default 'bestellung'
    check (kind in ('bestellung', 'angebot')),
  add column if not exists currency   text not null default 'EUR',
  add column if not exists locale     text,
  add column if not exists country    text,
  add column if not exists vat_id     text,
  add column if not exists net_total  numeric(10,2),
  add column if not exists vat_rate   numeric(5,2),
  add column if not exists vat_amount numeric(10,2),
  -- Kaynak sistemdeki numara (Wipello'da quote_number). Taşımanın izini
  -- tutuyor ve aynı kaydın iki kez aktarılmasını engelliyor.
  add column if not exists external_ref text;

create unique index if not exists orders_external_ref_unique
  on public.orders (site_id, external_ref)
  where external_ref is not null;

create index if not exists orders_kind_idx on public.orders (site_id, kind);

-- Teklifin kendi durum çemberi var: gönderildi → kabul/ret.
-- Kabul edilen teklif üretime girdiğinde sipariş durumlarına devrediyor.
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in (
    'neu', 'in_produktion', 'pausiert', 'versandt', 'abgeschlossen', 'storniert',
    'angebot_offen', 'angebot_angenommen', 'angebot_abgelehnt'
  ));

-- Parasız görünüm teklifleri de taşısın (atölye teklifi görmemeli ama
-- Vertrieb takip etmeli — süzgeç ekranda).
drop view if exists public.orders_produktion;

create view public.orders_produktion
with (security_invoker = false) as
select
  o.id, o.order_no, o.site_id, o.kind, o.source, o.status,
  o.werkstatt_id, o.haendler_id, o.external_ref, o.locale,
  o.name, o.company, o.email, o.phone, o.street, o.plz, o.city, o.country,
  o.job_name, o.notes, o.logo_url, o.created_at,
  (
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'product', it->>'product',
        'productId', it->>'productId',
        'color',   it->>'color',
        'scent',   it->>'scent',
        'size',    it->>'size',
        'package', it->>'package',
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

grant all on all tables in schema public to service_role;
