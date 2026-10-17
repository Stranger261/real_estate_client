import { Button } from "@/components/Button";
import { HomeHeader } from "@/components/HomeHeader";
import { ListingCard } from "@/components/ListingCard";
import { errorMessage } from "@/lib/errors";
import { $api } from "@/lib/query";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const {
    data: listings,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = $api.useQuery(
    "get",
    "/v1/listings",
    {
      params: { query: { pageSize: 20 } },
    },
    { select: (res) => res.data.listings },
  );

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <HomeHeader />
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0061FF" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center font-rubik text-base text-danger">
            {errorMessage(error, "Could not load listings.")}
          </Text>
          <Button
            textClassName="font-rubik-medium text-white"
            className="rounded-full bg-primary-300 px-10 py-3"
            label="Try again"
            onPress={refetch}
          />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListingCard listing={item} />}
          contentContainerClassName="px-5 pb-10"
          refreshing={isRefetching}
          onRefresh={refetch}
          ListHeaderComponent={
            <Text className="mb-4 mt-2 font-rubik-bold text-xl text-black-300">
              Latest listings
            </Text>
          }
          ListEmptyComponent={
            <Text className="mt-10 text-center font-rubik text-black-200">
              No listings yet. Check back soon.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
