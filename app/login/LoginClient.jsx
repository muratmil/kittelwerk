'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { homeFor, canEnter, PORTAL_NAME, PORTAL_SHORT } from '@/lib/portal';
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
    <div className="min-h-screen bg-cch-ash flex items-center justify-center p-6 text-cch-slate selection:bg-cch-soft selection:text-cch-dark">
      <div className="w-full max-w-sm">
        {/* Marka değil kimlik: portalın adı burada, dükkânın logosu değil. */}
        <div className="text-center mb-7">
          <p className="text-3xl font-light tracking-[0.4em] uppercase text-cch-slate pl-[0.4em]">
            {PORTAL_SHORT}
          </p>
          <p className="text-[10px] font-light tracking-[0.28em] uppercase text-cch-muted mt-2">
            {PORTAL_NAME}
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-sm shadow-cch-lg overflow-hidden">
          <div className="bg-cch-mint px-8 py-4">
            <h1 className="text-[11px] font-medium uppercase tracking-[0.24em] text-white">
              Anmelden
            </h1>
          </div>

          <div className="p-8 space-y-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[10px] font-medium uppercase tracking-[0.18em] text-cch-muted">
                E-Mail
              </label>
              <input id="email" name="email" type="email" autoComplete="username"
                value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus
                className="border-b border-cch-line py-2 text-sm outline-none transition-colors focus:border-cch-mint placeholder:text-cch-muted" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[10px] font-medium uppercase tracking-[0.18em] text-cch-muted">
                Passwort
              </label>
              <input id="password" name="password" type="password" autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)} required
                className="border-b border-cch-line py-2 text-sm outline-none transition-colors focus:border-cch-mint" />
            </div>

            {error && (
              <p className="text-[11px] text-cch-danger leading-snug border-l-2 border-cch-danger pl-3">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-cch-mint text-white py-3.5 rounded-sm text-[11px] font-medium uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 hover:bg-cch-dark transition-colors disabled:opacity-50">
              <LogIn size={15} />
              {loading ? 'Anmeldung läuft…' : 'Anmelden'}
            </button>

            <p className="text-[11px] text-center text-cch-muted pt-1">
              <a href="/haendler/registrierung" className="hover:text-cch-dark transition-colors">
                Händler werden
              </a>
            </p>
          </div>
        </form>

        <p className="text-center mt-6">
          <a href="/" className="text-[10px] uppercase tracking-[0.18em] text-cch-muted hover:text-cch-dark transition-colors">
            ← kittelwerk.de
          </a>
        </p>
      </div>
    </div>
  );
}
