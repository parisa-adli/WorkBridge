import useAppMutation from "../../hooks/useAppMutation";
import { updateAvatarApi, updateProfileApi } from "../../services/authService";

// The header and the admin users list both show the user's name and avatar.
const USER_KEYS = [["user"], ["users"]];

export function useUpdateProfile() {
  const { isPending: isUpdating, mutate: updateProfile } = useAppMutation(updateProfileApi, USER_KEYS);
  return { isUpdating, updateProfile };
}

export function useUpdateAvatar() {
  const { isPending: isUploading, mutate: updateAvatar } = useAppMutation(updateAvatarApi, USER_KEYS);
  return { isUploading, updateAvatar };
}
