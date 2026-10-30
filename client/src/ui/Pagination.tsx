import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toPersianNumbers } from "../utils/toPersianNumber";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

// First, last and the current page's neighbours; a gap of one page shows that page instead of "…".
function pageItems(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const shown = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  return shown.flatMap((p, i) => {
    const gap = p - (shown[i - 1] ?? p - 1);
    if (gap === 2) return [p - 1, p];
    return gap > 2 ? (["…", p] as const) : [p];
  });
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <PaginationRoot>
      <PaginationContent className="flex-wrap">
        <PaginationItem>
          <PaginationPrevious disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
        </PaginationItem>
        {pageItems(page, totalPages).map((item, i) => (
          <PaginationItem key={i}>
            {item === "…" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink isActive={item === page} onClick={() => onPageChange(item)}>
                {toPersianNumbers(item)}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
}
export default Pagination;
