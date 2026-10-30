import { useTranslation } from "react-i18next";
import ListState from "../../../ui/ListState";
import Table from "../../../ui/Table";
import TablePagination from "../../../ui/TablePagination";
import useUsers from "../useUsers";
import UserRow from "./UserRow";

function UsersTable() {
  const { t } = useTranslation();
  const { isLoading, isError, users, total, page, limit } = useUsers();

  return (
    <ListState isLoading={isLoading} isError={isError} total={total} resourceName={t("user.resource")}>
      <Table>
        <Table.Header>
          <Table.Row>
            <th>#</th>
            <th>{t("user.name")}</th>
            <th>{t("auth.email")}</th>
            <th>{t("auth.phoneNumber")}</th>
            <th>{t("user.role")}</th>
            <th>{t("common.status")}</th>
            <th>{t("common.actions")}</th>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {users.map((user, index) => (
            <UserRow key={user._id} user={user} index={(page - 1) * limit + index} />
          ))}
        </Table.Body>
      </Table>
      <TablePagination page={page} total={total} limit={limit} />
    </ListState>
  );
}
export default UsersTable;
