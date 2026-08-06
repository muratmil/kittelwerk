-- Her site portalın hangi işini devretti?
--
-- Kittelwerk tamamen portalda: fiyat, sipariş, üretim.
-- Wipello şimdilik yalnızca GÖRÜNTÜLENİYOR — teklifleri ve siparişleri tek
-- listede görünsün diye burada, ama fiyatları kendi panelinde kalıyor
-- (çarpan bazlı, 124 varyantlı kendi modeli var).
--
-- Bayraklar olmadan Wipello seçilince boş bir fiyat ekranı ve uydurma ürünler
-- çıkardı; yanlış yere yol gösteren arayüz, olmayan arayüzden kötüdür.
alter table public.sites
  add column if not exists manages_pricing  boolean not null default true,
  add column if not exists allows_ordering  boolean not null default true;

update public.sites
   set manages_pricing = false, allows_ordering = false
 where id = 'wipello';
