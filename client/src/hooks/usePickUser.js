import { useNavigate } from "react-router-dom";

function usePickUser() {
  const navigate = useNavigate();

  const pickUser = (role) => {
    if (role === "OWNER") return navigate("/owner/dashboard");
    if (role === "FREELANCER") return navigate("/freelancer/dashboard");
    if (role === "ADMIN") return navigate("/admin/dashboard");
    return "/";
  };

  return pickUser;
}

export default usePickUser;
