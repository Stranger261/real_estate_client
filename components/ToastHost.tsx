import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useNotificationActions } from "@/hooks/useNotifications";
import { useToastStore } from "@/stores/toastStore";

const HIDDEN = -200;

export const ToastHost = () => {
  const toast = useToastStore((s) => s.toast);
  const hide = useToastStore((s) => s.hide);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { markRead } = useNotificationActions();
  const y = useRef(new Animated.Value(HIDDEN)).current;

  useEffect(() => {
    if (!toast) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    y.setValue(HIDDEN);
    Animated.spring(y, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 5,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(y, {
        toValue: HIDDEN,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        if (useToastStore.getState().toast === toast) hide(); // a newer banner may have replaced this one
      });
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, y, hide]);

  if (!toast) return null;

  const open = () => {
    if (toast.notificationId) markRead(toast.notificationId);
    router.navigate(toast.href);
    hide();
  };

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        top: insets.top + 8,
        transform: [{ translateY: y }],
        zIndex: 100,
        elevation: 60,
      }}
    >
      <Pressable
        onPress={open}
        className="flex-row items-center gap-3 rounded-2xl bg-black-300 px-4 py-3"
      >
        <Ionicons name={toast.icon} size={22} color="#FFFFFF" />
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-rubik-semibold text-sm text-white"
          >
            {toast.title}
          </Text>
          <Text numberOfLines={2} className="font-rubik text-xs text-white/80">
            {toast.body}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};
