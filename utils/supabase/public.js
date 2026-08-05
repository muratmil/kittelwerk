import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Çerez okumayan istemci. Vitrin sayfaları bunu kullanıyor: oturuma bakmadığı
// için sayfalar dinamiğe düşmüyor, ISR ile önbelleklenebiliyorlar.
// Yalnızca herkese açık veriler (products, product_prices) için.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
