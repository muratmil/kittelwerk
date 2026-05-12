import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function formatSizes(sizes) {
  if (!sizes || sizes['-'] !== undefined) return `${sizes?.['-'] ?? '—'} Stück`;
  return Object.entries(sizes).filter(([, v]) => v > 0).map(([k, v]) => `${k}×${v}`).join(' · ');
}

export async function POST(req) {
  // Auth kontrolü
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Nicht autorisiert.' }, { status: 401 });

  // Reseller kaydını getir
  const { data: reseller } = await supabaseAdmin
    .from('resellers')
    .select('*')
    .eq('profile_id', user.id)
    .single();

  if (!reseller || !reseller.active) {
    return Response.json({ error: 'Kein aktives Händlerkonto gefunden.' }, { status: 403 });
  }

  const { items, note } = await req.json();
  if (!items || items.length === 0) {
    return Response.json({ error: 'Keine Produkte angegeben.' }, { status: 400 });
  }

  // Fiyatları server tarafında hesapla (client'a güvenme)
  const discountRate = reseller.discount_rate;
  const recalcItems = items.map(i => ({
    ...i,
    price: i.basePrice * (1 - discountRate / 100),
  }));

  const subtotal = items.reduce((s, i) => s + i.basePrice * i.qty, 0);
  const discountAmount = subtotal * discountRate / 100;
  const afterDiscount = subtotal - discountAmount;
  const shippingCost = afterDiscount >= 300 ? 0 : 5.90;
  const total = afterDiscount + shippingCost;

  const { data: order, error } = await supabaseAdmin
    .from('reseller_orders')
    .insert([{
      reseller_id: reseller.id,
      items: recalcItems,
      subtotal,
      discount_rate: discountRate,
      discount_amount: discountAmount,
      shipping_cost: shippingCost,
      total,
      status: 'new',
      notes: note || null,
    }])
    .select()
    .single();

  if (error) {
    return Response.json({ error: 'Fehler beim Speichern.' }, { status: 500 });
  }

  const itemsHtml = recalcItems.map(i =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${i.color} · ${formatSizes(i.sizes)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${i.qty} Stück</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${(i.price * i.qty).toFixed(2)}€</td>
    </tr>`
  ).join('');

  // Admin bildirimi
  await resend.emails.send({
    from: 'Kittelwerk <info@kittelwerk.de>',
    to: process.env.NOTIFICATION_EMAIL,
    subject: `🏪 [Händler] Neue Bestellung: ${reseller.company} — ${total.toFixed(2)}€`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h2>Neue Händlerbestellung</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <tr><td style="padding:6px;color:#555;width:140px;">Händler</td><td><strong>${reseller.company}</strong></td></tr>
          <tr><td style="padding:6px;color:#555;">Kontakt</td><td>${reseller.contact_name}</td></tr>
          <tr><td style="padding:6px;color:#555;">E-Mail</td><td><a href="mailto:${reseller.email}">${reseller.email}</a></td></tr>
          <tr><td style="padding:6px;color:#555;">Rabatt</td><td style="color:#3D6B4F;">${discountRate}% (−${discountAmount.toFixed(2)}€)</td></tr>
          <tr><td style="padding:6px;color:#555;">Bestellwert</td><td><strong>${total.toFixed(2)}€</strong></td></tr>
          ${note ? `<tr><td style="padding:6px;color:#555;">Notiz</td><td>${note}</td></tr>` : ''}
        </table>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#111;color:#fff;">
            <th style="padding:8px;text-align:left;">Produkt</th>
            <th style="padding:8px;text-align:left;">Variante</th>
            <th style="padding:8px;text-align:center;">Menge</th>
            <th style="padding:8px;text-align:right;">Preis</th>
          </tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="margin-top:16px;color:#555;font-size:13px;">Bestellung #${order.id}</p>
      </div>
    `,
  });

  return Response.json({ success: true, orderId: order.id });
}
