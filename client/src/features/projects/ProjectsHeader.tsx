import { useState } from "react";
import Modal from "../../ui/Modal";
import CreateProjectForm from "./CreateProjectForm";
import { HiOutlinePlus } from "react-icons/hi";

function ProjectsHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="font-black text-secondary-700 text-xl">پروژه های شما</h1>
      <Modal
        title="اضافه کردن پروژه جدید"
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
        <span>اضافه کردن پروژه</span>
      </button>
    </div>
  );
}
export default ProjectsHeader;
