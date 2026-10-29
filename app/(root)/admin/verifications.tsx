import { useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ReasonPrompt } from "@/components/admin/ReasonPrompt";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import { useAdminActions, useVerifications } from "@/hooks/useAdmin";
import { usePullRefresh } from "@/hooks/usePullRefresh";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import { useRunAction } from "@/hooks/useRunAction";
import type { VerificationItem } from "@/types/admin";
import { EmptyState } from "@/components/EmptyState";
import { VerificationCard } from "@/components/admin/VerificationCard";

const Verifications = () => {
  const query = useVerifications();
  const actions = useAdminActions();
  const { busy, run } = useRunAction();
  const [rejecting, setRejecting] = useState<VerificationItem | null>(null);

  useRefetchOnFocus(query.refetch);
  const { refreshing, onRefresh } = usePullRefresh(query.refetch);

  const confirmApprove = (item: VerificationItem) =>
    Alert.alert(
      "Mark as verified?",
      `${item.title} will be allowed to be listed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Verify",
          onPress: () =>
            run(() =>
              actions.decideVerification(item.kind, item.id, "VERIFIED"),
            ),
        },
      ],
    );

  const submitReject = async (reason: string) => {
    if (!rejecting) return;
    const ok = await run(() =>
      actions.decideVerification(
        rejecting.kind,
        rejecting.id,
        "REJECTED",
        reason,
      ),
    );
    if (ok) setRejecting(null);
  };

  return (
    <AdminOnly>
      <View className="flex-1">
        <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
          <ScreenHeader title="Verifications" />

          <AsyncState query={query} errorFallback="Could not load the queue.">
            <FlatList
              data={query.data}
              keyExtractor={(item) => `${item.kind}-${item.id}`}
              renderItem={({ item }) => (
                <VerificationCard
                  item={item}
                  onApprove={() => confirmApprove(item)}
                  onReject={() => setRejecting(item)}
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
                  icon="shield-checkmark-outline"
                  title="Queue is empty"
                  message="No documents are waiting for review."
                />
              }
            />
          </AsyncState>
        </SafeAreaView>

        {rejecting && (
          <ReasonPrompt
            title={`Reject ${rejecting.title}?`}
            message="Explain what's wrong so the owner can upload better documents."
            confirmLabel="Reject"
            onConfirm={submitReject}
            onCancel={() => setRejecting(null)}
          />
        )}
        {busy && <LoadingOverlay blocking label="Saving decision..." />}
      </View>
    </AdminOnly>
  );
};

export default Verifications;
