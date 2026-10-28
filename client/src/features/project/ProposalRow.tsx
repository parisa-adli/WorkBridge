import { useState } from "react";
import Table from "../../ui/Table";
import { toPersianNumbersWithComma } from "../../utils/toPersianNumber";
import truncateText from "../../utils/truncateText";
import Modal from "../../ui/Modal";
import { TbChecklist } from "react-icons/tb";
import ChangeProposalStatus from "./ChangeProposalStatus";
import StatusBadge from "../../ui/StatusBadge";
import type { Proposal, UserRef } from "../../types/api";

function ProposalRow({ proposal, index }: { proposal: Proposal; index: number }) {
  const { status } = proposal;
  const [open, setOpen] = useState(false);

  return (
    <Table.Row>
      <td>{index + 1}</td>
      {/* a single project populates its proposals' users */}
      <td>{(proposal.user as UserRef).name}</td>
      <td>
        <p>{truncateText(proposal.description, 50)}</p>
      </td>
      <td>{proposal.duration} روز</td>
      <td>{toPersianNumbersWithComma(proposal.price)}</td>
      <td>
        <StatusBadge status={status} />
      </td>
      <td>
        <Modal
          title="تغییر وضعیت درخواست"
          open={open}
          onClose={() => setOpen(false)}
        >
          <ChangeProposalStatus
            proposalId={proposal._id}
            proposalStatus={proposal.status}
            onClose={() => setOpen(false)}
          />
        </Modal>
        <button onClick={() => setOpen(true)}>
          <TbChecklist className="w-6 h-6 text-primary-800" />
        </button>
      </td>
    </Table.Row>
  );
}
export default ProposalRow;
