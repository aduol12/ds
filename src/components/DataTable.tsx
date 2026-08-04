import React, { ReactNode } from 'react';

interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: keyof T) => void;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onRowClick,
  sortBy,
  sortOrder = 'asc',
  onSort,
  className = '',
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-6 py-3 font-semibold text-slate-700 dark:text-slate-300 ${
                  column.width ? column.width : ''
                }`}
              >
                {column.sortable ? (
                  <button
                    onClick={() => onSort?.(column.key as keyof T)}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                  >
                    {column.label}
                    {sortBy === column.key && (
                      <span className="text-xs">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center">
                <div className="inline-block animate-spin">⌛</div> Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={`
                  border-b border-slate-200 dark:border-slate-700
                  ${onRowClick ? 'hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer' : ''}
                  transition-colors
                `}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-6 py-4 text-slate-900 dark:text-slate-100"
                  >
                    {column.render
                      ? column.render(row[column.key as keyof T], row)
                      : row[column.key as keyof T]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
