import { useState, useMemo } from "react"
import Card from "../ui/Card"
import Button from "../ui/Button"
import { TrendingUp, Calendar, Zap, Target } from "lucide-react"

const WealthProjectionCalculator = ({ monthlyIncome = 45000, currentSavings = 100000 }) => {
  const [investmentAmount, setInvestmentAmount] = useState(monthlyIncome * 0.3)
  const [expectedROI, setExpectedROI] = useState(9)
  const [years, setYears] = useState(30)
  const [inflationRate, setInflationRate] = useState(5)

  // Calculate wealth projection
  const projection = useMemo(() => {
    let balance = currentSavings

    const yearlyData = []

    for (let year = 1; year <= years; year++) {
      // Add monthly investments
      balance += investmentAmount * 12

      // Apply ROI
      balance = balance * (1 + expectedROI / 100)

      // Adjust for inflation (purchasing power)
      const purchasingPower =
        balance / Math.pow(1 + inflationRate / 100, year)

      yearlyData.push({
        year,
        balance: Math.floor(balance),
        purchasingPower: Math.floor(purchasingPower),
        monthlyInvestment: investmentAmount,
      })
    }

    const finalBalance = Math.floor(balance)
    const finalPurchasingPower = Math.floor(
      balance / Math.pow(1 + inflationRate / 100, years)
    )
    const totalInvested = currentSavings + investmentAmount * 12 * years
    const totalGains = finalBalance - totalInvested

    // Calculate milestones
    const milestones = [
      { target: 10000000, label: "₹1 Crore" },
      { target: 5000000, label: "₹50 Lakhs" },
      { target: 1000000, label: "₹10 Lakhs" },
    ]

    const achievedMilestones = milestones
      .filter((m) => finalBalance >= m.target)
      .map((m) => {
        let yearToAchieve = 0
        for (const year of yearlyData) {
          if (year.balance >= m.target) {
            yearToAchieve = year.year
            break
          }
        }
        return { ...m, year: yearToAchieve }
      })

    return {
      yearlyData,
      finalBalance,
      finalPurchasingPower,
      totalInvested,
      totalGains,
      roi: ((totalGains / totalInvested) * 100).toFixed(2),
      achievedMilestones,
    }
  }, [investmentAmount, expectedROI, years, inflationRate, currentSavings])

  // Generate AI recommendation
  const getRecommendation = () => {
    const _savingsRate = (investmentAmount / monthlyIncome) * 100

    if (projection.finalBalance >= 10000000) {
      return {
        title: "🎯 Excellent Wealth Building!",
        message: `You're on track to build ₹${(projection.finalBalance / 10000000).toFixed(1)} Crore in ${years} years!`,
        action: "Consider adding more to accelerate wealth creation",
      }
    } else if (projection.finalBalance >= 5000000) {
      return {
        title: "💪 Strong Financial Future",
        message: `You'll accumulate ₹${(projection.finalBalance / 100000).toFixed(0)} Lakhs in ${years} years`,
        action: "Increase monthly investment to reach ₹1 Crore milestone",
      }
    } else {
      return {
        title: "💡 Increase Your Investment",
        message: `Current monthly investment of ₹${Math.floor(investmentAmount).toLocaleString()} will give ₹${(projection.finalBalance / 100000).toFixed(1)} Lakhs`,
        action: "Aim to increase monthly investment to ₹20,000+",
      }
    }
  }

  const recommendation = getRecommendation()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-linear-to-br from-green-500 to-emerald-600 p-2">
          <TrendingUp size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            30-Year Wealth Projection
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            AI-powered long-term financial forecast
          </p>
        </div>
      </div>

      {/* Input Controls */}
      <Card padding="lg" className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monthly Investment
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400">
                ₹
              </span>
              <input
                type="number"
                value={Math.floor(investmentAmount)}
                onChange={(e) => setInvestmentAmount(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 border border-green-200 dark:border-green-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {((investmentAmount / monthlyIncome) * 100).toFixed(1)}% of income
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expected Annual ROI (%)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={expectedROI}
              onChange={(e) => setExpectedROI(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-green-200 dark:border-green-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {expectedROI < 5 ? "Conservative" : expectedROI < 10 ? "Balanced" : "Aggressive"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Horizon (Years)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value) || 30)}
              className="w-full px-4 py-2 border border-green-200 dark:border-green-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {years} years ahead
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Inflation Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={inflationRate}
              onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-green-200 dark:border-green-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Purchasing power adjusted
            </p>
          </div>
        </div>
      </Card>

      {/* AI Recommendation */}
      <Card padding="lg" className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-l-4 border-l-purple-500">
        <div className="flex items-start gap-3">
          <span className="text-3xl">✨</span>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {recommendation.title}
            </h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {recommendation.message}
            </p>
            <p className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
              💡 {recommendation.action}
            </p>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="lg" className="bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <p className="text-xs text-gray-600 dark:text-gray-400">Final Balance</p>
          <h3 className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            ₹{projection.finalBalance.toLocaleString()}
          </h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            In {years} years
          </p>
        </Card>

        <Card padding="lg" className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Gains</p>
          <h3 className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            ₹{projection.totalGains.toLocaleString()}
          </h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {projection.roi}% ROI
          </p>
        </Card>

        <Card padding="lg" className="bg-linear-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Purchasing Power
          </p>
          <h3 className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
            ₹{projection.finalPurchasingPower.toLocaleString()}
          </h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            After {inflationRate}% inflation
          </p>
        </Card>

        <Card padding="lg" className="bg-linear-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Invested</p>
          <h3 className="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-400">
            ₹{projection.totalInvested.toLocaleString()}
          </h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Your contributions
          </p>
        </Card>
      </div>

      {/* Milestones */}
      {projection.achievedMilestones.length > 0 && (
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Target size={20} className="text-indigo-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Milestones You'll Achieve
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {projection.achievedMilestones.map((milestone, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 border border-indigo-200 dark:border-indigo-800"
              >
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {milestone.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  In {milestone.year} years
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Year-by-Year Details */}
      <Card padding="lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Year-by-Year Projection (Every 5 Years)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                  Year
                </th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                  Balance
                </th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                  Real Value
                </th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody>
              {projection.yearlyData
                .filter((data) => data.year % 5 === 0 || data.year === 1)
                .map((data, idx) => {
                  const prevBalance = idx === 0 ? currentSavings : projection.yearlyData[(data.year - 6) * (data.year <= 5 ? 1 : 1)]?.balance || 0
                  const growth = ((data.balance - prevBalance) / prevBalance) * 100

                  return (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-2 text-gray-900 dark:text-white font-medium">
                        Year {data.year}
                      </td>
                      <td className="py-3 px-2 text-right text-gray-900 dark:text-white font-semibold">
                        ₹{data.balance.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-400">
                        ₹{data.purchasingPower.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right text-green-600 dark:text-green-400 font-medium">
                        {growth.toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Call to Action */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button className="w-full" variant="primary">
          Start Your Wealth Journey
        </Button>
        <Button className="w-full" variant="secondary">
          Download Projection Report
        </Button>
      </div>
    </div>
  )
}

export default WealthProjectionCalculator
