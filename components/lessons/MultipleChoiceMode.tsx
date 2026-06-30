import { ListeningOption, SpeakingOption } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";

type McOption = SpeakingOption | ListeningOption;

export interface QuestionFeedback {
  english?: string;
  spanish?: string;
  romanization?: string;
}

export default function MultipleChoiceMode({
  options,
  selectedOption,
  handleOptionPress,
  optionSelectionAnimation,
  isLoading,
  showResult,
  isCorrect,
  onContinue,
  onRetry,
  feedback,
  answerRevealAnim,
  variant = "speaking",
}: {
  options: McOption[];
  selectedOption: number | null;
  handleOptionPress: (id: number) => void;
  optionSelectionAnimation: Animated.Value;
  isLoading: boolean;
  showResult: boolean;
  isCorrect: boolean;
  onContinue: () => void;
  onRetry: () => void;
  feedback?: QuestionFeedback;
  answerRevealAnim?: Animated.Value;
  variant?: "speaking" | "listening";
}) {
  const isOptionDisabled = (optionId: number) =>
    isLoading || showResult || (selectedOption !== null && selectedOption !== optionId);

  const resultLabel =
    variant === "listening"
      ? isCorrect
        ? "Correct!"
        : "Not quite"
      : isCorrect
        ? "Nice work!"
        : "Try again";

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: optionSelectionAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.85],
          }),
        }}
      >
        <ThemedText style={styles.sectionTitle} type="subtitle">
          Choose your response:
        </ThemedText>
      </Animated.View>

      <ScrollView
        style={styles.optionsScrollView}
        contentContainerStyle={styles.optionsContentContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isLoading && !showResult}
      >
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          return (
            <View key={option.id} style={styles.optionContainer}>
              <Pressable
                onPress={() => handleOptionPress(option.id)}
                disabled={isOptionDisabled(option.id)}
                style={[
                  styles.optionButton,
                  {
                    borderColor: isSelected
                      ? Colors.primaryAccentColor
                      : Colors.borderColor,
                    backgroundColor: isSelected ? "#f0fdfa" : "#fff",
                  },
                  isSelected && styles.selectedOption,
                ]}
              >
                <ThemedText style={styles.optionText}>{option.english}</ThemedText>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {showResult && (
        <Animated.View
          style={[
            styles.feedbackWrapper,
            answerRevealAnim
              ? {
                  opacity: answerRevealAnim,
                  transform: [
                    {
                      translateY: answerRevealAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }
              : undefined,
          ]}
        >
          <View style={styles.feedbackCard}>
            <ThemedText
              style={[
                styles.resultLabel,
                isCorrect ? styles.correctLabel : styles.incorrectLabel,
              ]}
            >
              {resultLabel}
            </ThemedText>

            {feedback?.english ? (
              <ThemedText style={styles.feedbackEnglish}>{feedback.english}</ThemedText>
            ) : null}

            {feedback?.spanish ? (
              <ThemedText style={styles.feedbackSpanish}>{feedback.spanish}</ThemedText>
            ) : null}

            {feedback?.romanization ? (
              <ThemedText style={styles.feedbackRomanization}>
                {feedback.romanization}
              </ThemedText>
            ) : null}

            <Pressable
              style={styles.continueButton}
              onPress={isCorrect ? onContinue : onRetry}
            >
              <ThemedText style={styles.continueButtonText}>
                {isCorrect ? "Continue" : "Retry"}
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  optionsScrollView: {
    flex: 1,
  },
  optionsContentContainer: {
    paddingBottom: 0,
  },
  optionContainer: {
    marginBottom: 16,
  },
  optionButton: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    overflow: "visible",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  selectedOption: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.2,
      },
      android: {
        borderWidth: 3,
      },
    }),
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  feedbackWrapper: {
    marginTop: 8,
  },
  feedbackCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 20,
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  correctLabel: {
    color: "#059669",
  },
  incorrectLabel: {
    color: "#dc2626",
  },
  feedbackEnglish: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  feedbackSpanish: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  feedbackRomanization: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: Colors.primaryAccentColor,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    width: "100%",
    alignItems: "center",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
