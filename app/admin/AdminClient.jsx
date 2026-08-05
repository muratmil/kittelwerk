'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { PERMISSIONS, ROLE_LABELS } from '@/lib/portal';
import {
  creatableRoles, grantablePermissions, canDelete, canResetPassword,
  canEditPermissions, has,
} from '@/lib/authz';
import {
  RefreshCw, UserPlus, Trash2, KeyRound, Copy, Check, X, Factory, Users, ShieldAlert,
  Package, Tag, BadgeCheck,
} from 'lucide-react';
import BestellungenTab from './BestellungenTab';
import PreiseTab from './PreiseTab';
import FreigabenTab from './FreigabenTab';

function tabsFor(profile) {
  const t = [{ key: 'bestellungen', label: 'Bestellungen', icon: Package }];
  if (hasPerm(profile, 'haendler_verwalten') || hasPerm(profile, 'werkstatt_verwalten')
      || hasPerm(profile, 'haendler_konditionen')) {
    t.push({ key: 'freigaben', label: 'Freigaben', icon: BadgeCheck });
  }
  if (hasPerm(profile, 'preise_sehen') || hasPerm(profile, 'preise_pflegen')) {
    t.push({ key: 'preise', label: 'Preise', icon: Tag });
  }
  t.push({ key: 'benutzer', label: 'Benutzer', icon: Users });
  if (hasPerm(profile, 'werkstatt_verwalten')) {
    t.push({ key: 'werkstatt', label: 'Werkstätten', icon: Factory });
  }
  return t;
}

// Yetki kontrolü lib/portal'dan; burada kısa ad.
function hasPerm(p, key) {
  if (!p) return false;
  if (p.is_owner) return true;
  return p.role === 'admin' && (p.permissions ?? []).includes(key);
}

export default function AdminClient({ profile, catalog, sites = [], activeSite = null }) {
  const TABS = tabsFor(profile);
  const [tab, setTab] = useState(TABS[0].key);
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [secret, setSecret] = useState(null); // { email, password }
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [{ data: u }, { data: w }] = await Promise.all([
      supabase.from('profiles')
        .select('id, email, role, is_owner, permissions, created_by, company, werkstatt_id, created_at')
        .order('created_at'),
      supabase.from('werkstaetten').select('id, name, contact_name, email, active').order('name'),
    ]);
    setUsers(u ?? []);
    setShops(w ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const call = async (url, method, body) => {
    setError('');
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error ?? 'Aktion fehlgeschlagen.'); return null; }
    await load();
    return data;
  };

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`border-2 border-ink px-4 py-2 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors
                ${active ? 'bg-ink text-white' : 'bg-white hover:bg-sun'}`}>
              <Icon size={13} />{t.label}
            </button>
          );
        })}
        <button onClick={load} disabled={loading}
          className="ml-auto border-2 border-ink px-4 py-2 text-[11px] font-black uppercase tracking-widest bg-white hover:bg-sun flex items-center gap-2 disabled:opacity-50">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />Aktualisieren
        </button>
      </nav>

      {error && (
        <p className="border-4 border-tomato bg-tomato/10 text-tomato p-4 text-sm font-bold flex items-start gap-2">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />{error}
        </p>
      )}

      {secret && <SecretBox secret={secret} onClose={() => setSecret(null)} />}

      {tab === 'benutzer' && (
        <BenutzerTab
          profile={profile} users={users} shops={shops} loading={loading}
          onCreate={async (payload) => {
            const r = await call('/api/portal/benutzer', 'POST', payload);
            if (r?.password) setSecret({ email: payload.email, password: r.password });
            return !!r;
          }}
          onDelete={(id) => call('/api/portal/benutzer', 'DELETE', { id })}
          onPermissions={(id, permissions) => call('/api/portal/benutzer', 'PATCH', { id, permissions })}
          onReset={async (u) => {
            const r = await call('/api/portal/passwort', 'POST', { id: u.id });
            if (r?.password) setSecret({ email: u.email, password: r.password });
          }}
        />
      )}

      {tab === 'werkstatt' && (
        <WerkstattTab
          profile={profile} shops={shops} loading={loading}
          onCreate={(payload) => call('/api/portal/werkstatt', 'POST', payload)}
          onToggle={(id, active) => call('/api/portal/werkstatt', 'PATCH', { id, active })}
        />
      )}

      {tab === 'bestellungen' && <BestellungenTab profile={profile} sites={sites} />}

      {tab === 'freigaben' && <FreigabenTab profile={profile} onError={setError} />}

      {tab === 'preise' && (
        <PreiseTab
          profile={profile} catalog={catalog} activeSite={activeSite}
          siteName={sites.find((s) => s.id === activeSite)?.name}
          onChange={async (payload) => {
            const r = await call('/api/portal/preise', 'PATCH', { site_id: activeSite, ...payload });
            if (r) router.refresh();   // fiyatlar sunucuda hesaplanıyor, sayfayı tazele
            return r;
          }}
          onRate={async (payload) => {
            const r = await call('/api/portal/preise', 'POST', payload);
            if (r) router.refresh();
            return r;
          }}
          onSettings={async (payload) => {
            const r = await call('/api/portal/preise', 'PATCH', { art: 'einstellungen', site_id: activeSite, ...payload });
            if (r) router.refresh();
            return r;
          }}
        />
      )}
    </div>
  );
}

