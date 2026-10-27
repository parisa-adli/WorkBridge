import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Toasts the server's message and invalidates every query key that lists the changed entity.
export default function useAppMutation(mutationFn, invalidateKeys = []) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      toast.success(data.message);
      invalidateKeys.forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey })
      );
    },
    onError: (err) => toast.error(err?.response?.data?.message),
  });
}
