import { invalidateAreas } from "@/lib/invalidate";
import { $api } from "@/lib/query";
import { useAuthStore } from "@/stores/authStore";
import { useQueryClient } from "@tanstack/react-query";

export const useNotifications = () =>
  $api.useQuery("get", "/v1/notifications", {}, { select: (res) => res.data });

export const useUnreadCount = () => {
  const status = useAuthStore((s) => s.status);
  return $api.useQuery(
    "get",
    "/v1/notifications",
    {},
    {
      enabled: status === "authenticated",
      select: (res) => res.data.unreadCount,
    },
  );
};

export const useNotificationActions = () => {
  const queryClient = useQueryClient();
  const refresh = () => invalidateAreas(queryClient, "notifications");

  const read = $api.useMutation(
    "post",
    "/v1/notifications/{notificationId}/read",
    { onSuccess: refresh },
  );

  const readAll = $api.useMutation("post", "/v1/notifications/read-all", {
    onSuccess: refresh,
  });

  return {
    markRead: (notificationId: string) =>
      read.mutate({ params: { path: { notificationId } } }),
    markAllRead: () => readAll.mutate({}),
  };
};
