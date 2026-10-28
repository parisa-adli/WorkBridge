import { useTranslation } from "react-i18next";
import { HiArrowRight } from "react-icons/hi";
import useMoveBack from "../../hooks/useMoveBack";
import type { Project } from "../../types/api";

function ProjectHeader({ project }: { project: Project }) {
  const { t } = useTranslation();
  const moveBack = useMoveBack();

  return (
    <div className="flex items-center gap-x-4 mb-8">
      <button
        onClick={moveBack}
        className="flex items-center gap-x-2 bg-primary-600 py-2 px-4 rounded-lg mb-4 text-secondary-50 "
      >
        <HiArrowRight className="w-6 h-6 text-secondary-50" />
      </button>
      <h1 className="font-black text-secondary-700 text-xl">
        {t("project.proposalsOf", { title: project.title })}
      </h1>
    </div>
  );
}
export default ProjectHeader;
