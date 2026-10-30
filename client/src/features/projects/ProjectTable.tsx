import { useTranslation } from "react-i18next";
import useOwnerProjects from "./useOwnerProjects";
import ListState from "../../ui/ListState";
import Table from "../../ui/Table";
import TablePagination from "../../ui/TablePagination";
import ProjectRow from "./ProjectRow";


function ProjectTable() {
  const { t } = useTranslation();
  const { isLoading, isError, projects, total, page, limit } = useOwnerProjects();

  return (
    <ListState isLoading={isLoading} isError={isError} total={total} resourceName={t("project.resource")}>
      <Table>
        <Table.Header>
          <Table.Row>
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
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {projects.map((project, index) => (
            <ProjectRow key={project._id} project={project} index={(page - 1) * limit + index} />
          ))}
        </Table.Body>
      </Table>
      <TablePagination page={page} total={total} limit={limit} />
    </ListState>
  );
}
export default ProjectTable;
