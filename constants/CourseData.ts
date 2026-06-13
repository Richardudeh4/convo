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

interface PhrasebookEntry {
  hanzi: string;
  pinyin: string;
  english: string;
}

export interface Chapter {
  id: number;
  title: string;
  lessons: Lesson[];
  review?: Lesson;
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

interface MandarinPrompt {
  hanzi: string;
  pinyin: string;
}

export interface Word {
  hanzi: string;
  pinyin: string;
  english: string;
}

interface MandarinPhrase {
  hanzi: string;
  pinyin: string;
  words: Word[];
  breakdown: string;
}

export interface SpeakingOption {
  id: number;
  english: string;
  mandarin: MandarinPhrase;
}

export interface ListeningOption {
  id: number;
  english: string;
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  mandarin: MandarinPrompt;
  options: SpeakingOption[];
}

interface SingleResponseQuestion extends BaseQuestion {
  type: "single_response";
  mandarin: MandarinPrompt;
  options: [SpeakingOption];
}

interface ListeningMultipleChoiceQuestion extends BaseQuestion {
  type: "listening_mc";
  mandarin: MandarinPrompt & {
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

// import courseData from "@/assets/data/course_content.json";
// import { Ionicons } from "@expo/vector-icons";

// export interface Lesson {
//     id: string;
//     title: string;
//     icon : keyof typeof Ionicons.glyphMap;
//     completionCount: number;
//     questions: Question[];
// }

// export interface Chapter {
//     id: number;
//     title: string;
//     lessons: Lesson[];
//     review?: Lesson;
// }
// export interface ConversationScenario {
//     id: string;
//     title: string;
//     icon: keyof typeof Ionicons.glyphMap;
//     isFree: boolean;
//     description: string;
//     goal: string;
//     tasks: string[];
//     difficulty: "Beginner" | "Intermediate" | "Advanced";
//     phrasebook: PhrasebookEntry[];
// }
// export interface PhrasebookEntry {
//     hanzi: string;
//     pinyin: string;
//     english: string;
// }

// export interface CourseData {
//     chapters: Chapter[];
//     scenarios: ConversationScenario[];
// }
// interface BaseQuestion {
//     id: number;
// } 
// interface MandarinPrompt {
//     hanzi: string;
//     pinyin: string;
// }
// interface Word {
//     hanzi: string;
//     pinyin: string;
//     english: string;
// }
// interface MandarinPhrase {
//     hanzi: string;
//     pinyin: string;
//     words: Word[];
//     breakdown: string;
// }
// interface SpeakingOption{
//     id: number;
//     english: string;
//     mandarin: MandarinPhrase;
// }
// interface listeningOption{
//     id: number;
//     english: string;
// }

// interface MultipleChoiceQuestion extends BaseQuestion {
//     type: "multiple_choice";
//     mandarin: MandarinPrompt;
//     options: SpeakingOption[];
// }
// interface SingleResponseQuestion extends BaseQuestion {
//     type: "single_response";
//     mandarin: MandarinPrompt;
//     options: [SpeakingOption];
   
// }
// interface ListeningMultipleChoiceQuestion extends BaseQuestion {
//     type: "listening_mc";
//     mandarin: MandarinPrompt & {
//         words: Word[];
//         breakdown: string;
//     };
//     options: listeningOption[];
//     correctOptionId: number;
// }
// // interface Question {
// //     id: number;
// //     type: "multiple_choice" | "single_response";
// //     mandarin: MandarinPrompt;
// //     options: SpeakingOption[];
// // }

// export type Question = MultipleChoiceQuestion | SingleResponseQuestion | ListeningMultipleChoiceQuestion;
// export const COURSE_DATA = courseData as unknown as CourseData;