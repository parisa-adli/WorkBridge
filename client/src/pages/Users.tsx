import { useTranslation } from "react-i18next";
import UsersTable from "../features/admin/users/UsersTable";

function Users() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="font-black text-xl mb-8">
        {t("user.list")}
      </h1>
      <UsersTable />
    </div>
  );
}
export default Users;
