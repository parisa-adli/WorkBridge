import type { NavigateFunction } from "react-router-dom";
import { ROLE_HOME } from "../constants";

export default function redirectByRole(navigate: NavigateFunction, role: string) {
  return navigate(ROLE_HOME[role as keyof typeof ROLE_HOME] ?? "/");
}
