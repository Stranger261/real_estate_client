import { Pressable, TextInput, View } from "react-native";
import { useKeyboardState } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type ChatComposerProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export const ChatComposer = ({
  value,
  onChangeText,
  onSend,
  disabled,
}: ChatComposerProps) => {
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardState((s) => s.isVisible);
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <View
      className="flex-row items-end gap-2 border-t border-primary-200 bg-white px-4 pt-3"
      style={{ paddingBottom: keyboardVisible ? 12 : insets.bottom + 12 }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={2000}
        placeholder="Write a message"
        placeholderTextColor="#8C8E98"
        className="max-h-28 min-h-[44px] flex-1 rounded-2xl border border-primary-200 bg-accent-100 px-4 py-2.5 font-rubik text-base text-black-300"
      />
      <Pressable
        onPress={onSend}
        disabled={!canSend}
        className={`h-11 w-11 items-center justify-center rounded-full ${canSend ? "bg-primary-300" : "bg-primary-200"}`}
      >
        <Ionicons name="send" size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
};
