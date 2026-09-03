import { Trash2 } from "lucide-react"

const TransactionRow = ({ category, note, date, amount, icon, type = "expense", onDelete }) => {
  const isIncome = type === "income"

  return (
    <div className="group relative flex h-14 items-center gap-3 rounded-xl px-3 theme-card border">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
        style={{ background: "var(--surface-muted)" }}
      >
        {icon || category?.[0] || "?"}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-body-strong theme-text truncate">{category || "Other"}</p>
        <p className="text-caption theme-muted-text truncate">
          {note || "No note"}
          {date ? ` · ${new Date(date).toLocaleDateString()}` : ""}
        </p>
      </div>

      <p
        className="tabular-nums text-body-strong shrink-0 ml-auto"
        style={{ color: isIncome ? "var(--positive-color)" : "var(--negative-color)" }}
      >
        {isIncome ? "+" : "−"} Rs {Number(amount || 0).toLocaleString()}
      </p>

      {onDelete ? (
        <button
          onClick={onDelete}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-[var(--surface-color)] p-1.5 opacity-0 shadow-sm transition-opacity hover:bg-[var(--surface-muted)] group-hover:opacity-100"
          title="Delete"
        >
          <Trash2 size={16} className="theme-muted-text" />
        </button>
      ) : null}
    </div>
  )
} 

export default TransactionRow