import {
  createAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  type AudioPlayer,
} from "expo-audio";

const soundPool = new Map<number, AudioPlayer>();
const loadingPromises = new Map<number, Promise<AudioPlayer>>();

export async function ensureAudioMode(): Promise<void> {
  await setIsAudioActiveAsync(true);
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: false,
    interruptionMode: "duckOthers",
    shouldRouteThroughEarpiece: false,
  });
}

async function waitUntilLoaded(player: AudioPlayer): Promise<void> {
  if (player.isLoaded) return;

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      subscription.remove();
      reject(new Error("[audioSession] sound load timeout"));
    }, 5000);

    const subscription = player.addListener("playbackStatusUpdate", (status) => {
      if (status.isLoaded) {
        clearTimeout(timeout);
        subscription.remove();
        resolve();
      }
    });
  });
}

async function loadSound(asset: number): Promise<AudioPlayer> {
  const cached = soundPool.get(asset);
  if (cached) return cached;

  const pending = loadingPromises.get(asset);
  if (pending) return pending;

  const promise = (async () => {
    await ensureAudioMode();
    const player = createAudioPlayer(asset, { keepAudioSessionActive: true });
    await waitUntilLoaded(player);
    soundPool.set(asset, player);
    loadingPromises.delete(asset);
    return player;
  })();

  loadingPromises.set(asset, promise);
  return promise;
}

export async function preloadSoundAsset(asset: number): Promise<void> {
  await loadSound(asset);
}

export async function playOneShot(asset: number, volume: number): Promise<void> {
  await ensureAudioMode();

  const playCached = async (player: AudioPlayer) => {
    await waitUntilLoaded(player);
    player.pause();
    await player.seekTo(0);
    player.loop = false;
    player.volume = volume;
    player.play();
  };

  try {
    await playCached(await loadSound(asset));
  } catch (error) {
    const stale = soundPool.get(asset);
    soundPool.delete(asset);
    if (stale) {
      try {
        stale.pause();
        stale.remove();
      } catch {
        // Already removed.
      }
    }

    if (__DEV__) {
      console.warn("[audioSession] playOneShot retry:", error);
    }

    await playCached(await loadSound(asset));
  }
}

export async function playLoop(asset: number, volume: number): Promise<AudioPlayer> {
  await ensureAudioMode();
  const player = createAudioPlayer(asset, { keepAudioSessionActive: true });
  await waitUntilLoaded(player);
  player.loop = true;
  player.volume = volume;
  player.play();
  return player;
}

export async function stopAndUnload(player: AudioPlayer | null): Promise<void> {
  if (!player) return;
  try {
    player.pause();
    player.remove();
  } catch {
    // Already stopped.
  }
}
