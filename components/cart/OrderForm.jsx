'use client';
import { useState } from 'react';
import { Upload, Send, ChevronLeft, CheckCircle } from 'lucide-react';
import { useCartStore, LOGO_SERVICE_FEE, FILE_CHECK_FEE } from '@/store/cartStore';
import { createClient } from '@/utils/supabase/client';

const Field = ({ label, type = 'text', value, onChange, required = true, placeholder = '' }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-black uppercase tracking-widest">
      {label} {required && <span className="text-tomato">*</span>}
    </label>
    <input
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} required={required}
      className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm"
    />
  </div>
);

export default function OrderForm({ items, totalPrice, onBack }) {
  const { getSubtotal, getDiscountAmount, getShippingCost, getFinalTotal, appliedCode, logoService, fileCheck } = useCartStore();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '', street: '', plz: '', city: '', notes: '',
  });

  const setField = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    const subtotal = getSubtotal();
    const discountAmount = getDiscountAmount();
    const shippingCost = getShippingCost();
    const total = getFinalTotal();
    const logoServiceFee = logoService ? LOGO_SERVICE_FEE : 0;
    const fileCheckFee = fileCheck ? FILE_CHECK_FEE : 0;

    let logoUrl = null;

    if (file) {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const filename = `${Date.now()}_${form.company.replace(/\s+/g, '_') || 'logo'}.${ext}`;
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(filename, file, { upsert: false });
      if (!error && data) logoUrl = data.path;
    }

    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        items: items.map(i => ({
          name: i.name,
          color: i.color,
          sizes: i.sizes,
          qty: i.qty,
          price: i.price,
          printType: i.printType,
        })),
        subtotal, discountCode: appliedCode, discountAmount, shippingCost, total,
        logoUrl,
        logoService,
        logoServiceFee,
        fileCheck,
        fileCheckFee,
        customerNotes: form.notes,
      }),
    });

    setStatus(res.ok ? 'success' : 'error');
  };

  if (status === 'success') {
    return (
      <div className="text-center py-12 space-y-4">
        <CheckCircle size={56} className="text-olive mx-auto" />
        <h3 className="font-serif font-black text-2xl uppercase italic">Anfrage gesendet!</h3>
        <p className="text-sm opacity-70 max-w-xs mx-auto">Wir melden uns bald per E-Mail bei dir.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase opacity-60 hover:opacity-100">
        <ChevronLeft size={14} /> Zurück zum Warenkorb
      </button>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 border-2 border-ink shadow-brutalist">
        <h3 className="font-serif font-black text-xl uppercase italic border-b-2 border-ink pb-2">Kontaktdaten</h3>

        <Field label="Name / Vorname"     value={form.name}    onChange={setField('name')} />
        <Field label="Restaurant / Firma" value={form.company} onChange={setField('company')} />
        <Field label="E-Mail Adresse"     type="email" value={form.email} onChange={setField('email')} />
        <Field label="Telefon"            type="tel"   value={form.phone} onChange={setField('phone')} placeholder="+49 123 456789" />

        <h3 className="font-serif font-black text-xl uppercase italic border-b-2 border-ink pb-2 pt-2">Lieferadresse</h3>

        <Field label="Straße / Hausnummer" value={form.street} onChange={setField('street')} placeholder="Musterstraße 12" />

        <div className="grid grid-cols-[1fr_2fr] gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest">PLZ <span className="text-tomato">*</span></label>
            <input type="text" inputMode="numeric" maxLength={5}
              value={form.plz} onChange={(e) => setForm(p => ({ ...p, plz: e.target.value }))}
              placeholder="12345" required
              className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest">Stadt <span className="text-tomato">*</span></label>
            <input type="text" value={form.city} onChange={setField('city')}
              placeholder="Berlin" required
              className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm" />
          </div>
        </div>

        {/* Mockup bilgi kutusu */}
        <div className="bg-sun/40 border-2 border-ink p-4 text-[9px] leading-relaxed space-y-1">
          <p className="font-black uppercase tracking-widest">Druckvorschau vor der Produktion</p>
          <p>Nach Ihrer Bestellung senden wir Ihnen einen digitalen <strong>Korrekturabzug</strong> (Druckvorschau) zur Freigabe. Die Produktion startet erst nach Ihrer ausdrücklichen Freigabe.</p>
          <p className="opacity-70">Standard-Druckflächen: Brust <strong>10×10 cm</strong> · Rücken <strong>max. 24 cm Breite</strong>. Abweichende Maße bitte unten als Notiz angeben.</p>
        </div>

        {/* Logo yükleme */}
        <div className={`border-2 border-dashed p-5 bg-paper flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${file ? 'border-olive bg-olive/5' : 'border-ink hover:border-tomato'}`}>
          <input type="file" id="logo-upload" className="hidden"
            accept=".pdf,.png,.svg,.ai,.eps,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files[0])} />
          <label htmlFor="logo-upload" className="flex flex-col items-center cursor-pointer text-center w-full">
            <Upload className={`mb-2 ${file ? 'text-olive' : 'text-tomato'}`} size={20} />
            <span className="text-[9px] font-black uppercase leading-tight">
              {file ? `✓ ${file.name}` : 'Logo hochladen (PDF, PNG, SVG, AI, EPS)'}
            </span>
            {!file && <span className="text-[8px] opacity-50 mt-1">Optional — oder per E-Mail nachsenden</span>}
          </label>
        </div>

        {logoService && (
          <div className="border-2 border-tomato bg-tomato/5 px-4 py-3 flex items-center justify-between text-[11px] font-black uppercase">
            <span>Logo-Erstellungsservice</span>
            <span className="text-tomato">+{LOGO_SERVICE_FEE.toFixed(2)} €</span>
          </div>
        )}
        {fileCheck && (
          <div className="border-2 border-olive bg-olive/5 px-4 py-3 flex items-center justify-between text-[11px] font-black uppercase">
            <span>Professionelle Datei-Kontrolle</span>
            <span className="text-olive">+{FILE_CHECK_FEE.toFixed(2)} €</span>
          </div>
        )}

        {/* Anmerkungen */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest">
            Anmerkungen <span className="opacity-40 normal-case font-normal">(optional)</span>
          </label>
          <textarea
            value={form.notes}
            onChange={setField('notes')}
            rows={3}
            placeholder="z. B. abweichende Druckgröße, Positionswunsch, besondere Hinweise zum Logo..."
            className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm resize-none"
          />
        </div>

        {status === 'error' && (
          <p className="text-[11px] text-tomato font-bold uppercase">Ein Fehler ist aufgetreten. Bitte versuche es erneut.</p>
        )}

        <p className="text-[9px] opacity-50 uppercase tracking-widest"><span className="text-tomato">*</span> Pflichtfeld</p>

        <button type="submit" disabled={status === 'loading'}
          className="w-full bg-ink text-white py-4 font-black uppercase flex items-center justify-center gap-3 hover:bg-tomato transition-all shadow-brutalist disabled:opacity-50">
          <Send size={18} />
          {status === 'loading' ? 'Wird gesendet...' : 'Anfrage absenden'}
        </button>
      </form>
    </div>
  );
}
