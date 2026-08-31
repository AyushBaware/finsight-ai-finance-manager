import { useState } from "react"
import { Mic, Square, ScanLine } from "lucide-react"
import BottomSheet from "../ui/BottomSheet"
import Button from "../ui/Button"
import Input from "../ui/Input"
import CategoryChip from "../ui/CategoryChip"
import { useExpenses } from "../../context/ExpensesContext"
import { useVoiceToExpense } from "../../hooks/useVoiceToExpense"
import { showToast } from "../../utils/toastStore"

const CATEGORIES = [
  "Food & Dining", "Transport", "Shopping", "Utilities",
  "Entertainment", "Healthcare", "Subscription", "Other",
]
const TABS = { MANUAL: "manual", VOICE: "voice", SCAN: "scan" }

const AddTransactionSheet = ({ isOpen, onClose }) => {
  const { addExpense, isOnline, user } = useExpenses()
  const [activeTab, setActiveTab] = useState(TABS.MANUAL)
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState(CATEGORIES[0])
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Voice pre-fills the SAME fields Manual uses — no separate confirm screen.
  const { isListening, transcript, error, startListening, stopListening } =
    useVoiceToExpense((expense) => {
      if (expense.amount > 0) setAmount(String(expense.amount))
      if (expense.category) setCategory(expense.category)
      if (expense.note) setNote(expense.note)
    })

  const isDirty = Boolean(amount || note)

  const resetForm = () => {
    setAmount("")
    setCategory(CATEGORIES[0])
    setNote("")
  }

  const handleClose = () => {
    resetForm()
    setActiveTab(TABS.MANUAL)
    onClose()
  }

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount)
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast("Enter a valid amount", "error")
      return
    }

    setIsSubmitting(true)
    try {
      const savedExpense = await addExpense({
        amount: parsedAmount,
        category,
        note: note || "Manual entry",
        date: new Date().toISOString().split("T")[0],
      })
      if (!savedExpense) throw new Error("save failed")

      showToast(
        user && !isOnline ? `Saved offline: Rs ${parsedAmount}` : `Saved: Rs ${parsedAmount}`,
        "success",
      )
      handleClose()
    } catch {
      showToast("Could not save this expense right now.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Add Transaction" confirmDirty={isDirty}>
      <div className="space-y-4">
        <div className="flex gap-2 rounded-lg p-1" style={{ background: "var(--surface-muted)" }}>
          {[
            { id: TABS.MANUAL, label: "Manual" },
            { id: TABS.VOICE, label: "Voice" },
            { id: TABS.SCAN, label: "Scan" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 rounded-md py-1.5 text-sm font-medium transition-all"
              style={activeTab === tab.id
                ? { background: "var(--surface-color)", color: "var(--accent-color)" }
                : { color: "var(--muted-text-color)" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === TABS.SCAN ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-10 theme-border">
            <ScanLine size={28} className="theme-muted-text" />
            <p className="text-body theme-muted-text">Scan Receipt — coming soon</p>
          </div>
        ) : (
          <>
            {activeTab === TABS.VOICE ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-white transition-all ${isListening ? "animate-pulse" : ""}`}
                  style={{ background: isListening ? "var(--negative-color)" : "var(--accent-color)" }}
                >
                  {isListening ? <Square size={22} /> : <Mic size={22} />}
                </button>
                <p className="text-caption" style={{ color: "#A0AEC0" }}>
                  {isListening ? "Listening..." : 'Tap and say e.g. "Spent 50 on lunch"'}
                </p>
                {transcript ? <p className="text-caption italic" style={{ color: "#A0AEC0" }}>"{transcript}"</p> : null}
                {error ? <p className="text-caption" style={{ color: "var(--negative-color)" }}>{error}</p> : null}
              </div>
            ) : null}

            <div>
              <label className="text-caption theme-muted-text mb-1 block">Amount</label>
              <Input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" />
            </div>

            <div>
              <label className="text-caption theme-muted-text mb-1 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <CategoryChip key={c} label={c} selected={category === c} onClick={() => setCategory(c)} />
                ))}
              </div>
            </div>

            <Input label="Note (optional)" placeholder="What was it for?" value={note} onChange={(e) => setNote(e.target.value)} />

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" onClick={handleClose} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  )
}

export default AddTransactionSheet