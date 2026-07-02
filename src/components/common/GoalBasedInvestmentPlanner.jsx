import { useState } from "react"
import { Target, ExternalLink, AlertCircle, Loader2 } from "lucide-react"
import Card from "../ui/Card"
import Button from "../ui/Button"
import Input from "../ui/Input"
import { getFundsForHorizon, InvestmentPlannerError } from "../../services/investmentPlannerService"

const HORIZON_PRESETS = [
  { label: "6 months", months: 6 },
  { label: "1 year", months: 12 },
  { label: "3 years", months: 36 },
  { label: "5 years", months: 60 },
  { label: "10 years", months: 120 },
]

const CATEGORY_LABELS = {
  liquid: "Liquid",
  debt: "Debt",
  hybrid: "Hybrid",
  equity: "Equity",
  index: "Index",
  elss: "ELSS (Tax Saving)",
}

const GoalBasedInvestmentPlanner = () => {
  const [horizonMonths, setHorizonMonths] = useState(24)
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchRecommendations = async (months) => {
    setIsLoading(true)
    setError("")

    try {
      const data = await getFundsForHorizon(months)
      setResult(data)
    } catch (err) {
      setResult(null)
      setError(
        err instanceof InvestmentPlannerError
          ? err.message
          : "Something went wrong fetching fund recommendations.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handlePresetClick = (months) => {
    setHorizonMonths(months)
    fetchRecommendations(months)
  }

  const handleCustomSubmit = (event) => {
    event.preventDefault()
    fetchRecommendations(horizonMonths)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-linear-to-br from-indigo-500 to-blue-600 p-2">
          <Target size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Goal-Based Investment Planner
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real, live-cached mutual fund data matched to your time horizon
          </p>
        </div>
      </div>

      <Card padding="lg">
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              How many months until you need this money?
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                value={horizonMonths}
                onChange={(event) => setHorizonMonths(event.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Matching..." : "Match Funds"}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {HORIZON_PRESETS.map((preset) => (
              <button
                key={preset.months}
                type="button"
                onClick={() => handlePresetClick(preset.months)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  horizonMonths === preset.months
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </form>
      </Card>

      {isLoading && (
        <Card
          padding="lg"
          className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400"
        >
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Fetching live fund data...</span>
        </Card>
      )}

      {error && !isLoading && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {result && !isLoading && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Matched categories:</span>
            {result.matchedCategories.map((category) => (
              <span
                key={category}
                className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
              >
                {CATEGORY_LABELS[category] || category}
              </span>
            ))}
          </div>

          {result.funds.length === 0 ? (
            <Card padding="lg" className="text-center text-gray-500 dark:text-gray-400">
              No funds found for this horizon right now. Try again after the next ingestion run.
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.funds.map((fund) => (
                <Card key={fund.schemeCode} padding="lg" className="flex flex-col justify-between">
                  <div>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {CATEGORY_LABELS[fund.category] || fund.category}
                    </span>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                      {fund.schemeName}
                    </h3>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">NAV</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          ₹{Number(fund.nav).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">As of</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{fund.navDate}</p>
                      </div>
                    </div>
                  </div>

                  <a
                    href={fund.deepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    <ExternalLink size={14} />
                    View on Kuvera
                  </a>
                </Card>
              ))}
            </div>
          )}

          <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-yellow-600 dark:text-yellow-400" />
            <p className="text-xs text-yellow-800 dark:text-yellow-300">{result.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoalBasedInvestmentPlanner