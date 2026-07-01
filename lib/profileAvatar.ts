import { supabase } from "@/utils/supabase";
import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";

const AVATAR_BUCKET = "avatars";

function getContentType(uri: string): string {
  const ext = uri.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic" || ext === "heif") return "image/heic";
  return "image/jpeg";
}

function getExtension(contentType: string): string {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}

export function resolveAvatarUrl(
  profileAvatarUrl: string | null | undefined,
  userMetadata: Record<string, unknown> | undefined,
): string | null {
  if (profileAvatarUrl) return profileAvatarUrl;
  const meta = userMetadata ?? {};
  const oauthUrl =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    null;
  return oauthUrl;
}

async function requestLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status === "granted") return true;
  Alert.alert(
    "Permission needed",
    "Please allow photo library access to choose a profile picture.",
  );
  return false;
}

async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status === "granted") return true;
  Alert.alert(
    "Permission needed",
    "Please allow camera access to take a profile picture.",
  );
  return false;
}

async function pickImage(
  source: "library" | "camera",
): Promise<ImagePicker.ImagePickerAsset | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  };

  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0];
}

async function uploadAvatarImage(
  userId: string,
  uri: string,
): Promise<string> {
  const contentType = getContentType(uri);
  const ext = getExtension(contentType);
  const path = `${userId}/avatar.${ext}`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, arrayBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const cacheBustedUrl = `${data.publicUrl}?t=${Date.now()}`;
  return cacheBustedUrl;
}

async function saveAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

export async function uploadProfileAvatar(
  userId: string,
  source: "library" | "camera",
): Promise<string | null> {
  const hasPermission =
    source === "camera"
      ? await requestCameraPermission()
      : await requestLibraryPermission();

  if (!hasPermission) return null;

  const asset = await pickImage(source);
  if (!asset?.uri) return null;

  const publicUrl = await uploadAvatarImage(userId, asset.uri);
  await saveAvatarUrl(userId, publicUrl);
  return publicUrl;
}

export function showAvatarPickerOptions(
  onPick: (source: "library" | "camera") => void,
): void {
  const options = [
    { text: "Take photo", onPress: () => onPick("camera") },
    { text: "Choose from library", onPress: () => onPick("library") },
    { text: "Cancel", style: "cancel" as const },
  ];

  if (Platform.OS === "ios") {
    Alert.alert("Profile picture", "Update your profile photo", options);
    return;
  }

  Alert.alert("Profile picture", "Update your profile photo", options);
}
