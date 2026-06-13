import LessonContent from "@/components/lessons/LessonContext";
import VocabularyIntroScreen from "@/components/lessons/VocabularyIntroScreen";
import { COURSE_DATA } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PractiseScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [isStudyingVocabulary, setIsStudyingVocabulary] =
    useState<boolean>(true);
  const allLessons = COURSE_DATA.chapters.flatMap((c) =>
    c.review ? [...c.lessons, c.review] : c.lessons,
  );

  const currentLesson = allLessons.find((l) => l.id === lessonId);

  const question = currentLesson ? currentLesson?.questions : [];

  if (question.length === 0) {
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
      <LessonContent lessonId={lessonId} questions={question} />
    </SafeAreaView>
  ); 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
