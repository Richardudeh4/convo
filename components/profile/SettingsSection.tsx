import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { AppSettings } from "@/lib/settings";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Switch, View } from "react-native";

export default function SettingsSection({
  settings,
  onToggleSound,
  onToggleHaptics,
  onSignOut,
  signingOut,
}: {
  settings: AppSettings;
  onToggleSound: (value: boolean) => void;
  onToggleHaptics: (value: boolean) => void;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.title}>Settings</ThemedText>

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Ionicons name="volume-high-outline" size={20} color={Colors.subduedTextColor} />
          <ThemedText style={styles.rowLabel}>Sound effects</ThemedText>
        </View>
        <Switch
          value={settings.soundEffectsEnabled}
          onValueChange={onToggleSound}
          trackColor={{ false: "#e5e7eb", true: Colors.primaryAccentColor + "88" }}
          thumbColor={settings.soundEffectsEnabled ? Colors.primaryAccentColor : "#f4f4f5"}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Ionicons name="phone-portrait-outline" size={20} color={Colors.subduedTextColor} />
          <ThemedText style={styles.rowLabel}>Haptic feedback</ThemedText>
        </View>
        <Switch
          value={settings.hapticsEnabled}
          onValueChange={onToggleHaptics}
          trackColor={{ false: "#e5e7eb", true: Colors.primaryAccentColor + "88" }}
          thumbColor={settings.hapticsEnabled ? Colors.primaryAccentColor : "#f4f4f5"}
        />
      </View>

      <Pressable
        style={styles.signOutBtn}
        onPress={onSignOut}
        disabled={signingOut}
      >
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <ThemedText style={styles.signOutText}>
          {signingOut ? "Signing out..." : "Sign out"}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowLabel: {
    fontSize: 15,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ef4444",
  },
});
