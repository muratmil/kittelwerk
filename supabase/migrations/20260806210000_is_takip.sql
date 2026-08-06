-- ============================================================================
-- İŞ TAKİP — reklam işleri ve cari hesap
--
-- Murat'ın 6. projesi (Desktop\is-takip) buraya taşınıyor. Sebebi teknik değil
-- kullanım: veri onun PC'sindeki Docker'da durdukça, telefondan sesle
-- "Café Roma ne kadar borçlu" diye sorulduğunda cevaplayacak bir yer yok.
-- Bulutta olunca Claude uygulamasındaki Supabase bağlantısı üzerinden
-- konuşarak yönetilebiliyor — ek uygulama, ek ücret gerekmiyor.
--
-- Portalla aynı veritabanında ama `is_` önekiyle ayrı duruyor; portal bu
-- tablolara karışmıyor, bunlar da portalın tablolarına.
--
-- Murat'ın istediği beş bilgi, satır başına:
--   NE (kalem.ne) · NE ÖLÇÜDE (en/boy/adet) · NE KADAR (tutar)
--   NE KADAR ÖDENMİŞ · KALAN   → ikisi `is_isler_ozet` görünümünde hesaplanıyor.
--
-- Eski yapıdan tek gerçek fark: ödeme artık tek sayı değil, tarihli hareket.
-- Cari hesap bundan doğuyor. Ölçü ayrı tablo olarak KALIYOR — Murat'ın eldeki
-- kaydında tek kalemde ("Kutu harf, 3 pencere") dört ayrı ölçü var; ölçüyü
-- kalemin içine tek en/boy olarak gömmek bu veriyi kaybederdi.
-- ============================================================================


-- ============================================================================
-- YARDIMCILAR
-- ============================================================================

-- Müşteri adını eşleştirme anahtarına çevirir: küçük harf, boşluk kırpılmış,
-- şapkalar/noktalar düşürülmüş. Sesle yazdırılan ad "Café Roma", "cafe roma",
-- "CAFE ROMA " gelebiliyor — üçü de aynı müşteri olmalı. (Bu düzeltilmeden
-- önce ilk denemede iki ayrı müşteri kaydı açılmıştı.)
--
-- unaccent uzantısı kullanılmadı: STABLE olduğu için benzersiz indekste
-- kullanılamıyor. Bu sürüm IMMUTABLE, dolayısıyla indekse girebiliyor.
create or replace function public.is_ad_anahtar(p_ad text)
returns text language sql immutable strict as $fn$
  select translate(
           lower(btrim(replace(p_ad, 'ß', 'ss'))),
           'çğıİöşüáàâäéèêëíìîïóòôöúùûüñÇĞIÖŞÜ',
           'cgiiosuaaaaeeeeiiiiooooouuuunCGIOSU')
$fn$;

-- Ölçüyü okunur yazar: 240.0 → "240", 240.5 → "240.5".
-- (İlk sürümde to_char sondaki noktayı bırakıyor, "240.x60." çıkıyordu.)
create or replace function public.is_sayi_kisa(p_sayi numeric)
returns text language sql immutable as $fn$
  select case when p_sayi is null then null
         else trim(trailing '.' from to_char(p_sayi, 'FM999999990.9')) end
$fn$;


-- ---------------------------------------------------------------- müşteriler
create table if not exists public.is_musteriler (
  id         uuid primary key default gen_random_uuid(),
  ad         text not null,
  telefon    text,
  eposta     text,
  notlar     text,
  olusturma  timestamptz not null default now()
);

-- Sesle kayıtta aynı müşteri iki kez açılmasın diye ada benzersizlik.
create unique index if not exists is_musteriler_ad_benzersiz
  on public.is_musteriler (public.is_ad_anahtar(ad));


-- --------------------------------------------------------------------- işler
create table if not exists public.is_isler (
  id           uuid primary key default gen_random_uuid(),
  musteri_id   uuid not null references public.is_musteriler(id) on delete cascade,
  baslik       text,
  aciklama     text,
  para_birimi  text not null default 'EUR' check (para_birimi in ('EUR','TRY','USD')),
  durum        text not null default 'teklif'
                 check (durum in ('teklif','devam','tamamlandi','teslim')),
  vade         date,
  -- Yanlış kayıt silinmiyor, iptal ediliyor: sesle giriş yanlış anlaşılabilir,
  -- geri alınabilir olması şart. Cari iptalli satırları saymaz.
  iptal        boolean not null default false,
  olusturma    timestamptz not null default now()
);

