import { Text, FlatList } from "react-native";
import { ListingSearch, useListings } from "@/hooks/useListings";
import { ListingCard } from "./ListingCard";
import { AsyncState } from "../StateViews";
import { EmptyState } from "../EmptyState";

const Feed = ({
  search,
  title,
  bottomInset = 40,
  emptyAction,
}: {
  search: ListingSearch;
  title?: string;
  bottomInset?: number;
  emptyAction?: { label: string; onPress: () => void };
}) => {
  const query = useListings(search);
  const { data: listings, isRefetching, isPlaceholderData, refetch } = query;

  return (
    <AsyncState query={query}>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: bottomInset,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshing={isRefetching && !isPlaceholderData}
        onRefresh={refetch}
        style={{ opacity: isPlaceholderData ? 0.5 : 1 }}
        ListHeaderComponent={
          title ? (
            <Text className="mb-4 mt-2 font-rubik-bold text-xl text-black-300">
              {title}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={search.near ? "navigate-outline" : "search-outline"}
            title={
              search.near
                ? `Nothing within ${search.near.radiusKm} km`
                : search.q
                  ? `No listings match "${search.q}"`
                  : "No listings yet"
            }
            message={
              search.near
                ? "Try a wider radius, or turn off Near me to browse everywhere."
                : search.q
                  ? "Try a different search or clear the filters."
                  : "Check back soon."
            }
            action={emptyAction}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </AsyncState>
  );
};

export default Feed;
