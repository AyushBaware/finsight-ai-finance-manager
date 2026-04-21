import { useState } from "react"

import { useExpenses } from "../../context/ExpensesContext"
import Modal from "../ui/Modal"
import Button from "../ui/Button"
import Input from "../ui/Input"
import { showToast } from "../../utils/toastStore"

const QuickAddExpenseModal = ({ isOpen, onClose, onExpenseAdded }) => {
  const { addExpense, isOnline, user } = useExpenses()
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("Food & Dining")
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    "Food & Dining",
    "Entertainment",
    "Shopping",
    "Utilities",
    "Transport",
    "Subscription",
    "Healthcare",
    "Other",
  ]

  const handleSubmit = async (event) => {
    event.preventDefault()

    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ""))
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast("Please enter a valid amount", "error")
      return
    }

    setIsSubmitting(true)

    try {
      const newExpense = await addExpense({
        amount: parsedAmount,
        category,
        note: note || "Manual entry",
        date: new Date().toISOString().split("T")[0],
      })

      if (!newExpense) {
        throw new Error("Expense creation failed")
      }

      showToast(
        user && !isOnline
          ? `Expense saved offline: Rs ${parsedAmount}`
          : `Expense saved: Rs ${parsedAmount}`,
        "success",
        2500,
      )

      if (typeof onExpenseAdded === "function") {
        onExpenseAdded(newExpense)
      }

      setAmount("")
      setCategory("Food & Dining")
      setNote("")
      onClose()
    } catch (error) {
      console.error(error)
      showToast("Failed to save expense", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Add Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="theme-muted-text mb-1 block text-sm font-medium">
            Amount
          </label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            autoFocus
            step="0.01"
          />
        </div>

        <div>
          <label className="theme-muted-text mb-1 block text-sm font-medium">
            Category
          </label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="theme-input w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
          >
            {categories.map((categoryOption) => (
              <option key={categoryOption} value={categoryOption}>
                {categoryOption}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="theme-muted-text mb-1 block text-sm font-medium">
            Note (Optional)
          </label>
          <Input
            type="text"
            placeholder="What did you spend on?"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default QuickAddExpenseModal
