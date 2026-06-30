import { ensureAudioMode } from "@/lib/audioSession";
import * as Speech from "expo-speech";
import type { SpeechOptions } from "expo-speech";
import { Platform } from "react-native";

const SPEAK_TIMEOUT_MS = 12000;
const SPEAK_START_CHECK_MS = 800;

type SpeechCallbacks = {
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
};

let cachedChineseVoiceId: string | null | undefined;

async function getChineseVoiceId(): Promise<string | undefined> {
  if (cachedChineseVoiceId !== undefined) {
    return cachedChineseVoiceId ?? undefined;
  }

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const chineseVoice = voices.find((voice) =>
      voice.language.toLowerCase().startsWith("zh"),
    );
    cachedChineseVoiceId = chineseVoice?.identifier ?? null;

    if (__DEV__) {
      console.log(
        "[mandarinSpeech] Chinese voice:",
        chineseVoice?.name ?? "none found",
        `(${voices.length} voices available)`,
      );
    }

    return chineseVoice?.identifier;
  } catch (error) {
    cachedChineseVoiceId = null;
    console.error("[mandarinSpeech] Failed to load voices:", error);
    return undefined;
  }
}

async function ensurePlaybackAudioMode(): Promise<void> {
  await ensureAudioMode();
}

function speakOnce(
  text: string,
  options: SpeechOptions & SpeechCallbacks,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      void Speech.stop();
      reject(new Error(`Speech timed out for "${text}"`));
    }, SPEAK_TIMEOUT_MS);

    const settle = (handler?: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      handler?.();
      resolve();
    };

    let started = false;

    Speech.speak(text, {
      ...options,
      onStart: () => {
        started = true;
        options.onStart?.();
      },
      onDone: () => settle(options.onDone),
      onStopped: () => settle(options.onStopped),
      onError: (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        options.onError?.(error);
        reject(error);
      },
    });

    if (Platform.OS === "android") {
      setTimeout(() => {
        void (async () => {
          if (settled || started) return;

          const speaking = await Speech.isSpeakingAsync();
          if (settled || started || speaking) return;

          settled = true;
          clearTimeout(timeout);
          await Speech.stop();
          reject(new Error(`Speech did not start for "${text}"`));
        })();
      }, SPEAK_START_CHECK_MS);
    }
  });
}

export async function speakMandarin(
  hanzi: string,
  pinyin: string,
  callbacks: SpeechCallbacks = {},
): Promise<void> {
  await ensurePlaybackAudioMode();

  const voice = await getChineseVoiceId();
  const attempts: Array<{ text: string; options: SpeechOptions }> = [];

  if (hanzi && voice) {
    attempts.push({ text: hanzi, options: { language: "zh-CN", voice, rate: 0.9 } });
  }
  if (hanzi) {
    attempts.push({ text: hanzi, options: { language: "zh-CN", rate: 0.9 } });
  }
  if (hanzi) {
    attempts.push({ text: hanzi, options: { language: "zh", rate: 0.9 } });
  }
  if (pinyin) {
    attempts.push({ text: pinyin, options: { rate: 0.85 } });
  }

  let lastError: Error | undefined;

  for (const attempt of attempts) {
    try {
      await speakOnce(attempt.text, { ...attempt.options, ...callbacks });
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      await Speech.stop();
      if (__DEV__) {
        console.warn(
          `[mandarinSpeech] Attempt failed for "${attempt.text}":`,
          lastError.message,
        );
      }
    }
  }

  throw lastError ?? new Error("No speech text available");
}
