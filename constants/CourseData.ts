import courseData from "@/assets/data/course_content.json";
import Ionicons from "@expo/vector-icons/Ionicons";

export interface CourseData {
  chapters: Chapter[];
  scenarios: ConversationScenario[];
}

export interface ConversationScenario {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  isFree: boolean;
  description: string;
  goal: string;
  tasks: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  phrasebook?: PhrasebookEntry[];
}

export interface PhrasebookEntry {
  text: string;
  romanization: string;
  english: string;
}

export interface Chapter {
  id: number;
  title: string;
  lessons: Lesson[];
  review?: Lesson;
  minRank: number;
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1";
}

export interface Lesson {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  completionCount: number;
  questions: Question[];
}

interface BaseQuestion {
  id: number;
}

export interface TargetPrompt {
  text: string;
  romanization: string;
}

export interface Word {
  text: string;
  romanization: string;
  english: string;
}

interface TargetPhrase {
  text: string;
  romanization: string;
  words: Word[];
  breakdown: string;
}

export interface SpeakingOption {
  id: number;
  english: string;
  target: TargetPhrase;
}

export interface ListeningOption {
  id: number;
  english: string;
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  target: TargetPrompt;
  options: SpeakingOption[];
  correctOptionId: number;
}

interface SingleResponseQuestion extends BaseQuestion {
  type: "single_response";
  target: TargetPrompt;
  options: [SpeakingOption];
}

interface ListeningMultipleChoiceQuestion extends BaseQuestion {
  type: "listening_mc";
  target: TargetPrompt & {
    words: Word[];
    breakdown: string;
  };
  options: ListeningOption[];
  correctOptionId: number;
}

export type Question =
  | MultipleChoiceQuestion
  | SingleResponseQuestion
  | ListeningMultipleChoiceQuestion;

export const COURSE_DATA = courseData as unknown as CourseData;

export const RANK_LABELS: Record<number, string> = {
  0: "A1 · Beginner",
  1: "A2 · Elementary",
  2: "B1 · Intermediate",
  3: "B2 · Upper-Intermediate",
  4: "C1 · Advanced",
};
