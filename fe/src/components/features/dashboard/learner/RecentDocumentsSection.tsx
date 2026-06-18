interface RecentDoc {
  title: string;
  tags: string[];
  icon?: string;
  viewedAt?: string;
}

interface RecentDocumentsSectionProps {
  docs: RecentDoc[];
}

function DocCard({ title, tags, icon = 'description', viewedAt }: RecentDoc) {
  return (
    <div className="group flex flex-col gap-4 p-lg rounded-xl bg-white border border-outline-variant hover:border-primary hover:bg-primary-container/5 transition-all cursor-pointer h-full shadow-sm">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 bg-surface-container rounded flex items-center justify-center group-hover:bg-primary-container/10 transition-colors">
          <span className="material-symbols-outlined text-primary text-[28px]">{icon}</span>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
          open_in_new
        </span>
      </div>
      <div>
        <h4 className="font-headline-sm text-headline-sm mb-2 group-hover:text-primary transition-colors">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[11px] font-bold uppercase rounded border border-outline-variant"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      {viewedAt && (
        <div className="mt-auto pt-4 border-t border-outline-variant flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">history</span>
          <span className="font-label-sm text-label-sm">Viewed {viewedAt}</span>
        </div>
      )}
    </div>
  );
}

export default function RecentDocumentsSection({ docs }: RecentDocumentsSectionProps) {
  if (docs.length === 0) return null;

  return (
    <section>
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Recent Documents</h3>
      <div className={docs.length === 1 ? '' : 'grid grid-cols-1 md:grid-cols-2 gap-lg'}>
        {docs.map((doc) => (
          <DocCard key={doc.title} {...doc} />
        ))}
      </div>
    </section>
  );
}
