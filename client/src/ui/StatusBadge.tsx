import type { VariantProps } from "class-variance-authority";
import { useTranslation } from "react-i18next";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { STATUS_BADGES, UNKNOWN_STATUS } from "../constants";

type Badges = Readonly<Record<string, { label: string; variant: VariantProps<typeof badgeVariants>["variant"] }>>;

// status is any key, not only the badge set's: an unknown value falls back to UNKNOWN_STATUS
function StatusBadge({ status, badges = STATUS_BADGES }: { status: string | number; badges?: Badges }) {
  const { t } = useTranslation();
  const badge = badges[status] ?? UNKNOWN_STATUS;
  return <Badge variant={badge.variant}>{t(badge.label)}</Badge>;
}
export default StatusBadge;
