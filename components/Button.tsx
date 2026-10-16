import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
} from "react-native";
import { twMerge } from "tailwind-merge";

type ActionButtonProps = Omit<PressableProps, "style" | "children"> & {
  children?: React.ReactNode;
  label?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  textClassName?: string;
  loading?: boolean;
  spinnerColor?: string;
  onPress: () => void;
};

export const Button = ({
  icon,
  rightIcon,
  label,
  children,
  className,
  textClassName,
  loading = false,
  spinnerColor = "#fff",
  disabled,
  onPress,
  ...pressableProps
}: ActionButtonProps) => {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      {...pressableProps}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      className={twMerge(
        "flex-row items-center justify-center gap-2.5 active:opacity-80 active:scale-95",
        isDisabled && "opacity-60",
        className,
      )}
    >
      {loading ? <ActivityIndicator size="small" color={spinnerColor} /> : icon}

      {children ??
        (label ? (
          <Text className={twMerge("text-base", textClassName)}>{label}</Text>
        ) : null)}

      {!loading && rightIcon}
    </Pressable>
  );
};
