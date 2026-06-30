import { Chapter, COURSE_DATA, Lesson, RANK_LABELS } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import AnimatedLessonNode from "@/components/lessons/AnimatedLessonNode";
import PathConnector from "@/components/lessons/PathConnector";
import { useAuth } from "@/ctx/AuthContext";
import { useSpeakingListeningStats } from "@/hooks/useSpeakingListeningStats";
import {
  areLessonsAdjacent,
  computeRank,
  estimateLessonScrollY,
  getAllProgress,
  isChapterReviewUnlocked,
  isLessonUnlocked,
} from "@/lib/lessonProgress";
import {
  playLessonPathTransition,
  preloadLessonTransitionSounds,
  stopTransitionMusic,
} from "@/lib/lessonTransitionSounds";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";

const DIFFICULTY_COLOR: Record<string, string> = {
  A1: "#22c55e",
  A2: "#84cc16",
  B1: "#eab308",
  B2: "#f97316",
  C1: "#ef4444",
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function LessonsScreen() {
  const colors = Colors["light"];
  const router = useRouter();
  const { completedLessonId, advanceToLessonId } = useLocalSearchParams<{
    completedLessonId?: string;
    advanceToLessonId?: string;
  }>();
  const { rank: contextRank, refreshRank } = useAuth();
  const { stats, loading, refresh } = useSpeakingListeningStats();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [rank, setRank] = useState(contextRank);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [pathActive, setPathActive] = useState(false);
  const [transitionBlocking, setTransitionBlocking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const transitionKeyRef = useRef<string | null>(null);

  const loadProgress = useCallback(async () => {
    const savedProgress = await getAllProgress();
    setProgress(savedProgress);
    setRank(computeRank(savedProgress));
    await refreshRank();
    setProgressLoaded(true);
  }, [refreshRank]);

  useEffect(() => {
    void preloadLessonTransitionSounds();
    void loadProgress();
  }, [loadProgress]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      void loadProgress();

      return () => {
        void stopTransitionMusic();
      };
    }, [loadProgress, refresh]),
  );

  useEffect(() => {
    if (!completedLessonId || !progressLoaded) {
      return;
    }

    const transitionKey = `${completedLessonId}:${advanceToLessonId ?? ""}`;
    if (transitionKeyRef.current === transitionKey) {
      return;
    }
    transitionKeyRef.current = transitionKey;

    const runTransition = async () => {
      setTransitionBlocking(true);
      setCelebratingId(completedLessonId);

      try {
        scrollRef.current?.scrollTo({
          y: Math.max(estimateLessonScrollY(completedLessonId) - 120, 0),
          animated: true,
        });

        try {
          await playLessonPathTransition(!!advanceToLessonId);
        } catch (error) {
          if (__DEV__) {
            console.warn("[lessons] Transition audio failed:", error);
          }
        }

        await delay(700);

        if (advanceToLessonId) {
          setPathActive(true);
          setUnlockingId(advanceToLessonId);

          scrollRef.current?.scrollTo({
            y: Math.max(estimateLessonScrollY(advanceToLessonId) - 160, 0),
            animated: true,
          });

          await delay(1100);
          setPathActive(false);
          setUnlockingId(null);
          await delay(300);

          if (isLessonUnlocked(advanceToLessonId, progress, rank)) {
            router.push({
              pathname: "/practise",
              params: { lessonId: advanceToLessonId },
            });
          }
        }

        await delay(400);
        setCelebratingId(null);
        setTransitionBlocking(false);

        router.setParams({
          completedLessonId: "",
          advanceToLessonId: "",
        });
      } finally {
        await stopTransitionMusic();
      }
    };

    void runTransition();
  }, [advanceToLessonId, completedLessonId, progress, progressLoaded, rank, router]);

  const handleLessonPress = (lesson: Lesson) => {
    if (transitionBlocking || !isLessonUnlocked(lesson.id, progress, rank)) {
      return;
    }
    router.push({ pathname: "/practise", params: { lessonId: lesson.id } });
  };

  const handleReviewButtonPress = (chapter: Chapter) => {
    if (transitionBlocking || !isChapterReviewUnlocked(chapter.id, progress, rank)) {
      return;
    }
    router.push({ pathname: "/practise", params: { lessonId: chapter.review!.id } });
  };

  const renderLessonNode = (lesson: Lesson, index: number, chapter: Chapter) => {
    const alignment = index % 2 === 0 ? "flex-start" : "flex-end";
    const completionCount = progress[lesson.id] || 0;
    const chapterLocked = chapter.minRank > rank;
    const lessonLocked = !isLessonUnlocked(lesson.id, progress, rank);
    const isLocked = chapterLocked || lessonLocked;
    const nextLessonInChapter = chapter.lessons[index + 1];
    const showPathConnector =
      pathActive &&
      !!completedLessonId &&
      !!advanceToLessonId &&
      lesson.id === completedLessonId &&
      nextLessonInChapter?.id === advanceToLessonId &&
      areLessonsAdjacent(completedLessonId, advanceToLessonId);

    return (
      <View key={lesson.id}>
        <AnimatedLessonNode
          lesson={lesson}
          alignment={alignment}
          completionCount={completionCount}
          isLocked={isLocked}
          chapterLocked={chapterLocked}
          isCelebrating={celebratingId === lesson.id}
          isUnlocking={unlockingId === lesson.id}
          backgroundColor={colors.background}
          onPress={() => handleLessonPress(lesson)}
        />
        {showPathConnector ? <PathConnector active={pathActive} /> : null}
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
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: difficultyColor + "22", borderColor: difficultyColor },
            ]}
          >
            <ThemedText style={[styles.difficultyLabel, { color: difficultyColor }]}>
              {chapter.difficulty}
            </ThemedText>
          </View>
        </View>
        <ThemedText
          type="title"
          style={[styles.chapterTitleText, isLocked && { color: Colors.subduedTextColor }]}
        >
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
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: Colors.borderColor }]}>
          <TouchableOpacity>
            <ThemedText style={styles.headerTitle}>This week</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: Colors.subduedTextColor }]}>
              In reviews
            </ThemedText>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.statItem}>
              <View style={styles.statValueContainer}>
                <ThemedText>{loading ? "-" : Math.floor(stats?.minutesSpoken ?? 0)} </ThemedText>
                <Ionicons name="arrow-up" size={14} color="#34C759" style={{ marginLeft: 2 }} />
                <ThemedText style={styles.statChangePositive}>
                  {loading ? "-" : Math.floor(stats?.weeklyChange?.spoken ?? 0)}
                </ThemedText>
              </View>
              <ThemedText style={[styles.statLabel, { color: Colors.subduedTextColor }]}>
                Minutes spoken
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={[styles.headerSeparator, { backgroundColor: Colors.borderColor }]} />
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.statItem}>
              <View style={styles.statValueContainer}>
                <ThemedText>{loading ? "-" : Math.floor(stats?.minutesListened ?? 0)} </ThemedText>
                <Ionicons name="arrow-up" size={14} color="#34C759" style={{ marginLeft: 2 }} />
                <ThemedText style={styles.statChangePositive}>
                  {loading ? "-" : Math.floor(stats?.weeklyChange?.listened ?? 0)}
                </ThemedText>
              </View>
              <ThemedText style={[styles.statLabel, { color: Colors.subduedTextColor }]}>
                Minutes listened
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={[styles.rankBadge, { backgroundColor: Colors.primaryAccentColor + "22" }]}>
            <ThemedText style={[styles.rankText, { color: Colors.primaryAccentColor }]}>
              {RANK_LABELS[rank]}
            </ThemedText>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          scrollEnabled={!transitionBlocking}
        >
          {COURSE_DATA.chapters.map((chapter) => {
            const chapterLocked = chapter.minRank > rank;
            const reviewLocked = !isChapterReviewUnlocked(chapter.id, progress, rank);
            return (
              <View key={chapter.id} style={styles.chapterContainer}>
                {renderChapterHeader(chapter)}
                <View style={styles.lessonsWrapper}>
                  {chapter.lessons.map((lesson, index) =>
                    renderLessonNode(lesson, index, chapter),
                  )}
                </View>
                {chapter.review && (
                  <TouchableOpacity
                    onPress={() => handleReviewButtonPress(chapter)}
                    disabled={reviewLocked || transitionBlocking}
                    style={[
                      styles.practiceChapterButton,
                      {
                        backgroundColor: reviewLocked
                          ? Colors.borderColor
                          : Colors.primaryAccentColor,
                      },
                    ]}
                  >
                    <Ionicons
                      name={reviewLocked ? "lock-closed" : "flash"}
                      size={20}
                      color="#FFF"
                    />
                    <ThemedText style={styles.practiceChapterButtonText}>
                      {chapterLocked
                        ? "Locked"
                        : reviewLocked
                          ? "Complete all lessons first"
                          : `Practice '${chapter.title}'`}
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
