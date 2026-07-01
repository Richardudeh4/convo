import { Ionicons } from "@expo/vector-icons";

export const LEVELS = [
  {
    id: "beginner",
    title: "Beginner",
    description: "I know a few words or nothing at all",
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "I can hold a conversation but I'm not fluent",
  },
  {
    id: "Advanced",
    title: "Advanced",
    description: "I can hold a conversation and I'm fluent",
  },
] as const;

export const MOTIVATIONS = [
  { id: "travel", title: "Travel", icon: "airplane-outline" as const },
  { id: "work", title: "Work", icon: "briefcase-outline" as const },
  { id: "family", title: "Family", icon: "people-outline" as const },
  { id: "culture", title: "Culture", icon: "book-outline" as const },
  { id: "hobby", title: "Hobby", icon: "game-controller-outline" as const },
] as const;

export const INTERESTS = [
  "Food & Dining",
  "Business",
  "Daily Life",
  "Technology",
  "Art",
  "Music",
  "Politics",
  "Sports",
] as const;

export function getLevelTitle(id: string | null | undefined): string {
  if (!id) return "Not set";
  return LEVELS.find((l) => l.id === id)?.title ?? id;
}

export function getMotivationTitle(id: string): string {
  return MOTIVATIONS.find((m) => m.id === id)?.title ?? id;
}

export type MotivationIcon = (typeof MOTIVATIONS)[number]["icon"];
