import { useEffect, useState } from "react"
import { PieChart, Plus, TrendingUp } from "lucide-react"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import BudgetProgressBar from "../components/ui/BudgetProgressBar"
import AISuggestions from "../components/common/AISuggestions"
import { useExpenses } from "../context/ExpensesContext"
import settingsService from "../services/settingsService"
import categoriesService from "../services/categoriesService"

const Dashboard = () => {
  const { expenses, openQuickAdd } = useExpenses()
  const initialSettings = settingsService.getSettings()
  const [monthlyIncome, setMonthlyIncome] = useState(Number(initialSettings.monthlyIncome) || 0)
  const [riskTolerance, setRiskTolerance] = useState(initialSettings.riskTolerance)

  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const recentExpenses = expenses.slice(0, 5)
  const financialData = { monthlyIncome, totalExpenses, expenses, savingsGoal: 5000, riskTolerance }
  const leftoverMoney = financialData.monthlyIncome - financialData.totalExpenses
  const savingsRate = financialData.monthlyIncome
    ? ((leftoverMoney / financialData.monthlyIncome) * 100).toFixed(1) : "0.0"

  // Most urgent category over budget & >50% used — spec says show one, not all.
  const categories = categoriesService.getCategories()
  const mostUrgentBudget = categories
    .filter((c) => c.monthlyLimit)
    .map((c) => {
      const spent = expenses
        .filter((e) => e.category === c.name)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
      return { ...c, spent, percent: (spent / c.monthlyLimit) * 100 }
    })
    .filter((c) => c.percent > 50)
    .sort((a, b) => b.percent - a.percent)[0]

  useEffect(() => {
    const handleSettingsUpdated = (event) => {
      const { settings } = event.detail || {}
      if (!settings) return
      setMonthlyIncome(Number(settings.monthlyIncome) || 0)
      setRiskTolerance(settings.riskTolerance)
    }
    window.addEventListener("settingsUpdated", handleSettingsUpdated)
    return () => window.removeEventListener("settingsUpdated", handleSettingsUpdated)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 theme-text">Welcome back</h1>
        <p className="text-body theme-muted-text mt-1">Here's where things stand this month.</p>
      </div>

      {/* Hero: Leftover Money, full width on mobile, 2fr on desktop */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div
          className="rounded-3xl p-6 shadow-[var(--shadow-md)] lg:col-span-2"
          style={{ background: "var(--accent-soft-color)" }}
        >
          <p className="text-caption theme-muted-text">Leftover this month</p>
          <p className="tabular-nums text-display theme-text mt-1">
            Rs {leftoverMoney.toLocaleString()}
          </p>

          <div className="mt-5 flex gap-6">
            <div>
              <p className="text-caption theme-muted-text">Income</p>
              <p className="tabular-nums text-body-strong theme-text">
                Rs {financialData.monthlyIncome.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-caption theme-muted-text">Expenses</p>
              <p className="tabular-nums text-body-strong theme-text">
                Rs {financialData.totalExpenses.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-caption theme-muted-text">Savings rate</p>
              <p className="tabular-nums text-body-strong theme-text">{savingsRate}%</p>
            </div>
          </div>
        </div>

        <Card padding="lg" className="flex flex-col justify-center gap-1">
          <div className="flex items-center gap-2 theme-accent-text">
            <TrendingUp size={18} />
            <span className="text-caption theme-muted-text">Quick action</span>
          </div>
          <Button onClick={openQuickAdd} className="mt-2 flex items-center justify-center gap-2 w-full">
            <Plus size={16} />
            Add Expense
          </Button>
          <Button variant="ghost" className="w-full">View Analytics</Button>
        </Card>
      </section>

      {/* One slim budget strip — most urgent category only, per spec */}
      {mostUrgentBudget ? (
        <Card padding="lg">
          <div className="mb-1 flex items-center gap-2">
            <PieChart size={16} className="theme-accent-text" />
            <span className="text-caption theme-muted-text">Budget check</span>
          </div>
          <BudgetProgressBar
            label={mostUrgentBudget.name}
            spent={mostUrgentBudget.spent}
            limit={mostUrgentBudget.monthlyLimit}
          />
        </Card>
      ) : null}

      {/* AI Suggestions demoted below the fold, per spec */}
      <AISuggestions financialData={financialData} />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h2 theme-text">Recent Expenses</h2>
          <button className="text-caption theme-accent-text hover:underline">View all</button>
        </div>

        <div className="space-y-2">
          {recentExpenses.length > 0 ? recentExpenses.map((expense) => (
            <Card key={expense.id} padding="sm" className="transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-body-strong theme-text">{expense.category}</p>
                  <p className="text-caption theme-muted-text">
                    {expense.note || "No note"} | {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="tabular-nums text-body-strong" style={{ color: "var(--negative-color)" }}>
                  - Rs {Number(expense.amount || 0).toLocaleString()}
                </p>
              </div>
            </Card>
          )) : (
            <Card padding="sm" className="text-center theme-muted-text">
              <p>No expenses yet. Add one to get started!</p>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}

export default Dashboard