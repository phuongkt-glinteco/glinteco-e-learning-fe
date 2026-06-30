import ReviewQueueClient from '@/components/features/reviews/ReviewQueueClient';
import { serverFetch } from '@/services/server-fetch';
import { submissionsControllerFindAll } from '@/services/api-client';
import type { SubmissionListResponseDto } from '@/services/api-client';

export default async function ReviewsPage() {
  const result = await serverFetch(async (client) => {
    const res = await submissionsControllerFindAll({
      client,
      query: { status: 'submitted', limit: 20 },
      throwOnError: true,
    });
    return res.data as SubmissionListResponseDto;
  });

  const initialData = result.success ? (result.data.data || []) : [];
  const initialNextCursor = result.success ? (result.data.nextCursor as unknown as string | null) : null;
  const initialHasMore = result.success ? result.data.hasMore : false;

  return (
    <ReviewQueueClient 
      initialData={initialData} 
      initialNextCursor={initialNextCursor} 
      initialHasMore={initialHasMore} 
    />
  );
}
