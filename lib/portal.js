// Portalın tek doğruluk kaynağı: hangi rol nereye girer, menüde ne görür.
// Middleware, giriş sayfası ve kabuk hep buradan okur — kural tek yerde dursun.

// Portalın adı. Artık yalnız Kittelwerk'in değil — Wipello ve iş takip de
// burada, o yüzden "Kittelwerk Portal" adı bırakıldı. Tek yerde duruyor ki
// sayfa başlıkları ve giriş ekranı birbirinden ayrışmasın.
export const PORTAL_NAME = 'Central Communication Hub';
export const PORTAL_SHORT = 'CCH';
export const PORTAL_TITLE = `${PORTAL_NAME} (${PORTAL_SHORT})`;

export const ROLES = ['owner', 'admin', 'vertrieb', 'haendler', 'werkstatt', 'kunde'];

// Rol adlarının ekranda görünen hâli
export const ROLE_LABELS = {
  owner:     'Inhaber',
  admin:     'Admin',
  vertrieb:  'Vertrieb',
  haendler:  'Händler',
  werkstatt: 'Werkstatt',
  kunde:     'Kunde',
};

// Alanlar. `roles` = bu adrese girebilen roller.
// owner ve admin her alana girebilir — "tek platformdan hepsini göreyim".
export const AREAS = [
  { path: '/admin',       label: 'Verwaltung', roles: ['owner', 'admin'] },
  { path: '/bestellung',  label: 'Bestellungen', roles: ['owner', 'admin', 'vertrieb'] },
  { path: '/werkstatt',   label: 'Werkstatt',  roles: ['owner', 'admin', 'werkstatt'] },
  { path: '/haendler',    label: 'Händler',    roles: ['owner', 'admin', 'haendler'] },
  // WWS: Murat'ın kendi reklam işleri ve cari hesabı (eski adı "İş Takip",
  // adres /is-takip olarak bırakıldı). Kittelwerk'in işleyişiyle ilgisi yok,
  // YALNIZCA owner girer — admin bile göremez. Sistemin görünen adı yalnız
  // burada yazılı; menü de sayfa başlığı da bu satırdan okuyor.
  // Ekranı bilerek Türkçe: burası tek kullanıcılı ve verinin kendisi Türkçe.
  { path: '/is-takip',    label: 'WWS',        roles: ['owner'] },
  // '/konto' (kunde) 2. fazda açılacak — rolü ve adresi hazır, ekranı yok.
];

// Giriş yapınca rolün gittiği yer
export const ROLE_HOME = {
  owner:     '/admin',
  admin:     '/admin',
  vertrieb:  '/bestellung',
  werkstatt: '/werkstatt',
  haendler:  '/haendler',
  kunde:     '/konto',
};

// Korunan alanların içinde kalan ama giriş istemeyen sayfalar
export const OPEN_PATHS = [
  '/haendler/registrierung',
  '/werkstatt/registrierung',
];

export function areaForPath(pathname) {
  return AREAS.find((a) => pathname === a.path || pathname.startsWith(a.path + '/'));
}

// Bir alanın görünen adı. Sayfa başlıkları bunu kullansın ki menüdeki adla
// ayrışmasın — "İş Takip" beş ayrı yere elle yazılmıştı, WWS'e dönerken
// biri unutulsa sessizce iki isim görünürdü.
export function areaLabel(pathname) {
  return areaForPath(pathname)?.label ?? '';
}

export function canEnter(role, pathname) {
  const area = areaForPath(pathname);
  if (!area) return true;
  return area.roles.includes(role);
}

export function homeFor(role) {
  return ROLE_HOME[role] ?? '/login';
}

export function navFor(role) {
  return AREAS.filter((a) => a.roles.includes(role));
}

// Admin yetki kutucukları. Yeni yetki eklemek için buraya bir satır yeter —
// veritabanı göçü gerekmez, çünkü permissions bir metin dizisi.
export const PERMISSIONS = [
  { key: 'preise_sehen',           label: 'Preise & Umsätze sehen' },
  { key: 'haendler_konditionen',   label: 'Händler-Konditionen sehen' },
  { key: 'alle_bestellungen',      label: 'Alle Bestellungen sehen' },
  { key: 'preise_pflegen',         label: 'Preise pflegen & freigeben' },
  { key: 'vertrieb_verwalten',     label: 'Vertrieb anlegen / löschen' },
  { key: 'haendler_verwalten',     label: 'Händler verwalten' },
  { key: 'werkstatt_verwalten',    label: 'Werkstätten verwalten' },
  { key: 'kunden_verwalten',       label: 'Kundenkonten verwalten' },
  { key: 'passwort_zuruecksetzen', label: 'Passwörter zurücksetzen' },
  { key: 'werkstatt_zuweisen',     label: 'Aufträge zuweisen' },
];

