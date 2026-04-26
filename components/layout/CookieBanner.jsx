'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const consent = localStorage.getItem('kittelwerk-cookies');
    if (!consent) setIsVisible(true);
  }, []);
  const acceptCookies = () => {
    localStorage.setItem('kittelwerk-cookies', 'true');
    setIsVisible(false);
  };
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:w-[400px] bg-ink text-white p-6 border-4 border-sun z-[200] shadow-brutalist-lg"
        >
          <h5 className="font-serif font-black text-xl mb-2 italic text-sun">Kekse? 🍪</h5>
          <p className="text-[10px] leading-relaxed uppercase tracking-widest opacity-80 mb-4">
            Wir nutzen Cookies, um dein Erlebnis bei unserer Neueröffnung so reibungslos wie möglich zu machen.
          </p>
          <div className="flex gap-4">
            <button onClick={acceptCookies} className="flex-1 bg-sun text-ink font-black py-2 text-xs uppercase hover:bg-white transition-all shadow-[2px_2px_0px_0px_white]">
              Einverstanden
            </button>
            <button onClick={() => setIsVisible(false)} className="text-[10px] uppercase font-bold opacity-50">
              Ablehnen
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
