import { useState } from "react"
import { Plus, Search, Trash2 } from "lucide-react"

import Card from "../components/ui/Card"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import SmartExpenseAnalyzer from "../components/common/SmartExpenseAnalyzer"
import VoiceRecorder from "../components/common/VoiceRecorder"
import { ToastContainer } from "../components/common/Toast"
import { useExpenses } from "../context/ExpensesContext"

const Expenses = () => {
  const { addExpense, deleteExpense, expenses, hasPendingWrites, isReady } = useExpenses()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = [
    "All",
    "Food & Dining",
    "Entertainment",
    "Shopping",
    "Utilities",
    "Transport",
    "Subscription",
    "Healthcare",
  ]

  const filteredExpenses = expenses.filter((expense) => {
    const categoryValue = expense.category || ""
    const noteValue = expense.note || ""
    const matchesSearch =
      categoryValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      noteValue.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === "All" || categoryValue === selectedCategory

    return matchesSearch && matchesCategory
  })

  const overallExpenseAmount = expenses.reduce(
    (sum, expense) => sum + (Number(expense.amount) || 0),
    0,
  )
  const categoryExpenses = categories
    .filter((category) => category !== "All")
    .map((category) => {
      const total = expenses
        .filter((expense) => (expense.category || "") === category)
        .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)

      return {
        category,
        amount: total,
        percentage: overallExpenseAmount ? (total / overallExpenseAmount) * 100 : 0,
      }
    })

  const handleVoiceExpenseDetected = async (newExpense) => {
    const savedExpense = await addExpense({
      amount: Number(newExpense.amount) || 0,
      category: newExpense.category || "Other",
      note: newExpense.note || newExpense.merchant || "Voice input",
      date: newExpense.date || new Date().toISOString().split("T")[0],
      merchant: newExpense.merchant,
    })

    if (!savedExpense) {
      alert("Could not save this expense right now.")
    }
  }

  const handleQuickAdd = async () => {
    const amountRaw = window.prompt("Enter amount (numbers only)")
    if (!amountRaw) return

    const amount = parseFloat(amountRaw.replace(/[^0-9.]/g, ""))
    if (Number.isNaN(amount) || amount <= 0) {
      alert("Invalid amount")
      return
    }

    const category =
      window.prompt("Category (e.g. Food & Dining)", "Food & Dining") || "Other"
    const note = window.prompt("Note (optional)", "") || ""

    const savedExpense = await addExpense({
      amount,
      category,
      note,
      date: new Date().toISOString().split("T")[0],
    })

    if (!savedExpense) {
      alert("Could not save this expense right now.")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return
    const deleted = await deleteExpense(id)

    if (!deleted) {
      alert("Could not delete this expense right now.")
    }
  }

  return (
    <div className="space-y-6">
      <ToastContainer />

      <div className="theme-hero rounded-2xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <p className="mt-2 opacity-90">
          View, manage, and optimize your spending patterns
        </p>
      </div>

      <VoiceRecorder onExpenseDetected={handleVoiceExpenseDetected} />

      <SmartExpenseAnalyzer expenses={categoryExpenses} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </h2>
            {hasPendingWrites ? (
              <p className="theme-muted-text mt-1 text-xs">
                Saving locally and syncing to your account...
              </p>
            ) : null}
          </div>
          <Button onClick={handleQuickAdd} className="flex items-center gap-2">
            <Plus size={16} />
            Add Expense
          </Button>
        </div>

        <Card padding="lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="relative flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Search
              </label>
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Search by category or note"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10"
              />
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
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense) => (
              <Card
                key={expense.id}
                padding="md"
                className="cursor-pointer transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {expense.category || "Other"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {expense.note || "No note"} |{" "}
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <p className="font-bold text-red-500 dark:text-red-400">
                      - Rs {Number(expense.amount || 0).toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      title="Delete expense"
                      className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card padding="lg" className="text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {isReady
                  ? "No expenses found matching your filters"
                  : "Loading expenses..."}
              </p>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}

export default Expenses
