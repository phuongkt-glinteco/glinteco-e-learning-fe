import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-5 mb-8", className)} {...props}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground overflow-hidden">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <div key={index} className="flex items-center overflow-hidden">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-[150px] md:max-w-[200px]"
                    title={item.label}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="text-foreground font-medium truncate max-w-[150px] sm:max-w-[200px] md:max-w-[300px]"
                    title={item.label}
                  >
                    {item.label}
                  </span>
                )}
                {!isLast && (
                  <ChevronRightIcon className="w-4 h-4 mx-1.5 shrink-0 opacity-50" />
                )}
              </div>
            );
          })}
        </nav>
      )}
      {title !== "" && (
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-lg text-muted-foreground mt-2 font-medium">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3 shrink-0">{actions}</div>
          )}
        </div>
      )}
    </div>
  );
}
