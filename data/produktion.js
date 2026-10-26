// Fotos aus Fertigung und Lager für /ueber-uns (2026-10-26). Nur Tonwert + Schärfe korrigiert,
// Motiv unverändert. `art` zeigt auf ueberUns.produktion.bild.<art> im Wörterbuch.
const ARTEN = [
  'zuschnitt', 'garn', 'lager', 'verpackt', 'veredelt', 'veredelt', 'verpackt', 'verpackt',
  'stofflager', 'stofflager', 'stofflager', 'stoff', 'stoff', 'stoff', 'stoff', 'verpackt', 'verpackt', 'verpackt',
];

export const PRODUKTION_BILDER = ARTEN.map((art, i) => {
  const nr = String(i + 1).padStart(2, '0');
  return { id: `produktion-${nr}`, src: `/images/produktion/kittelwerk-produktion-${nr}.webp`, art };
});
