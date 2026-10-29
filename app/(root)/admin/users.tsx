import { useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { FilterChips } from "@/components/FilterChips";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ScreenHeader } from "@/components/ScreenHeader";
import SearchBar from "@/components/SearchBar";
import { AsyncState } from "@/components/StateViews";
import { TypeToConfirm } from "@/components/TypeToConfirm";
import type { ChipType } from "@/constants/filters";
import { useAdminActions, useAdminUsers } from "@/hooks/useAdmin";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMe } from "@/hooks/useMe";
import { useRunAction } from "@/hooks/useRunAction";
import type { AdminUser } from "@/types/admin";
import { EmptyState } from "@/components/EmptyState";
import { UserRow } from "@/components/admin/UserRow";

type Filter = "admins" | "banned";
type Prompt = { type: "grant" | "revoke"; user: AdminUser };

const FILTERS: ChipType<Filter>[] = [
  { label: "All", value: undefined },
  { label: "Admins", value: "admins" },
  { label: "Banned", value: "banned" },
];

const Users = () => {
  const { data: me } = useMe();
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<Filter | undefined>();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const q = useDebouncedValue(text.trim());
  const query = useAdminUsers(q, filter);
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

  const submitPrompt = async () => {
    if (!prompt) return;
    const ok = await run(() =>
      actions.setAdminRole(prompt.user.id, prompt.type === "grant"),
    );
    if (ok) setPrompt(null);
  };

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
          <View className="pb-3">
            <FilterChips chips={FILTERS} value={filter} onChange={setFilter} />
          </View>

          <AsyncState query={query} errorFallback="Could not load users.">
            <FlatList
              data={query.data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <UserRow
                  user={item}
                  isSelf={item.id === me?.id}
                  onBan={() => confirmBan(item)}
                  onReactivate={() => confirmReactivate(item)}
                  onMakeAdmin={() => setPrompt({ type: "grant", user: item })}
                  onRemoveAdmin={() =>
                    setPrompt({ type: "revoke", user: item })
                  }
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

        {prompt && (
          <TypeToConfirm
            title={
              prompt.type === "grant"
                ? `Make ${prompt.user.name} an admin?`
                : `Remove ${prompt.user.name} as an admin?`
            }
            message={
              prompt.type === "grant"
                ? "Admins can approve sellers, verify documents, remove listings, ban users, and add other admins. Every admin is told."
                : "They lose admin access immediately. They keep their normal account."
            }
            expected={prompt.user.email}
            confirmLabel={
              prompt.type === "grant" ? "Make admin" : "Remove admin"
            }
            danger={prompt.type === "revoke"}
            onConfirm={submitPrompt}
            onCancel={() => setPrompt(null)}
          />
        )}
        {busy && <LoadingOverlay blocking label="Saving..." />}
      </View>
    </AdminOnly>
  );
};

export default Users;
