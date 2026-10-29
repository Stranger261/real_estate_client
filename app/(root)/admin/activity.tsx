import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import { useAdminActivity } from "@/hooks/useAdmin";
import { usePullRefresh } from "@/hooks/usePullRefresh";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import { timeAgo } from "@/utils/date";
import { actionIcon } from "@/utils/admin";
import { EmptyState } from "@/components/EmptyState";

const Activity = () => {
  const query = useAdminActivity();
  useRefetchOnFocus(query.refetch);
  const { refreshing, onRefresh } = usePullRefresh(query.refetch);

  return (
    <AdminOnly>
      <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
        <ScreenHeader title="Activity log" />

        <AsyncState
          query={query}
          errorFallback="Could not load the activity log."
        >
          <FlatList
            data={query.data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="mb-3 flex-row gap-3 rounded-2xl bg-white p-4">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                  <Ionicons
                    name={actionIcon(item.action)}
                    size={20}
                    color="#0061FF"
                  />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="font-rubik-medium text-sm text-black-300">
                    {item.summary}
                  </Text>
                  {!!item.reason && (
                    <Text className="font-rubik text-xs text-black-200">
                      Reason: {item.reason}
                    </Text>
                  )}
                  <Text className="mt-1 font-rubik text-xs text-black-100">
                    {item.adminName} · {timeAgo(item.createdAt)}
                  </Text>
                </View>
              </View>
            )}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 24,
              flexGrow: 1,
            }}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <EmptyState
                icon="time-outline"
                title="No activity yet"
                message="Admin decisions are recorded here."
              />
            }
          />
        </AsyncState>
      </SafeAreaView>
    </AdminOnly>
  );
};

export default Activity;
