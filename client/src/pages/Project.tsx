import { useTranslation } from "react-i18next";
import useProject from "../features/project/useProject";
import ProjectHeader from "../features/project/ProjectHeader";
import ProposalsTable from "../features/project/ProposalsTable";
import Loading from "../ui/Loading";
import Empty from "../ui/Empty";
import type { Proposal } from "../types/api";

function Project() {
  const { t } = useTranslation();
  const { isLoading, project } = useProject();

  if (isLoading) return <Loading />;
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
