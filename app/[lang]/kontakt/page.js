import KontaktClient from './KontaktClient';
import { woerterbuch } from '@/lib/i18n';
import { alternates } from '@/lib/i18n/config';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const m = woerterbuch(lang).kontakt.meta;
  const alt = alternates(lang, '/kontakt');
  return {
    title: m.title,
    description: m.description,
    alternates: alt,
    openGraph: { title: m.ogTitle, description: m.ogDescription, url: alt.canonical },
  };
}

export default function KontaktPage() {
  return <KontaktClient />;
}
