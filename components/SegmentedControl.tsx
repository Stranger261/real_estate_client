import { Pressable, View, Text } from "react-native";

type SegmentedControlProps<T extends string> = {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
};

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) => {
  return (
    <View className="flex-row rounded-full bg-primary-100 p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center rounded-full py-2 ${active ? "bg-white" : ""}`}
          >
            <Text
              className={`font-rubik-medium text-sm ${active ? "text-primary-300" : "text-black-200"}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
