import { refreshAccessToken } from "@/lib/api";
import { invalidateAreas } from "@/lib/invalidate";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { NotificationItem } from "@/types/notification";
import { areasFor } from "@/utils/notification";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState } from "react-native";

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

      if (!firstConnect) {
        invalidateAreas(
          queryClient,
          "notifications",
          "transactions",
          "listings",
          "me",
          "properties",
        );
      }
      firstConnect = false;
    };

    const onNotification = (n: NotificationItem) => {
      invalidateAreas(queryClient, "notifications", ...areasFor(n.type));
      useToastStore.getState().show(n);
    };

    const onConnectError = async (err: Error) => {
      if (err.message !== "UNAUTHORIZED" || triedRefresh) return;
      triedRefresh = true;
      if (await refreshAccessToken()) socket.connect();
    };

    socket.on("connect", onConnect);
    socket.on("notification", onNotification);
    socket.on("connect_error", onConnectError);

    if (AppState.currentState === "active") socket.connect();
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") socket.connect();
      else socket.disconnect();
    });

    return () => {
      appState.remove();
      socket.off("connect");
      socket.off("notification");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, [status, queryClient]);
};
