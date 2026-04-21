import { useState } from "react"
import { Mic, MicOff } from "lucide-react"

import Card from "../components/ui/Card"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import { useExpenses } from "../context/ExpensesContext"

const categories = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
]

const AddExpense = () => {
  const { addExpense, hasPendingWrites, isOnline, user } = useExpenses()
  const [amount, setAmount] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [note, setNote] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isListening, setIsListening] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Enter a valid amount")
      return
    }

    setSaving(true)

    try {
      const savedExpense = await addExpense({
        amount: parsedAmount,
        category: selectedCategory,
        note,
        date,
      })

      if (!savedExpense) {
        alert("Failed to save expense")
        return
      }

      alert(
        user && !isOnline
          ? "Expense saved offline. It will sync automatically when you're back online."
          : "Expense saved successfully!",
      )
      setAmount("")
      setNote("")
      setDate(new Date().toISOString().split("T")[0])
      setSelectedCategory(categories[0])
    } catch (error) {
      console.error("Failed to save expense", error)
      alert("Failed to save expense")
    } finally {
      setSaving(false)
    }
  }

  const handleVoiceToggle = () => {
    setIsListening((currentValue) => !currentValue)
  }

  return (
    <div className="theme-shell relative space-y-6 pb-24">
      <div>
        <h1 className="text-xl font-semibold">Add Expense</h1>
        <p className="text-sm text-gray-500">Record your spending easily</p>
      </div>

      <Card>
        <div className="text-center">
          <p className="mb-2 text-sm text-gray-500">Amount</p>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full border-none bg-transparent text-center text-4xl font-semibold focus:outline-none"
          />
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-sm font-medium">Category</p>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg border py-3 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 ${
                selectedCategory === category
                  ? "bg-indigo-600 text-white"
                  : "border-gray-200 text-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <Input
            label="Note"
            placeholder="e.g. Lunch with friends"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Voice input</p>
            <p className="text-sm text-gray-500">
              {isListening ? "Listening..." : "Tap to add expense using voice"}
            </p>
          </div>
          <button
            onClick={handleVoiceToggle}
            className={`rounded-full p-3 text-white transition ${
              isListening ? "animate-pulse bg-red-500" : "bg-indigo-600"
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>
      </Card>

      <div className="fixed bottom-16 left-0 right-0 z-40 px-4 md:static md:px-0">
        <Button onClick={handleSave} className="w-full py-3 text-base" disabled={saving}>
          {saving ? "Saving..." : "Save Expense"}
        </Button>
        {hasPendingWrites ? (
          <p className="theme-muted-text mt-3 text-center text-xs">
            Your latest changes are saved locally and syncing to Firestore.
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default AddExpense
