import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

const MAX_STARS = 3;

export default function CompletionStars({
  count,
  animateLatest = false,
}: {
  count: number;
  animateLatest?: boolean;
}) {
  const scales = useRef(
    Array.from({ length: MAX_STARS }, () => new Animated.Value(1)),
  ).current;

  useEffect(() => {
    if (!animateLatest || count <= 0) {
      return;
    }

    const latestIndex = Math.min(count, MAX_STARS) - 1;
    scales[latestIndex].setValue(0.4);

    Animated.sequence([
      Animated.spring(scales[latestIndex], {
        toValue: 1.35,
        friction: 4,
        tension: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scales[latestIndex], {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animateLatest, count, scales]);

  const starsToDisplay = Math.min(count, MAX_STARS);

  return (
    <View style={styles.container}>
      {Array.from({ length: MAX_STARS }, (_, index) => {
        const filled = index < starsToDisplay;
        return (
          <Animated.View
            key={`star-${index}`}
            style={{ transform: [{ scale: scales[index] }] }}
          >
            <Ionicons
              name={filled ? "star" : "star-outline"}
              size={20}
              color={Colors.primaryAccentColor}
              style={styles.starIcon}
            />
          </Animated.View>
        );
      })}
      {count > MAX_STARS ? (
        <ThemedText style={styles.extraCountText}>+{count - MAX_STARS}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    color: Colors.subduedTextColor,
  },
});
