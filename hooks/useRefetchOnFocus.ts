import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";

export const useRefetchOnFocus = (refetch: () => unknown) => {
  const latest = useRef(refetch);
  latest.current = refetch;

  const first = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (first.current) {
        first.current = false;
        return;
      }
      latest.current();
    }, []),
  );
};
