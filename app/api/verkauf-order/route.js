import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
import { Resend } from 'resend';
import { esc } from '@/lib/escapeHtml';

const resend = new Resend(process.env.RESEND_API_KEY);

function formatSizes(sizes) {
  if (!sizes || sizes['-'] !== undefined) return `${sizes?.['-'] ?? '—'} Stück`;
  return Object.entries(sizes).filter(([, v]) => v > 0).map(([k, v]) => `${k}×${v}`).join(' · ');
}

export async function POST(req) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Nicht autorisiert.' }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'verkauf' && profile?.role !== 'admin') {
    return Response.json({ error: 'Kein Zugriff.' }, { status: 403 });
  }

  const body = await req.json();
  const { name, company, email, phone, street, plz, city, note, items, subtotal, discountLabel, discountAmount, shippingCost, total } = body;

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert([{
      name,
      company,
      email: email || null,
      phone,
      street,
      plz,
      city,
      items,
      subtotal,
      discount_code: discountLabel || null,
      discount_amount: discountAmount || 0,
      shipping_cost: shippingCost,
      total,
      status: 'new',
      notes: note ? `Direktbestellung via Verkauf-Panel\n\n${note}` : 'Direktbestellung via Verkauf-Panel',
    }])
    .select()
    .single();

  if (error) {
    return Response.json({ error: 'Fehler beim Speichern der Bestellung.' }, { status: 500 });
  }

  const itemsHtml = items.map(i =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${esc(i.name)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${esc(i.color)} · ${formatSizes(i.sizes)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${i.qty} Stück</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${(i.price * i.qty).toFixed(2)}€</td>
    </tr>`
  ).join('');

  const discountRow = discountAmount > 0
    ? `<tr><td style="padding:4px;color:#3D6B4F;">Rabatt</td><td style="text-align:right;color:#3D6B4F;">−${discountAmount.toFixed(2)}€</td></tr>`
    : '';

  // Müşteriye onay maili (sadece email girilmişse)
  if (email) {
    await resend.emails.send({
      from: 'Kittelwerk <info@kittelwerk.de>',
      to: email,
      subject: 'Deine Bestellanfrage bei Kittelwerk',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <h1 style="font-size:28px;font-weight:900;">Kittel<span style="color:#E63946">werk</span>.</h1>
          <h2 style="margin-top:24px;">Danke, ${esc(name)}!</h2>
          <p>Wir haben deine Bestellanfrage erhalten und melden uns bald bei dir.</p>
          <table style="width:100%;border-collapse:collapse;margin:24px 0;">
            <thead>
              <tr style="background:#111;color:#fff;">
                <th style="padding:10px;text-align:left;">Produkt</th>
                <th style="padding:10px;text-align:left;">Variante</th>
                <th style="padding:10px;">Menge</th>
                <th style="padding:10px;text-align:right;">Preis</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <table style="width:100%;max-width:300px;margin-left:auto;">
            <tr><td style="padding:4px;color:#555;">Zwischensumme</td><td style="text-align:right;">${subtotal.toFixed(2)}€</td></tr>
            ${discountRow}
            <tr><td style="padding:4px;color:#555;">Versandkosten</td><td style="text-align:right;">${shippingCost === 0 ? 'GRATIS' : shippingCost.toFixed(2) + '€'}</td></tr>
            <tr style="font-weight:900;font-size:18px;border-top:2px solid #111;"><td style="padding:8px 4px;">TOTAL</td><td style="text-align:right;">${total.toFixed(2)}€</td></tr>
          </table>
          <hr style="margin:32px 0;border:none;border-top:2px solid #111;"/>
          <p style="color:#999;font-size:11px;">© 2026 Kittelwerk · info@kittelwerk.de</p>
        </div>
      `,
    });
  }

  // Admin bildirimi
  await resend.emails.send({
    from: 'Kittelwerk <info@kittelwerk.de>',
    to: process.env.NOTIFICATION_EMAIL,
    subject: `🛒 [Verkauf] Neue Bestellung: ${company} — ${total.toFixed(2)}€`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h2>Direktbestellung via Verkauf-Panel</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px;color:#555;width:140px;">Name</td><td><strong>${esc(name)}</strong></td></tr>
          <tr><td style="padding:6px;color:#555;">Restaurant</td><td><strong>${esc(company)}</strong></td></tr>
          <tr><td style="padding:6px;color:#555;">E-Mail</td><td>${email ? `<a href="mailto:${esc(email)}">${esc(email)}</a>` : '<span style="color:#999">Keine Angabe</span>'}</td></tr>
          <tr><td style="padding:6px;color:#555;">Telefon</td><td>${esc(phone)}</td></tr>
          <tr><td style="padding:6px;color:#555;">Adresse</td><td>${esc(street)}, ${esc(plz)} ${esc(city)}</td></tr>
          <tr><td style="padding:6px;color:#555;">Bestellwert</td><td><strong>${total.toFixed(2)}€</strong></td></tr>
          ${discountAmount > 0 ? `<tr><td style="padding:6px;color:#3D6B4F;">Rabatt</td><td style="color:#3D6B4F;">−${discountAmount.toFixed(2)}€ (${esc(discountLabel)})</td></tr>` : ''}
        </table>
        <h3 style="margin-top:24px;">Bestellpositionen</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#111;color:#fff;">
              <th style="padding:8px;text-align:left;">Produkt</th>
              <th style="padding:8px;text-align:left;">Variante</th>
              <th style="padding:8px;text-align:center;">Menge</th>
              <th style="padding:8px;text-align:right;">Preis</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="margin-top:16px;color:#555;font-size:13px;">Bestellung #${order.id}</p>
      </div>
    `,
  });

  return Response.json({ success: true, orderId: order.id });
}
