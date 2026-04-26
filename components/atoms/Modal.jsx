import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, children, title }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-ink/90 backdrop-blur-md" />

          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-paper border-4 border-ink w-full max-w-2xl shadow-brutalist-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif font-black text-2xl uppercase italic">{title}</h3>
              <button onClick={onClose} className="border-2 border-ink p-1 hover:bg-tomato hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-auto max-h-[70vh]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
