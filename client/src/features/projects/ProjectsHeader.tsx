import { useTranslation } from "react-i18next";
import { useState } from "react";
import Modal from "../../ui/Modal";
import CreateProjectForm from "./CreateProjectForm";
import { HiOutlinePlus } from "react-icons/hi";

function ProjectsHeader() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="font-black text-secondary-700 text-xl">{t("project.yourProjects")}</h1>
      <Modal
        title={t("project.addNew")}
        open={open}
        onClose={() => setOpen(false)}
      >
        <CreateProjectForm onClose={() => setOpen(false)} />
      </Modal>
      <button
        className="btn btn--primary flex items-center gap-x-2"
        onClick={() => setOpen(true)}
      >
        <HiOutlinePlus />
        <span>{t("project.add")}</span>
      </button>
    </div>
  );
}
export default ProjectsHeader;
