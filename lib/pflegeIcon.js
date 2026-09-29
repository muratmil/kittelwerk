// Bakım talimatı simgesi (2026-09-29'da çok dilli yapıldı).
//
// Eskiden simge Almanca kelimeye bakarak seçiliyordu ("Maschinenwäsche" →
// 🧺); talimatlar çevrilince simgeler kayboluyordu. Kelimeler artık üç dilde.
// Sıra, eski Almanca sırayla aynı (makine/el yıkaması önce). Genel "yıka"
// kelimesi en sonda: "ters çevirerek yıkayın" ⚠️ almalı, 🧺 değil.
const KURALLAR = [
  [/maschinenwäsche|handwäsche|machine wash|hand wash|makinede|elde yıka/i, '🧺'],
  [/bleich|bleach|ağart/i, '🚫'],
  [/trockner|tumble|kurutma makine/i, '💨'],
  [/bügel|iron|ütü/i, '🌡️'],
  [/chemisch|dry.?clean|kuru temizle/i, '⚗️'],
  [/links waschen|inside out|ters çevir/i, '⚠️'],
  [/form|shape|şekl/i, '👐'],
  [/yıka|wash/i, '🧺'],
];

export function pflegeIcon(text = '') {
  for (const [re, icon] of KURALLAR) if (re.test(text)) return icon;
  return '•';
}
