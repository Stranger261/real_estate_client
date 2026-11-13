import { useCallback, useEffect, useState } from "react";

export const useCooldown = (initialSeconds = 0) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const start = useCallback((s: number) => setSeconds(s), []);
  return { seconds, start };
};
