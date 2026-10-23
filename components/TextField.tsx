import { Text, TextInput, View, type TextInputProps } from "react-native";

type TextFieldProps = TextInputProps & { label: string; error?: string };

export const TextField = ({ label, error, ...input }: TextFieldProps) => (
  <View className="gap-1.5">
    <Text className="font-rubik-medium text-sm text-black-200">{label}</Text>
    <TextInput
      placeholderTextColor="#8C8E98"
      {...input}
      className={`h-12 rounded-xl border bg-white px-4 font-rubik text-base text-black-300 ${
        error ? "border-danger" : "border-primary-200"
      }`}
    />
    {!!error && <Text className="font-rubik text-xs text-danger">{error}</Text>}
  </View>
);
