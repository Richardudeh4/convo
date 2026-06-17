import { ListeningOption, SpeakingOption } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
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

export default function MultipleChoiceMode({
  options,
  selectedOption,
  handleOptionPress,
  optionSelectionAnimation,
  isLoading,
  showResult,
  variant = "speaking",
}: {
  options: McOption[];
  selectedOption: number | null;
  handleOptionPress: (id: number) => void;
  optionSelectionAnimation: Animated.Value;
  isLoading: boolean;
  showResult: boolean;
  variant?: "speaking" | "listening";
}) {
  const isOptionDisabled = (optionId: number) =>
    isLoading ||
    showResult ||
    (selectedOption !== null && selectedOption !== optionId);

  return (
    <View style={styles.container}>
      <View style={styles.promptContainer}>
        <Animated.View
          style={{
            opacity: optionSelectionAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
            transform: [
              {
                translateY: optionSelectionAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              },
            ],
          }}
        >
          <ThemedText style={styles.sectionTitle} type="subtitle">
            Choose your response:
          </ThemedText>
        </Animated.View>
        {variant === "speaking" && (
          <Animated.View
            style={[
              styles.sayItPromptContainer,
              {
                opacity: optionSelectionAnimation,
                transform: [
                  {
                    translateY: optionSelectionAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <ThemedText style={styles.sayItPrompt} type="subtitle">
              Now say it in mandarin:
            </ThemedText>
          </Animated.View>
        )}
      </View>

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
                <View style={styles.optionContent}>
                  <ThemedText style={styles.optionText}>
                    {option.english}
                  </ThemedText>
                  {isSelected && (
                   <View style={styles.selectedIndicator}>
                    <Ionicons size={22} name="mic-outline" color={Colors.primaryAccentColor} />
                    </View>
                  )}
                </View>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
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
  promptContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 50,
    marginBottom: 8,
  },
  sayItPromptContainer: {
    position: "absolute",
    bottom: 0,
  },
  sayItPrompt: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primaryAccentColor,
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
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  selectedIndicator: {
    marginLeft: 12,
  },
});
