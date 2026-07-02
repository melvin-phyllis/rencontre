import type { CSSProperties } from "react";

export type ThemeId = "love" | "rencontre" | "diner" | "cinema" | "balade" | "surprise" | "custom";

export type Ambiance = "romantique" | "drole" | "chic" | "simple" | "mysterieuse";

export type ThemeCustom = {
  primary: string; // hex
  accent: string; // hex
  background: string; // hex
  ambiance: Ambiance;
  emoji: string;
};

export type Invitation = {
  to: string;
  from: string;
  intro: string;
  question: string;
  activities: string[];
  themeId: ThemeId;
  custom?: ThemeCustom;
};

export type ThemePreset = {
  id: ThemeId;
  name: string;
  emoji: string;
  description: string;
  palette: string[]; // display swatches (hex)
  colors: {
    background: string; // css color
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;
    gradient: string;
    shadow: string;
  };
  defaultIntro: string;
  defaultQuestion: string;
  defaultActivities: string[];
  animation: "hearts" | "sparks" | "candles" | "popcorn" | "stars" | "gifts";
  emojiSet: string[];
};

const heartsSet = ["❤️", "💕", "💖", "💗", "🌸", "✨"];
const sparksSet = ["✨", "💜", "💫", "🌟", "💖", "⭐"];
const candlesSet = ["🕯️", "🍷", "✨", "🌹", "🥂", "💛"];
const popcornSet = ["🍿", "🎬", "🎞️", "⭐", "🎥", "❤️"];
const starsSet = ["🌙", "⭐", "✨", "💫", "🌌", "☁️"];
const giftsSet = ["🎁", "✨", "💝", "🎀", "💖", "🌟"];

