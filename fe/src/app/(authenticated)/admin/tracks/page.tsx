import Link from 'next/link';
import { AppButton } from '@/components/ui/buttons';

export default function TracksPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tracks</h1>
        <Link href="/admin/tracks/create">
          <AppButton icon="lucide:plus">Create Track</AppButton>
        </Link>
      </div>
      <p className="text-secondary">Track list coming soon.</p>
    </div>
  );
}
