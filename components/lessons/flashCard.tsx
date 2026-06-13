import { Word } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

const CARD_HEIGHT = 320;
const FLIP_SPRING = { friction: 9, tension: 72, useNativeDriver: true as const };
const PRESS_SPRING = { friction: 6, tension: 220, useNativeDriver: true as const };

export default function FlashCard({
  word,
  direction,
}: {
  word: Word;
  direction: "zh-en" | "en-zh";
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const pressAnimation = useRef(new Animated.Value(1)).current;
  const entranceAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    entranceAnimation.setValue(0);
    Animated.spring(entranceAnimation, {
      toValue: 1,
      friction: 8,
      tension: 52,
      useNativeDriver: true,
    }).start();
  }, [word.hanzi, direction, entranceAnimation]);

  const frontRotateY = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backRotateY = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [0, 0, 1, 1],
  });

  const flipLift = flipAnimation.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [0, -14, 0],
  });

  const flipScale = flipAnimation.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [1, 1.045, 1],
  });

  const entranceScale = entranceAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const entranceOpacity = entranceAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const animateFlip = (toValue: number, flipped: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(flipAnimation, {
      ...FLIP_SPRING,
      toValue,
    }).start();
    setIsFlipped(flipped);
  };

  const flipToFront = () => animateFlip(0, false);
  const flipToBack = () => animateFlip(180, true);

  const handlePressIn = () => {
    Animated.spring(pressAnimation, {
      ...PRESS_SPRING,
      toValue: 0.975,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnimation, {
      ...PRESS_SPRING,
      toValue: 1,
    }).start();
  };

  const renderFront = () => {
    if (direction === "en-zh") {
      return (
        <ThemedText style={styles.englishFront}>{word.english}</ThemedText>
      );
    }

    return (
      <View style={styles.mandarinContent}>
        <ThemedText style={styles.pinyin}>{word.pinyin}</ThemedText>
        <ThemedText style={styles.hanzi}>{word.hanzi}</ThemedText>
      </View>
    );
  };

  const renderBack = () => {
    if (direction === "en-zh") {
      return (
        <View style={styles.mandarinContent}>
          <ThemedText style={[styles.pinyin, styles.mandarinBackText]}>
            {word.pinyin}
          </ThemedText>
          <ThemedText style={[styles.hanzi, styles.mandarinBackText]}>
            {word.hanzi}
          </ThemedText>
        </View>
      );
    }

    return (
      <ThemedText style={[styles.englishBack, styles.mandarinBackText]}>
        {word.english}
      </ThemedText>
    );
  };

  return (
    <Pressable
      onPress={isFlipped ? flipToFront : flipToBack}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.perspective,
          {
            opacity: entranceOpacity,
            transform: [
              { scale: Animated.multiply(entranceScale, pressAnimation) },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.cardStage,
            {
              transform: [
                { perspective: 1200 },
                { translateY: flipLift },
                { scale: flipScale },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              {
                opacity: frontOpacity,
                transform: [{ rotateY: frontRotateY }],
              },
            ]}
          >
            <View style={styles.cardShine} />
            {renderFront()}
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              {
                opacity: backOpacity,
                transform: [{ rotateY: backRotateY }],
              },
            ]}
          >
            <View style={styles.cardBackGlow} />
            {renderBack()}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  perspective: {
    width: 340,
    height: CARD_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  cardStage: {
    width: "100%",
    height: "100%",
  },
  card: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    borderRadius: 28,
    paddingHorizontal: 32,
    paddingVertical: 48,
    overflow: "hidden",
  },
  cardFront: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e8ecf0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  cardBack: {
    backgroundColor: "#141b2d",
    position: "absolute",
    top: 0,
    borderWidth: 1,
    borderColor: Colors.primaryAccentColor + "55",
    shadowColor: Colors.primaryAccentColor,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 10,
  },
  cardShine: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.65)",
    opacity: 0.35,
  },
  cardBackGlow: {
    position: "absolute",
    bottom: -60,
    left: -20,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.primaryAccentColor,
    opacity: 0.12,
  },
  mandarinContent: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  pinyin: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: "90%",
  },
  hanzi: {
    fontSize: 30,
    lineHeight: 36,
    textAlign: "center",
    maxWidth: "90%",
  },
  mandarinBackText: {
    color: "white",
  },
  englishFront: {
    fontSize: 40,
    lineHeight: 48,
    textAlign: "center",
    fontWeight: "600",
    maxWidth: "90%",
  },
  englishBack: {
    fontSize: 40,
    lineHeight: 48,
    textAlign: "center",
    fontStyle: "italic",
    maxWidth: "90%",
  },
});