create index if not exists is_isler_musteri_idx on public.is_isler (musteri_id) where not iptal;
create index if not exists is_isler_vade_idx    on public.is_isler (vade) where not iptal;


-- ------------------------------------------------------------------ kalemler
-- NE + NE KADAR. Ölçüler alttaki tabloda (bir kalemde birden çok olabiliyor).
create table if not exists public.is_kalemler (
  id           uuid primary key default gen_random_uuid(),
  is_id        uuid not null references public.is_isler(id) on delete cascade,
  ne           text not null,                  -- "Kutu harf", "Cam yapıştırma"…
  aciklama     text,                            -- "Cephe tabelası, 3 pencere"
  adet         integer not null default 1 check (adet > 0),
  birim_fiyat  numeric(12,2) check (birim_fiyat is null or birim_fiyat >= 0),
  tutar        numeric(12,2) not null default 0 check (tutar >= 0),
  durum        text not null default 'planlandi'
                 check (durum in ('planlandi','uretimde','tamamlandi','iptal')),
  olusturma    timestamptz not null default now()
);

create index if not exists is_kalemler_is_idx on public.is_kalemler (is_id);


-- ------------------------------------------------------------------- ölçüler
-- "Ne ölçüde" sorusunun cevabı. Bir kalemde birden çok ölçü olabilir:
-- üç pencerenin üçü farklı ebatta ama tek fiyat kalemi.
create table if not exists public.is_olculer (
  id         uuid primary key default gen_random_uuid(),
  kalem_id   uuid not null references public.is_kalemler(id) on delete cascade,
  aciklama   text,                              -- "sol pencere", "orta"
  en_cm      numeric(8,1) check (en_cm  is null or en_cm  > 0),
  boy_cm     numeric(8,1) check (boy_cm is null or boy_cm > 0),
  adet       integer not null default 1 check (adet > 0),
  notlar     text,
  olusturma  timestamptz not null default now()
);

create index if not exists is_olculer_kalem_idx on public.is_olculer (kalem_id);


-- ------------------------------------------------------------------ ödemeler
-- Cari hesabın alacak tarafı. `is_id` boş olabilir: müşteri "hesabıma say"
-- diye toplu ödeme yapabiliyor — Murat'ın onayladığı kurgu bu.
create table if not exists public.is_odemeler (
  id           uuid primary key default gen_random_uuid(),
  musteri_id   uuid not null references public.is_musteriler(id) on delete cascade,
  is_id        uuid references public.is_isler(id) on delete set null,
  tarih        date not null default current_date,
  tutar        numeric(12,2) not null check (tutar > 0),
  para_birimi  text not null default 'EUR' check (para_birimi in ('EUR','TRY','USD')),
  yontem       text,                            -- nakit, havale, kart…
  aciklama     text,
  iptal        boolean not null default false,
  olusturma    timestamptz not null default now()
);

create index if not exists is_odemeler_musteri_idx on public.is_odemeler (musteri_id, tarih desc) where not iptal;
create index if not exists is_odemeler_is_idx      on public.is_odemeler (is_id) where not iptal;


-- ============================================================================
-- GÖRÜNÜMLER — "ne kadar ödenmiş, kalan" burada hesaplanıyor
-- ============================================================================

-- İş başına özet: tutarı kalemlerden, ödemesi ödemelerden gelir.
create or replace view public.is_isler_ozet as
select
  i.id, i.musteri_id, m.ad as musteri, i.baslik, i.aciklama,
  i.para_birimi, i.durum, i.vade, i.olusturma,
  coalesce(k.tutar, 0)   as tutar,
  coalesce(o.odenen, 0)  as odenen,
  coalesce(k.tutar, 0) - coalesce(o.odenen, 0) as kalan,
  k.kalem_sayisi,
  k.ozet as kalem_ozeti
