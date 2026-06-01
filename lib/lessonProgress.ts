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