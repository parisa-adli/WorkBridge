import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ListChecks } from "lucide-react";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Loading from "../../ui/Loading";
import StatusSelect from "../../ui/StatusSelect";
import type { Project } from "../../types/api";
import localized from "../../utils/localized";
import { projectApprovalSchema, type StatusInput, type StatusValues } from "../../schemas/status";
import useChangeProjectApproval from "./useChangeProjectApproval";

// admin only: set a project's approval to accepted, rejected or pending (the server answers 403 to anyone else)
function ProjectApprovalActions({ project }: { project: Project }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { isUpdating, changeProjectApproval } = useChangeProjectApproval();
  const { control, handleSubmit } = useForm<StatusInput, unknown, StatusValues>({
    defaultValues: { status: project.approval },
    resolver: zodResolver(projectApprovalSchema),
  });
  const label = t("project.changeApproval", { title: localized(project, "title") });

  const onSubmit = ({ status }: StatusValues) => {
    changeProjectApproval({ id: project._id, approval: status }, { onSuccess: () => setOpen(false) });
  };

  return (
    <>
      <Modal title={label} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <StatusSelect control={control} />
          <div className="mt-8!">
            {isUpdating ? (
              <Loading />
            ) : (
              <Button type="submit" className="w-full">
                {t("common.confirm")}
              </Button>
            )}
          </div>
        </form>
      </Modal>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label={label}>
        <ListChecks />
      </Button>
    </>
  );
}
export default ProjectApprovalActions;
