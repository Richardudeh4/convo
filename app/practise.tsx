import LessonContent from "@/components/lessons/LessonContext";
import VocabularyIntroScreen from "@/components/lessons/VocabularyIntroScreen";
import { COURSE_DATA } from "@/constants/CourseData";
import { useAuth } from "@/ctx/AuthContext";
import {
  getAllProgress,
  isLessonUnlocked,
} from "@/lib/lessonProgress";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PractiseScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { rank } = useAuth();
  const [isStudyingVocabulary, setIsStudyingVocabulary] = useState(true);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [progressLoaded, setProgressLoaded] = useState(false);

  const allLessons = COURSE_DATA.chapters.flatMap((chapter) =>
    chapter.review ? [...chapter.lessons, chapter.review] : chapter.lessons,
  );

  const currentLesson = allLessons.find((lesson) => lesson.id === lessonId);
  const question = currentLesson ? currentLesson.questions : [];

  useEffect(() => {
    setIsStudyingVocabulary(true);
  }, [lessonId]);

  useEffect(() => {
    getAllProgress().then((savedProgress) => {
      setProgress(savedProgress);
      setProgressLoaded(true);
    });
  }, [lessonId]);

  if (!lessonId || question.length === 0) {
    return <Redirect href="/(tabs)/lessons" />;
  }

  if (progressLoaded && !isLessonUnlocked(lessonId, progress, rank)) {
    return <Redirect href="/(tabs)/lessons" />;
  }

  if (isStudyingVocabulary) {
    return (
      <SafeAreaView style={styles.container}>
        <VocabularyIntroScreen
          key={lessonId}
          questions={question}
          onStartLessson={() => setIsStudyingVocabulary(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LessonContent key={lessonId} lessonId={lessonId} questions={question} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
