import { useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { FilterChips } from "@/components/FilterChips";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ModerationCard } from "@/components/admin/ModerationCard";
import { ReasonPrompt } from "@/components/admin/ReasonPrompt";
import { ScreenHeader } from "@/components/ScreenHeader";
import SearchBar from "@/components/SearchBar";
import { SegmentedControl } from "@/components/SegmentedControl";
import { AsyncState } from "@/components/StateViews";
import type { ChipType } from "@/constants/filters";
import {
  useAdminActions,
  useAdminInventory,
  useAdminListings,
} from "@/hooks/useAdmin";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRunAction } from "@/hooks/useRunAction";
import type { AdminInventoryItem, AdminListing } from "@/types/admin";
import { adminListingBadges } from "@/utils/admin";
import { formatPrice } from "@/utils/listing";
import { EmptyState } from "@/components/EmptyState";

type Tab = "listings" | "inventory";
type Kind = "property" | "building" | "unit";
type LiveStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";
type Prompt =
  | { type: "takedown"; listing: AdminListing }
  | { type: "suspend"; item: AdminInventoryItem };

const STATUS_CHIPS: ChipType<LiveStatus>[] = [
  { label: "All", value: undefined },
  { label: "Live", value: "PUBLISHED" },
  { label: "Drafts", value: "DRAFT" },
  { label: "Removed", value: "ARCHIVED" },
];
const KIND_CHIPS: ChipType<Kind>[] = [
  { label: "Properties", value: "property" },
  { label: "Buildings", value: "building" },
  { label: "Units", value: "unit" },
];
const KIND_ICON = {
  property: "home-outline",
  building: "business-outline",
  unit: "layers-outline",
} as const;

const Moderation = () => {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("listings");
  const [text, setText] = useState("");
  const [listingStatus, setListingStatus] = useState<LiveStatus | undefined>();
  const [kind, setKind] = useState<Kind>("property");
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const q = useDebouncedValue(text.trim());

  const listings = useAdminListings(q, listingStatus, tab === "listings");
  const inventory = useAdminInventory(kind, q, tab === "inventory");
  const actions = useAdminActions();
  const { busy, run } = useRunAction();

  const confirmRestore = (l: AdminListing) =>
    Alert.alert(
      "Restore this listing?",
      `"${l.title}" goes back to the owner as a draft. They'll need to publish it again.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          onPress: () => run(() => actions.restoreListing(l.id)),
        },
      ],
    );

  const confirmReactivate = (i: AdminInventoryItem) =>
    Alert.alert(
      `Reactivate ${i.title}?`,
      "Its listings become visible to buyers again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reactivate",
          onPress: () =>
            run(() => actions.setInventoryStatus(i.kind, i.id, "ACTIVE")),
        },
      ],
    );

  const submitPrompt = async (reason: string) => {
    if (!prompt) return;
    const ok = await run(() =>
      prompt.type === "takedown"
        ? actions.takedownListing(prompt.listing.id, reason)
        : actions.setInventoryStatus(
            prompt.item.kind,
            prompt.item.id,
            "SUSPENDED",
            reason,
          ),
    );
    if (ok) setPrompt(null);
  };

  const listingAction = (l: AdminListing) => {
    if (l.status === "DRAFT" || l.status === "PUBLISHED") {
      return {
        label: "Take down",
        danger: true,
        onPress: () => setPrompt({ type: "takedown", listing: l }),
      };
    }
    if (l.status === "ARCHIVED" && l.removalReason)
      return { label: "Restore", onPress: () => confirmRestore(l) };
    return undefined; // sold or rented: there is a deal, so there's nothing to do here
  };

  return (
    <AdminOnly>
      <View className="flex-1">
        <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
          <ScreenHeader title="Moderation" />

          <View className="gap-3 px-5 pb-3">
            <SegmentedControl<Tab>
              options={[
                { label: "Listings", value: "listings" },
                { label: "Inventory", value: "inventory" },
              ]}
              value={tab}
              onChange={setTab}
            />
            <SearchBar
              value={text}
              onChangeText={setText}
              placeholder={
                tab === "listings"
                  ? "Search title, city, or owner email"
                  : "Search name, city, or owner email"
              }
            />
          </View>

          {tab === "listings" ? (
            <>
              <View className="pb-3">
                <FilterChips
                  chips={STATUS_CHIPS}
                  value={listingStatus}
                  onChange={setListingStatus}
                />
              </View>
              <AsyncState
                query={listings}
                errorFallback="Could not load listings."
              >
                <FlatList
                  data={listings.data}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <ModerationCard
                      title={item.title}
                      subtitle={[
                        `${formatPrice(item.price)}${item.listingType === "RENT" ? " / month" : ""}`,
                        item.city,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                      thumbnailUrl={item.thumbnailUrl}
                      icon="pricetag-outline"
                      badges={adminListingBadges(item)}
                      owner={`${item.owner.name} (${item.owner.email})`}
                      note={item.removalReason}
                      action={listingAction(item)}
                      onOpen={() =>
                        router.push({
                          pathname: "/listings/[id]",
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
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                  ListEmptyComponent={
                    <EmptyState
                      icon="pricetag-outline"
                      title="No listings found"
                    />
                  }
                />
              </AsyncState>
            </>
          ) : (
            <>
              <View className="pb-3">
                <FilterChips
                  chips={KIND_CHIPS}
                  value={kind}
                  onChange={(next) => next && setKind(next)}
                />
              </View>
              <AsyncState
                query={inventory}
                errorFallback="Could not load inventory."
              >
                <FlatList
                  data={inventory.data}
                  keyExtractor={(item) => `${item.kind}-${item.id}`}
                  renderItem={({ item }) => (
                    <ModerationCard
                      title={item.title}
                      subtitle={item.subtitle}
                      thumbnailUrl={item.thumbnailUrl}
                      icon={KIND_ICON[item.kind]}
                      badges={[
                        item.status === "ACTIVE"
                          ? { label: "Active", tone: "success" }
                          : { label: "Suspended", tone: "danger" },
                      ]}
                      owner={`${item.owner.name} (${item.owner.email})`}
                      note={item.statusReason}
                      action={
                        item.status === "ACTIVE"
                          ? {
                              label: "Suspend",
                              danger: true,
                              onPress: () =>
                                setPrompt({ type: "suspend", item }),
                            }
                          : {
                              label: "Reactivate",
                              onPress: () => confirmReactivate(item),
                            }
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
                    <EmptyState icon={KIND_ICON[kind]} title="Nothing found" />
                  }
                />
              </AsyncState>
            </>
          )}
        </SafeAreaView>

        {prompt && (
          <ReasonPrompt
            title={
              prompt.type === "takedown"
                ? `Remove "${prompt.listing.title}"?`
                : `Suspend ${prompt.item.title}?`
            }
            message={
              prompt.type === "takedown"
                ? "It disappears from search and the owner is told why."
                : "Its listings are hidden from buyers and the owner is told why."
            }
            confirmLabel={prompt.type === "takedown" ? "Remove" : "Suspend"}
            onConfirm={submitPrompt}
            onCancel={() => setPrompt(null)}
          />
        )}
        {busy && <LoadingOverlay fullScreen label="Saving..." />}
      </View>
    </AdminOnly>
  );
};

export default Moderation;
