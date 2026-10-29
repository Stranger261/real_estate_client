import { QueryClient } from "@tanstack/react-query";

export type Area =
  | "transactions"
  | "listings"
  | "favorites"
  | "me"
  | "inventory"
  | "buildings"
  | "notifications"
  | "media"
  | "admin";

const PREFIX: Record<Area, string> = {
  transactions: "/v1/transactions",
  listings: "/v1/listings",
  favorites: "/v1/favorites",
  me: "/v1/users/me",
  notifications: "/v1/notifications",
  media: "/v1/media",
  inventory: "/v1/inventory",
  buildings: "/v1/buildings",
  admin: "/v1/admin",
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
