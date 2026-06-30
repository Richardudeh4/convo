import { COURSE_DATA } from "@/constants/CourseData";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STATS_KEY = "lesson_progress";

export interface LessonProgress {
  [lessonId: string]: number;
}

const readProgress = async (): Promise<LessonProgress> => {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as LessonProgress;
  } catch {
    return {};
  }
};

const writeProgress = async (data: LessonProgress) => {
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(data));
};

export const incrementLessonCompleted = async (lessonId: string) => {
  const progress = await readProgress();
  progress[lessonId] = (progress[lessonId] || 0) + 1;
  await writeProgress(progress);
  return progress[lessonId];
};

export const getAllProgress = async (): Promise<LessonProgress> => {
  return await readProgress();
};

export function getOrderedLessonIds(): string[] {
  return COURSE_DATA.chapters.flatMap((chapter) => [
    ...chapter.lessons.map((lesson) => lesson.id),
    ...(chapter.review ? [chapter.review.id] : []),
  ]);
}

export function getChapterForLesson(lessonId: string) {
  return COURSE_DATA.chapters.find(
    (chapter) =>
      chapter.lessons.some((lesson) => lesson.id === lessonId) ||
      chapter.review?.id === lessonId,
  );
}

export function isReviewLesson(lessonId: string): boolean {
  const chapter = getChapterForLesson(lessonId);
  return chapter?.review?.id === lessonId;
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
  if (completedCount >= 7) return 1;
  return 0;
}

export function isLessonUnlocked(
  lessonId: string,
  progress: LessonProgress,
  rank: number,
): boolean {
  const chapter = getChapterForLesson(lessonId);
  if (!chapter || chapter.minRank > rank) {
    return false;
  }

  const ordered = getOrderedLessonIds();
  const index = ordered.indexOf(lessonId);
  if (index === -1) {
    return false;
  }

  if (isReviewLesson(lessonId)) {
    const regularLessonsComplete = chapter.lessons.every(
      (lesson) => (progress[lesson.id] ?? 0) >= 1,
    );
    if (!regularLessonsComplete) {
      return false;
    }
  }

  if (index === 0) {
    return true;
  }

  const previousLessonId = ordered[index - 1];
  const previousChapter = getChapterForLesson(previousLessonId);
  if (previousChapter && previousChapter.minRank > rank) {
    return false;
  }

  return (progress[previousLessonId] ?? 0) >= 1;
}

export function isChapterReviewUnlocked(
  chapterId: number,
  progress: LessonProgress,
  rank: number,
): boolean {
  const chapter = COURSE_DATA.chapters.find((item) => item.id === chapterId);
  if (!chapter?.review || chapter.minRank > rank) {
    return false;
  }

  return isLessonUnlocked(chapter.review.id, progress, rank);
}

export function getNextLessonId(lessonId: string): string | null {
  const ordered = getOrderedLessonIds();
  const index = ordered.indexOf(lessonId);
  if (index === -1 || index >= ordered.length - 1) {
    return null;
  }
  return ordered[index + 1];
}

export function getLessonById(lessonId: string) {
  for (const chapter of COURSE_DATA.chapters) {
    const lesson = chapter.lessons.find((item) => item.id === lessonId);
    if (lesson) return lesson;
    if (chapter.review?.id === lessonId) return chapter.review;
  }
  return undefined;
}

export function estimateLessonScrollY(lessonId: string): number {
  let y = 24;
  for (const chapter of COURSE_DATA.chapters) {
    y += 88;
    for (const lesson of chapter.lessons) {
      if (lesson.id === lessonId) return y;
      y += 100;
    }
    if (chapter.review) {
      if (chapter.review.id === lessonId) return y;
      y += 72;
    }
    y += 32;
  }
  return 0;
}

export function areLessonsAdjacent(
  completedLessonId: string,
  nextLessonId: string,
): boolean {
  const ordered = getOrderedLessonIds();
  const completedIndex = ordered.indexOf(completedLessonId);
  const nextIndex = ordered.indexOf(nextLessonId);
  return completedIndex !== -1 && nextIndex === completedIndex + 1;
}
