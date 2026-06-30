import { Lesson } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import CompletionStars from "@/components/lessons/CompletionStars";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";

const MAX_STARS = 3;

export default function AnimatedLessonNode({
  lesson,
  alignment,
  completionCount,
  isLocked,
  chapterLocked,
  isCelebrating,
  isUnlocking,
  backgroundColor,
  onPress,
}: {
  lesson: Lesson;
  alignment: "flex-start" | "flex-end";
  completionCount: number;
  isLocked: boolean;
  chapterLocked: boolean;
  isCelebrating: boolean;
  isUnlocking: boolean;
  backgroundColor: string;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const unlockAnim = useRef(new Animated.Value(isLocked ? 0 : 1)).current;
  const isMastered = completionCount >= MAX_STARS;

  useEffect(() => {
    if (!isCelebrating) return;

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.08,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isCelebrating, scaleAnim]);

  useEffect(() => {
    if (!isUnlocking) return;

    unlockAnim.setValue(0);
    Animated.sequence([
      Animated.spring(unlockAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.12,
        friction: 4,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isUnlocking, scaleAnim, unlockAnim]);

  const bubbleBorderColor = isCelebrating || isUnlocking
    ? Colors.primaryAccentColor
    : isLocked
      ? Colors.borderColor
      : isMastered
        ? Colors.primaryAccentColor
        : Colors.borderColor;

  return (
    <View style={[styles.lessonNodeContainer, { alignItems: alignment }]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }], width: "80%" }}>
        <TouchableOpacity
          style={[
            styles.lessonBubble,
            {
              backgroundColor: isLocked ? "#f3f4f6" : backgroundColor,
              borderColor: bubbleBorderColor,
              opacity: isLocked ? 0.65 : 1,
              shadowOpacity: isCelebrating || isUnlocking ? 0.2 : 0.08,
              shadowRadius: isCelebrating || isUnlocking ? 12 : 8,
            },
          ]}
          onPress={onPress}
          activeOpacity={isLocked ? 1 : 0.7}
          disabled={isLocked || isCelebrating || isUnlocking}
        >
          {isLocked ? (
            <Ionicons name="lock-closed-outline" size={28} color={Colors.subduedTextColor} />
          ) : (
            <Animated.View style={{ transform: [{ scale: unlockAnim }] }}>
              <Ionicons name={lesson.icon} size={28} color={Colors.primaryAccentColor} />
            </Animated.View>
          )}
          <View style={styles.lessonTextContainer}>
            <ThemedText
              style={[styles.lessonTitle, isLocked && { color: Colors.subduedTextColor }]}
            >
              {lesson.title}
            </ThemedText>
            {isLocked ? (
              <ThemedText style={styles.lockedLabel}>
                {chapterLocked ? "Chapter locked" : "Complete previous lesson"}
              </ThemedText>
            ) : (
              <CompletionStars
                count={completionCount}
                animateLatest={isCelebrating}
              />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    width: "100%",
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
});
