import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { invalidateAreas } from "@/lib/invalidate";
import { $api } from "@/lib/query";

export const useSellerReviews = (userId: string, limit: number) =>
  $api.useQuery(
    "get",
    "/v1/reviews/user/{userId}",
    { params: { path: { userId }, query: { limit } } },
    {
      enabled: !!userId,
      select: (res) => res.data,
      placeholderData: keepPreviousData,
    },
  );

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return $api.useMutation("post", "/v1/reviews", {
    // the offers list shows "Your review", the listing shows the new average, the reviews list grows
    onSuccess: () =>
      invalidateAreas(queryClient, "transactions", "reviews", "listings"),
  });
};
