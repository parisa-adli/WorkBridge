import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";
import Button from "../../ui/Button";
import { STATUS } from "../../constants";
import type { Project } from "../../types/api";
import localized from "../../utils/localized";
import useChangeProjectApproval from "./useChangeProjectApproval";

// admin only: approve or reject a project (the server answers 403 to anyone else)
function ProjectApprovalActions({ project }: { project: Project }) {
  const { t } = useTranslation();
  const { isUpdating, changeProjectApproval } = useChangeProjectApproval();
  const title = localized(project, "title");

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        disabled={isUpdating || project.approval === STATUS.ACCEPTED}
        onClick={() => changeProjectApproval({ id: project._id, approval: STATUS.ACCEPTED })}
        aria-label={t("project.approve", { title })}
      >
        <Check />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={isUpdating || project.approval === STATUS.REJECTED}
        onClick={() => changeProjectApproval({ id: project._id, approval: STATUS.REJECTED })}
        aria-label={t("project.reject", { title })}
      >
        <X className="text-destructive" />
      </Button>
    </>
  );
}
export default ProjectApprovalActions;
