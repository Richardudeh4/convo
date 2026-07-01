import { getStreak } from "@/lib/streak";
import { useCallback, useEffect, useState } from "react";

export function useStreak() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStreak();
      setCurrentStreak(data.currentStreak);
      setLongestStreak(data.longestStreak);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { currentStreak, longestStreak, loading, refresh };
}
