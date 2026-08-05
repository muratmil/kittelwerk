'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { homeFor, canEnter } from '@/lib/portal';
import { LogIn } from 'lucide-react';

// Dört ayrı giriş sayfası yerine tek kapı. Kullanıcı hangi rolde olduğunu
// bilmek zorunda değil — girişten sonra kendi alanına yönlendiriliyor.
export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError('Ungültige E-Mail oder falsches Passwort.');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single();

    const role = profile?.role ?? null;
    if (!role) {
      setError('Diesem Konto ist keine Rolle zugewiesen. Bitte wenden Sie sich an die Verwaltung.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    // Nereden geldiyse oraya, ama yalnızca girmeye hakkı varsa.
    const target = next && canEnter(role, next) ? next : homeFor(role);
    router.push(target);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <a href="/" className="block font-serif font-black text-4xl italic uppercase tracking-tighter">
          Kittel<span className="text-tomato">werk</span>.
        </a>

        <form onSubmit={handleLogin} className="bg-white border-4 border-ink shadow-brutalist p-8 space-y-4">
          <div className="border-b-2 border-ink pb-3">
            <h1 className="font-black text-xl uppercase">Portal</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mt-1">
              Händler · Vertrieb · Werkstatt · Verwaltung
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest">E-Mail</label>
            <input id="email" name="email" type="email" autoComplete="username"
              value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus
              className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest">Passwort</label>
            <input id="password" name="password" type="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)} required
              className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm" />
          </div>

          {error && <p className="text-[11px] text-tomato font-bold uppercase leading-snug">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-ink text-white py-4 font-black uppercase flex items-center justify-center gap-3 hover:bg-tomato transition-all shadow-brutalist disabled:opacity-50">
            <LogIn size={16} />
            {loading ? 'Anmeldung läuft…' : 'Anmelden'}
          </button>

          <p className="text-[11px] text-center pt-1">
            <a href="/haendler/registrierung" className="font-bold underline hover:text-tomato">
              Händler werden
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
