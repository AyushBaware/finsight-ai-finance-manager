import { useState } from "react"
import Card from "../ui/Card"
import Button from "../ui/Button"
import { TrendingDown, AlertTriangle, CheckCircle, Heart, Zap } from "lucide-react"

const LifestyleExpenseTracker = () => {
  const [selectedLifestyle, setSelectedLifestyle] = useState("moderate")

  // Different lifestyle spending profiles
  const lifestyleProfiles = {
    frugal: {
      name: "🏦 Frugal Living",
      description: "Maximum savings, minimal lifestyle costs",
      income: 45000,
      breakdown: {
        housing: 9000,
        food: 3000,
        transport: 1500,
        utilities: 1500,
        entertainment: 1500,
        healthcare: 2000,
        other: 2500,
      },
      savings: 24000,
      savingsRate: 53.3,
    },
    moderate: {
      name: "⚖️ Moderate Lifestyle",
      description: "Balanced spending and savings",
      income: 45000,
      breakdown: {
        housing: 13500,
        food: 4500,
        transport: 2250,
        utilities: 1800,
        entertainment: 2700,
        healthcare: 2000,
        other: 2250,
      },
      savings: 16000,
      savingsRate: 35.6,
    },
    comfortable: {
      name: "🏠 Comfortable Living",
      description: "Higher lifestyle expenses, still saving",
      income: 45000,
      breakdown: {
        housing: 18000,
        food: 6000,
        transport: 3750,
        utilities: 2250,
        entertainment: 4500,
        healthcare: 2000,
        other: 3000,
      },
      savings: 5500,
      savingsRate: 12.2,
    },
    luxury: {
      name: "💎 Luxury Lifestyle",
      description: "Premium lifestyle, minimal savings",
      income: 45000,
      breakdown: {
        housing: 22500,
        food: 9000,
        transport: 6000,
        utilities: 3000,
        entertainment: 7500,
        healthcare: 2000,
        other: 5000,
      },
      savings: -10000,
      savingsRate: -22.2,
    },
  }

  const currentProfile = lifestyleProfiles[selectedLifestyle] || lifestyleProfiles.moderate

  // Calculate lifestyle score
  const calculateLifestyleScore = (profile) => {
    if (!profile) return { score: 0, rating: "Unknown" }
    const savingsRate = profile.savingsRate
    if (savingsRate >= 40) return { score: 95, rating: "Excellent" }
    if (savingsRate >= 30) return { score: 85, rating: "Very Good" }
    if (savingsRate >= 20) return { score: 75, rating: "Good" }
    if (savingsRate >= 10) return { score: 60, rating: "Fair" }
    return { score: 40, rating: "Poor" }
  }

  const getRecommendations = (profile) => {
    if (!profile || !profile.breakdown) return []
    
    const housing = profile.breakdown.housing / profile.income
    const food = profile.breakdown.food / profile.income
    const transport = profile.breakdown.transport / profile.income

    const recommendations = []

    if (housing > 0.35) {
      recommendations.push({
        category: "Housing",
        message: "Your housing costs are high (>35%). Consider relocating or finding a roommate.",
        savings: Math.round(profile.breakdown.housing * 0.15),
      })
    }

    if (food > 0.15) {
      recommendations.push({
        category: "Food",
        message: "Cook at home more and meal plan to reduce food spending.",
        savings: Math.round(profile.breakdown.food * 0.25),
      })
    }

    if (transport > 0.1) {
      recommendations.push({
        category: "Transport",
        message: "Use public transport or carpool to save on commute costs.",
        savings: Math.round(profile.breakdown.transport * 0.25),
      })
    }

    if (profile.breakdown.entertainment > 4000) {
      recommendations.push({
        category: "Entertainment",
        message: "Reduce premium subscriptions and entertainment spending.",
        savings: Math.round(profile.breakdown.entertainment * 0.3),
      })
    }

    return recommendations
  }

  const recommendations = getRecommendations(currentProfile)
  const scoreInfo = calculateLifestyleScore(currentProfile)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-linear-to-br from-amber-500 to-orange-600 p-2">
          <Heart size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Lifestyle Expense Tracker
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Compare different lifestyle choices and their financial impact
          </p>
        </div>
      </div>

      {/* Lifestyle Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(lifestyleProfiles).map(([key, profile]) => (
          <button
            key={key}
            onClick={() => setSelectedLifestyle(key)}
            className={`p-3 rounded-lg border-2 transition-all text-center ${
              selectedLifestyle === key
                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
            }`}
          >
            <p className="text-xl mb-1">{profile.name.split(" ")[0]}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {profile.name.split(" ").slice(1).join(" ")}
            </p>
          </button>
        ))}
      </div>

      {/* Current Lifestyle Profile */}
      <Card padding="lg" className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentProfile.name}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {currentProfile.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-white dark:bg-gray-800 p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">Monthly Income</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{currentProfile.income.toLocaleString()}
              </p>
            </div>

            <div className={`rounded-lg p-3 ${
              currentProfile.savings >= 0
                ? "bg-green-100 dark:bg-green-900/20"
                : "bg-red-100 dark:bg-red-900/20"
            }`}>
              <p className={`text-xs ${
                currentProfile.savings >= 0
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              }`}>
                Monthly Savings
              </p>
              <p className={`text-2xl font-bold ${
                currentProfile.savings >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
                ₹{currentProfile.savings.toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/20 p-3">
              <p className="text-xs text-purple-700 dark:text-purple-400">Savings Rate</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {currentProfile.savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Lifestyle Score */}
      <Card padding="lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Financial Health Score
            </h3>
            <span className={`text-2xl font-bold ${
              scoreInfo.score >= 80
                ? "text-green-600"
                : scoreInfo.score >= 60
                ? "text-yellow-600"
                : "text-red-600"
            }`}>
              {scoreInfo.score}/100
            </span>
          </div>

          <div className="space-y-2">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-full transition-all duration-500 ${
                  scoreInfo.score >= 80
                    ? "bg-green-500"
                    : scoreInfo.score >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${scoreInfo.score}%` }}
              />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Rating: {scoreInfo.rating}
            </p>
          </div>

          <div className={`p-3 rounded-lg border-l-4 ${
            scoreInfo.score >= 80
              ? "bg-green-50 dark:bg-green-900/20 border-l-green-500"
              : scoreInfo.score >= 60
              ? "bg-yellow-50 dark:bg-yellow-900/20 border-l-yellow-500"
              : "bg-red-50 dark:bg-red-900/20 border-l-red-500"
          }`}>
            {scoreInfo.score >= 80 && (
              <p className="text-sm text-green-700 dark:text-green-300">
                ✅ Excellent financial health! You're saving optimally and building wealth.
              </p>
            )}
            {scoreInfo.score >= 60 && scoreInfo.score < 80 && (
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                ⚠️ Good balance, but there's room to improve your savings rate.
              </p>
            )}
            {scoreInfo.score < 60 && (
              <p className="text-sm text-red-700 dark:text-red-300">
                🚨 Your current lifestyle is leaving insufficient savings. Consider optimizing expenses.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Expense Breakdown */}
      <Card padding="lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Expense Breakdown
        </h3>

        <div className="space-y-3">
          {Object.entries(currentProfile.breakdown).map(([category, amount]) => {
            const percentage = (amount / currentProfile.income) * 100
            const categoryIcons = {
              housing: "🏠",
              food: "🍽️",
              transport: "🚗",
              utilities: "💡",
              entertainment: "🎬",
              healthcare: "🏥",
              other: "📦",
            }

            return (
              <div key={category} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {categoryIcons[category] || "📋"}
                    </span>
                    <span className="capitalize font-medium text-gray-900 dark:text-white">
                      {category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₹{amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card padding="lg" className="bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-l-4 border-l-blue-500">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Optimization Opportunities
              </h3>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-white dark:bg-gray-800 p-3 border border-blue-200 dark:border-blue-700"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-orange-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {rec.category}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {rec.message}
                      </p>
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-2">
                        💰 Potential saving: ₹{rec.savings.toLocaleString()}/month
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-3 border border-green-200 dark:border-green-700">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Total Monthly Savings Potential
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      ₹{recommendations.reduce((sum, r) => sum + r.savings, 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      By implementing all recommendations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button variant="secondary" className="w-full">
          Download Lifestyle Report
        </Button>
        <Button className="w-full">
          Create Personalized Plan
        </Button>
      </div>
    </div>
  )
}

export default LifestyleExpenseTracker
