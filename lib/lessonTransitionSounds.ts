import type { AudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import {
  ensureAudioMode,
  playLoop,
  playOneShot,
  preloadSoundAsset,
  stopAndUnload,
} from "@/lib/audioSession";
import { getSettingsSync } from "@/lib/settings";

/** Spanish rumba-guitar path transition palette */
const SOUND_ASSETS = {
  celebration: require("@/assets/sounds/lesson-celebration.wav"),
  star: require("@/assets/sounds/lesson-star.wav"),
  unlock: require("@/assets/sounds/lesson-unlock.wav"),
  advance: require("@/assets/sounds/lesson-advance.wav"),
} as const;

let backgroundMusic: AudioPlayer | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function startTransitionMusic(): Promise<void> {
  await stopTransitionMusic();
  backgroundMusic = await playLoop(SOUND_ASSETS.celebration, 0.52);
}

export async function stopTransitionMusic(): Promise<void> {
  await stopAndUnload(backgroundMusic);
  backgroundMusic = null;
}

export async function preloadLessonTransitionSounds(): Promise<void> {
  await ensureAudioMode();
  await Promise.all(Object.values(SOUND_ASSETS).map(preloadSoundAsset));
}

/** Path transition: rumba bed + flamenco run → cajón unlock → chord advance */
export async function playLessonPathTransition(hasNextLesson: boolean): Promise<void> {
  const { hapticsEnabled, soundEffectsEnabled } = getSettingsSync();

  if (hapticsEnabled) {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  if (!soundEffectsEnabled) {
    return;
  }

  if (await Speech.isSpeakingAsync()) {
    await Speech.stop();
  }
  await ensureAudioMode();
  await startTransitionMusic();
  await delay(80);

  void playOneShot(SOUND_ASSETS.star, 1);

  if (!hasNextLesson) {
    return;
  }

  await delay(500);
  void playOneShot(SOUND_ASSETS.unlock, 0.95);
  await delay(350);
  void playOneShot(SOUND_ASSETS.advance, 0.9);
}
