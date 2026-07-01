import AsyncStorage from "@react-native-async-storage/async-storage";

const STATS_KEY = "speaking-listening-stats";

const MINUTES_PER_QUESTION = 0.5;
const MINUTES_PER_CONVERSATION_TURN = 1;

interface WeekSnapshot {
  minutesSpoken: number;
  minutesListened: number;
  weekKey: string;
}

export interface SpeakingListeningStats {
  minutesSpoken: number;
  minutesListened: number;
  lastUpdate: string;
  questionsAnswered: number;
  questionsListened: number;
  conversationTurns: number;
  weekStartSnapshot?: WeekSnapshot;
}

export interface WeeklySpeakingListeningStats {
  minutesSpoken: number;
  minutesListened: number;
  conversationTurns: number;
  weeklyChange: {
    spoken: number;
    listened: number;
  };
}

function getWeekStartKey(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dayNum = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dayNum}`;
}

const getDefaultStats = (): SpeakingListeningStats => ({
  minutesListened: 0,
  minutesSpoken: 0,
  lastUpdate: new Date().toISOString(),
  questionsAnswered: 0,
  questionsListened: 0,
  conversationTurns: 0,
});

const readStats = async (): Promise<SpeakingListeningStats> => {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (!raw) {
      return getDefaultStats();
    }
    return { ...getDefaultStats(), ...JSON.parse(raw) };
  } catch {
    return getDefaultStats();
  }
};

const writeStats = async (stats: SpeakingListeningStats) => {
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

async function ensureWeekSnapshot(stats: SpeakingListeningStats): Promise<SpeakingListeningStats> {
  const currentWeekKey = getWeekStartKey();

  if (stats.weekStartSnapshot?.weekKey === currentWeekKey) {
    return stats;
  }

  stats.weekStartSnapshot = {
    minutesSpoken: stats.minutesSpoken,
    minutesListened: stats.minutesListened,
    weekKey: currentWeekKey,
  };
  await writeStats(stats);
  return stats;
}

export const recordQuestionAnswered = async () => {
  const stats = await readStats();
  stats.questionsAnswered += 1;
  stats.minutesSpoken = stats.questionsAnswered * MINUTES_PER_QUESTION;
  stats.lastUpdate = new Date().toISOString();
  await writeStats(stats);
};

export const recordQuestionListened = async () => {
  const stats = await readStats();
  stats.questionsListened += 1;
  stats.minutesListened = stats.questionsListened * MINUTES_PER_QUESTION;
  stats.lastUpdate = new Date().toISOString();
  await writeStats(stats);
};

export const recordConversationTurn = async () => {
  const stats = await readStats();
  stats.conversationTurns += 1;
  stats.minutesSpoken += MINUTES_PER_CONVERSATION_TURN;
  stats.minutesListened += MINUTES_PER_CONVERSATION_TURN;
  stats.lastUpdate = new Date().toISOString();
  await writeStats(stats);
};

export const getWeeklyStats = async (): Promise<WeeklySpeakingListeningStats> => {
  let stats = await readStats();
  stats = await ensureWeekSnapshot(stats);

  const snapshot = stats.weekStartSnapshot!;
  const spokenDelta = Math.max(0, stats.minutesSpoken - snapshot.minutesSpoken);
  const listenedDelta = Math.max(0, stats.minutesListened - snapshot.minutesListened);

  return {
    minutesSpoken: Math.round(stats.minutesSpoken * 10) / 10,
    minutesListened: Math.round(stats.minutesListened * 10) / 10,
    conversationTurns: stats.conversationTurns,
    weeklyChange: {
      spoken: Math.round(spokenDelta * 10) / 10,
      listened: Math.round(listenedDelta * 10) / 10,
    },
  };
};
