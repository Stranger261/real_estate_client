import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";

type TypeToConfirmProps = {
  title: string;
  message: string;
  expected: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const TypeToConfirm = ({
  title,
  message,
  expected,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: TypeToConfirmProps) => {
  const [value, setValue] = useState("");
  const matches = value.trim().toLowerCase() === expected.toLowerCase();

  return (
    <View
      style={[StyleSheet.absoluteFill, { zIndex: 40, elevation: 40 }]}
      className="bg-black-300/50 px-5 pt-24"
    >
      <View className="gap-4 rounded-2xl bg-white p-5">
        <View className="gap-1">
          <Text className="font-rubik-bold text-lg text-black-300">
            {title}
          </Text>
          <Text className="font-rubik text-sm leading-5 text-black-200">
            {message}
          </Text>
        </View>

        <TextField
          label={`Type ${expected} to confirm`}
          value={value}
          onChangeText={setValue}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <View className="flex-row gap-3">
          <Button
            label="Cancel"
            onPress={onCancel}
            className="flex-1 rounded-full border border-primary-300 py-3"
            textClassName="font-rubik-semibold text-sm text-primary-300"
          />
          <Button
            label={confirmLabel}
            onPress={onConfirm}
            disabled={!matches}
            className={`flex-1 rounded-full py-3 ${danger ? "bg-danger" : "bg-primary-300"}`}
            textClassName="font-rubik-semibold text-sm text-white"
          />
        </View>
      </View>
    </View>
  );
};
