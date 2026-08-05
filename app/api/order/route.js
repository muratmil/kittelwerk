import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
import { esc } from '@/lib/escapeHtml';
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { loadCatalog, priceOf } from '@/lib/catalog';

const resend = new Resend(process.env.RESEND_API_KEY);

const DISCOUNT_CODES = { 'KITTEL10': 5 };
const LOGO_SERVICE_FEE = 100;
const FILE_CHECK_FEE = 20;

const PRINT_PRICES = {
  none: 0, front: 0, back: 0, both: 0,
  siebdruck: 3,
  bestickung_front: 2, bestickung_back: 3, bestickung_both: 5,
};

function validateLength(value, max) {
  return !value || String(value).length <= max;
}

// Kademeli fiyat artık koddan değil veritabanından geliyor (lib/catalog).

function calcShipping(subtotal) {
  if (subtotal >= 300) return 0;
  if (subtotal >= 100) return 14.90;
  return 9.90;
}

function formatSizes(sizes) {
  if (!sizes || sizes['-'] !== undefined) return `${sizes?.['-'] ?? '—'} Stück`;
  return Object.entries(sizes).filter(([, v]) => v > 0).map(([k, v]) => `${k}×${v}`).join(' · ');
}

function formatPrintType(printType) {
  const labels = {
    none: 'Kein Druck',
    front: 'DTF Vorderdruck',
    back: 'DTF Rückendruck',
    both: 'DTF Vorder- & Rückendruck',
    siebdruck: 'Siebdruck (+3,00€/Stk)',
    bestickung_front: 'Bestickung Vorne (+2,00€/Stk)',
    bestickung_back: 'Bestickung Hinten (+3,00€/Stk)',
    bestickung_both: 'Bestickung Vorne + Hinten (+5,00€/Stk)',
  };
  return labels[printType] || printType;
}

