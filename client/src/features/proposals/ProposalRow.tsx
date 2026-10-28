import { useTranslation } from "react-i18next";
import Table from "../../ui/Table";
import {
  toPersianNumbers,
  toPersianNumbersWithComma,
} from "../../utils/toPersianNumber";
import truncateText from "../../utils/truncateText";
import StatusBadge from "../../ui/StatusBadge";
import type { Proposal, UserRef } from "../../types/api";

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
  const { description, duration, price, status } = proposal;
  return (
    <Table.Row>
      <td>{index + 1}</td>
      <td>{truncateText(description, 60)}</td>
      <td>{(proposal.project as { owner: UserRef } | null)?.owner?.name}</td>
      {isAdmin && <td>{(proposal.user as UserRef | null)?.name}</td>}
      <td>{t("proposal.days", { days: toPersianNumbers(duration) })}</td>
      <td>{toPersianNumbersWithComma(price)}</td>
      <td>
        <StatusBadge status={status} />
      </td>
    </Table.Row>
  );
}
export default ProposalRow;
