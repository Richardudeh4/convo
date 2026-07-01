import { ThemedText } from "@/components/themed-text";
import {
  INTERESTS,
  LEVELS,
  MOTIVATIONS,
} from "@/constants/onboardingOptions";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/ctx/AuthContext";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  const colors = Colors.light;

  const [name, setName] = useState("");
  const [level, setLevel] = useState<string | null>(null);
  const [motivation, setMotivation] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.full_name ?? "");
    setLevel(profile.spanish_level ?? null);
    setMotivation(profile.motivation ?? []);
    setSelectedInterests(profile.interests ?? []);
  }, [profile]);

  const toggleMotivation = (id: string) => {
    setMotivation((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const canSave =
    name.trim().length > 0 && !!level && motivation.length > 0 && selectedInterests.length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: name.trim(),
        spanish_level: level,
        motivation,
        interests: selectedInterests,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      await refreshProfile();
      toast.success("Profile updated");
      router.back();
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primaryAccentColor} />
        </Pressable>
        <ThemedText style={styles.topBarTitle}>Edit profile</ThemedText>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedText style={styles.label}>Name</ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={Colors.subduedTextColor}
            style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
          />

          <ThemedText style={styles.sectionTitle}>Spanish level</ThemedText>
          {LEVELS.map((l) => (
            <Pressable
              key={l.id}
              style={[
                styles.optionCard,
                level === l.id && styles.optionCardSelected,
              ]}
              onPress={() => setLevel(l.id)}
            >
              <ThemedText
                style={[
                  styles.optionTitle,
                  level === l.id && styles.optionTitleSelected,
                ]}
              >
                {l.title}
              </ThemedText>
              <ThemedText style={styles.optionDescription}>{l.description}</ThemedText>
            </Pressable>
          ))}

          <ThemedText style={styles.sectionTitle}>Why are you learning?</ThemedText>
          <ThemedText style={styles.sectionHint}>Select all that apply</ThemedText>
          {MOTIVATIONS.map((m) => {
            const isSelected = motivation.includes(m.id);
            return (
              <Pressable
                key={m.id}
                style={[
                  styles.optionCard,
                  styles.motivationCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => toggleMotivation(m.id)}
              >
                <Ionicons
                  name={m.icon}
                  size={22}
                  color={isSelected ? Colors.primaryAccentColor : colors.icon}
                />
                <ThemedText
                  style={[
                    styles.optionTitle,
                    isSelected && styles.optionTitleSelected,
                  ]}
                >
                  {m.title}
                </ThemedText>
              </Pressable>
            );
          })}

          <ThemedText style={styles.sectionTitle}>Interests</ThemedText>
          <ThemedText style={styles.sectionHint}>Select all that apply</ThemedText>
          <View style={styles.tagsContainer}>
            {INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <Pressable
                  key={interest}
                  style={[styles.tag, isSelected && styles.tagSelected]}
                  onPress={() => toggleInterest(interest)}
                >
                  <ThemedText style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                    {interest}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave || saving}
          >
            <ThemedText style={styles.saveBtnText}>
              {saving ? "Saving..." : "Save changes"}
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flex: {
    flex: 1,
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
  topBarTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
  },
  scroll: {
    padding: 20,
    paddingBottom: 32,
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.subduedTextColor,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    fontSize: 18,
    borderBottomWidth: 2,
    paddingVertical: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  sectionHint: {
    fontSize: 14,
    color: Colors.subduedTextColor,
    marginBottom: 4,
  },
  optionCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginTop: 8,
  },
  optionCardSelected: {
    borderColor: Colors.primaryAccentColor,
    backgroundColor: Colors.primaryAccentColor + "10",
  },
  motivationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: Colors.primaryAccentColor,
  },
  optionDescription: {
    fontSize: 13,
    color: Colors.subduedTextColor,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tagSelected: {
    backgroundColor: Colors.primaryAccentColor,
    borderColor: Colors.primaryAccentColor,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tagTextSelected: {
    color: "#fff",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: Colors.primaryAccentColor,
    alignItems: "center",
  },
  saveBtnDisabled: {
    backgroundColor: "#E5E7EB",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
