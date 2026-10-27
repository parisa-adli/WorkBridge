import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { logoutApi } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../types/api";

export default function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { isPending, mutate: logout } = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.removeQueries();
      navigate("/auth", { replace: true });
    },

    onError: (err) =>
      toast.error((err as AxiosError<ApiErrorResponse>)?.response?.data?.message ?? null),
  });
  return { isPending, logout };
}
