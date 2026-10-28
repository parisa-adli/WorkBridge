import { useTranslation } from "react-i18next";
import Table from "../../../ui/Table";
import { toPersianNumbersWithComma } from "../../../utils/toPersianNumber";
import truncateText from "../../../utils/truncateText";
import toLocalDateShort from "../../../utils/toLocalDateShort";
import { MdAssignmentAdd } from "react-icons/md";
import Modal from "../../../ui/Modal";
import { useState } from "react";
import CreateProposal from "../../proposals/CreateProposal";
import StatusBadge from "../../../ui/StatusBadge";
import { PROJECT_STATUS_BADGES } from "../../../constants";
import type { Project, UserRef } from "../../../types/api";

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const { t } = useTranslation();
  const { title, budget, deadline, status } = project;
  const [open, setOpen] = useState(false);
  return (
    <Table.Row>
      <td>{index + 1}</td>
      <td>{truncateText(title, 30)}</td>
      <td>{project.category.title}</td>
      <td>{(project.owner as UserRef | null)?.name}</td>
      <td>{toPersianNumbersWithComma(budget)}</td>
      <td>{toLocalDateShort(deadline)}</td>
      <td>
        <StatusBadge status={status} badges={PROJECT_STATUS_BADGES} />
      </td>
      <td>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title={t("proposal.send", { title })}
        >
          <CreateProposal
            projectId={project._id}
            onClose={() => setOpen(false)}
          />
        </Modal>
        <button onClick={() => setOpen(true)}>
          <MdAssignmentAdd className=" w-5 h-5 text-primary-900" />
        </button>
      </td>
    </Table.Row>
  );
}
export default ProjectRow;
