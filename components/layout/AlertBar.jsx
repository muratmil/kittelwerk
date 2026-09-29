'use client';
import { useSprache } from '@/components/i18n/SpracheProvider';

export default function AlertBar() {
  const { t } = useSprache();
  return (
    <div className="bg-ink text-white py-2 border-b-2 border-tomato overflow-hidden whitespace-nowrap">
      <div className="flex animate-marquee gap-10 font-black text-[10px] uppercase tracking-[0.2em]">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2 h-2 bg-tomato rounded-full" />
            {t.alert.angebot}
            <span className="w-2 h-2 bg-sun rounded-full" />
            {t.alert.druck}
            <span className="w-2 h-2 bg-tomato rounded-full" />
            {t.alert.preis}
          </span>
        ))}
      </div>
    </div>
  );
}
