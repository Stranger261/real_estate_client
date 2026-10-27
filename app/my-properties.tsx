import { FlatList, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/Button";
import { PropertyCard } from "@/components/PropertyCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import { useMyProperties } from "@/hooks/useProperties";
import { EmptyState } from "@/components/EmptyState";

const MyProperties = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const query = useMyProperties();
  const { data: properties, isRefetching, refetch } = query;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
      <ScreenHeader title="My properties" />

      <AsyncState query={query} errorFallback="Could not load your properties.">
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onUploadDocuments={() =>
                router.push({
                  pathname: "/property/[propertyId]/documents",
                  params: { propertyId: item.id },
                })
              }
              onCreateListing={() =>
                router.push({
                  pathname: "/new-listing",
                  params: { propertyId: item.id },
                })
              }
              onManagePhotos={() =>
                router.push({
                  pathname: "/photos",
                  params: { mode: "property", targetId: item.id },
                })
              }
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 16,
            flexGrow: 1,
          }}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <EmptyState
              icon="home-outline"
              title="No properties yet"
              message="Add a house, townhouse, land, or commercial space that you own."
            />
          }
        />
      </AsyncState>

      <View
        className="border-t border-primary-200 bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          label="Add property"
          onPress={() => router.push("/property/new")}
          className="rounded-full bg-primary-300 py-4"
          textClassName="font-rubik-semibold text-white"
        />
      </View>
    </SafeAreaView>
  );
};

export default MyProperties;
