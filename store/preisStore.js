'use client';
import { create } from 'zustand';
import { MWST_SATZ } from '@/store/cartStore';

// Anzeige-Modus der Preise. Gespeichert wird immer netto (B2B, Verkäufer Vidomedia UG);
// "brutto" rechnet nur für die Anzeige die MwSt. drauf.
const SCHLUESSEL = 'kw-preisanzeige';

export const usePreisStore = create((set) => ({
  modus: 'netto',
  setModus: (modus) => {
    try { localStorage.setItem(SCHLUESSEL, modus); } catch {}
    set({ modus });
  },
  ladeGespeichert: () => {
    try {
      const m = localStorage.getItem(SCHLUESSEL);
      if (m === 'netto' || m === 'brutto') set({ modus: m });
    } catch {}
  },
}));

export function anzeigePreis(netto, modus) {
  return modus === 'brutto' ? Math.round(netto * (100 + MWST_SATZ)) / 100 : netto;
}

export function usePreis() {
  const modus = usePreisStore((s) => s.modus);
  return { modus, preis: (netto) => anzeigePreis(netto, modus) };
}
