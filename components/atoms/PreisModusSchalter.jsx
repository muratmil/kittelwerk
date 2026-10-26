'use client';
import { useEffect } from 'react';
import { usePreisStore } from '@/store/preisStore';
import { useSprache } from '@/components/i18n/SpracheProvider';

export default function PreisModusSchalter({ className = '' }) {
  const { modus, setModus, ladeGespeichert } = usePreisStore();
  const { t } = useSprache();

  // Erst nach dem Mounten lesen, sonst weicht der Server-HTML vom Client ab.
  useEffect(() => { ladeGespeichert(); }, [ladeGespeichert]);

  return (
    <div role="group" aria-label={t.preisModus.label}
      className={`inline-flex border-2 border-ink text-[10px] font-black uppercase tracking-wider ${className}`}>
      {['netto', 'brutto'].map((m) => (
        <button key={m} type="button" onClick={() => setModus(m)} aria-pressed={modus === m}
          className={`px-2.5 py-1.5 transition-colors ${modus === m ? 'bg-ink text-white' : 'bg-paper hover:bg-sun'}`}>
          {t.preisModus[m]}
        </button>
      ))}
    </div>
  );
}
