// Site listesi ve seçimi. Tek admin birden çok siteyi buradan yönetiyor.
// Erişim kuralı: owner ve site_access'i boş olan admin her siteyi görür;
// site_access doluysa yalnızca listedekiler. Aynı kural veritabanında da var
// (can_see_site), burası yalnızca arayüzü daraltıyor.

export function visibleSites(sites, profile) {
  if (!profile) return [];
  const access = profile.site_access ?? [];
  if (profile.is_owner || access.length === 0) return sites;
  return sites.filter((s) => access.includes(s.id));
}

export function pickSite(sites, profile, requested) {
  const allowed = visibleSites(sites, profile);
  const hit = allowed.find((s) => s.id === requested);
  return hit?.id ?? allowed[0]?.id ?? null;
}

export async function loadSites(client) {
  const { data } = await client
    .from('sites')
    .select('id, name, domain, currency, admin_url, active')
    .eq('active', true)
    .order('sort_order');
  return data ?? [];
}
