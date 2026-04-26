'use client';
import { useState } from 'react';
import { Upload, Send, ChevronLeft } from 'lucide-react';

export default function OrderForm({ items, totalPrice, onBack }) {
  const [file, setFile] = useState(null);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase opacity-60 hover:opacity-100">
        <ChevronLeft size={14} /> Zurück zum Warenkorb
      </button>
      <form className="space-y-6 bg-white p-6 border-2 border-ink shadow-brutalist">
        <h3 className="font-serif font-black text-xl uppercase italic border-b-2 border-ink pb-2">Kontaktdaten</h3>
        <div className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex flex-col gap-1">
            <label>Name / Vorname</label>
            <input type="text" className="border-2 border-ink p-3 focus:bg-sun outline-none" required />
          </div>
          <div className="flex flex-col gap-1">
            <label>Restaurant / Firma</label>
            <input type="text" className="border-2 border-ink p-3 focus:bg-sun outline-none" required />
          </div>
          <div className="flex flex-col gap-1">
            <label>E-Mail Adresse</label>
            <input type="email" className="border-2 border-ink p-3 focus:bg-sun outline-none" required />
          </div>
        </div>
        <div className="border-2 border-dashed border-ink p-6 bg-paper flex flex-col items-center justify-center gap-3">
          <input type="file" id="logo-upload" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
          <label htmlFor="logo-upload" className="flex flex-col items-center cursor-pointer text-center">
            <Upload className="text-tomato mb-2" />
            <span className="text-[8px] font-black uppercase leading-tight">
              {file ? file.name : 'Logo hochladen (PDF, PNG, SVG)'}
            </span>
          </label>
        </div>
        <button type="button" className="w-full bg-ink text-white py-4 font-black uppercase flex items-center justify-center gap-3 hover:bg-tomato transition-all shadow-brutalist">
          <Send size={18} />
          Anfrage absenden
        </button>
      </form>
    </div>
  );
}