export function hasPermission(profile, key) {
  if (!profile) return false;
  if (profile.is_owner) return true;
  return profile.role === 'admin' && (profile.permissions ?? []).includes(key);
}

// CCH paleti: iş ilerledikçe nötrden naneye, biten iş soluk, iptal uyarı rengi.
// Turuncu/mavi gibi palet dışı renkler kaldırıldı — referans tasarım nane+gri.
export const ORDER_STATUS = {
  neu:            { label: 'Neu',            cls: 'bg-cch-ash text-cch-slate' },
  in_produktion:  { label: 'In Produktion',  cls: 'bg-cch-soft text-cch-dark' },
  pausiert:       { label: 'Pausiert',       cls: 'bg-cch-danger/10 text-cch-danger' },
  versandt:       { label: 'Versandt',       cls: 'bg-cch-mint text-white' },
  abgeschlossen:  { label: 'Abgeschlossen',  cls: 'bg-cch-slate/10 text-cch-muted' },
  storniert:      { label: 'Storniert',      cls: 'bg-cch-slate/10 text-cch-muted line-through' },
  // Teklif çemberi — Wipello'dan gelen kayıtlar burada başlıyor.
  angebot_offen:       { label: 'Angebot offen',      cls: 'bg-cch-ash text-cch-slate' },
  angebot_kontaktiert: { label: 'Kontaktiert',        cls: 'bg-cch-soft text-cch-dark' },
  angebot_angenommen:  { label: 'Angebot angenommen', cls: 'bg-cch-mint text-white' },
  angebot_abgelehnt:   { label: 'Angebot abgelehnt',  cls: 'bg-cch-danger/10 text-cch-danger' },
};

export const KIND_LABELS = { bestellung: 'Bestellung', angebot: 'Angebot' };

// --- Sistem tonları ---------------------------------------------------------
// Tek listede birden çok sistemin siparişi var; hangisinin nereden geldiği
// rozeti okumadan da anlaşılsın diye her sisteme bir ton veriliyor.
// Tonlar CCH paletiyle aynı sakinlikte: doygunluk düşük, hepsi aynı ailede.
//
// Bilinen siteler sabit ton alır (renk zamanla değişmesin, göz alışsın).
// Bilinmeyen bir site eklenirse id'sinden türeyen kararlı bir ton alır —
// yeni site eklemek için burayı düzenlemek gerekmiyor.
const SITE_TONE_MAP = {
  kittelwerk: {
    border: 'border-cch-mint',
    badge:  'bg-cch-mint text-white',
    soft:   'bg-cch-mint/5',
  },
  wipello: {
    border: 'border-[#7BA7C7]',
    badge:  'bg-[#7BA7C7] text-white',
    soft:   'bg-[#7BA7C7]/5',
  },
};

// Sıradaki sistemler için hazır tonlar — palete uyumlu, birbirinden ayrık.
const YEDEK_TONLAR = [
  { border: 'border-[#C7A46F]', badge: 'bg-[#C7A46F] text-white', soft: 'bg-[#C7A46F]/5' },
  { border: 'border-[#A88BBE]', badge: 'bg-[#A88BBE] text-white', soft: 'bg-[#A88BBE]/5' },
  { border: 'border-[#8FB58A]', badge: 'bg-[#8FB58A] text-white', soft: 'bg-[#8FB58A]/5' },
  { border: 'border-[#C98F8F]', badge: 'bg-[#C98F8F] text-white', soft: 'bg-[#C98F8F]/5' },
];

export function siteTone(siteId) {
  if (!siteId) return SITE_TONE_MAP.kittelwerk;
  if (SITE_TONE_MAP[siteId]) return SITE_TONE_MAP[siteId];
  // Kararlı seçim: aynı site her açılışta aynı tonu alsın.
  let toplam = 0;
  for (let i = 0; i < siteId.length; i++) toplam = (toplam + siteId.charCodeAt(i)) % 997;
  return YEDEK_TONLAR[toplam % YEDEK_TONLAR.length];
}

export const SOURCE_LABELS = {
  web:      'Webshop',
  haendler: 'Händler',
  kunde:    'Kundenkonto',
  intern:   'Intern',
};
