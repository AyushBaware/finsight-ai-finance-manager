import { useEffect, useState } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  PieChart,
  Plus,
  TrendingUp,
} from "lucide-react"

import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import AISuggestions from "../components/common/AISuggestions"
import SmartAIAdvisor from "../components/common/SmartAIAdvisor"
import LifestyleExpenseTracker from "../components/common/LifestyleExpenseTracker"
import QuickAddExpenseModal from "../components/common/QuickAddExpenseModal"
import { useExpenses } from "../context/ExpensesContext"
import settingsService from "../services/settingsService"

const Dashboard = () => {
  const { expenses } = useExpenses()
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const initialSettings = settingsService.getSettings()
  const [monthlyIncome, setMonthlyIncome] = useState(Number(initialSettings.monthlyIncome) || 0)
  const [riskTolerance, setRiskTolerance] = useState(initialSettings.riskTolerance)

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + (Number(expense.amount) || 0),
    0,
  )
  const recentExpenses = expenses.slice(0, 5)
  const financialData = {
    monthlyIncome,
    totalExpenses,
    expenses,
    savingsGoal: 5000,
    riskTolerance,
  }
  const leftoverMoney = financialData.monthlyIncome - financialData.totalExpenses
  const savingsRate = financialData.monthlyIncome
    ? ((leftoverMoney / financialData.monthlyIncome) * 100).toFixed(1)
    : "0.0"

  useEffect(() => {
    const handleSettingsUpdated = (event) => {
      const { settings } = event.detail || {}
      if (!settings) return

      setMonthlyIncome(Number(settings.monthlyIncome) || 0)
      setRiskTolerance(settings.riskTolerance)
    }

    window.addEventListener("settingsUpdated", handleSettingsUpdated)

    return () => {
      window.removeEventListener("settingsUpdated", handleSettingsUpdated)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="theme-hero rounded-2xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold">Welcome Back!</h1>
        <p className="mt-2 opacity-90">
          You have Rs {leftoverMoney.toLocaleString()} leftover this month. Let AI help
          you make smart decisions.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                Rs {financialData.monthlyIncome.toLocaleString()}
              </h3>
            </div>
            <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <ArrowUpRight size={24} />
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                Rs {financialData.totalExpenses.toLocaleString()}
              </h3>
            </div>
            <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <ArrowDownRight size={24} />
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Leftover Money</p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                Rs {leftoverMoney.toLocaleString()}
              </h3>
            </div>
            <div className="rounded-full bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <TrendingUp size={24} />
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Savings Rate</p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {savingsRate}%
              </h3>
            </div>
            <div className="rounded-full bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <PieChart size={24} />
            </div>
          </div>
        </Card>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setIsAddExpenseOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Add Expense
        </Button>
        <Button variant="secondary">View Analytics</Button>
        <Button variant="secondary">Set Goals</Button>
      </section>

      <AISuggestions financialData={financialData} />

      <SmartAIAdvisor
        leftoverMoney={leftoverMoney}
        riskTolerance={financialData.riskTolerance}
        expenses={financialData.expenses}
      />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Expenses
          </h2>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
            View all
          </button>
        </div>

        <div className="space-y-2">
          {recentExpenses.length > 0 ? (
            recentExpenses.map((expense) => (
              <Card
                key={expense.id}
                padding="sm"
                className="transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {expense.category}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {expense.note || "No note"} |{" "}
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold text-red-500 dark:text-red-400">
                    - Rs {Number(expense.amount || 0).toLocaleString()}
                  </p>
                </div>
              </Card>
            ))
          ) : (
            <Card padding="sm" className="text-center text-gray-500">
              <p>No expenses yet. Add one to get started!</p>
            </Card>
          )}
        </div>
      </section>

      <LifestyleExpenseTracker />

      <QuickAddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />
    </div>
  )
}

export default Dashboard
