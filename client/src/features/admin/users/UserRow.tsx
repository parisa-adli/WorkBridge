import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link } from "react-router-dom";

import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";
import { ListChecks } from "lucide-react";
import Table from "../../../ui/Table";
import ChangeUserStatus from "./ChangeUserStatus";
import StatusBadge from "../../../ui/StatusBadge";
import type { User } from "../../../types/api";
import localized from "../../../utils/localized";

function UserRow({ user, index }: { user: User; index: number }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { status } = user;

  return (
    <Table.Row>
      <td>{index + 1}</td>
      <td>
        <Link to={`/admin/users/${user._id}`} dir="auto" className="text-primary hover:underline">
          {localized(user, "name") || user.phoneNumber}
        </Link>
      </td>
      <td>{user.email}</td>
      <td>{user.phoneNumber}</td>
      <td>{user.role}</td>
      <td>
        <StatusBadge status={status} />
      </td>
      <td>
        <Modal
          title={t("user.changeStatus")}
          open={open}
          onClose={() => setOpen(false)}
        >
          <ChangeUserStatus
            userId={user._id}
            userStatus={user.status}
            onClose={() => setOpen(false)}
          />
        </Modal>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label={t("user.changeStatus")}>
          <ListChecks />
        </Button>
      </td>
    </Table.Row>
  );
}
export default UserRow;
