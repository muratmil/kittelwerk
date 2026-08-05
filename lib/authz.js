// Yönetim kuralları — TEK yer. Hem API uçları hem arayüz buradan okur.
// Saf fonksiyonlar: veritabanı yok, yan etki yok, dolayısıyla test edilebilir.
// scripts/authz-test.mjs bunları doğruluyor.

// Uzantı bilerek yazıldı: Next.js'in yanı sıra düz node da (authz-test.mjs) okuyor.
import { PERMISSIONS } from './portal.js';

// Hangi rolü açmak hangi kutucuğu gerektiriyor.
// 'admin' bilerek listede yok: admin açmak/silmek yalnızca owner'ın işi.
const ROLE_REQUIRES = {
  vertrieb:  'vertrieb_verwalten',
  werkstatt: 'werkstatt_verwalten',
  haendler:  'haendler_verwalten',
  kunde:     'kunden_verwalten',
};

export function isAdminish(p) {
  return !!p && (p.is_owner || p.role === 'admin');
}

export function has(actor, key) {
  if (!actor) return false;
  if (actor.is_owner) return true;
  return actor.role === 'admin' && (actor.permissions ?? []).includes(key);
}

/** Bu kişi hangi rolleri açabilir? */
export function canCreateRole(actor, role) {
  if (!actor) return false;
  if (role === 'owner') return false;              // owner devri ayrı bir iş
  if (role === 'admin') return !!actor.is_owner;   // admin'i yalnızca owner açar
  const needed = ROLE_REQUIRES[role];
  if (!needed) return false;
  return has(actor, needed);
}

export function creatableRoles(actor) {
  return ['admin', 'vertrieb', 'werkstatt', 'haendler', 'kunde']
    .filter((r) => canCreateRole(actor, r));
}

/**
 * Yeni bir admin açarken hangi kutucukları işaretleyebilir?
 * Kural: kimse sahip olmadığı yetkiyi veremez — yoksa yetkisi olmayan admin,
 * kendine yetkili ikinci bir hesap açıp kuralı deler.
 */
export function grantablePermissions(actor) {
  if (!actor) return [];
  if (actor.is_owner) return PERMISSIONS.map((p) => p.key);
  if (actor.role !== 'admin') return [];
  return PERMISSIONS.map((p) => p.key).filter((k) => (actor.permissions ?? []).includes(k));
}

export function permissionsAllowed(actor, requested) {
  const ok = new Set(grantablePermissions(actor));
  return (requested ?? []).every((k) => ok.has(k));
}

/**
 * Silme — zincir değil rütbe:
 *   1. Kendi atadığını silebilirsin.
 *   2. Owner herkesi silebilir.
 *   3. Owner silinemez, kimse kendini silemez.
 * (2) olmadan, atayan kişi gidince atadıkları sonsuza kadar silinemez kalırdı.
 */
export function canDelete(actor, target) {
  if (!actor || !target) return false;
  if (target.is_owner) return false;
  if (actor.id === target.id) return false;
  if (actor.is_owner) return true;
  if (actor.role !== 'admin') return false;
  if (target.role === 'admin') return false;       // admin'i yalnızca owner siler
  if (target.created_by !== actor.id) return false;
  return canCreateRole(actor, target.role);
}

/**
 * Şifre sıfırlama. Kritik incelik: bir admin başka bir admin'in şifresini
 * sıfırlayabilseydi, o hesaba girip sahip olmadığı yetkileri kullanırdı.
 * Bu yüzden admin yalnızca admin OLMAYAN hesapların şifresini sıfırlar.
 */
export function canResetPassword(actor, target) {
  if (!actor || !target) return false;
  if (actor.id === target.id) return true;         // kendi şifresi
  if (actor.is_owner) return true;
  if (!has(actor, 'passwort_zuruecksetzen')) return false;
  if (target.is_owner || target.role === 'admin') return false;
  return true;
}

/** Bir admin'in yetkilerini/rolünü değiştirmek — yalnızca owner. */
export function canEditPermissions(actor, target) {
  if (!actor || !target) return false;
  if (target.is_owner) return false;
  return !!actor.is_owner;
}

export function describeDenial(actor, target, action) {
  if (target?.is_owner) return 'Der Inhaber kann nicht geändert oder gelöscht werden.';
  if (actor?.id === target?.id && action === 'delete') return 'Sie können Ihr eigenes Konto nicht löschen.';
  if (target?.role === 'admin' && !actor?.is_owner) return 'Nur der Inhaber darf Admin-Konten verwalten.';
  return 'Kein Zugriff.';
}
