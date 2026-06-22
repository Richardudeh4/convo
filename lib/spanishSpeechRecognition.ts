import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";

const STOP_TIMEOUT_MS = 2500;

let latestTranscript = "";
let resultListener: { remove: () => void } | null = null;
let isListening = false;

function clearResultListener() {
  resultListener?.remove();
  resultListener = null;
}

export async function requestSpeechRecognitionPermission(): Promise<boolean> {
  const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  return result.granted;
}

export async function startSpanishRecognition(
  expectedPhrase: string,
): Promise<void> {
  if (isListening) {
    await stopSpanishRecognition();
  }

  latestTranscript = "";
  clearResultListener();

  resultListener = ExpoSpeechRecognitionModule.addListener("result", (event) => {
    const transcripts = event.results
      ?.map((result) => result.transcript)
      .filter(Boolean);

    const transcript = transcripts?.[transcripts.length - 1] ?? "";
    if (transcript) {
      latestTranscript = transcript;
    }
  });

  await ExpoSpeechRecognitionModule.start({
    lang: "es-ES",
    interimResults: true,
    continuous: false,
    contextualStrings: [expectedPhrase],
    iosTaskHint: "confirmation",
    androidIntentOptions: {
      EXTRA_LANGUAGE_MODEL: "web_search",
    },
  });

  isListening = true;
}

export async function stopSpanishRecognition(): Promise<string> {
  if (!isListening) {
    return latestTranscript.trim();
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = (transcript: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      endListener.remove();
      clearResultListener();
      isListening = false;
      resolve(transcript.trim());
    };

    const endListener = ExpoSpeechRecognitionModule.addListener("end", () => {
      finish(latestTranscript);
    });

    const timeout = setTimeout(() => {
      finish(latestTranscript);
    }, STOP_TIMEOUT_MS);

    ExpoSpeechRecognitionModule.stop();
  });
}

export function isSpanishRecognitionActive(): boolean {
  return isListening;
}

export async function abortSpanishRecognition(): Promise<void> {
  if (!isListening) return;
  clearResultListener();
  isListening = false;
  latestTranscript = "";
  await ExpoSpeechRecognitionModule.abort();
}
