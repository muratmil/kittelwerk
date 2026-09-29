'use client';
import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CheckCircle, Mail, MessageCircle, Clock } from 'lucide-react';
import { useSprache } from '@/components/i18n/SpracheProvider';

// Değer Almanca kalıyor (Murat'a giden e-postaya yazılıyor); etiket sözlükte.
const TOPICS = ['Bestellung', 'Großbestellung', 'Produkt', 'Retoure', 'Sonstiges'];

export default function KontaktClient() {
  const [form, setForm] = useState({ name: '', email: '', company: '', subject: 'Bestellung', message: '' });
  const [status, setStatus] = useState('idle');
  const { t, p, lang } = useSprache();
  const K = t.kontakt;

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, lang }),
    });
    setStatus(res.ok ? 'success' : 'error');
  };

  return (
    <main className="bg-paper min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-ink text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 h-[360px]">
          <div className="flex flex-col justify-center pr-8">
            <a href={p('/')} className="inline-flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition mb-8">
              {K.startseite}
            </a>
            <h1 className="font-serif font-black text-6xl italic tracking-tighter leading-none mb-4">{K.titel}</h1>
            <p className="text-white/60 text-lg max-w-sm leading-snug">
              {K.text}
            </p>
          </div>
          <div className="hidden md:block relative h-full">
            <Image
              src="/images/team.webp"
              alt={K.bildAlt}
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-16">

        {/* Sol — Form */}
        <div>
          <h2 className="font-serif font-black text-3xl italic tracking-tight mb-8">{K.schreiben}</h2>

          {status === 'success' ? (
            <div className="border-2 border-ink text-center py-16 space-y-4">
              <CheckCircle size={48} className="text-olive mx-auto" />
              <p className="font-black text-lg uppercase">{K.gesendet}</p>
              <p className="text-sm opacity-60">{K.gesendetText}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label={K.name}>
                <input name="name" type="text" value={form.name} onChange={handleChange} required
                  className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none w-full" />
              </Field>

              <Field label={K.email}>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none w-full" />
              </Field>

              <Field label={K.firma}>
                <input name="company" type="text" value={form.company} onChange={handleChange}
                  className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none w-full" />
              </Field>

              <Field label={K.thema}>
                <div className="grid grid-cols-2 gap-2">
                  {TOPICS.map((wert) => (
                    <label key={wert} className="cursor-pointer">
                      <input
                        type="radio"
                        name="subject"
                        value={wert}
                        checked={form.subject === wert}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className={`block border-2 border-ink px-3 py-2.5 text-[11px] font-black uppercase tracking-wide text-center transition-all
                        ${form.subject === wert ? 'bg-ink text-white' : 'bg-paper hover:bg-sun'}`}>
                        {K.themen[wert]}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field label={K.nachricht}>
                <textarea name="message" rows={5} value={form.message} onChange={handleChange} required
                  className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none resize-none w-full" />
              </Field>

              {status === 'error' && (
                <p className="text-[11px] text-tomato font-bold uppercase">
                  {K.fehler}
                </p>
              )}

              <p className="text-[10px] opacity-40 uppercase tracking-widest flex items-center gap-1.5">
                <Clock size={11} />
                {K.antwort}
              </p>

              <button type="submit" disabled={status === 'loading'}
                className="w-full bg-ink text-white py-4 font-black uppercase hover:bg-tomato transition-all shadow-brutalist active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50">
                {status === 'loading' ? K.senden : K.absenden}
              </button>
            </form>
          )}
        </div>

        {/* Sağ — Hızlı İletişim */}
        <div>
          <h2 className="font-serif font-black text-3xl italic tracking-tight mb-8">{K.direkt}</h2>

          <div className="space-y-3">
            <ContactCard icon={<Mail size={18} />} label={K.emailLabel}>
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
                {K.whatsapp}
              </a>
            </ContactCard>
          </div>

          {/* Großbestellung */}
          <div className="mt-6 border-2 border-ink p-6 bg-ink text-white shadow-brutalist">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">{K.ab100}</p>
            <p className="font-black text-xl uppercase tracking-tight leading-none mb-2">{K.gross}</p>
            <p className="text-sm text-white/50">
              {K.grossText}
            </p>
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
