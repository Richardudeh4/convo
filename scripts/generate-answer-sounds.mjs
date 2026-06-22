import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../assets/sounds");

function writeWav(filename, samples, sampleRate = 44100) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }

  fs.writeFileSync(path.join(outDir, filename), buffer);
}

function tone(freq, durationSec, sampleRate, volume = 0.35) {
  const count = Math.floor(durationSec * sampleRate);
  const samples = [];

  for (let i = 0; i < count; i++) {
    const t = i / sampleRate;
    const attack = Math.min(1, i / (sampleRate * 0.008));
    const release = Math.min(1, (count - i) / (sampleRate * 0.12));
    const envelope = attack * release;
    const wave =
      Math.sin(2 * Math.PI * freq * t) * 0.75 +
      Math.sin(2 * Math.PI * freq * 2 * t) * 0.18;
    samples.push(wave * volume * envelope);
  }

  return samples;
}

function silence(durationSec, sampleRate) {
  return Array.from({ length: Math.floor(durationSec * sampleRate) }, () => 0);
}

function concat(...parts) {
  return parts.flat();
}

const correct = concat(
  tone(1047, 0.09, 44100, 0.42),
  silence(0.018, 44100),
  tone(1319, 0.09, 44100, 0.42),
  silence(0.018, 44100),
  tone(1568, 0.2, 44100, 0.48),
);

const incorrect = concat(
  tone(233, 0.07, 44100, 0.34),
  tone(185, 0.11, 44100, 0.3),
  tone(147, 0.22, 44100, 0.26),
);

fs.mkdirSync(outDir, { recursive: true });
writeWav("correct.wav", correct);
writeWav("incorrect.wav", incorrect);
console.log("Generated answer sounds in assets/sounds/");
