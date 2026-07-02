import { documentsControllerFindOne } from '@/services/client';
import type { DocumentResponseDto } from '@/services/client';
import DocumentDetail from '@/components/features/document-detail/DocumentDetail';
import { serverFetch } from '@/services/server-fetch';
import { PageContainer, PageHeader } from '@/components/ui';

export default async function DocumentDetailPage(props: {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const result = await serverFetch(async (client) => {
    const params = await props.params;
    const documentId = params.id as string | undefined;
    if (!documentId) return { document: null };
    const res = await documentsControllerFindOne({ client, path: { id: documentId }, throwOnError: true });
    return { document: res.data as DocumentResponseDto };
  });

  if (!result.success || !result.data.document) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined text-[48px] text-error">error</span>
      </div>
    );
  }

  const doc = result.data.document;
  const searchParams = await props.searchParams;
  const from = searchParams.from as string | undefined;

  const breadcrumbs = from === 'dashboard'
    ? [
        { label: 'Dashboard', href: '/dashboard/learner' },
        { label: doc.title }
      ]
    : [
        { label: 'Documents', href: '/documents' },
        { label: doc.title }
      ];

  return (
    <PageContainer scrollable>
      <PageHeader
        title={""}
        breadcrumbs={breadcrumbs}
      />
      <DocumentDetail document={doc} />
    </PageContainer>
  );
}
