export default function AlertBar() {
  return (
    <div className="bg-ink text-white py-2 border-b-2 border-tomato overflow-hidden whitespace-nowrap">
      <div className="flex animate-marquee gap-10 font-black text-[10px] uppercase tracking-[0.2em]">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 bg-tomato rounded-full" />
            NEUERÖFFNUNGS-DEALS AKTIV: Nur für kurze Zeit!
            <span className="w-2 h-2 bg-tomato rounded-full" />
            Direkt zu Türkei-Preisen
          </span>
        ))}
      </div>
    </div>
  );
}
