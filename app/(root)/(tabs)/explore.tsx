import { useCallback, useRef } from "react";
import { Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import SearchBar from "@/components/SearchBar";
import Feed from "@/components/listings/Feed";
import { useTabBarInset } from "@/hooks/useTabBarInset";
import { FILTERS } from "@/constants/filters";
import { FilterChips } from "@/components/FilterChips";
import { useExploreStore } from "@/stores/exploreStore";
import { useFocusEffect } from "expo-router";
import { useLocate } from "@/hooks/useLocate";
import { RADIUS_STEPS, roundCoords } from "@/utils/geo";
import { NearMeBar } from "@/components/location/NearMeBar";

export default function Explore() {
  const inset = useTabBarInset();
  const searchRef = useRef<TextInput>(null);

  const text = useExploreStore((s) => s.text);
  const type = useExploreStore((s) => s.type);
  const item = useExploreStore((s) => s.item);
  const property = useExploreStore((s) => s.property);
  const near = useExploreStore((s) => s.near);
  const radiusKm = useExploreStore((s) => s.radiusKm);
  const { setText, setType, setItem, setProperty, setNear, setRadius } =
    useExploreStore.getState();

  const q = useDebouncedValue(text.trim());
  const { locate, locating } = useLocate();

  const turnOnNear = useCallback(async () => {
    const coords = await locate();
    if (coords) useExploreStore.getState().setNear(roundCoords(coords));
  }, [locate]);

  useFocusEffect(
    useCallback(() => {
      const store = useExploreStore.getState();
      if (store.consumeNearMe()) turnOnNear();
      if (!store.consumeSearchFocus()) return;
      const id = setTimeout(() => searchRef.current?.focus(), 150);
      return () => clearTimeout(id);
    }, [turnOnNear]),
  );

  const widerRadius = RADIUS_STEPS.find((km) => km > radiusKm);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
      <View className="gap-3 px-5 pb-3 pt-3">
        <Text className="font-rubik-bold text-2xl text-black-300">Explore</Text>
        <SearchBar inputRef={searchRef} value={text} onChangeText={setText} />
      </View>

      <View className="gap-2 py-3">
        <NearMeBar
          active={!!near}
          locating={locating}
          radiusKm={radiusKm}
          onToggle={() => (near ? setNear(null) : turnOnNear())}
          onRadius={setRadius}
        />

        <FilterChips chips={FILTERS.type} value={type} onChange={setType} />
        <FilterChips chips={FILTERS.item} value={item} onChange={setItem} />
        {item === "PROPERTY" && (
          <FilterChips
            chips={FILTERS.property}
            value={property}
            onChange={setProperty}
          />
        )}
      </View>
      <Feed
        search={{
          q,
          listingType: type,
          targetType: item,
          propertyType: property,
          near: near ? { ...near, radiusKm } : undefined,
        }}
        title={near ? "Nearest first" : undefined}
        emptyAction={
          near && widerRadius
            ? {
                label: `Search ${widerRadius} km`,
                onPress: () => setRadius(widerRadius),
              }
            : undefined
        }
        bottomInset={inset}
      />
    </SafeAreaView>
  );
}
