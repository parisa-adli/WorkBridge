import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CircleAlert } from "lucide-react";
import Skeleton from "./Skeleton";
import EmptyState from "./EmptyState";
import Empty from "./Empty";

type ListStateProps = {
  isLoading: boolean;
  isError: boolean;
  total: number;
  resourceName: string;
  children: ReactNode;
};

// A paged list's loading, error and empty states; the list itself (children) once it has rows.
function ListState({ isLoading, isError, total, resourceName, children }: ListStateProps) {
  const { t } = useTranslation();

  if (isLoading)
    return (
      <div role="status" aria-busy="true" aria-label={t("common.loading")} className="flex flex-col gap-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  // a failed background refetch keeps the rows already shown
  if (isError && !total)
    return (
      <EmptyState icon={<CircleAlert className="text-destructive" />} title={t("common.loadError")} />
    );
  if (!total) return <Empty resourceName={resourceName} />;
  return children;
}
export default ListState;
