import { AlertCircle, Inbox } from "lucide-react";

export interface AdminTableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
}

export function AdminDataTable<T extends { id: string }>({
  columns,
  rows,
  isLoading,
  isError,
  emptyLabel,
  onRetry,
  actions
}: {
  columns: AdminTableColumn<T>[];
  rows: T[] | undefined;
  isLoading: boolean;
  isError: boolean;
  emptyLabel: string;
  onRetry?: () => void;
  actions?: (row: T) => React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-md bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (isError || !rows) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <AlertCircle className="h-6 w-6 text-danger" aria-hidden="true" />
        <p className="text-sm text-text-secondary">Couldn&apos;t load this data.</p>
        {onRetry ? (
          <button type="button" onClick={onRetry} className="text-sm font-medium text-primary hover:underline">
            Retry
          </button>
        ) : null}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <Inbox className="h-6 w-6 text-text-secondary" aria-hidden="true" />
        <p className="text-sm text-text-secondary">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop/tablet: real table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Data table</caption>
          <thead>
            <tr className="border-b border-border text-xs text-text-secondary">
              {columns.map((col) => (
                <th key={col.key} scope="col" className="py-2 pr-4 font-medium">
                  {col.label}
                </th>
              ))}
              {actions ? (
                <th scope="col" className="py-2 pr-4 font-medium">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-none">
                {columns.map((col) => (
                  <td key={col.key} className="py-3 pr-4 text-text-primary">
                    {col.render(row)}
                  </td>
                ))}
                {actions ? <td className="py-3 pr-4">{actions(row)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="flex flex-col gap-3 sm:hidden">
        {rows.map((row) => (
          <li key={row.id} className="rounded-md border border-border p-3">
            <dl className="flex flex-col gap-1">
              {columns.map((col) => (
                <div key={col.key} className="flex items-center justify-between gap-2 text-sm">
                  <dt className="text-text-secondary">{col.label}</dt>
                  <dd className="text-right text-text-primary">{col.render(row)}</dd>
                </div>
              ))}
            </dl>
            {actions ? <div className="mt-2 flex justify-end gap-2">{actions(row)}</div> : null}
          </li>
        ))}
      </ul>
    </>
  );
}
