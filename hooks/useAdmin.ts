import { $api } from "@/lib/query";
import { isAdminUser } from "@/utils/admin";
import { useIsScreenFocused } from "./useIsScreenFocused";
import { useMe } from "./useMe";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { invalidateAreas } from "@/lib/invalidate";

const POLL_MS = 30_000;

const usePollWhileFocused = () => (useIsScreenFocused() ? POLL_MS : false);

export const useIsAdmin = () => {
  const { data: me, isLoading } = useMe();
  return { isAdmin: isAdminUser(me), isLoading };
};

export const useAdminOverview = () =>
  $api.useQuery(
    "get",
    "/v1/admin/overview",
    {},
    {
      select: (res) => res.data.overview,
      refetchInterval: usePollWhileFocused(),
    },
  );

export const useSellerApplications = () =>
  $api.useQuery(
    "get",
    "/v1/admin/seller-applications",
    {},
    {
      select: (res) => res.data.applications,
      refetchInterval: usePollWhileFocused(),
    },
  );

export const useVerifications = () =>
  $api.useQuery(
    "get",
    "/v1/admin/verifications",
    {},
    {
      select: (res) => res.data.items,
      refetchInterval: usePollWhileFocused(),
    },
  );

export const useAdminUsers = (
  q: string,
  filter: "admins" | "banned" | undefined,
) =>
  $api.useQuery(
    "get",
    "/v1/admin/users",
    {
      params: { query: { ...(q ? { q } : {}), ...(filter ? { filter } : {}) } },
    },
    { select: (res) => res.data.users, placeholderData: keepPreviousData },
  );

export const useAdminListings = (
  q: string,
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED" | undefined,
  enabled: boolean,
) =>
  $api.useQuery(
    "get",
    "/v1/admin/listings",
    {
      params: { query: { ...(q ? { q } : {}), ...(status ? { status } : {}) } },
    },
    {
      enabled,
      select: (res) => res.data.listings,
      placeholderData: keepPreviousData,
    },
  );

export const useAdminInventory = (
  kind: "property" | "building" | "unit",
  q: string,
  enabled: boolean,
) =>
  $api.useQuery(
    "get",
    "/v1/admin/inventory",
    { params: { query: { kind, ...(q ? { q } : {}) } } },
    {
      enabled,
      select: (res) => res.data.items,
      placeholderData: keepPreviousData,
    },
  );

export const useAdminActivity = () =>
  $api.useQuery(
    "get",
    "/v1/admin/activity",
    {},
    {
      select: (res) => res.data.actions,
      refetchInterval: usePollWhileFocused(),
    },
  );

export const useAdminActions = () => {
  const queryClient = useQueryClient();

  const refresh = () =>
    invalidateAreas(queryClient, "admin", "listings", "favorites");

  const review = $api.useMutation(
    "post",
    "/v1/admin/seller-applications/{id}/review",
    { onSuccess: refresh },
  );
  const decide = $api.useMutation(
    "post",
    "/v1/admin/verifications/{kind}/{id}/decision",
    { onSuccess: refresh },
  );
  const status = $api.useMutation("post", "/v1/admin/users/{userId}/status", {
    onSuccess: refresh,
  });
  const takedown = $api.useMutation(
    "post",
    "/v1/admin/listings/{id}/takedown",
    { onSuccess: refresh },
  );
  const restore = $api.useMutation("post", "/v1/admin/listings/{id}/restore", {
    onSuccess: refresh,
  });
  const inventoryStatus = $api.useMutation(
    "post",
    "/v1/admin/inventory/{kind}/{id}/status",
    { onSuccess: refresh },
  );
  const adminRole = $api.useMutation("post", "/v1/admin/users/{userId}/admin", {
    onSuccess: refresh,
  });

  return {
    reviewApplication: (id: string, decision: "APPROVED" | "REJECTED") =>
      review.mutateAsync({ params: { path: { id } }, body: { decision } }),
    decideVerification: (
      kind: "property" | "unit" | "building",
      id: string,
      decision: "VERIFIED" | "REJECTED",
      reason?: string,
    ) =>
      decide.mutateAsync({
        params: { path: { kind, id } },
        body: { decision, reason },
      }),
    setUserStatus: (userId: string, newStatus: "ACTIVE" | "BANNED") =>
      status.mutateAsync({
        params: { path: { userId } },
        body: { status: newStatus },
      }),
    takedownListing: (id: string, reason: string) =>
      takedown.mutateAsync({ params: { path: { id } }, body: { reason } }),
    restoreListing: (id: string) =>
      restore.mutateAsync({ params: { path: { id } } }),
    setInventoryStatus: (
      kind: "property" | "building" | "unit",
      id: string,
      status: "ACTIVE" | "SUSPENDED",
      reason?: string,
    ) =>
      inventoryStatus.mutateAsync({
        params: { path: { kind, id } },
        body: { status, reason },
      }),
    setAdminRole: (userId: string, isAdmin: boolean) =>
      adminRole.mutateAsync({
        params: { path: { userId } },
        body: { isAdmin },
      }),
  };
};
