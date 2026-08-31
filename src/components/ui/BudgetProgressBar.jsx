const BudgetProgressBar = ({ label, spent = 0, limit = 0 }) => {
  const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
  const color =
    percent >= 100 ? "var(--negative-color)" : percent >= 80 ? "var(--warning-color)" : "var(--accent-color)"

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-body-strong theme-text">{label}</span>
        <span className="text-caption tabular-nums theme-muted-text">
          Rs {spent.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-muted)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
    </div>
  )
}

export default BudgetProgressBar