/* --------------------------------------------------------------- şifre kutusu */
function SecretBox({ secret, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(secret.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="border-4 border-sun bg-sun/20 p-5 shadow-brutalist">
      <div className="flex items-start gap-3">
        <KeyRound size={18} className="shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h2 className="font-black text-sm uppercase tracking-widest">Passwort für {secret.email}</h2>
          <p className="text-[11px] opacity-70 mt-1 mb-3 leading-relaxed">
            Dieses Passwort wird <strong>nur jetzt</strong> angezeigt. Es ist nirgendwo gespeichert
            und kann nicht erneut abgerufen werden — nur neu vergeben.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="bg-white border-2 border-ink px-3 py-2 font-mono text-base tracking-wider select-all break-all">
              {secret.password}
            </code>
            <button onClick={copy}
              className="border-2 border-ink px-3 py-2 text-[11px] font-black uppercase tracking-widest bg-white hover:bg-sun flex items-center gap-2">
              {copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Kopiert' : 'Kopieren'}
            </button>
          </div>
        </div>
        <button onClick={onClose} aria-label="Schließen" className="border-2 border-ink p-1.5 hover:bg-tomato hover:text-white">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- benutzer */
function BenutzerTab({ profile, users, shops, loading, onCreate, onDelete, onPermissions, onReset }) {
  const [showForm, setShowForm] = useState(false);
  const roles = creatableRoles(profile);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {roles.length > 0 ? (
          <button onClick={() => setShowForm((v) => !v)}
            className="bg-ink text-white px-4 py-2 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-tomato shadow-brutalist">
            <UserPlus size={13} />{showForm ? 'Abbrechen' : 'Benutzer anlegen'}
          </button>
        ) : (
          <p className="text-[11px] opacity-50 uppercase tracking-widest font-bold">
            Sie dürfen keine Konten anlegen.
          </p>
        )}
        <span className="text-[11px] font-bold uppercase tracking-widest opacity-50">
          {users.length} Konten
        </span>
      </div>

      {showForm && (
        <CreateUserForm profile={profile} roles={roles} shops={shops}
          onCancel={() => setShowForm(false)}
          onSubmit={async (payload) => { if (await onCreate(payload)) setShowForm(false); }} />
      )}

      {loading && users.length === 0 ? (
        <p className="text-sm opacity-50 py-6">Wird geladen…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <UserRow key={u.id} user={u} actor={profile} shops={shops}
              onDelete={onDelete} onPermissions={onPermissions} onReset={onReset} />
          ))}
        </div>
      )}
    </div>
  );
}

