import { View, Text, ActivityIndicator, FlatList } from "react-native";
import React from "react";
import { ListingSearch, useListings } from "@/hooks/useListings";
import { Button } from "../Button";
import { errorMessage } from "@/lib/errors";
import { ListingCard } from "./ListingCard";

const Feed = ({
  search,
  title,
  bottomInset = 40,
}: {
  search: ListingSearch;
  title?: string;
  bottomInset?: number;
}) => {
  const {
    data: listings,
    isLoading,
    isRefetching,
    isPlaceholderData,
    error,
    refetch,
  } = useListings(search);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#0061FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <Text className="text-center font-rubik text-base text-danger">
          {errorMessage(error, "Could not load listings.")}
        </Text>
        <Button
          label="Try again"
          onPress={refetch}
          className="rounded-full bg-primary-300 px-6 py-3"
          textClassName="font-rubik-medium text-white"
        />
      </View>
    );
  }

  return (
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
        <Text className="mt-10 text-center font-rubik text-black-200">
          {search.q
            ? `No listings match "${search.q}".`
            : "No listings yet. Check back soon."}
        </Text>
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

export default Feed;
