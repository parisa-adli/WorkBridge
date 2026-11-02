import useAppMutation from "../../hooks/useAppMutation";
import { changePasswordApi, removeAvatarApi, updateAvatarApi, updateProfileApi } from "../../services/authService";

// The header and the admin users list both show the user's name and avatar.
const USER_KEYS = [["user"], ["users"]];

export function useUpdateProfile() {
  const { isPending: isUpdating, mutate: updateProfile } = useAppMutation(updateProfileApi, USER_KEYS);
  return { isUpdating, updateProfile };
}

// ["user"]: the profile reads hasPassword
export function useChangePassword() {
  const { isPending: isChangingPassword, mutate: changePassword } = useAppMutation(changePasswordApi, [["user"]]);
  return { isChangingPassword, changePassword };
}

export function useUpdateAvatar() {
  const { isPending: isUploading, mutate: updateAvatar } = useAppMutation(updateAvatarApi, USER_KEYS);
  return { isUploading, updateAvatar };
}

export function useRemoveAvatar() {
  const { isPending: isRemoving, mutate: removeAvatar } = useAppMutation(removeAvatarApi, USER_KEYS);
  return { isRemoving, removeAvatar };
}
