import { useTranslation } from "react-i18next";
import useOwnerProjects from "./useOwnerProjects";
import Loading from "../../ui/Loading";
import Empty from "../../ui/Empty";
import Table from "../../ui/Table";
import ProjectRow from "./ProjectRow";


function ProjectTable() {
  const { t } = useTranslation();
  const { isLoading, projects } = useOwnerProjects();

  if (isLoading) return <Loading />;
  if (!projects.length) return <Empty resourceName={t("project.resource")} />;

  return (
    <Table>
      <Table.Header>
        <tr className="title-row">
          <th>#</th>
          <th>{t("project.title")}</th>
          <th>{t("project.category")}</th>
          <th>{t("project.budget")}</th>
          <th>{t("project.deadline")}</th>
          <th>{t("project.tags")}</th>
          <th>{t("project.freelancer")}</th>
          <th>{t("common.status")}</th>
          <th>{t("common.actions")}</th>
          <th>{t("project.proposals")}</th>
        </tr>
      </Table.Header>
      <Table.Body>
        {projects.map((project, index) => (
          <ProjectRow key={project._id} project={project} index={index} />
        ))}
      </Table.Body>
    </Table>
  );
}
export default ProjectTable;
