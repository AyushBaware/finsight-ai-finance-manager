const BudgetProgressBar = ({ label, spent = 0, limit = 0 }) => {
  const isOverBudget = limit > 0 && spent > limit
  const percent = limit > 0 ? (spent / limit) * 100 : 0
  const progressWidth = Math.min(percent, 100)
  const fillColor = isOverBudget ? "#DC2626" : "var(--warning-color)" 

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-body-strong theme-text">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-caption tabular-nums theme-muted-text">
            Rs {spent.toLocaleString()} / {limit.toLocaleString()}
          </span>
          {isOverBudget ? (
            <span
              aria-label="Over budget"
              title="Over budget"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600"
            >
              !
            </span>
          ) : null}
        </div>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: isOverBudget ? "rgba(220, 38, 38, 0.12)" : "rgba(245, 158, 11, 0.15)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progressWidth}%`, backgroundColor: fillColor }}
        />
      </div>
    </div>
  )
}

export default BudgetProgressBar