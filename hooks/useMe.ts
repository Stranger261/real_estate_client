import { $api } from "@/lib/query";
import { useAuthStore } from "@/stores/authStore";

export const useMe = () => {
  const status = useAuthStore((s) => s.status);

  return $api.useQuery(
    "get",
    "/v1/users/me",
    {},
    {
      enabled: status === "authenticated",
      select: (res) => res.data.user,
      staleTime: 5 * 60_000,
    },
  );
};
