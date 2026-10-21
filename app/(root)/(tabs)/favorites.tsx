import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, ActivityIndicator, FlatList } from "react-native";
import { useFavoriteListings } from "@/hooks/useFavorite";
import { errorMessage } from "@/lib/errors";
import { Button } from "@/components/Button";
import { ListingCard } from "@/components/listings/ListingCard";
import { useTabBarInset } from "@/hooks/useTabBarInset";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const Favorites = () => {
  const inset = useTabBarInset();
  const router = useRouter();
  const {
    data: listings,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useFavoriteListings();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#0061FF" />
      </View>
    );
  }

  const Empty = () => (
    <View className="items-center justify-center">
      <Ionicons name="heart-outline" size={40} color="#8C8E98" />
      <Text className="font-rubik-semibold text-lg text-black-300">
        No favorites yet
      </Text>
      <Text className="text-center font-rubik text-black-200">
        Tap the heart on a listing to save it here.
      </Text>
      <Button
        label="Explore listings"
        onPress={() => router.navigate("/explore")}
        className="mt-2 rounded-full bg-primary-300 px-6 py-3"
        textClassName="font-rubik-medium text-white"
      />
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
      <Text className="px-5 pb-3 pt-3 font-rubik-bold text-2xl text-black-300">
        Favorites
      </Text>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0061FF" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center font-rubik text-base text-danger">
            {errorMessage(error, "Could not load your favorites.")}
          </Text>
          <Button
            label="Try again"
            onPress={refetch}
            className="rounded-full bg-primary-300 px-6 py-3"
            textClassName="font-rubik-medium text-white"
          />
        </View>
      ) : (
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
              <Empty />
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Favorites;