export const THEMES: Record<Exclude<ThemeId, "custom">, ThemePreset> = {
  love: {
    id: "love",
    name: "Love romantique",
    emoji: "❤️",
    description: "Très romantique, cœurs et douceur",
    palette: ["#ffb6c8", "#ff4d94", "#ffffff"],
    colors: {
      background: "oklch(0.98 0.015 350)",
      foreground: "oklch(0.28 0.08 350)",
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.28 0.08 350)",
      primary: "oklch(0.65 0.22 0)",
      primaryForeground: "oklch(0.99 0.01 350)",
      secondary: "oklch(0.94 0.05 350)",
      secondaryForeground: "oklch(0.35 0.12 350)",
      accent: "oklch(0.85 0.12 320)",
      accentForeground: "oklch(0.28 0.1 340)",
      muted: "oklch(0.96 0.02 350)",
      mutedForeground: "oklch(0.5 0.05 350)",
      border: "oklch(0.9 0.04 350)",
      input: "oklch(0.94 0.03 350)",
      ring: "oklch(0.7 0.2 350)",
      gradient:
        "linear-gradient(135deg, oklch(0.94 0.05 350) 0%, oklch(0.9 0.08 320) 50%, oklch(0.92 0.06 30) 100%)",
      shadow:
        "0 20px 60px -20px oklch(0.65 0.22 0 / 0.35), 0 8px 24px -12px oklch(0.7 0.2 340 / 0.25)",
    },
    defaultIntro: "J'ai une petite question pour toi…",
    defaultQuestion: "Tu veux sortir avec moi ? ❤️",
    defaultActivities: [
      "Restaurant 🍽️",
      "Cinéma 🎬",
      "Balade 🚶‍♀️",
      "Café ☕",
      "Pique-nique 🧺",
      "Soirée Netflix 🍿",
    ],
    animation: "hearts",
    emojiSet: heartsSet,
  },
  rencontre: {
    id: "rencontre",
    name: "Rencontre",
    emoji: "💕",
    description: "Flirt, fun et moderne",
    palette: ["#c084fc", "#f9a8d4", "#ffffff"],
    colors: {
      background: "oklch(0.98 0.02 310)",
      foreground: "oklch(0.3 0.1 310)",
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.3 0.1 310)",
      primary: "oklch(0.68 0.22 310)",
      primaryForeground: "oklch(0.99 0.01 310)",
      secondary: "oklch(0.94 0.05 330)",
      secondaryForeground: "oklch(0.35 0.14 310)",
      accent: "oklch(0.88 0.1 330)",
      accentForeground: "oklch(0.3 0.1 310)",
      muted: "oklch(0.96 0.02 320)",
      mutedForeground: "oklch(0.52 0.06 310)",
      border: "oklch(0.9 0.04 320)",
      input: "oklch(0.95 0.03 320)",
      ring: "oklch(0.72 0.2 310)",
      gradient:
        "linear-gradient(135deg, oklch(0.94 0.06 310) 0%, oklch(0.94 0.06 340) 50%, oklch(0.98 0.02 310) 100%)",
      shadow:
        "0 20px 60px -20px oklch(0.68 0.22 310 / 0.35), 0 8px 24px -12px oklch(0.75 0.15 330 / 0.25)",
    },
    defaultIntro: "Petit message rien que pour toi…",
    defaultQuestion: "Et si on se voyait bientôt ? 💕",
    defaultActivities: [
      "Café ☕",
      "Balade 🚶",
      "Bar à cocktails 🍹",
      "Expo 🎨",
      "Bowling 🎳",
      "Karaoké 🎤",
    ],
    animation: "sparks",
    emojiSet: sparksSet,
  },
  diner: {
    id: "diner",
    name: "Dîner romantique",
    emoji: "🍽️",
    description: "Restaurant chic, bougies, soirée élégante",
    palette: ["#5b1a24", "#f5e6c8", "#d4a24c"],
    colors: {
      background: "oklch(0.16 0.04 20)",
      foreground: "oklch(0.95 0.04 80)",
      card: "oklch(0.22 0.05 20)",
      cardForeground: "oklch(0.96 0.04 80)",
      primary: "oklch(0.78 0.14 75)",
      primaryForeground: "oklch(0.2 0.05 20)",
      secondary: "oklch(0.28 0.06 20)",
      secondaryForeground: "oklch(0.94 0.05 80)",
      accent: "oklch(0.6 0.15 30)",
      accentForeground: "oklch(0.98 0.02 80)",
      muted: "oklch(0.26 0.04 20)",
      mutedForeground: "oklch(0.78 0.05 70)",
      border: "oklch(0.35 0.06 25)",
      input: "oklch(0.28 0.05 20)",
      ring: "oklch(0.78 0.14 75)",
      gradient:
        "linear-gradient(135deg, oklch(0.16 0.06 20) 0%, oklch(0.22 0.07 25) 50%, oklch(0.18 0.05 40) 100%)",
      shadow:
        "0 20px 60px -20px oklch(0.78 0.14 75 / 0.4), 0 8px 24px -12px oklch(0.5 0.15 25 / 0.4)",
    },
    defaultIntro: "Réserve ta soirée, j'ai une idée…",
    defaultQuestion: "J'aimerais t'inviter à un dîner… 🍷",
    defaultActivities: [
      "Restaurant italien 🍝",
      "Restaurant gastronomique 🍽️",
      "Bar à vin 🍷",
      "Sushi 🍣",
      "Rooftop 🌆",
      "Dîner à la maison 🕯️",
    ],
    animation: "candles",
    emojiSet: candlesSet,
  },
  cinema: {
    id: "cinema",
    name: "Cinéma",
    emoji: "🎬",
    description: "Ticket, popcorn, film romantique",
    palette: ["#0a0a0a", "#e11d2e", "#e8c46b"],
    colors: {
      background: "oklch(0.13 0.01 20)",
      foreground: "oklch(0.96 0.02 80)",
      card: "oklch(0.19 0.02 20)",
      cardForeground: "oklch(0.96 0.02 80)",
      primary: "oklch(0.62 0.22 25)",
      primaryForeground: "oklch(0.98 0.01 80)",
      secondary: "oklch(0.24 0.03 20)",
      secondaryForeground: "oklch(0.94 0.03 80)",
      accent: "oklch(0.78 0.14 80)",
      accentForeground: "oklch(0.15 0.02 20)",
      muted: "oklch(0.22 0.02 20)",
      mutedForeground: "oklch(0.75 0.03 80)",
      border: "oklch(0.3 0.04 25)",
      input: "oklch(0.24 0.03 20)",
      ring: "oklch(0.62 0.22 25)",
      gradient:
        "linear-gradient(135deg, oklch(0.11 0.01 0) 0%, oklch(0.18 0.06 25) 60%, oklch(0.13 0.02 30) 100%)",
      shadow:
        "0 20px 60px -20px oklch(0.62 0.22 25 / 0.5), 0 8px 24px -12px oklch(0.78 0.14 80 / 0.3)",
    },
    defaultIntro: "Prépare le popcorn…",
    defaultQuestion: "Et si on regardait un film ensemble ? 🎬",
    defaultActivities: [
      "Cinéma 🎬",
      "Film à la maison 🍿",
      "Marathon Netflix 📺",
      "Ciné en plein air 🌙",
      "Séance rétro 🎞️",
    ],
    animation: "popcorn",
    emojiSet: popcornSet,
  },
  balade: {
    id: "balade",
    name: "Balade / sortie",
    emoji: "🌙",
    description: "Promenade du soir, lune, étoiles",
    palette: ["#0f1e4a", "#7a5cc6", "#ffffff"],
    colors: {
      background: "oklch(0.18 0.08 265)",
      foreground: "oklch(0.96 0.02 260)",
      card: "oklch(0.24 0.09 265)",
      cardForeground: "oklch(0.96 0.02 260)",
      primary: "oklch(0.7 0.18 290)",
      primaryForeground: "oklch(0.99 0.01 260)",
      secondary: "oklch(0.3 0.09 265)",
      secondaryForeground: "oklch(0.94 0.03 260)",
      accent: "oklch(0.85 0.08 260)",
      accentForeground: "oklch(0.22 0.09 265)",
      muted: "oklch(0.28 0.08 265)",
      mutedForeground: "oklch(0.78 0.04 260)",
      border: "oklch(0.38 0.08 270)",
      input: "oklch(0.3 0.08 265)",
      ring: "oklch(0.7 0.18 290)",
      gradient:
        "linear-gradient(135deg, oklch(0.16 0.09 265) 0%, oklch(0.24 0.12 285) 55%, oklch(0.18 0.08 260) 100%)",
      shadow:
        "0 20px 60px -20px oklch(0.7 0.18 290 / 0.5), 0 8px 24px -12px oklch(0.5 0.15 265 / 0.4)",
    },
    defaultIntro: "Sous les étoiles, avec toi…",
    defaultQuestion: "Une petite sortie avec moi ? 🌙",
    defaultActivities: [
      "Balade nocturne 🌙",
      "Regarder les étoiles ⭐",
      "Bord de mer 🌊",
      "Promenade en ville 🏙️",
      "Parc au coucher du soleil 🌅",
    ],
    animation: "stars",
    emojiSet: starsSet,
  },
  surprise: {
    id: "surprise",
    name: "Surprise romantique",
    emoji: "🎁",
    description: "Mystérieuse, cadeau, surprise",
    palette: ["#ff8ab5", "#c084fc", "#e8c46b"],
    colors: {
      background: "oklch(0.97 0.03 330)",
      foreground: "oklch(0.28 0.1 330)",
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.28 0.1 330)",
      primary: "oklch(0.68 0.2 340)",
      primaryForeground: "oklch(0.99 0.01 330)",
      secondary: "oklch(0.94 0.06 320)",
      secondaryForeground: "oklch(0.35 0.13 330)",
      accent: "oklch(0.8 0.14 80)",
      accentForeground: "oklch(0.28 0.1 330)",
      muted: "oklch(0.96 0.03 330)",
      mutedForeground: "oklch(0.52 0.07 330)",
      border: "oklch(0.9 0.05 330)",
      input: "oklch(0.94 0.04 330)",
      ring: "oklch(0.72 0.2 340)",
      gradient:
        "linear-gradient(135deg, oklch(0.94 0.07 330) 0%, oklch(0.9 0.09 310) 50%, oklch(0.95 0.08 80) 100%)",
      shadow:
        "0 20px 60px -20px oklch(0.68 0.2 340 / 0.4), 0 8px 24px -12px oklch(0.78 0.14 80 / 0.3)",
    },
    defaultIntro: "Chuuut… ferme les yeux…",
    defaultQuestion: "J'ai une surprise pour toi… 🎁",
    defaultActivities: [
      "Surprise mystère 🎁",
      "Escape game 🔐",
      "Weekend surprise 🧳",
      "Cadeau caché 💝",
      "Rendez-vous secret 🤫",
    ],
    animation: "gifts",
    emojiSet: giftsSet,
  },
};

