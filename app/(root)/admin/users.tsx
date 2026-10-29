import { useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ScreenHeader } from "@/components/ScreenHeader";
import SearchBar from "@/components/SearchBar";
import { AsyncState } from "@/components/StateViews";
import { useAdminActions, useAdminUsers } from "@/hooks/useAdmin";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMe } from "@/hooks/useMe";
import { useRunAction } from "@/hooks/useRunAction";
import type { AdminUser } from "@/types/admin";
import { EmptyState } from "@/components/EmptyState";
import { UserRow } from "@/components/admin/UserRow";

const Users = () => {
  const { data: me } = useMe();
  const [text, setText] = useState("");
  const q = useDebouncedValue(text.trim());
  const query = useAdminUsers(q);
  const actions = useAdminActions();
  const { busy, run } = useRunAction();

  const confirmBan = (u: AdminUser) =>
    Alert.alert(
      `Ban ${u.name}?`,
      "They are signed out right away and can't log in until you reactivate them.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Ban",
          style: "destructive",
          onPress: () => run(() => actions.setUserStatus(u.id, "BANNED")),
        },
      ],
    );

  const confirmReactivate = (u: AdminUser) =>
    Alert.alert(`Reactivate ${u.name}?`, "They will be able to log in again.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reactivate",
        onPress: () => run(() => actions.setUserStatus(u.id, "ACTIVE")),
      },
    ]);

  return (
    <AdminOnly>
      <View className="flex-1">
        <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
          <ScreenHeader title="Users" />
          <View className="px-5 pb-3">
            <SearchBar
              value={text}
              onChangeText={setText}
              placeholder="Search by name or email"
            />
          </View>

          <AsyncState query={query} errorFallback="Could not load users.">
            <FlatList
              data={query.data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <UserRow
                  user={item}
                  canAct={!item.isAdmin && item.id !== me?.id} // the server enforces this too
                  onBan={() => confirmBan(item)}
                  onReactivate={() => confirmReactivate(item)}
                />
              )}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 24,
                flexGrow: 1,
              }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              ListEmptyComponent={
                <EmptyState
                  icon="people-outline"
                  title="No users found"
                  message={q ? `Nothing matches "${q}".` : undefined}
                />
              }
            />
          </AsyncState>
        </SafeAreaView>

        {busy && <LoadingOverlay blocking label="Updating user..." />}
      </View>
    </AdminOnly>
  );
};

export default Users;
