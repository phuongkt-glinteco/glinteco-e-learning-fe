'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/default/card';
import { Button } from '@/components/ui/default/button';

interface QuickLink {
  label: string;
  href: string;
  icon?: string;
}

interface QuickLinksCardProps {
  title: string;
  icon: string;
  links: QuickLink[];
}

export default function QuickLinksCard({ title, icon, links }: QuickLinksCardProps) {
  return (
    <Card className="h-full border-outline-variant shadow-sm flex flex-col">
      <CardHeader className="pb-3 border-b border-outline-variant/30 px-5">
        <CardTitle className="flex items-center gap-2 text-primary text-base font-semibold">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 grid grid-cols-1 gap-3">
        {links.map((link) => (
          <Link key={link.label} href={link.href} className="outline-none block w-full">
            <Button variant="outline" className="w-full justify-between h-auto py-3 px-4 border-outline-variant hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm font-medium">
              <span>{link.label}</span>
              <span className="material-symbols-outlined text-[18px]">
                {link.icon || 'chevron_right'}
              </span>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
