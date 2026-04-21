import { useState } from "react"
import Card from "../ui/Card"
import Button from "../ui/Button"
import { PieChart, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react"

const SmartExpenseAnalyzer = ({ expenses = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Mock data if not provided
  const expenseData = expenses.length > 0 ? expenses : [
    { category: "Food & Dining", amount: 4200, percentage: 22.4 },
    { category: "Entertainment", amount: 2500, percentage: 13.3 },
    { category: "Shopping", amount: 3500, percentage: 18.7 },
    { category: "Utilities", amount: 1800, percentage: 9.6 },
    { category: "Transport", amount: 2000, percentage: 10.7 },
    { category: "Subscription", amount: 750, percentage: 4.0 },
    { category: "Healthcare", amount: 1500, percentage: 8.0 },
    { category: "Other", amount: 1000, percentage: 5.3 },
  ]

  const monthlyIncome = 45000
  const totalExpenses = expenseData.reduce((sum, exp) => sum + exp.amount, 0)
  const savingsRate = ((monthlyIncome - totalExpenses) / monthlyIncome) * 100

  // Analyze spending patterns
  const getAnalysis = (category) => {
    const categoryData = expenseData.find(
      (e) => e.category === category
    )
    if (!categoryData) return null

    const recommendations = {
      "Food & Dining": {
        alert: categoryData.amount > 4000,
        message: "Consider meal planning and cooking at home more often",
        savingsPotential: Math.floor(categoryData.amount * 0.2),
      },
      "Entertainment": {
        alert: categoryData.amount > 2500,
        message: "Look for free entertainment options and subscriptions",
        savingsPotential: Math.floor(categoryData.amount * 0.3),
      },
      "Shopping": {
        alert: categoryData.amount > 3000,
        message: "Apply 30-day rule before making purchases",
        savingsPotential: Math.floor(categoryData.amount * 0.25),
      },
      "Utilities": {
        alert: categoryData.amount > 2000,
        message: "Check for energy-saving opportunities",
        savingsPotential: Math.floor(categoryData.amount * 0.15),
      },
      "Transport": {
        alert: categoryData.amount > 2500,
        message: "Consider carpooling or public transport",
        savingsPotential: Math.floor(categoryData.amount * 0.2),
      },
      "Subscription": {
        alert: categoryData.amount > 1000,
        message: "Audit and cancel unused subscriptions",
        savingsPotential: Math.floor(categoryData.amount * 0.4),
      },
    }

    return recommendations[category] || {
      alert: false,
      message: "Monitor this category",
      savingsPotential: 0,
    }
  }

  const totalSavingsPotential = expenseData.reduce((sum, exp) => {
    const analysis = getAnalysis(exp.category)
    return sum + (analysis?.savingsPotential || 0)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-linear-to-br from-pink-500 to-rose-600 p-2">
          <PieChart size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Smart Expense Analyzer
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            AI-powered insights to optimize your spending
          </p>
        </div>
      </div>

      {/* Health Score */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="lg" className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</p>
            <h3 className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
              {savingsRate.toFixed(1)}%
            </h3>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {savingsRate > 30 ? "Excellent! Keep it up 🎉" : "Good opportunity to optimize"}
            </p>
          </div>
        </Card>

        <Card padding="lg" className="bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Expenses</p>
            <h3 className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
              ₹{totalExpenses.toLocaleString()}
            </h3>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {((totalExpenses / monthlyIncome) * 100).toFixed(1)}% of income
            </p>
          </div>
        </Card>

        <Card padding="lg" className="bg-linear-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Savings Potential</p>
            <h3 className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">
              ₹{totalSavingsPotential.toLocaleString()}
            </h3>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              By optimizing spending
            </p>
          </div>
        </Card>
      </div>

      {/* Expense Breakdown */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Category Breakdown
        </h3>

        {expenseData.map((item, idx) => {
          const analysis = getAnalysis(item.category)
          const isSelected = selectedCategory === item.category

          return (
            <Card
              key={idx}
              padding="md"
              className={`cursor-pointer transition-all ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                  : "hover:shadow-md"
              }`}
              onClick={() => setSelectedCategory(isSelected ? null : item.category)}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">
                      {item.category === "Food & Dining"
                        ? "🍽️"
                        : item.category === "Entertainment"
                        ? "🎬"
                        : item.category === "Shopping"
                        ? "🛍️"
                        : item.category === "Utilities"
                        ? "💡"
                        : item.category === "Transport"
                        ? "🚗"
                        : item.category === "Subscription"
                        ? "📱"
                        : item.category === "Healthcare"
                        ? "🏥"
                        : "📦"}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {item.category}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.percentage}% of total expenses
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      ₹{item.amount.toLocaleString()}
                    </p>
                    {analysis?.alert && (
                      <AlertTriangle size={16} className="mt-1 text-red-500 mx-auto" />
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full transition-all duration-300 ${
                      analysis?.alert
                        ? "bg-linear-to-r from-red-500 to-orange-500"
                        : "bg-linear-to-r from-indigo-500 to-purple-600"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                {/* Expanded Details */}
                {isSelected && analysis && (
                  <div className="border-t border-gray-200 pt-3 dark:border-gray-700 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        {analysis.alert ? (
                          <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {analysis.alert ? "Alert" : "Status"}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {analysis.message}
                          </p>
                        </div>
                      </div>
                    </div>

                    {analysis.savingsPotential > 0 && (
                      <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
                        <div className="flex items-center gap-2">
                          <TrendingDown size={16} className="text-green-600 dark:text-green-400" />
                          <div>
                            <p className="text-xs text-green-700 dark:text-green-300">
                              Potential Monthly Savings
                            </p>
                            <p className="font-bold text-green-600 dark:text-green-400">
                              ₹{analysis.savingsPotential.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button variant="secondary" size="sm" className="w-full">
                      View Tips for {item.category}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button variant="secondary" className="w-full">
          Download Detailed Report
        </Button>
        <Button className="w-full">
          Set Budget Limits
        </Button>
      </div>
    </div>
  )
}

export default SmartExpenseAnalyzer
