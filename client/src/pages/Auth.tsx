import { useTranslation } from "react-i18next";
import AuthContainer from "../features/authentication/AuthContainer";
// import CheckOTPForm from "../features/authentication/CheckOTPForm";

function Auth({ admin = false }: { admin?: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="container xl:max-w-(--breakpoint-xl)">
      <div className="flex flex-col items-center gap-6 pt-10">
        {admin && <h1 className="font-black text-xl">{t("auth.adminLogin")}</h1>}
        <AuthContainer admin={admin} />
      </div>
    </div>
  );
}

export default Auth;

// auth ? 1 : 2
// 1. sentOTP
// 2. checkOTP
