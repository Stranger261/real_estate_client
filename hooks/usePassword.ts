import { useQueryClient } from "@tanstack/react-query";
import { $api } from "@/lib/query";
import { useAuthStore } from "@/stores/authStore";

export const useForgotPassword = () =>
  $api.useMutation("post", "/v1/auth/password/forgot");
export const useResetPassword = () =>
  $api.useMutation("post", "/v1/auth/password/reset");
export const useChangePassword = () =>
  $api.useMutation("post", "/v1/auth/password/change");
export const useLogoutEverywhere = () =>
  $api.useMutation("post", "/v1/auth/logout-all");
export const useRequestAddPassword = () =>
  $api.useMutation("post", "/v1/auth/password/add/request");

export const usePasswordStatus = () => {
  const status = useAuthStore((s) => s.status);
  return $api.useQuery(
    "get",
    "/v1/auth/password/status",
    {},
    {
      enabled: status === "authenticated",
      select: (res) => res.data,
    },
  );
};

export const useAddPassword = () => {
  const queryClient = useQueryClient();
  return $api.useMutation("post", "/v1/auth/password/add", {
    // the Profile row changes from "Add a password" to "Change password"
    onSuccess: () =>
      queryClient.invalidateQueries({
        predicate: (q) => q.queryKey[1] === "/v1/auth/password/status",
      }),
  });
};
