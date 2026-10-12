/**
 * SEO-Texte für Produktseiten (2026-10-12). Bewusst NICHT im Wörterbuch: das fällt für
 * fehlende Sprachen auf Deutsch zurück, deutsche Suchtexte gehören aber nur auf deutsche Seiten.
 *
 * Auswahl nach Search Console (Juli–Okt. 2026): „latzschürze(n)“ ~600 Impressionen auf Platz 36–77,
 * „gastro t shirt“ Platz 14–19, „vorbinder(schürze)“ Platz 20–41, „bistroschürze(n)“, „kochjacke/kochkittel“.
 * Nur Fakten, die auch auf der Produktseite stehen (Material, Farben, Lieferzeit). Preise kommen
 * live aus der Staffel: {start} = Preis der kleinsten Menge ({startMenge} Stück), {ab} = günstigster
 * Staffelpreis ({abMenge} Stück).
 */
export const PRODUKT_SEO = {
  de: {
    latz: {
      title: 'Latzschürze mit Logo bedrucken – Latzschürzen für die Gastronomie ab 10 Stück | Kittelwerk',
      h2: 'Latzschürzen für Gastronomie und Service – mit Ihrem Logo',
      absaetze: [
        'Die Latzschürze ist der Klassiker in Restaurant, Imbiss, Café und Küche: Sie schützt von der Brust bis zum Knie und hält Spritzer und Flecken von der Kleidung fern. Unsere Latzschürzen bestehen aus Alpaka-Gewebe (75 % Polyester, 25 % Viskose) – bügelleicht, knitterarm und für die Industriewäsche bei hohen Temperaturen geeignet. Der verstellbare Nackengurt passt für Damen und Herren gleichermaßen.',
        'Ihr Logo drucken wir kostenlos vorne auf den Latz. Bestellbar ab 10 Stück, auch gemischt mit anderen Artikeln wie T-Shirts oder Vorbindern. Die Latzschürze kostet {start} pro Stück bei {startMenge} Stück und sinkt in der Staffel bis {ab} ab {abMenge} Stück – günstige Latzschürzen ohne Zwischenhandel, direkt ab Werk.',
        'Farben: Schwarz, Weiß und Rot. Lieferzeit: 1–2 Wochen ab Zahlungseingang, Versand deutschlandweit.',
      ],
      faq: [
        { q: 'Was kostet eine Latzschürze mit Logo?', a: 'Bei Kittelwerk kostet die Latzschürze {start} pro Stück ab {startMenge} Stück; in der Staffel sinkt der Preis bis {ab} ab {abMenge} Stück. Der Logo-Druck ist im Preis enthalten.' },
        { q: 'Ab wie vielen Stück kann ich Latzschürzen bestellen?', a: 'Ab 10 Stück gesamt – die Menge darf auch aus verschiedenen Produkten bestehen, zum Beispiel 5 Latzschürzen und 5 T-Shirts.' },
        { q: 'Sind die Latzschürzen für Damen und Herren geeignet?', a: 'Ja. Der Nackengurt ist verstellbar, sodass dieselbe Latzschürze für unterschiedliche Körpergrößen passt.' },
        { q: 'Kann man die Latzschürze heiß waschen?', a: 'Ja, das Alpaka-Gewebe ist für die Industriewäsche bei hohen Temperaturen geeignet und bleibt formstabil und farbecht.' },
      ],
    },
    tshirt: {
      title: 'Gastro T-Shirt mit Logo bedrucken – ab 10 Stück, Druck inklusive | Kittelwerk',
      h2: 'Gastro T-Shirts mit Ihrem Logo – für Küche, Service und Theke',
      absaetze: [
        'Ein einheitliches Gastro T-Shirt mit Logo macht Ihr Team sofort erkennbar – im Restaurant, im Imbiss, im Café oder am Foodtruck. Unser Premium T-Shirt besteht aus 100 % Baumwolle (24/1 Premium-Garn, ca. 190 g/m²), ist atmungsaktiv und hält lange Schichten und viele Waschgänge aus.',
        'Den Logo-Druck vorne und hinten machen wir kostenlos (DTF-Druck, vollfarbig). Ab 150 Stück ist auch Siebdruck möglich. Das Gastro T-Shirt kostet {start} pro Stück bei {startMenge} Stück und in der Staffel bis {ab} ab {abMenge} Stück.',
        'Farben: Schwarz, Weiß und Rot. Größen XS bis 4XL (3XL und 4XL mit 1 € Aufpreis). Lieferzeit 1–2 Wochen, Versand deutschlandweit.',
      ],
      faq: [
        { q: 'Was kostet ein Gastro T-Shirt mit Logo?', a: 'Ab {start} pro Stück bei {startMenge} Stück, in der Staffel bis {ab} ab {abMenge} Stück – der Logo-Druck vorne und hinten ist inklusive.' },
        { q: 'Welche Größen gibt es?', a: 'Von XS bis 4XL. Für 3XL und 4XL kommt 1 € pro Stück dazu.' },
        { q: 'Wie lange dauert die Lieferung?', a: '1–2 Wochen ab Zahlungseingang, Versand mit Sendungsverfolgung deutschlandweit.' },
      ],
    },
    apron: {
      title: 'Vorbinder mit Logo – Vorbinderschürze für die Gastronomie ab 10 Stück | Kittelwerk',
      h2: 'Vorbinder für Gastronomie und Service – bedruckt mit Ihrem Logo',
      absaetze: [
        'Der Vorbinder – auch Vorbinderschürze oder Hüftschürze genannt – ist die Schürze für Service, Bar und Theke: Er wird um die Hüfte gebunden, lässt den Oberkörper frei und wirkt am Gast elegant. Unser Vorbinder besteht aus Alpaka-Gewebe (75 % Polyester, 25 % Viskose), ist bügelleicht, knitterarm und für die Industriewäsche geeignet.',
        'Ihr Logo drucken wir kostenlos auf den Vorbinder; auf Wunsch auch als Bestickung. Der Vorbinder kostet {start} pro Stück bei {startMenge} Stück und in der Staffel bis {ab} ab {abMenge} Stück.',
        'Farben: Schwarz, Weiß und Rot. Lieferzeit 1–2 Wochen, Versand deutschlandweit. Mindestbestellung 10 Stück gesamt, kombinierbar mit anderen Artikeln.',
      ],
      faq: [
        { q: 'Was ist ein Vorbinder?', a: 'Ein Vorbinder ist eine Schürze ohne Latz, die um die Hüfte gebunden wird – typisch für Service, Bar und Theke in der Gastronomie.' },
        { q: 'Was kostet ein Vorbinder mit Logo?', a: '{start} pro Stück ab {startMenge} Stück, in der Staffel bis {ab} ab {abMenge} Stück. Der Logo-Druck ist inklusive.' },
        { q: 'Kann ich den Vorbinder besticken lassen?', a: 'Ja, neben dem kostenlosen Druck ist auch eine Bestickung möglich; die Preise stehen auf der Seite Druck & Stickerei.' },
      ],
    },
    bistro: {
      title: 'Barista-Schürze & Bistroschürze mit Logo-Stick – Canvas, Lederriemen | Kittelwerk',
      h2: 'Barista- und Bistroschürze für Café, Bar und offene Küche',
      absaetze: [
        'Die Barista-Schürze ist die robuste Bistroschürze für Kaffeebars, Bistros und offene Küchen: fester Canvas-Stoff, verstellbare Lederriemen über Kreuz und eine Länge bis über das Knie. Die Riemen legen das Gewicht auf die Schultern statt in den Nacken – angenehm auch in langen Schichten. Erhältlich mit zwei aufgesetzten Taschen oder ohne Taschen.',
        'Ihr Logo wird auf der Brust bestickt – kostenlos ab 10 Stück. Die Barista-Schürze kostet {start} pro Stück bei {startMenge} Stück und in der Staffel bis {ab} ab {abMenge} Stück.',
        'Farben: Schwarz, Marineblau, Bordeaux, Braun, Olivgrün und Sandbeige. Lieferzeit 1–2 Wochen, Versand deutschlandweit.',
      ],
      faq: [
        { q: 'Was ist der Unterschied zwischen Barista- und Bistroschürze?', a: 'Beide Begriffe werden für lange Gastro-Schürzen verwendet. Unsere Barista-Schürze hat einen Latz, Lederriemen über Kreuz und reicht bis über das Knie.' },
        { q: 'Ist das Logo gestickt oder gedruckt?', a: 'Das Logo wird auf der Brust bestickt – ab 10 Stück ohne Aufpreis.' },
      ],
    },
    kochjacke: {
      title: 'Kochjacke mit Logo – Kochkittel aus Profi-Twill, bestickt | Kittelwerk',
      h2: 'Kochjacke für Profiküchen – bald bei Kittelwerk',
      absaetze: [
        'Unsere Kochjacke (auch Kochkittel) ist für den Profi-Einsatz in Küche und Gastronomie gemacht: strapazierfähiger Twill (65 % Polyester, 35 % Baumwolle, ca. 220 g/m²), klassischer zweireihiger Schnitt mit Druckknöpfen, verdeckte Knopfleiste und hochschließender Kragen. Die atmungsaktive Rückenpartie sorgt für ein angenehmes Klima am heißen Herd.',
        'Das Mischgewebe ist bügelleicht, farbecht und für die Industriewäsche geeignet. Ihr Logo kommt als Bestickung oder Druck auf Brust oder Ärmel. Farben: Schwarz und Weiß, geeignet für Damen und Herren.',
        'Die Kochjacke ist in Kürze bestellbar. Für Vorbestellungen und Großmengen schreiben Sie uns gern über die Kontaktseite.',
      ],
      faq: [
        { q: 'Woraus besteht die Kochjacke?', a: 'Aus Profi-Twill mit 65 % Polyester und 35 % Baumwolle, ca. 220 g/m² – bügelleicht und für die Industriewäsche geeignet.' },
        { q: 'Kann das Logo auf die Kochjacke gestickt werden?', a: 'Ja, das Logo kann auf Brust oder Ärmel gestickt oder gedruckt werden.' },
      ],
    },
  },
};

/** Staffelpreise in die Platzhalter einsetzen. */
export function seoFuer(lang, product) {
  const s = PRODUKT_SEO[lang]?.[product.id];
  if (!s) return null;
  const tiers = [...(product.tiers ?? [])].filter((t) => t.price != null).sort((a, b) => a.minQty - b.minQty);
  const eur = (n) => `${Number(n).toFixed(2).replace('.', ',')} €`;
  const werte = tiers.length
    ? { start: eur(tiers[0].price), startMenge: tiers[0].minQty, ab: eur(tiers[tiers.length - 1].price), abMenge: tiers[tiers.length - 1].minQty }
    : null;
  const fuell = (t) => t.replace(/\{(\w+)\}/g, (_, k) => (werte && k in werte ? werte[k] : `{${k}}`));
  // Ohne Preise (z. B. „demnächst“) keine Sätze mit Preis-Platzhaltern ausgeben
  const ok = (t) => werte || !/\{(start|ab)/.test(t);
  return {
    title: s.title,
    h2: s.h2,
    absaetze: s.absaetze.filter(ok).map(fuell),
    faq: s.faq.filter((f) => ok(f.q) && ok(f.a)).map((f) => ({ q: fuell(f.q), a: fuell(f.a) })),
  };
}
