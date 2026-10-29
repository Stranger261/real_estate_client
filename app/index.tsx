import Feed from "@/components/listings/Feed";
import { HomeHeader } from "@/components/listings/HomeHeader";
import { NearMeBar } from "@/components/location/NearMeBar";
import SearchBar from "@/components/SearchBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useLocate } from "@/hooks/useLocate";
import { Coords, DEFAULT_RADIUS, roundCoords } from "@/utils/geo";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const [text, setText] = useState("");
  const [near, setNear] = useState<Coords | null>(null);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS);

  const q = useDebouncedValue(text.trim());
  const { locate, locating } = useLocate();

  const toggleNear = async () => {
    if (near) return setNear(null);
    const coords = await locate();
    if (coords) setNear(roundCoords(coords));
  };

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <HomeHeader />

      <View className="px-5 py-2 gap-3">
        <SearchBar
          value={text}
          onChangeText={setText}
          placeholder="Search for city or title"
          onPress={() => setText("")}
        />
      </View>
      <View className="pb-3">
        <NearMeBar
          active={!!near}
          locating={locating}
          radiusKm={radiusKm}
          onToggle={toggleNear}
          onRadius={setRadiusKm}
        />
      </View>
      <Feed
        search={{ q, near: near ? { ...near, radiusKm } : undefined }}
        title={
          near ? "Nearest first" : q ? `Results for "${q}"` : "Latest listings"
        }
      />
    </SafeAreaView>
  );
}
