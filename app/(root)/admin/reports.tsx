import { useState } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { FilterChips } from "@/components/FilterChips";
import { ReportCard } from "@/components/admin/ReportCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import type { ChipType } from "@/constants/filters";
import { usePullRefresh } from "@/hooks/usePullRefresh";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import { useAdminReports } from "@/hooks/useReports";
import { EmptyState } from "@/components/EmptyState";

type Status = "OPEN" | "RESOLVED" | "DISMISSED";
const CHIPS: ChipType<Status>[] = [
  { label: "Open", value: "OPEN" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Dismissed", value: "DISMISSED" },
];

export default function Reports() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("OPEN");
  const query = useAdminReports(status);

  useRefetchOnFocus(query.refetch);
  const { refreshing, onRefresh } = usePullRefresh(query.refetch);

  return (
    <AdminOnly>
      <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
        <ScreenHeader title="Reports" />
        <View className="pb-3">
          <FilterChips
            chips={CHIPS}
            value={status}
            onChange={(v) => v && setStatus(v)}
          />
        </View>

        <AsyncState query={query} errorFallback="Could not load reports.">
          <FlatList
            data={query.data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ReportCard
                report={item}
                onPress={() =>
                  router.push({
                    pathname: "/admin/report/[id]",
                    params: { id: item.id },
                  })
                }
              />
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
                icon="flag-outline"
                title={status === "OPEN" ? "No open reports" : "Nothing here"}
                message={
                  status === "OPEN"
                    ? "New reports show up here and in a notification."
                    : undefined
                }
              />
            }
          />
        </AsyncState>
      </SafeAreaView>
    </AdminOnly>
  );
}
