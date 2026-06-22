import AsyncStorage from "@react-native-async-storage/async-storage";

const STATS_KEY = "lesson_progress";

 const MINUTES_PER_QUESTION = 0.5;
 const MINUTES_PER_CONVERSATION_TURN = 1;

export interface LessonProgress {
    [lessonId: string]: number; //lessonId: completionCount
}



const readProgress = async ():Promise<LessonProgress> => {
try{
const raw = await AsyncStorage.getItem(STATS_KEY);
if(!raw){
  return {};
}
return JSON.parse(raw) as LessonProgress;
}
catch(error:any){
return {}
}
}

const writeProgress = async (data: LessonProgress) => {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(data));
}



export const incrementLessonCompleted = async(lessonId: string) => {
const progress = await readProgress();
progress[lessonId] = (progress[lessonId] || 0) + 1;

await writeProgress(progress);
}

export const getAllProgress = async (): Promise<LessonProgress> => {
   return await readProgress();
}

/**
 * Rank thresholds based on cumulative lessons completed with ≥1 star.
 * 0 = A1  (default)
 * 1 = A2  (unlock ch3-5)
 * 2 = B1  (unlock ch6-8)
 * 3 = B2  (unlock ch9-11)
 * 4 = C1  (unlock ch12)
 */
export function computeRank(progress: LessonProgress): number {
  const completedCount = Object.values(progress).filter((v) => v >= 1).length;
  if (completedCount >= 35) return 4;
  if (completedCount >= 21) return 3;
  if (completedCount >= 14) return 2;
  if (completedCount >= 7)  return 1;
  return 0;
}