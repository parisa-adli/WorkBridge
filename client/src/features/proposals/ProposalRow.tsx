import { useTranslation } from "react-i18next";
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
  const owner = (proposal.project as { owner: UserRef } | null)?.owner;
  const user = proposal.user as UserRef | null;
  return (
    <Table.Row>
      <td>{index + 1}</td>
      <td>
        <span dir="auto">{truncateText(localized(proposal, "description"), 60)}</span>
      </td>
      <td>{owner && <span dir="auto">{localized(owner, "name")}</span>}</td>
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
