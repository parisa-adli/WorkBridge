import { STATUS_BADGES, UNKNOWN_STATUS } from "../constants";

function StatusBadge({ status, badges = STATUS_BADGES }) {
  const badge = badges[status] ?? UNKNOWN_STATUS;
  return <span className={`badge ${badge.className}`}>{badge.label}</span>;
}
export default StatusBadge;
