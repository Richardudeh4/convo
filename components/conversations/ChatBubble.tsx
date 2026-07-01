import { ChatMessage } from "@/lib/conversationApi";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

export default function ChatBubble({
  message,
  onSpeak,
  isSpeaking,
}: {
  message: ChatMessage;
  onSpeak?: () => void;
  isSpeaking?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleNpc]}>
        <ThemedText style={[styles.text, isUser && styles.textUser]}>
          {message.content}
        </ThemedText>
        {!isUser && message.english ? (
          <ThemedText style={styles.english}>{message.english}</ThemedText>
        ) : null}
        {!isUser && message.romanization ? (
          <ThemedText style={styles.romanization}>{message.romanization}</ThemedText>
        ) : null}
        {!isUser && onSpeak ? (
          <Pressable style={styles.speakBtn} onPress={onSpeak} hitSlop={8}>
            {isSpeaking ? (
              <ActivityIndicator size="small" color={Colors.primaryAccentColor} />
            ) : (
              <Ionicons name="volume-high-outline" size={18} color={Colors.primaryAccentColor} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function TypingIndicator() {
  return (
    <View style={styles.row}>
      <View style={[styles.bubble, styles.bubbleNpc, styles.typingBubble]}>
        <ThemedText style={styles.typingText}>...</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  bubbleNpc: {
    backgroundColor: "#f0fdfa",
    borderColor: Colors.primaryAccentColor + "44",
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.primaryAccentColor,
    borderColor: Colors.primaryAccentColor,
    borderTopRightRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  textUser: {
    color: "#fff",
  },
  english: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.subduedTextColor,
    fontStyle: "italic",
  },
  romanization: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.subduedTextColor,
  },
  speakBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    padding: 4,
  },
  typingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  typingText: {
    color: Colors.subduedTextColor,
    letterSpacing: 2,
  },
});
