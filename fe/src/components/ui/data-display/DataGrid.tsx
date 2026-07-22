import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DataGridProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: React.ReactNode;
  className?: string;
}

export function DataGrid<T>({ data, renderItem, emptyMessage = 'No data found.', className }: DataGridProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
      {data.map((item, index) => (
        <React.Fragment key={index}>
          {renderItem(item)}
        </React.Fragment>
      ))}
    </div>
  );
}
