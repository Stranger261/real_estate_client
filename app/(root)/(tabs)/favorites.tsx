import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, FlatList } from "react-native";
import { useFavoriteListings } from "@/hooks/useFavorite";
import { ListingCard } from "@/components/listings/ListingCard";
import { useTabBarInset } from "@/hooks/useTabBarInset";
import { useRouter } from "expo-router";
import { AsyncState } from "@/components/StateViews";
import { EmptyState } from "@/components/EmptyState";

const Favorites = () => {
  const inset = useTabBarInset();
  const router = useRouter();
  const query = useFavoriteListings();
  const { data: listings, isRefetching, refetch } = query;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
      <Text className="px-5 pb-3 pt-3 font-rubik-bold text-2xl text-black-300">
        Favorites
      </Text>

      <AsyncState query={query} errorFallback="Could not load your favorites.">
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListingCard listing={item} />}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: inset,
            flexGrow: 1,
          }}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center gap-3 px-6">
              <EmptyState
                icon="heart-outline"
                title="No favorites yet"
                message="Tap the heart on a listing to save it here."
                action={{
                  label: "Explore listings",
                  onPress: () => router.navigate("/explore"),
                }}
              />
            </View>
          }
        />
      </AsyncState>
    </SafeAreaView>
  );
};

export default Favorites;
