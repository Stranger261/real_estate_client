import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HomeHeader } from "@/components/listings/HomeHeader";
import { View, Pressable, Text } from "react-native";
import SearchBar from "@/components/SearchBar";
import Feed from "@/components/listings/Feed";
import { useTabBarInset } from "@/hooks/useTabBarInset";
import { useExploreStore } from "@/stores/exploreStore";
import { Ionicons } from "@expo/vector-icons";
import { pill } from "@/components/location/NearMeBar";

const TabHome = () => {
  const router = useRouter();
  const inset = useTabBarInset();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
      <HomeHeader />

      <View className="gap-3 px-5 pb-3">
        <SearchBar
          onPress={() => {
            useExploreStore.getState().requestSearchFocus();
            router.navigate("/explore");
          }}
        />
        <View className="flex-row gap-3 flex-wrap">
          <Pressable
            onPress={() => {
              useExploreStore.getState().requestNearMe();
              router.navigate("/explore");
            }}
            className="flex-row items-center gap-2 self-start rounded-full border border-primary-200 bg-white px-4 py-2"
          >
            <Ionicons name="navigate-outline" size={16} color="#666876" />
            <Text className="font-rubik-medium text-sm text-black-200">
              Listings near me
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/map")}
            className={pill(false)}
          >
            <Ionicons name="map-outline" size={16} color="#666876" />
            <Text className="font-rubik-medium text-sm text-black-200">
              Map
            </Text>
          </Pressable>
        </View>
      </View>
      <Feed search={{}} title="Latest listings" bottomInset={inset} />
    </SafeAreaView>
  );
};

export default TabHome;
