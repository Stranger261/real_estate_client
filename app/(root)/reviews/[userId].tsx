import { useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Button } from "@/components/Button";
import { RatingSummary } from "@/components/review/RatingSummary";
import { ReviewCard } from "@/components/review/ReviewCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import { usePullRefresh } from "@/hooks/usePullRefresh";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import { useSellerReviews } from "@/hooks/useReviews";
import { EmptyState } from "@/components/EmptyState";

const PAGE = 20;

export default function SellerReviews() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [limit, setLimit] = useState(PAGE);
  const query = useSellerReviews(userId, limit);
  const data = query.data;

  useRefetchOnFocus(query.refetch);
  const { refreshing, onRefresh } = usePullRefresh(query.refetch);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
      <ScreenHeader title="Reviews" />

      <AsyncState query={query} errorFallback="Could not load these reviews.">
        <FlatList
          data={data?.reviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReviewCard review={item} />}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 24,
            flexGrow: 1,
          }}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            data ? (
              <View className="mb-4 gap-4">
                <View className="flex-row items-center gap-3">
                  {data.seller.avatarUrl ? (
                    <Image
                      source={{ uri: data.seller.avatarUrl }}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-200">
                      <Text className="font-rubik-bold text-lg text-primary-300">
                        {data.seller.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text className="flex-1 font-rubik-semibold text-lg text-black-300">
                    {data.seller.name}
                  </Text>
                </View>
                <RatingSummary summary={data.summary} />
              </View>
            ) : null
          }
          ListFooterComponent={
            data && data.summary.count > data.reviews.length ? (
              <Button
                label="Show more"
                onPress={() => setLimit((l) => l + PAGE)}
                className="mt-2 rounded-full border border-primary-300 py-3"
                textClassName="font-rubik-semibold text-sm text-primary-300"
              />
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="star-outline"
              title="No reviews yet"
              message="Reviews appear here after a buyer completes a deal with this seller."
            />
          }
        />
      </AsyncState>
    </SafeAreaView>
  );
}
