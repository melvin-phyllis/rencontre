import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import confetti from "canvas-confetti";
import {
  DEFAULT_INVITATION,
  confettiColors,
  decodeInvitation,
  getTheme,
  themeStyle,
  type Invitation,
  type ThemePreset,
} from "@/lib/invitation";
import { createStoredResponse, getStoredInvitation } from "@/lib/supabase";
import { ThemeBackground } from "@/components/ThemeBackground";

type Search = { d?: string; id?: string };

export const Route = createFileRoute("/invitation")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    d: typeof search.d === "string" ? search.d : undefined,
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: InvitationPage,
});

type Step = "ask" | "form" | "done";

type Booking = {
  date: string;
  time: string;
  activity: string;
  message: string;
};

function InvitationPage() {
  const { d, id } = Route.useSearch();
  const navigate = useNavigate();

  const invitationFromUrl: Invitation = useMemo(() => {
    if (d) {
      const dec = decodeInvitation(d);
      if (dec) return dec;
    }
    return DEFAULT_INVITATION;
  }, [d]);

  const [storedInvitation, setStoredInvitation] = useState<Invitation | null>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(Boolean(id));
  const [invitationLoadFailed, setInvitationLoadFailed] = useState(false);
  const invitation = storedInvitation ?? invitationFromUrl;
  const theme = useMemo(() => getTheme(invitation), [invitation]);

  const [step, setStep] = useState<Step>("ask");
  const [booking, setBooking] = useState<Booking>({
    date: "",
    time: "",
    activity: invitation.activities[0] ?? "",
    message: "",
  });
  const [copied, setCopied] = useState(false);
  const [savingResponse, setSavingResponse] = useState(false);
  const [responseStatus, setResponseStatus] = useState<"idle" | "saved" | "failed" | "skipped">(
    "idle",
  );

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    let active = true;

    setStoredInvitation(null);
    setInvitationLoadFailed(false);

    if (!id) {
      setLoadingInvitation(false);
      return () => {
        active = false;
      };
    }

    setLoadingInvitation(true);
    getStoredInvitation(id)
      .then((stored) => {
        if (!active) return;
        if (stored) setStoredInvitation(stored);
        else setInvitationLoadFailed(true);
      })
      .catch((error) => {
        console.error("Supabase invitation load failed.", error);
        if (active) setInvitationLoadFailed(true);
      })
      .finally(() => {
        if (active) setLoadingInvitation(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    setBooking((current) => {
      if (current.activity && invitation.activities.includes(current.activity)) return current;
      return { ...current, activity: invitation.activities[0] ?? "" };
    });
  }, [invitation.activities]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const onYes = () => {
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 },
      colors: confettiColors(theme),
    });
    setStep("form");
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingResponse || !booking.date || !booking.time || !booking.activity) return;
    setSavingResponse(true);
    setResponseStatus("idle");

    try {
      if (id && storedInvitation) {
        await createStoredResponse(id, booking);
        setResponseStatus("saved");
      } else {
        setResponseStatus("skipped");
      }
    } catch (error) {
      console.error("Supabase response save failed.", error);
      setResponseStatus("failed");
    } finally {
      setSavingResponse(false);
    }

    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.5 },
      colors: confettiColors(theme),
    });
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: confettiColors(theme),
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: confettiColors(theme),
      });
    }, 300);
    setStep("done");
  };

  const summaryText = () => {
    const dateStr = new Date(booking.date + "T" + booking.time).toLocaleString("fr-FR", {
      dateStyle: "full",
      timeStyle: "short",
    });
    return `${theme.emoji} Rendez-vous confirmé !\n\n${invitation.to} & ${invitation.from}\n📅 ${dateStr}\n🎉 ${booking.activity}${
      booking.message ? `\n💌 ${booking.message}` : ""
    }`;
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const restart = () => {
    setBooking({
      date: "",
      time: "",
      activity: invitation.activities[0] ?? "",
      message: "",
    });
    setStep("ask");
  };

  return (
    <div style={themeStyle(theme)} className="min-h-screen">
      <ThemeBackground theme={theme} />
      <main className="min-h-screen px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-xl">
          {loadingInvitation && (
            <StatusCard theme={theme} title="Chargement..." text="On prépare ton invitation." />
          )}
          {!loadingInvitation && invitationLoadFailed && (
            <StatusCard
              theme={theme}
              title="Invitation introuvable"
              text="Le lien ne correspond à aucune invitation Supabase disponible."
              actionLabel="Créer une invitation"
              onAction={() => navigate({ to: "/" })}
            />
          )}
          {!loadingInvitation && !invitationLoadFailed && step === "ask" && (
            <AskCard
              invitation={invitation}
              theme={theme}
              onYes={onYes}
              onCopyLink={copyLink}
              copied={copied}
            />
          )}
          {!loadingInvitation && !invitationLoadFailed && step === "form" && (
            <FormCard
              invitation={invitation}
              theme={theme}
              booking={booking}
              setBooking={setBooking}
              onSubmit={submitBooking}
              submitting={savingResponse}
            />
          )}
          {!loadingInvitation && !invitationLoadFailed && step === "done" && (
            <DoneCard
              invitation={invitation}
              theme={theme}
              booking={booking}
              responseStatus={responseStatus}
              onCopy={copySummary}
              copied={copied}
              onRestart={restart}
              onEdit={() => navigate({ to: "/" })}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function StatusCard({
  theme,
  title,
  text,
  actionLabel,
  onAction,
}: {
  theme: ThemePreset;
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      className="backdrop-blur rounded-3xl p-8 text-center animate-pop-in"
      style={cardStyle(theme)}
    >
      <div className="text-5xl mb-3">{theme.emoji}</div>
      <h1 className="font-display text-4xl" style={{ color: theme.colors.primary }}>
        {title}
      </h1>
      <p className="mt-3" style={{ color: theme.colors.mutedForeground }}>
        {text}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 w-full rounded-2xl py-3 font-bold transition hover:brightness-110"
          style={{
            background: theme.colors.primary,
            color: theme.colors.primaryForeground,
            boxShadow: theme.colors.shadow,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function cardStyle(theme: ThemePreset): React.CSSProperties {
  return {
    background: `color-mix(in oklab, ${theme.colors.card} 92%, transparent)`,
    color: theme.colors.cardForeground,
    boxShadow: theme.colors.shadow,
  };
}

function AskCard({
  invitation,
  theme,
  onYes,
  onCopyLink,
  copied,
}: {
  invitation: Invitation;
  theme: ThemePreset;
  onYes: () => void;
  onCopyLink: () => void;
  copied: boolean;
}) {
  return (
    <div
      className="backdrop-blur rounded-3xl p-8 sm:p-12 text-center animate-pop-in relative"
      style={cardStyle(theme)}
    >
      <div className="text-6xl mb-4 animate-wiggle inline-block">{theme.emoji}💌</div>
      <h1 className="font-display text-4xl sm:text-5xl" style={{ color: theme.colors.primary }}>
        Hey {invitation.to || "toi"} {theme.emoji}
      </h1>
      <p className="mt-4 text-lg" style={{ color: theme.colors.mutedForeground }}>
        {invitation.intro}
      </p>
      <p className="mt-6 text-2xl sm:text-3xl font-display leading-snug">{invitation.question}</p>

      <div className="relative mt-10 h-40 sm:h-28">
        <button
          onClick={onYes}
          className="absolute left-1/2 top-0 px-6 py-4 rounded-2xl text-xl font-bold transition hover:brightness-110 active:scale-95 sm:px-8"
          style={{
            transform: `translateX(calc(-100% - ${runawayButtonGap}px))`,
            background: theme.colors.primary,
            color: theme.colors.primaryForeground,
            boxShadow: theme.colors.shadow,
          }}
        >
          Oui {theme.emoji}
        </button>
        <RunawayButton theme={theme} />
      </div>

      <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
        <p className="text-xs mb-2" style={{ color: theme.colors.mutedForeground }}>
          Tu es la personne qui a créé l'invitation ?
        </p>
        <button
          onClick={onCopyLink}
          className="text-sm font-semibold hover:underline"
          style={{ color: theme.colors.primary }}
        >
          {copied ? "Lien copié ✨" : "📋 Copier le lien de l'invitation"}
        </button>
      </div>
    </div>
  );
}

const runawayButtonGap = 8;
const runawayButtonSafeGap = 10;
const runawayPointerDanger = 96;

function RunawayButton({ theme }: { theme: ThemePreset }) {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dodges, setDodges] = useState(0);
  const ref = useRef<HTMLButtonElement>(null);

  const dodge = (pointer?: { x: number; y: number }) => {
    const parent = ref.current?.parentElement;
    const button = ref.current;
    if (!parent || !button) return;

    const parentRect = parent.getBoundingClientRect();
    const yesRect = button.previousElementSibling?.getBoundingClientRect();
    const pw = parent.offsetWidth;
    const ph = parent.offsetHeight;
    const bw = button.offsetWidth;
    const bh = button.offsetHeight;
    const top = button.offsetTop;
    const baseLeft = pw / 2 + runawayButtonGap;
    const minX = -baseLeft;
    const maxX = pw - bw - baseLeft;
    const minY = -top;
    const maxY = Math.max(0, ph - top - bh);
    const farEnough = Math.min(Math.max(pw * 0.34, 150), 260);

    let next = pos;
    let bestScore = -Infinity;

    for (let i = 0; i < 80; i += 1) {
      const candidate = {
        x: Math.random() * (maxX - minX) + minX,
        y: Math.random() * (maxY - minY) + minY,
      };

      const left = parentRect.left + baseLeft + candidate.x;
      const topEdge = parentRect.top + top + candidate.y;
      const right = left + bw;
      const bottom = topEdge + bh;
      const centerX = left + bw / 2;
      const centerY = topEdge + bh / 2;
      const movement = Math.hypot(candidate.x - pos.x, candidate.y - pos.y);
      const overlapsYes =
        yesRect &&
        left < yesRect.right + runawayButtonSafeGap &&
        right > yesRect.left - runawayButtonSafeGap &&
        topEdge < yesRect.bottom + runawayButtonSafeGap &&
        bottom > yesRect.top - runawayButtonSafeGap;

      if (overlapsYes) continue;

      if (!pointer) {
        next = candidate;
        break;
      }

      const outsideDangerZone =
        pointer.x < left - runawayPointerDanger ||
        pointer.x > left + bw + runawayPointerDanger ||
        pointer.y < topEdge - runawayPointerDanger ||
        pointer.y > topEdge + bh + runawayPointerDanger;
      const distance = Math.hypot(centerX - pointer.x, centerY - pointer.y);
      const score = distance * 2 + movement + (outsideDangerZone ? farEnough : 0);

      if (movement > 24 && score > bestScore) {
        next = candidate;
        bestScore = score;
      }
    }

    if (pointer && bestScore === -Infinity) {
      next = {
        x: pointer.x < parentRect.left + pw / 2 ? maxX : minX,
        y: pointer.y < parentRect.top + ph / 2 ? maxY : minY,
      };
    }

    setPos(next);
    setDodges((d) => d + 1);
  };

  const messages = [
    "Non 😅",
    "Même pas 😌",
    "Essaie encore 😇",
    "Pas si vite 😜",
    "Tu m'as raté 😌",
    "Presque 😅",
    "Tu es sûr(e) ? 🥺",
    "Réfléchis encore 💭",
    "Ça compte pas 🙈",
    "Je bouge trop vite ✨",
    "Non non non 😭",
    "Réfléchis bien 💔",
    "Dernière chance 😏",
    "Impossible 🙈",
    "Trop tard 😜",
  ];
  const label = messages[Math.min(dodges, messages.length - 1)];

  return (
    <button
      ref={ref}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") dodge({ x: e.clientX, y: e.clientY });
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== "touch") dodge({ x: e.clientX, y: e.clientY });
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        dodge({ x: e.clientX, y: e.clientY });
      }}
      onFocus={() => dodge()}
      onClick={(e) => {
        e.preventDefault();
        dodge();
      }}
      style={{
        transform: `translate(${runawayButtonGap + pos.x}px, ${pos.y}px)`,
        background: theme.colors.muted,
        color: theme.colors.mutedForeground,
        border: `1px solid ${theme.colors.border}`,
      }}
      className="absolute left-1/2 top-0 w-36 whitespace-nowrap rounded-2xl px-3 py-3 text-sm font-semibold shadow-sm transition-transform duration-200 ease-out will-change-transform sm:w-44 sm:px-6 sm:text-base"
    >
      {label}
    </button>
  );
}

function FormCard({
  invitation,
  theme,
  booking,
  setBooking,
  onSubmit,
  submitting,
}: {
  invitation: Invitation;
  theme: ThemePreset;
  booking: Booking;
  setBooking: (b: Booking) => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  submitting: boolean;
}) {
  const inputStyle: React.CSSProperties = {
    background: `color-mix(in oklab, ${theme.colors.input} 70%, transparent)`,
    borderColor: theme.colors.border,
    color: theme.colors.foreground,
  };
  return (
    <div className="backdrop-blur rounded-3xl p-6 sm:p-10 animate-pop-in" style={cardStyle(theme)}>
      <div className="text-center">
        <div className="text-5xl mb-2">😍</div>
        <h2 className="font-display text-3xl sm:text-4xl" style={{ color: theme.colors.primary }}>
          Je savais que tu dirais oui 😍
        </h2>
        <p className="mt-2" style={{ color: theme.colors.mutedForeground }}>
          Choisis les détails de notre rendez-vous ✨
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold mb-2">Date 📅</span>
            <input
              required
              type="date"
              value={booking.date}
              onChange={(e) => setBooking({ ...booking, date: e.target.value })}
              className={inputClass}
              style={inputStyle}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-2">Heure ⏰</span>
            <input
              required
              type="time"
              value={booking.time}
              onChange={(e) => setBooking({ ...booking, time: e.target.value })}
              className={inputClass}
              style={inputStyle}
            />
          </label>
        </div>

        <label className="block">
          <span className="block text-sm font-semibold mb-2">Activité 🎉</span>
          <select
            required
            value={booking.activity}
            onChange={(e) => setBooking({ ...booking, activity: e.target.value })}
            className={inputClass}
            style={inputStyle}
          >
            {invitation.activities.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-sm font-semibold mb-2">Un petit message ? 💌</span>
          <textarea
            value={booking.message}
            onChange={(e) => setBooking({ ...booking, message: e.target.value })}
            rows={3}
            placeholder="(optionnel)"
            className={inputClass + " resize-none"}
            style={inputStyle}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 py-4 rounded-2xl text-lg font-bold transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            background: theme.colors.primary,
            color: theme.colors.primaryForeground,
            boxShadow: theme.colors.shadow,
          }}
        >
          {submitting ? "Enregistrement..." : `Confirmer notre rendez-vous ${theme.emoji}`}
        </button>
      </form>
    </div>
  );
}

function DoneCard({
  invitation,
  theme,
  booking,
  responseStatus,
  onCopy,
  copied,
  onRestart,
  onEdit,
}: {
  invitation: Invitation;
  theme: ThemePreset;
  booking: Booking;
  responseStatus: "idle" | "saved" | "failed" | "skipped";
  onCopy: () => void;
  copied: boolean;
  onRestart: () => void;
  onEdit: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    const colors = confettiColors(theme);
    const id = setInterval(() => {
      confetti({
        particleCount: 40,
        spread: 70,
        startVelocity: 30,
        origin: { x: Math.random(), y: Math.random() * 0.3 },
        colors,
      });
    }, 1400);
    return () => clearInterval(id);
  }, [theme]);

  const dateStr = booking.date
    ? new Date(booking.date + "T" + booking.time).toLocaleString("fr-FR", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "";

  const captureCard = async () => {
    if (!cardRef.current || capturing) return;
    setCapturing(true);

    try {
      const blob = await elementToPngBlob(cardRef.current);
      const file = new File([blob], "rendez-vous-confirme.png", { type: "image/png" });
      const shareData: ShareData = {
        title: "Rendez-vous confirmé",
        text: `${invitation.to} & ${invitation.from} - ${booking.activity}`,
        files: [file],
      };

      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        downloadBlob(blob, file.name);
      }
    } catch {
      // The share dialog can be cancelled; there is no user-facing recovery needed.
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className="backdrop-blur rounded-3xl p-6 sm:p-10 text-center animate-pop-in"
      style={cardStyle(theme)}
    >
      <div className="text-6xl mb-3">{theme.emoji}💖</div>
      <h2 className="font-display text-4xl sm:text-5xl" style={{ color: theme.colors.primary }}>
        Rendez-vous confirmé {theme.emoji}
      </h2>
      <p className="mt-2" style={{ color: theme.colors.mutedForeground }}>
        {invitation.to} & {invitation.from}, ça va être magique ✨
      </p>

      <div
        className="mt-6 space-y-3 text-left rounded-2xl p-5"
        style={{ background: `color-mix(in oklab, ${theme.colors.secondary} 70%, transparent)` }}
      >
        <Row theme={theme} label="📅 Date" value={dateStr} />
        <Row theme={theme} label="🎉 Activité" value={booking.activity} />
        {booking.message && <Row theme={theme} label="💌 Message" value={booking.message} />}
      </div>

      <div data-capture-hidden className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onCopy}
          className="flex-1 py-3 rounded-2xl font-bold transition hover:brightness-110"
          style={{
            background: theme.colors.primary,
            color: theme.colors.primaryForeground,
            boxShadow: theme.colors.shadow,
          }}
        >
          {copied ? "Copié ✨" : "📋 Copier le résumé"}
        </button>
        <button
          onClick={onRestart}
          className="flex-1 py-3 rounded-2xl font-semibold transition hover:brightness-105"
          style={{ background: theme.colors.accent, color: theme.colors.accentForeground }}
        >
          🔁 Recommencer
        </button>
      </div>
      {responseStatus !== "idle" && responseStatus !== "skipped" && (
        <p
          data-capture-hidden
          className="mt-3 text-xs"
          style={{ color: theme.colors.mutedForeground }}
        >
          {responseStatus === "saved"
            ? "Réponse sauvegardée dans Supabase."
            : "La réponse n'a pas pu être sauvegardée, mais le résumé reste disponible."}
        </p>
      )}
      <button
        data-capture-hidden
        onClick={captureCard}
        disabled={capturing}
        className="mt-3 w-full rounded-2xl py-3 font-bold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        style={{
          background: theme.colors.secondary,
          color: theme.colors.secondaryForeground,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        {capturing ? "Préparation..." : "📸 Capturer pour partager"}
      </button>
      <button
        data-capture-hidden
        onClick={onEdit}
        className="mt-3 text-sm hover:underline"
        style={{ color: theme.colors.primary }}
      >
        ✏️ Modifier mon invitation
      </button>
      <div data-capture-hidden className="mt-2">
        <Link
          to="/"
          className="text-xs hover:underline"
          style={{ color: theme.colors.mutedForeground }}
        >
          Créer une nouvelle invitation
        </Link>
      </div>
    </div>
  );
}

function elementToPngBlob(element: HTMLElement): Promise<Blob> {
  const rect = element.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const clone = element.cloneNode(true) as HTMLElement;

  copyComputedStyles(element, clone);
  clone.querySelectorAll("[data-capture-hidden]").forEach((node) => node.remove());
  clone.style.width = `${width}px`;
  clone.style.height = "auto";
  clone.style.margin = "0";
  clone.style.transform = "none";

  const measureWrapper = document.createElement("div");
  measureWrapper.style.position = "fixed";
  measureWrapper.style.left = "-10000px";
  measureWrapper.style.top = "0";
  measureWrapper.style.pointerEvents = "none";
  measureWrapper.appendChild(clone);
  document.body.appendChild(measureWrapper);

  const height = Math.ceil(clone.getBoundingClientRect().height);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">${new XMLSerializer().serializeToString(clone)}</div>
      </foreignObject>
    </svg>
  `;
  measureWrapper.remove();

  const image = new Image();
  const canvas = document.createElement("canvas");
  const scale = Math.min(3, window.devicePixelRatio || 1);
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d");

  return new Promise((resolve, reject) => {
    if (!context) {
      reject(new Error("Impossible de préparer la capture."));
      return;
    }

    image.onload = () => {
      context.scale(scale, scale);
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(image.src);
        if (blob) resolve(blob);
        else reject(new Error("Impossible de créer l'image."));
      }, "image/png");
    };
    image.onerror = () => {
      URL.revokeObjectURL(image.src);
      reject(new Error("Impossible de charger la capture."));
    };
    image.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  });
}

function copyComputedStyles(source: Element, target: Element) {
  const styles = window.getComputedStyle(source);
  let cssText = "";

  for (let i = 0; i < styles.length; i += 1) {
    const property = styles.item(i);
    cssText += `${property}:${styles.getPropertyValue(property)};`;
  }

  (target as HTMLElement).style.cssText = cssText;

  Array.from(source.children).forEach((sourceChild, index) => {
    const targetChild = target.children.item(index);
    if (targetChild) copyComputedStyles(sourceChild, targetChild);
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function Row({ theme, label, value }: { theme: ThemePreset; label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 items-start">
      <span className="text-sm font-semibold" style={{ color: theme.colors.secondaryForeground }}>
        {label}
      </span>
      <span className="text-right" style={{ color: theme.colors.foreground }}>
        {value}
      </span>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition placeholder:opacity-60";
