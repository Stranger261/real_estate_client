import { useEffect, useState } from "react";

const useCountdown = (initialSeconds: number) => {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (remaining === 0) return;
    const id = setTimeout(() => setRemaining((prev) => prev - 1), 1000);

    return () => clearInterval(id);
  }, [remaining]);

  return { remaining, restart: (seconds: number) => setRemaining(seconds) };
};

export default useCountdown;
