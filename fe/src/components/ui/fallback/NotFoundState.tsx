import Link from 'next/link';
import { Button } from '@/components/ui/default/button';

interface NotFoundStateProps {
  title?: string;
  description?: string;
  href?: string;
  actionLabel?: string;
}

export function NotFoundState({
  title = 'Page not found',
  description = 'This route does not exist or is no longer available.',
  href = '/',
  actionLabel = 'Go home',
}: NotFoundStateProps) {
  return (
    <main className="flex min-h-[60vh] w-full items-center justify-center px-4 py-12">
      <section className="w-full max-w-xl rounded-xl border bg-card p-6 text-center shadow-sm md:p-8">
        <span className="material-symbols-outlined mb-4 text-[52px] text-muted-foreground">
          travel_explore
        </span>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground break-words">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground break-words">
          {description}
        </p>
        <Button asChild className="mt-6">
          <Link href={href}>{actionLabel}</Link>
        </Button>
      </section>
    </main>
  );
}
