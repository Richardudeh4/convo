import { Audio } from "expo-av";

const MIN_RECORDING_MS = 400;

export async function requestMicrophonePermission(): Promise<boolean> {
  const { status } = await Audio.requestPermissionsAsync();
  return status === "granted";
}

export async function startRecording(): Promise<Audio.Recording> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  await recording.startAsync();
  return recording;
}

export async function stopRecording(
  recording: Audio.Recording,
): Promise<{ uri: string; durationMs: number }> {
  await recording.stopAndUnloadAsync();
  await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

  const status = await recording.getStatusAsync();
  const uri = recording.getURI();
  if (!uri) {
    throw new Error("Recording failed — no audio file was saved.");
  }

  return {
    uri,
    durationMs: status.durationMillis ?? 0,
  };
}

export function isRecordingLongEnough(durationMs: number): boolean {
  return durationMs >= MIN_RECORDING_MS;
}
