'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Ungültige E-Mail oder falsches Passwort.');
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="font-serif font-black text-4xl italic uppercase">
          Kittel<span className="text-tomato">werk</span>.
        </h1>
        <form onSubmit={handleLogin} className="bg-white border-4 border-ink shadow-brutalist p-8 space-y-4">
          <h2 className="font-black text-xl uppercase border-b-2 border-ink pb-3">Admin Login</h2>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest">E-Mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoFocus
              className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest">Passwort</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required
              className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm" />
          </div>
          {error && <p className="text-[11px] text-tomato font-bold uppercase">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-ink text-white py-4 font-black uppercase flex items-center justify-center gap-3 hover:bg-tomato transition-all shadow-brutalist disabled:opacity-50">
            <LogIn size={16} />
            {loading ? 'Wird eingeloggt...' : 'Einloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}
