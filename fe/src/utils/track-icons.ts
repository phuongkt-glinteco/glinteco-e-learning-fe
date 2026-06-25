const TRACK_ICON_ALIASES: Record<string, string> = {
  api: 'api',
  architecture: 'account_tree',
  backend: 'dns',
  book: 'menu_book',
  code: 'code',
  coding: 'code',
  database: 'database',
  docs: 'description',
  document: 'description',
  flag: 'flag',
  frontend: 'web',
  github: 'commit',
  guide: 'map',
  lock: 'lock',
  roadmap: 'route',
  security: 'shield',
  server: 'dns',
  service: 'dns',
  shield: 'shield',
  sitemap: 'account_tree',
  start: 'flag',
  track: 'route',
};

export function normalizeTrackIcon(icon: string | null | undefined) {
  const key = icon?.trim().toLowerCase();
  if (!key) return 'route';

  return TRACK_ICON_ALIASES[key] ?? key.replace(/[\s-]+/g, '_');
}
