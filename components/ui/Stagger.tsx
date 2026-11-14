import { useEffect, useState, type ReactNode } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";

const seen = new Set<string>();

// List items rise in one after another the first time they appear. Scrolling back to an item does not replay it.
export const Stagger = ({ id, index, children }: { id: string; index: number; children: ReactNode }) => {
  const [animate] = useState(() => !seen.has(id));

  useEffect(() => {
    seen.add(id);
  }, [id]);

  if (!animate) return <>{children}</>;
  return <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 45).duration(320)}>{children}</Animated.View>;
};
