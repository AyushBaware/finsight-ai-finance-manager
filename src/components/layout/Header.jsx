import { useNavigate } from "react-router-dom"
import { Plus, Settings as SettingsIcon, ShieldCheck } from "lucide-react"

import { useExpenses } from "../../context/ExpensesContext"
import Button from "../ui/Button"

const Header = ({ title, onAddClick }) => {
  const navigate = useNavigate()
  const { expenseError, hasPendingWrites, isOnline, persistenceState, user } = useExpenses()

  const statusLabel = expenseError
    ? "Sync issue"
    : hasPendingWrites
      ? "Syncing..."
      : !isOnline
        ? "Offline"
        : !persistenceState.enabled && persistenceState.attempted && user
          ? "Cloud cache off"
          : ""

  const statusTitle = expenseError || persistenceState.message || ""

  return (
    <header className="theme-card theme-border sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 md:hidden">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full shadow-sm"
          style={{
            background: "linear-gradient(135deg, var(--accent-color), var(--accent-strong-color))",
            color: "var(--accent-contrast-color)",
          }}
        >
          <ShieldCheck size={16} strokeWidth={1.5} />
        </div>
        <span
          className="text-lg font-black leading-none text-transparent"
          style={{
            backgroundImage: "linear-gradient(135deg, var(--accent-color), var(--accent-strong-color))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          FinSight
        </span>
      </div>

      <div className="flex items-center gap-3">
        {statusLabel ? (
          <div
            className="theme-panel theme-muted-text rounded-full px-3 py-1 text-xs font-medium"
            title={statusTitle}
          >
            {statusLabel}
          </div>
        ) : null}

        <div className="hidden sm:block">
          <Button size="sm" className="flex items-center gap-1" onClick={onAddClick}>
            <Plus size={16} />
            <span>Add</span>
          </Button>
        </div>

        <button
          onClick={() => navigate("/settings")}
          className="theme-muted-text rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
          title="Settings"
        >
          <SettingsIcon size={20} />
        </button>
      </div>
    </header>
  )
}

export default Header