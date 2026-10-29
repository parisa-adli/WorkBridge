import type { ReactNode } from "react";

type Props = { children: ReactNode };

// Cells are styled from here so rows stay plain <td>/<th>; the wrapper scrolls on narrow screens.
const CELLS =
  "text-sm tabular-nums [&_:is(th,td)]:border-b [&_:is(th,td)]:border-border [&_tbody_tr:last-child_td]:border-b-0 " +
  "[&_th]:bg-surface-muted [&_th]:px-4 [&_th]:py-3 [&_th]:font-medium [&_th]:text-text-muted " +
  "[&_td]:px-4 [&_td]:py-3.5 [&_td]:text-text [&_tbody_tr:hover]:bg-surface-muted";

function Table({ children }: Props) {
  return (
    <div data-slot="table-container" className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table data-slot="table" className={CELLS}>
        {children}
      </table>
    </div>
  );
}
export default Table;

function TableHeader({ children }: Props) {
  return <thead data-slot="table-header">{children}</thead>;
}

function TableBody({ children }: Props) {
  return <tbody data-slot="table-body">{children}</tbody>;
}

function TableRow({ children }: Props) {
  return <tr data-slot="table-row">{children}</tr>;
}

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
