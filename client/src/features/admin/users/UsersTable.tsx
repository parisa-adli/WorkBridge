import { useTranslation } from "react-i18next";
import Empty from "../../../ui/Empty";
import Loading from "../../../ui/Loading";
import Table from "../../../ui/Table";
import TablePagination from "../../../ui/TablePagination";
import useUsers from "../useUsers";
import UserRow from "./UserRow";

function UsersTable() {
  const { t } = useTranslation();
  const { isLoading, users, total, page, limit } = useUsers();

  if (isLoading) return <Loading />;
  if (!total) return <Empty resourceName={t("user.resource")} />;

  return (
    <>
      <Table>
        <Table.Header>
          <tr className="title-row">
            <th>#</th>
            <th>{t("user.name")}</th>
            <th>{t("auth.email")}</th>
            <th>{t("auth.phoneNumber")}</th>
            <th>{t("user.role")}</th>
            <th>{t("common.status")}</th>
            <th>{t("common.actions")}</th>
          </tr>
        </Table.Header>
        <Table.Body>
          {users.map((user, index) => (
            <UserRow key={user._id} user={user} index={(page - 1) * limit + index} />
          ))}
        </Table.Body>
      </Table>
      <TablePagination page={page} total={total} limit={limit} />
    </>
  );
}
export default UsersTable;
