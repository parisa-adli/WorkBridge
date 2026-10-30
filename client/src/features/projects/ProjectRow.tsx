import { useTranslation } from "react-i18next";
import { useState } from "react";
import Modal from "../../ui/Modal";
import Button, { buttonClass } from "../../ui/Button";
import { Badge } from "@/components/ui/badge";
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
  const { removeProject, isDeleting } = useRemoveProject();
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
            <Badge key={tag} variant="secondary" dir="auto">
              {tag}
            </Badge>
          ))}
        </div>
      </td>
      <td>{freelancerName ? <span dir="auto">{freelancerName}</span> : "-"}</td>
      <td>
        <ToggleProjectStatus project={project} />
      </td>
      <td>
        <div className="flex items-center gap-x-2">
          <>
            <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(true)} aria-label={t("project.edit", { title })}>
              <PencilLine />
            </Button>
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
          <ConfirmDelete
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            title={t("project.delete", { title })}
            resourceName={title}
            trigger={
              <Button variant="ghost" size="icon" aria-label={t("project.delete", { title })}>
                <Trash2 className="text-destructive" />
              </Button>
            }
            onConfirm={() =>
              removeProject(project._id, {
                onSuccess: () => setIsDeleteOpen(false),
              })
            }
            disabled={isDeleting}
          />
        </div>
      </td>
      <td>
        <Link to={project._id} aria-label={t("project.view", { title })} className={buttonClass({ variant: "ghost", size: "icon" })}>
          <Eye />
        </Link>
      </td>
    </Table.Row>
  );
}
export default ProjectRow;
