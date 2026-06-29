import { serverFetch } from '@/services/server-fetch';
import { tracksControllerFindAll } from '@/services/client';
import type { TrackListResponseDto } from '@/services/client';
import { TrackReorderPage } from '@/components/features/tracks/reorder';

export default async function ReorderPage() {
  const result = await serverFetch(async (client) => {
    const res = await tracksControllerFindAll({ client, query: { page: 1, limit: 100 }, throwOnError: true });
    const data = res.data as TrackListResponseDto;
    return data.data.sort((a, b) => a.order - b.order);
  });

  if (!result.success) {
    return <TrackReorderPage />;
  }

  return <TrackReorderPage initialTracks={result.data} />;
}
