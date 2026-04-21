import { useState } from "react"
import Card from "../ui/Card"
import Button from "../ui/Button"
import { Target, TrendingUp, Calendar, Zap } from "lucide-react"

const FinancialGoalPlanner = () => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: "Emergency Fund",
      target: 100000,
      current: 32500,
      deadline: "2026-12-31",
      priority: "high",
      category: "safety",
      icon: "🛡️",
    },
    {
      id: 2,
      name: "Vacation to Bali",
      target: 250000,
      current: 75000,
      deadline: "2026-08-31",
      priority: "medium",
      category: "leisure",
      icon: "✈️",
    },
    {
      id: 3,
      name: "Car Down Payment",
      target: 500000,
      current: 120000,
      deadline: "2027-06-30",
      priority: "high",
      category: "investment",
      icon: "🚗",
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    deadline: "",
    priority: "medium",
  })

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100)
  }

  const calculateMonthlyTarget = (target, current, deadline) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const monthsLeft = Math.ceil(
      (deadlineDate - today) / (1000 * 60 * 60 * 24 * 30)
    )
    const amountNeeded = target - current
    return monthsLeft > 0 ? Math.ceil(amountNeeded / monthsLeft) : 0
  }

  const handleAddGoal = (e) => {
    e.preventDefault()
    if (formData.name && formData.target) {
      setGoals([
        ...goals,
        {
          id: goals.length + 1,
          ...formData,
          current: 0,
          category: "custom",
          icon: "🎯",
        },
      ])
      setFormData({ name: "", target: "", deadline: "", priority: "medium" })
      setShowForm(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-linear-to-br from-blue-500 to-cyan-600 p-2">
            <Target size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Financial Goals
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Track and achieve your financial milestones
            </p>
          </div>
        </div>
        <Button
          variant={showForm ? "secondary" : "primary"}
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ New Goal"}
        </Button>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <Card padding="lg" className="bg-blue-50 dark:bg-blue-900/20">
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Goal Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Buy a Laptop"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Amount
                </label>
                <input
                  type="number"
                  value={formData.target}
                  onChange={(e) =>
                    setFormData({ ...formData, target: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="₹50,000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Create Goal
            </Button>
          </form>
        </Card>
      )}

      {/* Goals List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.current, goal.target)
          const monthlyTarget = calculateMonthlyTarget(
            goal.target,
            goal.current,
            goal.deadline
          )

          return (
            <Card key={goal.id} padding="lg">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{goal.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {goal.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {goal.priority === "high" ? "🔴 " : "🟡 "}
                          {goal.priority.toUpperCase()} PRIORITY
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      ₹{goal.current.toLocaleString()}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-linear-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Target: ₹{goal.target.toLocaleString()}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap size={14} className="text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Save ₹{monthlyTarget.toLocaleString()}/month
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Button variant="secondary" size="sm" className="w-full">
                  Add Progress
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default FinancialGoalPlanner
