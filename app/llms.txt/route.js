import { createPublicClient } from '@/utils/supabase/public';
import { loadCatalog } from '@/lib/catalog';
import { woerterbuch } from '@/lib/i18n';
import { BASIS, LOCALES, SPRACHEN } from '@/lib/i18n/config';
import { kategorienListe } from '@/data/kategorien';

// llms.txt (2026-10-12): Sprachmodellen (ChatGPT, Perplexity, Claude …) eine kurze,
// saubere Zusammenfassung des Shops geben. Produkte und Preise kommen live aus der
// Datenbank, die Fragen aus demselben Wörterbuch wie die FAQ der Startseite —
// die Datei kann also nicht hinter der Website zurückbleiben.
export const revalidate = 3600;

const eur = (n) => `${Number(n).toFixed(2).replace('.', ',')} €`;

export async function GET() {
  const { products } = await loadCatalog(createPublicClient(), { siteId: 'kittelwerk', lang: 'de' });
  // "Demnächst" markierte Produkte haben eine Seite, sind aber noch nicht bestellbar
  const sichtbar = products;
  const faq = woerterbuch('de').faq.liste;

  const produktZeile = (p) => {
    const tiers = (p.tiers ?? []).filter((t) => t.price != null).sort((a, b) => a.minQty - b.minQty);
    let preis = '';
    if (tiers.length) {
      const erst = tiers[0], letzt = tiers[tiers.length - 1];
      preis = tiers.length > 1 && letzt.price !== erst.price
        ? ` – Staffelpreis ${eur(erst.price)} pro Stück (ab ${erst.minQty} Stück) bis ${eur(letzt.price)} (ab ${letzt.minQty} Stück)`
        : ` – ${eur(erst.price)} pro Stück (ab ${erst.minQty} Stück)`;
    }
    const bald = p.comingSoon ? ' – demnächst verfügbar' : '';
    const text = p.subtitle ? `: ${p.subtitle}` : '';
    return `- [${p.name}](${BASIS}/produkte/${p.slug})${text}${preis}${bald}`;
  };

  // Kategorien aus derselben Quelle wie die Kategorieseiten (data/kategorien.js)
  const kategorien = kategorienListe('de');
  const nachKategorie = kategorien.map((k) => {
    const liste = sichtbar.filter((p) => p.category === k.key);
    const sub = k.sub ? ` – ${k.sub}` : '';
    return liste.length ? `### [${k.label ?? k.slug}](${BASIS}/produkte/${k.slug})${sub}\n\n${liste.map(produktZeile).join('\n')}` : null;
  }).filter(Boolean);
  const ohneKategorie = sichtbar.filter((p) => !kategorien.some((k) => k.key === p.category));
  if (ohneKategorie.length) nachKategorie.push(`### Weitere Produkte\n\n${ohneKategorie.map(produktZeile).join('\n')}`);

  const body = `# Kittelwerk

> Kittelwerk ist ein B2B-Onlineshop für Gastro-Textilien und Arbeitskleidung mit eigenem Logo – für Restaurants, Imbisse, Cafés, Bäckereien, Werkstätten, Handwerk und Einzelhandel. Sitz in der Region Hannover (Niedersachsen), Versand deutschlandweit. Textilien direkt ab Werk, ohne Zwischenhandel; Logo-Druck (DTF) vorne und hinten ist im Preis enthalten. Mindestbestellung 10 Stück gesamt, verschiedene Produkte kombinierbar. Das Angebot richtet sich ausschließlich an gewerbliche Kunden.

## Das Wichtigste

- Mindestbestellung: 10 Stück gesamt, Produkte und Farben frei kombinierbar.
- Logo-Druck: DTF-Druck vorne und hinten kostenlos; Siebdruck ab 150 Stück; Bestickung ab 10 Stück gegen Aufpreis.
- Vor jeder Produktion: kostenlose digitale Druckvorschau zur Freigabe.
- Staffelpreise: je mehr Stück, desto günstiger; Großbestellungen ab 100 Stück mit individuellem Angebot.
- Lieferzeit: T-Shirts und Schürzen 1–2 Wochen, Oversize-T-Shirts etwa 3 Wochen, Sweatshirts, Fleece und Kappen 3–4 Wochen ab Zahlungseingang.
- Versand: 9,90 € bis 99,99 € Bestellwert, 14,90 € bis 299,99 €, ab 300 € versandkostenfrei (DHL/DPD mit Sendungsverfolgung).
- Nachbestellung jederzeit möglich.

## Produkte

${nachKategorie.join('\n\n')}

## Häufige Fragen

${faq.map(({ q, a }) => `**${q}**\n${a}`).join('\n\n')}

## Seiten

- [Alle Produkte](${BASIS}/produkte)
- [Druck & Stickerei – Verfahren, Positionen, Preise](${BASIS}/druckinfo)
- [Referenzen – Kundenbeispiele aus echten Küchen](${BASIS}/referenzen)
- [Lieferbedingungen – Lieferzeiten, Versand, Zahlung](${BASIS}/lieferbedingungen)
- [Über uns](${BASIS}/ueber-uns)
- [Kontakt](${BASIS}/kontakt)

Weitere Sprachen: ${LOCALES.filter((l) => l !== 'de').map((l) => `[${SPRACHEN[l]?.name ?? l.toUpperCase()}](${BASIS}/${l})`).join(', ')}

## Kontakt

- E-Mail: info@kittelwerk.de (Antwort innerhalb von 24 Stunden)
- Kontaktformular und WhatsApp: ${BASIS}/kontakt

## Rechtliches

- [Impressum](${BASIS}/impressum)
- [Datenschutz](${BASIS}/datenschutz)
- [AGB](${BASIS}/agb)
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
