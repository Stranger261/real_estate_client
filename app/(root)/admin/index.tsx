import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatCard } from "@/components/StatCard";
import { AsyncState } from "@/components/StateViews";
import { useAdminOverview } from "@/hooks/useAdmin";
import { usePullRefresh } from "@/hooks/usePullRefresh";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import { SettingsRow } from "@/components/SettingsRow";

const AdminHome = () => {
  const router = useRouter();
  const query = useAdminOverview();
  const o = query.data; // may be undefined while loading, so the JSX uses `?.`

  useRefetchOnFocus(query.refetch);
  const { refreshing, onRefresh } = usePullRefresh(query.refetch);

  return (
    <AdminOnly>
      <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
        <ScreenHeader title="Admin" />

        <AsyncState query={query} errorFallback="Could not load the overview.">
          <ScrollView
            contentContainerStyle={{ padding: 20, gap: 16 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View className="overflow-hidden rounded-2xl bg-white">
              <SettingsRow
                icon="construct-outline"
                label="Moderation"
                onPress={() => router.push("/admin/moderation")}
              />
              <SettingsRow
                icon="time-outline"
                label="Activity log"
                onPress={() => router.push("/admin/activity")}
              />
            </View>

            <View className="flex-row flex-wrap gap-3">
              <StatCard
                icon="storefront-outline"
                label="Seller applications"
                value={o?.pendingApplications ?? 0}
                highlight={(o?.pendingApplications ?? 0) > 0}
                onPress={() => router.push("/admin/seller-applications")}
              />
              <StatCard
                icon="shield-checkmark-outline"
                label="Verifications to review"
                value={o?.pendingVerifications ?? 0}
                highlight={(o?.pendingVerifications ?? 0) > 0}
                onPress={() => router.push("/admin/verifications")}
              />
              <StatCard
                icon="people-outline"
                label="Active sellers"
                value={o?.activeSellers ?? 0}
              />
              <StatCard
                icon="person-outline"
                label="Users"
                value={o?.totalUsers ?? 0}
                onPress={() => router.push("/admin/users")}
              />
            </View>

            {(o?.bannedUsers ?? 0) > 0 && (
              <Text className="font-rubik text-sm text-black-200">
                {o?.bannedUsers} banned users
              </Text>
            )}
          </ScrollView>
        </AsyncState>
      </SafeAreaView>
    </AdminOnly>
  );
};

export default AdminHome;
