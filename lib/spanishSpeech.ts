import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import type { SpeechOptions, Voice } from "expo-speech";
import { Platform } from "react-native";

const SPEAK_TIMEOUT_MS = 10000;
const SPEAK_START_CHECK_MS = 800;

// iOS uses 0.0–1.0 (0.5 ≈ normal); Android allows higher values.
const NATURAL_SPEECH_RATE = Platform.OS === "ios" ? 0.5 : 0.95;

type SpeechCallbacks = {
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
};

let cachedSpanishVoice: Voice | null | undefined;

function scoreSpanishVoice(voice: Voice): number {
  const lang = voice.language.toLowerCase();
  const name = voice.name.toLowerCase();
  const id = voice.identifier.toLowerCase();

  let score = 0;

  if (lang.startsWith("es-es")) score += 40;
  else if (lang.startsWith("es-mx")) score += 35;
  else if (lang.startsWith("es-us")) score += 30;
  else if (lang.startsWith("es")) score += 20;

  if (voice.quality === Speech.VoiceQuality.Enhanced) score += 50;

  if (id.includes("premium") || id.includes("enhanced") || id.includes("neural")) {
    score += 35;
  }
  if (Platform.OS === "android" && id.includes("local")) score += 30;
  if (Platform.OS === "android" && id.includes("network")) score += 20;

  if (id.includes("eloquence") || id.includes("compact")) score -= 45;
  if (id.includes("siri_")) score -= 25;

  const naturalNames = ["mónica", "monica", "jorge", "paulina", "diego", "lucia", "lucía"];
  if (naturalNames.some((n) => name.includes(n))) score += 15;

  return score;
}

function pickBestSpanishVoice(voices: Voice[]): Voice | undefined {
  const spanishVoices = voices.filter((v) =>
    v.language.toLowerCase().startsWith("es"),
  );
  if (spanishVoices.length === 0) return undefined;

  return [...spanishVoices].sort(
    (a, b) => scoreSpanishVoice(b) - scoreSpanishVoice(a),
  )[0];
}

async function getSpanishVoice(): Promise<Voice | undefined> {
  if (cachedSpanishVoice !== undefined) {
    return cachedSpanishVoice ?? undefined;
  }

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const spanishVoice = pickBestSpanishVoice(voices);

    cachedSpanishVoice = spanishVoice ?? null;

    if (__DEV__) {
      console.log(
        "[spanishSpeech] Spanish voice:",
        spanishVoice?.name ?? "none found",
        spanishVoice?.quality ?? "",
        `(${voices.length} voices available)`,
      );
    }

    return spanishVoice;
  } catch (error) {
    cachedSpanishVoice = null;
    console.error("[spanishSpeech] Failed to load voices:", error);
    return undefined;
  }
}

async function ensurePlaybackAudioMode(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
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

export async function speakSpanish(
  text: string,
  callbacks: SpeechCallbacks = {},
): Promise<void> {
  await ensurePlaybackAudioMode();

  const voice = await getSpanishVoice();
  const attempts: Array<{ text: string; options: SpeechOptions }> = [];

  const baseOptions: SpeechOptions = {
    rate: NATURAL_SPEECH_RATE,
    pitch: 1.0,
  };

  if (text && voice) {
    attempts.push({
      text,
      options: {
        ...baseOptions,
        language: voice.language,
        voice: voice.identifier,
      },
    });
  }
  if (text) {
    attempts.push({ text, options: { ...baseOptions, language: "es-ES" } });
  }
  if (text) {
    attempts.push({ text, options: { ...baseOptions, language: "es" } });
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
          `[spanishSpeech] Attempt failed for "${attempt.text}":`,
          lastError.message,
        );
      }
    }
  }

  throw lastError ?? new Error("No speech text available");
}
