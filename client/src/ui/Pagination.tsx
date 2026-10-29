import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toPersianNumbers } from "../utils/toPersianNumber";
import { buttonClass } from "./Button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const iconButton = buttonClass({ variant: "ghost", size: "icon" });

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
  const { t } = useTranslation();

  return (
    <nav aria-label={t("pagination.label")}>
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          <button
            type="button"
            aria-label={t("pagination.previous")}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={iconButton}
          >
            <ChevronRight aria-hidden="true" className="size-5 ltr:-scale-x-100" />
          </button>
        </li>
        {pageItems(page, totalPages).map((item, i) => (
          <li key={i}>
            {item === "…" ? (
              <span aria-hidden="true" className="px-2 text-text-muted">
                {item}
              </span>
            ) : (
              <button
                type="button"
                aria-current={item === page ? "page" : undefined}
                onClick={() => onPageChange(item)}
                className={buttonClass({ variant: item === page ? "primary" : "ghost", size: "sm" })}
              >
                {toPersianNumbers(item)}
              </button>
            )}
          </li>
        ))}
        <li>
          <button
            type="button"
            aria-label={t("pagination.next")}
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={iconButton}
          >
            <ChevronLeft aria-hidden="true" className="size-5 ltr:-scale-x-100" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
export default Pagination;