from public.is_isler i
join public.is_musteriler m on m.id = i.musteri_id
left join lateral (
  select sum(kk.tutar) as tutar,
         count(*)      as kalem_sayisi,
         -- "Kutu harf 240x60, 180x60 ×2" gibi tek satırlık okunabilir özet:
         -- sesli cevapta bunu okumak yeterli oluyor.
         string_agg(
           kk.ne
           || coalesce(' (' || o.olculer || ')', '')
           || case when kk.adet > 1 then ' ×' || kk.adet else '' end,
           ', ' order by kk.olusturma) as ozet
  from public.is_kalemler kk
  left join lateral (
    select string_agg(
             public.is_sayi_kisa(oo.en_cm) || 'x' || public.is_sayi_kisa(oo.boy_cm)
             || case when oo.adet > 1 then ' ×' || oo.adet else '' end,
             ', ' order by oo.olusturma) as olculer
    from public.is_olculer oo
    where oo.kalem_id = kk.id and oo.en_cm is not null and oo.boy_cm is not null
  ) o on true
  where kk.is_id = i.id and kk.durum <> 'iptal'
) k on true
left join lateral (
  select sum(oo.tutar) as odenen
  from public.is_odemeler oo
  where oo.is_id = i.id and not oo.iptal
) o on true
where not i.iptal;

-- Cari hesap: müşteri × para birimi. Borç işlerden, alacak ödemelerden.
-- Para birimleri BİLEREK ayrı satır — kur çevirisi yapıp tek rakam vermek
-- bugünün kuruyla dünün borcunu karıştırırdı.
create or replace view public.is_cari as
with borc as (
  select i.musteri_id, i.para_birimi, sum(coalesce(k.tutar,0)) as borc
  from public.is_isler i
  left join lateral (
    select sum(tutar) as tutar from public.is_kalemler
    where is_id = i.id and durum <> 'iptal'
  ) k on true
  where not i.iptal
  group by 1,2
),
alacak as (
  select musteri_id, para_birimi, sum(tutar) as alacak
  from public.is_odemeler where not iptal group by 1,2
),
-- Borcu ya da ödemesi olan her (müşteri, para birimi) çifti bir satır.
-- Önce anahtar kümesi çıkarılıyor; iki tarafı doğrudan full join etmek
-- para birimi boş kaldığında satırı müşteriden koparıyordu.
anahtar as (
  select musteri_id, para_birimi from borc
  union
  select musteri_id, para_birimi from alacak
)
select
  m.id as musteri_id, m.ad as musteri, k.para_birimi,
  coalesce(b.borc, 0)   as borc,
  coalesce(a.alacak, 0) as tahsilat,
  coalesce(b.borc, 0) - coalesce(a.alacak, 0) as kalan
from anahtar k
join public.is_musteriler m on m.id = k.musteri_id
left join borc   b on b.musteri_id = k.musteri_id and b.para_birimi = k.para_birimi
left join alacak a on a.musteri_id = k.musteri_id and a.para_birimi = k.para_birimi;

-- Borcu olanlar, çoktan aza. "Kimler bana borçlu" sorusunun cevabı.
create or replace view public.is_borclular as
select * from public.is_cari where kalan > 0 order by kalan desc;

-- Vadesi yaklaşan/geçen açık işler.
create or replace view public.is_yaklasan as
select * from public.is_isler_ozet
where kalan > 0 and vade is not null
order by vade;


-- ============================================================================
-- SESLE KULLANIM İÇİN İŞLEMLER
--
-- Neden fonksiyon: sesle "şu müşteriye şu işi yaptım, şu kadar kapora aldım"
-- dendiğinde bu üç-dört tabloya birden yazmak gerekiyor. Tek tek INSERT'lerde
-- ortada kesilirse yarım kayıt kalır. Fonksiyon hepsini tek işlemde yapar ve
-- SONUCU CÜMLE OLARAK döndürür — o cümle kullanıcıya okunup onay alınır.
-- ============================================================================

