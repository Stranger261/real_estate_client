import { View, Text } from "react-native";

interface SeparatorProp {
  middleText?: string;
}

const LineSeparator = ({ middleText }: SeparatorProp) => {
  return (
    <View className="flex-row items-center">
      <View
        style={{
          flex: 1,
          borderTopWidth: 1,
          borderTopColor: "#D1D5DB",
        }}
      />

      {middleText && (
        <Text
          style={{
            marginHorizontal: 16,
            fontSize: 14,
            color: "#666",
          }}
        >
          {middleText}
        </Text>
      )}

      <View
        style={{
          flex: 1,
          borderTopWidth: 1,
          borderTopColor: "#D1D5DB",
        }}
      />
    </View>
  );
};

export default LineSeparator;
