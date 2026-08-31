import clsx from "clsx"

const HERO_TONES = {
  accent: {
    background: "linear-gradient(135deg, var(--accent-color), var(--accent-strong-color))",
    textColor: "#fff",
    mutedColor: "#EDF2F7",
    helperColor: "#E2E8F0",
    badgeBg: "rgba(255,255,255,0.18)",
    badgeColor: "#fff",
  },
  negative: {
    background:
      "linear-gradient(135deg, var(--negative-color), color-mix(in srgb, var(--negative-color) 60%, black))",
    textColor: "#fff",
    mutedColor: "#EDF2F7",
    helperColor: "#E2E8F0",
    badgeBg: "rgba(255,255,255,0.2)",
    badgeColor: "#fff",
  },
}

// label (caption) → value (h1/display, tabular-nums) → optional delta chip
const StatCard = ({
  label,
  value,
  icon,
  delta,
  deltaType = "positive",
  hero = false,
  tone = "accent",
  subtext,
  className,
}) => {
  const heroTone = HERO_TONES[tone] || HERO_TONES.accent

  return (
    <div
      className={clsx(
        "rounded-2xl p-4",
        hero
          ? "col-span-2 p-6 shadow-[var(--shadow-md)]"
          : "theme-card border shadow-[var(--shadow-sm)]",
        className,
      )}
      style={hero ? { background: heroTone.background } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={clsx("text-caption", !hero && "theme-muted-text")}
          style={hero ? { color: heroTone.mutedColor } : undefined}
        >
          {label}
        </p>

        {hero && delta ? (
          <span
            className="text-micro shrink-0 rounded-full px-2.5 py-1 font-semibold"
            style={{ background: heroTone.badgeBg, color: heroTone.badgeColor }}
          >
            {delta}
          </span>
        ) : icon ? (
          <span
            className={!hero ? "theme-accent-text" : undefined}
            style={hero ? { color: heroTone.textColor } : undefined}
          >
            {icon}
          </span>
        ) : null}
      </div>

      <p
        className={clsx("tabular-nums mt-1", hero ? "text-display" : "text-h2", !hero && "theme-text")}
        style={hero ? { color: heroTone.textColor } : undefined}
      >
        {value}
      </p>

      {subtext ? (
        <p
          className="text-caption mt-1"
          style={hero ? { color: heroTone.helperColor } : { color: "#A0AEC0" }}
        >
          {subtext}
        </p>
      ) : null}

      {!hero && delta ? (
        <span
          className="text-micro mt-2 inline-flex rounded-full px-2 py-0.5 font-semibold"
          style={{
            color: deltaType === "positive" ? "var(--positive-color)" : "var(--negative-color)",
            background:
              deltaType === "positive" ? "var(--positive-soft-color)" : "var(--negative-soft-color)",
          }}
        >
          {delta}
        </span>
      ) : null}
    </div>
  )
}

export default StatCard