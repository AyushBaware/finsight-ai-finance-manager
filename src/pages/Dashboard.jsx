import { useEffect, useState } from "react"
import { ArrowDownRight, ArrowUpRight, PieChart } from "lucide-react"
import Card from "../components/ui/Card"
import StatCard from "../components/ui/StatCard"
import BudgetProgressBar from "../components/ui/BudgetProgressBar"
import { useExpenses } from "../context/ExpensesContext"
import settingsService from "../services/settingsService"
import categoriesService from "../services/categoriesService"

const Dashboard = () => {
  const { expenses } = useExpenses()
  const initialSettings = settingsService.getSettings()
  const [monthlyIncome, setMonthlyIncome] = useState(Number(initialSettings.monthlyIncome) || 0)
  const [riskTolerance, setRiskTolerance] = useState(initialSettings.riskTolerance)

  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const recentExpenses = expenses.slice(0, 10)
  const financialData = { monthlyIncome, totalExpenses, expenses, savingsGoal: 5000, riskTolerance }
  const leftoverMoney = financialData.monthlyIncome - financialData.totalExpenses
  const savingsRate = financialData.monthlyIncome
    ? ((leftoverMoney / financialData.monthlyIncome) * 100).toFixed(1) : "0.0"

    const isOverBudget = leftoverMoney < 0

  // Show the two most urgent categories over budget & >50% used.
  const categories = categoriesService.getCategories()
  const mostUrgentBudgets = categories
    .filter((c) => c.monthlyLimit)
    .map((c) => {
      const spent = expenses
        .filter((e) => e.category === c.name)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
      return { ...c, spent, percent: (spent / c.monthlyLimit) * 100 }
    })
    .filter((c) => c.percent > 50)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 2)

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
      {/* Hero: Leftover Money (full width) + Income / Expense side-by-side below it */}
<section className="grid grid-cols-2 gap-4">
  <StatCard
    hero
    tone={isOverBudget ? "negative" : "accent"}
    label="Leftover this month"
    value={`${isOverBudget ? "- " : ""}Rs ${Math.abs(leftoverMoney).toLocaleString()}`}
    subtext={
      isOverBudget
        ? "You've spent more than you earned this month."
        : "What's left after this month's expenses."
    }
    delta={isOverBudget ? "Over budget" : `${savingsRate}% saved`}
  />

  <StatCard
    label="Income"
    value={`Rs ${financialData.monthlyIncome.toLocaleString()}`}
    icon={
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ background: "var(--positive-soft-color)" }}
      >
        <ArrowUpRight size={16} style={{ color: "var(--positive-color)" }} />
      </span>
    }
  />

  <StatCard
    label="Expenses"
    value={`Rs ${financialData.totalExpenses.toLocaleString()}`}
    icon={
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ background: "var(--negative-soft-color)" }}
      >
        <ArrowDownRight size={16} style={{ color: "var(--negative-color)" }} />
      </span>
    }
  />
</section>

      {/* Two slim budget strips — the most urgent categories */}
      {mostUrgentBudgets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {mostUrgentBudgets.map((budget) => (
            <Card key={budget.name} padding="lg">
              <div className="mb-1 flex items-center gap-2">
                <PieChart size={16} className="theme-accent-text" />
                <span className="text-caption theme-muted-text">Budget check</span>
              </div>
              <BudgetProgressBar
                label={budget.name}
                spent={budget.spent}
                limit={budget.monthlyLimit}
              />
            </Card>
          ))}
        </div>
      ) : null}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h2 theme-text">Recent Expenses</h2>
        </div>

        <div className="space-y-2">
          {recentExpenses.length > 0 ? recentExpenses.map((expense) => (
            <Card key={expense.id} padding="sm" className="transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-body-strong theme-text">{expense.category}</p>
                  <p className="text-caption" style={{ color: "#A0AEC0" }}>
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