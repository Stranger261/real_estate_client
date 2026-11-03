import { Text, View } from "react-native";

type PricePinProps = { label: string; selected: boolean; compact?: boolean };

export const PricePin = ({
  label,
  selected,
  compact = false,
}: PricePinProps) => {
  if (compact) {
    return (
      <View style={{ padding: 8 }}>
        <View
          className="h-4 w-4 rounded-full border-2 border-white bg-primary-300"
          style={{ elevation: 3 }}
        />
      </View>
    );
  }

  return (
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
};
