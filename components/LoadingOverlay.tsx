import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { AnimatedDots } from "@/components/ui/AnimatedDots";
import { BrandSpinner } from "@/components/ui/BrandSpinner";
import { ModalShell } from "@/components/ui/ModalShell";

type LoadingOverlayProps = {
  label?: string;
  /** Messages shown one after another, ending on the last one. For long waits: "Checking...", then "Preparing...". */
  messages?: string[];
  /** Covers the whole screen and blocks every tap, status bar included. */
  blocking?: boolean;
  /** Without blocking: fills the screen's own area with the page background. */
  fullScreen?: boolean;
};

const useStagedMessage = (messages: string[], everyMs = 1700) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const id = setInterval(() => setIndex((i) => Math.min(i + 1, messages.length - 1)), everyMs);
    return () => clearInterval(id);
  }, [messages.length, everyMs]);

  return messages[Math.min(index, messages.length - 1)];
};

// Same props as before, so no screen has to change
export const LoadingOverlay = ({ label, messages, blocking = false, fullScreen = false }: LoadingOverlayProps) => {
  const text = useStagedMessage(messages ?? (label ? [label] : []));

  const card = (
    <View className="items-center gap-4 self-center rounded-3xl bg-white px-8 py-7" style={{ elevation: 12, minWidth: 200 }}>
      <BrandSpinner />
      {!!text && (
        <View className="flex-row items-end" style={{ minHeight: 20 }}>
          <Animated.Text key={text} entering={FadeIn.duration(220)} className="font-rubik-medium text-sm text-black-300">
            {text}
          </Animated.Text>
          <AnimatedDots />
        </View>
      )}
    </View>
  );

  if (blocking) return <ModalShell variant="dialog">{card}</ModalShell>;

  // Not blocking: it sits inside its own screen, as before
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      className={`items-center justify-center ${fullScreen ? "bg-accent-100" : ""}`}
    >
      {card}
    </View>
  );
};
