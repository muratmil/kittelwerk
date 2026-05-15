'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { RefreshCw, Printer, LogOut, Download, Tag, CheckSquare, Square, Send, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

const TRANSLATIONS = {
  de: {
    title:          'Atölye — Merkez',
    lastUpdated:    'Zuletzt:',
    refresh:        'Aktualisieren',
    print:          'Drucken',
    loading:        'Wird geladen...',
    noOrders:       'Keine Bestellungen',
    orders:         (n) => `${n} Bestellung${n !== 1 ? 'en' : ''}`,
    newRequests:    'Neue Anfragen',
    approve:        'Genehmigen',
    all:            'Alle',
    unassigned:     'Nicht zugewiesen',
    workshop:       'Atölye:',
    notAssigned:    '— Nicht zugewiesen —',
    colProduct:     'Produkt',
    colColor:       'Farbe',
    colSizes:       'Größen',
    colQty:         'Menge',
    colPrint:       'Druck',
    total:          'Gesamt',
    logo:           'Logo',
    logoDownload:   'Logo herunterladen',
    noLogo:         'Kein Logo',
    note:           'Notiz für Atölye',
    notePlaceholder:'Anweisung für die Atölye...',
    noteSave:       'Notiz speichern',
    noteSaved:      'Gespeichert ✓',
    noteSaving:     'Speichern...',
    messages:       'Nachrichten vom Atölye',
    noMessages:     'Noch keine Nachrichten',
    msgPlaceholder: 'Nachricht an Atölye...',
    qcTitle:        'Qualitätskontrolle',
    qcDone:         '✓ Alle Kontrollen bestanden',
    qcItems: [
      { key: 'qty',   label: 'Menge stimmt' },
      { key: 'color', label: 'Farbe stimmt' },
      { key: 'sizes', label: 'Größen stimmt' },
      { key: 'print', label: 'Druck OK' },
    ],
    inBearbeitung:  'In Bearbeitung',
    versandt:       'Versandt',
    labelPrint:     'Etikett',
    statusLabels: {
      new:        'Neu',
      processing: 'In Bearbeitung',
      on_hold:    'Pausiert',
      shipped:    'Versandt',
      done:       'Abgeschlossen',
      cancelled:  'Storniert',
    },
    printLabels: {
      none: 'Kein', front: 'Vorder', back: 'Rücken', both: 'V+R',
    },
    orderNo: 'Bestellung',
  },
  tr: {
    title:          'Atölye — Merkez',
    lastUpdated:    'Son:',
    refresh:        'Yenile',
    print:          'Yazdır',
    loading:        'Yükleniyor...',
    noOrders:       'Sipariş yok',
    orders:         (n) => `${n} sipariş`,
    newRequests:    'Yeni Talepler',
    approve:        'Onayla',
    all:            'Tümü',
    unassigned:     'Atanmamış',
    workshop:       'Atölye:',
    notAssigned:    '— Atanmamış —',
    colProduct:     'Ürün',
    colColor:       'Renk',
    colSizes:       'Bedenler',
    colQty:         'Adet',
    colPrint:       'Baskı',
    total:          'Toplam',
    logo:           'Logo',
    logoDownload:   'Logoyu indir',
    noLogo:         'Logo yok',
    note:           'Atölye için not',
    notePlaceholder:'Atölye için talimat...',
    noteSave:       'Notu kaydet',
    noteSaved:      'Kaydedildi ✓',
    noteSaving:     'Kaydediliyor...',
    messages:       'Atölye\'den mesajlar',
    noMessages:     'Henüz mesaj yok',
    msgPlaceholder: 'Atölye\'ye mesaj...',
    qcTitle:        'Kalite Kontrol',
    qcDone:         '✓ Tüm kontroller tamam',
    qcItems: [
      { key: 'qty',   label: 'Adet doğru' },
      { key: 'color', label: 'Renk doğru' },
      { key: 'sizes', label: 'Beden doğru' },
      { key: 'print', label: 'Baskı OK' },
    ],
    inBearbeitung:  'İşleme Al',
    versandt:       'Teslim Edildi',
    labelPrint:     'Etiket',
    statusLabels: {
      new:        'Yeni',
      processing: 'İşlemde',
      on_hold:    'Askıda',
      shipped:    'Gönderildi',
      done:       'Tamamlandı',
      cancelled:  'İptal',
    },
    printLabels: {
      none: 'Yok', front: 'Ön', back: 'Arka', both: 'Ön+Arka',
    },
    orderNo: 'Sipariş',
  },
};

