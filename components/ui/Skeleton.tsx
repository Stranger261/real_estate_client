import { useEffect } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

// One shared pulse is cheap, and looks calmer than many blocks pulsing out of step
export const Skeleton = ({ className = "", style }: { className?: string; style?: StyleProp<ViewStyle> }) => {
  const level = useSharedValue(0.55);

  useEffect(() => {
    level.value = withRepeat(withSequence(withTiming(1, { duration: 750 }), withTiming(0.55, { duration: 750 })), -1);
  }, [level]);

  const pulse = useAnimatedStyle(() => ({ opacity: level.value }));
  return <Animated.View className={className} style={[{ backgroundColor: "#E4E9F2" }, pulse, style]} />;
};

export const ListingCardSkeleton = () => (
  <View className="mb-4 gap-3 rounded-2xl bg-white p-3">
    <Skeleton className="h-44 w-full rounded-xl" />
    <Skeleton className="h-5 w-3/4 rounded-md" />
    <Skeleton className="h-4 w-1/2 rounded-md" />
    <View className="flex-row items-center justify-between">
      <Skeleton className="h-5 w-24 rounded-md" />
      <Skeleton className="h-5 w-12 rounded-md" />
    </View>
  </View>
);

// For offers, conversations, notifications: a round picture and two lines
export const RowSkeleton = () => (
  <View className="mb-3 flex-row items-center gap-3 rounded-2xl bg-white p-4">
    <Skeleton className="h-12 w-12 rounded-full" />
    <View className="flex-1 gap-2">
      <Skeleton className="h-4 w-2/3 rounded-md" />
      <Skeleton className="h-3 w-1/2 rounded-md" />
    </View>
  </View>
);

export const ListSkeleton = ({ count = 3, kind = "card" }: { count?: number; kind?: "card" | "row" }) => (
  <View className="px-5 pt-2" accessibilityLabel="Loading">
    {Array.from({ length: count }, (_, i) => (kind === "card" ? <ListingCardSkeleton key={i} /> : <RowSkeleton key={i} />))}
  </View>
);
