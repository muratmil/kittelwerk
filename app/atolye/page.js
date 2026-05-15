'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { RefreshCw, Printer, LogOut, Download, Tag, CheckSquare, Square, Send, ChevronDown, ChevronUp } from 'lucide-react';

const TRANSLATIONS = {
  de: {
    title:          'Atölye',
    lastUpdated:    'Zuletzt aktualisiert:',
    refresh:        'Aktualisieren',
    print:          'Drucken',
    loading:        'Wird geladen...',
    noOrders:       'Keine aktiven Bestellungen',
    noOrdersSub:    'Alle Bestellungen sind abgeschlossen oder storniert.',
    activeOrders:   (n) => `${n} aktive Bestellung${n !== 1 ? 'en' : ''}`,
    colProduct:     'Produkt',
    colColor:       'Farbe',
    colSizes:       'Größen',
    colQty:         'Menge',
    colPrint:       'Druck',
    total:          'Gesamt',
    logo:           'Logo',
    logoDownload:   'Logo herunterladen',
    noLogo:         'Kein Logo',
    note:           'Notiz',
    noNote:         'Keine Notiz',
    qcTitle:        'Qualitätskontrolle',
    qcDone:         '✓ Alle Kontrollen bestanden',
    qcItems: [
      { key: 'qty',   label: 'Menge stimmt' },
      { key: 'color', label: 'Farben stimmt' },
      { key: 'sizes', label: 'Größen stimmt' },
      { key: 'print', label: 'Druck OK' },
    ],
    labelPrint:     'Adressetikett drucken',
    printLabels: {
      none:  'Kein Druck',
      front: 'Vorderdruck',
      back:  'Rückendruck',
      both:  'Vorder- + Rückendruck',
    },
    statusLabels: {
      new:        'Neu',
      processing: 'In Bearbeitung',
      on_hold:    'Pausiert',
      shipped:    'Versandt',
      done:       'Abgeschlossen',
      cancelled:  'Storniert',
    },
    orderNo:        'Bestellung',
    noteSave:       'Notiz speichern',
    noteSaved:      'Gespeichert ✓',
    noteSaving:     'Speichern...',
    workshop:       'Atölye zuweisen',
    notAssigned:    '— Nicht zugewiesen —',
    whatsapp:       'WhatsApp',
    inBearbeitung:  'In Bearbeitung',
    versandt:       'Versandt',
  },
  tr: {
    title:          'Atölye',
    lastUpdated:    'Son güncelleme:',
    refresh:        'Yenile',
    print:          'Yazdır',
    loading:        'Yükleniyor...',
    noOrders:       'Aktif sipariş yok',
    noOrdersSub:    'Tüm siparişler tamamlandı veya iptal edildi.',
    activeOrders:   (n) => `${n} aktif sipariş`,
    colProduct:     'Ürün',
    colColor:       'Renk',
    colSizes:       'Bedenler',
    colQty:         'Adet',
    colPrint:       'Baskı',
    total:          'Toplam',
    logo:           'Logo',
    logoDownload:   'Logoyu indir',
    noLogo:         'Logo yok',
    note:           'Not',
    noNote:         'Not yok',
    qcTitle:        'Kalite Kontrol',
    qcDone:         '✓ Tüm kontroller tamam',
    qcItems: [
      { key: 'qty',   label: 'Adet doğru' },
      { key: 'color', label: 'Renkler doğru' },
      { key: 'sizes', label: 'Bedenler doğru' },
      { key: 'print', label: 'Baskı OK' },
    ],
    labelPrint:     'Adres etiketi yazdır',
    printLabels: {
      none:  'Baskı yok',
      front: 'Ön baskı',
      back:  'Arka baskı',
      both:  'Ön + Arka baskı',
    },
    statusLabels: {
      new:        'Yeni',
      processing: 'İşlemde',
      on_hold:    'Askıda',
      shipped:    'Gönderildi',
      done:       'Tamamlandı',
      cancelled:  'İptal',
    },
    orderNo:        'Sipariş',
    noteSave:       'Notu kaydet',
    noteSaved:      'Kaydedildi ✓',
    noteSaving:     'Kaydediliyor...',
    workshop:       'Atölye ata',
    notAssigned:    '— Atanmamış —',
    whatsapp:       'WhatsApp',
    inBearbeitung:  'İşleme Al',
    versandt:       'Teslim Edildi',
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
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;padding:30px;background:#fff}
    .label{border:3px solid #111;padding:36px;max-width:420px}
    .company{font-size:26px;font-weight:900;text-transform:uppercase;line-height:1.1}
    .name{font-size:13px;margin:10px 0 4px;opacity:.65}
    .address{font-size:19px;margin-top:14px;line-height:1.5;font-weight:600}
    .order-id{font-size:9px;opacity:.35;margin-top:24px;text-transform:uppercase;letter-spacing:.08em}
    @media print{body{padding:10px}}
  </style></head>
  <body onload="window.print();window.close()">
    <div class="label">
      <div class="company">${order.company}</div>
      <div class="name">${order.name}</div>
      <div class="address">${order.street}<br>${order.plz} ${order.city}</div>
      <div class="order-id">${t.orderNo} #${order.id.slice(0, 8)}</div>
    </div>
  </body></html>`);
  win.document.close();
}

const ADMIN_WHATSAPP = '491749623344';

function MessagesPanel({ orderId, supabase, senderName, t }) {
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('workshop_messages').select('*').eq('order_id', orderId).order('created_at');
    setMessages(data || []);
  };

  useEffect(() => { if (open && messages === null) load(); }, [open]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    await supabase.from('workshop_messages').insert([{
      order_id: orderId,
      sender_name: senderName,
      is_merkez: false,
      message: text.trim(),
    }]);
    setText('');
    await load();
    setSending(false);
  };

  return (
    <div className="border-2 border-ink/20 print:hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-sun/40 transition-all">
        <span className="text-[9px] font-black uppercase opacity-50">Nachricht an Merkez</span>
        {open ? <ChevronUp size={12} className="opacity-40" /> : <ChevronDown size={12} className="opacity-40" />}
      </button>
      {open && (
        <div className="border-t-2 border-ink/20 p-3 space-y-3">
          {messages?.length === 0 && (
            <p className="text-[10px] opacity-30 text-center py-2">Noch keine Nachrichten</p>
          )}
          {messages?.map(m => (
            <div key={m.id} className={`flex ${m.is_merkez ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] px-3 py-2 border-2 ${m.is_merkez ? 'bg-sun border-ink' : 'bg-ink text-white border-ink'}`}>
                <p className="text-[9px] font-black uppercase opacity-60 mb-0.5">{m.sender_name}</p>
                <p className="text-[12px] font-medium">{m.message}</p>
                <p className="text-[8px] opacity-40 mt-1">{new Date(m.created_at).toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit' })}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Nachricht schreiben..."
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

function WhatsAppBtn({ waPhone, waText, label }) {
  return (
    <a href={`https://wa.me/${waPhone}?text=${waText}`} target="_blank" rel="noreferrer"
      className="inline-flex items-stretch border-2 border-ink shadow-brutalist hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
      <span className="bg-[#25D366] px-2.5 flex items-center justify-center">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </span>
      <span className="px-3 py-1.5 text-[10px] font-black uppercase bg-white tracking-wider">{label}</span>
    </a>
  );
}

function OrderCard({ order, supabase, t, isWorkshop, workshopName, onStatusChange }) {
  const date = new Date(order.created_at).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  const [status, setStatus] = useState(order.status || 'new');
  const totalQty = order.items?.reduce((sum, i) => sum + i.qty, 0) || 0;
  const [qcChecks, setQcChecks] = useState({});
  const qcDone = t.qcItems.every(i => qcChecks[i.key]);
  const [notes] = useState(order.notes || '');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const waPhone = ADMIN_WHATSAPP;
  const waText = encodeURIComponent(`Bestellung #${order.id.slice(0,8)}\nFirma: ${order.company}\nStückzahl: ${totalQty}\n\nhttps://kittelwerk.de/atolye#${order.id}`);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    await onStatusChange(order.id, newStatus);
    setStatus(newStatus);
    setUpdatingStatus(false);
  };

  const handleLogoDownload = async () => {
    if (!order.logo_url) return;
    const { data } = await supabase.storage.from('logos').createSignedUrl(order.logo_url, 3600);
    if (data) window.open(data.signedUrl, '_blank');
  };

  return (
    <div id={order.id} className="scroll-mt-24 border-4 border-ink bg-white shadow-brutalist-lg print:shadow-none print:border-2 print:break-inside-avoid">
      {/* Header */}
      <div className="bg-ink text-white px-5 py-3 flex justify-between items-center">
        <div>
          <span className="font-black text-lg uppercase">{order.company}</span>
          <span className="text-[10px] opacity-60 ml-3">{date}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black opacity-60">#{order.id.slice(0, 8)}</span>
          <span className={`text-[9px] font-black uppercase px-2 py-1 ${STATUS_COLORS[status]}`}>
            {t.statusLabels[status]}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Üretim tablosu */}
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="border-b-2 border-ink">
              <th className="pb-2 text-left text-[9px] font-black uppercase opacity-50">{t.colProduct}</th>
              <th className="pb-2 text-left text-[9px] font-black uppercase opacity-50">{t.colColor}</th>
              <th className="pb-2 text-left text-[9px] font-black uppercase opacity-50">{t.colSizes}</th>
              <th className="pb-2 text-center text-[9px] font-black uppercase opacity-50">{t.colQty}</th>
              <th className="pb-2 text-left text-[9px] font-black uppercase opacity-50">{t.colPrint}</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, i) => (
              <tr key={i} className="border-b border-ink/10">
                <td className="py-2.5 font-black">{item.name}</td>
                <td className="py-2.5"><span className="flex items-center gap-1.5">{item.color}</span></td>
                <td className="py-2.5 font-mono text-[11px]">{formatSizes(item.sizes)}</td>
                <td className="py-2.5 text-center font-black text-base">{item.qty}</td>
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
              <td className="pt-2 text-center font-black text-xl">{totalQty}</td>
              <td />
            </tr>
          </tfoot>
        </table>

        {/* Logo & Not */}
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

          <div className="border-2 border-ink/20 p-3 print:hidden">
            <p className="text-[9px] font-black uppercase opacity-50 mb-2">{t.note}</p>
            {notes ? (
              <p className="text-[12px] font-medium whitespace-pre-wrap">{notes}</p>
            ) : (
              <p className="text-[11px] font-bold opacity-30">{t.noNote}</p>
            )}
          </div>
          {order.notes && (
            <div className="hidden print:block border-2 border-sun bg-sun/20 p-3">
              <p className="text-[9px] font-black uppercase mb-1">{t.note}</p>
              <p className="text-[12px] font-bold whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
        </div>

        {/* QC Checklist */}
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
          {qcDone && (
            <p className="text-[10px] font-black uppercase text-olive mt-2">{t.qcDone}</p>
          )}
        </div>

        {/* Durum butonları (atölye kullanıcısı) */}
        {isWorkshop && (
          <div className="flex flex-wrap gap-2 print:hidden">
            <button onClick={() => handleStatusChange('processing')}
              disabled={updatingStatus || status === 'processing'}
              className={`text-[10px] font-black uppercase px-4 py-2 border-2 border-ink transition-all
                ${status === 'processing' ? 'bg-ink text-white' : 'bg-white hover:bg-sun disabled:opacity-40'}`}>
              {t.inBearbeitung}
            </button>
            <button onClick={() => handleStatusChange('shipped')}
              disabled={updatingStatus || status === 'shipped'}
              className={`text-[10px] font-black uppercase px-4 py-2 border-2 border-ink transition-all
                ${status === 'shipped' ? 'bg-olive text-white border-olive' : 'bg-white hover:bg-sun disabled:opacity-40'}`}>
              {t.versandt}
            </button>
          </div>
        )}

        {/* Merkez'e mesaj */}
        {isWorkshop && (
          <MessagesPanel orderId={order.id} supabase={supabase} senderName={workshopName} t={t} />
        )}

        {/* Admin'e WhatsApp */}
        <div className="flex justify-start print:hidden">
          <WhatsAppBtn waPhone={waPhone} waText={waText} label={t.whatsapp} />
        </div>

        {/* Adres etiketi */}
        <div className="flex justify-end print:hidden">
          <button onClick={() => printAddressLabel(order, t)}
            className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-2 border-2 border-ink hover:bg-sun transition-all">
            <Tag size={13} /> {t.labelPrint}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AtolyePage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [workshopId, setWorkshopId] = useState(undefined);
  const [workshopName, setWorkshopName] = useState('');
  const [lang, setLang] = useState('de');
  const router = useRouter();
  const supabase = createClient();
  const t = TRANSLATIONS[lang];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/atolye/login');
  };

  const fetchOrders = async (wid) => {
    setLoading(true);
    let q = supabase
      .from('orders')
      .select('*')
      .not('status', 'in', '("done","cancelled","on_hold")')
      .order('created_at', { ascending: true });
    if (wid) q = q.eq('workshop_id', wid);
    const { data } = await q;
    setOrders(data || []);
    setLoading(false);
    setLastUpdated(new Date().toLocaleTimeString('de-DE'));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/atolye/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, workshop_id, workshops(name, active)')
        .eq('id', user.id)
        .single();

      const wid = profile?.workshop_id || null;

      // Ana atölye (seller, workshop_id yok) → merkez ekranına
      if (profile?.role === 'seller' && !wid) { router.replace('/atolye/merkez'); return; }

      // Seller değilse (admin vs.) → atölye login'e
      if (profile?.role !== 'seller') {
        await supabase.auth.signOut();
        router.replace('/atolye/login');
        return;
      }

      // Sub-atölye ama henüz onaylanmamış
      if (profile?.workshops?.active === false) {
        setIsPending(true);
        setLoading(false);
        return;
      }

      setWorkshopId(wid);
      if (profile?.workshops?.name) setWorkshopName(profile.workshops.name);

      await fetchOrders(wid);

      // Sayfa yüklenince hash'e scroll (atölye linki ile gelindiğinde)
      if (window.location.hash) {
        const id = window.location.hash.slice(1);
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
    };
    init();
  }, []);

  if (isPending) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <h1 className="font-serif font-black text-4xl italic uppercase">
            Kittel<span className="text-tomato">werk</span>.
          </h1>
          <div className="bg-white border-4 border-ink shadow-brutalist p-8 space-y-4">
            <p className="text-4xl">⏳</p>
            <h2 className="font-black text-xl uppercase">Anfrage wird geprüft</h2>
            <p className="text-[13px] opacity-60">Ihr Atölye-Konto wird noch freigegeben. Sie erhalten eine E-Mail, sobald Ihr Zugang aktiviert wurde.</p>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/atolye/login'); }}
              className="w-full border-2 border-ink py-3 font-black uppercase text-[11px] tracking-wider hover:bg-sun transition-all">
              Abmelden
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper print:bg-white">
      {/* Header */}
      <div className="bg-white border-b-4 border-ink px-6 py-4 flex justify-between items-center print:hidden">
        <div>
          <h1 className="font-serif font-black text-2xl italic uppercase">
            Kittel<span className="text-tomato">werk</span>. {t.title}
            {workshopName && (
              <span className="text-base normal-case not-italic font-sans opacity-50 ml-2">— {workshopName}</span>
            )}
          </h1>
          {lastUpdated && (
            <p className="text-[9px] opacity-40 uppercase mt-0.5">{t.lastUpdated} {lastUpdated}</p>
          )}
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
          <button onClick={() => fetchOrders(workshopId)}
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

      {/* Print header */}
      <div className="hidden print:flex justify-between items-center px-6 py-4 border-b-2 border-ink mb-4">
        <span className="font-serif font-black text-xl italic uppercase">
          Kittelwerk — {t.title}{workshopName ? ` · ${workshopName}` : ''}
        </span>
        <span className="text-[10px]">{new Date().toLocaleDateString('de-DE')}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="text-center py-20 font-serif italic opacity-40 uppercase">{t.loading}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="font-serif font-black text-2xl italic opacity-30 uppercase">{t.noOrders}</p>
            <p className="text-[11px] opacity-30">{t.noOrdersSub}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between print:hidden">
              <p className="text-[10px] font-black uppercase opacity-50">
                {t.activeOrders(orders.length)}
              </p>
            </div>
            {orders.map(order => (
              <OrderCard key={order.id} order={order} supabase={supabase} t={t}
                isWorkshop={!!workshopId} workshopName={workshopName} onStatusChange={handleStatusChange} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
