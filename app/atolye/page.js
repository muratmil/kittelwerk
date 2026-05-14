'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { RefreshCw, Printer, LogOut, Download, Tag, CheckSquare, Square } from 'lucide-react';

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

function OrderCard({ order, supabase, t }) {
  const date = new Date(order.created_at).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  const status = order.status || 'new';
  const totalQty = order.items?.reduce((sum, i) => sum + i.qty, 0) || 0;
  const [qcChecks, setQcChecks] = useState({});
  const qcDone = t.qcItems.every(i => qcChecks[i.key]);

  const handleLogoDownload = async () => {
    if (!order.logo_url) return;
    const { data } = await supabase.storage.from('logos').createSignedUrl(order.logo_url, 3600);
    if (data) window.open(data.signedUrl, '_blank');
  };

  return (
    <div className="border-4 border-ink bg-white shadow-brutalist-lg print:shadow-none print:border-2 print:break-inside-avoid">
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

          {order.notes ? (
            <div className="border-2 border-sun bg-sun/20 p-3">
              <p className="text-[9px] font-black uppercase mb-1">{t.note}</p>
              <p className="text-[12px] font-bold whitespace-pre-wrap">{order.notes}</p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-ink/20 p-3 flex items-center justify-center">
              <p className="text-[10px] opacity-30 uppercase font-black">{t.noNote}</p>
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

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/atolye/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('workshop_id, workshops(name)')
        .eq('id', user.id)
        .single();

      const wid = profile?.workshop_id || null;
      setWorkshopId(wid);
      if (profile?.workshops?.name) setWorkshopName(profile.workshops.name);
      fetchOrders(wid);
    };
    init();
  }, []);

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
              <OrderCard key={order.id} order={order} supabase={supabase} t={t} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
