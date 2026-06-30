import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/default/table';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  emptyMessage?: React.ReactNode;
  rowKey?: (item: T) => string | number;
}

export function DataTable<T>({ data, columns, emptyMessage = 'No data found.', rowKey }: DataTableProps<T>) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.headerClassName}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={rowKey ? rowKey(item) : index} className="group transition-colors hover:bg-muted/50">
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.cellClassName}>
                    {col.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
