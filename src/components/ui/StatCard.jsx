import clsx from "clsx"

// label (caption) → value (h1/display, tabular-nums) → optional delta chip
const StatCard = ({ label, value, icon, delta, deltaType = "positive", hero = false, className }) => {
  return (
    <div
      className={clsx(
        "rounded-2xl p-4",
        hero
          ? "col-span-2 p-6 shadow-[var(--shadow-md)]"
          : "theme-card border shadow-[var(--shadow-sm)]",
        className,
      )}
      style={hero ? { background: "var(--accent-soft-color)" } : undefined}
    >
      <div className="flex items-start justify-between">
        <p className="text-caption theme-muted-text">{label}</p>
        {icon ? <span className="theme-accent-text">{icon}</span> : null}
      </div>

      <p className={clsx("tabular-nums mt-1 theme-text", hero ? "text-display" : "text-h1")}>
        {value}
      </p>

      {delta ? (
        <span
          className="text-micro mt-2 inline-flex rounded-full px-2 py-0.5"
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