export async function POST(req) {
  const { allowed, retryAfter } = rateLimit(req, { limit: 10, windowMs: 60 * 60_000 });
  if (!allowed) return rateLimitResponse(retryAfter);

  const body = await req.json();
  const { name, company, email, phone, street, plz, city, items, discountCode, logoUrl, logoService, fileCheck, customerNotes } = body;

  if (!name || !email || !items || items.length === 0) {
    return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }

  if (
    !validateLength(name, 200) ||
    !validateLength(company, 200) ||
    !validateLength(email, 254) ||
    !validateLength(phone, 30) ||
    !validateLength(street, 200) ||
    !validateLength(plz, 10) ||
    !validateLength(city, 100) ||
    !validateLength(customerNotes, 1000)
  ) {
    return Response.json({ error: 'Eingabe zu lang.' }, { status: 400 });
  }

  // Fiyatları server tarafında hesapla — kaynak veritabanı, kod değil.
  const { products: catalog } = await loadCatalog(supabaseAdmin, { siteId: 'kittelwerk' });
  const byId = Object.fromEntries(catalog.map(p => [p.id, p]));

  const recalcItems = [];
  let costTotal = 0;
  for (const item of items) {
    const product = byId[item.id];
    if (!product || product.comingSoon) return Response.json({ error: `Unbekanntes Produkt: ${item.id}` }, { status: 400 });
    const qty = item.qty;
    const minQty = product.minQty || 10;
    if (!qty || qty < minQty) return Response.json({ error: `Mindestbestellmenge ${minQty} Stück.` }, { status: 400 });

    const basePrice = priceOf(product, qty);
    if (basePrice == null) return Response.json({ error: `Für ${product.name} ist kein Preis hinterlegt.` }, { status: 400 });

    // siebdruck, freeSiebdruck işaretli ürünlerde ücretsiz (tshirt, oversize)
    const printPrice = (item.printType === 'siebdruck' && product.freeSiebdruck)
      ? 0
      : (PRINT_PRICES[item.printType] ?? 0);
    const unitPrice = basePrice + printPrice;

    // Maliyet anlık görüntüsü — kur sonradan değişse de bu siparişin kârı bozulmaz.
    const unitCost = product.staffel?.[0]?.costEur ?? null;
    if (unitCost != null) costTotal += unitCost * qty;

    recalcItems.push({ ...item, price: unitPrice, basePrice, unitCost });
  }

  const subtotal = recalcItems.reduce((s, i) => s + i.price * i.qty, 0);

  const discountPct = discountCode ? (DISCOUNT_CODES[discountCode.toUpperCase()] ?? 0) : 0;
  const discountAmount = discountPct > 0 ? parseFloat((subtotal * discountPct / 100).toFixed(2)) : 0;
  const afterDiscount = subtotal - discountAmount;

  const logoServiceFee = logoService ? LOGO_SERVICE_FEE : 0;
  const fileCheckFee = fileCheck ? FILE_CHECK_FEE : 0;

  const shippingCost = calcShipping(afterDiscount);
  const total = parseFloat((afterDiscount + shippingCost + logoServiceFee + fileCheckFee).toFixed(2));

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert([{
      site_id: 'kittelwerk',
      source: 'web',
      name, company, email, phone, street, plz, city,
      items: recalcItems, subtotal, discount_code: discountCode || null,
      discount_amount: discountAmount,
      shipping_cost: shippingCost, total,
      cost_total: costTotal ? Math.round(costTotal * 100) / 100 : null,
      logo_url: logoUrl || null,
      status: 'neu',
    }])
    .select()
    .single();

  if (error) {
    return Response.json({ error: 'Fehler beim Speichern der Bestellung.' }, { status: 500 });
  }

  // Logo için signed URL oluştur (48 saat geçerli)
  let logoDownloadUrl = null;
  if (logoUrl) {
    const { data: signedData } = await supabaseAdmin.storage
      .from('logos')
      .createSignedUrl(logoUrl, 172800);
    if (signedData) logoDownloadUrl = signedData.signedUrl;
  }

  const itemsHtml = recalcItems.map(i =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${esc(i.name)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${esc(i.color)} · ${formatSizes(i.sizes)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${formatPrintType(i.printType)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${i.qty} Stück</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${(i.price * i.qty).toFixed(2)}€</td>
    </tr>`
  ).join('');

  // Müşteriye onay e-postası
  await resend.emails.send({
    from: 'Kittelwerk <info@kittelwerk.de>',
    to: email,
    subject: 'Deine Bestellanfrage bei Kittelwerk',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="font-size:28px;font-weight:900;">Kittel<span style="color:#E63946">werk</span>.</h1>
        <h2 style="margin-top:24px;">Danke, ${esc(name)}!</h2>
        <p>Wir haben deine Bestellanfrage erhalten und melden uns bald bei dir.</p>
        <p style="background:#FFF8D4;border:1px solid #111;padding:12px;font-size:12px;margin:16px 0;">
          <strong>Druckvorschau:</strong> Vor der Produktion erhalten Sie einen digitalen Korrekturabzug zur Freigabe. Die Produktion startet erst nach Ihrer ausdrücklichen Freigabe.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0;">
          <thead>
            <tr style="background:#111;color:#fff;">
              <th style="padding:10px;text-align:left;">Produkt</th>
              <th style="padding:10px;text-align:left;">Variante</th>
              <th style="padding:10px;text-align:left;">Druck</th>
              <th style="padding:10px;">Menge</th>
              <th style="padding:10px;text-align:right;">Preis</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <table style="width:100%;max-width:300px;margin-left:auto;">
          <tr><td style="padding:4px;color:#555;">Zwischensumme</td><td style="text-align:right;">${subtotal.toFixed(2)}€</td></tr>
          ${discountAmount > 0 ? `<tr><td style="padding:4px;color:#3D6B4F;">Rabatt (${esc(discountCode)})</td><td style="text-align:right;color:#3D6B4F;">−${discountAmount.toFixed(2)}€</td></tr>` : ''}
          <tr><td style="padding:4px;color:#555;">Versandkosten</td><td style="text-align:right;">${shippingCost === 0 ? 'GRATIS' : shippingCost.toFixed(2) + '€'}</td></tr>
          ${logoService ? `<tr><td style="padding:4px;color:#E63946;">Logo-Erstellungsservice</td><td style="text-align:right;color:#E63946;">+${logoServiceFee.toFixed(2)}€</td></tr>` : ''}
          ${fileCheck ? `<tr><td style="padding:4px;color:#3D6B4F;">Professionelle Datei-Kontrolle</td><td style="text-align:right;color:#3D6B4F;">+${fileCheckFee.toFixed(2)}€</td></tr>` : ''}
          <tr style="font-weight:900;font-size:18px;border-top:2px solid #111;"><td style="padding:8px 4px;">TOTAL</td><td style="text-align:right;">${total.toFixed(2)}€</td></tr>
        </table>
        ${customerNotes ? `<p style="background:#f5f5f5;border-left:3px solid #111;padding:10px 14px;font-size:12px;margin:16px 0;"><strong>Ihre Anmerkungen:</strong><br/>${esc(customerNotes)}</p>` : ''}
        <hr style="margin:32px 0;border:none;border-top:2px solid #111;"/>
        <p style="color:#999;font-size:11px;">© 2026 Kittelwerk · info@kittelwerk.de</p>
      </div>
    `,
  });

  // Admin bildirim e-postası
  await resend.emails.send({
    from: 'Kittelwerk <info@kittelwerk.de>',
    to: process.env.NOTIFICATION_EMAIL,
    subject: `🛒 Neue Bestellung: ${esc(company)} — ${total.toFixed(2)}€`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h2>Neue Bestellanfrage</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px;color:#555;width:140px;">Name</td><td><strong>${esc(name)}</strong></td></tr>
          <tr><td style="padding:6px;color:#555;">Restaurant</td><td><strong>${esc(company)}</strong></td></tr>
          <tr><td style="padding:6px;color:#555;">E-Mail</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
          <tr><td style="padding:6px;color:#555;">Telefon</td><td>${esc(phone)}</td></tr>
          <tr><td style="padding:6px;color:#555;">Adresse</td><td>${esc(street)}, ${esc(plz)} ${esc(city)}</td></tr>
          <tr><td style="padding:6px;color:#555;">Bestellwert</td><td><strong>${total.toFixed(2)}€</strong></td></tr>
          ${discountCode ? `<tr><td style="padding:6px;color:#555;">Rabattcode</td><td>${esc(discountCode)} (−${discountAmount.toFixed(2)}€)</td></tr>` : ''}
          ${logoDownloadUrl ? `<tr><td style="padding:6px;color:#555;">Logo</td><td><a href="${esc(logoDownloadUrl)}" style="color:#E63946;font-weight:bold;">📎 Logo herunterladen (48h)</a></td></tr>` : '<tr><td style="padding:6px;color:#555;">Logo</td><td style="color:#999;">Kein Logo hochgeladen</td></tr>'}
          ${logoService ? `<tr><td style="padding:6px;color:#E63946;font-weight:bold;">Logo-Service</td><td style="color:#E63946;font-weight:bold;">Ja — Partner-Grafiker erforderlich (+${logoServiceFee.toFixed(2)}€)</td></tr>` : ''}
          ${fileCheck ? `<tr><td style="padding:6px;color:#3D6B4F;font-weight:bold;">Datei-Kontrolle</td><td style="color:#3D6B4F;font-weight:bold;">Ja — Professionelle Druckdateiprüfung (+${fileCheckFee.toFixed(2)}€)</td></tr>` : ''}
          ${customerNotes ? `<tr><td style="padding:6px;color:#555;vertical-align:top;">Anmerkungen</td><td style="white-space:pre-wrap;">${esc(customerNotes)}</td></tr>` : ''}
        </table>
        <h3 style="margin-top:24px;">Bestellpositionen</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#111;color:#fff;"><th style="padding:8px;text-align:left;">Produkt</th><th style="padding:8px;text-align:left;">Variante</th><th style="padding:8px;text-align:left;">Druck</th><th style="padding:8px;text-align:center;">Menge</th><th style="padding:8px;text-align:right;">Preis</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="margin-top:16px;color:#555;font-size:13px;">Bestellung #${order.id}</p>
      </div>
    `,
  });

  return Response.json({ success: true, orderId: order.id });
}
