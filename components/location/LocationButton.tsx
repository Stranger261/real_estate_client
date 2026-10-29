import { Pressable, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { useLocate } from "@/hooks/useLocate";
import type { Coords } from "@/utils/geo";

type LocationButtonProps = {
  value: Coords | null;
  onChange: (coords: Coords | null) => void;
};

export const LocationButton = ({ value, onChange }: LocationButtonProps) => {
  const { locate, locating } = useLocate();

  const capture = async () => {
    const coords = await locate();
    if (coords) {
      onChange({
        latitude: Number(coords.latitude.toFixed(6)),
        longitude: Number(coords.longitude.toFixed(6)),
      });
    }
  };

  return (
    <View className="gap-2 rounded-2xl bg-white p-4">
      <Text className="font-rubik-medium text-sm text-black-300">
        Map location
      </Text>
      <Text className="font-rubik text-xs leading-5 text-black-200">
        {value
          ? "Pinned. Buyers searching near this place will find it."
          : 'If you\'re at the property right now, use your location so it shows up in "near me" searches.'}
      </Text>
      <Button
        label={
          value ? "Update with my current location" : "Use my current location"
        }
        onPress={capture}
        loading={locating}
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
