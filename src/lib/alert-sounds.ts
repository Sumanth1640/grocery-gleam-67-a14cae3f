// Per-user alert sound preferences (localStorage-only).
// Each "channel" (admin_order, partner_order, notification, ...) can pick a
// preset synth pattern OR a custom uploaded audio file (stored as data URL).

export type AlertChannel = "admin_order" | "partner_order" | "notification";

export type SoundPreset = {
  id: string;
  label: string;
  description: string;
  /** Returns a function that plays the sound on the given AudioContext. */
  play: (ctx: AudioContext) => void;
};

type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext ?? (window as WindowWithWebkit).webkitAudioContext;
  if (!Ctx) return null;
  return new Ctx();
}

function tone(ctx: AudioContext, at: number, freq: number, dur: number, vol = 0.25, type: OscillatorType = "sine") {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(vol, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

export const PRESETS: SoundPreset[] = [
  {
    id: "classic",
    label: "Classic Beep",
    description: "Three rising tones — the default Hallifresh alert.",
    play: (ctx) => {
      const now = ctx.currentTime;
      [660, 990, 1320].forEach((f, i) => tone(ctx, now + i * 0.15, f, 0.14));
    },
  },
  {
    id: "chime",
    label: "Soft Chime",
    description: "Gentle 4-note ascending chime.",
    play: (ctx) => {
      const now = ctx.currentTime;
      [523, 659, 784, 1047].forEach((f, i) => tone(ctx, now + i * 0.18, f, 0.32, 0.18, "triangle"));
    },
  },
  {
    id: "bell",
    label: "Doorbell",
    description: "Two-tone ding-dong doorbell.",
    play: (ctx) => {
      const now = ctx.currentTime;
      tone(ctx, now, 880, 0.45, 0.28, "sine");
      tone(ctx, now + 0.35, 660, 0.55, 0.28, "sine");
    },
  },
  {
    id: "alarm",
    label: "Urgent Alarm",
    description: "Rapid pulses — hard to miss.",
    play: (ctx) => {
      const now = ctx.currentTime;
      for (let i = 0; i < 6; i++) tone(ctx, now + i * 0.1, 1200, 0.08, 0.3, "square");
    },
  },
  {
    id: "ping",
    label: "Subtle Ping",
    description: "Single short ping for low-priority alerts.",
    play: (ctx) => {
      tone(ctx, ctx.currentTime, 1568, 0.18, 0.2, "sine");
    },
  },
];

const DEFAULTS: Record<AlertChannel, string> = {
  admin_order: "classic",
  partner_order: "classic",
  notification: "ping",
};

const choiceKey = (ch: AlertChannel) => `alert-sound:${ch}:choice`;
const customKey = (ch: AlertChannel) => `alert-sound:${ch}:custom`;
const customNameKey = (ch: AlertChannel) => `alert-sound:${ch}:custom-name`;

/** Choice = preset id, or "custom" to use the uploaded file. */
export function getChoice(ch: AlertChannel): string {
  if (typeof window === "undefined") return DEFAULTS[ch];
  return localStorage.getItem(choiceKey(ch)) ?? DEFAULTS[ch];
}

export function setChoice(ch: AlertChannel, id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(choiceKey(ch), id);
}

export function getCustomDataUrl(ch: AlertChannel): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(customKey(ch));
}

export function getCustomName(ch: AlertChannel): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(customNameKey(ch));
}

export const CUSTOM_MAX_BYTES = 500_000; // ~500KB cap to keep localStorage healthy

export async function setCustomFromFile(ch: AlertChannel, file: File): Promise<void> {
  if (!/^audio\//.test(file.type)) throw new Error("Please select an audio file (mp3, wav, ogg…).");
  if (file.size > CUSTOM_MAX_BYTES) {
    throw new Error(`File is too large. Max ${Math.round(CUSTOM_MAX_BYTES / 1024)} KB.`);
  }
  const dataUrl: string = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
  localStorage.setItem(customKey(ch), dataUrl);
  localStorage.setItem(customNameKey(ch), file.name);
  setChoice(ch, "custom");
}

export function clearCustom(ch: AlertChannel) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(customKey(ch));
  localStorage.removeItem(customNameKey(ch));
  if (getChoice(ch) === "custom") setChoice(ch, DEFAULTS[ch]);
}

/** Play the sound currently configured for this channel. No-op if anything fails. */
export function playAlert(ch: AlertChannel) {
  try {
    const id = getChoice(ch);
    if (id === "custom") {
      const url = getCustomDataUrl(ch);
      if (!url) return playPreset(ch, DEFAULTS[ch]);
      const audio = new Audio(url);
      audio.volume = 0.9;
      void audio.play();
      return;
    }
    playPreset(ch, id);
  } catch {
    /* ignore */
  }
}

function playPreset(ch: AlertChannel, id: string) {
  const preset = PRESETS.find((p) => p.id === id) ?? PRESETS.find((p) => p.id === DEFAULTS[ch])!;
  const ctx = getCtx();
  if (!ctx) return;
  preset.play(ctx);
  setTimeout(() => ctx.close(), 1500);
}

/** Preview helper — plays the given preset id or the channel's custom file. */
export function preview(ch: AlertChannel, id: string) {
  if (id === "custom") {
    const url = getCustomDataUrl(ch);
    if (!url) return;
    const audio = new Audio(url);
    audio.volume = 0.9;
    void audio.play();
    return;
  }
  playPreset(ch, id);
}
