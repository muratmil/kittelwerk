-- Ürün YAPISI da veritabanına: fotoğraf, renk, beden, ölçü tablosu, baskı
-- seçenekleri artık `products.meta` içinde.
--
-- Sebep: fiyat veritabanındaydı ama yapı `data/products.js`'te kalmıştı ve
-- portalın sipariş ekranları o dosyaya muhtaçtı. Portal (CCH) kendi Vercel
-- projesine çıkacağı için bu bağın kopması gerekiyordu. Artık dükkân da
-- portal da yapıyı aynı yerden okuyor — ortak kod kalmadı.
--
-- `data/products.js` silinmedi ama ÇALIŞMA ANINDA OKUNMUYOR. Yeni ürün oraya
-- yazılıp `node scripts/products-to-meta.mjs` ile buraya basılıyor; dosyayı
-- güncelleyip betiği çalıştırmayı unutmak, ürünün yapısının eski kalması
-- demek (fiyatı değil — o ayrı yoldan geliyor).

alter table public.products
  add column if not exists meta jsonb not null default '{}'::jsonb;

comment on column public.products.meta is
  'Ürün yapısı: desc, image, gallery, colors, sizes, sizeChart, details, washing, '
  'longDesc, oldPrice, badge, baskı bayrakları. Fiyat ve ad burada DEĞİL — '
  'onlar kendi sütunlarında. Kaynak: data/products.js + scripts/products-to-meta.mjs.';
