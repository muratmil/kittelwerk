'use client';
import { useState } from 'react';
import { Upload, Send, ChevronLeft } from 'lucide-react';

const Field = ({ label, type = 'text', value, onChange, required = true, placeholder = '' }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-black uppercase tracking-widest">
      {label} {required && <span className="text-tomato">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm"
    />
  </div>
);

export default function OrderForm({ items, totalPrice, onBack }) {
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '', street: '', city: '',
  });

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase opacity-60 hover:opacity-100">
        <ChevronLeft size={14} /> Zurück zum Warenkorb
      </button>

      <form className="space-y-4 bg-white p-6 border-2 border-ink shadow-brutalist">
        <h3 className="font-serif font-black text-xl uppercase italic border-b-2 border-ink pb-2">Kontaktdaten</h3>

        <Field label="Name / Vorname"     value={form.name}    onChange={set('name')} />
        <Field label="Restaurant / Firma" value={form.company} onChange={set('company')} />
        <Field label="E-Mail Adresse"     type="email" value={form.email} onChange={set('email')} />
        <Field label="Telefon"            type="tel"   value={form.phone} onChange={set('phone')} placeholder="+49 123 456789" />

        <h3 className="font-serif font-black text-xl uppercase italic border-b-2 border-ink pb-2 pt-2">Lieferadresse</h3>

        <Field label="Straße / Hausnummer" value={form.street} onChange={set('street')} placeholder="Musterstraße 12" />

        <div className="grid grid-cols-[1fr_2fr] gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest">PLZ <span className="text-tomato">*</span></label>
            <input
              type="text" inputMode="numeric" maxLength={5}
              value={form.plz} onChange={(e) => setForm(p => ({ ...p, plz: e.target.value }))}
              placeholder="12345" required
              className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest">Stadt <span className="text-tomato">*</span></label>
            <input
              type="text"
              value={form.city} onChange={set('city')}
              placeholder="Berlin" required
              className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm"
            />
          </div>
        </div>

        <div className="border-2 border-dashed border-ink p-5 bg-paper flex flex-col items-center justify-center gap-2">
          <input type="file" id="logo-upload" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
          <label htmlFor="logo-upload" className="flex flex-col items-center cursor-pointer text-center">
            <Upload className="text-tomato mb-2" />
            <span className="text-[8px] font-black uppercase leading-tight">
              {file ? file.name : 'Logo hochladen (PDF, PNG, SVG)'}
            </span>
          </label>
        </div>

        <p className="text-[9px] opacity-50 uppercase tracking-widest"><span className="text-tomato">*</span> Pflichtfeld</p>

        <button type="button" className="w-full bg-ink text-white py-4 font-black uppercase flex items-center justify-center gap-3 hover:bg-tomato transition-all shadow-brutalist">
          <Send size={18} />
          Anfrage absenden
        </button>
      </form>
    </div>
  );
}
