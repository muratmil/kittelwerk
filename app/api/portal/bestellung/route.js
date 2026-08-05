import { getActor, serviceClient, writeAudit, json } from '@/lib/api';
import { loadCatalog, priceOf } from '@/lib/catalog';
import { shippingFor } from '@/lib/pricing';

// Sipariş verme.
//   haendler → kendi adına, kendi koşullarıyla
//   owner/admin → ŞİRKET adına (source 'intern'), ödemeye uğramaz
//
// Kimse başkası adına sipariş veremez: sahip alanı her zaman oturumdan
// türetiliyor, gövdeden gelen bir kimlik varsa dikkate alınmıyor.
//
// Fiyatlar İSTEMCİDEN ALINMIYOR — burada veritabanından yeniden hesaplanıyor.
export async function POST(request) {
  const actor = await getActor();
  if (!actor) return json({ error: 'Nicht angemeldet.' }, 401);

  const istHaendler = actor.role === 'haendler';
  const istIntern = actor.is_owner || actor.role === 'admin';
  if (!istHaendler && !istIntern) return json({ error: 'Kein Zugriff.' }, 403);

  const body = await request.json().catch(() => ({}));
  const siteId = body.site_id ?? 'kittelwerk';
  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) return json({ error: 'Der Warenkorb ist leer.' }, 400);

  const svc = serviceClient();

  // Bayi kaydı ve koşulları — oturumdan, gövdeden değil.
  let haendler = null;
  if (istHaendler) {
    const { data } = await svc
      .from('haendler')
      .select('id, company, contact_name, street, plz, city, discount_rate, custom_prices, active')
      .eq('profile_id', actor.id)
      .single();
    if (!data) return json({ error: 'Kein Händlerkonto gefunden.' }, 403);
    if (!data.active) return json({ error: 'Ihr Händlerkonto ist noch nicht freigegeben.' }, 403);
    haendler = data;
  }

  const { products } = await loadCatalog(svc, { haendler, siteId });
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));

  const items = [];
  let subtotal = 0;
  let costTotal = 0;

  for (const raw of rawItems) {
    const product = byId[String(raw.productId ?? '')];
    if (!product) return json({ error: `Unbekanntes Produkt: ${raw.productId}` }, 400);
    if (product.comingSoon) return json({ error: `${product.name} ist noch nicht bestellbar.` }, 400);

    const sizes = raw.sizes && typeof raw.sizes === 'object' ? raw.sizes : {};
    const qty = Object.values(sizes).reduce((s, v) => s + (Number(v) || 0), 0);
    if (qty <= 0) return json({ error: `Bitte Mengen für ${product.name} angeben.` }, 400);
    if (qty < product.minQty) {
      return json({ error: `${product.name}: Mindestmenge ${product.minQty} Stück.` }, 400);
    }

    const unitPrice = priceOf(product, qty, haendler);
    if (unitPrice == null) return json({ error: `Für ${product.name} ist kein Preis hinterlegt.` }, 400);

    const linePrice = Math.round(unitPrice * qty * 100) / 100;
    subtotal += linePrice;

    // Maliyet anlık görüntüsü — kur sonradan değişse de bu siparişin kârı bozulmaz.
    const unitCost = product.staffel?.[0]?.costEur ?? null;
    if (unitCost != null) costTotal += unitCost * qty;

    items.push({
      productId: product.id,
      product: product.name,
      color: raw.color ?? null,
      print: raw.print ?? 'none',
      sizes,
      qty,
      unitPrice,
      linePrice,
      unitCost,
    });
  }

  subtotal = Math.round(subtotal * 100) / 100;
  const shipping = shippingFor(subtotal);
  const total = Math.round((subtotal + shipping) * 100) / 100;

  const { data: rates } = await svc
    .from('exchange_rates').select('currency, rate, valid_from')
    .order('valid_from', { ascending: false }).limit(20);
  const fxSnapshot = {};
  for (const r of rates ?? []) if (fxSnapshot[r.currency] == null) fxSnapshot[r.currency] = Number(r.rate);

  const { data: order, error } = await svc
    .from('orders')
    .insert({
      site_id: siteId,
      source: istHaendler ? 'haendler' : 'intern',
      haendler_id: istHaendler ? haendler.id : null,
      created_by_profile_id: actor.id,
      company: istHaendler ? haendler.company : 'Kittelwerk',
      name: istHaendler ? (haendler.contact_name ?? actor.email) : actor.email,
      email: actor.email,
      street: istHaendler ? haendler.street : null,
      plz: istHaendler ? haendler.plz : null,
      city: istHaendler ? haendler.city : null,
      job_name: body.job_name?.trim() || null,
      notes: body.notes?.trim() || null,
      items,
      subtotal,
      shipping_cost: shipping,
      total,
      cost_total: costTotal ? Math.round(costTotal * 100) / 100 : null,
      fx_snapshot: fxSnapshot,
      status: 'neu',
      payment_status: 'nicht_erforderlich',
    })
    .select('id, order_no')
    .single();

  if (error) return json({ error: error.message }, 500);

  await writeAudit(svc, actor.id, 'bestellung_aufgegeben', 'order', order.id,
    { order_no: order.order_no, source: istHaendler ? 'haendler' : 'intern', total });

  return json({ ok: true, order_no: order.order_no });
}
