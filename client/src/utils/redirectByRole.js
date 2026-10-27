import { ROLE_HOME } from "../constants";

export default function redirectByRole(navigate, role) {
  return navigate(ROLE_HOME[role] ?? "/");
}
