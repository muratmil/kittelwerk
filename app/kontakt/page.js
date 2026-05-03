'use client';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CheckCircle } from 'lucide-react';

export default function Kontakt() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? 'success' : 'error');
  };

  return (
    <main className="bg-paper min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <a href="/" className="inline-flex items-center gap-2 font-bold text-sm mb-10 hover:text-tomato transition-colors">← Startseite</a>
        <h1 className="font-serif font-black text-5xl italic tracking-tighter mb-4">Kontakt</h1>
        <hr className="border-2 border-ink mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="font-serif font-black text-2xl mb-6">Schreiben Sie uns</h3>
            {status === 'success' ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle size={48} className="text-olive mx-auto" />
                <p className="font-black text-lg uppercase">Nachricht gesendet!</p>
                <p className="text-sm opacity-60">Wir melden uns bald bei Ihnen.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest">Name *</label>
                  <input name="name" type="text" value={form.name} onChange={handleChange}
                    className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest">E-Mail *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest">Restaurant / Firma</label>
                  <input name="company" type="text" value={form.company} onChange={handleChange}
                    className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest">Nachricht *</label>
                  <textarea name="message" rows={5} value={form.message} onChange={handleChange}
                    className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none resize-none" required />
                </div>
                {status === 'error' && (
                  <p className="text-[11px] text-tomato font-bold uppercase">Fehler beim Senden. Bitte versuchen Sie es erneut.</p>
                )}
                <button type="submit" disabled={status === 'loading'}
                  className="w-full bg-ink text-white py-4 font-black uppercase hover:bg-tomato transition-all shadow-brutalist active:translate-x-1 active:translate-y-1 disabled:opacity-50">
                  {status === 'loading' ? 'Wird gesendet...' : 'Absenden'}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="font-serif font-black text-2xl mb-4">Direkt erreichen</h3>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3 items-start">
                <strong className="w-20 flex-shrink-0 text-[10px] uppercase tracking-widest opacity-60">E-Mail</strong>
                <a href="mailto:info@kittelwerk.de" className="hover:text-tomato transition-colors font-bold">info@kittelwerk.de</a>
              </div>
              <div className="flex gap-3 items-start">
                <strong className="w-20 flex-shrink-0 text-[10px] uppercase tracking-widest opacity-60">Versand</strong>
                <span>7–10 Werktage · DHL / DPD</span>
              </div>
              <div className="flex gap-3 items-start">
                <strong className="w-20 flex-shrink-0 text-[10px] uppercase tracking-widest opacity-60">Zahlung</strong>
                <span>SEPA-Überweisung auf deutsches Konto</span>
              </div>
              <div className="flex gap-3 items-start">
                <strong className="w-20 flex-shrink-0 text-[10px] uppercase tracking-widest opacity-60">Mindest&shy;menge</strong>
                <span>10 Stück (Produkte kombinierbar)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
