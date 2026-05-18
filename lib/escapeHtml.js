const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, c => MAP[c]);
}
