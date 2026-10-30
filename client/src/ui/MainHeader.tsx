import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import HeaderMenu from "./HeaderMenu";

function MainHeader() {
  const { t } = useTranslation();
  return (
    <div className=" md:row-auto py-4 md:px-8 border-b">
      <div className="container xl:max-w-(--breakpoint-xl) flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">
          {t("app.name")}
        </Link>
        <div className="flex items-center justify-around gap-x-8">
          <HeaderMenu />
        </div>
      </div>
    </div>
  );
}
export default MainHeader;
