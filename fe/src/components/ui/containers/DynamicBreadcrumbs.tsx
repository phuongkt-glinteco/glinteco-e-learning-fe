'use client';

import { useBreadcrumbStore } from '@/stores/breadcrumbStore';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/default/breadcrumb';
import { useRouter, usePathname } from 'next/navigation';
import { Fragment, useEffect } from 'react';

function normalizePath(p: string) {
  return p.split('?')[0].replace(/\/$/, '') || '/';
}

export function DynamicBreadcrumbs() {
  const { tree, setTree } = useBreadcrumbStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (tree.length > 1) {
      const normPath = normalizePath(pathname);
      const index = tree.findIndex((n) => normalizePath(n.href) === normPath);
      if (index !== -1 && index < tree.length - 1) {
        setTree(tree.slice(0, index + 1));
      }
    }
  }, [pathname, tree, setTree]);

  if (tree.length <= 1) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {tree.map((node, index) => {
          const isLast = index === tree.length - 1;
          return (
            <Fragment key={node.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="max-w-[300px] truncate" title={node.label}>
                    {node.label.length > 25 ? `${node.label.slice(0, 25)}...` : node.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="cursor-pointer max-w-[200px] truncate hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      setTree(tree.slice(0, index + 1));
                      router.push(node.href);
                    }}
                    title={node.label}
                  >
                    {node.label.length > 25 ? `${node.label.slice(0, 25)}...` : node.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
