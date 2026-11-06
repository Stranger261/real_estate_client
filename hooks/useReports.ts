import { useQueryClient } from "@tanstack/react-query";
import { useIsScreenFocused } from "@/hooks/useIsScreenFocused";
import { invalidateAreas } from "@/lib/invalidate";
import { $api } from "@/lib/query";

export const useReportConversation = () =>
  $api.useMutation("post", "/v1/reports");

export const useAdminReports = (status: "OPEN" | "RESOLVED" | "DISMISSED") => {
  const focused = useIsScreenFocused();
  return $api.useQuery(
    "get",
    "/v1/admin/reports",
    { params: { query: { status } } },
    {
      select: (res) => res.data.reports,
      refetchInterval: focused ? 30_000 : false,
    },
  );
};

export const useAdminReport = (id: string) =>
  $api.useQuery(
    "get",
    "/v1/admin/reports/{id}",
    { params: { path: { id } } },
    {
      enabled: !!id,
      select: (res) => res.data.report,
    },
  );

export const useResolveReport = () => {
  const queryClient = useQueryClient();
  const mutation = $api.useMutation("post", "/v1/admin/reports/{id}/resolve", {
    onSuccess: () => invalidateAreas(queryClient, "admin"), // the queue, the overview count, and the activity log
  });
  return (id: string, action: "DISMISS" | "RESOLVE" | "BAN", note?: string) =>
    mutation.mutateAsync({ params: { path: { id } }, body: { action, note } });
};
