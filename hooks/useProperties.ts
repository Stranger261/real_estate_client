import { invalidateAreas } from "@/lib/invalidate";
import { $api } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return $api.useMutation("post", "/v1/properties", {
    onSuccess: () => invalidateAreas(queryClient, "inventory"),
  });
};
