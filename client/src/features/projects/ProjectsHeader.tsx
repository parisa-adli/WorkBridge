import { useTranslation } from "react-i18next";
import { useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import CreateProjectForm from "./CreateProjectForm";
import { Plus } from "lucide-react";

function ProjectsHeader() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <h1 className="font-black text-xl">{t("project.yourProjects")}</h1>
      <Modal
        title={t("project.addNew")}
        open={open}
        onClose={() => setOpen(false)}
      >
        <CreateProjectForm onClose={() => setOpen(false)} />
      </Modal>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        <span>{t("project.add")}</span>
      </Button>
    </div>
  );
}
export default ProjectsHeader;
