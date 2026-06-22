import { Chapter, COURSE_DATA, Lesson, RANK_LABELS } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/ctx/AuthContext";
import { useSpeakingListeningStats } from "@/hooks/useSpeakingListeningStats";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { getAllProgress, computeRank } from "@/lib/lessonProgress";

const MAX_STARS = 3;

const DIFFICULTY_COLOR: Record<string, string> = {
  A1: "#22c55e",
  A2: "#84cc16",
  B1: "#eab308",
  B2: "#f97316",
  C1: "#ef4444",
};

export default function LessonsScreen() {
    const colors = Colors["light"];
    const router = useRouter();
    const { rank: contextRank } = useAuth();
    const {stats, loading, refresh} = useSpeakingListeningStats();
    const [progress, setProgress] = useState<Record<string, number>>({});
    const [rank, setRank] = useState(contextRank);

    useEffect(() => {
      loadProgress();
    }, []);

    const loadProgress = async () => {
      const savedProgress = await getAllProgress();
      setProgress(savedProgress);
      setRank(computeRank(savedProgress));
    };

    useFocusEffect(
        useCallback(() => {
            refresh();
            loadProgress();
        }, [refresh]),
    );

    const handleLessonPress = (lesson: Lesson, chapter: Chapter) => {
      if (chapter.minRank > rank) return;
      router.push({pathname: "/practise", params: {lessonId: lesson.id}});
    };

    const handleReviewButtonPress = (chapter: Chapter) => {
      if (chapter.minRank > rank) return;
      if(chapter.review){
        router.push({pathname: "/practise", params: {lessonId: chapter.review.id}});
      }
    };

    const renderCompletionStars = (count: number) => {
        const elements  = [];
        const starsToDisplay = Math.min(count, MAX_STARS);
        for (let i = 1; i <= MAX_STARS; i++) {
            elements.push(
              <Ionicons
                key={`star-${i}`}
                name={i <= starsToDisplay ? "star" : "star-outline"}
                size={20}
                color={Colors.primaryAccentColor}
                style={styles.starIcon}
              />
            );
        }
        if(count > MAX_STARS){
            const extraCount = count - MAX_STARS;
            elements.push(
              <ThemedText key="extra-count" style={[styles.extraCountText, {color: Colors.subduedTextColor}]}>
                +{extraCount}
              </ThemedText>
            );
        }
        return <View style={styles.completionStarsContainer}>{elements}</View>;
    };

    const renderLessonNode = (lesson: Lesson, index: number, chapter: Chapter) => {
        const alignment = index % 2 === 0 ? "flex-start" : "flex-end";
        const completionCount = progress[lesson.id] || 0;
        const isMastered = completionCount >= MAX_STARS;
        const isLocked = chapter.minRank > rank;

        return (
            <View key={lesson.id} style={[styles.lessonNodeContainer, {alignItems: alignment}]}>
               <TouchableOpacity
                 style={[
                   styles.lessonBubble,
                   {
                     backgroundColor: isLocked ? "#f3f4f6" : colors.background,
                     borderColor: isLocked
                       ? Colors.borderColor
                       : isMastered
                       ? Colors.primaryAccentColor
                       : Colors.borderColor,
                     opacity: isLocked ? 0.65 : 1,
                   },
                 ]}
                 onPress={() => handleLessonPress(lesson, chapter)}
                 activeOpacity={isLocked ? 1 : 0.7}
               >
                 <Ionicons
                   name={isLocked ? "lock-closed-outline" : lesson.icon}
                   size={28}
                   color={isLocked ? Colors.subduedTextColor : Colors.primaryAccentColor}
                 />
                 <View style={styles.lessonTextContainer}>
                   <ThemedText style={[styles.lessonTitle, isLocked && {color: Colors.subduedTextColor}]}>
                     {lesson.title}
                   </ThemedText>
                   {isLocked
                     ? <ThemedText style={styles.lockedLabel}>Locked</ThemedText>
                     : renderCompletionStars(completionCount)}
                 </View>
               </TouchableOpacity>
            </View>
        );
    };

    const renderChapterHeader = (chapter: Chapter) => {
      const isLocked = chapter.minRank > rank;
      const difficultyColor = DIFFICULTY_COLOR[chapter.difficulty] ?? "#6b7280";
      return (
        <View style={styles.chapterHeader}>
          <View style={styles.chapterHeaderTop}>
            <ThemedText style={styles.chapterNumberText}>Chapter {chapter.id}</ThemedText>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + "22", borderColor: difficultyColor }]}>
              <ThemedText style={[styles.difficultyLabel, { color: difficultyColor }]}>
                {chapter.difficulty}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="title" style={[styles.chapterTitleText, isLocked && {color: Colors.subduedTextColor}]}>
            {chapter.title}
          </ThemedText>
          {isLocked && (
            <View style={styles.unlockHint}>
              <Ionicons name="lock-closed" size={12} color={Colors.subduedTextColor} />
              <ThemedText style={styles.unlockHintText}>
                Unlocks at {RANK_LABELS[chapter.minRank]}
              </ThemedText>
            </View>
          )}
        </View>
      );
    };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{flex: 1, backgroundColor: colors.background}}
    >
      <View style={styles.container}>
        <View style={[styles.header, {backgroundColor: Colors.borderColor}]}>
          <TouchableOpacity>
            <ThemedText style={styles.headerTitle}>This week</ThemedText>
            <ThemedText style={[styles.headerSubtitle, {color: Colors.subduedTextColor}]}>
              In reviews
            </ThemedText>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.statItem}>
              <View style={styles.statValueContainer}>
                <ThemedText>{loading ? "-" : Math.floor(stats?.minutesSpoken ?? 0)} </ThemedText>
                <Ionicons name="arrow-up" size={14} color="#34C759" style={{marginLeft: 2}}/>
                <ThemedText style={styles.statChangePositive}>
                  {loading ? "-" : Math.floor(stats?.weeklyChange?.spoken ?? 0)}
                </ThemedText>
              </View>
              <ThemedText style={[styles.statLabel, {color: Colors.subduedTextColor}]}>
                Minutes spoken
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={[styles.headerSeparator, {backgroundColor: Colors.borderColor}]}/>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.statItem}>
              <View style={styles.statValueContainer}>
                <ThemedText>{loading ? "-" : Math.floor(stats?.minutesListened ?? 0)} </ThemedText>
                <Ionicons name="arrow-up" size={14} color="#34C759" style={{marginLeft: 2}}/>
                <ThemedText style={styles.statChangePositive}>
                  {loading ? "-" : Math.floor(stats?.weeklyChange?.listened ?? 0)}
                </ThemedText>
              </View>
              <ThemedText style={[styles.statLabel, {color: Colors.subduedTextColor}]}>
                Minutes listened
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={[styles.rankBadge, {backgroundColor: Colors.primaryAccentColor + "22"}]}>
            <ThemedText style={[styles.rankText, {color: Colors.primaryAccentColor}]}>
              {RANK_LABELS[rank]}
            </ThemedText>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {COURSE_DATA.chapters.map((chapter) => {
            const isLocked = chapter.minRank > rank;
            return (
              <View key={chapter.id} style={styles.chapterContainer}>
                {renderChapterHeader(chapter)}
                <View style={styles.lessonsWrapper}>
                  {chapter.lessons.map((lesson, index) =>
                    renderLessonNode(lesson, index, chapter)
                  )}
                </View>
                {chapter.review && (
                  <TouchableOpacity
                    onPress={() => handleReviewButtonPress(chapter)}
                    disabled={isLocked}
                    style={[
                      styles.practiceChapterButton,
                      { backgroundColor: isLocked ? Colors.borderColor : Colors.primaryAccentColor },
                    ]}
                  >
                    <Ionicons name={isLocked ? "lock-closed" : "flash"} size={20} color="#FFF" />
                    <ThemedText style={styles.practiceChapterButtonText}>
                      {isLocked ? "Locked" : `Practice '${chapter.title}'`}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      flexWrap: "wrap",
      gap: 8,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "bold",
    },
    headerSubtitle: {
      fontSize: 14,
      marginTop: -2,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    statItem: {
      alignItems: "center",
    },
    statValueContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 2,
    },
    statChangePositive: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#34C759",
    },
    statLabel: {
      fontSize: 11,
      fontWeight: "600",
      marginTop: -2,
    },
    headerSeparator: {
      width: 1,
      height: 24,
      marginRight: -8,
    },
    rankBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    rankText: {
      fontSize: 12,
      fontWeight: "700",
    },
    scrollContainer: {
      paddingTop: 24,
      paddingBottom: 48,
      paddingHorizontal: 20,
    },
    chapterContainer: {
      marginBottom: 32,
    },
    chapterHeader: {
      marginBottom: 24,
    },
    chapterHeaderTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    chapterNumberText: {
      fontSize: 13,
      fontWeight: "bold",
      color: "#8e8e93",
      textTransform: "uppercase",
    },
    difficultyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      borderWidth: 1,
    },
    difficultyLabel: {
      fontSize: 11,
      fontWeight: "700",
    },
    chapterTitleText: {
      marginTop: 2,
    },
    unlockHint: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
    },
    unlockHintText: {
      fontSize: 12,
      color: Colors.subduedTextColor,
    },
    lessonsWrapper: {
      gap: 20,
    },
    lessonNodeContainer: {
      minHeight: 80,
      justifyContent: "center",
    },
    lessonBubble: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 24,
      borderWidth: 2,
      width: "80%",
      gap: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lessonTextContainer: {
      flex: 1,
    },
    lessonTitle: {
      fontSize: 16,
      fontWeight: "600",
      flex: 1,
      marginBottom: 4,
    },
    lockedLabel: {
      fontSize: 12,
      color: Colors.subduedTextColor,
      fontWeight: "500",
    },
    completionStarsContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    starIcon: {
      marginRight: 2,
    },
    extraCountText: {
      marginLeft: 4,
      fontSize: 14,
      fontWeight: "bold",
    },
    practiceChapterButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 24,
      marginBottom: 8,
      alignSelf: "center",
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 6,
    },
    practiceChapterButtonText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "bold",
    },
});
