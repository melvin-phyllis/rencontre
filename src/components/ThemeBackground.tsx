import type { ThemePreset } from "@/lib/invitation";

export function ThemeBackground({ theme }: { theme: ThemePreset }) {
  const count = 18;
  const items = Array.from({ length: count });
  const set = theme.emojiSet;

  const animClass =
    theme.animation === "candles" || theme.animation === "popcorn"
      ? "animate-drift-up"
      : theme.animation === "stars" || theme.animation === "sparks"
        ? "animate-twinkle"
        : "animate-float-heart";
  const isTwinkle = animClass === "animate-twinkle";

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {items.map((_, i) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const size = 14 + Math.random() * 28;
        const duration = 8 + Math.random() * 14;
        const delay = Math.random() * 12;
        const emoji = set[i % set.length];
        return (
          <span
            key={i}
            className={`absolute ${animClass} select-none`}
            style={{
              left: `${left}%`,
              top: isTwinkle ? `${top}%` : undefined,
              fontSize: `${size}px`,
              animationDuration: `${duration}s`,
              animationDelay: `-${delay}s`,
            }}
          >
            {emoji}
          </span>
        );
      })}
    </div>
  );
}
