import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useIsAdmin } from "@/hooks/useAdmin";
import { EmptyState } from "../EmptyState";

export const AdminOnly = ({ children }: { children: ReactNode }) => {
  const { isAdmin, isLoading } = useIsAdmin();

  if (isLoading) return <LoadingOverlay fullScreen />;
  if (!isAdmin) {
    return (
      <SafeAreaView className="flex-1 bg-accent-100">
        <ScreenHeader title="Admin" />
        <EmptyState
          icon="lock-closed-outline"
          title="Admins only"
          message="You don't have access to this area."
        />
      </SafeAreaView>
    );
  }
  return <>{children}</>;
};
