import { useRef, useState } from "react"
import { Plus, Search } from "lucide-react"
import Card from "../components/ui/Card"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import TransactionRow from "../components/ui/TransactionRow"
import CategoryChip from "../components/ui/CategoryChip"
import { getCategoryIcon } from "../utils/categoryIcons"
import { showToast } from "../utils/toastStore"
import { useExpenses } from "../context/ExpensesContext"

const CATEGORIES = ["All", "Food & Dining", "Entertainment", "Shopping", "Utilities", "Transport", "Subscription", "Healthcare"]

const Expenses = () => {
  const { deleteExpense, expenses, hasPendingWrites, isReady, openQuickAdd } = useExpenses()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
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
    return matchesSearch && matchesCategory
  })

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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-h2 theme-text">Recent Transactions</h2>
            {hasPendingWrites ? (
              <p className="theme-muted-text mt-1 text-caption">Saving locally and syncing to your account...</p>
            ) : null}
          </div>
          <Button onClick={openQuickAdd} className="flex items-center gap-2">
            <Plus size={16} />
            Add Expense
          </Button>
        </div>

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
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <CategoryChip
                key={category}
                label={category}
                selected={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              />
            ))}
          </div>
        </Card>

        <section className="space-y-2">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense) => (
              <TransactionRow
                key={expense.id}
                category={expense.category}
                note={expense.note}
                date={expense.date}
                amount={expense.amount}
                icon={getCategoryIcon(expense.category)}
                onDelete={() => handleDelete(expense)}
              />
            ))
          ) : (
            <Card padding="lg" className="text-center theme-muted-text">
              <p>{isReady ? "No expenses found matching your filters" : "Loading expenses..."}</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}

export default Expenses