import { ThemedText } from "@/components/themed-text";
import { COURSE_DATA, RANK_LABELS } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

function getNextChapterHint(rank: number): string | null {
  const next = COURSE_DATA.chapters.find((ch) => ch.minRank > rank);
  if (!next) return null;
  return `Next chapter unlocks at ${RANK_LABELS[next.minRank]}`;
}

export default function ProgressCard({
  lessonsCompleted,
  totalStars,
  rank,
}: {
  lessonsCompleted: number;
  totalStars: number;
  rank: number;
}) {
  const nextHint = getNextChapterHint(rank);
  const totalLessons = COURSE_DATA.chapters.reduce(
    (sum, ch) => sum + ch.lessons.length,
    0,
  );

  return (
    <View style={styles.card}>
      <ThemedText style={styles.title}>Learning progress</ThemedText>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Ionicons name="checkmark-circle" size={22} color={Colors.primaryAccentColor} />
          <ThemedText style={styles.statValue}>{lessonsCompleted}</ThemedText>
          <ThemedText style={styles.statLabel}>Lessons done</ThemedText>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Ionicons name="star" size={22} color="#eab308" />
          <ThemedText style={styles.statValue}>{totalStars}</ThemedText>
          <ThemedText style={styles.statLabel}>Total stars</ThemedText>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Ionicons name="layers" size={22} color={Colors.subduedTextColor} />
          <ThemedText style={styles.statValue}>{totalLessons}</ThemedText>
          <ThemedText style={styles.statLabel}>In course</ThemedText>
        </View>
      </View>
      {nextHint ? (
        <View style={styles.hintRow}>
          <Ionicons name="lock-open-outline" size={14} color={Colors.subduedTextColor} />
          <ThemedText style={styles.hint}>{nextHint}</ThemedText>
        </View>
      ) : (
        <ThemedText style={styles.hint}>All chapters unlocked — keep going!</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
    color: Colors.subduedTextColor,
    textAlign: "center",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.borderColor,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
  },
  hint: {
    flex: 1,
    fontSize: 13,
    color: Colors.subduedTextColor,
  },
});
