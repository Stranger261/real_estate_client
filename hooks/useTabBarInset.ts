import { TAB_BAR_GAP, TAB_BAR_HEIGHT } from "@/constants/tabBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const useTabBarInset = () => {
  const { bottom } = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + TAB_BAR_GAP + bottom + 16;
};
