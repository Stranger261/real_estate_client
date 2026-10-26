// app/notifications.tsx
import { FlatList, Pressable, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import {
  useNotificationActions,
  useNotifications,
} from "@/hooks/useNotifications";
import { usePullRefresh } from "@/hooks/usePullRefresh";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import type { NotificationItem } from "@/types/notification";
import { timeAgo } from "@/utils/date";
import { iconFor, routeFor } from "@/utils/notification";
import { EmptyState } from "@/components/EmptyState";

function Notifications() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const query = useNotifications();
  const { markRead, markAllRead } = useNotificationActions();
  useRefetchOnFocus(query.refetch);
  const { refreshing, onRefresh } = usePullRefresh(query.refetch);

  const unread = query.data?.unreadCount ?? 0;

  const open = (n: NotificationItem) => {
    if (!n.readAt) markRead(n.id);
    router.push(routeFor(n));
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
      <ScreenHeader title="Notifications" />

      {unread > 0 && (
        <Pressable onPress={markAllRead} className="self-end px-5 pb-2">
          <Text className="font-rubik-medium text-sm text-primary-300">
            Mark all as read
          </Text>
        </Pressable>
      )}

      <AsyncState
        query={query}
        errorFallback="Could not load your notifications."
      >
        <FlatList
          data={query.data?.notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => open(item)}
              className={`mb-3 flex-row gap-3 rounded-2xl p-4 ${item.readAt ? "bg-white" : "bg-primary-100"}`}
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
                <Ionicons name={iconFor(item.type)} size={20} color="#0061FF" />
              </View>
              <View className="flex-1 gap-0.5">
                <Text
                  className={`text-base text-black-300 ${item.readAt ? "font-rubik-medium" : "font-rubik-semibold"}`}
                >
                  {item.title}
                </Text>
                <Text className="font-rubik text-sm text-black-200">
                  {item.body}
                </Text>
                <Text className="mt-1 font-rubik text-xs text-black-100">
                  {timeAgo(item.createdAt)}
                </Text>
              </View>
              {!item.readAt && (
                <View className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-300" />
              )}
            </Pressable>
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 16,
            flexGrow: 1,
          }}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-outline"
              title="Nothing yet"
              message="Updates about your offers and listings show up here."
            />
          }
        />
      </AsyncState>
    </SafeAreaView>
  );
}

export default Notifications;
