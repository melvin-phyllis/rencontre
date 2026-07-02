import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AMBIANCES,
  DEFAULT_CUSTOM,
  DEFAULT_INVITATION,
  THEMES,
  encodeInvitation,
  getTheme,
  themeStyle,
  type Ambiance,
  type Invitation,
  type ThemeId,
} from "@/lib/invitation";
import { createStoredInvitation } from "@/lib/supabase";
import { ThemeBackground } from "@/components/ThemeBackground";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [inv, setInv] = useState<Invitation>(DEFAULT_INVITATION);
  const [newActivity, setNewActivity] = useState("");
  const [editedIntro, setEditedIntro] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(false);
  const [editedActivities, setEditedActivities] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("invitation_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        setInv({ ...DEFAULT_INVITATION, ...parsed });
        setEditedIntro(true);
        setEditedQuestion(true);
        setEditedActivities(true);
      }
    } catch {
      // Draft recovery is optional; the form still works without it.
    }
  }, []);

  const theme = useMemo(() => getTheme(inv), [inv]);

  const update = <K extends keyof Invitation>(key: K, value: Invitation[K]) =>
    setInv((prev) => ({ ...prev, [key]: value }));

  const selectTheme = (id: ThemeId) => {
    setInv((prev) => {
      const nextCustom = id === "custom" ? (prev.custom ?? DEFAULT_CUSTOM) : prev.custom;
      const preview = getTheme({ ...prev, themeId: id, custom: nextCustom });
      return {
        ...prev,
        themeId: id,
        custom: nextCustom,
        intro: editedIntro ? prev.intro : preview.defaultIntro,
        question: editedQuestion ? prev.question : preview.defaultQuestion,
        activities: editedActivities ? prev.activities : preview.defaultActivities,
      };
    });
  };

  const updateCustom = <K extends keyof NonNullable<Invitation["custom"]>>(
    key: K,
    value: NonNullable<Invitation["custom"]>[K],
  ) => {
    setInv((prev) => {
      const custom = { ...(prev.custom ?? DEFAULT_CUSTOM), [key]: value };
      if (key === "ambiance") {
        const preview = getTheme({ ...prev, themeId: "custom", custom });
        return {
          ...prev,
          custom,
          intro: editedIntro ? prev.intro : preview.defaultIntro,
          question: editedQuestion ? prev.question : preview.defaultQuestion,
        };
      }
      return { ...prev, custom };
    });
  };

  const addActivity = () => {
    const t = newActivity.trim();
    if (!t) return;
    setEditedActivities(true);
    update("activities", [...inv.activities, t]);
    setNewActivity("");
  };
  const removeActivity = (idx: number) => {
    setEditedActivities(true);
    update(
      "activities",
      inv.activities.filter((_, i) => i !== idx),
    );
  };
  const updateActivity = (idx: number, value: string) => {
    setEditedActivities(true);
    update(
      "activities",
      inv.activities.map((a, i) => (i === idx ? value : a)),
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !inv.to.trim() || !inv.from.trim() || !inv.question.trim()) return;

    setSaving(true);
    try {
      localStorage.setItem("invitation_draft", JSON.stringify(inv));
    } catch {
      // Local draft persistence is a convenience, not a blocker.
    }

    try {
      const storedId = await createStoredInvitation(inv);
      if (storedId) {
        navigate({ to: "/invitation", search: { id: storedId } });
        return;
      }
    } catch (error) {
      console.error("Supabase invitation save failed, falling back to encoded URL.", error);
    }

    const code = encodeInvitation(inv);
    navigate({ to: "/invitation", search: { d: code } });
    setSaving(false);
  };

  const presetIds: Exclude<ThemeId, "custom">[] = [
    "love",
    "rencontre",
    "diner",
    "cinema",
    "balade",
    "surprise",
  ];

  return (
    <div style={themeStyle(theme)} className="min-h-screen">
      <ThemeBackground theme={theme} />
      <main className="min-h-screen px-4 py-10 flex items-center justify-center">
        <div
          className="w-full max-w-3xl rounded-3xl p-6 sm:p-10 animate-pop-in backdrop-blur"
          style={{
            background: `color-mix(in oklab, ${theme.colors.card} 90%, transparent)`,
            color: theme.colors.cardForeground,
            boxShadow: theme.colors.shadow,
          }}
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-2">{theme.emoji}💌</div>
            <h1
              className="font-display text-4xl sm:text-5xl"
              style={{ color: theme.colors.primary }}
            >
              Crée ton invitation
            </h1>
            <p className="mt-2" style={{ color: theme.colors.mutedForeground }}>
              Choisis un thème, personnalise ta question et envoie ton message ✨
            </p>
          </div>

          <section className="mb-8">
            <h2 className="font-display text-2xl mb-3" style={{ color: theme.colors.primary }}>
              Choisis le thème de ton invitation
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {presetIds.map((id) => {
                const t = THEMES[id];
                const active = inv.themeId === id;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => selectTheme(id)}
                    className="text-left rounded-2xl p-3 transition-all"
                    style={{
                      background: t.colors.gradient,
                      color: t.colors.cardForeground,
                      border: `2px solid ${active ? t.colors.primary : "transparent"}`,
                      boxShadow: active ? t.colors.shadow : "0 4px 12px -6px rgba(0,0,0,0.15)",
                      transform: active ? "translateY(-2px)" : undefined,
                    }}
                  >
                    <div className="text-3xl mb-1">{t.emoji}</div>
                    <div className="font-semibold text-sm" style={{ color: t.colors.primary }}>
                      {t.name}
                    </div>
                    <div
                      className="text-xs opacity-90 mt-0.5"
                      style={{ color: t.colors.foreground }}
                    >
                      {t.description}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {t.palette.map((c) => (
                        <span
                          key={c}
                          className="w-4 h-4 rounded-full border border-white/40"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => selectTheme("custom")}
                className="text-left rounded-2xl p-3 transition-all"
                style={{
                  background: "linear-gradient(135deg, #ffd6ec 0%, #d9c8ff 50%, #fff2c8 100%)",
                  color: "#3a2650",
                  border: `2px solid ${inv.themeId === "custom" ? "#7a5cc6" : "transparent"}`,
                  boxShadow:
                    inv.themeId === "custom"
                      ? "0 12px 30px -12px rgba(122,92,198,0.5)"
                      : "0 4px 12px -6px rgba(0,0,0,0.15)",
                  transform: inv.themeId === "custom" ? "translateY(-2px)" : undefined,
                }}
              >
                <div className="text-3xl mb-1">✨</div>
                <div className="font-semibold text-sm">Personnalisé</div>
                <div className="text-xs opacity-80 mt-0.5">Choisis tes couleurs et ambiance</div>
                <div className="flex gap-1 mt-2">
                  <span
                    className="w-4 h-4 rounded-full border border-white/50"
                    style={{ background: inv.custom?.primary ?? DEFAULT_CUSTOM.primary }}
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-white/50"
                    style={{ background: inv.custom?.accent ?? DEFAULT_CUSTOM.accent }}
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-white/50"
                    style={{ background: inv.custom?.background ?? DEFAULT_CUSTOM.background }}
                  />
                </div>
              </button>
            </div>

            {inv.themeId === "custom" && (
              <div
                className="mt-4 rounded-2xl p-4 space-y-3"
                style={{
                  background: `color-mix(in oklab, ${theme.colors.secondary} 60%, transparent)`,
                }}
              >
                <div className="grid grid-cols-3 gap-3">
                  <ColorField
                    label="Principal"
                    value={inv.custom?.primary ?? DEFAULT_CUSTOM.primary}
                    onChange={(v) => updateCustom("primary", v)}
                  />
                  <ColorField
                    label="Accent"
                    value={inv.custom?.accent ?? DEFAULT_CUSTOM.accent}
                    onChange={(v) => updateCustom("accent", v)}
                  />
                  <ColorField
                    label="Fond"
                    value={inv.custom?.background ?? DEFAULT_CUSTOM.background}
                    onChange={(v) => updateCustom("background", v)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Ambiance</label>
                  <div className="flex flex-wrap gap-2">
                    {AMBIANCES.map((a) => {
                      const active = (inv.custom?.ambiance ?? "romantique") === a.id;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => updateCustom("ambiance", a.id as Ambiance)}
                          className="px-3 py-1.5 rounded-full text-sm transition"
                          style={{
                            background: active ? theme.colors.primary : theme.colors.muted,
                            color: active
                              ? theme.colors.primaryForeground
                              : theme.colors.foreground,
                            border: `1px solid ${theme.colors.border}`,
                          }}
                        >
                          {a.emoji} {a.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Emoji principal</label>
                  <div className="flex flex-wrap gap-2">
                    {["❤️", "💕", "💖", "💜", "✨", "🌙", "🎁", "🍷", "🎬", "😍", "🌹", "🥂"].map(
                      (e) => {
                        const active = (inv.custom?.emoji ?? "❤️") === e;
                        return (
                          <button
                            key={e}
                            type="button"
                            onClick={() => updateCustom("emoji", e)}
                            className="w-10 h-10 rounded-xl text-xl transition"
                            style={{
                              background: active ? theme.colors.primary : theme.colors.muted,
                              border: `1px solid ${theme.colors.border}`,
                            }}
                          >
                            {e}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Prénom de la personne 💕" theme={theme}>
                <input
                  required
                  value={inv.to}
                  onChange={(e) => update("to", e.target.value)}
                  placeholder="Sarah"
                  className={inputClass}
                  style={inputStyle(theme)}
                />
              </Field>
              <Field label="Ton prénom 😊" theme={theme}>
                <input
                  required
                  value={inv.from}
                  onChange={(e) => update("from", e.target.value)}
                  placeholder="Alex"
                  className={inputClass}
                  style={inputStyle(theme)}
                />
              </Field>
            </div>

            <Field label="Message d'introduction" theme={theme}>
              <input
                value={inv.intro}
                onChange={(e) => {
                  setEditedIntro(true);
                  update("intro", e.target.value);
                }}
                placeholder={theme.defaultIntro}
                className={inputClass}
                style={inputStyle(theme)}
              />
            </Field>

            <Field label="Ta question personnalisée ❤️" theme={theme}>
              <textarea
                required
                value={inv.question}
                onChange={(e) => {
                  setEditedQuestion(true);
                  update("question", e.target.value);
                }}
                rows={2}
                placeholder={theme.defaultQuestion}
                className={inputClass + " resize-none"}
                style={inputStyle(theme)}
              />
            </Field>

            <div>
              <label className="block text-sm font-semibold mb-2">Activités proposées 🎉</label>
              <div className="space-y-2">
                {inv.activities.map((a, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={a}
                      onChange={(e) => updateActivity(i, e.target.value)}
                      className={inputClass}
                      style={inputStyle(theme)}
                    />
                    <button
                      type="button"
                      onClick={() => removeActivity(i)}
                      className="px-3 rounded-xl text-lg transition"
                      style={{ background: theme.colors.muted, color: theme.colors.foreground }}
                      aria-label="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addActivity();
                    }
                  }}
                  placeholder="Ajouter une activité (ex: Danser 💃)"
                  className={inputClass}
                  style={inputStyle(theme)}
                />
                <button
                  type="button"
                  onClick={addActivity}
                  className="px-4 rounded-xl font-semibold transition"
                  style={{ background: theme.colors.accent, color: theme.colors.accentForeground }}
                >
                  + Ajouter
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditedActivities(false);
                    update("activities", theme.defaultActivities);
                  }}
                  className="text-xs underline"
                  style={{ color: theme.colors.mutedForeground }}
                >
                  Réinitialiser les activités du thème
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-4 py-4 rounded-2xl text-lg font-bold transition hover:brightness-110 active:scale-[0.98]"
              style={{
                background: theme.colors.primary,
                color: theme.colors.primaryForeground,
                boxShadow: theme.colors.shadow,
              }}
            >
              {saving ? "Création..." : `Créer mon invitation ${theme.emoji}`}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition placeholder:opacity-60";

function inputStyle(theme: ReturnType<typeof getTheme>): React.CSSProperties {
  return {
    background: `color-mix(in oklab, ${theme.colors.input} 70%, transparent)`,
    borderColor: theme.colors.border,
    color: theme.colors.foreground,
  };
}

function Field({
  label,
  theme,
  children,
}: {
  label: string;
  theme: ReturnType<typeof getTheme>;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span
        className="block text-sm font-semibold mb-2"
        style={{ color: theme.colors.secondaryForeground }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value.startsWith("#") ? value : "#ff4d94"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 rounded-lg cursor-pointer border"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-2 rounded-lg border text-xs"
        />
      </div>
    </label>
  );
}
