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
import localized, { categoryName } from "../../../utils/localized";

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const { t } = useTranslation();
  const { budget, deadline, status } = project;
  const title = localized(project, "title");
  const owner = project.owner as UserRef | null;
  const [open, setOpen] = useState(false);
  return (
    <Table.Row>
      <td>{index + 1}</td>
      <td>
        <span dir="auto">{truncateText(title, 30)}</span>
      </td>
      <td>{categoryName(project.category)}</td>
      <td>{owner && <span dir="auto">{localized(owner, "name")}</span>}</td>
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
