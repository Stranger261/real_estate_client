import { useEffect, useRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useReverseGeocode } from "@/hooks/useReverseGeocode";
import type { AddressValues } from "@/utils/address";
import type { Coords } from "@/utils/geo";

type PinAddressFillProps = {
  coords: Coords | null;
  address: AddressValues;
  onFill: (patch: Partial<AddressValues>) => void;
};

const KEYS: (keyof AddressValues)[] = [
  "street",
  "barangay",
  "city",
  "province",
  "postalCode",
];

export const PinAddressFill = ({
  coords,
  address,
  onFill,
}: PinAddressFillProps) => {
  const query = useReverseGeocode(coords);
  const found = query.data; // undefined: not asked yet, null: nothing mapped there
  // What we wrote last. A field still holding exactly that text was never edited by the seller,
  // so a new pin may replace it. Anything else is theirs and is left alone.
  const lastFilled = useRef<Partial<AddressValues>>({});

  useEffect(() => {
    if (!found) return;
    const patch: Partial<AddressValues> = {};
    for (const key of KEYS) {
      const value = found[key]?.trim();
      if (!value) continue;
      const current = address[key].trim();
      if (current === "" || current === lastFilled.current[key])
        patch[key] = value;
    }
    if (Object.keys(patch).length === 0) return;
    lastFilled.current = { ...lastFilled.current, ...patch };
    onFill(patch);
    // Only a new lookup should run this. Typing in the form must not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found]);

  if (!coords) return null;

  if (query.isFetching) {
    return (
      <View className="flex-row items-center gap-2">
        <ActivityIndicator size="small" color="#0061FF" />
        <Text className="font-rubik text-xs text-black-200">
          Looking up the address...
        </Text>
      </View>
    );
  }
  if (query.isError) {
    return (
      <Text className="font-rubik text-xs text-black-200">{`We couldn't look up the address. Please type it in.`}</Text>
    );
  }
  if (found === null) {
    return (
      <Text className="font-rubik text-xs text-black-200">
        No address is mapped at this spot. Please type it in.
      </Text>
    );
  }
  if (found) {
    return (
      <Text className="font-rubik text-xs leading-5 text-black-200">
        Filled in from OpenStreetMap data for your pin. It can be incomplete or
        off by a street, so please check every field.
      </Text>
    );
  }
  return null;
};
