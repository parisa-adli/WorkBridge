import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Table from "../../ui/Table";
import {
  toPersianNumbers,
  toPersianNumbersWithComma,
} from "../../utils/toPersianNumber";
import truncateText from "../../utils/truncateText";
import StatusBadge from "../../ui/StatusBadge";
import type { Proposal, UserRef } from "../../types/api";
import localized from "../../utils/localized";

function ProposalRow({
  proposal,
  index,
  isAdmin,
}: {
  proposal: Proposal;
  index: number;
  isAdmin: boolean;
}) {
  const { t } = useTranslation();
  const { duration, price, status } = proposal;
  // the list populates the project; null once the project is deleted
  const project = proposal.project as Exclude<Proposal["project"], string> | null;
  const user = proposal.user as UserRef | null;
  return (
    <Table.Row>
      <td>{index + 1}</td>
      <td>
        {project && (
          <Link
            to={`/${isAdmin ? "admin" : "freelancer"}/projects/${project._id}`}
            className="text-primary hover:underline"
            dir="auto"
          >
            {truncateText(localized(project, "title"), 30)}
          </Link>
        )}
      </td>
      <td>
        <span dir="auto">{truncateText(localized(proposal, "description"), 60)}</span>
      </td>
      <td>{project && <span dir="auto">{localized(project.owner, "name")}</span>}</td>
      {isAdmin && <td>{user && <span dir="auto">{localized(user, "name")}</span>}</td>}
      <td>{t("proposal.days", { days: toPersianNumbers(duration) })}</td>
      <td>{toPersianNumbersWithComma(price)}</td>
      <td>
        <StatusBadge status={status} />
      </td>
    </Table.Row>
  );
}
export default ProposalRow;
