import { useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"
import Card from "../components/ui/Card"
import Input from "../components/ui/Input"
import TransactionRow from "../components/ui/TransactionRow"
import { getCategoryIcon } from "../utils/categoryIcons"
import { showToast } from "../utils/toastStore"
import { useExpenses } from "../context/ExpensesContext"
import accountsService from "../services/accountsService"

const CATEGORIES = ["All", "Food & Dining", "Entertainment", "Shopping", "Utilities", "Transport", "Subscription", "Healthcare"]
const SWIPE_DELETE_THRESHOLD = -72

const getDayLabel = (dateStr) => {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return "Unknown date"

  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()

  if (isSameDay(date, today)) return "Today"
  if (isSameDay(date, yesterday)) return "Yesterday"

  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })
}

// Swipe-to-delete wrapper for mobile — desktop still uses TransactionRow's
// built-in hover-delete icon, this just adds a touch gesture on top.
const SwipeableRow = ({ expense, onDelete }) => {
  const [offsetX, setOffsetX] = useState(0)
  const touchStartX = useRef(null)

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return
    const delta = e.touches[0].clientX - touchStartX.current
    setOffsetX(Math.min(0, Math.max(delta, -96)))
  }

  const handleTouchEnd = () => {
    if (offsetX <= SWIPE_DELETE_THRESHOLD) {
      onDelete()
    }
    setOffsetX(0)
    touchStartX.current = null
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div
        className="absolute inset-y-0 right-0 flex w-24 items-center justify-center text-sm font-semibold text-white"
        style={{ background: "var(--negative-color)" }}
      >
        Delete
      </div>
      <div
        style={{ transform: `translateX(${offsetX}px)`, transition: touchStartX.current ? "none" : "transform 0.2s ease" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <TransactionRow
          category={expense.category}
          note={expense.note}
          date={expense.date}
          amount={expense.amount}
          icon={getCategoryIcon(expense.category)}
          type={expense.type}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}

const CategorySelect = ({ value, onChange, className }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`theme-input w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${className || ""}`}
  >
    {CATEGORIES.map((category) => (
      <option key={category} value={category}>{category}</option>
    ))}
  </select>
)

const ACCOUNTS = ["All", ...accountsService.getAccounts().map((a) => a.name)]

const AccountSelect = ({ value, onChange, className }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`theme-input w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${className || ""}`}
  >
    {ACCOUNTS.map((account) => (
      <option key={account} value={account}>{account}</option>
    ))}
  </select>
)

const Expenses = () => {
  const { deleteExpense, expenses, hasPendingWrites, isReady } = useExpenses()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedAccount, setSelectedAccount] = useState("All")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [pendingDeleteIds, setPendingDeleteIds] = useState(new Set())
  const deleteTimers = useRef({})

  const visibleExpenses = expenses.filter((e) => !pendingDeleteIds.has(e.id))

  const filteredExpenses = visibleExpenses.filter((expense) => {
    const categoryValue = expense.category || ""
    const noteValue = expense.note || ""
    const matchesSearch =
      categoryValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      noteValue.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || categoryValue === selectedCategory
    const accountName = accountsService.getAccountById(expense.accountId || "cash")?.name
    const matchesAccount = selectedAccount === "All" || accountName === selectedAccount
    const matchesFrom = !dateFrom || expense.date >= dateFrom
    const matchesTo = !dateTo || expense.date <= dateTo
    return matchesSearch && matchesCategory && matchesAccount && matchesFrom && matchesTo
  })

  const groupedExpenses = useMemo(() => {
    const groups = []
    const groupIndexByLabel = new Map()

    for (const expense of filteredExpenses) {
      const label = getDayLabel(expense.date)
      if (!groupIndexByLabel.has(label)) {
        groupIndexByLabel.set(label, groups.length)
        groups.push({ label, items: [] })
      }
      groups[groupIndexByLabel.get(label)].items.push(expense)
    }

    return groups
  }, [filteredExpenses])

  const handleDelete = (expense) => {
    const id = expense.id
    setPendingDeleteIds((prev) => new Set(prev).add(id))

    showToast(`Deleted ${expense.category || "expense"}`, "info", 4000, {
      label: "Undo",
      onClick: () => {
        clearTimeout(deleteTimers.current[id])
        delete deleteTimers.current[id]
        setPendingDeleteIds((prev) => { const n = new Set(prev); n.delete(id); return n })
      },
    })

    deleteTimers.current[id] = setTimeout(async () => {
      delete deleteTimers.current[id]
      const deleted = await deleteExpense(id)
      if (!deleted) {
        showToast("Could not delete this expense right now.", "error")
        setPendingDeleteIds((prev) => { const n = new Set(prev); n.delete(id); return n })
      }
    }, 4000)
  }

  return (
    <div className="space-y-6">
      <div className="theme-hero rounded-2xl p-6 shadow-lg">
        <h1 className="text-h1">Expenses</h1>
        <p className="text-body mt-2 opacity-90">View, manage, and optimize your spending patterns</p>
      </div>

      {hasPendingWrites ? (
        <p className="theme-muted-text text-caption">Saving locally and syncing to your account...</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
        {/* Desktop persistent filter sidebar — category + date range */}
        <Card padding="lg" className="hidden h-fit space-y-4 lg:block">
          <div>
            <label className="mb-2 block text-caption theme-muted-text">Category</label>
            <CategorySelect value={selectedCategory} onChange={setSelectedCategory} />
          </div>
                    <div>
            <label className="mb-2 block text-caption theme-muted-text">Account</label>
            <AccountSelect value={selectedAccount} onChange={setSelectedAccount} />
          </div>
          <div>
            <label className="mb-2 block text-caption theme-muted-text">From</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-caption theme-muted-text">To</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card padding="lg">
            <div className="relative">
              <label className="mb-2 block text-caption theme-muted-text">Search</label>
              <Search size={18} className="pointer-events-none absolute left-3 top-[calc(50%+0.6rem)] -translate-y-1/2 theme-muted-text" />
              <Input
                placeholder="Search by category or note"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category dropdown — mobile/tablet only, sidebar covers desktop */}
            <div className="mt-3 lg:hidden">
              <label className="mb-2 block text-caption theme-muted-text">Category</label>
              <CategorySelect value={selectedCategory} onChange={setSelectedCategory} />
            </div>
                        <div className="mt-3 lg:hidden">
              <label className="mb-2 block text-caption theme-muted-text">Account</label>
              <AccountSelect value={selectedAccount} onChange={setSelectedAccount} />
            </div>
          </Card>

          <section className="space-y-4">
            {groupedExpenses.length > 0 ? (
              groupedExpenses.map((group) => (
                <div key={group.label}>
                  <div className="theme-shell sticky top-0 z-10 py-1.5">
                    <p className="text-caption theme-muted-text font-semibold">{group.label}</p>
                  </div>
                  <div className="space-y-2">
                    {group.items.map((expense) => (
                      <div key={expense.id} className="md:hidden">
                        <SwipeableRow expense={expense} onDelete={() => handleDelete(expense)} />
                      </div>
                    ))}
                    {group.items.map((expense) => (
                      <div key={`${expense.id}-desktop`} className="hidden md:block">
                        <TransactionRow
                          category={expense.category}
                          note={expense.note}
                          date={expense.date}
                          amount={expense.amount}
                          icon={getCategoryIcon(expense.category)}
                          type={expense.type}
                          onDelete={() => handleDelete(expense)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <Card padding="lg" className="text-center theme-muted-text">
                <p>{isReady ? "No expenses found matching your filters" : "Loading expenses..."}</p>
              </Card>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default Expenses