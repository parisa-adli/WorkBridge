import { useTranslation } from "react-i18next";
import useToggleProjectStatus from "./useToggleProjectStatus";
import Loading from "../../ui/Loading";
import Toggle from "../../ui/Toggle";
import { PROJECT_STATUS, PROJECT_STATUS_BADGES } from "../../constants";
import type { Project } from "../../types/api";

function ToggleProjectStatus({ project }: { project: Project }) {
  const { t } = useTranslation();
  const { status } = project;
  const isOpen = status === PROJECT_STATUS.OPEN;

  const { isUpdating, toggleProjectStatus } = useToggleProjectStatus();

  const toggleHandler = () => {
    const newStatus = isOpen ? PROJECT_STATUS.CLOSED : PROJECT_STATUS.OPEN;
    toggleProjectStatus({
      id: project._id,
      data: { status: newStatus },
    });
  };

  return (
    <div className="w-20">
      {isUpdating ? (
        <Loading className="size-5" />
      ) : (
        <Toggle
          label={t(PROJECT_STATUS_BADGES[isOpen ? PROJECT_STATUS.OPEN : PROJECT_STATUS.CLOSED].label)}
          enabled={isOpen}
          onChange={toggleHandler}
        />
      )}
    </div>
  );
}
export default ToggleProjectStatus;
