import { useState } from "react";
import { FlatList, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/Button";
import { FilterChips } from "@/components/FilterChips";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import { useInventory } from "@/hooks/useInventory";
import { usePullRefresh } from "@/hooks/usePullRefresh";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import {
  EMPTY_COPY,
  KIND_ICON,
  KIND_MODE,
  KIND_NOUN,
  KINDS,
  NEW_ROUTE,
  type Kind,
} from "@/utils/inventory";
import { EmptyState } from "@/components/EmptyState";

const Inventory = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const query = useInventory();
  const [kind, setKind] = useState<Kind>("PROPERTY");

  useRefetchOnFocus(query.refetch);
  const { refreshing, onRefresh } = usePullRefresh(query.refetch);

  const items = query.data ?? [];
  const chips = KINDS.map((k) => ({
    label: `${k.label} (${items.filter((i) => i.kind === k.value).length})`,
    value: k.value,
  }));
  const shown = items.filter((i) => i.kind === kind);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
      <ScreenHeader title="My inventory" />

      <View className="pb-3">
        <FilterChips
          chips={chips}
          value={kind}
          onChange={(next) => next && setKind(next)}
        />
      </View>

      <AsyncState query={query} errorFallback="Could not load your inventory.">
        <FlatList
          data={shown}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <InventoryCard
              item={item}
              onManagePhotos={() =>
                router.push({
                  pathname: "/photos",
                  params: { mode: KIND_MODE[item.kind], targetId: item.id },
                })
              }
              onUploadDocuments={() =>
                router.push({
                  pathname: "/documents",
                  params: { mode: KIND_MODE[item.kind], targetId: item.id },
                })
              }
              onCreateListing={() =>
                router.push({
                  pathname: "/new-listing",
                  params: { id: item.id },
                })
              }
              onAddRoom={() =>
                router.push({
                  pathname: "/room/new",
                  params: { unitId: item.id },
                })
              }
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 16,
            flexGrow: 1,
          }}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <EmptyState icon={KIND_ICON[kind]} {...EMPTY_COPY[kind]} />
          }
        />
      </AsyncState>

      <View
        className="border-t border-primary-200 bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          label={`Add ${KIND_NOUN[kind]}`}
          onPress={() => router.push(NEW_ROUTE[kind])}
          className="rounded-full bg-primary-300 py-4"
          textClassName="font-rubik-semibold text-white"
        />
      </View>
    </SafeAreaView>
  );
};

export default Inventory;
