'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, CheckCircle } from 'lucide-react';

export default function AtolyeKayit() {
  const [form, setForm] = useState({ name: '', contact_name: '', email: '', phone: '', password: '', password2: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/atolye-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        contact_name: form.contact_name || undefined,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Fehler beim Registrieren.'); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <h1 className="font-serif font-black text-4xl italic uppercase">
            Kittel<span className="text-tomato">werk</span>.
          </h1>
          <div className="bg-white border-4 border-ink shadow-brutalist p-8 space-y-4">
            <CheckCircle size={40} className="mx-auto text-olive" />
            <h2 className="font-black text-xl uppercase">Anfrage gesendet!</h2>
            <p className="text-[13px] opacity-60">Ihre Registrierung wird geprüft. Sie erhalten eine E-Mail, sobald Ihr Zugang freigeschaltet wurde.</p>
            <button onClick={() => router.push('/atolye/login')}
              className="w-full bg-ink text-white py-3 font-black uppercase text-[11px] tracking-wider hover:bg-tomato transition-all">
              Zum Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="font-serif font-black text-4xl italic uppercase">
          Kittel<span className="text-tomato">werk</span>.
        </h1>
        <form onSubmit={handleSubmit} className="bg-white border-4 border-ink shadow-brutalist p-8 space-y-4">
          <h2 className="font-black text-xl uppercase border-b-2 border-ink pb-3">Atölye Registrierung</h2>

          <Field label="Atölye-Name *" type="text" value={form.name} onChange={set('name')} required />
          <Field label="Ansprechpartner" type="text" value={form.contact_name} onChange={set('contact_name')} />
          <Field label="E-Mail *" type="email" value={form.email} onChange={set('email')} required />
          <Field label="Telefon" type="tel" value={form.phone} onChange={set('phone')} />
          <Field label="Passwort * (min. 8 Zeichen)" type="password" value={form.password} onChange={set('password')} required />
          <Field label="Passwort bestätigen *" type="password" value={form.password2} onChange={set('password2')} required />

          {error && <p className="text-[11px] text-tomato font-bold uppercase">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-ink text-white py-4 font-black uppercase flex items-center justify-center gap-3 hover:bg-tomato transition-all shadow-brutalist disabled:opacity-50">
            <UserPlus size={16} />
            {loading ? 'Wird registriert...' : 'Registrieren'}
          </button>

          <p className="text-center text-[10px] opacity-40">
            Bereits registriert?{' '}
            <a href="/atolye/login" className="underline hover:text-tomato">Einloggen</a>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-black uppercase tracking-widest">{label}</label>
      <input {...props} className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm" />
    </div>
  );
}
