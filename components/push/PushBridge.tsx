import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { registerForPush } from "@/lib/push";
import { useAuthStore } from "@/stores/authStore";
import { usePushStore } from "@/stores/pushStore";
import type { NotificationItem } from "@/types/notification";
import { routeFor } from "@/utils/notification";

export const PushBridge = () => {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  // Keep this phone's token fresh: it can change, and the server forgets dead ones
  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      await usePushStore.getState().refresh();
      const { permission, enabled } = usePushStore.getState();
      if (permission === "granted" && enabled)
        await registerForPush({ ask: false });
    })();
  }, [status]);

  // A tap on a push opens the right screen, including when the tap is what launched the app
  useEffect(() => {
    if (!response || status !== "authenticated") return;
    const id = response.notification.request.identifier;
    if (handled.current === id) return;
    handled.current = id;

    const data = response.notification.request.content.data as
      Record<string, string> | undefined;
    if (!data) return;

    if (data.kind === "message" && data.conversationId) {
      router.push({
        pathname: "/chat/[id]",
        params: { id: data.conversationId },
      });
    } else if (data.kind === "notification" && data.type) {
      router.push(
        routeFor({ type: data.type as NotificationItem["type"], data }),
      );
    }
  }, [response, status, router]);

  return null;
};
