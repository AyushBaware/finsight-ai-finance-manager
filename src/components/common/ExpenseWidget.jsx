import { useState } from "react"
import { Mic, Plus } from "lucide-react"

import { useExpenses } from "../../context/ExpensesContext"
import Card from "../ui/Card"
import { useVoiceToExpense } from "../../hooks/useVoiceToExpense"
import { showToast } from "../../utils/toastStore"

const ExpenseWidget = () => {
  const { addExpense, isOnline, user } = useExpenses()
  const [isProcessing, setIsProcessing] = useState(false)

  const { isListening, transcript, startListening, stopListening } = useVoiceToExpense(
    async (expense) => {
      if (!expense || expense.amount <= 0) return

      const savedExpense = await addExpense({
        amount: expense.amount,
        category: expense.category,
        note: expense.note || expense.merchant || "Voice input",
        date: new Date().toISOString().split("T")[0],
        merchant: expense.merchant,
      })

      if (!savedExpense) {
        showToast("Could not save this expense right now", "error")
        return
      }

      showToast(
        user && !isOnline
          ? `Saved offline: Rs ${savedExpense.amount} - syncing when you reconnect`
          : `Saved: Rs ${savedExpense.amount} - ${savedExpense.category}`,
        "success",
        3000,
      )
    },
  )

  const handleQuickAdd = async () => {
    const amountRaw = window.prompt("Quick add amount (numbers only)")
    if (!amountRaw) return

    const amount = parseFloat(amountRaw.replace(/[^0-9.]/g, ""))
    if (Number.isNaN(amount) || amount <= 0) {
      showToast("Invalid amount", "error")
      return
    }

    const category = window.prompt("Category", "Food & Dining") || "Other"
    const note = window.prompt("Note (optional)", "") || ""

    setIsProcessing(true)

    try {
      const savedExpense = await addExpense({
        amount,
        category,
        note,
        date: new Date().toISOString().split("T")[0],
      })

      if (!savedExpense) {
        showToast("Could not save this expense right now", "error")
        return
      }

      showToast(
        user && !isOnline
          ? `Expense saved offline: Rs ${savedExpense.amount}`
          : `Expense saved: Rs ${savedExpense.amount}`,
        "success",
        2500,
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMicClick = () => {
    if (isListening) stopListening()
    else startListening()
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 hidden sm:block">
      <Card className="w-56">
        <p className="mb-2 text-sm font-medium">Quick Add Expense</p>

        <div className="flex gap-2">
          <button
            onClick={handleQuickAdd}
            disabled={isProcessing}
            className="theme-button-primary flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-2 text-sm"
          >
            <Plus size={16} />
            Add
          </button>

          <button
            onClick={handleMicClick}
            className={`rounded-lg p-2 ${
              isListening
                ? "bg-red-500 text-white"
                : "theme-panel theme-muted-text hover:bg-gray-200"
            }`}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            <Mic size={16} />
          </button>
        </div>

        {transcript ? (
          <p className="mt-2 text-xs italic text-gray-500">"{transcript}"</p>
        ) : null}
      </Card>
    </div>
  )
}

export default ExpenseWidget
