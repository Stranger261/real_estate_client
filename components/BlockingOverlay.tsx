import { useEffect } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Keyboard,
  Text,
  View,
} from "react-native";

export const BlockingOverlay = ({ label }: { label?: string }) => {
  useEffect(() => {
    Keyboard.dismiss();
    // Android back button does nothing while the request runs
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  return (
    <View
      className="absolute inset-0 z-50 items-center justify-center bg-black-300/40"
      style={{ elevation: 50 }} // Android draws by elevation, so this keeps it above everything
    >
      <View className="items-center gap-3 rounded-2xl bg-white px-8 py-6">
        <ActivityIndicator color="#0061FF" />
        {!!label && (
          <Text className="font-rubik-medium text-sm text-black-300">
            {label}
          </Text>
        )}
      </View>
    </View>
  );
};
