import { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { ModalShell } from "@/components/ui/ModalShell";

type TypeToConfirmProps = {
  title: string;
  message: string;
  expected: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// For actions that are hard to undo: you type the person's email to go ahead
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
    <ModalShell onRequestClose={onCancel}>
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
    </ModalShell>
  );
};
