'use client';
import { useState, useEffect } from 'react';

const TARGET = new Date('2026-05-31T23:59:59');

function pad(n) { return String(n).padStart(2, '0'); }

export default function Urgency() {
  const [time, setTime] = useState({ days: '--', hours: '--', min: '--', sec: '--' });

  useEffect(() => {
    const tick = () => {
      const diff = TARGET - Date.now();
      if (diff <= 0) { setTime({ days: '00', hours: '00', min: '00', sec: '00' }); return; }
      setTime({
        days:  pad(Math.floor(diff / 86400000)),
        hours: pad(Math.floor((diff % 86400000) / 3600000)),
        min:   pad(Math.floor((diff % 3600000) / 60000)),
        sec:   pad(Math.floor((diff % 60000) / 1000)),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-tomato text-white py-6 border-t-4 border-ink border-b-4">
      <div className="container mx-auto px-6 flex flex-wrap items-center justify-center gap-6">
        <h3 className="font-serif font-black text-2xl">⚠ Neukundenangebot endet in:</h3>
        <div className="flex gap-3">
          {[{ v: time.days, l: 'Tage' }, { v: time.hours, l: 'Std' }, { v: time.min, l: 'Min' }, { v: time.sec, l: 'Sek' }].map(({ v, l }) => (
            <div key={l} className="bg-ink text-white px-4 py-2 min-w-[56px] text-center border-2 border-white">
              <div className="font-serif font-black text-2xl leading-none">{v}</div>
              <div className="text-[9px] uppercase tracking-widest mt-1 opacity-70">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
