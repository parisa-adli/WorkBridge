import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import type { ApiErrorResponse, MessageData } from "../types/api";

// Toasts the server's message and invalidates every query key that lists the changed entity.
export default function useAppMutation<TData extends MessageData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidateKeys: QueryKey[] = []
) {
  const queryClient = useQueryClient();

  return useMutation<TData, AxiosError<ApiErrorResponse>, TVariables>({
    mutationFn,
    onSuccess: (data) => {
      toast.success(data.message);
      invalidateKeys.forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey })
      );
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? null),
  });
}
