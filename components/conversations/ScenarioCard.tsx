import { ConversationScenario } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: "#22c55e",
  Intermediate: "#eab308",
  Advanced: "#ef4444",
};

export default function ScenarioCard({
  scenario,
  locked,
  onPress,
}: {
  scenario: ConversationScenario;
  locked: boolean;
  onPress: () => void;
}) {
  const difficultyColor = DIFFICULTY_COLOR[scenario.difficulty] ?? Colors.subduedTextColor;

  return (
    <Pressable
      style={[styles.card, locked && styles.cardLocked]}
      onPress={onPress}
      disabled={false}
    >
      <View style={[styles.iconWrap, locked && styles.iconWrapLocked]}>
        {locked ? (
          <Ionicons name="lock-closed" size={24} color={Colors.subduedTextColor} />
        ) : (
          <Ionicons name={scenario.icon} size={24} color={Colors.primaryAccentColor} />
        )}
      </View>
      <View style={styles.body}>
        <ThemedText style={[styles.title, locked && styles.titleLocked]}>
          {scenario.title}
        </ThemedText>
        <ThemedText style={styles.description} numberOfLines={2}>
          {scenario.description}
        </ThemedText>
        <View style={styles.metaRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: difficultyColor + "22", borderColor: difficultyColor },
            ]}
          >
            <ThemedText style={[styles.badgeText, { color: difficultyColor }]}>
              {scenario.difficulty}
            </ThemedText>
          </View>
          <ThemedText style={styles.taskCount}>
            {scenario.tasks.length} tasks
          </ThemedText>
          {scenario.isFree ? (
            <View style={styles.freeBadge}>
              <ThemedText style={styles.freeText}>Free</ThemedText>
            </View>
          ) : locked ? (
            <ThemedText style={styles.premiumLabel}>Premium</ThemedText>
          ) : null}
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={locked ? Colors.subduedTextColor : Colors.primaryAccentColor}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.borderColor,
    backgroundColor: "#fff",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLocked: {
    opacity: 0.85,
    backgroundColor: "#f9fafb",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryAccentColor + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapLocked: {
    backgroundColor: "#e5e7eb",
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  titleLocked: {
    color: Colors.subduedTextColor,
  },
  description: {
    fontSize: 13,
    color: Colors.subduedTextColor,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  taskCount: {
    fontSize: 12,
    color: Colors.subduedTextColor,
  },
  freeBadge: {
    backgroundColor: Colors.primaryAccentColor + "22",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  freeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primaryAccentColor,
  },
  premiumLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.subduedTextColor,
  },
});
