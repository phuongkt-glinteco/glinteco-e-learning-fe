import { useLocale } from 'next-intl';
import { useSettingsStore } from '@/stores/settingsStore';

/**
 * Hàm tiện ích định dạng chuỗi ngày giờ theo timezone và locale.
 * Nếu không truyền timezone hay locale, hàm sẽ tự động lấy timezone từ SettingsStore
 * và locale từ thuộc tính lang của thẻ <html> (khi chạy ở Client).
 */
export function formatDateTimeByZone(
  utcIsoString: string | undefined | null,
  timeZone?: string,
  locale?: string
): string {
  if (!utcIsoString) return '';
  try {
    const date = new Date(utcIsoString);
    if (isNaN(date.getTime())) return utcIsoString;

    // Tự động lấy timezone từ Zustand store nếu không truyền vào
    const activeTimeZone = timeZone || useSettingsStore.getState().timezone || 'Asia/Ho_Chi_Minh';
    
    // Tự động lấy locale từ thẻ <html lang="..."> nếu ở trình duyệt client
    const activeLocale = locale || (typeof window !== 'undefined' ? document.documentElement.lang : 'vi-VN') || 'vi-VN';

    return new Intl.DateTimeFormat(activeLocale, {
      timeZone: activeTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return new Date(utcIsoString).toLocaleString(locale || 'vi-VN');
  }
}

/**
 * Custom Hook chuẩn dành cho các React Components (Client Components).
 * Tự động kết nối với useLocale() của next-intl và timezone của Zustand store.
 * 
 * @example
 * const { formatDateTime } = useTimezoneFormat();
 * return <span>{formatDateTime(item.createdAt)}</span>;
 */
export function useTimezoneFormat() {
  const locale = useLocale();
  const timezone = useSettingsStore((state) => state.timezone);

  return {
    /**
     * Định dạng chuỗi ISO UTC sang chuỗi ngày giờ theo đúng locale và timezone hiện tại
     */
    formatDateTime: (isoString: string | undefined | null) =>
      formatDateTimeByZone(isoString, timezone, locale),
    locale,
    timezone,
  };
}
