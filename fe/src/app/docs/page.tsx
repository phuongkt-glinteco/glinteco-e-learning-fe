import { redirect } from 'next/navigation';

export default function DocsPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  redirect(`${apiBaseUrl}/docs`);
}
