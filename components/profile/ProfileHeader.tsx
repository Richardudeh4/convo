import { ThemedText } from "@/components/themed-text";
import { RANK_LABELS } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import {
  showAvatarPickerOptions,
  uploadProfileAvatar,
} from "@/lib/profileAvatar";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { toast } from "sonner-native";

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  const source = name?.trim() || email?.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export default function ProfileHeader({
  name,
  email,
  rank,
  avatarUrl,
  userId,
  onAvatarUpdated,
}: {
  name: string | null | undefined;
  email: string | null | undefined;
  rank: number;
  avatarUrl: string | null;
  userId: string | undefined;
  onAvatarUpdated: () => Promise<void>;
}) {
  const displayName = name?.trim() || "Learner";
  const [uploading, setUploading] = useState(false);

  const handleAvatarPress = () => {
    if (!userId || uploading) return;

    showAvatarPickerOptions((source) => {
      void (async () => {
        setUploading(true);
        try {
          const url = await uploadProfileAvatar(userId, source);
          if (url) {
            await onAvatarUpdated();
            toast.success("Profile picture updated");
          }
        } catch (error) {
          console.error("[ProfileHeader] avatar upload failed:", error);
          Alert.alert(
            "Upload failed",
            "Could not update your profile picture. Make sure the avatars storage bucket is set up in Supabase.",
          );
        } finally {
          setUploading(false);
        }
      })();
    });
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleAvatarPress}
        disabled={!userId || uploading}
        style={styles.avatarPressable}
        accessibilityLabel="Change profile picture"
        accessibilityRole="button"
      >
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <ThemedText style={styles.initials}>{getInitials(name, email)}</ThemedText>
          )}
          {uploading ? (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : null}
        </View>
        <View style={styles.editBadge}>
          <Ionicons name="camera" size={14} color="#fff" />
        </View>
      </Pressable>

      <View style={styles.info}>
        <ThemedText style={styles.name}>{displayName}</ThemedText>
        {email ? (
          <ThemedText style={styles.email} numberOfLines={1}>
            {email}
          </ThemedText>
        ) : null}
        <View style={styles.rankBadge}>
          <ThemedText style={styles.rankText}>{RANK_LABELS[rank]}</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  avatarPressable: {
    position: "relative",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryAccentColor + "22",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 72,
    height: 72,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primaryAccentColor,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  initials: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primaryAccentColor,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
  },
  email: {
    fontSize: 14,
    color: Colors.subduedTextColor,
  },
  rankBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.primaryAccentColor + "18",
  },
  rankText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primaryAccentColor,
  },
});
