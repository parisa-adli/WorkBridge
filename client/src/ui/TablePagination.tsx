import { useSearchParams } from "react-router-dom";
import Pagination from "./Pagination";

type TablePaginationProps = { page: number; total: number; limit: number };

// Pagination for a paged list, with the page in the URL like the filters.
function TablePagination({ page, total, limit }: TablePaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const totalPages = Math.ceil(total / limit);
  // still shown past the end (e.g. after deleting a page's last row) so the user can step back
  if (totalPages <= 1 && page <= 1) return null;

  function handlePageChange(next: number) {
    searchParams.set("page", String(next));
    setSearchParams(searchParams);
  }

  return (
    <div className="mt-4 flex justify-center">
      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
}
export default TablePagination;
