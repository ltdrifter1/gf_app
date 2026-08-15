/** Lightweight MSN-style UI sounds via Web Audio (no asset files). */

import { msnSoundsEnabled } from "./msn-prefs";

let ctx: AudioContext | null = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.12
) {
  if (!msnSoundsEnabled()) return;
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.setValueAtTime(0.0001, audio.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, audio.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(g);
  g.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.02);
}

/** Classic short “new message” ding. */
export function playMessageSound() {
  tone(880, 0, 0.09, "sine", 0.14);
  tone(1175, 0.08, 0.12, "sine", 0.1);
}

/** Buddy came online — two-note alert. */
export function playOnlineSound() {
  tone(523, 0, 0.1, "triangle", 0.1);
  tone(784, 0.12, 0.16, "triangle", 0.12);
}

/** Nudge — punchy descending pair. */
export function playNudgeSound() {
  tone(420, 0, 0.08, "square", 0.08);
  tone(280, 0.09, 0.14, "square", 0.1);
  tone(360, 0.22, 0.1, "square", 0.07);
}
