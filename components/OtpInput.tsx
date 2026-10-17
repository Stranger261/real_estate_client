import { View, Text, Pressable, TextInput } from "react-native";
import React, { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export const OTP_LENGTH = 6;

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  editable?: boolean;
};

const OtpInput = ({
  value,
  onChange,
  hasError,
  editable = true,
}: OtpInputProps) => {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, OTP_LENGTH - 1);

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      className="flex-row gap-2"
    >
      {Array.from({ length: OTP_LENGTH }, (_, i) => (
        <View
          key={i}
          className={twMerge(
            "h-14 flex-1 items-center justify-center rounded-xl border bg-white",
            hasError
              ? "border-danger"
              : focused && i === activeIndex
                ? "border-primary-300"
                : "border-primary-200",
          )}
        >
          <Text className="font-rubik-bold text-xl text-black-300">
            {value[i] ?? ""}
          </Text>
        </View>
      ))}

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) =>
          onChange(text.replace(/\/D/g, "").slice(0, OTP_LENGTH))
        }
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={OTP_LENGTH}
        autoFocus
        editable={editable}
        caretHidden
        className="absolute h-full w-full opacity-0"
      />
    </Pressable>
  );
};

export default OtpInput;
