export interface TrackIconOption {
  value: string;
  label: string;
  lucide: string;
}

export const TRACK_ICONS: TrackIconOption[] = [
  { value: 'code', label: 'Lập trình', lucide: 'code' },
  { value: 'terminal', label: 'Terminal', lucide: 'terminal' },
  { value: 'menu_book', label: 'Sách', lucide: 'book-open' },
  { value: 'web', label: 'Frontend', lucide: 'globe' },
  { value: 'dns', label: 'Backend', lucide: 'server' },
  { value: 'database', label: 'Cơ sở dữ liệu', lucide: 'database' },
  { value: 'api', label: 'API', lucide: 'webhook' },
  { value: 'route', label: 'Lộ trình', lucide: 'signpost' },
  { value: 'flag', label: 'Mục tiêu', lucide: 'flag' },
  { value: 'map', label: 'Hướng dẫn', lucide: 'map' },
  { value: 'description', label: 'Tài liệu', lucide: 'file-text' },
  { value: 'shield', label: 'Bảo mật', lucide: 'shield' },
  { value: 'account_tree', label: 'Kiến trúc', lucide: 'git-branch' },
  { value: 'commit', label: 'Git', lucide: 'git-commit' },
  { value: 'lock', label: 'Khóa', lucide: 'lock' },
  { value: 'puzzle', label: 'Xếp hình', lucide: 'puzzle' },
];

export function getTrackIconByValue(value: string): TrackIconOption | undefined {
  return TRACK_ICONS.find((icon) => icon.value === value);
}

export function getTrackIconLucide(value: string): string {
  return getTrackIconByValue(value)?.lucide ?? 'terminal';
}
