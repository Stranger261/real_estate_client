import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export const useIsScreenFocused = () => {
  const [focused, setFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  return focused;
};
