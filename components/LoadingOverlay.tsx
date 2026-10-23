import { useEffect } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Keyboard,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LoadingOverlayProps = {
  label?: string;
  /** Floats over the screen with a dark backdrop and blocks every tap. Use while a form submits. */
  blocking?: boolean;
  /** Use when the spinner IS the whole screen: adds its own SafeAreaView and page background. */
  fullScreen?: boolean;
};

export const LoadingOverlay = ({
  label,
  blocking = false,
  fullScreen = false,
}: LoadingOverlayProps) => {
  useEffect(() => {
    if (!blocking) return;
    Keyboard.dismiss();
    // the Android back button does nothing while a request is running
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );
    return () => subscription.remove();
  }, [blocking]);

  const spinner = (
    <View className="items-center gap-3">
      <ActivityIndicator color="#0061FF" />
      {!!label && (
        <Text className="font-rubik-medium text-sm text-black-300">
          {label}
        </Text>
      )}
    </View>
  );

  if (blocking) {
    return (
      <View
        style={[StyleSheet.absoluteFill, { elevation: 50, zIndex: 50 }]} // elevation keeps it above everything on Android
        className="items-center justify-center bg-black-100"
        accessibilityViewIsModal
      >
        <View className="rounded-2xl bg-white px-8 py-6">{spinner}</View>
      </View>
    );
  }

  if (fullScreen) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-accent-100">
        {spinner}
      </SafeAreaView>
    );
  }

  return <View className="flex-1 items-center justify-center">{spinner}</View>;
};
