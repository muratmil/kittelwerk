// Yönetim kurallarının testi.  node scripts/authz-test.mjs
// Yetki modeli sessizce bozulursa buradan yakalanır.
import {
  canCreateRole, creatableRoles, grantablePermissions, permissionsAllowed,
  canDelete, canResetPassword, canEditPermissions,
} from '../lib/authz.js';

let pass = 0, fail = 0;
const t = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass++; }
  else { fail++; console.log(`  ✗ ${name}\n      beklenen: ${JSON.stringify(expected)}\n      gelen:    ${JSON.stringify(actual)}`); }
};

const owner = { id: 'o1', role: 'owner', is_owner: true, permissions: [] };

// Her yetkiye sahip ama owner olmayan admin
const vollAdmin = {
  id: 'a1', role: 'admin', is_owner: false, created_by: 'o1',
  permissions: ['preise_sehen','haendler_konditionen','alle_bestellungen','preise_pflegen',
                'vertrieb_verwalten','haendler_verwalten','werkstatt_verwalten',
                'kunden_verwalten','passwort_zuruecksetzen','werkstatt_zuweisen'],
};

// Kısıtlı admin: fiyat göremez, yalnızca atölye yönetir
const kleinAdmin = {
  id: 'a2', role: 'admin', is_owner: false, created_by: 'o1',
  permissions: ['werkstatt_verwalten','werkstatt_zuweisen'],
};

const vertrieb  = { id: 'v1', role: 'vertrieb',  is_owner: false, created_by: 'o1', permissions: [] };
const werkstatt = { id: 'w1', role: 'werkstatt', is_owner: false, created_by: 'a2', permissions: [] };
const haendler  = { id: 'h1', role: 'haendler',  is_owner: false, created_by: 'o1', permissions: [] };

console.log('\n— Rol açma —');
t('owner admin açabilir',              canCreateRole(owner, 'admin'), true);
t('tam yetkili admin ADMIN AÇAMAZ',    canCreateRole(vollAdmin, 'admin'), false);
t('owner devredilemez',                canCreateRole(owner, 'owner'), false);
t('tam admin vertrieb açar',           canCreateRole(vollAdmin, 'vertrieb'), true);
t('kısıtlı admin vertrieb AÇAMAZ',     canCreateRole(kleinAdmin, 'vertrieb'), false);
t('kısıtlı admin werkstatt açar',      canCreateRole(kleinAdmin, 'werkstatt'), true);
t('vertrieb hiçbir rol açamaz',        creatableRoles(vertrieb), []);
t('owner listesi',                     creatableRoles(owner), ['admin','vertrieb','werkstatt','haendler','kunde']);
t('kısıtlı admin listesi',             creatableRoles(kleinAdmin), ['werkstatt']);

console.log('\n— Yetki devri (sahip olmadığını veremez) —');
t('owner hepsini verebilir',           grantablePermissions(owner).length, 10);
t('kısıtlı admin yalnızca kendininki', grantablePermissions(kleinAdmin), ['werkstatt_verwalten','werkstatt_zuweisen']);
t('kısıtlı admin fiyat yetkisi VEREMEZ',
  permissionsAllowed(kleinAdmin, ['preise_sehen']), false);
t('kısıtlı admin kendi yetkisini verir',
  permissionsAllowed(kleinAdmin, ['werkstatt_verwalten']), true);
t('owner her şeyi verir',              permissionsAllowed(owner, ['preise_sehen','preise_pflegen']), true);
t('vertrieb hiçbir şey veremez',       permissionsAllowed(vertrieb, ['werkstatt_zuweisen']), false);

console.log('\n— Silme —');
t('owner silinemez (admin)',           canDelete(vollAdmin, owner), false);
t('owner silinemez (owner)',           canDelete(owner, owner), false);
t('kimse kendini silemez',             canDelete(vollAdmin, vollAdmin), false);
t('owner admini siler',                canDelete(owner, vollAdmin), true);
t('admin admini SİLEMEZ',              canDelete(vollAdmin, kleinAdmin), false);
t('admin kendi açtığını siler',        canDelete(kleinAdmin, werkstatt), true);
t('admin başkasının açtığını silemez', canDelete(vollAdmin, werkstatt), false);
t('owner her zaman siler (sahipsiz kalmasın)', canDelete(owner, werkstatt), true);
t('vertrieb kimseyi silemez',          canDelete(vertrieb, haendler), false);

console.log('\n— Şifre sıfırlama —');
t('owner herkesinkini sıfırlar',       canResetPassword(owner, vollAdmin), true);
t('admin ADMIN şifresi sıfırlayamaz',  canResetPassword(vollAdmin, kleinAdmin), false);
t('admin owner şifresi sıfırlayamaz',  canResetPassword(vollAdmin, owner), false);
t('admin haendler şifresi sıfırlar',   canResetPassword(vollAdmin, haendler), true);
t('yetkisiz admin sıfırlayamaz',       canResetPassword(kleinAdmin, haendler), false);
t('herkes kendininkini sıfırlar',      canResetPassword(vertrieb, vertrieb), true);

console.log('\n— Yetki düzenleme —');
t('owner admin yetkisi düzenler',      canEditPermissions(owner, kleinAdmin), true);
t('admin admin yetkisi DÜZENLEYEMEZ',  canEditPermissions(vollAdmin, kleinAdmin), false);
t('owner yetkisi düzenlenemez',        canEditPermissions(owner, owner), false);

console.log(`\n${fail === 0 ? '✓' : '✗'} ${pass} geçti, ${fail} kaldı\n`);
process.exit(fail === 0 ? 0 : 1);
