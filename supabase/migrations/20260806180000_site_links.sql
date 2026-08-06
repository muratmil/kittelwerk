-- Sitenin kendi panellerine doğrudan bağlantılar.
--
-- Geçiş dönemi köprüsü: bir sitenin ekranları portala taşınana kadar
-- kullanıcı buradan tek tıkla kendi paneline gidebilsin. `admin_url` tek bir
-- adres tutuyordu, oysa Wipello'da en az iki sayfa var (fiyat + teklifler).
-- Liste jsonb olduğu için yeni bağlantı eklemek göç gerektirmiyor.
alter table public.sites
  add column if not exists links jsonb not null default '[]'::jsonb;

-- Eski tek adresi listeye taşı, sonra sütunu bırak.
update public.sites
   set links = jsonb_build_array(jsonb_build_object('label', 'Admin', 'url', admin_url))
 where admin_url is not null
   and links = '[]'::jsonb;

alter table public.sites drop column if exists admin_url;
