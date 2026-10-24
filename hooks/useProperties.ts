import { $api } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

export const useMyProperties = () =>
  $api.useQuery(
    "get",
    "/v1/properties/mine",
    {},
    { select: (res) => res.data.properties },
  );

export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return $api.useMutation("post", "/v1/properties", {
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["get", "/v1/properties/mine"],
      }),
  });
};
