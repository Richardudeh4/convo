import { Asset } from "expo-asset";
import {
  createAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  type AudioPlayer,
} from "expo-audio";

const soundPool = new Map<number, AudioPlayer>();
const uriCache = new Map<number, string>();
const loadingPromises = new Map<number, Promise<AudioPlayer>>();

export async function ensureAudioMode(): Promise<void> {
  await setIsAudioActiveAsync(true);
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: false,
    interruptionMode: "mixWithOthers",
    shouldRouteThroughEarpiece: false,
  });
}

async function resolveBundledAssetUri(assetModule: number): Promise<string> {
  const cached = uriCache.get(assetModule);
  if (cached) return cached;

  const asset = Asset.fromModule(assetModule);
  if (!asset.localUri) {
    await asset.downloadAsync();
  }

  const uri = asset.localUri ?? asset.uri;
  if (!uri) {
    throw new Error(`[audioSession] Could not resolve asset URI for module ${assetModule}`);
  }

  uriCache.set(assetModule, uri);
  return uri;
}

async function waitUntilLoaded(player: AudioPlayer): Promise<void> {
  if (player.isLoaded) return;

  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (player.isLoaded) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      subscription.remove();
      reject(new Error("[audioSession] sound load timeout"));
    }, 3000);

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
    const uri = await resolveBundledAssetUri(asset);
    const player = createAudioPlayer(uri, {
      keepAudioSessionActive: true,
      updateInterval: 100,
    });
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
    player.muted = false;
    player.play();

    if (__DEV__) {
      console.log("[audioSession] playing one-shot", { asset, volume, loaded: player.isLoaded });
    }
  };

  try {
    await playCached(await loadSound(asset));
  } catch (error) {
    const stale = soundPool.get(asset);
    soundPool.delete(asset);
    uriCache.delete(asset);
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
  const uri = await resolveBundledAssetUri(asset);
  const player = createAudioPlayer(uri, {
    keepAudioSessionActive: true,
    updateInterval: 100,
  });
  await waitUntilLoaded(player);
  player.loop = true;
  player.volume = volume;
  player.muted = false;
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
