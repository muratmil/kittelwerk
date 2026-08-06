// Site listesi ve seçimi. Tek admin birden çok siteyi buradan yönetiyor.
// Erişim kuralı: owner ve site_access'i boş olan admin her siteyi görür;
// site_access doluysa yalnızca listedekiler. Aynı kural veritabanında da var
// (can_see_site), burası yalnızca arayüzü daraltıyor.

export function visibleSites(sites, profile) {
  if (!profile) return [];
  const access = profile.site_access ?? [];
  const gorunur = profile.is_owner || access.length === 0
    ? sites
    : sites.filter((s) => access.includes(s.id));

  // `links` sitenin kendi YÖNETİM ekranlarına gidiyor (Wipello'nun teklif ve
  // fiyat panelleri). Bayi/atölye onları menüde görmüyor; veriyi de sayfaya
  // hiç göndermeyelim — gösterilmeyen şey taşınmasın.
  const yonetim = profile.is_owner || profile.role === 'admin';
  return yonetim ? gorunur : gorunur.map(({ links, ...rest }) => rest);
}

export function pickSite(sites, profile, requested) {
  const allowed = visibleSites(sites, profile);
  const hit = allowed.find((s) => s.id === requested);
  return hit?.id ?? allowed[0]?.id ?? null;
}

export async function loadSites(client) {
  const { data } = await client
    .from('sites')
    .select('id, name, domain, currency, links, active, manages_pricing, allows_ordering')
    .eq('active', true)
    .order('sort_order');
  return data ?? [];
}
