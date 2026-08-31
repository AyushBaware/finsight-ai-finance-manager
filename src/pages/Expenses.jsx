import { useRef, useState } from "react"
import { Plus, Search, Trash2 } from "lucide-react"
import Card from "../components/ui/Card"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import { showToast } from "../utils/toastStore"
import { useExpenses } from "../context/ExpensesContext"

const Expenses = () => {
  const { deleteExpense, expenses, hasPendingWrites, isReady, openQuickAdd } = useExpenses()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [pendingDeleteIds, setPendingDeleteIds] = useState(new Set())
  const deleteTimers = useRef({})

  const categories = ["All", "Food & Dining", "Entertainment", "Shopping", "Utilities", "Transport", "Subscription", "Healthcare"]

  const visibleExpenses = expenses.filter((e) => !pendingDeleteIds.has(e.id))
  const filteredExpenses = visibleExpenses.filter((expense) => {
    const categoryValue = expense.category || ""
    const noteValue = expense.note || ""
    const matchesSearch = categoryValue.toLowerCase().includes(searchTerm.toLowerCase()) || noteValue.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || categoryValue === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Delete immediately hides the row + shows "Deleted · Undo" — no window.confirm().
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
        <h1 className="text-3xl font-bold">Expenses</h1>
        <p className="mt-2 opacity-90">View, manage, and optimize your spending patterns</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
            {hasPendingWrites ? <p className="theme-muted-text mt-1 text-xs">Saving locally and syncing to your account...</p> : null}
          </div>
          <Button onClick={openQuickAdd} className="flex items-center gap-2"><Plus size={16} />Add Expense</Button>
        </div>

        <Card padding="lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="relative flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search by category or note" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </Card>

        <section className="space-y-2">
          {filteredExpenses.length > 0 ? filteredExpenses.map((expense) => (
            <Card key={expense.id} padding="md" className="cursor-pointer transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{expense.category || "Other"}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {expense.note || "No note"} | {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <p className="font-bold text-red-500 dark:text-red-400">- Rs {Number(expense.amount || 0).toLocaleString()}</p>
                  <button onClick={() => handleDelete(expense)} title="Delete expense" className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          )) : (
            <Card padding="lg" className="text-center">
              <p className="text-gray-500 dark:text-gray-400">{isReady ? "No expenses found matching your filters" : "Loading expenses..."}</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}

export default Expenses