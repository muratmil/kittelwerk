import { getActor, serviceClient, writeAudit, json } from '@/lib/api';
import { has } from '@/lib/authz';

// Fiyat, maliyet ve kur yönetimi.
//
// İki farklı yetki:
//   preise_pflegen → satış fiyatı, mod, marj, yuvarlama (admin)
//   vertrieb       → yalnızca ALIŞ fiyatı ve KUR
//
// Vertrieb'in maliyet güncellemesi marj modundaki ürünlerin vitrin fiyatını
// değiştirebileceği için beklemeye alınıyor. Kittelwerk'te tüm ürünler manuel
// olduğundan pratikte kimseyi bekletmiyor — ama kural motorda duruyor.
const darfKosten = (a) => a?.role === 'vertrieb' || has(a, 'preise_pflegen');
const darfVerkauf = (a) => has(a, 'preise_pflegen');

export async function PATCH(request) {
  const actor = await getActor();
  if (!actor) return json({ error: 'Nicht angemeldet.' }, 401);

  const body = await request.json().catch(() => ({}));
  const siteId = body.site_id ?? 'kittelwerk';
  const svc = serviceClient();

  // --- satış fiyatı / mod / marj ---
  if (body.art === 'produkt') {
    if (!darfVerkauf(actor)) return json({ error: 'Kein Zugriff auf Verkaufspreise.' }, 403);
    const { id, price_mode, margin_override, min_qty, active } = body;
    if (!id) return json({ error: 'Produkt fehlt.' }, 400);

    const patch = { updated_at: new Date().toISOString() };
    if (price_mode) {
      if (!['manuell', 'marge'].includes(price_mode)) return json({ error: 'Ungültiger Modus.' }, 400);
      patch.price_mode = price_mode;
      // Elle girilen fiyat SİLİNMİYOR — moda dokunan biri üzerinde düşünülmüş
      // fiyatı geri dönüşsüz kaybetmesin.
    }
    if (margin_override !== undefined) patch.margin_override = margin_override === null ? null : Number(margin_override);
    if (min_qty !== undefined) patch.min_qty = Math.max(1, Number(min_qty) || 1);
    if (typeof active === 'boolean') patch.active = active;

    const { error } = await svc.from('products').update(patch).eq('id', id).eq('site_id', siteId);
    if (error) return json({ error: error.message }, 500);
    await writeAudit(svc, actor.id, 'produkt_geaendert', 'product', id, { ...patch, site: siteId });
    return json({ ok: true });
  }

  // --- kademe fiyatı ---
  if (body.art === 'staffel') {
    if (!darfVerkauf(actor)) return json({ error: 'Kein Zugriff auf Verkaufspreise.' }, 403);
    const { product_id, min_qty, price } = body;
    if (!product_id || min_qty == null) return json({ error: 'Ungültige Anfrage.' }, 400);

    const value = price === null || price === '' ? null : Number(price);
    if (value != null && (!Number.isFinite(value) || value < 0)) {
      return json({ error: 'Ungültiger Preis.' }, 400);
    }

    const { error } = await svc
      .from('product_prices')
      .upsert({ site_id: siteId, product_id, min_qty: Number(min_qty), price: value },
              { onConflict: 'site_id,product_id,min_qty' });
    if (error) return json({ error: error.message }, 500);

    await writeAudit(svc, actor.id, 'staffelpreis_geaendert', 'product', product_id, { min_qty, price: value });
    return json({ ok: true });
  }

  // --- alış fiyatı (Vertrieb de yapabilir) ---
  if (body.art === 'kosten') {
    if (!darfKosten(actor)) return json({ error: 'Kein Zugriff.' }, 403);
    const { id, cost_price, cost_currency } = body;
    if (!id) return json({ error: 'Produkt fehlt.' }, 400);

    const { data: before } = await svc
      .from('products').select('cost_price, price_mode').eq('id', id).eq('site_id', siteId).single();
    if (!before) return json({ error: 'Produkt nicht gefunden.' }, 404);

    const value = cost_price === null || cost_price === '' ? null : Number(cost_price);
    if (value != null && (!Number.isFinite(value) || value < 0)) {
      return json({ error: 'Ungültiger Einkaufspreis.' }, 400);
    }

    // Marj modundaysa vitrin fiyatı değişir → önce onaya.
    if (before.price_mode === 'marge' && !darfVerkauf(actor)) {
      const { error } = await svc.from('price_changes').insert({
        change_type: 'cost', product_id: id,
        old_value: before.cost_price, new_value: value,
        requested_by: actor.id,
      });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, pending: true });
    }

    const patch = { cost_price: value, updated_at: new Date().toISOString() };
    if (cost_currency) patch.cost_currency = String(cost_currency).toUpperCase();

    const { error } = await svc.from('products').update(patch).eq('id', id).eq('site_id', siteId);
    if (error) return json({ error: error.message }, 500);

    await writeAudit(svc, actor.id, 'einkaufspreis_geaendert', 'product', id,
      { vorher: before.cost_price, nachher: value });
    return json({ ok: true });
  }

  // --- yuvarlama ve marj eşiği ---
  if (body.art === 'einstellungen') {
    if (!darfVerkauf(actor)) return json({ error: 'Kein Zugriff.' }, 403);
    const patch = { updated_at: new Date().toISOString() };
    if (body.round_to != null) {
      const step = Number(body.round_to);
      if (!(step > 0)) return json({ error: 'Rundungsschritt muss größer als 0 sein.' }, 400);
      patch.round_to = step;
    }
    if (body.round_mode) {
      if (!['up', 'nearest', 'down'].includes(body.round_mode)) return json({ error: 'Ungültiger Modus.' }, 400);
      patch.round_mode = body.round_mode;
    }
    if (body.low_margin_threshold != null) patch.low_margin_threshold = Number(body.low_margin_threshold);

    const { error } = await svc.from('pricing_settings').update(patch).eq('site_id', siteId);
    if (error) return json({ error: error.message }, 500);
    await writeAudit(svc, actor.id, 'preiseinstellungen_geaendert', 'settings', null, patch);
    return json({ ok: true });
  }

  return json({ error: 'Unbekannte Aktion.' }, 400);
}

// --- yeni kur: ÜZERİNE YAZMIYOR, yeni satır ekliyor ---
export async function POST(request) {
  const actor = await getActor();
  if (!actor) return json({ error: 'Nicht angemeldet.' }, 401);
  if (!darfKosten(actor)) return json({ error: 'Kein Zugriff.' }, 403);

  const { currency, rate } = await request.json().catch(() => ({}));
  const value = Number(rate);
  if (!currency || !Number.isFinite(value) || value <= 0) {
    return json({ error: 'Währung und gültiger Kurs erforderlich.' }, 400);
  }

  const svc = serviceClient();
  const { error } = await svc.from('exchange_rates').insert({
    currency: String(currency).toUpperCase(),
    to_currency: 'EUR',
    rate: value,
    created_by: actor.id,
  });
  if (error) return json({ error: error.message }, 500);

  await writeAudit(svc, actor.id, 'kurs_erfasst', 'exchange_rate', null, { currency, rate: value });
  return json({ ok: true });
}
