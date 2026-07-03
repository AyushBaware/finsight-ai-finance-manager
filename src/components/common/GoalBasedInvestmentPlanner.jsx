import { useMemo, useState } from "react"
import { Target, ExternalLink, AlertCircle, Loader2, Sparkles, Info, CheckCircle2 } from "lucide-react"
import Card from "../ui/Card"
import Button from "../ui/Button"
import Input from "../ui/Input"
import { getFundsForHorizon, InvestmentPlannerError } from "../../services/investmentPlannerService"
import { useExpenses } from "../../context/ExpensesContext"
import settingsService from "../../services/settingsService"
import { calculateCurrentMonthLeftover } from "../../utils/leftoverMoney"
import {
  calculateMonthsToReachGoal,
  calculateRequiredMonthlySIP,
  formatMonthsAsYearsAndMonths,
  getBlendedAnnualReturn,
} from "../../utils/investmentMath"

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

const PLANNER_MODES = {
  BROWSE: "browse",
  GOAL: "goal",
}

const formatCompactINR = (value) => {
  if (!Number.isFinite(value)) return "—"
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${Math.round(value).toLocaleString("en-IN")}`
  return `₹${Math.round(value)}`
}

// A small, self-contained "what-if" slider — pure client-side math, no
// network call, so it feels instant. Lets someone drag and immediately see
// how a different monthly amount changes their timeline, instead of only
// seeing one fixed answer.
const WhatIfSlider = ({ goalAmount, assumedAnnualReturn, requiredMonthlySIP, currentLeftover }) => {
  const sliderMax = Math.max(Math.ceil(requiredMonthlySIP * 1.5), currentLeftover * 2, 1000)
  const [amount, setAmount] = useState(Math.max(Math.round(currentLeftover), 0))

  const monthsAtAmount = useMemo(() => {
    if (amount <= 0) return null
    return calculateMonthsToReachGoal({
      goalAmount,
      monthlyInvestment: amount,
      annualReturnPercent: assumedAnnualReturn,
    })
  }, [amount, goalAmount, assumedAnnualReturn])

  return (
    <div className="space-y-2 rounded-lg bg-white/60 p-3 dark:bg-black/20">
      <div className="flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
        <span>Try a different monthly amount</span>
        <span className="font-semibold text-gray-900 dark:text-white">{formatCompactINR(amount)}/mo</span>
      </div>
      <input
        type="range"
        min="0"
        max={sliderMax}
        step={Math.max(Math.round(sliderMax / 100), 1)}
        value={amount}
        onChange={(event) => setAmount(Number(event.target.value))}
        className="w-full accent-indigo-600"
      />
      <p className="text-xs text-gray-600 dark:text-gray-400">
        At {formatCompactINR(amount)}/month, you'd reach this goal in{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {monthsAtAmount ? formatMonthsAsYearsAndMonths(monthsAtAmount) : "—"}
        </span>
        .
      </p>
    </div>
  )
}

const GoalBasedInvestmentPlanner = () => {
  const [mode, setMode] = useState(PLANNER_MODES.GOAL)

  const [horizonMonths, setHorizonMonths] = useState(24)
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { expenses } = useExpenses()
  const [goalName, setGoalName] = useState("")
  const [goalAmount, setGoalAmount] = useState("")
  const [goalYears, setGoalYears] = useState(2)
  const [goalMonths, setGoalMonths] = useState(0)
  const [goalPlan, setGoalPlan] = useState(null)
  const [showAssumptions, setShowAssumptions] = useState(false)

  const fetchRecommendations = async (months) => {
    setIsLoading(true)
    setError("")

    try {
      const data = await getFundsForHorizon(months)
      setResult(data)
      return data
    } catch (err) {
      setResult(null)
      setError(
        err instanceof InvestmentPlannerError
          ? err.message
          : "Something went wrong fetching fund recommendations.",
      )
      return null
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

  const buildGoalPlan = async (totalMonths, amount, name) => {
    const data = await fetchRecommendations(totalMonths)
    if (!data) return

    const monthlyIncome = Number(settingsService.getMonthlyIncome()) || 0
    const currentLeftover = calculateCurrentMonthLeftover(expenses, monthlyIncome)
    const assumedAnnualReturn = getBlendedAnnualReturn(data.matchedCategories)

    const requiredMonthlySIP = calculateRequiredMonthlySIP({
      goalAmount: amount,
      months: totalMonths,
      annualReturnPercent: assumedAnnualReturn,
    })

    const isAffordable = currentLeftover >= requiredMonthlySIP
    const coveragePercent = requiredMonthlySIP > 0
      ? Math.min((currentLeftover / requiredMonthlySIP) * 100, 100)
      : 100

    let realisticMonths = null
    if (!isAffordable && currentLeftover > 0) {
      realisticMonths = calculateMonthsToReachGoal({
        goalAmount: amount,
        monthlyInvestment: currentLeftover,
        annualReturnPercent: assumedAnnualReturn,
      })
    }

    setGoalPlan({
      goalName: name?.trim() || "your goal",
      goalAmount: amount,
      totalMonths,
      requiredMonthlySIP,
      currentLeftover,
      assumedAnnualReturn,
      isAffordable,
      coveragePercent,
      realisticMonths,
    })
  }

  const handleGoalSubmit = async (event) => {
    event.preventDefault()
    setGoalPlan(null)

    const parsedAmount = Number.parseFloat(goalAmount)
    const totalMonths = (Number(goalYears) || 0) * 12 + (Number(goalMonths) || 0)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid goal amount.")
      return
    }
    if (totalMonths <= 0) {
      setError("Enter a valid timeframe (at least 1 month).")
      return
    }

    setError("")
    await buildGoalPlan(totalMonths, parsedAmount, goalName)
  }

  const handleUseRealisticTimeline = () => {
    if (!goalPlan?.realisticMonths) return
    const months = goalPlan.realisticMonths
    setGoalYears(Math.floor(months / 12))
    setGoalMonths(months % 12)
    buildGoalPlan(months, goalPlan.goalAmount, goalPlan.goalName)
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
            Real, live-cached mutual fund data matched to your goal
          </p>
        </div>
      </div>

      <div className="flex gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800 w-fit">
        <button
          type="button"
          onClick={() => setMode(PLANNER_MODES.GOAL)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            mode === PLANNER_MODES.GOAL
              ? "bg-white text-indigo-600 shadow-sm dark:bg-gray-900 dark:text-indigo-400"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          <Sparkles size={14} />
          Plan a Goal
        </button>
        <button
          type="button"
          onClick={() => setMode(PLANNER_MODES.BROWSE)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            mode === PLANNER_MODES.BROWSE
              ? "bg-white text-indigo-600 shadow-sm dark:bg-gray-900 dark:text-indigo-400"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          Quick Browse
        </button>
      </div>

      {mode === PLANNER_MODES.GOAL ? (
        <Card padding="lg">
          <form onSubmit={handleGoalSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  What are you saving for? (optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. New laptop, Bike, Emergency fund"
                  value={goalName}
                  onChange={(event) => setGoalName(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  How much do you need?
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 80000"
                  value={goalAmount}
                  onChange={(event) => setGoalAmount(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  In how long?
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      value={goalYears}
                      onChange={(event) => setGoalYears(event.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Years</p>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      max="11"
                      value={goalMonths}
                      onChange={(event) => setGoalMonths(event.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Months</p>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Calculating..." : "Calculate My Plan"}
            </Button>
          </form>
        </Card>
      ) : (
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
      )}

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

      {mode === PLANNER_MODES.GOAL && goalPlan && !isLoading && (
        <Card padding="lg" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              🎯 {formatCompactINR(goalPlan.goalAmount)} for {goalPlan.goalName} ·{" "}
              {formatMonthsAsYearsAndMonths(goalPlan.totalMonths)}
            </h3>
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                goalPlan.isAffordable
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              }`}
            >
              {goalPlan.isAffordable ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              {goalPlan.isAffordable ? "On track" : "Needs a plan"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Needed / month</p>
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {formatCompactINR(goalPlan.requiredMonthlySIP)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Your leftover</p>
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {formatCompactINR(goalPlan.currentLeftover)}
              </p>
            </div>
            <div className="col-span-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800 sm:col-span-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {goalPlan.isAffordable ? "Coverage" : "Realistic timeline"}
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {goalPlan.isAffordable
                  ? `${Math.round(goalPlan.coveragePercent)}%`
                  : goalPlan.realisticMonths
                    ? formatMonthsAsYearsAndMonths(goalPlan.realisticMonths)
                    : "—"}
              </p>
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full transition-all duration-500 ${
                goalPlan.isAffordable ? "bg-green-500" : "bg-amber-500"
              }`}
              style={{ width: `${goalPlan.coveragePercent}%` }}
            />
          </div>

          {!goalPlan.isAffordable && goalPlan.realisticMonths && (
            <button
              type="button"
              onClick={handleUseRealisticTimeline}
              className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Use the {formatMonthsAsYearsAndMonths(goalPlan.realisticMonths)} timeline instead →
            </button>
          )}

          <WhatIfSlider
            goalAmount={goalPlan.goalAmount}
            assumedAnnualReturn={goalPlan.assumedAnnualReturn}
            requiredMonthlySIP={goalPlan.requiredMonthlySIP}
            currentLeftover={goalPlan.currentLeftover}
          />

          <button
            type="button"
            onClick={() => setShowAssumptions((prev) => !prev)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Info size={12} />
            What's this based on?
          </button>
          {showAssumptions && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Assumes ~{goalPlan.assumedAnnualReturn.toFixed(1)}% average annual growth, based on
              historical ranges for the fund categories shown below. Not a guaranteed return.
            </p>
          )}
        </Card>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.funds.map((fund) => (
                <Card key={fund.schemeCode} padding="lg" className="flex flex-col justify-between">
                  <div>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {CATEGORY_LABELS[fund.category] || fund.category}
                    </span>
                    <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">
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