'use client';
import { useState } from 'react';
import { UserPlus, CheckCircle } from 'lucide-react';

// Bileşen gövdesinin DIŞINDA: içeride tanımlansaydı her tuş vuruşunda yeni bir
// bileşen tipi doğar, input yeniden monte olur ve odak kaybolurdu.
function Field({ id, label, value, onChange, type = 'text', required, autoComplete, hint }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-[0.14em]">
        {label}{required && <span className="text-cch-danger"> *</span>}
      </span>
      <input id={id} name={id} type={type} required={required} autoComplete={autoComplete}
        value={value} onChange={onChange}
        className="border border-cch-line p-2.5 text-sm focus:border-cch-mint outline-none" />
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
      <div className="rounded-sm border-t-2 border-cch-mint bg-white p-8 shadow-cch text-center space-y-3">
        <CheckCircle size={32} className="mx-auto text-cch-dark" />
        <h2 className="font-medium text-lg uppercase">Vielen Dank!</h2>
        <p className="text-sm leading-relaxed max-w-sm mx-auto">
          Ihr Konto wurde angelegt und wartet auf Freigabe. Sobald wir es geprüft haben,
          können Sie sich anmelden — wir melden uns per E-Mail.
        </p>
        <a href="/login" className="inline-block border border-cch-line px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] hover:bg-cch-ash">
          Zur Anmeldung
        </a>
      </div>
    );
  }

  const field = (id, label, opts = {}) => (
    <Field id={id} label={label} value={form[id]} onChange={set(id)} {...opts} />
  );

  return (
    <form onSubmit={submit} className="bg-white rounded-sm shadow-cch p-6 md:p-8 space-y-5">
      <div className="border-b border-cch-line pb-3">
        <h1 className="font-medium text-xl uppercase">
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
        <fieldset className="border border-cch-line p-4 grid gap-4 sm:grid-cols-2">
          <legend className="text-[10px] font-medium uppercase tracking-[0.14em] px-2">Firmendaten</legend>
          {field('street', 'Straße & Nr.', { autoComplete: 'street-address' })}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">{field('plz', 'PLZ', { autoComplete: 'postal-code' })}</div>
            <div className="col-span-2">{field('city', 'Ort', { autoComplete: 'address-level2' })}</div>
          </div>
          {field('steuer_id', 'Steuernummer / USt-IdNr.')}
          {field('gewerbe_info', 'Gewerbe', { hint: 'Kurz: was Sie machen.' })}
        </fieldset>
      )}

      {error && <p className="text-[12px] text-cch-danger font-bold">{error}</p>}

      <button type="submit" disabled={busy}
        className="w-full bg-cch-mint text-white py-4 font-medium uppercase flex items-center justify-center gap-3 hover:bg-cch-dark rounded-sm transition-colors disabled:opacity-50">
        <UserPlus size={16} />
        {busy ? 'Wird gesendet…' : 'Registrieren'}
      </button>

      <p className="text-[11px] text-center">
        Schon ein Konto? <a href="/login" className="font-bold underline hover:text-cch-danger">Anmelden</a>
      </p>
    </form>
  );
}
