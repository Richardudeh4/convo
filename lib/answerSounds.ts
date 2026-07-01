import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { Platform, Vibration } from "react-native";
import {
  ensureAudioMode,
  playOneShot,
  preloadSoundAsset,
} from "@/lib/audioSession";
import { getSettingsSync } from "@/lib/settings";

type AnswerSound = "correct" | "incorrect";

/** Spanish nylon-guitar + castanet palette for in-lesson feedback */
const SOUND_ASSETS = {
  correct: require("@/assets/sounds/correct.wav"),
  incorrect: require("@/assets/sounds/incorrect.wav"),
} as const;

function playAnswerHaptics(type: AnswerSound): void {
  if (!getSettingsSync().hapticsEnabled) {
    return;
  }

  if (type === "correct") {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (Platform.OS === "android") {
      Vibration.vibrate(40);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    return;
  }

  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  if (Platform.OS === "android") {
    Vibration.vibrate([0, 60, 50, 60]);
  } else {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 120);
  }
}

export function preloadAnswerSounds(): void {
  void ensureAudioMode().then(() =>
    Promise.all(
      (Object.keys(SOUND_ASSETS) as AnswerSound[]).map((type) =>
        preloadSoundAsset(SOUND_ASSETS[type]),
      ),
    ),
  );
}

export async function playAnswerSound(type: AnswerSound): Promise<void> {
  playAnswerHaptics(type);

  if (!getSettingsSync().soundEffectsEnabled) {
    return;
  }

  try {
    if (await Speech.isSpeakingAsync()) {
      await Speech.stop();
    }
    await ensureAudioMode();
    await playOneShot(SOUND_ASSETS[type], type === "correct" ? 1 : 0.9);
  } catch (error) {
    if (__DEV__) {
      console.warn("[answerSounds] Failed to play sound:", error);
    }
  }
}
