import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Button } from "@/components/Button";
import { usePickerStore } from "@/stores/pickerStore";
import type { Coords } from "@/utils/geo";

type LocationButtonProps = {
  value: Coords | null;
  onChange: (coords: Coords | null) => void;
};

export const LocationButton = ({ value, onChange }: LocationButtonProps) => {
  const router = useRouter();

  // Coming back from the map: take the location that was just confirmed
  useFocusEffect(
    useCallback(() => {
      const picked = usePickerStore.getState().takeLocation();
      if (picked) onChange(picked);
    }, [onChange]),
  );

  return (
    <View className="gap-2 rounded-2xl bg-white p-4">
      <Text className="font-rubik-medium text-sm text-black-300">
        Map location
      </Text>
      <Text className="font-rubik text-xs leading-5 text-black-200">
        {value
          ? `Pinned at ${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}. Buyers searching near here will find it.`
          : 'Without a pin, this won\'t show up in "near me" searches or on the map.'}
      </Text>
      <Button
        label={value ? "Move the pin" : "Pin it on the map"}
        onPress={() =>
          router.push({
            pathname: "/pin-location",
            params: value
              ? { lat: String(value.latitude), lng: String(value.longitude) }
              : {},
          })
        }
        className="rounded-full border border-primary-300 py-3"
        textClassName="font-rubik-semibold text-sm text-primary-300"
      />
      {value && (
        <Pressable onPress={() => onChange(null)} hitSlop={8}>
          <Text className="text-center font-rubik text-xs text-black-200">
            Remove pin
          </Text>
        </Pressable>
      )}
    </View>
  );
};
