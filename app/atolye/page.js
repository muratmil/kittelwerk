'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { RefreshCw, Printer, LogOut, Download, Tag, CheckSquare, Square } from 'lucide-react';

const PRINT_LABELS = {
  none:  'Kein Druck',
  front: 'Vorderdruck',
  back:  'Rückendruck',
  both:  'Vorder- + Rückendruck',
};

const STATUS_LABELS = {
  new:        'Neu',
  processing: 'In Bearbeitung',
  shipped:    'Versandt',
  done:       'Abgeschlossen',
  cancelled:  'Storniert',
};

const STATUS_COLORS = {
  new:        'bg-sun text-ink',
  processing: 'bg-blue-100 text-blue-800',
  shipped:    'bg-olive/20 text-olive',
  done:       'bg-ink/10 text-ink/50',
  cancelled:  'bg-tomato/10 text-tomato',
};

const QC_ITEMS = [
  { key: 'qty',   label: 'Menge stimmt' },
  { key: 'color', label: 'Farben stimmt' },
  { key: 'sizes', label: 'Größen stimmt' },
  { key: 'print', label: 'Druck OK' },
];

function formatSizes(sizes) {
  if (!sizes || sizes['-'] !== undefined) return `${sizes?.['-'] ?? '—'} Stück`;
  return Object.entries(sizes).filter(([, v]) => v > 0).map(([k, v]) => `${k}×${v}`).join(' · ');
}

function printAddressLabel(order) {
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
      <div class="order-id">Bestellung #${order.id.slice(0, 8)}</div>
    </div>
  </body></html>`);
  win.document.close();
}

function OrderCard({ order, supabase }) {
  const date = new Date(order.created_at).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  const status = order.status || 'new';
  const totalQty = order.items?.reduce((sum, i) => sum + i.qty, 0) || 0;
  const [qcChecks, setQcChecks] = useState({});
  const qcDone = QC_ITEMS.every(i => qcChecks[i.key]);

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
            {STATUS_LABELS[status]}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Üretim tablosu */}
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="border-b-2 border-ink">
              <th className="pb-2 text-left text-[9px] font-black uppercase opacity-50">Produkt</th>
              <th className="pb-2 text-left text-[9px] font-black uppercase opacity-50">Farbe</th>
              <th className="pb-2 text-left text-[9px] font-black uppercase opacity-50">Größen</th>
              <th className="pb-2 text-center text-[9px] font-black uppercase opacity-50">Menge</th>
              <th className="pb-2 text-left text-[9px] font-black uppercase opacity-50">Druck</th>
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
                    {PRINT_LABELS[item.printType] || 'Kein Druck'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-ink">
              <td colSpan={3} className="pt-2 text-[9px] font-black uppercase opacity-50">Gesamt</td>
              <td className="pt-2 text-center font-black text-xl">{totalQty}</td>
              <td />
            </tr>
          </tfoot>
        </table>

        {/* Logo & Notizen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="border-2 border-dashed border-ink/30 p-3 bg-paper">
            <p className="text-[9px] font-black uppercase opacity-50 mb-1.5">Logo</p>
            {order.logo_url ? (
              <button onClick={handleLogoDownload}
                className="flex items-center gap-1.5 text-tomato font-bold text-[11px] hover:underline">
                <Download size={12} /> Logo herunterladen
              </button>
            ) : (
              <p className="text-[11px] font-bold opacity-40">Kein Logo</p>
            )}
          </div>

          {order.notes ? (
            <div className="border-2 border-sun bg-sun/20 p-3">
              <p className="text-[9px] font-black uppercase mb-1">Notiz</p>
              <p className="text-[12px] font-bold whitespace-pre-wrap">{order.notes}</p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-ink/20 p-3 flex items-center justify-center">
              <p className="text-[10px] opacity-30 uppercase font-black">Keine Notiz</p>
            </div>
          )}
        </div>

        {/* QC Checklist */}
        <div className="border-2 border-ink/20 p-3 print:hidden">
          <p className="text-[9px] font-black uppercase opacity-50 mb-2">Qualitätskontrolle</p>
          <div className="grid grid-cols-2 gap-2">
            {QC_ITEMS.map(item => (
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
            <p className="text-[10px] font-black uppercase text-olive mt-2">✓ Alle Kontrollen bestanden</p>
          )}
        </div>

        {/* Adres etiketi */}
        <div className="flex justify-end print:hidden">
          <button onClick={() => printAddressLabel(order)}
            className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-2 border-2 border-ink hover:bg-sun transition-all">
            <Tag size={13} /> Adressetikett drucken
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
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/atolye/login');
  };

  const fetchOrders = async (wid) => {
    setLoading(true);
    let q = supabase
      .from('orders')
      .select('*')
      .not('status', 'in', '("done","cancelled")')
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
            Kittel<span className="text-tomato">werk</span>. Atölye
            {workshopName && (
              <span className="text-base normal-case not-italic font-sans opacity-50 ml-2">— {workshopName}</span>
            )}
          </h1>
          {lastUpdated && <p className="text-[9px] opacity-40 uppercase mt-0.5">Zuletzt aktualisiert: {lastUpdated}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchOrders(workshopId)}
            className="p-2 border-2 border-ink hover:bg-sun transition-all" title="Aktualisieren">
            <RefreshCw size={14} />
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-2 border-2 border-ink hover:bg-sun transition-all">
            <Printer size={14} /> Drucken
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
          Kittelwerk — Atölye{workshopName ? ` · ${workshopName}` : ''}
        </span>
        <span className="text-[10px]">{new Date().toLocaleDateString('de-DE')}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="text-center py-20 font-serif italic opacity-40 uppercase">Wird geladen...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="font-serif font-black text-2xl italic opacity-30 uppercase">Keine aktiven Bestellungen</p>
            <p className="text-[11px] opacity-30">Alle Bestellungen sind abgeschlossen oder storniert.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between print:hidden">
              <p className="text-[10px] font-black uppercase opacity-50">
                {orders.length} aktive Bestellung{orders.length !== 1 ? 'en' : ''}
              </p>
            </div>
            {orders.map(order => (
              <OrderCard key={order.id} order={order} supabase={supabase} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
