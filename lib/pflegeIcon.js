// Bakım talimatı simgesi (2026-09-29'da çok dilli yapıldı).
//
// Eskiden simge Almanca kelimeye bakarak seçiliyordu ("Maschinenwäsche" →
// 🧺); talimatlar çevrilince simgeler kayboluyordu. Kelimeler artık üç dilde.
// Sıra, eski Almanca sırayla aynı (makine/el yıkaması önce). Genel "yıka"
// kelimesi en sonda: "ters çevirerek yıkayın" ⚠️ almalı, 🧺 değil.
const KURALLAR = [
  [/maschinenwäsche|handwäsche|machine wash|hand wash|makinede|elde yıka|lavage en machine|lavage à la main|lavado en máquina|lavar a máquina|lavaggio in lavatrice|стирка в машине|стирать/i, '🧺'],
  [/bleich|bleach|ağart|blanchir|javel|lejía|blanquear|candeggina|отбелива/i, '🚫'],
  [/trockner|tumble|kurutma makine|sèche-linge|seche-linge|secadora|asciugatrice|сушилк|сушка/i, '💨'],
  [/bügel|iron|ütü|repass|planch|stir|глад|утюг/i, '🌡️'],
  [/chemisch|dry.?clean|kuru temizle|nettoyage à sec|lavado en seco|lavasecco|химчистк/i, '⚗️'],
  [/links waschen|inside out|ters çevir|sur l['’]envers|del revés|del reves|al rovescio|наизнанку/i, '⚠️'],
  [/form|shape|şekl|remettre en forme|forma|восстанов/i, '👐'],
  [/yıka|wash|laver|lavar|lavare|стирк/i, '🧺'],
];

export function pflegeIcon(text = '') {
  for (const [re, icon] of KURALLAR) if (re.test(text)) return icon;
  return '•';
}
