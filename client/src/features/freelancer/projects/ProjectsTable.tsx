import { useTranslation } from "react-i18next";
import useProjects from "../../../hooks/useProjects";
import ListState from "../../../ui/ListState";
import Table from "../../../ui/Table";
import TablePagination from "../../../ui/TablePagination";
import ProjectRow from "./ProjectRow";
import useUser from "../../authentication/useUser";
import { ROLES } from "../../../constants";

function ProjectsTable() {
  const { t } = useTranslation();
  const { isLoading, isError, projects, total, page, limit } = useProjects();
  const { user } = useUser();
  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <ListState isLoading={isLoading} isError={isError} total={total} resourceName={t("project.resource")}>
      <Table>
        <Table.Header>
          <Table.Row>
            <th>#</th>
            <th>{t("project.title")}</th>
            <th>{t("project.category")}</th>
            <th>{t("roles.owner")}</th>
            <th>{t("project.budget")}</th>
            <th>{t("project.deadline")}</th>
            <th>{t("common.status")}</th>
            <th>{t("common.actions")}</th>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {projects.map((project, index) => (
            <ProjectRow key={project._id} project={project} index={(page - 1) * limit + index} isAdmin={isAdmin} />
          ))}
        </Table.Body>
      </Table>
      <TablePagination page={page} total={total} limit={limit} />
    </ListState>
  );
}
export default ProjectsTable;
