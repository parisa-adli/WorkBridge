import { STATUS_BADGES, UNKNOWN_STATUS } from "../constants";

type Badges = Readonly<Record<string, { label: string; className: string }>>;

// status is any key, not only the badge set's: an unknown value falls back to UNKNOWN_STATUS
function StatusBadge({ status, badges = STATUS_BADGES }: { status: string | number; badges?: Badges }) {
  const badge = badges[status] ?? UNKNOWN_STATUS;
  return <span className={`badge ${badge.className}`}>{badge.label}</span>;
}
export default StatusBadge;