function CreateUserForm({ profile, roles, shops, onCancel, onSubmit }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(roles[0] ?? '');
  const [company, setCompany] = useState('');
  const [werkstattId, setWerkstattId] = useState('');
  const [perms, setPerms] = useState([]);
  const [busy, setBusy] = useState(false);

  const grantable = grantablePermissions(profile);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await onSubmit({
      email, role, company: company || null,
      werkstatt_id: role === 'werkstatt' ? werkstattId : null,
      permissions: role === 'admin' ? perms : [],
    });
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="border-4 border-ink bg-white shadow-brutalist p-5 space-y-4">
      <h2 className="font-black text-sm uppercase tracking-widest border-b-2 border-ink pb-2">
        Neues Konto
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest">E-Mail</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="border-2 border-ink p-2.5 text-sm focus:bg-sun outline-none" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest">Rolle</span>
          <select value={role} onChange={(e) => setRole(e.target.value)}
            className="border-2 border-ink p-2.5 text-sm bg-white focus:bg-sun outline-none">
            {roles.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </label>

        {role === 'werkstatt' && (
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest">Werkstatt</span>
            <select value={werkstattId} onChange={(e) => setWerkstattId(e.target.value)} required
              className="border-2 border-ink p-2.5 text-sm bg-white focus:bg-sun outline-none">
              <option value="">— wählen —</option>
              {shops.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
        )}

        {(role === 'haendler' || role === 'admin') && (
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest">Firma (optional)</span>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
              className="border-2 border-ink p-2.5 text-sm focus:bg-sun outline-none" />
          </label>
        )}
      </div>

      {role === 'admin' && (
        <fieldset className="border-2 border-ink p-4">
          <legend className="text-[10px] font-black uppercase tracking-widest px-2">Berechtigungen</legend>
          <p className="text-[11px] opacity-60 mb-3 leading-relaxed">
            Sie sehen nur die Kästchen, die Sie selbst besitzen — niemand kann eine
            Berechtigung weitergeben, die er nicht hat.
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {PERMISSIONS.filter((p) => grantable.includes(p.key)).map((p) => (
              <label key={p.key} className="flex items-center gap-2 text-[12px] cursor-pointer">
                <input type="checkbox" checked={perms.includes(p.key)}
                  onChange={(e) => setPerms((prev) =>
                    e.target.checked ? [...prev, p.key] : prev.filter((k) => k !== p.key))}
                  className="w-4 h-4 accent-olive" />
                {p.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={busy}
          className="bg-ink text-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest hover:bg-tomato disabled:opacity-50">
          {busy ? 'Wird angelegt…' : 'Anlegen'}
        </button>
        <button type="button" onClick={onCancel}
          className="border-2 border-ink px-5 py-2.5 text-[11px] font-black uppercase tracking-widest hover:bg-sun">
          Abbrechen
        </button>
      </div>
    </form>
  );
}

function UserRow({ user, actor, shops, onDelete, onPermissions, onReset }) {
  const [editing, setEditing] = useState(false);
  const [perms, setPerms] = useState(user.permissions ?? []);
  const [confirming, setConfirming] = useState(false);

  const shop = shops.find((s) => s.id === user.werkstatt_id);
  const mayDelete = canDelete(actor, user);
  const mayReset = canResetPassword(actor, user);
  const mayEdit = canEditPermissions(actor, user);
  const grantable = grantablePermissions(actor);

  return (
    <article className="border-4 border-ink bg-white shadow-brutalist p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-bold text-sm break-all">{user.email}</span>

        <span className={`text-[9px] font-black uppercase px-2 py-1 border-2 border-ink
          ${user.is_owner ? 'bg-ink text-white' : 'bg-white'}`}>
          {user.is_owner ? 'Inhaber' : ROLE_LABELS[user.role] ?? user.role}
        </span>

        {shop && <span className="text-[11px] font-bold text-olive">{shop.name}</span>}
        {user.company && <span className="text-[11px] opacity-60">{user.company}</span>}
        {user.id === actor.id && (
          <span className="text-[9px] font-black uppercase tracking-widest text-tomato">Sie</span>
        )}

        <div className="ml-auto flex flex-wrap gap-2">
          {mayEdit && (
            <button onClick={() => setEditing((v) => !v)}
              className="border-2 border-ink px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-sun">
              Rechte
            </button>
          )}
          {mayReset && (
            <button onClick={() => onReset(user)}
              className="border-2 border-ink px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-sun flex items-center gap-1.5">
              <KeyRound size={12} />Passwort
            </button>
          )}
          {mayDelete && (
            confirming ? (
              <span className="flex items-center gap-1.5">
                <button onClick={() => { setConfirming(false); onDelete(user.id); }}
                  className="bg-tomato text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest">
                  Wirklich löschen
                </button>
                <button onClick={() => setConfirming(false)}
                  className="border-2 border-ink px-2 py-1.5"><X size={12} /></button>
              </span>
            ) : (
              <button onClick={() => setConfirming(true)}
                className="border-2 border-tomato text-tomato px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-tomato hover:text-white flex items-center gap-1.5">
                <Trash2 size={12} />Löschen
              </button>
            )
          )}
        </div>
      </div>

      {user.role === 'admin' && !editing && (user.permissions ?? []).length > 0 && (
        <p className="text-[11px] opacity-60 mt-2">
          {PERMISSIONS.filter((p) => user.permissions.includes(p.key)).map((p) => p.label).join(' · ')}
        </p>
      )}

      {user.is_owner && (
        <p className="text-[11px] opacity-50 mt-2">
          Hat automatisch jede Berechtigung und kann von niemandem gelöscht werden.
        </p>
      )}

      {editing && (
        <div className="border-t-2 border-ink mt-3 pt-3 space-y-3">
          <div className="grid sm:grid-cols-2 gap-2">
            {PERMISSIONS.filter((p) => grantable.includes(p.key)).map((p) => (
              <label key={p.key} className="flex items-center gap-2 text-[12px] cursor-pointer">
                <input type="checkbox" checked={perms.includes(p.key)}
                  onChange={(e) => setPerms((prev) =>
                    e.target.checked ? [...prev, p.key] : prev.filter((k) => k !== p.key))}
                  className="w-4 h-4 accent-olive" />
                {p.label}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={async () => { await onPermissions(user.id, perms); setEditing(false); }}
              className="bg-ink text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-tomato">
              Speichern
            </button>
            <button onClick={() => { setPerms(user.permissions ?? []); setEditing(false); }}
              className="border-2 border-ink px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-sun">
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ werkstatt */
function WerkstattTab({ profile, shops, loading, onCreate, onToggle }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const mayManage = has(profile, 'werkstatt_verwalten');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    if (await onCreate({ name, contact_name: contact, email })) {
      setName(''); setContact(''); setEmail('');
    }
    setBusy(false);
  };

  return (
    <div className="space-y-5">
      {mayManage && (
        <form onSubmit={submit} className="border-4 border-ink bg-white shadow-brutalist p-5 space-y-4">
          <h2 className="font-black text-sm uppercase tracking-widest border-b-2 border-ink pb-2">
            Neue Werkstatt
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className="border-2 border-ink p-2.5 text-sm focus:bg-sun outline-none" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest">Ansprechpartner</span>
              <input value={contact} onChange={(e) => setContact(e.target.value)}
                className="border-2 border-ink p-2.5 text-sm focus:bg-sun outline-none" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest">E-Mail</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="border-2 border-ink p-2.5 text-sm focus:bg-sun outline-none" />
            </label>
          </div>
          <button type="submit" disabled={busy}
            className="bg-ink text-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest hover:bg-tomato disabled:opacity-50">
            {busy ? 'Wird angelegt…' : 'Anlegen'}
          </button>
        </form>
      )}

      {loading && shops.length === 0 ? (
        <p className="text-sm opacity-50 py-6">Wird geladen…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {shops.map((s) => (
            <article key={s.id} className="border-4 border-ink bg-white shadow-brutalist p-4 flex flex-wrap items-center gap-3">
              <span className="font-bold text-sm">{s.name}</span>
              {s.contact_name && <span className="text-[11px] opacity-60">{s.contact_name}</span>}
              {s.email && <span className="text-[11px] opacity-60">{s.email}</span>}
              <span className={`text-[9px] font-black uppercase px-2 py-1 border-2
                ${s.active ? 'border-olive text-olive bg-olive/10' : 'border-ink/30 text-ink/40'}`}>
                {s.active ? 'Aktiv' : 'Inaktiv'}
              </span>
              {mayManage && (
                <button onClick={() => onToggle(s.id, !s.active)}
                  className="ml-auto border-2 border-ink px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-sun">
                  {s.active ? 'Deaktivieren' : 'Aktivieren'}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
