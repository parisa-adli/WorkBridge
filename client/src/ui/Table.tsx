import type { ReactNode } from "react";
import { Table as ShadcnTable, TableBody, TableHeader, TableRow } from "@/components/ui/table";

type Props = { children: ReactNode };

// Rows keep plain <th>/<td>, so they get shadcn's TableHead/TableCell classes from here (text-start for RTL).
const CELLS =
  "tabular-nums [&_th]:h-10 [&_th]:px-2 [&_th]:text-start [&_th]:align-middle [&_th]:font-medium [&_th]:whitespace-nowrap [&_th]:text-foreground " +
  "[&_td]:p-2 [&_td]:align-middle [&_td]:whitespace-nowrap";

function Table({ children }: Props) {
  return <ShadcnTable className={CELLS}>{children}</ShadcnTable>;
}
export default Table;

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
