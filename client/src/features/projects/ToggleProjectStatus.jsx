import useToggleProjectStatus from "./useToggleProjectStatus";
import Loading from "../../ui/Loading";
import Toggle from "../../ui/Toggle";
import { PROJECT_STATUS, PROJECT_STATUS_BADGES } from "../../constants";

function ToggleProjectStatus({ project }) {
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
    <div className="w-[5rem]">
      {isUpdating ? (
        <Loading height={20} width={50} />
      ) : (
        <Toggle
          label={PROJECT_STATUS_BADGES[isOpen ? PROJECT_STATUS.OPEN : PROJECT_STATUS.CLOSED].label}
          enabled={isOpen}
          onChange={toggleHandler}
        />
      )}
    </div>
  );
}
export default ToggleProjectStatus;
