import { Pressable, Text, View } from "react-native";

type ChipSelectProps<T extends string> = {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
};

export const ChipSelect = <T extends string>({
  options,
  value,
  onChange,
}: ChipSelectProps<T>) => (
  <View className="flex-row flex-wrap gap-2">
    {options.map((option) => {
      const active = option.value === value;
      return (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          className={`rounded-full border px-4 py-2 ${
            active
              ? "border-primary-300 bg-primary-300"
              : "border-primary-200 bg-white"
          }`}
        >
          <Text
            className={`font-rubik-medium text-sm ${active ? "text-white" : "text-black-200"}`}
          >
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);
