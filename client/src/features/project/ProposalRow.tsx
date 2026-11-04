import { useTranslation } from "react-i18next";
import { useState } from "react";
import Table from "../../ui/Table";
import { toPersianNumbersWithComma } from "../../utils/toPersianNumber";
import truncateText from "../../utils/truncateText";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { ListChecks } from "lucide-react";
import ChangeProposalStatus from "./ChangeProposalStatus";
import StatusBadge from "../../ui/StatusBadge";
import type { Proposal, UserRef } from "../../types/api";
import localized from "../../utils/localized";

function ProposalRow({ proposal, index }: { proposal: Proposal; index: number }) {
  const { t } = useTranslation();
  const { status } = proposal;
  const [open, setOpen] = useState(false);

  return (
    <Table.Row>
      <td>{index + 1}</td>
      {/* a single project populates its proposals' users */}
      <td>
        <span dir="auto">{localized(proposal.user as UserRef, "name")}</span>
      </td>
      <td>
        <p dir="auto">{truncateText(localized(proposal, "description"), 50)}</p>
      </td>
      <td>{t("proposal.days", { days: proposal.duration })}</td>
      <td>{toPersianNumbersWithComma(proposal.price)}</td>
      <td>
        <StatusBadge status={status} />
      </td>
      <td>
        <Modal
          title={t("proposal.changeStatus")}
          open={open}
          onClose={() => setOpen(false)}
        >
          <ChangeProposalStatus
            proposalId={proposal._id}
            proposalStatus={proposal.status}
            onClose={() => setOpen(false)}
          />
        </Modal>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label={t("proposal.changeStatus")}>
          <ListChecks />
        </Button>
      </td>
    </Table.Row>
  );
}
export default ProposalRow;
