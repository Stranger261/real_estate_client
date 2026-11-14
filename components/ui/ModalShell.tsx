import { useEffect, useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, {
  FadeIn, FadeInDown, FadeOut, FadeOutDown, SlideInDown, SlideOutDown,
} from "react-native-reanimated";

const EXIT_MS = 180;

type ModalShellProps = {
  children: ReactNode;
  /** The Android back button, and a tap on the dim area when dismissOnBackdrop is on. Leave it out for things that must not be dismissed, like a loading overlay. */
  onRequestClose?: () => void;
  dismissOnBackdrop?: boolean;
  /** "dialog" is a card in the middle. "sheet" slides up from the bottom. */
  variant?: "dialog" | "sheet";
  /** Pass this to get an exit animation. Without it the modal simply disappears when its component unmounts. */
  visible?: boolean;
  backdrop?: string;
};

/**
 * Everything that must sit above the whole screen goes through here: dialogs, sheets, loading overlays.
 * It renders in its own window, so it always covers the full screen (status bar and navigation bar included),
 * and nothing in the screen underneath, such as an elevated card, can draw on top of it.
 */
export const ModalShell = ({
  children, onRequestClose, dismissOnBackdrop = false, variant = "dialog", visible = true, backdrop = "rgba(25,29,49,0.55)",
}: ModalShellProps) => {
  const [mounted, setMounted] = useState(visible);

  // Stay mounted just long enough for the exit animation to play
  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }
    const id = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(id);
  }, [visible]);

  if (!mounted) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onRequestClose ?? (() => {})}
    >
      {visible && (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(EXIT_MS - 30)}
          style={[StyleSheet.absoluteFill, { backgroundColor: backdrop }]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={dismissOnBackdrop ? onRequestClose : undefined}
            accessible={false}
          />
        </Animated.View>
      )}

      <KeyboardAvoidingView
        behavior="padding"
        pointerEvents="box-none"
        style={{ flex: 1, justifyContent: variant === "sheet" ? "flex-end" : "center" }}
      >
        {visible &&
          (variant === "sheet" ? (
            <Animated.View entering={SlideInDown.duration(260)} exiting={SlideOutDown.duration(EXIT_MS)}>
              {children}
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeInDown.springify().damping(20).stiffness(220)}
              exiting={FadeOutDown.duration(EXIT_MS - 40)}
              style={{ paddingHorizontal: 20 }}
            >
              {children}
            </Animated.View>
          ))}
      </KeyboardAvoidingView>
    </Modal>
  );
};
