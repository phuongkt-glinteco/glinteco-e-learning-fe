import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  let locale = cookieStore.get('NEXT_LOCALE')?.value || 'vi';
  
  // Guard against unsupported locales
  if (locale !== 'vi' && locale !== 'en') {
    locale = 'vi';
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