export const DEFAULT_CUSTOM: ThemeCustom = {
  primary: "#ff4d94",
  accent: "#c084fc",
  background: "#fff5f8",
  ambiance: "romantique",
  emoji: "❤️",
};

export const AMBIANCES: { id: Ambiance; label: string; emoji: string }[] = [
  { id: "romantique", label: "Romantique", emoji: "❤️" },
  { id: "drole", label: "Drôle", emoji: "😜" },
  { id: "chic", label: "Chic", emoji: "🥂" },
  { id: "simple", label: "Simple", emoji: "🌿" },
  { id: "mysterieuse", label: "Mystérieuse", emoji: "🌙" },
];

export function getTheme(inv: Invitation): ThemePreset {
  if (inv.themeId === "custom" && inv.custom) {
    return buildCustomTheme(inv.custom);
  }
  return THEMES[(inv.themeId as Exclude<ThemeId, "custom">) ?? "love"] ?? THEMES.love;
}

function buildCustomTheme(c: ThemeCustom): ThemePreset {
  const ambianceMap: Record<
    Ambiance,
    { intro: string; question: string; anim: ThemePreset["animation"] }
  > = {
    romantique: {
      intro: "J'ai une petite question pour toi…",
      question: `Tu veux sortir avec moi ? ${c.emoji}`,
      anim: "hearts",
    },
    drole: {
      intro: "Attention, message important 👀",
      question: `Ose dire non… ${c.emoji}`,
      anim: "sparks",
    },
    chic: {
      intro: "Réserve ta soirée…",
      question: `Une soirée élégante, toi et moi ? ${c.emoji}`,
      anim: "candles",
    },
    simple: {
      intro: "Juste une petite idée…",
      question: `On se voit bientôt ? ${c.emoji}`,
      anim: "stars",
    },
    mysterieuse: {
      intro: "Chuuut… un secret…",
      question: `J'ai quelque chose pour toi ${c.emoji}`,
      anim: "gifts",
    },
  };
  const a = ambianceMap[c.ambiance];
  return {
    id: "custom",
    name: "Personnalisé",
    emoji: c.emoji,
    description: "Ton propre thème",
    palette: [c.primary, c.accent, c.background],
    colors: {
      background: c.background,
      foreground: "#1f1230",
      card: "#ffffff",
      cardForeground: "#1f1230",
      primary: c.primary,
      primaryForeground: "#ffffff",
      secondary: hexMix(c.accent, "#ffffff", 0.7),
      secondaryForeground: "#1f1230",
      accent: c.accent,
      accentForeground: "#1f1230",
      muted: hexMix(c.background, "#ffffff", 0.5),
      mutedForeground: "#6b5b7a",
      border: hexMix(c.accent, "#ffffff", 0.6),
      input: hexMix(c.background, "#ffffff", 0.3),
      ring: c.primary,
      gradient: `linear-gradient(135deg, ${hexMix(c.background, c.accent, 0.75)} 0%, ${hexMix(c.background, c.primary, 0.7)} 100%)`,
      shadow: `0 20px 60px -20px ${c.primary}66, 0 8px 24px -12px ${c.accent}55`,
    },
    defaultIntro: a.intro,
    defaultQuestion: a.question,
    defaultActivities: DEFAULT_ACTIVITIES,
    animation: a.anim,
    emojiSet: [c.emoji, "✨", "💫", c.emoji, "🌟", "💖"],
  };
}

