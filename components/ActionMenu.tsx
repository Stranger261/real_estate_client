import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ModalShell } from "@/components/ui/ModalShell";

type Option = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  danger?: boolean;
  onPress: () => void;
};

// A bottom sheet of actions. Android's built-in Alert only handles three buttons, which isn't enough for a menu.
export const ActionMenu = ({ visible, options, onClose, title }: { visible: boolean; options: Option[]; onClose: () => void; title?: string }) => {
  const insets = useSafeAreaInsets();

  return (
    <ModalShell variant="sheet" visible={visible} onRequestClose={onClose} dismissOnBackdrop>
      <View className="rounded-t-3xl bg-white px-3 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        <View className="mb-3 h-1.5 w-10 self-center rounded-full bg-primary-200" />
        {!!title && <Text className="px-3 pb-2 font-rubik-semibold text-base text-black-300">{title}</Text>}

        {options.map((o) => (
          <Pressable
            key={o.label}
            onPress={() => {
              onClose();
              o.onPress();
            }}
            className="flex-row items-center gap-4 rounded-xl px-3 py-4 active:bg-primary-100"
          >
            <Ionicons name={o.icon} size={22} color={o.danger ? "#F75555" : "#666876"} />
            <Text className={`font-rubik-medium text-base ${o.danger ? "text-danger" : "text-black-300"}`}>{o.label}</Text>
          </Pressable>
        ))}
      </View>
    </ModalShell>
  );
};
