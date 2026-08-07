'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * WWS işini arşive çeker / geri alır.
 *
 * Kalanı olan bir işi arşivlemek onu Vadeler listesinden düşürür — borç
 * duruyor ama artık hatırlatmıyor. Sessizce olmasın diye önce soruyor.
 */
export default function ArsivDugmesi({ isId, arsivde = false, kalan = 0, kucuk = false }) {
  const [bekliyor, basla] = useTransition();
  const [hata, setHata] = useState(null);
  const router = useRouter();

  const tikla = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!arsivde && Number(kalan) > 0
      && !confirm('Bu işin ödenmemiş bakiyesi var. Arşive çekilirse vade listesinde çıkmaz, ama borç cari hesapta durmaya devam eder. Devam edilsin mi?')) {
      return;
    }

    setHata(null);
    const res = await fetch('/api/portal/is-arsiv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: isId, arsiv: !arsivde }),
    });
    const veri = await res.json().catch(() => ({}));
    if (!res.ok) {
      setHata(veri.error ?? 'İşlem başarısız.');
      return;
    }
    basla(() => router.refresh());
  };

  return (
    <span className="inline-flex items-center gap-2">
      {hata && <span className="text-[10px] text-cch-danger">{hata}</span>}
      <button type="button" onClick={tikla} disabled={bekliyor}
        className={`shrink-0 rounded-sm border border-cch-line text-cch-muted hover:text-cch-dark hover:border-cch-mint transition-colors disabled:opacity-50
          ${kucuk ? 'px-2 py-1 text-[9px]' : 'px-3 py-1.5 text-[10px]'} font-medium uppercase tracking-[0.14em]`}>
        {bekliyor ? '…' : arsivde ? 'Geri al' : 'Arşive çek'}
      </button>
    </span>
  );
}