-- Ada göre müşteri bul; yoksa aç. Sesle gelen ad "cafe roma" da olabilir
-- "Café Roma " da — ikisi aynı kayda gitmeli.
create or replace function public.is_musteri_bul_veya_ac(p_ad text)
returns uuid language plpgsql as $fn$
declare v_id uuid; v_ad text := btrim(p_ad);
begin
  if v_ad is null or v_ad = '' then
    raise exception 'Müşteri adı boş olamaz.';
  end if;
  select id into v_id from public.is_musteriler
   where public.is_ad_anahtar(ad) = public.is_ad_anahtar(v_ad);
  if v_id is null then
    insert into public.is_musteriler (ad) values (v_ad) returning id into v_id;
  end if;
  return v_id;
end;
$fn$;

-- Tek seferde: müşteri (gerekirse) + iş + kalem + (varsa) kapora.
create or replace function public.is_kayit(
  p_musteri   text,
  p_ne        text,
  p_tutar     numeric,
  p_en_cm     numeric default null,
  p_boy_cm    numeric default null,
  p_adet      integer default 1,
  p_para      text    default 'EUR',
  p_kapora    numeric default null,
  p_vade      date    default null,
  p_aciklama  text    default null
) returns text language plpgsql as $fn$
declare
  v_musteri_id uuid; v_is_id uuid; v_kalem_id uuid; v_olcu text := '';
begin
  if p_tutar is null or p_tutar < 0 then
    raise exception 'Tutar boş ya da eksi olamaz.';
  end if;
  if p_kapora is not null and p_kapora > p_tutar then
    raise exception 'Kapora (%) toplam tutardan (%) büyük olamaz.', p_kapora, p_tutar;
  end if;

  v_musteri_id := public.is_musteri_bul_veya_ac(p_musteri);

  insert into public.is_isler (musteri_id, baslik, aciklama, para_birimi, vade)
  values (v_musteri_id, p_ne, p_aciklama, coalesce(p_para,'EUR'), p_vade)
  returning id into v_is_id;

  insert into public.is_kalemler (is_id, ne, aciklama, adet, tutar)
  values (v_is_id, p_ne, p_aciklama, coalesce(p_adet,1), p_tutar)
  returning id into v_kalem_id;

  -- Ölçü verildiyse tek satır olarak açılır; sonradan "bir de 180x60 var"
  -- dendiğinde aynı kaleme ikinci ölçü eklenebilir.
  if p_en_cm is not null or p_boy_cm is not null then
    insert into public.is_olculer (kalem_id, en_cm, boy_cm, adet)
    values (v_kalem_id, p_en_cm, p_boy_cm, coalesce(p_adet,1));
  end if;

  if p_kapora is not null and p_kapora > 0 then
    insert into public.is_odemeler (musteri_id, is_id, tutar, para_birimi, aciklama)
    values (v_musteri_id, v_is_id, p_kapora, coalesce(p_para,'EUR'), 'Kapora');
  end if;

  if p_en_cm is not null and p_boy_cm is not null then
    v_olcu := ' ' || public.is_sayi_kisa(p_en_cm) || 'x' || public.is_sayi_kisa(p_boy_cm);
  end if;

  -- Onay için okunacak cümle.
  return format('%s: %s%s%s, %s %s.%s Kalan %s %s. (kayıt no %s)',
    (select ad from public.is_musteriler where id = v_musteri_id),
    p_ne, v_olcu,
    case when coalesce(p_adet,1) > 1 then ' ×' || p_adet else '' end,
    trim(to_char(p_tutar,'FM999999990.00')), coalesce(p_para,'EUR'),
    case when p_kapora is not null and p_kapora > 0
         then ' ' || trim(to_char(p_kapora,'FM999999990.00')) || ' kapora alındı.' else '' end,
    trim(to_char(p_tutar - coalesce(p_kapora,0),'FM999999990.00')), coalesce(p_para,'EUR'),
    v_is_id);
end;
$fn$;

