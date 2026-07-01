import { getWeeklyStats } from "@/lib/speakingListeningStats";
import { useCallback, useEffect, useState } from "react";

interface WeeklyStats {
  minutesSpoken: number;
  minutesListened: number;
  conversationTurns: number;
  weeklyChange: {
    spoken: number;
    listened: number;
  };
}

export const useSpeakingListeningStats = () => {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const weeklyStats = await getWeeklyStats();
      setStats(weeklyStats);
    } catch (error: unknown) {
      console.error("Error fetching speaking listening stats", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stats, loading, refresh };
};
