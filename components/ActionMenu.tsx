import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Option = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  danger?: boolean;
  onPress: () => void;
};

// Android's built-in Alert only handles three buttons, which isn't enough for this menu
export const ActionMenu = ({
  visible,
  options,
  onClose,
}: {
  visible: boolean;
  options: Option[];
  onClose: () => void;
}) => {
  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 30, elevation: 30 }]}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        className="bg-black-300/40"
      />
      <View
        className="absolute left-4 right-4 rounded-2xl bg-white p-2"
        style={{ top: 88, elevation: 8 }}
      >
        {options.map((o) => (
          <Pressable
            key={o.label}
            onPress={() => {
              onClose();
              o.onPress();
            }}
            className="flex-row items-center gap-3 rounded-xl px-4 py-3.5 active:bg-primary-100"
          >
            <Ionicons
              name={o.icon}
              size={20}
              color={o.danger ? "#F75555" : "#666876"}
            />
            <Text
              className={`font-rubik-medium text-base ${o.danger ? "text-danger" : "text-black-300"}`}
            >
              {o.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
