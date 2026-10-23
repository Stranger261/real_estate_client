import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "./Button";

const Centered = ({
  fullScreen,
  children,
}: {
  fullScreen?: boolean;
  children: ReactNode;
}) =>
  fullScreen ? (
    <SafeAreaView className="flex-1 items-center justify-center bg-accent-100">
      {children}
    </SafeAreaView>
  ) : (
    <View className="flex-1 items-center justify-center">{children}</View>
  );

export const ErrorState = ({
  message,
  onRetry,
  fullScreen,
}: {
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}) => (
  <Centered fullScreen={fullScreen}>
    <View className="items-center gap-4 px-8">
      <Ionicons name="alert-circle-outline" size={36} color="#F75555" />
      <Text className="text-center font-rubik text-base text-danger">
        {message}
      </Text>
      {onRetry && (
        <Button
          label="Try again"
          onPress={onRetry}
          className="rounded-full bg-primary-300 px-6 py-3"
          textClassName="font-rubik-medium text-white"
        />
      )}
    </View>
  </Centered>
);
