'use client';
import { useCartStore, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Tag, CheckCircle } from 'lucide-react';
import OrderForm from './OrderForm';
import { useState } from 'react';

export default function CartDrawer({ isOpen, onClose }) {
  const {
    items, removeItem,
    appliedCode, discountPercent, applyCode, removeCode,
    getSubtotal, getDiscountAmount, getShippingCost, getFinalTotal,
  } = useCartStore();

  const [showForm, setShowForm] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState(false);

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const shippingCost = getShippingCost();
  const finalTotal = getFinalTotal();
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  const handleApplyCode = () => {
    const result = applyCode(codeInput);
    if (result.success) {
      setCodeError(false);
      setCodeInput('');
    } else {
      setCodeError(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-ink/80 z-[100] backdrop-blur-sm" />

          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed top-0 right-0 w-full max-w-md h-full bg-paper border-l-4 border-ink z-[101] flex flex-col shadow-2xl">

            <div className="p-6 border-b-4 border-ink flex justify-between items-center bg-white">
              <h3 className="font-serif font-black text-2xl uppercase italic">Dein Warenkorb</h3>
              <button onClick={onClose} className="p-2 hover:bg-tomato hover:text-white border-2 border-ink transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {showForm ? (
                <OrderForm items={items} totalPrice={finalTotal} onBack={() => setShowForm(false)} />
              ) : (
                <>
                  {items.length === 0 ? (
                    <div className="text-center py-20 font-serif italic opacity-40 uppercase">Dein Warenkorb ist noch leer...</div>
                  ) : (
                    items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-4 border-2 border-ink bg-white shadow-brutalist">
                        <div className="w-20 h-20 bg-ink flex items-center justify-center">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-screen" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm uppercase">{item.name}</h4>
                          <p className="text-[10px] uppercase opacity-60">{item.color} · Gr. {item.size}</p>
                          <div className="flex justify-between items-end mt-2">
                            <span className="font-black text-lg">{item.qty} × {item.price.toFixed(2)}€</span>
                            <button onClick={() => removeItem(item.id, item.color, item.size)} className="text-tomato">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>

            {!showForm && items.length > 0 && (
              <div className="p-6 border-t-4 border-ink bg-sun space-y-3">

                {/* Ücretsiz kargo uyarısı */}
                {remainingForFreeShipping > 0 && (
                  <div className="text-[10px] font-bold uppercase text-center bg-ink text-white py-2 px-3">
                    Noch <span className="text-sun">{remainingForFreeShipping.toFixed(2)}€</span> bis zur kostenlosen Lieferung
                  </div>
                )}

                {/* Rabatt kodu */}
                {!appliedCode ? (
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center border-2 border-ink bg-white">
                      <Tag size={14} className="ml-2 opacity-40" />
                      <input
                        type="text"
                        value={codeInput}
                        onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setCodeError(false); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCode()}
                        placeholder="RABATTCODE"
                        className="flex-1 px-2 py-2 text-[11px] font-black uppercase outline-none bg-transparent tracking-widest"
                      />
                    </div>
                    <button
                      onClick={handleApplyCode}
                      className="bg-ink text-white px-4 py-2 text-[10px] font-black uppercase hover:bg-tomato transition-all border-2 border-ink"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-olive/20 border-2 border-olive px-3 py-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-olive" />
                      <span className="text-[11px] font-black uppercase text-olive">{appliedCode} — {discountPercent}% Rabatt</span>
                    </div>
                    <button onClick={removeCode} className="text-[10px] font-bold opacity-50 hover:opacity-100 hover:text-tomato transition-all">
                      <X size={14} />
                    </button>
                  </div>
                )}

                {codeError && (
                  <p className="text-[10px] font-bold text-tomato uppercase">Ungültiger Rabattcode.</p>
                )}

                {/* Fiyat dökümü */}
                <div className="space-y-1.5 border-t-2 border-ink/30 pt-3">
                  <div className="flex justify-between text-[11px] font-bold uppercase">
                    <span className="opacity-60">Zwischensumme</span>
                    <span>{subtotal.toFixed(2)}€</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[11px] font-bold uppercase text-olive">
                      <span>Rabatt ({discountPercent}%)</span>
                      <span>−{discountAmount.toFixed(2)}€</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] font-bold uppercase">
                    <span className="opacity-60">Versandkosten</span>
                    {shippingCost === 0 ? (
                      <span className="text-olive font-black">GRATIS</span>
                    ) : (
                      <span>{shippingCost.toFixed(2)}€</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-baseline font-serif font-black text-3xl italic border-t-2 border-ink pt-3">
                  <span>TOTAL</span>
                  <span>{finalTotal.toFixed(2)}€</span>
                </div>

                <button onClick={() => setShowForm(true)} className="w-full bg-ink text-white py-5 font-black uppercase shadow-brutalist hover:bg-tomato transition-all active:translate-x-1 active:translate-y-1">
                  Zur Bestellanfrage
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
