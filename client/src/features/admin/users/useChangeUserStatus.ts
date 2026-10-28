import useAppMutation from "../../../hooks/useAppMutation";
import { changeUserStatusApi } from "../../../services/authService";

export default function useChangeUserStatus() {
  const { isPending: isUpdating, mutate: changeUserStatus } = useAppMutation(
    changeUserStatusApi,
    [["users"], ["admin-user"]]
  );
  return { isUpdating, changeUserStatus };
}
