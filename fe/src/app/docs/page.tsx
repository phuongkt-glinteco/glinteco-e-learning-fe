import { redirect } from 'next/navigation';
import { getConfiguredApiBaseUrl } from '@/services/api-base';

export default function DocsPage() {
  redirect(`${getConfiguredApiBaseUrl()}/docs`);
}
