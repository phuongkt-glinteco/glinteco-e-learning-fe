import { documentsControllerFindOne } from '@/services/client';
import type { DocumentResponseDto } from '@/services/client';
import { serverFetch } from '@/services/server-fetch';
import DocumentEdit from '@/components/features/document-edit/DocumentEdit';

export default async function AdminDocumentEditPage({ params }: { params: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const result = await serverFetch(async (client) => {
    const { id } = await params;
    const documentId = id as string | undefined;
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

  return <DocumentEdit document={result.data.document} />;
}
