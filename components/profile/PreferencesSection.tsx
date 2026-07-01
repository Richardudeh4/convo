import { ThemedText } from "@/components/themed-text";
import { getLevelTitle, getMotivationTitle } from "@/constants/onboardingOptions";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

interface ProfileData {
  spanish_level?: string | null;
  motivation?: string[] | null;
  interests?: string[] | null;
}

export default function PreferencesSection({
  profile,
  onEdit,
}: {
  profile: ProfileData | null;
  onEdit: () => void;
}) {
  const motivations = profile?.motivation ?? [];
  const interests = profile?.interests ?? [];

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Learning preferences</ThemedText>
        <Pressable onPress={onEdit} style={styles.editBtn} hitSlop={8}>
          <Ionicons name="pencil" size={16} color={Colors.primaryAccentColor} />
          <ThemedText style={styles.editText}>Edit</ThemedText>
        </Pressable>
      </View>

      <View style={styles.field}>
        <ThemedText style={styles.fieldLabel}>Spanish level</ThemedText>
        <ThemedText style={styles.fieldValue}>
          {getLevelTitle(profile?.spanish_level)}
        </ThemedText>
      </View>

      {motivations.length > 0 ? (
        <View style={styles.field}>
          <ThemedText style={styles.fieldLabel}>Motivation</ThemedText>
          <View style={styles.chips}>
            {motivations.map((id) => (
              <View key={id} style={styles.chip}>
                <ThemedText style={styles.chipText}>{getMotivationTitle(id)}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {interests.length > 0 ? (
        <View style={styles.field}>
          <ThemedText style={styles.fieldLabel}>Interests</ThemedText>
          <View style={styles.chips}>
            {interests.map((interest) => (
              <View key={interest} style={styles.chip}>
                <ThemedText style={styles.chipText}>{interest}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryAccentColor,
  },
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.subduedTextColor,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  chips: {
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
    borderColor: Colors.primaryAccentColor + "33",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.primaryAccentColor,
  },
});
