import { useState } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type PasswordFieldProps = Omit<TextInputProps, "secureTextEntry" | "style"> & {
  label: string;
  error?: string;
};

// A password input with a show/hide eye. Self-contained, so it doesn't depend on TextField's layout.
export const PasswordField = ({ label, error, ...rest }: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <View className="gap-1.5">
      <Text className="font-rubik-medium text-sm text-black-300">{label}</Text>
      <View
        className={`h-12 flex-row items-center rounded-xl border bg-white px-4 ${error ? "border-danger" : "border-primary-200"}`}
      >
        <TextInput
          {...rest}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#8C8E98"
          className="flex-1 font-rubik text-base text-black-300"
        />
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={10}
          accessibilityLabel={visible ? "Hide password" : "Show password"}
        >
          <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={22} color="#8C8E98" />
        </Pressable>
      </View>
      {!!error && <Text className="font-rubik text-xs text-danger">{error}</Text>}
    </View>
  );
};
