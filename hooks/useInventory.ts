import { invalidateAreas } from "@/lib/invalidate";
import { $api } from "@/lib/query";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
export const useInventory = () =>
  $api.useQuery(
    "get",
    "/v1/inventory/mine",
    {},
    { select: (res) => res.data.items },
  );

export const useBuildingSearch = (q: string, enabled: boolean) =>
  $api.useQuery(
    "get",
    "/v1/buildings/search",
    {
      params: { query: q ? { q } : {} },
    },
    {
      enabled,
      select: (res) => res.data.buildings,
      placeholderData: keepPreviousData,
    },
  );

export const useCreateBuilding = () => {
  const queryClient = useQueryClient();

  return $api.useMutation("post", "/v1/buildings", {
    onSuccess: () => invalidateAreas(queryClient, "inventory", "buildings"),
  });
};

export const useCreateUnit = () => {
  const queryClient = useQueryClient();

  return $api.useMutation("post", "/v1/units", {
    onSuccess: () => invalidateAreas(queryClient, "inventory"),
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return $api.useMutation("post", "/v1/rooms", {
    onSuccess: () => invalidateAreas(queryClient, "inventory"),
  });
};
