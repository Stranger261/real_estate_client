import { useEffect } from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { refreshAccessToken } from "@/lib/api";
import { invalidateAreas } from "@/lib/invalidate";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useToastStore } from "@/stores/toastStore";
import type { NotificationItem } from "@/types/notification";
import { areasFor, iconFor, routeFor } from "@/utils/notification";

type IncomingMessage = {
  conversationId: string;
  senderName: string;
  preview: string;
};

export const useRealTime = () => {
  const queryClient = useQueryClient();
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status !== "authenticated") return;

    const socket = getSocket();
    let firstConnect = true;
    let triedRefresh = false;

    const onConnect = () => {
      triedRefresh = false;
      // anything could have happened while we were away, so refresh everything on RE-connects
      if (!firstConnect) {
        invalidateAreas(
          queryClient,
          "notifications",
          "transactions",
          "listings",
          "me",
          "inventory",
          "conversations",
        );
      }
      firstConnect = false;
    };

    const onNotification = (n: NotificationItem) => {
      invalidateAreas(queryClient, "notifications", ...areasFor(n.type));
      useToastStore.getState().show({
        id: n.id,
        title: n.title,
        body: n.body,
        icon: iconFor(n.type),
        href: routeFor(n),
        notificationId: n.id,
      });
    };

    const onMessage = (m: IncomingMessage) => {
      invalidateAreas(queryClient, "conversations");
      if (useChatStore.getState().activeId === m.conversationId) return; // you're reading it right now
      useToastStore.getState().show({
        id: `msg-${m.conversationId}-${Date.now()}`,
        title: m.senderName,
        body: m.preview,
        icon: "chatbubble-ellipses-outline",
        href: { pathname: "/chat/[id]", params: { id: m.conversationId } },
      });
    };

    const onConversationChanged = () =>
      invalidateAreas(queryClient, "conversations");

    const onConnectError = async (err: Error) => {
      // the access token expired while we were away: refresh it once, then try again
      if (err.message !== "UNAUTHORIZED" || triedRefresh) return;
      triedRefresh = true;
      if (await refreshAccessToken()) socket.connect();
    };

    socket.on("connect", onConnect);
    socket.on("notification", onNotification);
    socket.on("message:new", onMessage);
    socket.on("conversation:updated", onConversationChanged);
    socket.on("conversation:read", onConversationChanged);
    socket.on("connect_error", onConnectError);

    if (AppState.currentState === "active") socket.connect();
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") socket.connect();
      else socket.disconnect();
    });

    return () => {
      appState.remove();
      socket.off("connect", onConnect);
      socket.off("notification", onNotification);
      socket.off("message:new", onMessage);
      socket.off("conversation:updated", onConversationChanged);
      socket.off("conversation:read", onConversationChanged);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [status, queryClient]);
};
