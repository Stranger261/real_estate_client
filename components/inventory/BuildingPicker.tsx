import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { useBuildingSearch } from "@/hooks/useInventory";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { PickedBuilding } from "@/stores/pickerStore";
import { formatAddress } from "@/utils/address";

type BuildingPickerProps = {
  selected: PickedBuilding | null;
  onSelect: (building: PickedBuilding) => void;
  onClear: () => void;
  onAddNew: () => void;
  error?: string;
};

export const BuildingPicker = ({
  selected,
  onSelect,
  onClear,
  onAddNew,
  error,
}: BuildingPickerProps) => {
  const [text, setText] = useState("");
  const q = useDebouncedValue(text.trim());
  const search = useBuildingSearch(q, !selected);

  if (selected) {
    return (
      <View className="gap-2">
        <Text className="font-rubik-medium text-sm text-black-200">
          Building
        </Text>
        <View className="flex-row items-center justify-between rounded-2xl border border-primary-300 bg-white px-4 py-3">
          <Text
            numberOfLines={1}
            className="flex-1 font-rubik-semibold text-base text-black-300"
          >
            {selected.label}
          </Text>
          <Pressable onPress={onClear} hitSlop={8}>
            <Text className="font-rubik-medium text-sm text-primary-300">
              Change
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const results = search.data ?? [];
  return (
    <View className="gap-2">
      <TextField
        label="Building"
        value={text}
        onChangeText={setText}
        error={error}
        placeholder="Search by building name or city"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {search.isLoading ? (
        <ActivityIndicator color="#0061FF" />
      ) : (
        results.map((b) => (
          <Pressable
            key={b.id}
            onPress={() => onSelect({ id: b.id, label: b.name })}
            className="gap-1 rounded-2xl border border-primary-200 bg-white p-3"
          >
            <Text className="font-rubik-semibold text-sm text-black-300">
              {b.name}
            </Text>
            {!!formatAddress(b.address) && (
              <Text
                numberOfLines={1}
                className="font-rubik text-xs text-black-200"
              >
                {formatAddress(b.address)}
              </Text>
            )}
            {b.verificationStatus !== "VERIFIED" && (
              <Badge label="Yours · under review" tone="neutral" />
            )}
          </Pressable>
        ))
      )}

      {!search.isLoading && results.length === 0 && !!q && (
        <Text className="font-rubik text-sm text-black-200">{`No buildings match "${q}".`}</Text>
      )}

      <Button
        label="Can't find it? Add a new building"
        onPress={onAddNew}
        className="rounded-full border border-primary-300 py-3"
        textClassName="font-rubik-medium text-sm text-primary-300"
      />
    </View>
  );
};
