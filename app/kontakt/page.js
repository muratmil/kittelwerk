'use client';
import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CheckCircle, Mail, MessageCircle, Truck, Package, Clock } from 'lucide-react';

const TOPICS = [
  { value: 'Bestellung', label: 'Bestellung / Lieferung' },
  { value: 'Großbestellung', label: 'Großbestellung / Angebot' },
  { value: 'Produkt', label: 'Produktfrage' },
  { value: 'Retoure', label: 'Rücksendung / Reklamation' },
  { value: 'Sonstiges', label: 'Sonstiges' },
];

export default function Kontakt() {
  const [form, setForm] = useState({ name: '', email: '', company: '', subject: 'Bestellung', message: '' });
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

      {/* Hero */}
      <section className="bg-ink text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 items-end" style={{ minHeight: 320 }}>
          <div className="py-16 pr-8">
            <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition mb-8">
              ← Startseite
            </a>
            <h1 className="font-serif font-black text-6xl italic tracking-tighter leading-none mb-4">Kontakt</h1>
            <p className="text-white/60 text-lg max-w-sm leading-snug">
              Wir helfen Ihnen gerne weiter — schnell, persönlich und unkompliziert.
            </p>
          </div>
          <div className="hidden md:flex items-end justify-end h-80">
            <Image
              src="/images/team.png"
              alt="Kittelwerk Team"
              width={580}
              height={380}
              className="object-contain object-bottom h-full w-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-16">

        {/* Sol — Form */}
        <div>
          <h2 className="font-serif font-black text-3xl italic tracking-tight mb-8">Schreiben Sie uns</h2>

          {status === 'success' ? (
            <div className="border-2 border-ink text-center py-16 space-y-4">
              <CheckCircle size={48} className="text-olive mx-auto" />
              <p className="font-black text-lg uppercase">Nachricht gesendet!</p>
              <p className="text-sm opacity-60">Wir melden uns innerhalb von 24 Stunden.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Name *">
                <input name="name" type="text" value={form.name} onChange={handleChange} required
                  className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none w-full" />
              </Field>

              <Field label="E-Mail *">
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none w-full" />
              </Field>

              <Field label="Restaurant / Firma">
                <input name="company" type="text" value={form.company} onChange={handleChange}
                  className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none w-full" />
              </Field>

              <Field label="Thema *">
                <div className="relative">
                  <select name="subject" value={form.subject} onChange={handleChange} required
                    className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none w-full appearance-none cursor-pointer pr-8">
                    {TOPICS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-40">▼</span>
                </div>
              </Field>

              <Field label="Nachricht *">
                <textarea name="message" rows={5} value={form.message} onChange={handleChange} required
                  className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none resize-none w-full" />
              </Field>

              {status === 'error' && (
                <p className="text-[11px] text-tomato font-bold uppercase">
                  Fehler beim Senden. Bitte versuchen Sie es erneut.
                </p>
              )}

              <p className="text-[10px] opacity-40 uppercase tracking-widest flex items-center gap-1.5">
                <Clock size={11} />
                Wir antworten innerhalb von 24 Stunden
              </p>

              <button type="submit" disabled={status === 'loading'}
                className="w-full bg-ink text-white py-4 font-black uppercase hover:bg-tomato transition-all shadow-brutalist active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50">
                {status === 'loading' ? 'Wird gesendet...' : 'Absenden'}
              </button>
            </form>
          )}
        </div>

        {/* Sağ — Hızlı İletişim */}
        <div>
          <h2 className="font-serif font-black text-3xl italic tracking-tight mb-8">Direkt erreichen</h2>

          <div className="space-y-3">
            <ContactCard icon={<Mail size={18} />} label="E-Mail">
              <a href="mailto:info@kittelwerk.de" className="font-bold hover:text-tomato transition-colors">
                info@kittelwerk.de
              </a>
            </ContactCard>

            <ContactCard icon={<MessageCircle size={18} />} label="WhatsApp">
              <a
                href="https://wa.me/491749623344"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold hover:text-tomato transition-colors"
              >
                Nachricht schreiben →
              </a>
            </ContactCard>

            <ContactCard icon={<Truck size={18} />} label="Lieferzeit">
              <span>1–2 Wochen · DHL / DPD</span>
            </ContactCard>

            <ContactCard icon={<Package size={18} />} label="Mindestmenge">
              <span>
                10 Stück{' '}
                <span className="opacity-50">(Produkte kombinierbar)</span>
              </span>
            </ContactCard>
          </div>

          {/* Großbestellung CTA */}
          <div className="mt-8 border-2 border-ink p-6 bg-ink text-white shadow-brutalist">
            <p className="font-black text-xl uppercase tracking-tight leading-none mb-1">Großbestellung?</p>
            <p className="text-sm text-white/50 mb-5">
              Ab 50 Stück erhalten Sie ein individuelles Angebot mit Staffelpreisen.
            </p>
            <a
              href="mailto:info@kittelwerk.de?subject=Großbestellung%20Anfrage"
              className="inline-block bg-tomato text-white font-black text-sm uppercase px-6 py-3 hover:bg-white hover:text-ink transition-all"
            >
              Angebot anfordern →
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-black uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function ContactCard({ icon, label, children }) {
  return (
    <div className="flex items-start gap-4 border-2 border-ink p-4">
      <div className="mt-0.5 opacity-30">{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">{label}</p>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
