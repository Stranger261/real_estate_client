import { QueryClient } from "@tanstack/react-query";

export type Area =
  | "transactions"
  | "listings"
  | "favorites"
  | "me"
  | "properties"
  | "notifications";

const PREFIX: Record<Area, string> = {
  transactions: "/v1/transactions",
  listings: "/v1/listings",
  favorites: "/v1/favorites",
  me: "/v1/users/me",
  properties: "/v1/properties",
  notifications: "/v1/notifications",
};

export const invalidateAreas = (queryClient: QueryClient, ...areas: Area[]) => {
  const prefixes = areas.map((area) => PREFIX[area]);
  return queryClient.invalidateQueries({
    predicate: (q) => {
      const path = q.queryKey[1];

      return (
        typeof path === "string" && prefixes.some((p) => path.startsWith(p))
      );
    },
  });
};
