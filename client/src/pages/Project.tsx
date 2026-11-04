import { useTranslation } from "react-i18next";
import { CircleAlert } from "lucide-react";
import useProject from "../features/project/useProject";
import ProjectHeader from "../features/project/ProjectHeader";
import ProposalsTable from "../features/project/ProposalsTable";
import Loading from "../ui/Loading";
import Empty from "../ui/Empty";
import EmptyState from "../ui/EmptyState";
import type { Proposal } from "../types/api";

function Project() {
  const { t } = useTranslation();
  const { isLoading, isError, project } = useProject();

  if (isLoading) return <Loading />;
  if (isError) return <EmptyState icon={<CircleAlert className="text-destructive" />} title={t("project.loadError")} />;
  if (!project) return <Empty resourceName={t("project.resource")} />;

  return (
    <div>
      <ProjectHeader project={project} />
      {/* a single project comes with its proposals populated */}
      <ProposalsTable proposals={project.proposals as Proposal[]} />
    </div>
  );
}
export default Project;
