import { useState, useMemo } from "react"
import Card from "../ui/Card"
import Button from "../ui/Button"
import { TrendingUp, BarChart3, AlertCircle } from "lucide-react"

const InvestmentSimulator = ({ leftoverMoney = 5000 }) => {
  const [simulations] = useState([
    {
      name: "Conservative (FD)",
      initialAmount: leftoverMoney,
      roi: 6,
      years: 5,
      type: "fixed",
      riskLevel: "Low",
      color: "from-green-500 to-emerald-600",
    },
    {
      name: "Balanced (Mutual Fund)",
      initialAmount: leftoverMoney,
      roi: 9,
      years: 5,
      type: "balanced",
      riskLevel: "Medium",
      color: "from-blue-500 to-cyan-600",
    },
    {
      name: "Aggressive (Stocks)",
      initialAmount: leftoverMoney,
      roi: 14,
      years: 5,
      type: "stocks",
      riskLevel: "High",
      color: "from-orange-500 to-red-600",
    },
  ])

  const [customAmount, setCustomAmount] = useState(leftoverMoney)
  const [customYears, setCustomYears] = useState(5)

  // Calculate compound interest
  const calculateFutureValue = (principal, rate, years) => {
    return principal * Math.pow(1 + rate / 100, years)
  }

  const results = useMemo(() => {
    return simulations.map((sim) => ({
      ...sim,
      futureValue: calculateFutureValue(customAmount || sim.initialAmount, sim.roi, customYears),
      yearsToDouble: (Math.log(2) / Math.log(1 + sim.roi / 100)).toFixed(1),
      totalReturn: calculateFutureValue(customAmount || sim.initialAmount, sim.roi, customYears) - (customAmount || sim.initialAmount),
    }))
  }, [customAmount, customYears, simulations])

  const monthlyRequired = useMemo(() => {
    // Calculate monthly investment needed to achieve 10 lakhs in 10 years at 10% roi
    const target = 1000000
    const monthlyRate = 0.1 / 12
    const months = 10 * 12
    return (target * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-linear-to-br from-orange-500 to-red-600 p-2">
          <BarChart3 size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Investment Simulator
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Visualize how your money grows with different investment strategies
          </p>
        </div>
      </div>

      {/* Input Controls */}
      <Card padding="lg" className="bg-linear-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Initial Investment Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400">
                ₹
              </span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 border border-orange-200 dark:border-orange-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Current: ₹{customAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Investment Period (Years)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={customYears}
              onChange={(e) => setCustomYears(parseInt(e.target.value) || 5)}
              className="w-full px-4 py-2 border border-orange-200 dark:border-orange-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Period: {customYears} years
            </p>
          </div>
        </div>
      </Card>

      {/* Simulation Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((result, idx) => (
          <Card key={idx} padding="lg" className="border-l-4 border-l-orange-500">
            <div className="space-y-4">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {result.type === "fixed"
                      ? "🏦"
                      : result.type === "balanced"
                      ? "⚖️"
                      : "📈"}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {result.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Risk: {result.riskLevel}
                    </p>
                  </div>
                </div>
              </div>

              {/* ROI Badge */}
              <div className={`rounded-lg bg-linear-to-r ${result.color} p-3 text-white`}>
                <p className="text-xs opacity-90">Expected Annual ROI</p>
                <p className="text-2xl font-bold">{result.roi}%</p>
              </div>

              {/* Results */}
              <div className="space-y-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Investment Amount
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ₹{customAmount.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Future Value ({customYears} years)
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ₹{result.futureValue.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Total Gain
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₹{result.totalReturn.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Double in
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {result.yearsToDouble} yrs
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Indicator */}
              {result.type === "stocks" && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
                  <AlertCircle size={14} className="text-red-600 dark:text-red-400" />
                  <span className="text-xs text-red-700 dark:text-red-400">
                    High volatility - long-term investment
                  </span>
                </div>
              )}

              <Button variant="secondary" className="w-full">
                Start Investing
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Pro Tip Card */}
      <Card padding="lg" className="bg-linear-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Pro Tip: SIP Strategy
            </h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Invest ₹{Math.ceil(monthlyRequired).toLocaleString()} monthly through SIP (Systematic Investment Plan) to reach ₹10,00,000 in 10 years with 10% returns
            </p>
            <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <p>✓ Reduces investment risk through dollar-cost averaging</p>
              <p>✓ Discipline in investing builds wealth</p>
              <p>✓ Can automate with your bank/broker</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default InvestmentSimulator
