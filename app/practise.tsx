import { COURSE_DATA } from "@/constants/CourseData";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function PractiseScreen() {
    const {lessonId} = useLocalSearchParams();
    const allLessons = COURSE_DATA.chapters.flatMap((c) => c.review ? [...c.lessons, c.review] : c.lessons);
  return (
    <View>
      <Text>Practise</Text>
    </View>
  );
}