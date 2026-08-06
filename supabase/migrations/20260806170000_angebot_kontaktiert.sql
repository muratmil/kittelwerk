-- Wipello'nun gerçek durum değerleri: 'draft' ve 'contacted'.
--
-- 'contacted' = müşteriyle iletişime geçildi, karar bekleniyor. Bu, açık
-- tekliften farklı bir aşama; ikisini 'angebot_offen' altında birleştirmek
-- Murat'ın fiilen kullandığı ayrımı silerdi. Bu yüzden kendi durumu var.
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in (
    'neu', 'in_produktion', 'pausiert', 'versandt', 'abgeschlossen', 'storniert',
    'angebot_offen', 'angebot_kontaktiert', 'angebot_angenommen', 'angebot_abgelehnt'
  ));
