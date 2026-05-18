'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut, Package, ChevronDown, ChevronUp, RefreshCw, Save, Download, Users, Plus, X, Wrench, Pencil } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'new',        label: 'Neu',                color: 'bg-sun text-ink' },
  { value: 'processing', label: 'In Bearbeitung',     color: 'bg-blue-100 text-blue-800' },
  { value: 'on_hold',    label: 'Pausiert',            color: 'bg-orange-100 text-orange-700' },
  { value: 'shipped',    label: 'Versandt',            color: 'bg-olive/20 text-olive' },
  { value: 'done',       label: 'Abgeschlossen',       color: 'bg-ink/10 text-ink/50' },
  { value: 'cancelled',  label: 'Storniert',           color: 'bg-tomato/10 text-tomato' },
];

function StatusBadge({ status }) {
  const opt = STATUS_OPTIONS.find(o => o.value === status) || STATUS_OPTIONS[0];
  return <span className={`text-[9px] font-black uppercase px-2 py-1 ${opt.color}`}>{opt.label}</span>;
}

function formatSizes(sizes) {
  if (!sizes || sizes['-'] !== undefined) return `${sizes?.['-'] ?? '—'} Stück`;
  return Object.entries(sizes).filter(([, v]) => v > 0).map(([k, v]) => `${k}×${v}`).join(' · ');
}

