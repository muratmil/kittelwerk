// İş takip ekranlarının biçimlendirmesi. Portalın geri kalanı Almanca ve euro
// odaklı; burası Türkçe ve çok para birimli olduğu için kendi yardımcıları var.

const SIMGE = { EUR: '€', TRY: '₺', USD: '$' };

export function para(tutar, birim = 'EUR') {
  const sayi = Number(tutar ?? 0);
  return `${sayi.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${SIMGE[birim] ?? birim}`;
}

export function tarih(deger) {
  if (!deger) return '—';
  return new Date(deger).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Vadeye kalan gün. Geçmişse eksi döner, vade yoksa null. */
export function kalanGun(vade) {
  if (!vade) return null;
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const hedef = new Date(vade);
  hedef.setHours(0, 0, 0, 0);
  return Math.round((hedef - bugun) / 86400000);
}

/** "70x200 ×2" — ölçüyü okunur yazar; sondaki gereksiz sıfırı atar. */
export function olcuYaz(o) {
  const kisa = (s) => (s === null || s === undefined ? null : String(Number(s)));
  const en = kisa(o.en_cm);
  const boy = kisa(o.boy_cm);
  const ebat = en && boy ? `${en}×${boy} cm` : en || boy ? `${en ?? boy} cm` : null;
  return [o.aciklama, ebat, o.adet > 1 ? `×${o.adet}` : null].filter(Boolean).join(' · ');
}

export const IS_DURUM = {
  teklif:     { label: 'Teklif',      cls: 'bg-sun text-ink' },
  devam:      { label: 'Devam ediyor', cls: 'bg-blue-100 text-blue-800' },
  tamamlandi: { label: 'Tamamlandı',  cls: 'bg-olive/20 text-olive' },
  teslim:     { label: 'Teslim',      cls: 'bg-ink/10 text-ink/50' },
};

export const KALEM_DURUM = {
  planlandi:  'Planlandı',
  uretimde:   'Üretimde',
  tamamlandi: 'Tamamlandı',
  iptal:      'İptal',
};
