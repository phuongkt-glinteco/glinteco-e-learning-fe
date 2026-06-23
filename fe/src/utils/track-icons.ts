const TRACK_ICON_ALIASES: Record<string, string> = {
  checkbox: 'check_box',
  'device-laptop': 'laptop_mac',
  laptop: 'laptop_mac',
  layout: 'view_quilt',
  server: 'dns',
  shield: 'verified_user',
  sitemap: 'account_tree',
  site: 'account_tree',
};

const SAFE_TRACK_ICONS = new Set([
  'account_tree',
  'check_box',
  'code',
  'dns',
  'flag',
  'laptop_mac',
  'route',
  'verified_user',
  'view_quilt',
]);

export function normalizeTrackIcon(icon: string | undefined) {
  const normalizedIcon = icon?.replace(/^pixelarticons:/, '').trim().toLowerCase();

  if (!normalizedIcon) return undefined;

  const iconName = TRACK_ICON_ALIASES[normalizedIcon] ?? normalizedIcon;

  return SAFE_TRACK_ICONS.has(iconName) ? iconName : 'route';
}
