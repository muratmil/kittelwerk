'use client';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import OrderForm from './OrderForm';
import { useState } from 'react';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, removeItem, getTotalPrice } = useCartStore();
  const [showForm, setShowForm] = useState(false);
  const totalPrice = getTotalPrice();

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
                <OrderForm items={items} totalPrice={totalPrice} onBack={() => setShowForm(false)} />
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
                            <span className="font-black text-lg">{item.qty} × {item.price}€</span>
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
              <div className="p-6 border-t-4 border-ink bg-sun space-y-4">
                <div className="flex justify-between items-baseline font-serif font-black text-3xl italic">
                  <span>TOTAL</span>
                  <span>{totalPrice.toFixed(2)}€</span>
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
