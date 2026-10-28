import { useTranslation } from "react-i18next";
import { useState } from "react";

import Modal from "../../../ui/Modal";
import { TbChecklist } from "react-icons/tb";
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
        <span dir="auto">{localized(user, "name")}</span>
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
        <button onClick={() => setOpen(true)}>
          <TbChecklist className="w-6 h-6 text-primary-800" />
        </button>
      </td>
    </Table.Row>
  );
}
export default UserRow;
