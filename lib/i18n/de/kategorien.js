// Ürün listesi + kategori sayfaları. Kategori metinleri SEO için yazıldı
// (2026-09-23): aranan kelimeler burada geçiyor. Anahtar = kategori slug'ı.
export default {
  liste: {
    kittelwerk: 'Kittelwerk',
    produkte: 'Produkte',
    kicker: '— Die Auswahl —',
    titel: 'Unsere Produkte.',
    text1: 'Alle Artikel in ',
    farben: 'Schwarz · Weiß · Rot',
    text2: ' · Mindestbestellung: ',
    menge: '10 Stück gesamt',
    alleAnsehen: 'Alle ansehen →',
    banner1: '⚡ Mindestbestellmenge: ',
    bannerMenge: '10 Stück gesamt',
    banner2: ' (Produkte kombinierbar) · Versandkosten: ab 9,90 € · Logo-Druck kostenlos inklusive',
    gutZuWissen: 'Gut zu wissen',
    alleProdukte: '← Alle Produkte',
    angebot: 'Angebot anfordern',
    meta: {
      title: 'Gastro-Textilien kaufen | Schürzen, T-Shirts & Kappen — Kittelwerk',
      description: 'Gastro-Textilien direkt vom Hersteller: Latzschürzen, T-Shirts, Kappen & mehr inkl. kostenlosem Logo-Druck. Ab 10 Stück. Deutschlandweiter Versand.',
      ogTitle: 'Gastro-Textilien kaufen | Kittelwerk',
      ogDescription: 'Schürzen, T-Shirts & Kappen inkl. kostenlosem Logo-Druck. Ab 10 Stück.',
    },
  },
  kategorien: {
    arbeitskleidung: {
      label: 'Arbeitskleidung',
      eyebrow: 'Arbeitskleidung mit Logo',
      h1: 'Arbeitskleidung bedruckt & bestickt.',
      sub: 'T-Shirts, Polos, Hoodies, Jacken & mehr',
      title: 'Arbeitskleidung mit Logo bedrucken lassen | ab 10 Stück — Kittelwerk',
      description:
        'Arbeitskleidung mit Firmenlogo: T-Shirts, Polo-Shirts, Sweatshirts, Hoodies und Fleecejacken — Logo-Druck vorne und hinten kostenlos, schon ab 10 Stück, Größen bis 4XL. Direkt ab Werk, deutschlandweiter Versand.',
      intro:
        'Ob Gastronomie, Werkstatt, Handwerk oder Einzelhandel: Ihr Team tritt einheitlich auf, Ihr Logo ist auf jedem Teil dabei. Alle Artikel gibt es schon ab 10 Stück — auch gemischt über mehrere Produkte hinweg — und der Druck vorne und hinten ist im Preis enthalten.',
      hinweise: [
        'Logo-Druck vorne und hinten ohne Aufpreis, Bestickung auf Wunsch.',
        'Größen XS bis 4XL (3XL und 4XL mit 1 € Aufpreis je Stück).',
        'Mindestmenge 10 Stück gesamt — Produkte sind kombinierbar.',
        'Nachbestellungen jederzeit möglich, gleiche Farbe und Qualität.',
      ],
      // Ratgeber (2026-10-27, SEO): Seite zielt auf „Arbeitskleidung bedrucken lassen (online)“
      // (Platz 76–99). Nur Fakten, die auch auf /druckinfo und den Produktseiten stehen.
      ratgeber: {
        h2: 'Arbeitskleidung bedrucken lassen — so funktioniert es',
        absaetze: [
          'Arbeitskleidung mit Logo bedrucken lassen geht bei Kittelwerk komplett online: Sie wählen die Teile, laden Ihr Logo hoch und erhalten vor der Produktion eine kostenlose Druckvorschau. Erst nach Ihrer Freigabe wird gedruckt — so landet kein Logo an der falschen Stelle.',
          'Für T-Shirts, Polos und Hoodies nutzen wir DTF-Druck: vollfarbig, weich auf der Haut und schon ab 10 Stück wirtschaftlich. Bei größeren Mengen mit wenigen Farben ist Siebdruck die langlebigste Wahl. Sweatshirts und Fleecejacken können Sie alternativ besticken lassen — das Logo wird direkt ins Gewebe genäht.',
          'Der Druck vorne (Brust, 10 × 10 cm) und hinten (bis 24 cm breit) ist im Stückpreis enthalten. Die Mindestmenge von 10 Stück gilt für die gesamte Bestellung, Sie können also T-Shirts, Polos und Jacken frei kombinieren.',
        ],
        schritte: [
          { t: 'Auswählen', d: 'Produkte, Farben, Größen und Mengen wählen — ab 10 Stück gesamt.' },
          { t: 'Logo hochladen', d: 'Am besten als Vektordatei (AI, EPS, PDF). Kein Vektorlogo? Wir vermitteln einen Grafiker.' },
          { t: 'Vorschau freigeben', d: 'Sie erhalten eine digitale Druckvorschau. Korrekturen sind kostenlos.' },
          { t: 'Lieferung', d: 'Versand per DHL oder DPD. T-Shirts: 1–2 Wochen, Sweat & Fleece: 3–4 Wochen.' },
        ],
        faq: [
          { q: 'Ab welcher Menge kann ich Arbeitskleidung bedrucken lassen?', a: 'Ab 10 Stück insgesamt. Die Menge gilt für die ganze Bestellung, verschiedene Produkte lassen sich kombinieren.' },
          { q: 'Was kostet der Logo-Druck?', a: 'Der Druck vorne und hinten ist im Stückpreis enthalten. Bestickung kostet 3,00 € pro Stück Aufpreis (nicht für T-Shirts).' },
          { q: 'Welches Druckverfahren ist das richtige?', a: 'DTF-Druck für farbige, detailreiche Logos ab 10 Stück; Siebdruck für große Mengen mit 1–3 Farben; Bestickung für einen hochwertigen Look auf Sweat, Fleece, Schürzen und Kappen.' },
          { q: 'Sehe ich mein Logo vor der Produktion?', a: 'Ja. Sie bekommen eine kostenlose digitale Druckvorschau, und produziert wird erst nach Ihrer Freigabe.' },
          { q: 'Wie lange dauert die Lieferung?', a: 'T-Shirts und Schürzen 1–2 Wochen, Sweatshirts, Fleecejacken und Kappen 3–4 Wochen — deutschlandweit mit Sendungsverfolgung.' },
        ],
      },
    },
    schuerzen: {
      label: 'Schürzen',
      eyebrow: 'Schürzen mit Logo',
      h1: 'Schürzen für Service & Küche.',
      sub: 'Vorbinder-, Latz- & Bistroschürzen',
      title: 'Schürzen mit Logo besticken lassen | Vorbinder, Latz- & Bistroschürze — Kittelwerk',
      description:
        'Schürzen für Gastronomie und Service: Vorbinder-Schürze, Latzschürze und Bistroschürze (Barista-Schürze) aus Canvas mit Lederriemen. Bestickung oder Druck des Firmenlogos kostenlos, ab 10 Stück, deutschlandweiter Versand.',
      intro:
        'Vom kurzen Vorbinder für den Service über die klassische Latzschürze bis zur Bistro- bzw. Barista-Schürze aus festem Canvas mit Lederriemen. Robuste Stoffe, die Industriewäsche vertragen, und Ihr Logo auf der Brust — kostenlos ab 10 Stück.',
      hinweise: [
        'Vorbinder- und Latzschürze aus Alpaka-Gewebe, für Industriewäsche geeignet.',
        'Bistroschürze (Barista-Schürze) aus Canvas mit verstellbaren Lederriemen, mit oder ohne Taschen.',
        'Logo-Bestickung oder -Druck inklusive.',
        'Einheitsgröße mit langen Bindebändern — passt jedem im Team.',
      ],
    },
    accessoires: {
      label: 'Accessoires',
      eyebrow: 'Accessoires mit Logo',
      h1: 'Kappen, Beanies & Extras.',
      sub: 'Kappen, Beanies & Extras',
      title: 'Kappen & Beanies mit Logo besticken lassen | ab 10 Stück — Kittelwerk',
      description:
        'Team-Kappen und Strick-Beanies mit Ihrem Firmenlogo besticken lassen — ab 10 Stück, kostenlose Bestickung, deutschlandweiter Versand. Direkt vom Hersteller.',
      intro:
        'Die Kappe ist das Teil, das Ihr Team jeden Tag trägt — und das Logo auf Augenhöhe zeigt. Präzise Bestickung statt Druck, damit die Stickerei auch nach vielen Wäschen sauber bleibt.',
      hinweise: [
        'Bestickung statt Druck: haltbar, hochwertig, waschfest.',
        'Ab 10 Stück, auch zusammen mit Bekleidung und Schürzen bestellbar.',
        'Einheitsgröße mit Verschluss — passt jedem.',
      ],
    },
  },
};
