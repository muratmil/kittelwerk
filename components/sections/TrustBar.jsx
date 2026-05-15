export default function TrustBar() {
  const items = [
    { num: '24/1', lbl: 'Supreme Baumwolle' },
    { num: '5', lbl: 'Produkte' },
    { num: '10+', lbl: 'Stück Mindestmenge' },
    { num: '1–4W', lbl: 'Lieferzeit' },
    { num: 'GRATIS', lbl: 'Logo-Druck' },
    { num: 'ab 9,90€', lbl: 'Versandkosten' },
  ];
  return (
    <div className="bg-ink text-white py-5 border-b-4 border-sun">
      <div className="container mx-auto px-6 grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
        {items.map((item) => (
          <div key={item.lbl}>
            <div className="font-serif font-black text-2xl text-sun leading-none">{item.num}</div>
            <div className="text-[9px] uppercase tracking-widest mt-1 opacity-70">{item.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
