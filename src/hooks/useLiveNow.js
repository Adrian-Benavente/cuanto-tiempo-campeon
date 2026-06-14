import { useEffect, useState } from "react";

export default function useLiveNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const refresh = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(refresh);
  }, [intervalMs]);

  return now;
}
