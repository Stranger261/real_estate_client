import { Alert, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import { useAdminActions, useSellerApplications } from "@/hooks/useAdmin";
import { usePullRefresh } from "@/hooks/usePullRefresh";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import { useRunAction } from "@/hooks/useRunAction";
import type { SellerApplication } from "@/types/admin";
import { EmptyState } from "@/components/EmptyState";
import { ApplicationCard } from "@/components/admin/ApplicationCard";

const SellerApplications = () => {
  const query = useSellerApplications();
  const actions = useAdminActions();
  const { busy, run } = useRunAction();

  useRefetchOnFocus(query.refetch);
  const { refreshing, onRefresh } = usePullRefresh(query.refetch);

  const decide = (a: SellerApplication, decision: "APPROVED" | "REJECTED") =>
    Alert.alert(
      decision === "APPROVED"
        ? "Approve this seller?"
        : "Reject this application?",
      `${a.applicant.name} (${a.applicant.email})`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: decision === "APPROVED" ? "Approve" : "Reject",
          style: decision === "APPROVED" ? "default" : "destructive",
          onPress: () => run(() => actions.reviewApplication(a.id, decision)),
        },
      ],
    );

  return (
    <AdminOnly>
      <View className="flex-1">
        <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
          <ScreenHeader title="Seller applications" />

          <AsyncState
            query={query}
            errorFallback="Could not load applications."
          >
            <FlatList
              data={query.data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ApplicationCard
                  application={item}
                  onApprove={() => decide(item, "APPROVED")}
                  onReject={() => decide(item, "REJECTED")}
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
                  icon="checkmark-done-outline"
                  title="All caught up"
                  message="No applications are waiting."
                />
              }
            />
          </AsyncState>
        </SafeAreaView>

        {busy && <LoadingOverlay blocking label="Saving decision..." />}
      </View>
    </AdminOnly>
  );
};

export default SellerApplications;
