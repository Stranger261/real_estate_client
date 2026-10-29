import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";

type ReasonPromptProps = {
  title: string;
  message?: string;
  confirmLabel: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

export const ReasonPrompt = ({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ReasonPromptProps) => {
  const [reason, setReason] = useState("");
  const valid = reason.trim().length >= 3;

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
          {!!message && (
            <Text className="font-rubik text-sm text-black-200">{message}</Text>
          )}
        </View>

        <TextField
          label="Reason (the owner will see this)"
          value={reason}
          onChangeText={setReason}
          autoFocus
          multiline
          maxLength={500}
          style={{ height: 96, textAlignVertical: "top", paddingTop: 12 }}
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
            onPress={() => onConfirm(reason.trim())}
            disabled={!valid}
            className="flex-1 rounded-full bg-danger py-3"
            textClassName="font-rubik-semibold text-sm text-white"
          />
        </View>
      </View>
    </View>
  );
};
