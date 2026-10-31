import { Text, View } from "react-native";

export const PricePin = ({
  label,
  selected,
}: {
  label: string;
  selected: boolean;
}) => (
  <View className="items-center">
    <View
      className={`rounded-full border px-3 py-1.5 ${selected ? "border-primary-300 bg-primary-300" : "border-primary-200 bg-white"}`}
      style={{ elevation: 3 }}
    >
      <Text
        className={`font-rubik-semibold text-xs ${selected ? "text-white" : "text-black-300"}`}
      >
        {label}
      </Text>
    </View>
    <View
      className={`-mt-1 h-2.5 w-2.5 rotate-45 ${selected ? "bg-primary-300" : "bg-white"}`}
    />
  </View>
);
