import { useTranslation } from "react-i18next";
import useUser from "../features/authentication/useUser";
import ProfileForm from "../features/authentication/ProfileForm";
import Loading from "../ui/Loading";

function Profile() {
  const { t } = useTranslation();
  const { isLoading, user } = useUser();

  if (isLoading || !user) return <Loading />;

  return (
    <div className="space-y-6">
      <h1 className="font-black text-text text-xl">{t("profile.title")}</h1>
      <ProfileForm user={user} />
    </div>
  );
}
export default Profile;