-- Tahsilat. `p_is_id` verilmezse cariye sayılır (müşteri toplu ödeme yaptı).
create or replace function public.is_odeme(
  p_musteri   text,
  p_tutar     numeric,
  p_para      text default 'EUR',
  p_tarih     date default current_date,
  p_is_id     uuid default null,
  p_yontem    text default null,
  p_aciklama  text default null
) returns text language plpgsql as $fn$
declare v_musteri_id uuid; v_kalan numeric; v_odeme_id uuid;
begin
  if p_tutar is null or p_tutar <= 0 then
    raise exception 'Ödeme tutarı sıfırdan büyük olmalı.';
  end if;

  select id into v_musteri_id from public.is_musteriler
   where public.is_ad_anahtar(ad) = public.is_ad_anahtar(p_musteri);
  if v_musteri_id is null then
    raise exception 'Müşteri bulunamadı: %. Önce iş kaydı açılmalı.', p_musteri;
  end if;

  insert into public.is_odemeler (musteri_id, is_id, tarih, tutar, para_birimi, yontem, aciklama)
  values (v_musteri_id, p_is_id, coalesce(p_tarih, current_date), p_tutar,
          coalesce(p_para,'EUR'), p_yontem, p_aciklama)
  returning id into v_odeme_id;

  select kalan into v_kalan from public.is_cari
   where musteri_id = v_musteri_id and para_birimi = coalesce(p_para,'EUR');

  -- Ek yerine iki nokta: "Roma'den/'dan" gibi yanlış ek üretmesin.
  return format('%s: %s %s tahsil edildi. Kalan borç %s %s. (kayıt no %s)',
    (select ad from public.is_musteriler where id = v_musteri_id),
    trim(to_char(p_tutar,'FM999999990.00')), coalesce(p_para,'EUR'),
    trim(to_char(coalesce(v_kalan,0),'FM999999990.00')), coalesce(p_para,'EUR'),
    v_odeme_id);
end;
$fn$;

-- Yanlış anlaşılan kaydı geri al. Silmiyor, iptal ediyor.
create or replace function public.is_geri_al(p_tur text, p_id uuid)
returns text language plpgsql as $fn$
begin
  if p_tur in ('is','iş','kayit','kayıt') then
    update public.is_isler set iptal = true where id = p_id;
    if not found then raise exception 'İş bulunamadı: %', p_id; end if;
    return 'İş kaydı iptal edildi, cariden düştü.';
  elsif p_tur in ('odeme','ödeme') then
    update public.is_odemeler set iptal = true where id = p_id;
    if not found then raise exception 'Ödeme bulunamadı: %', p_id; end if;
    return 'Ödeme iptal edildi, cariye geri eklendi.';
  else
    raise exception 'Bilinmeyen kayıt türü: % (is ya da odeme olmalı)', p_tur;
  end if;
end;
$fn$;


-- ============================================================================
-- YETKİLER
--
-- DİKKAT: bu veritabanının anon anahtarı kittelwerk.de'nin içinde, herkese
-- açık. Bu tablolar Murat'ın özel ticari verisi — anon ve authenticated'a
-- HİÇBİR yetki verilmiyor. RLS de açık ve politikası yok: yetki verilse bile
-- satır dönmez. Erişim yalnız service_role üzerinden (sunucu tarafı / MCP).
-- ============================================================================
alter table public.is_musteriler enable row level security;
alter table public.is_isler      enable row level security;
alter table public.is_kalemler   enable row level security;
alter table public.is_olculer    enable row level security;
alter table public.is_odemeler   enable row level security;

revoke all on public.is_musteriler, public.is_isler, public.is_kalemler,
              public.is_olculer,    public.is_odemeler from anon, authenticated;
revoke all on public.is_isler_ozet, public.is_cari,
              public.is_borclular,  public.is_yaklasan from anon, authenticated;

grant select, insert, update, delete on
  public.is_musteriler, public.is_isler, public.is_kalemler,
  public.is_olculer,    public.is_odemeler
  to service_role;
grant select on
  public.is_isler_ozet, public.is_cari, public.is_borclular, public.is_yaklasan
  to service_role;

revoke execute on function public.is_kayit(text,text,numeric,numeric,numeric,integer,text,numeric,date,text) from anon, authenticated;
revoke execute on function public.is_odeme(text,numeric,text,date,uuid,text,text) from anon, authenticated;
revoke execute on function public.is_geri_al(text,uuid) from anon, authenticated;
revoke execute on function public.is_musteri_bul_veya_ac(text) from anon, authenticated;
