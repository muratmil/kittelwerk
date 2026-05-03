import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function formatSizes(sizes) {
  if (!sizes || sizes['-'] !== undefined) return `${sizes?.['-'] ?? '—'} Stück`;
  return Object.entries(sizes).filter(([, v]) => v > 0).map(([k, v]) => `${k}×${v}`).join(' · ');
}

export async function POST(req) {
  const body = await req.json();
  const { name, company, email, phone, street, plz, city, items, subtotal, discountCode, discountAmount, shippingCost, total, logoBase64, logoFilename } = body;

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert([{
      name, company, email, phone, street, plz, city,
      items, subtotal, discount_code: discountCode || null,
      discount_amount: discountAmount || 0,
      shipping_cost: shippingCost, total,
      status: 'new',
    }])
    .select()
    .single();

  if (error) {
    return Response.json({ error: 'Fehler beim Speichern der Bestellung.' }, { status: 500 });
  }

  const itemsHtml = items.map(i =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${i.color} · ${formatSizes(i.sizes)}</td>
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
        <h2 style="margin-top:24px;">Danke, ${name}!</h2>
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
          ${discountAmount > 0 ? `<tr><td style="padding:4px;color:#3D6B4F;">Rabatt (${discountCode})</td><td style="text-align:right;color:#3D6B4F;">−${discountAmount.toFixed(2)}€</td></tr>` : ''}
          <tr><td style="padding:4px;color:#555;">Versandkosten</td><td style="text-align:right;">${shippingCost === 0 ? 'GRATIS' : shippingCost.toFixed(2) + '€'}</td></tr>
          <tr style="font-weight:900;font-size:18px;border-top:2px solid #111;"><td style="padding:8px 4px;">TOTAL</td><td style="text-align:right;">${total.toFixed(2)}€</td></tr>
        </table>
        <hr style="margin:32px 0;border:none;border-top:2px solid #111;"/>
        <p style="color:#999;font-size:11px;">© 2026 Kittelwerk · info@kittelwerk.de</p>
      </div>
    `,
  });

  // Murata bildirim e-postası
  const adminEmailPayload = {
    from: 'Kittelwerk <info@kittelwerk.de>',
    to: process.env.NOTIFICATION_EMAIL,
    subject: `🛒 Neue Bestellung: ${company} — ${total.toFixed(2)}€`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h2>Neue Bestellanfrage</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px;color:#555;width:140px;">Name</td><td><strong>${name}</strong></td></tr>
          <tr><td style="padding:6px;color:#555;">Restaurant</td><td><strong>${company}</strong></td></tr>
          <tr><td style="padding:6px;color:#555;">E-Mail</td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:6px;color:#555;">Telefon</td><td>${phone}</td></tr>
          <tr><td style="padding:6px;color:#555;">Adresse</td><td>${street}, ${plz} ${city}</td></tr>
          <tr><td style="padding:6px;color:#555;">Bestellwert</td><td><strong>${total.toFixed(2)}€</strong></td></tr>
          ${discountCode ? `<tr><td style="padding:6px;color:#555;">Rabattcode</td><td>${discountCode} (−${discountAmount.toFixed(2)}€)</td></tr>` : ''}
          ${logoFilename ? `<tr><td style="padding:6px;color:#555;">Logo</td><td>Im Anhang: ${logoFilename}</td></tr>` : ''}
        </table>
        <h3 style="margin-top:24px;">Bestellpositionen</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#111;color:#fff;"><th style="padding:8px;text-align:left;">Produkt</th><th style="padding:8px;">Menge</th><th style="padding:8px;text-align:right;">Preis</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="margin-top:16px;color:#555;font-size:13px;">Bestellung #${order.id}</p>
      </div>
    `,
  };

  if (logoBase64 && logoFilename) {
    adminEmailPayload.attachments = [{ filename: logoFilename, content: logoBase64 }];
  }

  await resend.emails.send(adminEmailPayload);

  return Response.json({ success: true, orderId: order.id });
}
