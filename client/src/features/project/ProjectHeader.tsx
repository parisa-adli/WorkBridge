import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import useMoveBack from "../../hooks/useMoveBack";
import type { Project } from "../../types/api";
import localized from "../../utils/localized";

function ProjectHeader({ project }: { project: Project }) {
  const { t } = useTranslation();
  const moveBack = useMoveBack();

  return (
    <div className="flex items-center gap-x-4 mb-8">
      <button
        onClick={moveBack}
        aria-label={t("common.back")}
        className="flex items-center gap-x-2 bg-primary-600 py-2 px-4 rounded-lg mb-4 text-secondary-50 "
      >
        <ArrowRight className="size-6 text-secondary-50 ltr:-scale-x-100" />
      </button>
      <h1 className="font-black text-secondary-700 text-xl">
        {t("project.proposalsOf", { title: localized(project, "title") })}
      </h1>
    </div>
  );
}
export default ProjectHeader;
