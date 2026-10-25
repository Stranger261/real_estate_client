import { invalidateAreas } from "@/lib/invalidate";
import { $api } from "@/lib/query";
import { CreateListingBody, UpdateListingBody } from "@/types/listing";
import { useQueryClient } from "@tanstack/react-query";

export const useMyListings = () =>
  $api.useQuery(
    "get",
    "/v1/listings/mine",
    {},
    {
      select: (res) => res.data.listings,
    },
  );

export const useListingActions = () => {
  const queryClient = useQueryClient();

  const refresh = () => invalidateAreas(queryClient, "listings", "properties");

  const create = $api.useMutation("post", "/v1/listings", {
    onSuccess: refresh,
  });
  const update = $api.useMutation("patch", "/v1/listings/{listingId}", {
    onSuccess: refresh,
  });
  const status = $api.useMutation("patch", "/v1/listings/{listingId}/status", {
    onSuccess: refresh,
  });

  return {
    create: (body: CreateListingBody) => create.mutateAsync({ body }),
    update: (listingId: string, body: UpdateListingBody) =>
      update.mutateAsync({ params: { path: { listingId } }, body }),
    setStatus: (listingId: string, next: "DRAFT" | "PUBLISHED") =>
      status.mutateAsync({
        params: { path: { listingId } },
        body: { status: next },
      }),
    isPending: create.isPending || update.isPending || status.isPending,
  };
};
