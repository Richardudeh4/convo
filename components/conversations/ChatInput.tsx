import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "../themed-text";

export default function ChatInput({
  value,
  onChangeText,
  onSend,
  disabled,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? "Escribe en español..."}
        placeholderTextColor={Colors.subduedTextColor}
        multiline
        maxLength={500}
        editable={!disabled}
        onSubmitEditing={() => {
          if (canSend) onSend();
        }}
        blurOnSubmit={false}
      />
      <Pressable
        style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
        onPress={onSend}
        disabled={!canSend}
      >
        <Ionicons
          name="send"
          size={20}
          color={canSend ? "#fff" : Colors.subduedTextColor}
        />
      </Pressable>
    </View>
  );
}

export function PhrasebookChips({
  phrases,
  onSelect,
  disabled,
}: {
  phrases: { text: string; english: string }[];
  onSelect: (text: string) => void;
  disabled?: boolean;
}) {
  if (phrases.length === 0) return null;

  return (
    <View style={styles.chipsWrap}>
      <ThemedText style={styles.chipsLabel}>Phrasebook</ThemedText>
      <View style={styles.chipsRow}>
        {phrases.map((phrase) => (
          <Pressable
            key={phrase.text}
            style={[styles.chip, disabled && styles.chipDisabled]}
            onPress={() => onSelect(phrase.text)}
            disabled={disabled}
          >
            <ThemedText style={styles.chipText} numberOfLines={1}>
              {phrase.text}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111",
    backgroundColor: "#f9fafb",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryAccentColor,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#e5e7eb",
  },
  chipsWrap: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: "#fff",
  },
  chipsLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.subduedTextColor,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primaryAccentColor + "14",
    borderWidth: 1,
    borderColor: Colors.primaryAccentColor + "44",
    maxWidth: "100%",
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    fontSize: 13,
    color: Colors.primaryAccentColor,
    fontWeight: "500",
  },
});
