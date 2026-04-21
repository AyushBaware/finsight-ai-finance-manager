import { Menu, Plus } from "lucide-react"

import { useExpenses } from "../../context/ExpensesContext"
import Button from "../ui/Button"
import BrandedHeader from "../common/BrandedHeader"

const Header = ({ title, onMenuClick, onAddClick }) => {
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
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="theme-muted-text rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:block">
          <BrandedHeader />
        </div>

        <div className="sm:hidden">
          <h1 className="theme-text text-lg font-semibold">{title}</h1>
        </div>
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

        <Button size="sm" className="flex items-center gap-1" onClick={onAddClick}>
          <Plus size={16} />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>
    </header>
  )
}

export default Header
