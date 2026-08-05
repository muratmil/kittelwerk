import RegistrierungForm from '@/components/portal/RegistrierungForm';

export const metadata = {
  title: 'Werkstatt registrieren — Kittelwerk',
  robots: { index: false, follow: false },
};

export default function WerkstattRegistrierung() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <a href="/" className="block font-serif font-black text-4xl italic uppercase tracking-tighter">
          Kittel<span className="text-tomato">werk</span>.
        </a>
        <RegistrierungForm art="werkstatt" />
      </div>
    </div>
  );
}
