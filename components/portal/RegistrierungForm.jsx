'use client';
import { useState } from 'react';
import { UserPlus, CheckCircle } from 'lucide-react';

// Bileşen gövdesinin DIŞINDA: içeride tanımlansaydı her tuş vuruşunda yeni bir
// bileşen tipi doğar, input yeniden monte olur ve odak kaybolurdu.
function Field({ id, label, value, onChange, type = 'text', required, autoComplete, hint }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="text-[10px] font-black uppercase tracking-widest">
        {label}{required && <span className="text-tomato"> *</span>}
      </span>
      <input id={id} name={id} type={type} required={required} autoComplete={autoComplete}
        value={value} onChange={onChange}
        className="border-2 border-ink p-2.5 text-sm focus:bg-sun outline-none" />
      {hint && <span className="text-[10px] opacity-50">{hint}</span>}
    </label>
  );
}

// Bayi ve atölye kaydı aynı formu paylaşıyor; `art` neyin sorulacağını belirler.
export default function RegistrierungForm({ art }) {
  const istWerkstatt = art === 'werkstatt';
  const [form, setForm] = useState({
    company: '', contact_name: '', email: '', phone: '', password: '',
    street: '', plz: '', city: '', steuer_id: '', gewerbe_info: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/portal/registrierung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, art }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error ?? 'Registrierung fehlgeschlagen.');
    else setDone(true);
    setBusy(false);
  };

  if (done) {
    return (
      <div className="border-4 border-olive bg-olive/10 p-8 shadow-brutalist text-center space-y-3">
        <CheckCircle size={32} className="mx-auto text-olive" />
        <h2 className="font-black text-lg uppercase">Vielen Dank!</h2>
        <p className="text-sm leading-relaxed max-w-sm mx-auto">
          Ihr Konto wurde angelegt und wartet auf Freigabe. Sobald wir es geprüft haben,
          können Sie sich anmelden — wir melden uns per E-Mail.
        </p>
        <a href="/login" className="inline-block border-2 border-ink px-5 py-2.5 text-[11px] font-black uppercase tracking-widest hover:bg-sun">
          Zur Anmeldung
        </a>
      </div>
    );
  }

  const field = (id, label, opts = {}) => (
    <Field id={id} label={label} value={form[id]} onChange={set(id)} {...opts} />
  );

  return (
    <form onSubmit={submit} className="border-4 border-ink bg-white shadow-brutalist p-6 md:p-8 space-y-5">
      <div className="border-b-2 border-ink pb-3">
        <h1 className="font-black text-xl uppercase">
          {istWerkstatt ? 'Werkstatt registrieren' : 'Händler werden'}
        </h1>
        <p className="text-[11px] opacity-60 mt-1 leading-relaxed">
          {istWerkstatt
            ? 'Nach der Freigabe sehen Sie nur die Aufträge, die Ihrer Werkstatt zugewiesen werden.'
            : 'Nach der Freigabe bestellen Sie zu Ihren Händlerkonditionen.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {field('company', istWerkstatt ? 'Name der Werkstatt' : 'Firma', { required: true, autoComplete: 'organization' })}
        {field('contact_name', 'Ansprechpartner', { autoComplete: 'name' })}
        {field('email', 'E-Mail', { type: 'email', required: true, autoComplete: 'email' })}
        {field('phone', 'Telefon', { type: 'tel', autoComplete: 'tel' })}
        {field('password', 'Passwort', { type: 'password', required: true, autoComplete: 'new-password', hint: 'Mindestens 10 Zeichen.' })}
      </div>

      {!istWerkstatt && (
        <fieldset className="border-2 border-ink p-4 grid gap-4 sm:grid-cols-2">
          <legend className="text-[10px] font-black uppercase tracking-widest px-2">Firmendaten</legend>
          {field('street', 'Straße & Nr.', { autoComplete: 'street-address' })}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">{field('plz', 'PLZ', { autoComplete: 'postal-code' })}</div>
            <div className="col-span-2">{field('city', 'Ort', { autoComplete: 'address-level2' })}</div>
          </div>
          {field('steuer_id', 'Steuernummer / USt-IdNr.')}
          {field('gewerbe_info', 'Gewerbe', { hint: 'Kurz: was Sie machen.' })}
        </fieldset>
      )}

      {error && <p className="text-[12px] text-tomato font-bold">{error}</p>}

      <button type="submit" disabled={busy}
        className="w-full bg-ink text-white py-4 font-black uppercase flex items-center justify-center gap-3 hover:bg-tomato transition-all shadow-brutalist disabled:opacity-50">
        <UserPlus size={16} />
        {busy ? 'Wird gesendet…' : 'Registrieren'}
      </button>

      <p className="text-[11px] text-center">
        Schon ein Konto? <a href="/login" className="font-bold underline hover:text-tomato">Anmelden</a>
      </p>
    </form>
  );
}
