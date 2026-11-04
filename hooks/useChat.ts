import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { invalidateAreas } from "@/lib/invalidate";
import { $api } from "@/lib/query";
import { useAuthStore } from "@/stores/authStore";

export const useConversations = () =>
  $api.useQuery(
    "get",
    "/v1/conversations",
    {},
    { select: (res) => res.data.conversations },
  );

export const useUnreadMessages = () => {
  const status = useAuthStore((s) => s.status);
  return $api.useQuery(
    "get",
    "/v1/conversations/unread",
    {},
    {
      enabled: status === "authenticated",
      select: (res) => res.data.count,
    },
  );
};

export const useListingConversation = (listingId: string, enabled: boolean) =>
  $api.useQuery(
    "get",
    "/v1/conversations/by-listing/{listingId}",
    { params: { path: { listingId } } },
    {
      enabled: enabled && !!listingId,
      select: (res) => res.data.conversationId,
    },
  );

export const useConversation = (id: string, limit: number) =>
  $api.useQuery(
    "get",
    "/v1/conversations/{id}",
    { params: { path: { id }, query: { limit } } },
    {
      enabled: !!id,
      select: (res) => res.data,
      placeholderData: keepPreviousData,
    },
  );

export const useChatActions = () => {
  const queryClient = useQueryClient();
  // returning the promise keeps each mutation pending until the lists have refetched
  const refresh = () => invalidateAreas(queryClient, "conversations");

  const start = $api.useMutation("post", "/v1/conversations", {
    onSuccess: refresh,
  });
  const send = $api.useMutation("post", "/v1/conversations/{id}/messages", {
    onSuccess: refresh,
  });
  const read = $api.useMutation("post", "/v1/conversations/{id}/read", {
    onSuccess: refresh,
  });
  const block = $api.useMutation("post", "/v1/blocks/{userId}", {
    onSuccess: refresh,
  });
  const unblock = $api.useMutation("delete", "/v1/blocks/{userId}", {
    onSuccess: refresh,
  });

  return {
    start: (listingId: string, text: string, clientId: string) =>
      start.mutateAsync({ body: { listingId, text, clientId } }),
    send: (id: string, text: string, clientId: string) =>
      send.mutateAsync({ params: { path: { id } }, body: { text, clientId } }),
    markRead: (id: string) => read.mutate({ params: { path: { id } } }),
    block: (userId: string) =>
      block.mutateAsync({ params: { path: { userId } } }),
    unblock: (userId: string) =>
      unblock.mutateAsync({ params: { path: { userId } } }),
  };
};
