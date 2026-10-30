import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import Button from "../../ui/Button";
import useMoveBack from "../../hooks/useMoveBack";
import type { Project } from "../../types/api";
import localized from "../../utils/localized";

function ProjectHeader({ project }: { project: Project }) {
  const { t } = useTranslation();
  const moveBack = useMoveBack();

  return (
    <div className="flex items-center gap-x-4 mb-8">
      <Button variant="outline" size="icon" onClick={moveBack} aria-label={t("common.back")}>
        <ArrowRight className="ltr:-scale-x-100" />
      </Button>
      <h1 className="font-black text-xl">
        {t("project.proposalsOf", { title: localized(project, "title") })}
      </h1>
    </div>
  );
}
export default ProjectHeader;
