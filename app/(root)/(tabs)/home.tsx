import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HomeHeader } from "@/components/listings/HomeHeader";
import { View } from "react-native";
import SearchBar from "@/components/SearchBar";
import Feed from "@/components/listings/Feed";
import { useTabBarInset } from "@/hooks/useTabBarInset";
import { useExploreStore } from "@/stores/exploreStore";

const TabHome = () => {
  const router = useRouter();
  const inset = useTabBarInset();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
      <HomeHeader />
      <View className="px-5 pb-3">
        <SearchBar
          onPress={() => {
            useExploreStore.getState().requestSearchFocus();
            router.navigate("/explore");
          }}
        />
      </View>
      <Feed search={{}} title="Latest listings" bottomInset={inset} />
    </SafeAreaView>
  );
};

export default TabHome;
