import ChatBubble, { TypingIndicator } from "@/components/conversations/ChatBubble";
import ChatInput, { PhrasebookChips } from "@/components/conversations/ChatInput";
import TaskChecklist from "@/components/conversations/TaskChecklist";
import { ThemedText } from "@/components/themed-text";
import { COURSE_DATA } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/ctx/AuthContext";
import { useScenarioChat } from "@/hooks/useScenarioChat";
import { playAnswerSound } from "@/lib/answerSounds";
import { isScenarioUnlocked } from "@/lib/conversationApi";
import { speakSpanish } from "@/lib/spanishSpeech";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

export default function ConversationScreen() {
  const router = useRouter();
  const { scenarioId } = useLocalSearchParams<{ scenarioId: string }>();
  const { isPremium } = useAuth();
  const scenario = COURSE_DATA.scenarios.find((s) => s.id === scenarioId);
  const insets = useSafeAreaInsets();

  const {
    messages,
    completedTasks,
    isLoading,
    error,
    conversationComplete,
    sendMessage,
    retryStart,
    turnCount,
    maxTurns,
  } = useScenarioChat(scenario);

  const [input, setInput] = useState("");
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const prevCompletedCount = useRef(0);

  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useEffect(() => {
    if (completedTasks.size > prevCompletedCount.current) {
      void playAnswerSound("correct");
      prevCompletedCount.current = completedTasks.size;
    }
  }, [completedTasks.size]);

  useEffect(() => {
    if (conversationComplete) {
      void playAnswerSound("correct");
    }
  }, [conversationComplete]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";

    const showSub = Keyboard.addListener(showEvent, () => {
      scrollToBottom(true);
    });

    return () => {
      showSub.remove();
    };
  }, [scrollToBottom]);

  const handleSpeak = useCallback(async (text: string, index: number) => {
    setSpeakingIndex(index);
    try {
      await speakSpanish(text, {
        onDone: () => setSpeakingIndex(null),
        onStopped: () => setSpeakingIndex(null),
        onError: () => setSpeakingIndex(null),
      });
    } catch {
      setSpeakingIndex(null);
    }
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    void sendMessage(text);
  }, [input, sendMessage]);

  const handlePhraseSelect = useCallback((text: string) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text));
  }, []);

  if (!scenarioId || !scenario) {
    return <Redirect href="/(tabs)/conversations" />;
  }

  if (!isScenarioUnlocked(scenario.isFree, isPremium)) {
    return <Redirect href="/(tabs)/conversations" />;
  }

  const phrasebook = scenario.phrasebook ?? [];
  const allTasksDone = scenario.tasks.every((_, i) => completedTasks.has(i));
  const showInput = !conversationComplete && !allTasksDone;

  const inputFooter = showInput ? (
    <View
      style={[
        styles.inputFooter,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      <PhrasebookChips
        phrases={phrasebook}
        onSelect={handlePhraseSelect}
        disabled={isLoading}
      />
      <ChatInput
        value={input}
        onChangeText={setInput}
        onSend={handleSend}
        disabled={isLoading}
      />
    </View>
  ) : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={Colors.primaryAccentColor} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <ThemedText style={styles.topBarTitle} numberOfLines={1}>
            {scenario.title}
          </ThemedText>
          <ThemedText style={styles.topBarMeta}>
            {turnCount}/{maxTurns} turns · {scenario.difficulty}
          </ThemedText>
        </View>
        <View style={styles.backBtn} />
      </View>

      <TaskChecklist tasks={scenario.tasks} completedTasks={completedTasks} />

      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView style={styles.flex} behavior="padding">
          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onContentSizeChange={() => scrollToBottom(false)}
          >
            {renderMessages()}
          </ScrollView>
          {inputFooter}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.flex}>
          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onContentSizeChange={() => scrollToBottom(false)}
          >
            {renderMessages()}
          </ScrollView>
          {inputFooter}
        </View>
      )}
    </SafeAreaView>
  );

  function renderMessages() {
    return (
      <>
        <View style={styles.briefing}>
          <ThemedText style={styles.briefingText}>{scenario!.description}</ThemedText>
          <ThemedText style={styles.goalText}>Goal: {scenario!.goal}</ThemedText>
        </View>

        {messages.length === 0 && isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.primaryAccentColor} />
            <ThemedText style={styles.loadingText}>Starting conversation...</ThemedText>
          </View>
        ) : null}

        {messages.map((message, index) => (
          <ChatBubble
            key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
            message={message}
            onSpeak={
              message.role === "assistant"
                ? () => void handleSpeak(message.content, index)
                : undefined
            }
            isSpeaking={speakingIndex === index}
          />
        ))}

        {isLoading && messages.length > 0 ? <TypingIndicator /> : null}

        {error && messages.length === 0 ? (
          <Pressable style={styles.retryBtn} onPress={retryStart}>
            <ThemedText style={styles.retryText}>Tap to retry</ThemedText>
          </Pressable>
        ) : null}

        {conversationComplete || allTasksDone ? (
          <View style={styles.completeCard}>
            <Ionicons name="checkmark-circle" size={32} color={Colors.primaryAccentColor} />
            <ThemedText style={styles.completeTitle}>Scenario complete!</ThemedText>
            <ThemedText style={styles.completeBody}>
              You finished all tasks in this roleplay. Great work!
            </ThemedText>
            <Pressable style={styles.doneBtn} onPress={() => router.back()}>
              <ThemedText style={styles.doneBtnText}>Back to roleplays</ThemedText>
            </Pressable>
          </View>
        ) : null}
      </>
    );
  }
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flex: {
    flex: 1,
  },
  inputFooter: {
    flexShrink: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  backBtn: {
    width: 40,
    alignItems: "center",
  },
  topBarCenter: {
    flex: 1,
    alignItems: "center",
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  topBarMeta: {
    fontSize: 12,
    color: Colors.subduedTextColor,
    marginTop: 2,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 12,
    paddingBottom: 16,
    flexGrow: 1,
  },
  briefing: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  briefingText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  goalText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primaryAccentColor,
  },
  loadingWrap: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    color: Colors.subduedTextColor,
  },
  retryBtn: {
    alignSelf: "center",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.primaryAccentColor + "18",
  },
  retryText: {
    color: Colors.primaryAccentColor,
    fontWeight: "600",
  },
  completeCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primaryAccentColor,
    backgroundColor: Colors.primaryAccentColor + "10",
    alignItems: "center",
    gap: 8,
  },
  completeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primaryAccentColor,
  },
  completeBody: {
    fontSize: 14,
    color: Colors.subduedTextColor,
    textAlign: "center",
    lineHeight: 20,
  },
  doneBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.primaryAccentColor,
  },
  doneBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
