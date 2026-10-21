import { $api } from "@/lib/query";
import { useAuthStore } from "@/stores/authStore";
import { paths } from "@/types/api";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

type ListingResponse =
  paths["/v1/listings/{listingId}"]["get"]["responses"][200]["content"]["application/json"];

export const useFavorite = (listingId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const queryKey = $api.queryOptions("get", "/v1/listings/{listingId}", {
    params: { path: { listingId } },
  }).queryKey;

  const setFavorited = async (favorited: boolean) => {
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData<ListingResponse>(queryKey);

    queryClient.setQueryData<ListingResponse>(
      queryKey,
      (old) =>
        old && {
          ...old,
          data: {
            ...old.data,
            listing: {
              ...old.data.listing,
              isFavoritedByViewer: favorited,
              favoriteCount: Math.max(
                0,
                old.data.listing.favoriteCount + (favorited ? 1 : -1),
              ),
            },
          },
        },
    );

    return { previous };
  };

  const rollback = (
    _e: unknown,
    _v: unknown,
    context?: { previous?: ListingResponse },
  ) => {
    if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
  };
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ["get", "/v1/favorites"] });
  };

  const add = $api.useMutation("post", "/v1/favorites/{listingId}", {
    onMutate: () => setFavorited(true),
    onError: rollback,
    onSettled: refresh,
  });

  const remove = $api.useMutation("delete", "/v1/favorites/{listingId}", {
    onMutate: () => setFavorited(false),
    onError: rollback,
    onSettled: refresh,
  });

  const toggle = (isFavorited: boolean) => {
    if (useAuthStore.getState().status !== "authenticated") {
      router.push("/auth-screen");
      return;
    }
    const vars = { params: { path: { listingId } } };
    isFavorited ? remove.mutate(vars) : add.mutate(vars);
  };

  return { toggle };
};

export const useFavoriteListings = () => {
  const status = useAuthStore((s) => s.status);

  return $api.useQuery(
    "get",
    "/v1/favorites",
    {},
    {
      enabled: status === "authenticated",
      select: (res) => {
        return res.data.favorites;
      },
    },
  );
};
