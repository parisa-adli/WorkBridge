import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getUserProfileApi } from "../../../services/authService";

export default function useUserProfile() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-user", id],
    // the route is /admin/users/:id, so id is always set
    queryFn: () => getUserProfileApi(id!),
    retry: false,
  });

  return { profile: data, isLoading };
}
