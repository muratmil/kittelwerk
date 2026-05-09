'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle } from 'lucide-react';

export default function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const seen = localStorage.getItem('kw-newsletter');
    if (!seen) {
      const timer = setTimeout(() => setIsVisible(true), 6000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('kw-newsletter', 'closed');
    setIsVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      setStatus('success');
      localStorage.setItem('kw-newsletter', 'subscribed');
    } else {
      setStatus('error');
      setErrorMsg(data.error || 'Ein Fehler ist aufgetreten.');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose} className="absolute inset-0 bg-ink/70 backdrop-blur-sm" />

          <motion.div
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            className="relative bg-paper border-4 border-ink w-full max-w-md shadow-brutalist-lg z-10"
          >
            <div className="bg-ink text-white p-6 relative">
              <button onClick={handleClose} className="absolute top-4 right-4 hover:text-tomato transition-colors">
                <X size={20} />
              </button>
              <span className="text-sun text-[10px] font-black uppercase tracking-[0.3em]">Exklusiv für Neukunden</span>
              <h2 className="font-serif font-black text-4xl italic tracking-tighter mt-2 leading-none">
                5% Rabatt<br />sichern.
              </h2>
            </div>

            <div className="p-6">
              {status === 'success' ? (
                <div className="text-center py-4 space-y-4">
                  <CheckCircle size={48} className="text-olive mx-auto" />
                  <p className="font-black text-lg uppercase">Dein Code ist unterwegs!</p>
                  <p className="text-sm font-medium opacity-80 leading-snug">
                    Wir haben dir deinen persönlichen Rabattcode per E-Mail geschickt.
                  </p>
                  <div className="bg-tomato text-white px-4 py-3 border-2 border-ink text-left">
                    <p className="text-[11px] font-black uppercase tracking-wide leading-snug">
                      ⚠ Bitte prüfe auch deinen Spam-Ordner — unsere Mail könnte dort gelandet sein!
                    </p>
                  </div>
                  <p className="text-[10px] opacity-50 uppercase tracking-widest">Der Code ist ausschließlich per E-Mail verfügbar.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium opacity-70 mb-4 leading-tight">
                    Jetzt anmelden und <strong>5% Rabatt</strong> auf deine erste Bestellung erhalten. Code wird per E-Mail zugeschickt.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex border-2 border-ink">
                      <div className="flex items-center pl-3 opacity-40">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="deine@email.de"
                        required
                        className="flex-1 px-3 py-3 outline-none bg-transparent text-sm font-medium"
                      />
                    </div>
                    {status === 'error' && (
                      <p className="text-[11px] text-tomato font-bold uppercase">{errorMsg}</p>
                    )}
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full bg-ink text-white py-4 font-black uppercase shadow-brutalist hover:bg-tomato transition-all disabled:opacity-50"
                    >
                      {status === 'loading' ? 'Wird gesendet...' : 'Code erhalten →'}
                    </button>
                  </form>
                  <button onClick={handleClose} className="w-full text-center text-[10px] uppercase font-bold opacity-40 hover:opacity-70 mt-3 transition-all">
                    Nein danke
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