const STATUS_COLORS = {
  new:        'bg-sun text-ink',
  processing: 'bg-blue-100 text-blue-800',
  on_hold:    'bg-orange-100 text-orange-700',
  shipped:    'bg-olive/20 text-olive',
  done:       'bg-ink/10 text-ink/50',
  cancelled:  'bg-tomato/10 text-tomato',
};

function formatSizes(sizes) {
  if (!sizes || sizes['-'] !== undefined) return `${sizes?.['-'] ?? '—'} Stück`;
  return Object.entries(sizes).filter(([, v]) => v > 0).map(([k, v]) => `${k}×${v}`).join(' · ');
}

function printAddressLabel(order, t) {
  const win = window.open('', '_blank', 'width=520,height=420');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;padding:30px;background:#fff}
    .label{border:3px solid #111;padding:36px;max-width:420px}
    .company{font-size:26px;font-weight:900;text-transform:uppercase;line-height:1.1}
    .name{font-size:13px;margin:10px 0 4px;opacity:.65}
    .address{font-size:19px;margin-top:14px;line-height:1.5;font-weight:600}
    .order-id{font-size:9px;opacity:.35;margin-top:24px;text-transform:uppercase;letter-spacing:.08em}
    @media print{body{padding:10px}}
  </style></head><body onload="window.print();window.close()">
    <div class="label">
      <div class="company">${order.company}</div>
      <div class="name">${order.name}</div>
      <div class="address">${order.street}<br>${order.plz} ${order.city}</div>
      <div class="order-id">${t.orderNo} #${order.id.slice(0,8)}</div>
    </div>
  </body></html>`);
  win.document.close();
}

function MessagesPanel({ orderId, supabase, senderName, t }) {
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('workshop_messages').select('*').eq('order_id', orderId).order('created_at');
    setMessages(data || []);
  }, [orderId, supabase]);

  useEffect(() => { if (open && messages === null) load(); }, [open, messages, load]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    await supabase.from('workshop_messages').insert([{
      order_id: orderId,
      sender_name: senderName,
      is_merkez: true,
      message: text.trim(),
    }]);
    setText('');
    await load();
    setSending(false);
  };

  const unread = messages === null ? 0 : messages.filter(m => !m.is_merkez).length;

  return (
    <div className="border-2 border-ink/20 print:hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-sun/40 transition-all">
        <span className="text-[9px] font-black uppercase opacity-50 flex items-center gap-2">
          {t.messages}
          {unread > 0 && <span className="bg-tomato text-white text-[8px] font-black px-1.5 py-0.5">{unread}</span>}
        </span>
        {open ? <ChevronUp size={12} className="opacity-40" /> : <ChevronDown size={12} className="opacity-40" />}
      </button>

      {open && (
        <div className="border-t-2 border-ink/20 p-3 space-y-3">
          {messages?.length === 0 && (
            <p className="text-[10px] opacity-30 text-center py-2">{t.noMessages}</p>
          )}
          {messages?.map(m => (
            <div key={m.id} className={`flex ${m.is_merkez ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3 py-2 border-2 ${m.is_merkez ? 'bg-ink text-white border-ink' : 'bg-sun border-ink'}`}>
                <p className="text-[9px] font-black uppercase opacity-60 mb-0.5">{m.sender_name}</p>
                <p className="text-[12px] font-medium">{m.message}</p>
                <p className="text-[8px] opacity-40 mt-1">{new Date(m.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={t.msgPlaceholder}
              className="flex-1 border-2 border-ink p-2 text-[11px] outline-none focus:bg-sun" />
            <button onClick={send} disabled={sending || !text.trim()}
              className="px-3 border-2 border-ink hover:bg-sun disabled:opacity-40 transition-all">
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, supabase, workshops, onStatusChange, onAssign, t }) {
  const date = new Date(order.created_at).toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' });
  const [status, setStatus] = useState(order.status || 'new');
  const [workshopId, setWorkshopId] = useState(order.workshop_id || '');
  const [qcChecks, setQcChecks] = useState({});
  const [notes, setNotes] = useState(order.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const totalQty = order.items?.reduce((sum, i) => sum + i.qty, 0) || 0;
  const qcDone = t.qcItems.every(i => qcChecks[i.key]);

  const handleAssign = async (wid) => {
    setAssigning(true);
    setWorkshopId(wid);
    await supabase.from('orders').update({ workshop_id: wid || null }).eq('id', order.id);
    onAssign(order.id, wid || null);
    setAssigning(false);
  };

  const handleStatus = async (newStatus) => {
    setUpdatingStatus(true);
    await onStatusChange(order.id, newStatus);
    setStatus(newStatus);
    setUpdatingStatus(false);
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await supabase.from('orders').update({ notes }).eq('id', order.id);
    setSavingNotes(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleLogoDownload = async () => {
    if (!order.logo_url) return;
    const { data } = await supabase.storage.from('logos').createSignedUrl(order.logo_url, 3600);
    if (data) window.open(data.signedUrl, '_blank');
  };

  const assignedWorkshop = workshops.find(w => w.id === workshopId);

  return (
    <div id={order.id} className="scroll-mt-24 border-4 border-ink bg-white shadow-brutalist-lg print:shadow-none print:border-2 print:break-inside-avoid">
      {/* Header */}
      <div className="bg-ink text-white px-5 py-3 flex justify-between items-center">
        <div>
          <span className="font-black text-lg uppercase">{order.company}</span>
          <span className="text-[10px] opacity-60 ml-3">{date}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black opacity-60">#{order.id.slice(0,8)}</span>
          <span className={`text-[9px] font-black uppercase px-2 py-1 ${STATUS_COLORS[status]}`}>
            {t.statusLabels[status]}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Atölye atama */}
        <div className="flex items-center gap-3 border-2 border-sun bg-sun/20 p-3 print:hidden">
          <span className="text-[9px] font-black uppercase opacity-60 whitespace-nowrap">{t.workshop}</span>
          <select value={workshopId} onChange={e => handleAssign(e.target.value)}
            disabled={assigning}
            className="flex-1 border-2 border-ink p-2 text-[11px] font-bold bg-white outline-none focus:bg-sun cursor-pointer disabled:opacity-50">
            <option value="">{t.notAssigned}</option>
            {workshops.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          {assigning && <span className="text-[9px] opacity-40 uppercase">...</span>}
          {!assigning && assignedWorkshop && <CheckCircle size={14} className="text-olive shrink-0" />}
        </div>
        {assignedWorkshop && (
          <div className="hidden print:block text-[11px] font-bold">
            {t.workshop} {assignedWorkshop.name}
          </div>
        )}

        {/* Üretim tablosu */}
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="border-b-2 border-ink">
              {[t.colProduct, t.colColor, t.colSizes, t.colQty, t.colPrint].map(h => (
                <th key={h} className="pb-2 text-left text-[9px] font-black uppercase opacity-50">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, i) => (
              <tr key={i} className="border-b border-ink/10">
                <td className="py-2.5 font-black">{item.name}</td>
                <td className="py-2.5">{item.color}</td>
                <td className="py-2.5 font-mono text-[11px]">{formatSizes(item.sizes)}</td>
                <td className="py-2.5 font-black text-base">{item.qty}</td>
                <td className="py-2.5">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 ${item.printType && item.printType !== 'none' ? 'bg-tomato text-white' : 'bg-ink/10 text-ink/40'}`}>
                    {t.printLabels[item.printType] || t.printLabels.none}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-ink">
              <td colSpan={3} className="pt-2 text-[9px] font-black uppercase opacity-50">{t.total}</td>
              <td className="pt-2 font-black text-xl">{totalQty}</td>
              <td />
            </tr>
          </tfoot>
        </table>

        {/* Logo & Notiz */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="border-2 border-dashed border-ink/30 p-3 bg-paper">
            <p className="text-[9px] font-black uppercase opacity-50 mb-1.5">{t.logo}</p>
            {order.logo_url ? (
              <button onClick={handleLogoDownload}
                className="flex items-center gap-1.5 text-tomato font-bold text-[11px] hover:underline">
                <Download size={12} /> {t.logoDownload}
              </button>
            ) : (
              <p className="text-[11px] font-bold opacity-40">{t.noLogo}</p>
            )}
          </div>
          <div className="border-2 border-ink/20 p-3 space-y-2 print:hidden">
            <p className="text-[9px] font-black uppercase opacity-50">{t.note}</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              rows={3} placeholder={t.notePlaceholder}
              className="w-full border-2 border-ink/20 p-2 text-[11px] outline-none focus:border-ink focus:bg-sun resize-none bg-white" />
            <button onClick={handleSaveNotes} disabled={savingNotes}
              className={`text-[10px] font-black uppercase px-3 py-1.5 border-2 border-ink transition-all disabled:opacity-50
                ${notesSaved ? 'bg-olive text-white border-olive' : 'bg-white hover:bg-sun'}`}>
              {notesSaved ? t.noteSaved : savingNotes ? t.noteSaving : t.noteSave}
            </button>
          </div>
        </div>

        {/* Nachrichten */}
        <MessagesPanel orderId={order.id} supabase={supabase} senderName="Merkez" t={t} />

        {/* QC */}
        <div className="border-2 border-ink/20 p-3 print:hidden">
          <p className="text-[9px] font-black uppercase opacity-50 mb-2">{t.qcTitle}</p>
          <div className="grid grid-cols-2 gap-2">
            {t.qcItems.map(item => (
              <button key={item.key}
                onClick={() => setQcChecks(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                className={`flex items-center gap-2 text-[11px] font-bold px-2 py-1.5 border-2 transition-all
                  ${qcChecks[item.key] ? 'border-olive bg-olive/10 text-olive' : 'border-ink/20 hover:border-ink/40'}`}>
                {qcChecks[item.key] ? <CheckSquare size={13} /> : <Square size={13} />}
                {item.label}
              </button>
            ))}
          </div>
          {qcDone && <p className="text-[10px] font-black uppercase text-olive mt-2">{t.qcDone}</p>}
        </div>

        {/* Atölye WhatsApp */}
        {assignedWorkshop?.phone && (
          <div className="flex justify-start print:hidden">
            <a href={`https://wa.me/${assignedWorkshop.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`${t.orderNo} #${order.id.slice(0,8)} · ${order.company} · ${totalQty} Stk`)}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-stretch border-2 border-ink shadow-brutalist hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <span className="bg-[#25D366] px-2.5 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </span>
              <span className="px-3 py-1.5 text-[10px] font-black uppercase bg-white tracking-wider">
                {assignedWorkshop.name} — WhatsApp
              </span>
            </a>
          </div>
        )}

        {/* Status + Etikett */}
        <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex flex-wrap gap-2">
            {[
              { s: 'processing', label: t.inBearbeitung, activeClass: 'bg-ink text-white' },
              { s: 'shipped',    label: t.versandt,      activeClass: 'bg-olive text-white border-olive' },
            ].map(({ s, label, activeClass }) => (
              <button key={s} onClick={() => handleStatus(s)}
                disabled={updatingStatus || status === s}
                className={`text-[10px] font-black uppercase px-3 py-1.5 border-2 border-ink transition-all disabled:opacity-40
                  ${status === s ? activeClass : 'bg-white hover:bg-sun'}`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => printAddressLabel(order, t)}
            className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-2 border-2 border-ink hover:bg-sun transition-all">
            <Tag size={13} /> {t.labelPrint}
          </button>
        </div>
      </div>
    </div>
  );
}

function PendingCard({ workshop, onApprove, approving, t }) {
  return (
    <div className="border-2 border-ink bg-white p-4 flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <p className="font-black text-sm uppercase">{workshop.name}</p>
        <p className="text-[11px] opacity-60">{workshop.email}{workshop.phone ? ` · ${workshop.phone}` : ''}</p>
        {workshop.contact_name && <p className="text-[10px] opacity-40">{workshop.contact_name}</p>}
      </div>
      <button onClick={() => onApprove(workshop.id)} disabled={approving}
        className="shrink-0 text-[10px] font-black uppercase px-4 py-2 bg-olive text-white border-2 border-olive hover:bg-olive/80 disabled:opacity-50 transition-all flex items-center gap-2">
        <CheckCircle size={13} /> {t.approve}
      </button>
    </div>
  );
}

export default function AtolyeMerkez() {
  const [orders, setOrders] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filterWorkshop, setFilterWorkshop] = useState('all');
  const [approvingId, setApprovingId] = useState(null);
  const [lang, setLang] = useState('de');
  const router = useRouter();
  const supabase = createClient();
  const t = TRANSLATIONS[lang];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/atolye/login');
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ordersRes, workshopsRes, pendingRes] = await Promise.all([
        supabase.from('orders').select('*')
          .not('status', 'in', '("done","cancelled","on_hold")')
          .order('created_at', { ascending: true }),
        supabase.from('workshops').select('*').eq('active', true).order('name'),
        supabase.from('workshops').select('*').eq('active', false).order('created_at'),
      ]);
      setOrders(ordersRes.data || []);
      setWorkshops(workshopsRes.data || []);
      setPending(pendingRes.data || []);
      setLastUpdated(new Date().toLocaleTimeString('de-DE'));
    } catch (e) {
      console.error('loadAll error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/atolye/login'); return; }

      const { data: profile } = await supabase
        .from('profiles').select('role, workshop_id').eq('id', user.id).single();

      const isMerkez = profile?.role === 'seller' && !profile?.workshop_id;
      if (!isMerkez) {
        await supabase.auth.signOut();
        router.push('/atolye/login');
        return;
      }

      await loadAll();
    };
    init();
  }, []);

  const handleApprove = async (workshopId) => {
    setApprovingId(workshopId);
    await fetch('/api/atolye-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workshop_id: workshopId }),
    });
    await loadAll();
    setApprovingId(null);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
  };

  const handleAssign = (orderId, workshopId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, workshop_id: workshopId } : o));
  };

  const filteredOrders = filterWorkshop === 'all'
    ? orders
    : filterWorkshop === 'unassigned'
    ? orders.filter(o => !o.workshop_id)
    : orders.filter(o => o.workshop_id === filterWorkshop);

  return (
    <div className="min-h-screen bg-paper print:bg-white">
      {/* Header */}
      <div className="bg-white border-b-4 border-ink px-6 py-4 flex justify-between items-center print:hidden">
        <div>
          <h1 className="font-serif font-black text-2xl italic uppercase">
            Kittel<span className="text-tomato">werk</span>.{' '}
            <span className="text-ink">Atölye</span>
            <span className="text-[14px] normal-case not-italic font-sans opacity-40 ml-2">— Merkez</span>
          </h1>
          {lastUpdated && <p className="text-[9px] opacity-40 uppercase mt-0.5">{t.lastUpdated} {lastUpdated}</p>}
        </div>
        <div className="flex gap-2">
          {/* Dil toggler */}
          <div className="flex border-2 border-ink">
            <button onClick={() => setLang('de')}
              className={`text-[10px] font-black px-2.5 py-1.5 transition-all ${lang === 'de' ? 'bg-ink text-white' : 'hover:bg-sun'}`}>
              DE
            </button>
            <button onClick={() => setLang('tr')}
              className={`text-[10px] font-black px-2.5 py-1.5 border-l-2 border-ink transition-all ${lang === 'tr' ? 'bg-ink text-white' : 'hover:bg-sun'}`}>
              TR
            </button>
          </div>
          <button onClick={loadAll}
            className="p-2 border-2 border-ink hover:bg-sun transition-all" title={t.refresh}>
            <RefreshCw size={14} />
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-2 border-2 border-ink hover:bg-sun transition-all">
            <Printer size={14} /> {t.print}
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-2 border-2 border-ink hover:bg-tomato hover:text-white transition-all">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {loading ? (
          <div className="text-center py-20 font-serif italic opacity-40 uppercase">{t.loading}</div>
        ) : (
          <>
            {/* Bekleyen kayıtlar */}
            {pending.length > 0 && (
              <div className="space-y-3 print:hidden">
                <div className="flex items-center gap-3">
                  <h2 className="text-[11px] font-black uppercase tracking-widest">{t.newRequests}</h2>
                  <span className="bg-tomato text-white text-[9px] font-black px-2 py-0.5">{pending.length}</span>
                </div>
                <div className="border-4 border-sun bg-sun/10 divide-y-2 divide-sun">
                  {pending.map(w => (
                    <PendingCard key={w.id} workshop={w} t={t}
                      onApprove={handleApprove}
                      approving={approvingId === w.id} />
                  ))}
                </div>
              </div>
            )}

            {/* Filtre */}
            <div className="space-y-4 print:hidden">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase opacity-50">
                  {t.orders(filteredOrders.length)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: t.all },
                  { key: 'unassigned', label: t.unassigned },
                  ...workshops.map(w => ({ key: w.id, label: w.name })),
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setFilterWorkshop(key)}
                    className={`text-[10px] font-black uppercase px-3 py-1.5 border-2 border-ink transition-all
                      ${filterWorkshop === key ? 'bg-ink text-white' : 'bg-white hover:bg-sun'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Siparişler */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-serif font-black text-2xl italic opacity-30 uppercase">{t.noOrders}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map(order => (
                  <OrderCard key={order.id} order={order} supabase={supabase} t={t}
                    workshops={workshops} onStatusChange={handleStatusChange} onAssign={handleAssign} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