function hexMix(a: string, b: string, t: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const r = Math.round(pa.r * (1 - t) + pb.r * t);
  const g = Math.round(pa.g * (1 - t) + pb.g * t);
  const bl = Math.round(pa.b * (1 - t) + pb.b * t);
  return `rgb(${r}, ${g}, ${bl})`;
}
function hexToRgb(h: string) {
  const s = h.replace("#", "");
  const n = parseInt(
    s.length === 3
      ? s
          .split("")
          .map((c) => c + c)
          .join("")
      : s,
    16,
  );
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function themeStyle(t: ThemePreset): CSSProperties {
  return {
    ["--background" as never]: t.colors.background,
    ["--foreground" as never]: t.colors.foreground,
    ["--card" as never]: t.colors.card,
    ["--card-foreground" as never]: t.colors.cardForeground,
    ["--popover" as never]: t.colors.card,
    ["--popover-foreground" as never]: t.colors.cardForeground,
    ["--primary" as never]: t.colors.primary,
    ["--primary-foreground" as never]: t.colors.primaryForeground,
    ["--secondary" as never]: t.colors.secondary,
    ["--secondary-foreground" as never]: t.colors.secondaryForeground,
    ["--accent" as never]: t.colors.accent,
    ["--accent-foreground" as never]: t.colors.accentForeground,
    ["--muted" as never]: t.colors.muted,
    ["--muted-foreground" as never]: t.colors.mutedForeground,
    ["--border" as never]: t.colors.border,
    ["--input" as never]: t.colors.input,
    ["--ring" as never]: t.colors.ring,
    ["--gradient-romance" as never]: t.colors.gradient,
    ["--shadow-soft" as never]: t.colors.shadow,
    background: t.colors.gradient,
    color: t.colors.foreground,
  };
}

export const DEFAULT_ACTIVITIES = THEMES.love.defaultActivities;

export const DEFAULT_INVITATION: Invitation = {
  to: "",
  from: "",
  intro: THEMES.love.defaultIntro,
  question: THEMES.love.defaultQuestion,
  activities: THEMES.love.defaultActivities,
  themeId: "love",
};

export function confettiColors(t: ThemePreset): string[] {
  return [t.colors.primary, t.colors.accent, t.colors.ring, "#ffffff"];
}

export function encodeInvitation(inv: Invitation): string {
  const json = JSON.stringify(inv);
  const b64 =
    typeof window === "undefined"
      ? Buffer.from(json, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeInvitation(data: string): Invitation | null {
  try {
    let b64 = data.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const json =
      typeof window === "undefined"
        ? Buffer.from(b64, "base64").toString("utf-8")
        : decodeURIComponent(escape(atob(b64)));
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return null;
    const themeId: ThemeId = (parsed.themeId as ThemeId) ?? "love";
    return {
      to: String(parsed.to ?? ""),
      from: String(parsed.from ?? ""),
      intro: String(parsed.intro ?? DEFAULT_INVITATION.intro),
      question: String(parsed.question ?? DEFAULT_INVITATION.question),
      activities:
        Array.isArray(parsed.activities) && parsed.activities.length > 0
          ? parsed.activities.map(String)
          : DEFAULT_ACTIVITIES,
      themeId,
      custom:
        themeId === "custom" && parsed.custom
          ? {
              primary: String(parsed.custom.primary ?? DEFAULT_CUSTOM.primary),
              accent: String(parsed.custom.accent ?? DEFAULT_CUSTOM.accent),
              background: String(parsed.custom.background ?? DEFAULT_CUSTOM.background),
              ambiance: (parsed.custom.ambiance ?? "romantique") as Ambiance,
              emoji: String(parsed.custom.emoji ?? "❤️"),
            }
          : undefined,
    };
  } catch {
    return null;
  }
}
