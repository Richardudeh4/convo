import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

type AnswerSound = "correct" | "incorrect";

const SOUND_ASSETS = {
  correct: require("@/assets/sounds/correct.wav"),
  incorrect: require("@/assets/sounds/incorrect.wav"),
} as const;

let soundsReady = false;
const sounds: Partial<Record<AnswerSound, Audio.Sound>> = {};

async function ensureSoundsReady(): Promise<void> {
  if (soundsReady) return;

  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  const entries = await Promise.all(
    (Object.keys(SOUND_ASSETS) as AnswerSound[]).map(async (type) => {
      const { sound } = await Audio.Sound.createAsync(SOUND_ASSETS[type], {
        shouldPlay: false,
        volume: type === "correct" ? 1 : 0.9,
      });
      return [type, sound] as const;
    }),
  );

  for (const [type, sound] of entries) {
    sounds[type] = sound;
  }

  soundsReady = true;
}

export function preloadAnswerSounds(): void {
  void ensureSoundsReady();
}

export async function playAnswerSound(type: AnswerSound): Promise<void> {
  try {
    await ensureSoundsReady();
    const sound = sounds[type];
    if (!sound) return;

    await sound.setPositionAsync(0);
    await sound.playAsync();

    void Haptics.notificationAsync(
      type === "correct"
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error,
    );
  } catch (error) {
    if (__DEV__) {
      console.warn("[answerSounds] Failed to play sound:", error);
    }
  }
}
