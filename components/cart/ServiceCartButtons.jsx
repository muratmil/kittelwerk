'use client';
import { useCartStore, LOGO_SERVICE_FEE, FILE_CHECK_FEE } from '@/store/cartStore';
import { PenLine, ScanSearch, CheckCircle } from 'lucide-react';

export function LogoServiceButton() {
  const { logoService, setLogoService } = useCartStore();

  if (logoService) {
    return (
      <div className="flex items-center gap-2 bg-tomato/10 border-2 border-tomato px-4 py-3 text-[11px] font-black uppercase text-tomato">
        <CheckCircle size={14} />
        Im Warenkorb — {LOGO_SERVICE_FEE.toFixed(2)} €
      </div>
    );
  }

  return (
    <button
      onClick={() => setLogoService(true)}
      className="flex items-center gap-2 bg-ink text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 hover:bg-tomato transition-all shadow-brutalist"
    >
      <PenLine size={14} />
      Logo-Service in den Warenkorb — {LOGO_SERVICE_FEE.toFixed(2)} €
    </button>
  );
}

export function FileCheckButton() {
  const { fileCheck, setFileCheck } = useCartStore();

  if (fileCheck) {
    return (
      <div className="flex items-center gap-2 bg-olive/10 border-2 border-olive px-4 py-3 text-[11px] font-black uppercase text-olive">
        <CheckCircle size={14} />
        Im Warenkorb — {FILE_CHECK_FEE.toFixed(2)} €
      </div>
    );
  }

  return (
    <button
      onClick={() => setFileCheck(true)}
      className="flex items-center gap-2 bg-ink text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 hover:bg-olive transition-all shadow-brutalist"
    >
      <ScanSearch size={14} />
      Datei-Kontrolle in den Warenkorb — {FILE_CHECK_FEE.toFixed(2)} €
    </button>
  );
}
