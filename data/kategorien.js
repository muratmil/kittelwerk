/**
 * Kategori sayfalarının metinleri (2026-09-23).
 *
 * Her kategori kendi sayfasında kendi başlığı, kendi Google açıklaması ve
 * kendi giriş metniyle duruyor — aranan kelimeler burada geçiyor:
 * Arbeitskleidung, Berufsbekleidung, Schürzen, Latzschürze, Barista-Schürze,
 * bedruckt, besticken, Firmenlogo, ab 10 Stück.
 *
 * `key` alanı `products.category` ile birebir aynı olmalı.
 */
export const KATEGORIEN = [
  {
    slug: 'arbeitskleidung',
    key: 'bekleidung',
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
  },
  {
    slug: 'schuerzen',
    key: 'schuerzen',
    label: 'Schürzen',
    eyebrow: 'Schürzen mit Logo',
    h1: 'Schürzen für Service & Küche.',
    sub: 'Vorbinder-, Latz- & Barista-Schürzen',
    title: 'Schürzen mit Logo besticken lassen | Vorbinder, Latz & Barista — Kittelwerk',
    description:
      'Schürzen für Gastronomie und Service: Vorbinder-Schürze, Latzschürze und Barista-Schürze aus Canvas mit Lederriemen. Bestickung oder Druck des Firmenlogos kostenlos, ab 10 Stück, deutschlandweiter Versand.',
    intro:
      'Vom kurzen Vorbinder für den Service über die klassische Latzschürze bis zur Barista-Schürze aus festem Canvas mit Lederriemen. Robuste Stoffe, die Industriewäsche vertragen, und Ihr Logo auf der Brust — kostenlos ab 10 Stück.',
    hinweise: [
      'Vorbinder- und Latzschürze aus Alpaka-Gewebe, für Industriewäsche geeignet.',
      'Barista-Schürze aus Canvas mit verstellbaren Lederriemen, mit oder ohne Taschen.',
      'Logo-Bestickung oder -Druck inklusive.',
      'Einheitsgröße mit langen Bindebändern — passt jedem im Team.',
    ],
  },
  {
    slug: 'accessoires',
    key: 'accessoires',
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
];

export const kategorieBySlug = (slug) => KATEGORIEN.find((k) => k.slug === slug) ?? null;
