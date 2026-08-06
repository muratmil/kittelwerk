import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getProfile } from '@/lib/session';
import { loadCatalog } from '@/lib/catalog';
import { loadSites, visibleSites, pickSite } from '@/lib/sites';
import PortalShell from '@/components/portal/PortalShell';
import HaendlerClient from './HaendlerClient';

export const metadata = {
  title: 'Händler — Kittelwerk Portal',
  robots: { index: false, follow: false },
};

export default async function HaendlerPage({ searchParams }) {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  const supabase = await createClient();
  const sp = await searchParams;
  const alleSites = visibleSites(await loadSites(supabase), profile);
  const siteId = pickSite(alleSites, profile, sp?.site);

  // Bayi kaydı — RLS yalnızca kendi satırını veriyor.
  const { data: haendler } = profile.role === 'haendler'
    ? await supabase.from('haendler')
        .select('id, company, contact_name, street, plz, city, discount_rate, custom_prices, active')
        .eq('profile_id', profile.id).maybeSingle()
    : { data: null };

  // Fiyatlar bayinin koşullarıyla hesaplanıyor; admin/owner liste fiyatını görür.
  const { products } = await loadCatalog(supabase, { haendler, siteId });

  const bestellbar = products
    .filter((p) => !p.comingSoon && p.tiers?.length)
    .map((p) => ({
      id: p.id, name: p.name, category: p.category, minQty: p.minQty,
      colors: p.colors ?? [], hasSizes: p.hasSizes ?? false, sizes: p.sizes ?? null,
      hasBackPrint: p.hasBackPrint ?? false, bestickungOnly: p.bestickungOnly ?? false,
      freeSiebdruck: p.freeSiebdruck ?? false,
      tiers: p.tiers, image: p.image ?? null,
    }));

  return (
    <PortalShell profile={profile} current="/haendler" title="Händler"
      sites={alleSites} activeSite={siteId}>
      <HaendlerClient profile={profile} haendler={haendler} products={bestellbar} />
    </PortalShell>
  );
}
