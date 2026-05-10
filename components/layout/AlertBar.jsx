export default function AlertBar() {
  return (
    <div className="bg-ink text-white py-2 border-b-2 border-tomato overflow-hidden whitespace-nowrap">
      <div className="flex animate-marquee gap-10 font-black text-[10px] uppercase tracking-[0.2em]">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2 h-2 bg-tomato rounded-full" />
            Neukundenangebot: Stark Reduziert
            <span className="w-2 h-2 bg-sun rounded-full" />
            Vorder- & Rückendruck kostenlos
            <span className="w-2 h-2 bg-tomato rounded-full" />
            Unschlagbar im Preis-Leistungs-Verhältnis · Mindestbestellung 10 Stück
          </span>
        ))}
      </div>
    </div>
  );
}
