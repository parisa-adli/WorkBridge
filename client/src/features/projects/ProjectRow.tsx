import { useTranslation } from "react-i18next";
import { useState } from "react";
import Modal from "../../ui/Modal";
import Table from "../../ui/Table";
import toLocalDateShort from "../../utils/toLocalDateShort";
import truncateText from "../../utils/truncateText";
import { Eye, PencilLine, Trash2 } from "lucide-react";
import ConfirmDelete from "../../ui/ConfirmDelete";
import { toPersianNumbersWithComma } from "../../utils/toPersianNumber";
import useRemoveProject from "./useRemoveProjects";
import CreateProjectForm from "./CreateProjectForm";
import ToggleProjectStatus from "./ToggleProjectStatus";
import { Link } from "react-router-dom";
import type { Project, UserRef } from "../../types/api";
import localized, { categoryName } from "../../utils/localized";

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const { t } = useTranslation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { removeProject } = useRemoveProject();
  const title = localized(project, "title");
  const freelancer = project.freelancer as UserRef | null;
  const freelancerName = freelancer && localized(freelancer, "name");

  return (
    <Table.Row>
      <td>{index + 1}</td>
      <td>
        <span dir="auto">{truncateText(title, 30)}</span>
      </td>
      <td>{categoryName(project.category)}</td>
      <td>{toPersianNumbersWithComma(project.budget)}</td>
      <td>{toLocalDateShort(project.deadline)}</td>
      <td>
        <div className="flex flex-wrap items-center gap-2 max-w-[200px]">
          {localized(project, "tags").map((tag) => (
            <span key={tag} dir="auto" className="badge badge--secondary">
              {tag}
            </span>
          ))}
        </div>
      </td>
      <td>{freelancerName ? <span dir="auto">{freelancerName}</span> : "-"}</td>
      <td>
        <ToggleProjectStatus project={project} />
      </td>
      <td>
        <div className="flex items-center gap-x-4">
          <>
            <button onClick={() => setIsEditOpen(true)} aria-label={t("project.edit", { title })}>
              <PencilLine className="size-5 text-primary-900" />
            </button>
            <Modal
              title={t("project.edit", { title })}
              open={isEditOpen}
              onClose={() => setIsEditOpen(false)}
            >
              <CreateProjectForm
                projectToEdit={project}
                onClose={() => setIsEditOpen(false)}
              />
            </Modal>
          </>
          <>
            <button onClick={() => setIsDeleteOpen(true)} aria-label={t("project.delete", { title })}>
              <Trash2 className="size-5 text-error" />
            </button>
            <Modal
              title={t("project.delete", { title })}
              open={isDeleteOpen}
              onClose={() => setIsDeleteOpen(false)}
            >
              <ConfirmDelete
                recourseName={title}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={() =>
                  removeProject(project._id, {
                    onSuccess: () => setIsDeleteOpen(false),
                  })
                }
                disabled={false}
              />
            </Modal>
          </>
        </div>
      </td>
      <td>
        <Link to={project._id} aria-label={t("project.view", { title })} className="flex justify-center">
          <Eye className="size-5 text-primary-800" />
        </Link>
      </td>
    </Table.Row>
  );
}
export default ProjectRow;
