import AsyncStorage from "@react-native-async-storage/async-storage";

const STREAK_KEY = "learning-streak";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateKey(d);
}

function getDefaultStreak(): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: "",
  };
}

async function readStreak(): Promise<StreakData> {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (!raw) return getDefaultStreak();
    return { ...getDefaultStreak(), ...JSON.parse(raw) };
  } catch {
    return getDefaultStreak();
  }
}

async function writeStreak(data: StreakData): Promise<void> {
  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

export async function getStreak(): Promise<StreakData> {
  return readStreak();
}

export async function recordActivity(): Promise<StreakData> {
  const today = getLocalDateKey();
  const yesterday = getYesterdayKey();
  const streak = await readStreak();

  if (streak.lastActiveDate === today) {
    return streak;
  }

  if (streak.lastActiveDate === yesterday) {
    streak.currentStreak += 1;
  } else {
    streak.currentStreak = 1;
  }

  streak.lastActiveDate = today;
  streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
  await writeStreak(streak);
  return streak;
}
