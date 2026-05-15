'use client';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

function Field({ label, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-black uppercase tracking-widest">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        required={required} placeholder={placeholder}
        className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm" />
    </div>
  );
}

export default function ResellerRegister() {
  const [form, setForm] = useState({
    company: '', contact_name: '', email: '', phone: '',
    steuer_id: '', gewerbe_info: '',
    password: '', password2: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }
    setLoading(true);

    const res = await fetch('/api/reseller-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: form.company,
        contact_name: form.contact_name,
        email: form.email,
        phone: form.phone || undefined,
        steuer_id: form.steuer_id,
        gewerbe_info: form.gewerbe_info || undefined,
        password: form.password,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Ein Fehler ist aufgetreten.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="bg-white border-4 border-ink shadow-brutalist p-10 text-center space-y-4 max-w-md w-full">
          <CheckCircle size={48} className="mx-auto text-olive" />
          <h2 className="font-black text-2xl uppercase">Anfrage eingegangen!</h2>
          <p className="text-sm opacity-70 leading-relaxed">
            Vielen Dank für Ihre Händleranfrage. Wir prüfen Ihre Angaben und melden uns innerhalb von 1–2 Werktagen per E-Mail bei Ihnen.
          </p>
          <p className="text-[11px] opacity-50">{form.email}</p>
          <a href="/reseller/login"
            className="block w-full bg-ink text-white py-3 font-black uppercase text-[11px] hover:bg-tomato transition-all">
            Zum Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-12 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif font-black text-4xl italic uppercase">
            Kittel<span className="text-tomato">werk</span>.
          </h1>
          <h2 className="font-black text-2xl uppercase mt-3">Händler werden</h2>
          <p className="text-sm opacity-60 mt-2 leading-relaxed">
            Registrieren Sie sich mit Ihren Firmendaten. Nach Prüfung wird Ihr Konto freigeschaltet.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Firmendaten */}
          <div className="bg-white border-4 border-ink shadow-brutalist p-6 space-y-4">
            <h3 className="font-black text-xs uppercase tracking-widest border-b-2 border-ink pb-3">Firmendaten</h3>
            <Field label="Firma / Restaurant *" value={form.company} onChange={set('company')} required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ansprechpartner *" value={form.contact_name} onChange={set('contact_name')} required />
              <Field label="Telefon" value={form.phone} onChange={set('phone')} />
            </div>
            <Field label="E-Mail *" type="email" value={form.email} onChange={set('email')} required />
          </div>

          {/* Steuer & Gewerbe */}
          <div className="bg-white border-4 border-ink shadow-brutalist p-6 space-y-4">
            <h3 className="font-black text-xs uppercase tracking-widest border-b-2 border-ink pb-3">Steuer & Gewerbedaten</h3>
            <Field label="Steuernummer / Steuer-ID *" value={form.steuer_id} onChange={set('steuer_id')} required placeholder="z.B. DE123456789" />
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest">Gewerbeanmeldung (optional)</label>
              <textarea value={form.gewerbe_info} onChange={e => setForm(p => ({ ...p, gewerbe_info: e.target.value }))}
                rows={2} placeholder="Gewerbe-Nr., Registergericht, Handelsregisternummer..."
                className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm resize-none" />
            </div>
          </div>

          {/* Passwort */}
          <div className="bg-white border-4 border-ink shadow-brutalist p-6 space-y-4">
            <h3 className="font-black text-xs uppercase tracking-widest border-b-2 border-ink pb-3">Passwort wählen</h3>
            <Field label="Passwort * (min. 8 Zeichen)" type="password" value={form.password} onChange={set('password')} required />
            <Field label="Passwort bestätigen *" type="password" value={form.password2} onChange={set('password2')} required />
          </div>

          {error && (
            <p className="text-tomato text-[11px] font-black uppercase border-2 border-tomato px-3 py-2">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-ink text-white py-4 font-black uppercase flex items-center justify-center gap-3 hover:bg-tomato transition-all shadow-brutalist disabled:opacity-50">
            {loading ? 'Wird gesendet...' : 'Händleranfrage absenden'}
          </button>

          <p className="text-center text-[10px] opacity-40">
            Bereits Händler?{' '}
            <a href="/reseller/login" className="underline hover:text-tomato">Einloggen</a>
          </p>
        </form>
      </div>
    </div>
  );
}