function OrderRow({ order, onStatusChange, onNotesSave, onWorkshopAssign, workshops, supabase }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(order.status || 'new');
  const [notes, setNotes] = useState(order.notes || '');
  const [updating, setUpdating] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [assignedWorkshop, setAssignedWorkshop] = useState(order.workshop_id || '');
  const assignedWs = workshops?.find(w => w.id === assignedWorkshop) || null;
  const waPhone = assignedWs?.phone?.replace(/[\s\-\+\(\)]/g, '') || '';
  const totalQty = order.items?.reduce((s, i) => s + i.qty, 0) || 0;
  const waText = encodeURIComponent(
    `Neue Bestellung zugewiesen!\n\nBestellung #${order.id.slice(0,8)}\nFirma: ${order.company}\nStückzahl: ${totalQty}\n\nDirekt zur Bestellung:\nhttps://kittelwerk.de/atolye#${order.id}`
  );

  const handleStatus = async (newStatus) => {
    setUpdating(true);
    await onStatusChange(order.id, newStatus);
    setStatus(newStatus);
    setUpdating(false);
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await onNotesSave(order.id, notes);
    setSavingNotes(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleLogoDownload = async () => {
    if (!order.logo_url) return;
    const { data } = await supabase.storage.from('logos').createSignedUrl(order.logo_url, 3600);
    if (data) window.open(data.signedUrl, '_blank');
  };

  const date = new Date(order.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className={`border-2 border-ink bg-white transition-all ${open ? 'shadow-brutalist' : ''}`}>
      <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-black text-sm uppercase">{order.company}</span>
            <span className="text-[10px] opacity-50">{order.name}</span>
            <span className="text-[10px] opacity-40 hidden sm:inline">{date}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <StatusBadge status={status} />
            <span className="text-[10px] opacity-50">{order.items?.length || 0} Positionen</span>
            <span className="text-[10px] font-black">{Number(order.total).toFixed(2)}€</span>
            {order.notes && <span className="text-[9px] bg-sun px-1.5 py-0.5 font-black uppercase">Notiz</span>}
          </div>
        </div>
        {open ? <ChevronUp size={16} className="flex-shrink-0 opacity-50" /> : <ChevronDown size={16} className="flex-shrink-0 opacity-50" />}
      </div>

      {open && (
        <div className="border-t-2 border-ink p-4 space-y-4 bg-paper">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
            <div><span className="opacity-50 uppercase font-black">E-Mail</span><br /><a href={`mailto:${order.email}`} className="text-tomato font-bold">{order.email || '—'}</a></div>
            <div><span className="opacity-50 uppercase font-black">Telefon</span><br />{order.phone}</div>
            <div className="col-span-2"><span className="opacity-50 uppercase font-black">Adresse</span><br />{order.street}, {order.plz} {order.city}</div>
            {order.discount_code && (
              <div><span className="opacity-50 uppercase font-black">Rabatt</span><br />{order.discount_code} (−{Number(order.discount_amount).toFixed(2)}€)</div>
            )}
            <div>
              <span className="opacity-50 uppercase font-black">Logo</span><br />
              {order.logo_url ? (
                <button onClick={handleLogoDownload} className="flex items-center gap-1.5 text-tomato font-bold hover:underline">
                  <Download size={12} /> Logo herunterladen
                </button>
              ) : <span className="opacity-40">Kein Logo</span>}
            </div>
            {workshops?.length > 0 && (
              <div className="col-span-2 space-y-2">
                <span className="opacity-50 uppercase font-black">Atölye</span><br />
                <select value={assignedWorkshop}
                  onChange={async e => {
                    const wid = e.target.value;
                    setAssignedWorkshop(wid);
                    await onWorkshopAssign(order.id, wid || null);
                  }}
                  className="border-2 border-ink p-1.5 text-[11px] bg-white focus:bg-sun outline-none mt-1 w-full max-w-[220px]">
                  <option value="">— Nicht zugewiesen —</option>
                  {workshops.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
                {assignedWs && waPhone && (
                  <a href={`https://wa.me/${waPhone}?text=${waText}`} target="_blank" rel="noreferrer"
                    className="inline-flex items-stretch border-2 border-ink shadow-brutalist hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                    <span className="bg-[#25D366] px-2.5 flex items-center justify-center">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </span>
                    <span className="px-3 py-1.5 text-[10px] font-black uppercase bg-white tracking-wider">
                      WhatsApp
                    </span>
                  </a>
                )}
              </div>
            )}
          </div>

          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-ink text-white">
                <th className="p-2 text-left font-black uppercase">Produkt</th>
                <th className="p-2 text-left font-black uppercase">Farbe · Größe</th>
                <th className="p-2 text-center font-black uppercase">Menge</th>
                <th className="p-2 text-right font-black uppercase">Preis</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, i) => (
                <tr key={i} className="border-b border-ink/10">
                  <td className="p-2 font-bold">{item.name}</td>
                  <td className="p-2 opacity-70">{item.color} · {formatSizes(item.sizes)}</td>
                  <td className="p-2 text-center">{item.qty}</td>
                  <td className="p-2 text-right font-black">{(item.price * item.qty).toFixed(2)}€</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="space-y-1 text-[11px] min-w-[200px]">
              <div className="flex justify-between"><span className="opacity-60">Zwischensumme</span><span>{Number(order.subtotal).toFixed(2)}€</span></div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-olive"><span>Rabatt</span><span>−{Number(order.discount_amount).toFixed(2)}€</span></div>
              )}
              <div className="flex justify-between"><span className="opacity-60">Versand</span><span>{Number(order.shipping_cost) === 0 ? 'GRATIS' : Number(order.shipping_cost).toFixed(2) + '€'}</span></div>
              <div className="flex justify-between font-black text-base border-t-2 border-ink pt-1"><span>TOTAL</span><span>{Number(order.total).toFixed(2)}€</span></div>
            </div>
          </div>

          <div className="space-y-2 border-t-2 border-ink/20 pt-3">
            <label className="text-[9px] font-black uppercase opacity-60">Atölye-Notiz</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Hinweise für die Produktion..." rows={3}
              className="w-full border-2 border-ink p-3 text-[11px] outline-none focus:bg-sun resize-none bg-white" />
            <button onClick={handleSaveNotes} disabled={savingNotes}
              className={`flex items-center gap-2 text-[10px] font-black uppercase px-4 py-2 border-2 border-ink transition-all ${notesSaved ? 'bg-olive text-white' : 'bg-white hover:bg-sun'} disabled:opacity-50`}>
              <Save size={12} />
              {notesSaved ? 'Gespeichert ✓' : savingNotes ? 'Speichern...' : 'Notiz speichern'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-ink/20">
            <span className="text-[9px] font-black uppercase opacity-50 self-center">Status:</span>
            {STATUS_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => handleStatus(opt.value)}
                disabled={updating || status === opt.value}
                className={`text-[9px] font-black uppercase px-3 py-1.5 border-2 border-ink transition-all ${status === opt.value ? 'bg-ink text-white' : 'bg-paper hover:bg-sun disabled:opacity-40'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResellerOrderRow({ order, onStatusChange, onWorkshopAssign, workshops, supabase, showBadge = false }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(order.status || 'new');
  const [updating, setUpdating] = useState(false);
  const [assignedWorkshop, setAssignedWorkshop] = useState(order.workshop_id || '');

  const handleStatus = async (newStatus) => {
    setUpdating(true);
    await onStatusChange(order.id, newStatus);
    setStatus(newStatus);
    setUpdating(false);
  };

  const date = new Date(order.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const totalQty = order.items?.reduce((s, i) => s + i.qty, 0) || 0;
  const companyName = order.resellers?.company || order.company;
  const assignedWs = workshops?.find(w => w.id === assignedWorkshop) || null;
  const waPhone = assignedWs?.phone?.replace(/[\s\-\+\(\)]/g, '') || '';
  const waText = encodeURIComponent(
    `Neue Händlerbestellung zugewiesen!\n\nBestellung #${order.id.slice(0,8)}\nHändler: ${companyName}\nStückzahl: ${totalQty}\n\nDirekt zur Bestellung:\nhttps://kittelwerk.de/atolye#${order.id}`
  );

  return (
    <div className={`border-2 border-ink bg-white transition-all ${open ? 'shadow-brutalist' : ''}`}>
      <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-black text-sm uppercase">{companyName}</span>
            {showBadge && <span className="text-[9px] font-black bg-olive text-white px-1.5 py-0.5 uppercase">Händler</span>}
            <span className="text-[10px] opacity-40">{date}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <StatusBadge status={status} />
            <span className="text-[10px] opacity-50">{totalQty} Stück</span>
            <span className="text-[10px] font-black">{Number(order.total).toFixed(2)}€</span>
            <span className="text-[9px] text-olive font-black">{order.discount_rate}% Rabatt</span>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="flex-shrink-0 opacity-50" /> : <ChevronDown size={16} className="flex-shrink-0 opacity-50" />}
      </div>

      {open && (
        <div className="border-t-2 border-ink p-4 space-y-4 bg-paper">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-ink text-white">
                <th className="p-2 text-left font-black uppercase">Produkt</th>
                <th className="p-2 text-left font-black uppercase">Farbe · Größe</th>
                <th className="p-2 text-center font-black uppercase">Menge</th>
                <th className="p-2 text-right font-black uppercase">Preis</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, i) => (
                <tr key={i} className="border-b border-ink/10">
                  <td className="p-2 font-bold">{item.name}</td>
                  <td className="p-2 opacity-70">{item.color} · {formatSizes(item.sizes)}</td>
                  <td className="p-2 text-center">{item.qty}</td>
                  <td className="p-2 text-right font-black">{(item.price * item.qty).toFixed(2)}€</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="space-y-1 text-[11px] min-w-[200px]">
              <div className="flex justify-between opacity-40 line-through"><span>Listenpreis</span><span>{Number(order.subtotal).toFixed(2)}€</span></div>
              <div className="flex justify-between text-olive"><span>Händlerrabatt ({order.discount_rate}%)</span><span>−{Number(order.discount_amount).toFixed(2)}€</span></div>
              <div className="flex justify-between"><span className="opacity-60">Versand</span><span>{Number(order.shipping_cost) === 0 ? 'GRATIS' : Number(order.shipping_cost).toFixed(2) + '€'}</span></div>
              <div className="flex justify-between font-black text-base border-t-2 border-ink pt-1"><span>TOTAL</span><span>{Number(order.total).toFixed(2)}€</span></div>
            </div>
          </div>

          {order.notes && (
            <div className="border-2 border-sun bg-sun/20 p-3 text-[11px]">
              <p className="font-black uppercase text-[9px] opacity-50 mb-1">Notiz</p>
              <p>{order.notes}</p>
            </div>
          )}

          {workshops?.length > 0 && (
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase opacity-50">Atölye</span>
              <select value={assignedWorkshop}
                onChange={async e => {
                  const wid = e.target.value;
                  setAssignedWorkshop(wid);
                  if (onWorkshopAssign) await onWorkshopAssign(order.id, wid || null);
                }}
                className="border-2 border-ink p-1.5 text-[11px] bg-white focus:bg-sun outline-none w-full max-w-[220px]">
                <option value="">— Nicht zugewiesen —</option>
                {workshops.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              {assignedWs && waPhone && (
                <a href={`https://wa.me/${waPhone}?text=${waText}`} target="_blank" rel="noreferrer"
                  className="inline-flex items-stretch border-2 border-ink shadow-brutalist hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                  <span className="bg-[#25D366] px-2.5 flex items-center justify-center">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </span>
                  <span className="px-3 py-1.5 text-[10px] font-black uppercase bg-white tracking-wider">WhatsApp — {assignedWs.name}</span>
                </a>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-ink/20">
            <span className="text-[9px] font-black uppercase opacity-50 self-center">Status:</span>
            {STATUS_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => handleStatus(opt.value)}
                disabled={updating || status === opt.value}
                className={`text-[9px] font-black uppercase px-3 py-1.5 border-2 border-ink transition-all ${status === opt.value ? 'bg-ink text-white' : 'bg-paper hover:bg-sun disabled:opacity-40'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AddResellerModal({ onClose, onSave }) {
  const [form, setForm] = useState({ company: '', contact_name: '', email: '', phone: '', discount_rate: '15', steuer_id: '', gewerbe_info: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin-reseller', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Fehler'); setLoading(false); return; }
    setEmailSent(true);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-ink shadow-brutalist w-full max-w-md">
        <div className="bg-ink text-white px-5 py-4 flex justify-between items-center">
          <h3 className="font-black uppercase text-sm">Neuer Händler</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { key: 'company', label: 'Firma *', required: true },
            { key: 'contact_name', label: 'Ansprechpartner *', required: true },
            { key: 'email', label: 'E-Mail *', required: true, type: 'email' },
            { key: 'phone', label: 'Telefon', required: false },
          ].map(f => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest">{f.label}</label>
              <input type={f.type || 'text'} value={form[f.key]} required={f.required}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm" />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest">Steuernummer / Steuer-ID</label>
            <input type="text" value={form.steuer_id}
              onChange={e => setForm(p => ({ ...p, steuer_id: e.target.value }))}
              placeholder="z.B. DE123456789"
              className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest">Gewerbeanmeldung</label>
            <textarea value={form.gewerbe_info}
              onChange={e => setForm(p => ({ ...p, gewerbe_info: e.target.value }))}
              rows={2} placeholder="Gewerbe-Nr., Registergericht..."
              className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm resize-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest">Rabatt %</label>
            <input type="number" min="0" max="100" value={form.discount_rate}
              onChange={e => setForm(p => ({ ...p, discount_rate: e.target.value }))}
              className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm w-24" />
          </div>
          {error && <p className="text-tomato text-[11px] font-black uppercase">{error}</p>}
          {emailSent ? (
            <div className="bg-olive/10 border-2 border-olive p-4 space-y-2">
              <p className="text-[10px] font-black uppercase text-olive">Händler erstellt ✓</p>
              <p className="text-[11px]">Zugangsdaten wurden per E-Mail an <strong>{form.email}</strong> gesendet.</p>
              <button type="button" onClick={onClose}
                className="w-full bg-ink text-white py-2 font-black uppercase text-[10px] hover:bg-tomato transition-all mt-2">
                Schließen
              </button>
            </div>
          ) : (
            <>
              <p className="text-[10px] opacity-50">Ein temporäres Passwort wird automatisch generiert.</p>
              <button type="submit" disabled={loading}
                className="w-full bg-ink text-white py-3 font-black uppercase hover:bg-tomato transition-all disabled:opacity-50">
                {loading ? 'Wird erstellt...' : 'Händler erstellen'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

function EditResellerModal({ reseller, onClose, onSave }) {
  const [discountRate, setDiscountRate] = useState(String(reseller.discount_rate || 15));
  const [steuerId, setSteuerId] = useState(reseller.steuer_id || '');
  const [gewerbeInfo, setGewerbeInfo] = useState(reseller.gewerbe_info || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin-reseller', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reseller.id, discount_rate: parseFloat(discountRate) || 15, steuer_id: steuerId || null, gewerbe_info: gewerbeInfo || null }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Fehler beim Speichern.'); return; }
    onSave();
    onClose();
  };

  const handleResetPassword = async () => {
    setResetting(true);
    setResetError('');
    setResetDone(false);
    const res = await fetch('/api/admin-reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reseller_id: reseller.id }),
    });
    const data = await res.json();
    setResetting(false);
    if (!res.ok) { setResetError(data.error || 'Fehler beim Zurücksetzen.'); return; }
    setResetDone(true);
  };

  return (
    <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-ink shadow-brutalist w-full max-w-md">
        <div className="bg-ink text-white px-5 py-4 flex justify-between items-center">
          <h3 className="font-black uppercase text-sm">Händler bearbeiten</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase opacity-50">Firma</p>
            <p className="font-bold">{reseller.company}</p>
            <p className="text-[11px] opacity-50">{reseller.email}</p>
            {reseller.steuer_id && <p className="text-[10px] opacity-40">Steuer: {reseller.steuer_id}</p>}
            {reseller.gewerbe_info && <p className="text-[10px] opacity-40">Gewerbe: {reseller.gewerbe_info}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest">Händlerrabatt %</label>
            <input type="number" min="0" max="100" value={discountRate}
              onChange={e => setDiscountRate(e.target.value)}
              className="w-24 border-2 border-ink p-3 focus:bg-sun outline-none text-sm font-black" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest">Steuernummer / Steuer-ID</label>
            <input type="text" value={steuerId} onChange={e => setSteuerId(e.target.value)}
              placeholder="z.B. DE123456789"
              className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest">Gewerbeanmeldung</label>
            <textarea value={gewerbeInfo} onChange={e => setGewerbeInfo(e.target.value)}
              rows={2} placeholder="Gewerbe-Nr., Registergericht..."
              className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm resize-none" />
          </div>

          {/* Şifre Sıfırlama */}
          <div className="border-t-2 border-ink/20 pt-4 space-y-2">
            <p className="text-[9px] font-black uppercase opacity-50">Passwort</p>
            {resetDone ? (
              <div className="bg-olive/10 border-2 border-olive p-3">
                <p className="text-[10px] font-black uppercase text-olive">Passwort zurückgesetzt ✓</p>
                <p className="text-[11px] mt-1">Neues Passwort wurde per E-Mail an den Händler gesendet.</p>
              </div>
            ) : (
              <>
                {resetError && <p className="text-tomato text-[10px] font-black">{resetError}</p>}
                <button type="button" onClick={handleResetPassword} disabled={resetting}
                  className="w-full border-2 border-ink py-2.5 font-black uppercase text-[10px] hover:bg-sun transition-all disabled:opacity-50">
                  {resetting ? 'Wird zurückgesetzt...' : 'Passwort zurücksetzen'}
                </button>
              </>
            )}
          </div>

          {error && <p className="text-tomato text-[11px] font-black uppercase">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-ink text-white py-3 font-black uppercase hover:bg-tomato transition-all disabled:opacity-50">
            {loading ? 'Wird gespeichert...' : 'Speichern'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AddWorkshopModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', contact_name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin-workshop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Fehler'); setLoading(false); return; }
    setEmailSent(true);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-ink shadow-brutalist w-full max-w-md">
        <div className="bg-ink text-white px-5 py-4 flex justify-between items-center">
          <h3 className="font-black uppercase text-sm">Neue Werkstatt</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { key: 'name',         label: 'Werkstattname *', required: true },
            { key: 'contact_name', label: 'Ansprechpartner', required: false },
            { key: 'email',        label: 'E-Mail (Login) *', required: true, type: 'email' },
            { key: 'phone',        label: 'Telefon',         required: false },
          ].map(f => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest">{f.label}</label>
              <input type={f.type || 'text'} value={form[f.key]} required={f.required}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm" />
            </div>
          ))}
          {error && <p className="text-tomato text-[11px] font-black uppercase">{error}</p>}
          {emailSent ? (
            <div className="bg-olive/10 border-2 border-olive p-4 space-y-2">
              <p className="text-[10px] font-black uppercase text-olive">Werkstatt erstellt ✓</p>
              <p className="text-[11px]">Zugangsdaten wurden per E-Mail an <strong>{form.email}</strong> gesendet.</p>
              <button type="button" onClick={onClose}
                className="w-full bg-ink text-white py-2 font-black uppercase text-[10px] hover:bg-tomato transition-all mt-2">
                Schließen
              </button>
            </div>
          ) : (
            <>
              <p className="text-[10px] opacity-50">Ein temporäres Passwort wird automatisch generiert.</p>
              <button type="submit" disabled={loading}
                className="w-full bg-ink text-white py-3 font-black uppercase hover:bg-tomato transition-all disabled:opacity-50">
                {loading ? 'Wird erstellt...' : 'Werkstatt erstellen'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

function EditWorkshopModal({ workshop, onClose, onSave }) {
  const [form, setForm] = useState({
    name: workshop.name || '',
    contact_name: workshop.contact_name || '',
    phone: workshop.phone || '',
    active: workshop.active !== false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin-workshop', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: workshop.id, ...form }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Fehler beim Speichern.'); setLoading(false); return; }
    onSave();
    onClose();
  };

  const handleResetPassword = async () => {
    setResetting(true);
    setResetError('');
    setResetDone(false);
    const res = await fetch('/api/admin-reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workshop_id: workshop.id }),
    });
    const data = await res.json();
    setResetting(false);
    if (!res.ok) { setResetError(data.error || 'Fehler beim Zurücksetzen.'); return; }
    setResetDone(true);
  };

  return (
    <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-ink shadow-brutalist w-full max-w-md">
        <div className="bg-ink text-white px-5 py-4 flex justify-between items-center">
          <h3 className="font-black uppercase text-sm">Werkstatt bearbeiten</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { key: 'name',         label: 'Werkstattname *', required: true },
            { key: 'contact_name', label: 'Ansprechpartner', required: false },
            { key: 'phone',        label: 'Telefon',         required: false },
          ].map(f => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest">{f.label}</label>
              <input type="text" value={form[f.key]} required={f.required}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm" />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest">E-Mail (Login)</label>
            <p className="border-2 border-ink/30 p-3 text-sm opacity-40 bg-paper select-none">{workshop.email}</p>
            <p className="text-[9px] opacity-40 uppercase">E-Mail kann nicht geändert werden</p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.active}
              onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
              className="w-4 h-4 border-2 border-ink accent-ink" />
            <span className="text-[11px] font-black uppercase">Aktiv</span>
          </label>

          {/* Şifre Sıfırlama */}
          <div className="border-t-2 border-ink/20 pt-4 space-y-2">
            <p className="text-[9px] font-black uppercase opacity-50">Passwort</p>
            {resetDone ? (
              <div className="bg-olive/10 border-2 border-olive p-3">
                <p className="text-[10px] font-black uppercase text-olive">Passwort zurückgesetzt ✓</p>
                <p className="text-[11px] mt-1">Neues Passwort wurde per E-Mail an die Werkstatt gesendet.</p>
              </div>
            ) : (
              <>
                {resetError && <p className="text-tomato text-[10px] font-black">{resetError}</p>}
                <button type="button" onClick={handleResetPassword} disabled={resetting}
                  className="w-full border-2 border-ink py-2.5 font-black uppercase text-[10px] hover:bg-sun transition-all disabled:opacity-50">
                  {resetting ? 'Wird zurückgesetzt...' : 'Passwort zurücksetzen'}
                </button>
              </>
            )}
          </div>

          {error && <p className="text-tomato text-[11px] font-black uppercase">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-ink text-white py-3 font-black uppercase hover:bg-tomato transition-all disabled:opacity-50">
            {loading ? 'Wird gespeichert...' : 'Speichern'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function BackendPage() {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  const [resellers, setResellers] = useState([]);
  const [resellerOrders, setResellerOrders] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showAddReseller, setShowAddReseller] = useState(false);
  const [selectedReseller, setSelectedReseller] = useState(null);
  const [appLoading, setAppLoading] = useState({});
  const [editingReseller, setEditingReseller] = useState(null);
  const [pendingLoading, setPendingLoading] = useState({});

  const [workshops, setWorkshops] = useState([]);
  const [showAddWorkshop, setShowAddWorkshop] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);

  const router = useRouter();
  const supabase = createClient();

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const fetchResellers = async () => {
    const { data } = await supabase.from('resellers').select('*').order('created_at', { ascending: false });
    setResellers(data || []);
  };

  const handlePendingReseller = async (resellerId, action, discountRate = 15) => {
    setPendingLoading(p => ({ ...p, [resellerId]: true }));
    await fetch('/api/reseller-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reseller_id: resellerId, action, discount_rate: discountRate }),
    });
    await fetchResellers();
    setPendingLoading(p => ({ ...p, [resellerId]: false }));
  };

  const fetchResellerOrders = async (resellerId = null) => {
    let q = supabase.from('reseller_orders').select('*, resellers(company, email)').order('created_at', { ascending: false });
    if (resellerId) q = q.eq('reseller_id', resellerId);
    const { data } = await q;
    setResellerOrders(data || []);
  };

  const fetchApplications = async () => {
    const { data } = await supabase
      .from('reseller_applications')
      .select('*')
      .order('created_at', { ascending: false });
    setApplications(data || []);
  };

  const fetchWorkshops = async () => {
    const { data } = await supabase.from('workshops').select('*').order('created_at', { ascending: false });
    setWorkshops(data || []);
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/backend/login'); return; }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (!profile || profile.role !== 'admin') {
        await supabase.auth.signOut();
        router.push('/backend/login');
        return;
      }
      setUserEmail(user.email);
      fetchOrders();
      fetchResellers();
      fetchResellerOrders();
      fetchApplications();
      fetchWorkshops();
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/backend/login');
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
  };

  const handleNotesSave = async (orderId, notes) => {
    await supabase.from('orders').update({ notes }).eq('id', orderId);
  };

  const handleResellerOrderStatus = async (orderId, newStatus) => {
    await supabase.from('reseller_orders').update({ status: newStatus }).eq('id', orderId);
  };

  const handleResellerWorkshopAssign = async (orderId, workshopId) => {
    await supabase.from('reseller_orders').update({ workshop_id: workshopId }).eq('id', orderId);
  };

  const handleWorkshopAssign = async (orderId, workshopId) => {
    await supabase.from('orders').update({ workshop_id: workshopId }).eq('id', orderId);
  };

  const handleApplication = async (appId, action, discountRate = 15) => {
    setAppLoading(p => ({ ...p, [appId]: true }));
    await fetch('/api/admin-approve-reseller', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: appId, action, discount_rate: discountRate }),
    });
    await fetchApplications();
    await fetchResellers();
    setAppLoading(p => ({ ...p, [appId]: false }));
  };

  const allOrders = [
    ...orders.map(o => ({ ...o, _type: 'regular' })),
    ...resellerOrders.map(o => ({ ...o, _type: 'reseller', company: o.resellers?.company })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const filtered = filter === 'all' ? allOrders : allOrders.filter(o => (o.status || 'new') === filter);
  const counts = STATUS_OPTIONS.reduce((acc, opt) => {
    acc[opt.value] = allOrders.filter(o => (o.status || 'new') === opt.value).length;
    return acc;
  }, {});

  const filteredResellerOrders = selectedReseller
    ? resellerOrders.filter(o => o.reseller_id === selectedReseller)
    : resellerOrders;

  return (
    <div className="min-h-screen bg-paper">
      <div className="bg-white border-b-4 border-ink">
        <div className="px-4 py-3 flex justify-between items-center">
          <span className="font-serif font-black text-xl italic uppercase">
            Kittel<span className="text-tomato">werk</span>. Backend
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] opacity-50 hidden sm:block">{userEmail}</span>
            <button onClick={() => { fetchOrders(); fetchResellers(); fetchResellerOrders(); fetchApplications(); fetchWorkshops(); }}
              className="p-2 border-2 border-ink hover:bg-sun transition-all" title="Aktualisieren">
              <RefreshCw size={14} />
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-2 border-2 border-ink hover:bg-tomato hover:text-white transition-all">
              <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
        <div className="flex border-t-2 border-ink">
          <button onClick={() => setTab('orders')}
            className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase px-2 py-2.5 transition-all ${tab === 'orders' ? 'bg-ink text-white' : 'hover:bg-sun'}`}>
            <Package size={13} /> <span className="hidden xs:inline">Bestellungen</span><span className="xs:hidden">Bestellg.</span> {allOrders.length > 0 && `(${allOrders.length})`}
          </button>
          <button onClick={() => setTab('reseller')}
            className={`relative flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase px-2 py-2.5 transition-all border-l-2 border-ink ${tab === 'reseller' ? 'bg-ink text-white' : 'hover:bg-sun'}`}>
            <Users size={13} /> Händler {resellers.filter(r => r.active).length > 0 && `(${resellers.filter(r => r.active).length})`}
            {resellers.filter(r => !r.active).length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-tomato text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {resellers.filter(r => !r.active).length}
              </span>
            )}
          </button>
          <button onClick={() => setTab('workshops')}
            className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase px-2 py-2.5 transition-all border-l-2 border-ink ${tab === 'workshops' ? 'bg-ink text-white' : 'hover:bg-sun'}`}>
            <Wrench size={13} /> Atölyeler {workshops.length > 0 && `(${workshops.length})`}
          </button>
        </div>
      </div>

      {/* SİPARİŞLER SEKMESİ */}
      {tab === 'orders' && (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Gesamt',         value: allOrders.length,       color: 'bg-ink text-white' },
              { label: 'Neu',            value: counts.new || 0,        color: 'bg-sun text-ink' },
              { label: 'In Bearbeitung', value: counts.processing || 0, color: 'bg-blue-100 text-blue-800' },
              { label: 'Versandt',       value: counts.shipped || 0,    color: 'bg-olive/20 text-olive' },
            ].map(stat => (
              <div key={stat.label} className={`border-2 border-ink p-4 shadow-brutalist ${stat.color}`}>
                <div className="text-3xl font-black">{stat.value}</div>
                <div className="text-[9px] font-black uppercase opacity-70">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilter('all')}
              className={`text-[9px] font-black uppercase px-3 py-2 border-2 border-ink transition-all ${filter === 'all' ? 'bg-ink text-white' : 'bg-paper hover:bg-sun'}`}>
              Alle ({allOrders.length})
            </button>
            {STATUS_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setFilter(opt.value)}
                className={`text-[9px] font-black uppercase px-3 py-2 border-2 border-ink transition-all ${filter === opt.value ? 'bg-ink text-white' : 'bg-paper hover:bg-sun'}`}>
                {opt.label} ({counts[opt.value] || 0})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 font-serif italic opacity-40 uppercase">Wird geladen...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 font-serif italic opacity-40 uppercase">Keine Bestellungen</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(order => order._type === 'reseller'
                ? <ResellerOrderRow key={`r-${order.id}`} order={order} onStatusChange={handleResellerOrderStatus} onWorkshopAssign={handleResellerWorkshopAssign} workshops={workshops} supabase={supabase} showBadge />
                : <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} onNotesSave={handleNotesSave} onWorkshopAssign={handleWorkshopAssign} workshops={workshops} supabase={supabase} />
              )}
            </div>
          )}
        </div>
      )}

      {/* RESELLER SEKMESİ */}
      {tab === 'reseller' && (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

          {/* Bekleyen Registrierungen (active=false) */}
          {resellers.filter(r => !r.active).length > 0 && (
            <div className="space-y-3">
              <h2 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <span className="bg-tomato text-white px-2 py-0.5">{resellers.filter(r => !r.active).length}</span>
                Offene Anfragen
              </h2>
              {resellers.filter(r => !r.active).map(r => (
                <div key={r.id} className="bg-white border-4 border-ink shadow-brutalist p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-base uppercase">{r.company}</p>
                      <p className="text-[11px] opacity-60 mt-0.5">{r.contact_name} · <a href={`mailto:${r.email}`} className="text-tomato">{r.email}</a></p>
                      {r.phone && <p className="text-[11px] opacity-60">{r.phone}</p>}
                    </div>
                    <span className="text-[9px] font-black bg-sun px-2 py-1 uppercase">Ausstehend</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px] border-t border-ink/10 pt-3">
                    <div><span className="opacity-50 font-black uppercase text-[9px]">Steuernummer</span><p className="font-bold mt-0.5">{r.steuer_id || '—'}</p></div>
                    {r.gewerbe_info && <div><span className="opacity-50 font-black uppercase text-[9px]">Gewerbe</span><p className="mt-0.5">{r.gewerbe_info}</p></div>}
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-ink/10 flex-wrap">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-black uppercase">Rabatt %</label>
                      <input type="number" min="0" max="100" defaultValue="15"
                        onChange={e => setResellers(prev => prev.map(x => x.id === r.id ? { ...x, _discount: e.target.value } : x))}
                        className="w-16 border-2 border-ink p-2 text-center text-sm font-black focus:bg-sun outline-none" />
                    </div>
                    <button onClick={() => handlePendingReseller(r.id, 'approve', r._discount || 15)}
                      disabled={pendingLoading[r.id]}
                      className="flex-1 bg-olive text-white py-2.5 font-black uppercase text-[11px] hover:bg-ink transition-all disabled:opacity-50">
                      {pendingLoading[r.id] ? '...' : '✓ Genehmigen'}
                    </button>
                    <button onClick={() => handlePendingReseller(r.id, 'reject')}
                      disabled={pendingLoading[r.id]}
                      className="px-4 py-2.5 border-2 border-tomato text-tomato font-black uppercase text-[11px] hover:bg-tomato hover:text-white transition-all disabled:opacity-50">
                      Ablehnen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <h2 className="font-black text-lg uppercase">Händler ({resellers.filter(r => r.active).length})</h2>
            <button onClick={() => setShowAddReseller(true)}
              className="flex items-center gap-2 text-[10px] font-black uppercase px-4 py-2 bg-ink text-white hover:bg-tomato transition-all shadow-brutalist">
              <Plus size={14} /> Neuer Händler
            </button>
          </div>

          {resellers.filter(r => r.active).length === 0 ? (
            <div className="text-center py-16 font-serif italic opacity-40 uppercase">Noch keine aktiven Händler</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resellers.filter(r => r.active).map(r => {
                const rOrders = resellerOrders.filter(o => o.reseller_id === r.id);
                const totalRevenue = rOrders.reduce((s, o) => s + Number(o.total), 0);
                const isSelected = selectedReseller === r.id;
                return (
                  <div key={r.id} className={`border-4 border-ink bg-white transition-all ${isSelected ? 'shadow-brutalist bg-sun' : 'hover:shadow-brutalist'}`}>
                    {/* Kart başlık */}
                    <div className="flex items-center justify-between bg-ink px-4 py-2">
                      <span className="font-black text-xs uppercase tracking-widest text-white truncate">{r.company}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[9px] font-black bg-olive text-white px-2 py-0.5">{r.discount_rate}% Rabatt</span>
                        <button onClick={() => setEditingReseller(r)}
                          className="p-1 border border-white/30 hover:bg-white/20 transition-all" title="Bearbeiten">
                          <Pencil size={11} className="text-white" />
                        </button>
                      </div>
                    </div>
                    {/* Kart içerik */}
                    <button className="w-full text-left p-4 space-y-2" onClick={() => setSelectedReseller(isSelected ? null : r.id)}>
                      <div>
                        <p className="text-[11px] font-black opacity-70">{r.contact_name}</p>
                        <p className="text-[10px] opacity-50">{r.email}</p>
                        {r.phone && <p className="text-[10px] opacity-40">{r.phone}</p>}
                      </div>
                      {(r.steuer_id || r.gewerbe_info) && (
                        <div className="border-t border-ink/10 pt-2 space-y-0.5">
                          {r.steuer_id && <p className="text-[10px] opacity-50"><span className="font-black uppercase">Steuer:</span> {r.steuer_id}</p>}
                          {r.gewerbe_info && <p className="text-[10px] opacity-50"><span className="font-black uppercase">Gewerbe:</span> {r.gewerbe_info}</p>}
                        </div>
                      )}
                      <div className="flex gap-4 border-t border-ink/10 pt-2 text-[10px]">
                        <span><strong>{rOrders.length}</strong> Bestellungen</span>
                        <span><strong>{totalRevenue.toFixed(2)}€</strong> Umsatz</span>
                        {isSelected && <span className="font-black text-tomato ml-auto">▼ aktiv</span>}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reseller Siparişleri */}
          {filteredResellerOrders.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-black text-xs uppercase tracking-widest opacity-50">
                {selectedReseller ? `Bestellungen: ${resellers.find(r => r.id === selectedReseller)?.company}` : 'Alle Händlerbestellungen'}
              </h3>
              {filteredResellerOrders.map(order => (
                <ResellerOrderRow key={order.id} order={order} onStatusChange={handleResellerOrderStatus} onWorkshopAssign={handleResellerWorkshopAssign} workshops={workshops} supabase={supabase} />
              ))}
            </div>
          )}

          {resellerOrders.length === 0 && resellers.length > 0 && (
            <div className="text-center py-10 font-serif italic opacity-40 uppercase">Noch keine Händlerbestellungen</div>
          )}
        </div>
      )}

      {/* ATÖLYELER SEKMESİ */}
      {tab === 'workshops' && (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-black text-lg uppercase">Atölyeler ({workshops.length})</h2>
            <button onClick={() => setShowAddWorkshop(true)}
              className="flex items-center gap-2 text-[10px] font-black uppercase px-4 py-2 bg-ink text-white hover:bg-tomato transition-all shadow-brutalist">
              <Plus size={14} /> Neue Werkstatt
            </button>
          </div>

          {workshops.length === 0 ? (
            <div className="text-center py-16 font-serif italic opacity-40 uppercase">Noch keine Werkstätten</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workshops.map(w => {
                const assignedCount = orders.filter(o => o.workshop_id === w.id && !['done','cancelled'].includes(o.status || 'new')).length;
                return (
                  <div key={w.id} className="bg-white border-2 border-ink p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-black text-sm uppercase">{w.name}</p>
                        {w.contact_name && <p className="text-[10px] opacity-50 mt-0.5">{w.contact_name}</p>}
                        <p className="text-[10px] opacity-50">{w.email}</p>
                        {w.phone && <p className="text-[10px] opacity-40">{w.phone}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-2 py-1 ${w.active ? 'bg-olive/20 text-olive' : 'bg-tomato/10 text-tomato'}`}>
                          {w.active ? 'Aktiv' : 'Inaktiv'}
                        </span>
                        <button onClick={() => setEditingWorkshop(w)}
                          className="p-1.5 border-2 border-ink hover:bg-sun transition-all" title="Bearbeiten">
                          <Pencil size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-ink/10 text-[10px]">
                      <span className="font-black">{assignedCount}</span> aktive Bestellung{assignedCount !== 1 ? 'en' : ''} zugewiesen
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showAddReseller && (
        <AddResellerModal
          onClose={() => setShowAddReseller(false)}
          onSave={() => { fetchResellers(); fetchResellerOrders(); }}
        />
      )}
      {editingReseller && (
        <EditResellerModal
          reseller={editingReseller}
          onClose={() => setEditingReseller(null)}
          onSave={() => fetchResellers()}
        />
      )}
      {showAddWorkshop && (
        <AddWorkshopModal
          onClose={() => setShowAddWorkshop(false)}
          onSave={() => fetchWorkshops()}
        />
      )}
      {editingWorkshop && (
        <EditWorkshopModal
          workshop={editingWorkshop}
          onClose={() => setEditingWorkshop(null)}
          onSave={() => fetchWorkshops()}
        />
      )}
    </div>
  );
}
