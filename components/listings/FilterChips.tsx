import { ScrollView } from "react-native";
import { ChipType } from "@/constants/filters";
import Chip from "../Chip";

type FilterChipsProps<T extends string> = {
  chips: ChipType<T>[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
};

const FilterChips = <T extends string>({
  chips,
  value,
  onChange,
}: FilterChipsProps<T>) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
    >
      {chips.map((chip) => {
        const active = chip.value === value;
        return (
          <Chip
            key={chip.label}
            label={chip.label}
            isActive={active}
            onPress={() => onChange(chip.value)}
          />
        );
      })}
    </ScrollView>
  );
};

export default FilterChips;
