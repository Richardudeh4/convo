import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const PEEK_HIDDEN_Y = 20;
const PEEK_UP_Y = -10;

function AnimatedStreakCat() {
  const translateY = useSharedValue(PEEK_HIDDEN_Y);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withDelay(600, withTiming(PEEK_HIDDEN_Y, { duration: 0 })),
        withSpring(PEEK_UP_Y, {
          damping: 12,
          stiffness: 220,
          mass: 0.7,
        }),
        withDelay(
          450,
          withTiming(PEEK_HIDDEN_Y, {
            duration: 380,
            easing: Easing.in(Easing.cubic),
          }),
        ),
        withDelay(900, withTiming(PEEK_HIDDEN_Y, { duration: 0 })),
      ),
      -1,
      false,
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.catPeekWindow}>
      <Animated.Image
        source={require("@/assets/images/cat.png")}
        style={[styles.catImage, animatedStyle]}
        resizeMode="contain"
      />
    </View>
  );
}

interface StatsRowProps {
  loading: boolean;
  minutesSpoken: number;
  minutesListened: number;
  weeklySpokenChange: number;
  weeklyListenedChange: number;
  conversationTurns: number;
  currentStreak: number;
}

function StatChip({
  label,
  value,
  weeklyChange,
  loading,
}: {
  label: string;
  value: string;
  weeklyChange?: number;
  loading: boolean;
}) {
  return (
    <View style={styles.statChip}>
      <View style={styles.statValueRow}>
        <ThemedText style={styles.statValue}>{loading ? "—" : value}</ThemedText>
        {weeklyChange !== undefined && !loading ? (
          <>
            <Ionicons name="arrow-up" size={12} color="#34C759" />
            <ThemedText style={styles.statChange}>{Math.floor(weeklyChange)}</ThemedText>
          </>
        ) : null}
      </View>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

export default function StatsRow({
  loading,
  minutesSpoken,
  minutesListened,
  weeklySpokenChange,
  weeklyListenedChange,
  conversationTurns,
  currentStreak,
}: StatsRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.streakChip}>
        <AnimatedStreakCat />
        <ThemedText style={styles.streakValue}>
          {loading ? "—" : currentStreak}
        </ThemedText>
        <ThemedText style={styles.streakLabel}>day streak</ThemedText>
      </View>

      <View style={styles.statsGrid}>
        <StatChip
          label="Min. spoken"
          value={String(Math.floor(minutesSpoken))}
          weeklyChange={weeklySpokenChange}
          loading={loading}
        />
        <StatChip
          label="Min. listened"
          value={String(Math.floor(minutesListened))}
          weeklyChange={weeklyListenedChange}
          loading={loading}
        />
        <StatChip
          label="Roleplay turns"
          value={String(conversationTurns)}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  streakChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    paddingLeft: 10,
    borderRadius: 20,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    overflow: "visible",
  },
  catPeekWindow: {
    width: 34,
    height: 24,
    overflow: "hidden",
    justifyContent: "flex-end",
    marginTop: -2,
  },
  catImage: {
    width: 38,
    height: 38,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ea580c",
  },
  streakLabel: {
    fontSize: 13,
    color: Colors.subduedTextColor,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  statChip: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: "center",
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  statChange: {
    fontSize: 12,
    fontWeight: "700",
    color: "#34C759",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.subduedTextColor,
    marginTop: 4,
    textAlign: "center",
  },
});
