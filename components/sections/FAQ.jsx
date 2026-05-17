'use client';
import { useState } from 'react';

const ITEMS = [
  { q: 'Wie funktioniert die Bestellung?', a: 'Produkte und Mengen wählen, Anfrage absenden und Logo hochladen. Wir senden Ihnen einen digitalen Korrekturabzug (Druckvorschau) zur Freigabe. Erst nach Ihrer Freigabe starten wir die Produktion.' },
  { q: 'Was ist die Mindestbestellmenge?', a: 'Mindestens 10 Stück gesamt — verschiedene Produkte kombinierbar. Beispiel: 5 T-Shirts + 3 Schürzen + 2 Kappen = gültig.' },
  { q: 'Welche Drucktechniken gibt es?', a: 'DTF-Druck: kostenlos, vollfarbig, ab 10 Stück. Siebdruck: ab 150 Stück, auf T-Shirts kostenlos, sonst +3€/Stk. Bestickung: ab 10 Stück, Brust vorne +2€/Stk — hochwertig und industriewaschfest. Mehr Infos auf unserer Druckinfo-Seite.' },
  { q: 'Sehe ich das Logo vor der Produktion?', a: 'Ja — immer. Nach der Bestellung erhalten Sie einen kostenlosen digitalen Korrekturabzug. Produktion startet erst nach Ihrer Freigabe. Keine Überraschungen.' },
  { q: 'Welche Größen gibt es?', a: 'T-Shirts und Sweatshirts in XS, S, M, L, XL und 2XL. Schürzen und Kappen sind One-Size.' },
  { q: 'Wie lange dauert die Lieferung?', a: 'T-Shirts und Schürzen: 1–2 Wochen ab Zahlungseingang. Sweatshirts, Fleece-Jacken und Kappen: 3–4 Wochen. Versand per DHL oder DPD mit Sendungsverfolgung. Deutschlandweiter Versand.' },
  { q: 'Was ist, wenn ich kein Vektorlogo habe?', a: 'Sie können beim Bestellen unseren Logo-Erstellungsservice für 50€ dazubuchen. Ein Partner-Grafiker vektorisiert Ihr Logo professionell — wir koordinieren alles.' },
  { q: 'Wie läuft die Zahlung ab?', a: 'SEPA-Überweisung auf deutsches Konto. Keine Auslandsüberweisung. Rechnung mit USt. per Mail.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-24 bg-paper border-t-4 border-ink" id="faq">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">— Häufige Fragen —</span>
          <h2 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
            Kurz <span className="text-tomato">und</span> klar.
          </h2>
        </div>
        <div className="border-t-2 border-ink">
          {ITEMS.map((item, i) => (
            <div key={i} className="border-b-2 border-ink">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex justify-between items-center gap-4 py-5 text-left font-serif font-black text-lg hover:text-tomato transition-colors"
              >
                {item.q}
                <span className="text-tomato text-2xl font-light flex-shrink-0">{open === i ? '×' : '+'}</span>
              </button>
              {open === i && (
                <p className="pb-5 text-sm text-ink/70 leading-relaxed">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
