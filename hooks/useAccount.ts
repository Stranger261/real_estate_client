import { $api } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return $api.useMutation("patch", "/v1/users/me", {
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["get", "/v1/users/me"],
      }),
  });
};

export const useApplySeller = () => {
  const queryClient = useQueryClient();

  return $api.useMutation("post", "/v1/users/me/apply-seller", {
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/users/me"] }),
  });
};
