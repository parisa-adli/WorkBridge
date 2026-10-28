import { useTranslation } from "react-i18next";
import useProjects from "../../../hooks/useProjects";
import Empty from "../../../ui/Empty";
import Loading from "../../../ui/Loading";
import Table from "../../../ui/Table";
import ProjectRow from "./ProjectRow";

function ProjectsTable() {
  const { t } = useTranslation();
  const { isLoading, projects } = useProjects();

  if (isLoading) return <Loading />;
  if (!projects.length) return <Empty resourceName={t("project.resource")} />;

  return (
    <Table>
      <Table.Header>
        <tr className="title-row">
          <th>#</th>
          <th>{t("project.title")}</th>
          <th>{t("project.category")}</th>
          <th>{t("roles.owner")}</th>
          <th>{t("project.budget")}</th>
          <th>{t("project.deadline")}</th>
          <th>{t("common.status")}</th>
          <th>{t("common.actions")}</th>
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
export default ProjectsTable;
