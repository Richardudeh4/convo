import { getWeeklyStats } from "@/lib/speakingListeningStats";
import { useEffect, useState } from "react";

interface weeklyStats {
    minutesSpoken: number;
    minutesListened: number;
    weeklyChange: {
        spoken: number;
        listened: number;
    };
}
export const useSpeakingListeningStats = () => {
 const [stats, setStats] = useState<weeklyStats | null>(null);
 const [loading, setLoading] = useState(true);
 const refresh = async () => {
try{
    const weeklyStats = await getWeeklyStats();
setStats(weeklyStats);
setLoading(false);
    }
    catch(error:any){
        console.error("Error fetching speaking listening stats", error);
    }
    finally{
        setLoading(false);
    }
 };
 useEffect(() => {
    refresh();
 }, []);
 return {stats, loading, refresh};
}